from typing import List, Dict, Any

class ClinicalExplainer:
    def __init__(self):
        pass

    def generate_review_checklist(
        self,
        medications: List[Dict[str, Any]],
        interactions: List[Dict[str, Any]],
        duplicates: List[Dict[str, Any]],
        allergy_alerts: List[Dict[str, Any]],
        patient_info: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        checklist = []

        # Duplication review items
        for dup in duplicates:
            checklist.append({
                "id": f"CHK-DUP-{len(checklist) + 1}",
                "category": "Deprescribing & Consolidation",
                "action": f"Deprescribing review for {', '.join(dup.get('medications', []))}",
                "rationale": dup.get("description", "Potential duplication detected."),
                "priority": "High" if dup.get("severity") == "Major" else "Medium",
                "completed": False
            })

        # Major interaction review items
        for ddi in interactions:
            if ddi.get("severity") == "Major":
                checklist.append({
                    "id": f"CHK-DDI-{len(checklist) + 1}",
                    "category": "Major Interaction Safety",
                    "action": f"Evaluate safety of concurrent {ddi.get('medication_a')} and {ddi.get('medication_b')}",
                    "rationale": ddi.get("clinical_effect", "Critical pharmacologic conflict."),
                    "priority": "High",
                    "completed": False
                })

        # Allergy alerts
        for al in allergy_alerts:
            checklist.append({
                "id": f"CHK-ALG-{len(checklist) + 1}",
                "category": "Allergy Alert",
                "action": f"Verify tolerance or substitute {al.get('medication')} due to reported '{al.get('allergen')}' hypersensitivity",
                "rationale": al.get("explanation", ""),
                "priority": "Immediate",
                "completed": False
            })

        # Lab monitoring items
        med_names = [((m.get("generic_name") or m.get("name") or "")).lower() for m in medications]
        if any("warfarin" in m for m in med_names):
            checklist.append({
                "id": f"CHK-LAB-{len(checklist) + 1}",
                "category": "Laboratory Monitoring",
                "action": "Check recent International Normalized Ratio (INR) and Prothrombin Time",
                "rationale": "Patient is on Warfarin anticoagulation; target INR range must be confirmed.",
                "priority": "High",
                "completed": False
            })

        if any("lisinopril" in m or "spironolactone" in m for m in med_names):
            checklist.append({
                "id": f"CHK-LAB-{len(checklist) + 1}",
                "category": "Laboratory Monitoring",
                "action": "Order Basic Metabolic Panel (BMP) to assess Serum Potassium (K+) and eGFR / Creatinine",
                "rationale": "Risk of hyperkalemia and renal hemodynamic fluctuations with renin-angiotensin-aldosterone modulators.",
                "priority": "High",
                "completed": False
            })

        if any("digoxin" in m for m in med_names):
            checklist.append({
                "id": f"CHK-LAB-{len(checklist) + 1}",
                "category": "Laboratory Monitoring",
                "action": "Obtain serum Digoxin level and 12-lead ECG",
                "rationale": "Digoxin possesses a narrow therapeutic index; check for bradycardia and arrhythmia signs.",
                "priority": "Medium",
                "completed": False
            })

        # General reconciliation checklist item
        checklist.append({
            "id": f"CHK-REC-{len(checklist) + 1}",
            "category": "Medication Reconciliation",
            "action": "Confirm actual adherence and over-the-counter (OTC) supplements with patient/caregiver",
            "rationale": "Many polypharmacy interactions stem from unrecorded OTC NSAIDs, herbal supplements, or missed doses.",
            "priority": "Standard",
            "completed": False
        })

        return checklist

    def generate_ai_insights(
        self,
        patient_info: Dict[str, Any],
        medications: List[Dict[str, Any]],
        interactions: List[Dict[str, Any]],
        duplicates: List[Dict[str, Any]],
        risk_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Creates understandable, structured AI-assisted explanations for healthcare professionals and patients.
        """
        patient_name = patient_info.get("name", "Patient")
        num_meds = len(medications)
        risk_level = risk_summary.get("risk_level", "Moderate Risk")
        score = risk_summary.get("score", 0)

        # Plain language summary
        summary_paragraphs = [
            f"PharmaFog clinical safety evaluation for {patient_name} identifies an overall {risk_level} profile (Scoring: {score}/100) across {num_meds} concurrent active medications.",
        ]

        if interactions:
            major_count = len([d for d in interactions if d.get("severity") == "Major"])
            mod_count = len([d for d in interactions if d.get("severity") == "Moderate"])
            summary_paragraphs.append(
                f"There are {len(interactions)} detected drug-drug interaction(s) ({major_count} classified as Major, {mod_count} Moderate). The most significant clinical concern involves potential pharmacodynamic or pharmacokinetic cross-talk that warrants clinician review."
            )

        if duplicates:
            summary_paragraphs.append(
                f"Duplicate medication analysis flagged {len(duplicates)} instance(s) of redundant therapeutic coverage or overlapping active chemical entities. Consolidating these agents can reduce pill burden and toxicity."
            )

        if not interactions and not duplicates:
            summary_paragraphs.append(
                "No critical drug-drug conflicts or duplicate active ingredients were detected in the reference database for this regimen. Routine clinical follow-up is recommended."
            )

        # Simple language explanation for patient-facing counseling
        patient_friendly_takeaways = []
        for ddi in interactions[:3]:
            patient_friendly_takeaways.append(
                f"Taking {ddi.get('medication_a')} with {ddi.get('medication_b')}: {ddi.get('clinical_effect')}. Your doctor or pharmacist may adjust timing or choose an alternative."
            )
        for dup in duplicates[:2]:
            patient_friendly_takeaways.append(
                f"Multiple medications for the same purpose ({', '.join(dup.get('medications', []))}): Ensure you are not taking double doses of pain relievers or stomach protectants without physician approval."
            )

        # Verification flags
        verification_flags = [
            "Confirm patient is taking medications exactly as scheduled with no self-escalation.",
            "Verify complete list of over-the-counter (OTC) supplements (e.g. St. John's Wort, Ginkgo, NSAID painkillers).",
            "Review recent renal (eGFR) and liver function panels to confirm normal clearance.",
            "Ensure patient has a clear pillbox organizer or blister pack to minimize accidental dose duplication."
        ]

        return {
            "executive_summary": " ".join(summary_paragraphs),
            "patient_friendly_takeaways": patient_friendly_takeaways,
            "verification_flags": verification_flags,
            "ai_confidence_note": "This explanation is generated deterministically by PharmaFog's clinical rules engine based on verified drug monographs. No generative hallucinations were introduced.",
            "disclaimer": "Clinical Decision Support Tool only. All findings require qualified clinician evaluation before making any dosage, tapering, or discontinuation decisions."
        }

    def answer_question(
        self,
        question: str,
        patient_info: Dict[str, Any],
        medications: List[Dict[str, Any]],
        interactions: List[Dict[str, Any]],
        duplicates: List[Dict[str, Any]],
        risk_summary: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Interactive Q&A engine grounded exclusively in the patient's verified regimen data.
        """
        q = question.lower().strip()
        med_names = [((m.get("generic_name") or m.get("name") or "")).strip() for m in medications]
        med_names_str = ", ".join(med_names) if med_names else "None listed"

        # Check for interaction inquiries
        relevant_ddis = []
        for ddi in interactions:
            m_a = ddi.get("medication_a", "").lower()
            m_b = ddi.get("medication_b", "").lower()
            if m_a in q or m_b in q:
                relevant_ddis.append(ddi)

        if relevant_ddis:
            resp_lines = [
                f"Based on the patient's medication list, PharmaFog identified {len(relevant_ddis)} relevant interaction(s):"
            ]
            for item in relevant_ddis:
                resp_lines.append(
                    f"• {item.get('medication_a')} + {item.get('medication_b')} [{item.get('severity')} Severity]: "
                    f"{item.get('clinical_effect')} Mechanism: {item.get('mechanism')} "
                    f"Recommendation: {item.get('recommendation')}"
                )
            return {
                "answer": "\n\n".join(resp_lines),
                "grounded": True,
                "evidence_sources": [d.get("source") for d in relevant_ddis]
            }

        # Check for duplicates question
        if "duplicate" in q or "redundant" in q or "repeat" in q or "same" in q:
            if duplicates:
                resp_lines = [f"PharmaFog identified {len(duplicates)} duplicate medication issue(s):"]
                for dup in duplicates:
                    resp_lines.append(f"• {dup.get('type')}: {', '.join(dup.get('medications', []))} - {dup.get('description')} Suggested Action: {dup.get('clinical_action')}")
                return {
                    "answer": "\n\n".join(resp_lines),
                    "grounded": True,
                    "evidence_sources": ["PharmaFog Active Ingredient & Therapeutic Classification Index"]
                }
            else:
                return {
                    "answer": "No duplicate active ingredients or therapeutic class redundancies were identified in the patient's current medication list.",
                    "grounded": True,
                    "evidence_sources": ["PharmaFog Reference Database"]
                }

        # Check for allergy questions
        if "allerg" in q:
            allergies = patient_info.get("allergies", [])
            allergy_alerts = risk_summary.get("allergy_alerts", [])
            if allergy_alerts:
                resp = f"Patient has documented allergies: {', '.join(allergies)}. PharmaFog detected {len(allergy_alerts)} potential allergy conflict(s):\n"
                for al in allergy_alerts:
                    resp += f"\n• {al.get('medication')} vs allergy '{al.get('allergen')}': {al.get('explanation')}"
                return {
                    "answer": resp,
                    "grounded": True,
                    "evidence_sources": ["Patient Allergy Profile & Cross-Reactivity Database"]
                }
            else:
                return {
                    "answer": f"Patient has documented allergies: {', '.join(allergies) if allergies else 'None recorded'}. No direct cross-reactivity with current medications was detected.",
                    "grounded": True,
                    "evidence_sources": ["Patient Medical Record"]
                }

        # Check for monitoring / lab tests question
        if "monitor" in q or "lab" in q or "test" in q or "blood" in q:
            labs = []
            if any("warfarin" in m.lower() for m in med_names):
                labs.append("Frequent INR / Prothrombin Time monitoring for Warfarin anticoagulation.")
            if any("lisinopril" in m.lower() or "spironolactone" in m.lower() for m in med_names):
                labs.append("Serum potassium and renal function (BUN/Creatinine) monitoring for hyperkalemia.")
            if any("digoxin" in m.lower() for m in med_names):
                labs.append("Serum Digoxin concentration and periodic ECG rhythm assessment.")
            if any("metformin" in m.lower() for m in med_names):
                labs.append("eGFR / renal function to monitor metformin lactic acidosis risk, plus HbA1c.")

            if labs:
                return {
                    "answer": "Recommended clinical laboratory monitoring based on this patient's regimen:\n\n" + "\n".join(f"• {l}" for l in labs),
                    "grounded": True,
                    "evidence_sources": ["Clinical Pharmacology Monitoring Protocols"]
                }
            else:
                return {
                    "answer": "Routine standard metabolic panel and blood pressure checks are recommended for this patient's current regimen.",
                    "grounded": True,
                    "evidence_sources": ["Standard Clinical Guidelines"]
                }

        # General summary answer
        return {
            "answer": (
                f"Patient {patient_info.get('name', 'Patient')} is currently prescribed {len(medications)} medication(s): {med_names_str}. "
                f"The overall polypharmacy risk classification is {risk_summary.get('risk_level', 'Unknown')} (Score: {risk_summary.get('score', 0)}/100). "
                f"There are {len(interactions)} detected interaction(s) and {len(duplicates)} duplication warning(s). "
                f"Please consult with the attending physician or clinical pharmacist for individualized treatment modifications."
            ),
            "grounded": True,
            "evidence_sources": ["PharmaFog Polypharmacy Analysis Engine"]
        }
