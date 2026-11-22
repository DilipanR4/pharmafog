# PHARMAFOG – AI-Powered Polypharmacy Detection & Medication Safety Platform

**PharmaFog** is an intelligent clinical decision-support platform designed to protect patients taking multiple medications. It analyzes prescription lists, identifies drug-drug interactions, detects duplicate chemical ingredients and therapeutic categories, computes an explainable multi-factor risk score, and generates audit-grade clinical safety reports.

---

## 🌟 Key Features

1. **Polypharmacy Detection Engine**:
   - Pairwise drug-drug interaction detection with severity classification (Major, Moderate, Minor).
   - Mechanism explanation, clinical consequence, management guidance, and reference citations.
   - Verified reference versus demo data status labeling.
2. **Duplicate Medication & Therapeutic Class Detection**:
   - Repeated active ingredients across different brand names (e.g. Paracetamol in Tylenol vs Calpol).
   - Class-based duplication warnings (e.g. concurrent NSAIDs, dual sedatives).
3. **Explainable Risk Scoring System**:
   - Transparent scoring (0 to 100) and risk tier classification: **High Risk**, **Moderate Risk**, **Low Risk**.
   - Factor decomposition: polypharmacy burden, DDI points, duplication points, allergy cross-reactivity, and AGS Beers Criteria geriatric flags.
4. **Interactive Clinician Review Checklist**:
   - Actionable checklist with priority tags and real-time database persistence.
5. **Grounded AI Clinical Insights**:
   - Plain-language patient counseling takeaways.
   - Interactive Q&A chat strictly grounded in the patient's verified regimen data without hallucinating unverified claims.
6. **Multi-Role Authentication & Access Control**:
   - Roles: **Doctor**, **Pharmacist**, and **Admin**.
   - Demo credentials banner with 1-click auto-fill on login.
7. **Hospital-Grade PDF Report Generation**:
   - Instant client-side and server-side PDF exports with hospital layout and safety disclaimers.
8. **Clinical Alert Center & Audit Trail**:
   - High-priority notifications for critical interactions.
   - Immutable audit logging of all clinical actions.

---

## 🏗 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Recharts, Lucide React, Axios, jsPDF, jspdf-autotable.
- **Backend**: Node.js, Express.js, JWT, bcryptjs, Mongoose, Helmet, Morgan, PDFKit.
- **Database**: MongoDB (Local port 27017).
- **ML Service**: Python, FastAPI, NetworkX, Scikit-learn, Pandas, NumPy, Uvicorn.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally on `127.0.0.1:27017`)

---

### Step 1: Database Seeding
From the `backend` directory, run:
```bash
cd backend
npm install
npm run seed
```
This populates MongoDB with demo clinicians, 30 reference medications, 28 verified drug interaction monographs, 4 demo patients, baseline assessments, and clinical notifications.

---

### Step 2: Start the Python ML Service
From the `ml-service` directory:
```bash
cd ml-service
python main.py
```
Runs the FastAPI service on `http://127.0.0.1:8000`.

---

### Step 3: Start the Backend REST API
From the `backend` directory:
```bash
cd backend
npm start
```
Runs the Express API on `http://127.0.0.1:5000`.

---

### Step 4: Start the Frontend UI
From the `frontend` directory:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 👥 Demo Accounts (1-Click Auto-Fill on Login Page)

| Role | Email | Password | Primary Specialty |
|---|---|---|---|
| **Doctor** | `doctor@pharmafog.health` | `Doctor@123` | Cardiology & Internal Medicine |
| **Pharmacist** | `pharmacist@pharmafog.health` | `Pharmacist@123` | Clinical Pharmacology |
| **Admin** | `admin@pharmafog.health` | `Admin@123` | Health Informatics / IT |

---

## 🧪 Walkthrough Demo Workflow

1. Navigate to `http://localhost:5173` and click **"Explore Demo"** or **"Sign In"**.
2. Click the **"Doctor"** quick-fill button (`doctor@pharmafog.health` / `Doctor@123`) and sign in.
3. On the **Main Dashboard**, view live metrics: Total Patients, Patients Under Review, Analyzed Medications, Risk Distribution Donut Chart, and Interaction Severity Breakdown.
4. Go to **"Patients"** and select **"Eleanor Vance"** (PF-1001, 74y with Atrial Fibrillation and Osteoarthritis).
5. Review her 5 active medications: *Warfarin, Aspirin, Lisinopril, Spironolactone, Ibuprofen*.
6. Click **"Analyze Regimen"**.
7. The system evaluates the combinations in real time:
   - **Risk Classification**: **High Risk (Score: 85/100)**.
   - **Detected Interactions**:
     - *Warfarin + Aspirin + Ibuprofen* (Major: Severe gastrointestinal hemorrhage hazard).
     - *Lisinopril + Spironolactone* (Major: Life-threatening hyperkalemia).
   - **Explainable Factors**: Transparent breakdown displaying point contributions.
   - **Interactive Checklist**: Review and check off "Discontinue oral Ibuprofen" and "Order urgent INR and Potassium".
8. Click **"Download Official PDF Report"** to export an audit-ready PDF.
9. Navigate to **"AI Regimen Insights"** to inspect patient counseling takeaways and ask questions in the grounded clinical chat!

---

## ⚖️ Important Clinical Notice
PharmaFog is a **clinical decision-support prototype**, NOT an autonomous diagnostic or prescribing system. Never initiate, discontinue, or alter drug therapy without direct review by a licensed healthcare professional.
