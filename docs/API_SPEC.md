# PharmaFog REST API Specification

Base URL: `http://localhost:5000/api`

## Authentication (`/api/auth`)
- `POST /auth/register`: Create clinician account. Returns JWT and user payload.
- `POST /auth/login`: Authenticate clinician. Returns JWT.
- `GET /auth/me`: Get current authenticated profile. (Requires Bearer token).
- `PUT /auth/profile`: Update clinician name, department, license number.
- `PUT /auth/password`: Change account password.

## Patients (`/api/patients`)
- `GET /patients`: List patients with query parameters (`search`, `riskStatus`, `page`, `limit`).
- `GET /patients/:id`: Fetch single patient profile with active medications and latest assessment.
- `POST /patients`: Register new patient record (`fullName`, `age`, `sex`, `weight`, `allergies`, `conditions`, `clinicalNotes`).
- `PUT /patients/:id`: Update patient demographics and clinical history.
- `DELETE /patients/:id`: Delete patient record with cascade removal of prescriptions and reports.

## Medications (`/api/medications`)
- `GET /medications/patient/:patientId`: List medications for a patient.
- `POST /medications/patient/:patientId`: Add prescription to patient regimen (`genericName`, `dosage`, `frequency`, `route`, `activeIngredient`, `drugClass`).
- `PUT /medications/:id`: Update medication details or toggle status (`Active` / `Discontinued`).
- `DELETE /medications/:id`: Remove medication from regimen.
- `GET /medications/search?q=`: Autocomplete query against medication reference monographs.

## Assessments & Evaluation (`/api/assessments`)
- `GET /assessments/dashboard/stats`: Aggregates cohort risk distribution, active interaction alerts, high-risk cases, and recent activity.
- `POST /assessments/patient/:patientId`: Executes polypharmacy analysis on active medications. Saves assessment snapshot, risk score, and clinician checklist.
- `GET /assessments/patient/:patientId`: History of assessments for a patient.
- `GET /assessments/:id`: Full details of an assessment.
- `GET /assessments/:id/pdf`: Stream printable PDF report.
- `PATCH /assessments/:assessmentId/checklist/:itemId`: Toggle completed state of clinician review action.

## Reference & Direct Checker (`/api/reference`)
- `GET /reference/medications`: List reference drug monographs.
- `POST /reference/medications`: Admin add new drug monograph.
- `GET /reference/interactions`: List interaction rules with mechanisms and sources.
- `POST /reference/interactions`: Admin add new drug interaction rule.
- `POST /reference/check`: Ad-hoc multi-drug interaction and duplication evaluation.

## AI Assistant (`/api/ai`)
- `POST /ai/patient/:patientId/ask`: Interactive conversational inquiry on patient regimen.

## Notifications (`/api/notifications`)
- `GET /notifications`: List clinician safety alerts.
- `PATCH /notifications/:id/read`: Mark alert as read.
- `PATCH /notifications/read-all`: Mark all alerts as read.

## Admin (`/api/admin`)
- `GET /admin/users`: List all system users.
- `PATCH /admin/users/:id/toggle`: Activate / deactivate user account.
- `PATCH /admin/users/:id/role`: Change role (Doctor, Pharmacist, Admin).
- `GET /admin/audit-logs`: View platform audit log trail.
- `GET /admin/status`: Telemetry on MongoDB, ML engine, Node memory, and database counts.
