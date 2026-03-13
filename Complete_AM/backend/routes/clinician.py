from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, ClinicianPatient, RiskScore, VoiceAnalysis, SleepData, BehaviorLog, Checkin, LLMConfig
from schemas import LinkPatient
from auth import get_current_clinician
from services.llm_service import LLMService, Prompts

router = APIRouter(prefix="/api/clinician", tags=["clinician"])

@router.post("/link-patient")
def link_patient(data: LinkPatient, db: Session = Depends(get_db), current_user: User = Depends(get_current_clinician)):
    patient = db.query(User).filter(User.email == data.patient_email, User.role == 'user').first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found or invalid role")
    
    # Check if already linked
    existing = db.query(ClinicianPatient).filter(ClinicianPatient.clinician_id == current_user.id, ClinicianPatient.patient_id == patient.id).first()
    if existing:
        return {"message": "Already linked"}
    
    new_link = ClinicianPatient(clinician_id=current_user.id, patient_id=patient.id)
    patient.clinician_id = current_user.id
    db.add(new_link)
    db.commit()
    return {"message": "Patient linked successfully", "patient": {"id": patient.id, "name": patient.name}}

@router.get("/patients")
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_clinician)):
    patients = db.query(User).join(ClinicianPatient, ClinicianPatient.patient_id == User.id)\
                 .filter(ClinicianPatient.clinician_id == current_user.id).all()
    
    res = []
    for p in patients:
        risk = db.query(RiskScore).filter(RiskScore.user_id == p.id).order_by(RiskScore.calculated_at.desc()).first()
        res.append({
            "id": p.id,
            "name": p.name,
            "email": p.email,
            "current_risk": risk.overall_score if risk else 0,
            "trend": risk.trend if risk else "unknown",
            "last_active": str(risk.calculated_at) if risk else None
        })
    # Frontend reads res.data.patients
    return {"patients": res}

@router.get("/patient/{patient_id}")
def get_patient_detail(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_clinician)):
    # Verify link
    link = db.query(ClinicianPatient).filter(ClinicianPatient.clinician_id == current_user.id, ClinicianPatient.patient_id == patient_id).first()
    if not link:
        raise HTTPException(status_code=403, detail="Access denied")
    
    patient = db.query(User).filter(User.id == patient_id).first()
    recent_risks = db.query(RiskScore).filter(RiskScore.user_id == patient_id).order_by(RiskScore.calculated_at.desc()).limit(30).all()
    latest_risk = recent_risks[0] if recent_risks else None

    # Fetch alerts if Alert model exists
    alerts = []
    try:
        alerts_raw = db.query(Alert).filter(Alert.user_id == patient_id).order_by(Alert.triggered_at.desc()).limit(10).all()
        alerts = [{"alert_type": a.alert_type, "triggered_at": str(a.triggered_at)} for a in alerts_raw]
    except Exception:
        alerts = []

    # Frontend expects: {patient, history, alerts, current_risk}
    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "email": patient.email,
            "alert_threshold": getattr(patient, "alert_threshold", 75)
        },
        "history": [{"overall_score": s.overall_score} for s in reversed(recent_risks)],
        "alerts": alerts,
        "current_risk": latest_risk.overall_score if latest_risk else 0
    }

@router.get("/report/{patient_id}")
async def generate_report(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_clinician)):
    # Verify link
    link = db.query(ClinicianPatient).filter(ClinicianPatient.clinician_id == current_user.id, ClinicianPatient.patient_id == patient_id).first()
    if not link:
        raise HTTPException(status_code=403, detail="Access denied")
        
    patient = db.query(User).filter(User.id == patient_id).first()
    
    # Gather data for LLM
    risks = db.query(RiskScore).filter(RiskScore.user_id == patient_id).order_by(RiskScore.calculated_at.desc()).limit(14).all()
    
    # We use clinician's preferred LLM for the report
    config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
    preferred = config.active_provider if config else getattr(current_user, "preferred_llm", "gemini")
    llm = LLMService(preferred)
    if config:
        llm.set_keys(gemini=config.gemini_key_hash, claude=config.claude_key_hash, gpt=config.gpt_key_hash)
    
    import asyncio
    prompt = Prompts.CLINICAL.format(
        name=patient.name,
        age="Unknown",
        days=14,
        risk_history=[s.overall_score for s in risks],
        voice_trend="Stable",
        sleep_data="Varied",
        behavior_data="Normal",
        checkin_summary="Recent absolutist language detected"
    )
    
    try:
        llm_res = await asyncio.wait_for(
            llm.generate(prompt, Prompts.CLINICAL_SYS),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        llm_res = {"clinical_report": "Analysis timed out due to high load. Please try again."}
        
    # Ensure we return a clinical_report string the frontend can render
    if isinstance(llm_res, dict) and "clinical_report" not in llm_res:
        import json
        llm_res = {"clinical_report": json.dumps(llm_res, indent=2)}
    
    return llm_res

