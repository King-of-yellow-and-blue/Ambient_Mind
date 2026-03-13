from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, LLMConfig
from auth import get_current_user
from services.llm_service import LLMService

router = APIRouter(prefix="/api/llm", tags=["llm"])

@router.post("/insight")
async def generate_insight(req: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    context_type = req.get("context_type", "daily")
    
    config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
    preferred = config.active_provider if config else current_user.preferred_llm
    llm = LLMService(preferred)
    if config:
        llm.set_keys(gemini=config.gemini_key_hash, claude=config.claude_key_hash, gpt=config.gpt_key_hash)

    import asyncio
    prompt = f"Provide a brief insight based on the context: {context_type} for user {current_user.name}."
    sys = "You are a helpful mental health companion."
    try:
        res = await asyncio.wait_for(
            llm.generate(prompt, sys),
            timeout=15.0
        )
    except asyncio.TimeoutError:
        res = {"insight": "Insight generation timed out.", "provider": "timeout"}
    return res
