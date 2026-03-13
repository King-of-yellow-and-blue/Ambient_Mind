import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, RiskScore, Alert, Checkin, LLMConfig
from auth import get_current_user
from services.llm_service import LLMService, Prompts

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/current")
def get_current_risk(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    score = db.query(RiskScore).filter(RiskScore.user_id == current_user.id)\
              .order_by(RiskScore.calculated_at.desc()).first()
    return score if score else {
        "overall_score": 50,
        "voice_score": 50,
        "sleep_score": 50,
        "behavior_score": 50,
        "typing_score": 50,
        "checkin_score": 50,
        "trend": "stable",
        "dominant_signal": "none"
    }

@router.get("/history")
def get_risk_history(days: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    scores = db.query(RiskScore).filter(RiskScore.user_id == current_user.id, RiskScore.calculated_at >= cutoff)\
               .order_by(RiskScore.calculated_at.asc()).all()
    # Formatting for recharts
    res = []
    for s in scores:
        res.append({
            "date": s.calculated_at.strftime("%Y-%m-%d"),
            "overall_score": s.overall_score,
            "voice_score": s.voice_score,
            "sleep_score": s.sleep_score,
            "behavior_score": s.behavior_score,
            "typing_score": s.typing_score,
            "checkin_score": s.checkin_score,
            "dominant_signal": s.dominant_signal
        })
    return {"data": res}

@router.get("/dashboard")
async def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_score = db.query(RiskScore).filter(RiskScore.user_id == current_user.id).order_by(RiskScore.calculated_at.desc()).first()
    recent = db.query(RiskScore).filter(RiskScore.user_id == current_user.id).order_by(RiskScore.calculated_at.asc()).limit(30).all()
    
    last_7 = [s.overall_score for s in recent[-7:]] if recent else []
    
    # Generate daily insight using LLM
    today_insight = "Continue tracking to generate daily insights."
    actions = []
    
    if current_score:
        config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
        preferred = config.active_provider if config else current_user.preferred_llm
        llm = LLMService(preferred)
        if config:
            llm.set_keys(gemini=config.gemini_key_hash, claude=config.claude_key_hash, gpt=config.gpt_key_hash)

        latest_checkin = db.query(Checkin).filter(Checkin.user_id == current_user.id).order_by(Checkin.created_at.desc()).first()
        mood = latest_checkin.mood_score if latest_checkin else 3
        
        import asyncio
        prompt = Prompts.DAILY_INSIGHT.format(
            name=current_user.name, score=current_score.overall_score, trend=current_score.trend,
            voice_score=current_score.voice_score, sleep_score=current_score.sleep_score,
            behavior_score=current_score.behavior_score, checkin_mood=mood,
            dominant_signal=current_score.dominant_signal
        )
        
        try:
            llm_res = await asyncio.wait_for(
                llm.generate(prompt, Prompts.DAILY_INSIGHT_SYS),
                timeout=15.0
            )
        except asyncio.TimeoutError:
            llm_res = {"insight": "Your data is saved, but AI insight generation timed out.", "actions": ["Take a moment to relax", "Check back later"], "provider": "timeout"}
            
        today_insight = llm_res.get("insight", "Stable day today.")
        actions = llm_res.get("actions", ["Take a deep breath", "Stay hydrated"])

    alerts = db.query(Alert).filter(Alert.user_id == current_user.id, Alert.acknowledged == False).all()
    
    return {
        "current_score": current_score.overall_score if current_score else 50,
        "trend": current_score.trend if current_score else "stable",
        "dominant_signal": current_score.dominant_signal if current_score else "none",
        "last_7_days": last_7,
        "signal_breakdown": {
            "voice": current_score.voice_score if current_score else 50,
            "sleep": current_score.sleep_score if current_score else 50,
            "behavior": current_score.behavior_score if current_score else 50,
            "typing": current_score.typing_score if current_score else 50,
            "checkin": current_score.checkin_score if current_score else 50,
        },
        "today_insight": today_insight,
        "suggested_actions": actions,
        "active_alerts": alerts,
        "streak": 1 # Mock streak for now
    }
