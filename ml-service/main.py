import os
import json
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from models.interaction_graph import InteractionGraphEngine
from models.duplication_detector import DuplicationDetector
from models.risk_scorer import ExplainableRiskScorer
from models.clinical_explainer import ClinicalExplainer

app = FastAPI(
    title="PharmaFog ML & Clinical Decision Support Service",
    version="1.0.0",
    description="Intelligent Polypharmacy, Drug Interaction, Duplication, and Risk Scoring Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate core engines
interaction_engine = InteractionGraphEngine()
duplication_engine = DuplicationDetector()
risk_engine = ExplainableRiskScorer()
explainer_engine = ClinicalExplainer()

# Request Models
class PatientContext(BaseModel):
    id: Optional[str] = "DEMO-001"
    name: Optional[str] = "Demo Patient"
    age: Optional[int] = 55
    sex: Optional[str] = "Other"
    weight: Optional[float] = 70.0
    allergies: Optional[List[str]] = []
    conditions: Optional[List[str]] = []
    clinical_notes: Optional[str] = ""

class MedicationItem(BaseModel):
    id: Optional[str] = None
    generic_name: Optional[str] = ""
    name: Optional[str] = ""
    brand_name: Optional[str] = ""
    active_ingredient: Optional[str] = ""
    drug_class: Optional[str] = ""
    dosage: Optional[str] = ""
    frequency: Optional[str] = ""
    route: Optional[str] = "Oral"
    duration: Optional[str] = ""
    status: Optional[str] = "Active"

class AnalysisRequest(BaseModel):
    patient: Optional[PatientContext] = Field(default_factory=PatientContext)
    medications: List[MedicationItem]

class AskQuestionRequest(BaseModel):
    question: str
    patient: Optional[PatientContext] = Field(default_factory=PatientContext)
    medications: List[MedicationItem]

@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "PharmaFog ML Engine",
        "reference_interactions_loaded": len(interaction_engine.interactions_db),
        "version": "1.0.0"
    }

@app.post("/api/analyze")
def analyze_medications(req: AnalysisRequest):
    try:
        meds_dict = [m.model_dump() for m in req.medications if m.status != "Discontinued"]
        patient_dict = req.patient.model_dump() if req.patient else {}

        # 1. Detect drug-drug interactions
        detected_interactions, graph_stats = interaction_engine.detect_interactions(meds_dict)

        # 2. Detect duplicate medications
        detected_duplicates = duplication_engine.detect_duplicates(meds_dict)

        # 3. Calculate explainable risk score
        risk_summary = risk_engine.calculate_risk(
            medications=meds_dict,
            interactions=detected_interactions,
            duplicates=detected_duplicates,
            patient_info=patient_dict
        )

        # 4. Generate AI insights & clinician checklist
        ai_insights = explainer_engine.generate_ai_insights(
            patient_info=patient_dict,
            medications=meds_dict,
            interactions=detected_interactions,
            duplicates=detected_duplicates,
            risk_summary=risk_summary
        )

        checklist = explainer_engine.generate_review_checklist(
            medications=meds_dict,
            interactions=detected_interactions,
            duplicates=detected_duplicates,
            allergy_alerts=risk_summary.get("allergy_alerts", []),
            patient_info=patient_dict
        )

        return {
            "status": "success",
            "patient": patient_dict,
            "total_medications": len(meds_dict),
            "interactions": detected_interactions,
            "duplicates": detected_duplicates,
            "risk_analysis": risk_summary,
            "ai_insights": ai_insights,
            "clinician_checklist": checklist,
            "network_graph": graph_stats,
            "disclaimer": "This analysis is produced by a Clinical Decision Support prototype and does not replace medical review."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ask")
def ask_question(req: AskQuestionRequest):
    try:
        meds_dict = [m.model_dump() for m in req.medications if m.status != "Discontinued"]
        patient_dict = req.patient.model_dump() if req.patient else {}

        detected_interactions, _ = interaction_engine.detect_interactions(meds_dict)
        detected_duplicates = duplication_engine.detect_duplicates(meds_dict)
        risk_summary = risk_engine.calculate_risk(
            medications=meds_dict,
            interactions=detected_interactions,
            duplicates=detected_duplicates,
            patient_info=patient_dict
        )

        result = explainer_engine.answer_question(
            question=req.question,
            patient_info=patient_dict,
            medications=meds_dict,
            interactions=detected_interactions,
            duplicates=detected_duplicates,
            risk_summary=risk_summary
        )

        return {
            "question": req.question,
            "answer": result["answer"],
            "grounded": result["grounded"],
            "evidence_sources": result["evidence_sources"],
            "disclaimer": "AI response is for informational and clinical decision-support purposes only."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reference/medications")
def get_sample_medications():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    meds_path = os.path.join(base_dir, "data", "sample_medications.json")
    if os.path.exists(meds_path):
        with open(meds_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return {"count": len(data), "medications": data}
    return {"count": 0, "medications": []}

@app.get("/api/reference/interactions")
def get_sample_interactions():
    return {
        "count": len(interaction_engine.interactions_db),
        "interactions": interaction_engine.interactions_db
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
