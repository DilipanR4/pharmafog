class RiskScorer {
  static evaluateAllergies(medications, allergies = []) {
    const alerts = [];
    if (!allergies || !allergies.length) return alerts;

    const normAllergies = allergies.map(a => a.toLowerCase().trim()).filter(Boolean);

    for (const med of medications) {
      const name = (med.genericName || med.name || '').toLowerCase();
      const active = (med.activeIngredient || '').toLowerCase();
      const drugClass = (med.drugClass || '').toLowerCase();

      for (const allergen of normAllergies) {
        let match = false;
        let explanation = '';

        if (allergen.includes('penicillin') && (name.includes('amoxicillin') || drugClass.includes('penicillin') || name.includes('amox'))) {
          match = true;
          explanation = 'Cross-reactivity with reported Penicillin allergy. Amoxicillin is a beta-lactam aminopenicillin.';
        } else if (allergen.includes('aspirin') && (name.includes('ibuprofen') || name.includes('naproxen') || drugClass.includes('nsaid'))) {
          match = true;
          explanation = 'NSAID cross-hypersensitivity: Patient reported Aspirin allergy has potential severe cross-reactivity with other non-steroidal anti-inflammatory agents.';
        } else if (allergen.includes('sulfa') && (name.includes('glipizide') || name.includes('sulf') || active.includes('sulf'))) {
          match = true;
          explanation = 'Potential sulfonamide cross-reactivity with sulfonylurea.';
        } else if (name.includes(allergen) || active.includes(allergen)) {
          match = true;
          explanation = `Direct match to patient reported allergen: '${allergen}'.`;
        }

        if (match) {
          alerts.push({
            medication: med.genericName || med.name,
            allergen,
            severity: 'Major',
            explanation
          });
        }
      }
    }

    return alerts;
  }

  static calculateRisk(medications, interactions = [], duplicates = [], patientInfo = {}) {
    let score = 0;
    const factors = [];
    const age = patientInfo.age || 50;
    const allergies = patientInfo.allergies || [];

    // 1. Polypharmacy count burden
    const numMeds = medications.length;
    let polyPoints = 0;
    if (numMeds >= 10) {
      polyPoints = 25;
      factors.push({
        factor: 'Severe Hyperpolypharmacy (>=10 medications)',
        points: 25,
        detail: `Regimen includes ${numMeds} concurrent medications, markedly escalating adverse event probability.`
      });
    } else if (numMeds >= 5) {
      polyPoints = 15;
      factors.push({
        factor: 'Polypharmacy (5-9 medications)',
        points: 15,
        detail: `Regimen includes ${numMeds} concurrent medications (WHO Polypharmacy threshold).`
      });
    } else if (numMeds >= 3) {
      polyPoints = 5;
      factors.push({
        factor: 'Multi-Medication Regimen (3-4 medications)',
        points: 5,
        detail: `Patient is taking ${numMeds} concurrent medications.`
      });
    } else {
      factors.push({
        factor: 'Minimal Regimen (<3 medications)',
        points: 0,
        detail: `Patient is taking ${numMeds} active medication(s).`
      });
    }
    score += polyPoints;

    // 2. Interactions burden
    const majorCount = interactions.filter(d => d.severity === 'Major').length;
    const modCount = interactions.filter(d => d.severity === 'Moderate').length;
    const minorCount = interactions.filter(d => d.severity === 'Minor').length;

    const ddiPoints = (majorCount * 22) + (modCount * 10) + (minorCount * 3);
    if (ddiPoints > 0) {
      const cappedDdi = Math.min(ddiPoints, 55);
      score += cappedDdi;
      factors.push({
        factor: 'Drug-Drug Interaction Burden',
        points: cappedDdi,
        detail: `Found ${majorCount} Major, ${modCount} Moderate, and ${minorCount} Minor interaction alerts.`
      });
    }

    // 3. Duplication burden
    let dupPoints = 0;
    for (const dup of duplicates) {
      dupPoints += (dup.type === 'Active Ingredient Duplication' ? 20 : 12);
    }
    if (dupPoints > 0) {
      const cappedDup = Math.min(dupPoints, 35);
      score += cappedDup;
      factors.push({
        factor: 'Medication Duplication Burden',
        points: cappedDup,
        detail: `Detected ${duplicates.length} duplicate chemical ingredient or therapeutic class redundancies.`
      });
    }

    // 4. Allergy conflict
    const allergyAlerts = this.evaluateAllergies(medications, allergies);
    if (allergyAlerts.length > 0) {
      const allergyPoints = allergyAlerts.length * 25;
      score += allergyPoints;
      factors.push({
        factor: 'Documented Allergy Conflict',
        points: allergyPoints,
        detail: `Detected ${allergyAlerts.length} conflict(s) between active prescriptions and patient recorded allergies.`
      });
    }

    // 5. Beers Criteria (Age >= 65)
    const beersList = ['lorazepam', 'diazepam', 'zolpidem', 'tramadol', 'ibuprofen', 'naproxen', 'digoxin', 'glipizide', 'ciprofloxacin', 'omeprazole', 'fluoxetine'];
    const beersFlagged = [];
    if (age >= 65) {
      for (const med of medications) {
        const name = (med.genericName || med.name || '').toLowerCase();
        if (beersList.some(b => name.includes(b))) {
          beersFlagged.push(med.genericName || med.name);
        }
      }
      if (beersFlagged.length > 0) {
        const beersPoints = Math.min(beersFlagged.length * 8, 20);
        score += beersPoints;
        factors.push({
          factor: 'Geriatric High-Risk Medications (AGS Beers Criteria)',
          points: beersPoints,
          detail: `Patient aged ${age} is prescribed ${beersFlagged.length} agent(s) with elevated geriatric vulnerability: ${[...new Set(beersFlagged)].join(', ')}.`
        });
      }
    }

    // 6. Data quality check
    const incomplete = medications.filter(m => !m.dosage || !m.frequency);
    if (incomplete.length > 0) {
      score += 5;
      factors.push({
        factor: 'Incomplete Prescription Metadata',
        points: 5,
        detail: `${incomplete.length} medication(s) lack complete dosage or administration schedule.`
      });
    }

    const finalScore = Math.min(Math.round(score), 100);

    let riskLevel = 'Low Risk';
    let badgeColor = 'teal';
    let summaryStatement = 'Low overall polypharmacy risk. Routine outpatient monitoring recommended.';

    if (finalScore >= 50) {
      riskLevel = 'High Risk';
      badgeColor = 'red';
      summaryStatement = 'High overall polypharmacy risk. Immediate clinical review recommended before administration.';
    } else if (finalScore >= 25) {
      riskLevel = 'Moderate Risk';
      badgeColor = 'amber';
      summaryStatement = 'Moderate medication risk detected. Clinical surveillance and medication reconciliation advised.';
    }

    const totalRawPoints = factors.reduce((sum, f) => sum + f.points, 0) || 1;
    for (const f of factors) {
      f.percentage = Math.round((f.points / totalRawPoints) * 1000) / 10;
    }

    return {
      score: finalScore,
      riskLevel,
      badgeColor,
      summaryStatement,
      factors,
      allergyAlerts,
      beersFlaggedMedications: age >= 65 ? [...new Set(beersFlagged)] : []
    };
  }
}

module.exports = RiskScorer;
