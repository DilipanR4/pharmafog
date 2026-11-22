const DrugInteraction = require('../models/DrugInteraction');

class InteractionEngine {
  static normalizeToken(str) {
    if (!str) return '';
    return str.toLowerCase().trim().split(' ')[0];
  }

  static async detectInteractions(medications) {
    const detected = [];
    const seen = new Set();
    const allRules = await DrugInteraction.find({});

    const n = medications.length;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const med1 = medications[i];
        const med2 = medications[j];

        const name1 = (med1.genericName || med1.name || '').toLowerCase();
        const brand1 = (med1.brandName || '').toLowerCase();
        const act1 = (med1.activeIngredient || '').toLowerCase();

        const name2 = (med2.genericName || med2.name || '').toLowerCase();
        const brand2 = (med2.brandName || '').toLowerCase();
        const act2 = (med2.activeIngredient || '').toLowerCase();

        const tokens1 = [name1, brand1, act1, this.normalizeToken(name1)].filter(Boolean);
        const tokens2 = [name2, brand2, act2, this.normalizeToken(name2)].filter(Boolean);

        for (const rule of allRules) {
          const ruleA = rule.medicationA.toLowerCase();
          const ruleB = rule.medicationB.toLowerCase();

          const matchForward =
            tokens1.some(t => t.includes(ruleA) || ruleA.includes(t)) &&
            tokens2.some(t => t.includes(ruleB) || ruleB.includes(t));

          const matchReverse =
            tokens2.some(t => t.includes(ruleA) || ruleA.includes(t)) &&
            tokens1.some(t => t.includes(ruleB) || ruleB.includes(t));

          if (matchForward || matchReverse) {
            const pairKey = [med1.genericName || med1.name, med2.genericName || med2.name].sort().join(':::');
            if (!seen.has(pairKey)) {
              seen.add(pairKey);
              detected.push({
                id: `DDI-${detected.length + 1}`,
                medicationA: med1.genericName || med1.name,
                medicationB: med2.genericName || med2.name,
                severity: rule.severity,
                mechanism: rule.mechanism,
                clinicalEffect: rule.clinicalEffect,
                recommendation: rule.recommendation,
                source: rule.source,
                referenceStatus: rule.referenceStatus,
                category: rule.category
              });
            }
          }
        }
      }
    }

    return detected;
  }

  static detectDuplicates(medications) {
    const duplicates = [];
    const n = medications.length;

    const therapeuticClasses = {
      NSAID: ['ibuprofen', 'naproxen', 'meloxicam', 'celecoxib', 'diclofenac', 'aspirin', 'indomethacin'],
      'Proton Pump Inhibitor': ['omeprazole', 'pantoprazole', 'esomeprazole', 'lansoprazole'],
      'Sedative / Hypnotic': ['lorazepam', 'diazepam', 'clonazepam', 'alprazolam', 'zolpidem'],
      'ACE Inhibitor / ARB': ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan'],
      Anticoagulant: ['warfarin', 'apixaban', 'rivaroxaban', 'dabigatran', 'heparin']
    };

    const synonyms = {
      acetaminophen: 'paracetamol',
      paracetamol: 'paracetamol',
      tylenol: 'paracetamol',
      panadol: 'paracetamol'
    };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const med1 = medications[i];
        const med2 = medications[j];

        const name1 = (med1.genericName || med1.name || '').trim().toLowerCase();
        const name2 = (med2.genericName || med2.name || '').trim().toLowerCase();
        const act1 = (med1.activeIngredient || '').trim().toLowerCase();
        const act2 = (med2.activeIngredient || '').trim().toLowerCase();

        const norm1 = synonyms[act1] || synonyms[name1] || act1 || name1;
        const norm2 = synonyms[act2] || synonyms[name2] || act2 || name2;

        if (norm1 && norm2 && norm1 === norm2) {
          duplicates.push({
            type: 'Active Ingredient Duplication',
            severity: 'Major',
            medications: [med1.genericName || med1.name, med2.genericName || med2.name],
            activeIngredient: norm1,
            description: `Multiple active formulations containing '${norm1}'. Patient is at risk of unintended cumulative toxicity or overdose.`,
            clinicalAction: 'Review cumulative dosing and discontinue redundant agent.'
          });
          continue;
        }

        for (const [className, drugList] of Object.entries(therapeuticClasses)) {
          const match1 = drugList.some(d => name1.includes(d) || act1.includes(d));
          const match2 = drugList.some(d => name2.includes(d) || act2.includes(d));
          if (match1 && match2) {
            duplicates.push({
              type: 'Therapeutic Class Duplication',
              severity: 'Moderate',
              medications: [med1.genericName || med1.name, med2.genericName || med2.name],
              therapeuticCategory: className,
              description: `Concurrent prescribing of multiple agents in the ${className} class. Elevates adverse event incidence without additional clinical efficacy.`,
              clinicalAction: `Consolidate to a single optimized ${className} agent.`
            });
          }
        }
      }
    }

    return duplicates;
  }
}

module.exports = InteractionEngine;
