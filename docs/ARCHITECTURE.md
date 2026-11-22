# PharmaFog Architecture & Clinical Decision Support Design

## 1. Executive Overview
**PharmaFog** is an AI-powered polypharmacy detection and medication safety platform built for healthcare professionals (physicians, clinical pharmacists, nurses, health system administrators). It proactively mitigates adverse drug events (ADEs), drug collisions, duplicate prescribing, and geriatric contraindications in complex multi-medication patient regimens.

> **Clinical Decision Support Notice**: PharmaFog is a decision-support prototype, not an autonomous diagnostic, prescribing, or treatment system. All findings require qualified clinician evaluation.

---

## 2. High-Level System Architecture

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|             React 19 + Vite + Tailwind CSS + Lucide + Recharts        |
|   (Landing, Dashboard, Patients, Drug Checker, AI Insights, Reports)  |
+-----------------------------------------------------------------------+
                                   |
                             REST / JSON (JWT)
                                   v
+-----------------------------------------------------------------------+
|                         BACKEND SERVICE LAYER                         |
|                    Node.js + Express.js REST API                      |
|      Authentication (bcrypt + JWT), Controllers, Audit Logger         |
|      Embedded Fallback Clinical Engine, PDFKit Generator              |
+-----------------------------------------------------------------------+
              |                                            |
      Mongoose ODM (Port 27017)                      HTTP REST (Port 8000)
              v                                            v
+-----------------------------+          +------------------------------+
|       MONGODB DATABASE      |          |     PYTHON ML MICROSERVICE   |
|  - Users                    |          |  - FastAPI + Uvicorn         |
|  - Patients                 |          |  - NetworkX Graph Engine     |
|  - Medications              |          |  - Duplication Engine        |
|  - MedicationReferences     |          |  - Explainable Risk Scorer   |
|  - DrugInteractions         |          |  - Grounded Clinical QA      |
|  - Assessments              |          +------------------------------+
|  - Notifications            |
|  - AuditLogs                |
+-----------------------------+
```

---

## 3. Core Polypharmacy Detection Engines

### A. Graph-Based Drug-Drug Interaction (DDI) Detection
- **Technology**: NetworkX Graph Engine + Pairwise Combinatorial Evaluator.
- **Mechanism**: Every pair in the regimen $M = \{m_1, m_2, \dots, m_n\}$ ($\binom{n}{2}$ pairs) is evaluated against verified pharmacological interaction monographs.
- **Properties Analyzed**:
  - Pharmacodynamic synergism (e.g. Warfarin + Aspirin + Ibuprofen causing profound platelet and coagulant suppression)
  - Pharmacokinetic clearance inhibition (e.g. Omeprazole inhibiting CYP2C19 activation of Clopidogrel; Fluoxetine inhibiting CYP2D6 clearance of Metoprolol)
  - Transporter interactions (e.g. Ciprofloxacin P-gp inhibition elevating Digoxin)
  - Electrolyte shifts (e.g. Lisinopril + Spironolactone + Potassium Chloride causing lethal hyperkalemia).
- **Severity Classification**: Major, Moderate, Minor.

### B. Chemical & Therapeutic Duplication Detection
- **Active Ingredient Duplication**: Matches chemical active ingredients across brand names and synonyms (e.g. Tylenol, Paracetamol, Acetaminophen, Panadol) to prevent accidental cumulative overdose.
- **Therapeutic Category Duplication**: Flags multiple prescriptions within high-risk therapeutic classes (e.g., dual NSAIDs, dual Benzodiazepines, dual PPIs).

### C. Explainable Risk Scoring Engine
The overall risk score (0 to 100) is deterministically computed and fully decomposed for clinicians:
- **Polypharmacy Count**: 5-9 meds (+15 pts), $\ge$10 meds (+25 pts).
- **Major Interactions**: +22 pts each (capped at 55 pts).
- **Moderate Interactions**: +10 pts each.
- **Minor Interactions**: +3 pts each.
- **Ingredient Duplication**: +20 pts each.
- **Therapeutic Duplication**: +12 pts each.
- **Cross-Hypersensitivity / Documented Allergy**: +25 pts each.
- **AGS Beers Criteria (Age $\ge$ 65)**: +8 pts per high-risk geriatric agent.
- **Incomplete Prescriptions**: +5 pts.

**Risk Classification**:
- **High Risk**: Score $\ge$ 50 (Soft Red / Danger)
- **Moderate Risk**: Score 25 - 49 (Amber / Warning)
- **Low Risk**: Score 0 - 24 (Teal / Green)

### D. Grounded AI Insights & Interactive Q&A
- Deterministically bounded to the patient's actual regimen and reference knowledge base.
- Generates plain language counseling takeaways for patients.
- Generates clinician verification checklists.
- Never hallucinates interactions or gives autonomous dosage alterations.

---

## 4. Security & Privacy
- **Password Security**: Salted bcrypt password hashing (10 rounds).
- **Authorization**: Role-Based Access Control (Admin, Doctor, Pharmacist).
- **Transport Security**: Helmet headers, CORS policies, rate limiting.
- **Auditability**: Complete immutable audit log capturing every patient creation, medication update, analysis run, and report download.
