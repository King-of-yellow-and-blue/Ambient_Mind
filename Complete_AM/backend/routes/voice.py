from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, VoiceAnalysis, LLMConfig
from schemas import VoiceAnalyzeCreate
from auth import get_current_user
from services.risk_engine import calculate_fused_score
from services.llm_service import LLMService, Prompts

router = APIRouter(prefix="/api/voice", tags=["voice"])

@router.post("/analyze")
async def analyze_voice(data: VoiceAnalyzeCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    
    # Determine basic voice score for simulation (since browser can't do raw audio reliably yet)
    # The frontend is sending mock deviations. We'll average them.
    v_score = (data.pitch_score + data.pace_wpm + data.jitter + data.monotonicity + data.pause_frequency) / 5.0
    v_score = max(0.0, min(100.0, v_score))

    # LLM insight
    config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
    preferred = config.active_provider if config else current_user.preferred_llm
    llm = LLMService(preferred)
    if config:
        llm.set_keys(gemini=config.gemini_key_hash, claude=config.claude_key_hash, gpt=config.gpt_key_hash)
        
    import asyncio
    prompt = Prompts.VOICE.format(
        name=current_user.name,
        pitch=data.pitch_score,
        pace=data.pace_wpm,
        jitter=data.jitter,
        monotonicity=data.monotonicity,
        pauses=data.pause_frequency,
        score=v_score
    )
    
    try:
        llm_res = await asyncio.wait_for(
            llm.generate(prompt, Prompts.VOICE_SYS),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        llm_res = {"insight": "Your vocal patterns generally appear stable today. Analysis timed out due to high load, but data is saved.", "provider": "timeout"}
        
    insight = llm_res.get("insight", "Your vocal patterns appear stable today.")

    new_voice = VoiceAnalysis(
        user_id=current_user.id,
        pitch_score=data.pitch_score,
        pace_wpm=data.pace_wpm,
        jitter=data.jitter,
        monotonicity=data.monotonicity,
        pause_frequency=data.pause_frequency,
        overall_score=v_score,
        llm_insight=insight
    )
    db.add(new_voice)
    db.commit()

    new_risk = calculate_fused_score(db, current_user.id, {'voice': v_score})

    return {
        "analysis": new_voice,
        "llm_insight": insight,
        "voice_score": v_score,
        "new_risk_score": new_risk.overall_score
    }
