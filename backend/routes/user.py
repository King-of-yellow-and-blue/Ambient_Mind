from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import User, LLMConfig, OnboardingProfile, SleepData, BehaviorLog
from schemas import UserSettingsUpdate, LLMKeyUpdate, OnboardingCreate, SleepLogCreate, BehaviorLogCreate
from auth import get_current_user
from services.risk_engine import calculate_fused_score

router = APIRouter(prefix="/api/user", tags=["user"])

@router.put("/settings")
def update_settings(settings: UserSettingsUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == current_user.id).first()
    if settings.name is not None:
        user.name = settings.name
    if settings.alert_threshold is not None:
        user.alert_threshold = settings.alert_threshold
    if settings.preferred_llm is not None:
        user.preferred_llm = settings.preferred_llm
    
    db.commit()
    return {"status": "success", "message": "Settings updated"}

@router.put("/llm-keys")
def update_llm_keys(keys: LLMKeyUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Very simplified: just store in DB (in real world, encrypt these at rest or use env)
    config = db.query(LLMConfig).filter(LLMConfig.user_id == current_user.id).first()
    if not config:
        config = LLMConfig(user_id=current_user.id, active_provider=keys.provider)
        db.add(config)
    
    config.active_provider = keys.provider
    if keys.provider == 'gemini':
        config.gemini_key_hash = keys.api_key
    elif keys.provider == 'claude':
        config.claude_key_hash = keys.api_key
    elif keys.provider == 'gpt':
        config.gpt_key_hash = keys.api_key
        
    db.commit()
    return {"success": True, "provider": keys.provider}

@router.post("/onboarding")
def complete_onboarding(profile: OnboardingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(OnboardingProfile).filter(OnboardingProfile.user_id == current_user.id).first()
    if not existing:
        new_prof = OnboardingProfile(
            user_id=current_user.id,
            baseline_mood=profile.baseline_mood,
            bedtime=profile.bedtime,
            wake_time=profile.wake_time,
            baseline_notes=profile.baseline_notes,
            onboarding_complete=True
        )
        db.add(new_prof)
        db.commit()
    return {"success": True}

@router.post("/sleep/log")
def log_sleep(data: SleepLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sleep_score = (data.sleep_quality / 10) * 60 + ((10 - data.disruptions)/10) * 25 + ((5 - data.night_pickups)/5) * 15
    sleep_score = max(0.0, min(100.0, sleep_score))
    
    new_sleep = SleepData(
        user_id=current_user.id,
        bedtime_input=data.bedtime_input,
        waketime_input=data.waketime_input,
        disruptions=data.disruptions,
        night_pickups=data.night_pickups,
        sleep_quality=data.sleep_quality,
        score=sleep_score
    )
    db.add(new_sleep)
    db.commit()
    
    new_risk = calculate_fused_score(db, current_user.id, {'sleep': sleep_score})
    return {"sleep_data": new_sleep, "sleep_score": sleep_score, "new_risk_score": new_risk.overall_score}

@router.post("/behavior/log")
def log_behavior(data: BehaviorLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    reply_rate = data.messages_replied / max(data.messages_sent, 1)
    social_penalty = min(data.social_time_mins / 300, 1) * 30
    behavior_score = (reply_rate * 50) + ((1 - data.social_time_mins/480) * 30) + ((1 - data.screen_time_mins/600) * 20)
    behavior_score = max(0.0, min(100.0, behavior_score))
    
    new_beh = BehaviorLog(
        user_id=current_user.id,
        social_time_mins=data.social_time_mins,
        screen_time_mins=data.screen_time_mins,
        messages_sent=data.messages_sent,
        messages_replied=data.messages_replied,
        mood_context=data.mood_context,
        score=behavior_score
    )
    db.add(new_beh)
    db.commit()
    
    new_risk = calculate_fused_score(db, current_user.id, {'behavior': behavior_score})
    return {"behavior_data": new_beh, "behavior_score": behavior_score, "new_risk_score": new_risk.overall_score}
