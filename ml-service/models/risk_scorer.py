import numpy as np
from typing import List, Dict, Any

class ExplainableRiskScorer:
    def __init__(self):
        # Known elderly high-risk drugs based on AGS Beers Criteria 2023
        self.beers_medications = {
            "lorazepam", "diazepam", "zolpidem", "tramadol", "ibuprofen", "naproxen",
            "digoxin", "glipizide", "ciprofloxacin", "omeprazole", "fluoxetine"
        }

    def evaluate_allergies(self, medications: List[Dict[str, Any]], allergies: List[str]) -> List[Dict[str, Any]]:
        allergy_alerts = []
        if not allergies:
            return allergy_alerts

        norm_allergies = [a.lower().strip() for a in allergies if a]
        for med in medications:
            name = (med.get("generic_name") or med.get("name") or "").lower()
            active = (med.get("active_ingredient") or "").lower()
            drug_class = (med.get("drug_class") or "").lower()

            for allergen in norm_allergies:
                match = False
                reason = ""
                # Penicillin cross-reactivity
                if "penicillin" in allergen and ("amoxicillin" in name or "penicillin" in drug_class or "amox" in name):
                    match = True
                    reason = f"Cross-reactivity with reported Penicillin allergy. Amoxicillin is a beta-lactam aminopenicillin."
                # Aspirin / NSAID cross-reactivity
                elif "aspirin" in allergen and ("ibuprofen" in name or "naproxen" in name or "nsaid" in drug_class):
                    match = True
                    reason = f"NSAID hypersensitivity: Cross-reactivity between Aspirin allergy and other non-steroidal anti-inflammatory agents."
                # Sulfa cross-reactivity
                elif "sulfa" in allergen and ("glipizide" in name or "sulf" in name or "sulf" in active):
                    match = True
                    reason = f"Potential sulfonamide cross-hypersensitivity."
                # Direct name match
                elif allergen in name or allergen in active:
                    match = True
                    reason = f"Direct match to patient's reported allergen: '{allergen}'."

                if match:
                    allergy_alerts.append({
                        "medication": med.get("generic_name") or med.get("name"),
                        "allergen": allergen,
                        "severity": "Major",
                        "explanation": reason
                    })

        return allergy_alerts

    def calculate_risk(
        self,
        medications: List[Dict[str, Any]],
        interactions: List[Dict[str, Any]],
        duplicates: List[Dict[str, Any]],
        patient_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates an explainable risk score (0-100) and factors.
        """
        score = 0.0
        factors = []
        patient_age = patient_info.get("age", 50)
        allergies = patient_info.get("allergies", [])

        # 1. Polypharmacy count burden
        num_meds = len(medications)
        poly_points = 0.0
        if num_meds >= 10:
            poly_points = 25.0
            factors.append({
                "factor": "Severe Hyperpolypharmacy (>=10 medications)",
                "points": 25.0,
                "detail": f"Patient is prescribed {num_meds} medications simultaneously, drastically escalating cumulative pharmacokinetic and pharmacodynamic collision probabilities."
            })
        elif num_meds >= 5:
            poly_points = 15.0
            factors.append({
                "factor": "Polypharmacy (5-9 medications)",
                "points": 15.0,
                "detail": f"Patient is prescribed {num_meds} concurrent medications. Baseline WHO polypharmacy threshold reached."
            })
        elif num_meds >= 3:
            poly_points = 5.0
            factors.append({
                "factor": "Multi-Medication Regimen (3-4 medications)",
                "points": 5.0,
                "detail": f"Patient is taking {num_meds} medications."
            })
        else:
            factors.append({
                "factor": "Minimal Regimen (<3 medications)",
                "points": 0.0,
                "detail": f"Patient regimen contains {num_meds} active medications."
            })
        score += poly_points

        # 2. Drug-Drug Interactions burden
        major_ddi = [d for d in interactions if d.get("severity") == "Major"]
        mod_ddi = [d for d in interactions if d.get("severity") == "Moderate"]
        minor_ddi = [d for d in interactions if d.get("severity") == "Minor"]

        ddi_points = (len(major_ddi) * 22.0) + (len(mod_ddi) * 10.0) + (len(minor_ddi) * 3.0)
        if ddi_points > 0:
            score += ddi_points
            factors.append({
                "factor": "Drug-Drug Interaction Burden",
                "points": min(ddi_points, 55.0),
                "detail": f"Identified {len(major_ddi)} Major, {len(mod_ddi)} Moderate, and {len(minor_ddi)} Minor interactions across the regimen."
            })

        # 3. Duplicate Medication Warnings
        dup_points = 0.0
        for dup in duplicates:
            if dup.get("type") == "Active Ingredient Duplication":
                dup_points += 20.0
            else:
                dup_points += 12.0
        if dup_points > 0:
            score += dup_points
            factors.append({
                "factor": "Medication Duplication Burden",
                "points": min(dup_points, 35.0),
                "detail": f"Identified {len(duplicates)} duplication conflicts (active ingredients or therapeutic class overlapping)."
            })

        # 4. Allergy cross-reaction check
        allergy_alerts = self.evaluate_allergies(medications, allergies)
        if allergy_alerts:
            allergy_points = len(allergy_alerts) * 25.0
            score += allergy_points
            factors.append({
                "factor": "Documented Allergy Conflict",
                "points": allergy_points,
                "detail": f"Patient profile exhibits {len(allergy_alerts)} potential allergy or cross-reactivity conflicts with prescribed agents."
            })

        # 5. Geriatric AGS Beers Criteria Age Flag
        beers_detected = []
        if patient_age >= 65:
            for med in medications:
                name = (med.get("generic_name") or med.get("name") or "").lower()
                for bm in self.beers_medications:
                    if bm in name:
                        beers_detected.append(med.get("generic_name") or med.get("name"))
            if beers_detected:
                beers_points = min(len(beers_detected) * 8.0, 20.0)
                score += beers_points
                factors.append({
                    "factor": "Geriatric High-Risk Medications (AGS Beers Criteria)",
                    "points": beers_points,
                    "detail": f"Patient aged {patient_age} is taking {len(beers_detected)} medication(s) flagged as potentially inappropriate in older adults: {', '.join(set(beers_detected))}."
                })

        # 6. Data Quality Checks
        missing_dosages = [m for m in medications if not m.get("dosage") or not m.get("frequency")]
        if missing_dosages:
            score += 5.0
            factors.append({
                "factor": "Incomplete Medication Regimen Data",
                "points": 5.0,
                "detail": f"{len(missing_dosages)} medication(s) lack complete dosage or administration frequency specifications."
            })

        # Cap score at 100
        final_score = min(round(score, 1), 100.0)

        # Classification
        if final_score >= 50.0:
            risk_level = "High Risk"
            badge_color = "red"
            summary_statement = "High overall polypharmacy risk detected. Immediate clinical pharmacist or physician review recommended prior to dispensing or continuing regimen."
        elif final_score >= 25.0:
            risk_level = "Moderate Risk"
            badge_color = "amber"
            summary_statement = "Moderate medication-related risk detected. Clinical monitoring and medication reconciliation recommended."
        else:
            risk_level = "Low Risk"
            badge_color = "teal"
            summary_statement = "Low overall medication risk. Regimen appears manageable with standard outpatient surveillance."

        # Compute percentage contribution of each factor for explainability
        total_raw_points = sum(f["points"] for f in factors) or 1.0
        for f in factors:
            f["percentage"] = round((f["points"] / total_raw_points) * 100, 1)

        return {
            "score": final_score,
            "risk_level": risk_level,
            "badge_color": badge_color,
            "summary_statement": summary_statement,
            "factors": factors,
            "allergy_alerts": allergy_alerts,
            "beers_flagged_medications": list(set(beers_detected)) if patient_age >= 65 else []
        }
