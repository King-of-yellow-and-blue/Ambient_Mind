from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, Checkin, LLMConfig
from schemas import CheckinCreate
from auth import get_current_user
from services.risk_engine import calculate_fused_score
from services.llm_service import LLMService, Prompts

router = APIRouter(prefix="/api/checkin", tags=["checkin"])

@router.post("/submit")
async def submit_checkin(data: CheckinCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Generate LLM Response
    config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
    preferred = config.active_provider if config else current_user.preferred_llm
    llm = LLMService(preferred)
    if config:
        llm.set_keys(gemini=config.gemini_key_hash, claude=config.claude_key_hash, gpt=config.gpt_key_hash)
    
    import asyncio
    # Simple risk trend mock for prompt
    trend = "stable"
    prompt = Prompts.CHECKIN.format(
        mood=data.mood_score, mood_emoji=data.mood_emoji,
        energy=data.energy_level, anxiety=data.anxiety_level,
        notes=data.notes, trend=trend
    )
    
    try:
        llm_res = await asyncio.wait_for(
            llm.generate(prompt, Prompts.CHECKIN_SYS),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        llm_res = {"response": "Thank you for sharing. We're currently experiencing high traffic, but your check-in is securely saved.", "provider": "timeout"}
    
    ai_text = llm_res.get("response", "Thank you for checking in. We are here for you.")
    is_absolutist = llm_res.get("absolutist_detected", False)
    
    # 2. Calculate checkin score: (mood/5)*40 + ((10-anx)/10)*40 + (energy/10)*20
    checkin_score = ((data.mood_score / 5) * 40) + (((10 - data.anxiety_level) / 10) * 40) + ((data.energy_level / 10) * 20)
    checkin_score = max(0.0, min(100.0, checkin_score))

    # 3. Store checkin
    new_checkin = Checkin(
        user_id=current_user.id,
        mood_score=data.mood_score,
        mood_emoji=data.mood_emoji,
        energy_level=data.energy_level,
        anxiety_level=data.anxiety_level,
        notes=data.notes,
        absolutist_flag=is_absolutist,
        llm_response=ai_text,
        checkin_score=checkin_score
    )
    db.add(new_checkin)
    db.commit()

    # 4. Fused risk
    new_risk = calculate_fused_score(db, current_user.id, {'checkin': checkin_score})
    
    # 5. Alert Check
    alert_triggered = new_risk.overall_score >= current_user.alert_threshold

    return {
        "checkin": new_checkin,
        "llm_response": ai_text,
        "new_risk_score": new_risk.overall_score,
        "alert_triggered": alert_triggered,
        "provider_used": llm_res.get("provider", "none")
    }

@router.get("/history")
def get_checkin_history(limit: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    checkins = db.query(Checkin).filter(Checkin.user_id == current_user.id)\
                 .order_by(Checkin.created_at.desc()).limit(limit).all()
    return {"data": checkins}
