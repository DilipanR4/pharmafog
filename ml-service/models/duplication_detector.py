from typing import List, Dict, Any

class DuplicationDetector:
    def __init__(self):
        # Known therapeutic classes prone to harmful duplication
        self.therapeutic_classes = {
            "NSAID": ["ibuprofen", "naproxen", "meloxicam", "celecoxib", "diclofenac", "aspirin", "indomethacin"],
            "Proton Pump Inhibitor": ["omeprazole", "pantoprazole", "esomeprazole", "lansoprazole", "rabeprazole"],
            "Sedative / Hypnotic": ["lorazepam", "diazepam", "clonazepam", "alprazolam", "zolpidem", "eszopiclone"],
            "ACE Inhibitor / ARB": ["lisinopril", "enalapril", "ramipril", "losartan", "valsartan", "candesartan"],
            "Anticoagulant": ["warfarin", "apixaban", "rivaroxaban", "dabigatran", "heparin"],
            "SSRI / Serotonergic Antidepressant": ["sertraline", "fluoxetine", "citalopram", "escitalopram", "paroxetine", "venlafaxine"],
            "Sulfonylurea": ["glipizide", "glyburide", "glimepiride"]
        }

    def detect_duplicates(self, medications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        duplicates: List[Dict[str, Any]] = []
        n = len(medications)

        # 1. Exact Active Ingredient or Name Match
        for i in range(n):
            for j in range(i + 1, n):
                med1 = medications[i]
                med2 = medications[j]

                name1 = (med1.get("generic_name") or med1.get("name") or "").strip().lower()
                name2 = (med2.get("generic_name") or med2.get("name") or "").strip().lower()

                brand1 = (med1.get("brand_name") or "").strip().lower()
                brand2 = (med2.get("brand_name") or "").strip().lower()

                act1 = (med1.get("active_ingredient") or "").strip().lower()
                act2 = (med2.get("active_ingredient") or "").strip().lower()

                # Paracetamol / Acetaminophen alias check
                synonyms = {
                    "acetaminophen": "paracetamol",
                    "paracetamol": "paracetamol",
                    "tylenol": "paracetamol",
                    "panadol": "paracetamol",
                    "aspirin": "acetylsalicylic acid",
                    "acetylsalicylic acid": "acetylsalicylic acid"
                }
                norm_act1 = synonyms.get(act1, synonyms.get(name1, act1))
                norm_act2 = synonyms.get(act2, synonyms.get(name2, act2))

                is_exact_active = (norm_act1 and norm_act2 and norm_act1 == norm_act2)
                is_exact_name = (name1 and name2 and name1 == name2)

                if is_exact_active or is_exact_name:
                    duplicates.append({
                        "type": "Active Ingredient Duplication",
                        "severity": "Major",
                        "medications": [med1.get("generic_name") or med1.get("name"), med2.get("generic_name") or med2.get("name")],
                        "active_ingredient": norm_act1 or name1,
                        "description": f"Multiple active formulations containing '{norm_act1 or name1}'. Patient may be at risk of accidental cumulative toxicity or overdose.",
                        "clinical_action": "Evaluate combined cumulative dose and discontinue redundant formulation."
                    })
                    continue

                # 2. Therapeutic Class Duplication
                for class_name, drug_list in self.therapeutic_classes.items():
                    m1_matches = any(d in name1 or d in act1 or (brand1 and d in brand1) for d in drug_list)
                    m2_matches = any(d in name2 or d in act2 or (brand2 and d in brand2) for d in drug_list)

                    if m1_matches and m2_matches:
                        # Avoid double-reporting if already reported as exact active
                        duplicates.append({
                            "type": "Therapeutic Class Duplication",
                            "severity": "Moderate",
                            "medications": [med1.get("generic_name") or med1.get("name"), med2.get("generic_name") or med2.get("name")],
                            "therapeutic_category": class_name,
                            "description": f"Dual prescribing within '{class_name}'. Simultaneous administration increases adverse event risk without clear additive therapeutic benefit.",
                            "clinical_action": f"Review justification for multiple {class_name} agents. Consolidate to single optimized agent if appropriate."
                        })

        return duplicates
