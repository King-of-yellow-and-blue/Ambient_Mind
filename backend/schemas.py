from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user" # user or clinician

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    plan: str
    alert_threshold: int
    preferred_llm: str
    is_active: bool

    class Config:
        from_attributes = True

# Onboarding
class OnboardingCreate(BaseModel):
    baseline_mood: int
    bedtime: str
    wake_time: str
    baseline_notes: str

# Data Sync & Checkins
class CheckinCreate(BaseModel):
    mood_score: int
    mood_emoji: str
    energy_level: int
    anxiety_level: int
    notes: str

# Voice
class VoiceAnalyzeCreate(BaseModel):
    pitch_score: float
    pace_wpm: float
    jitter: float
    monotonicity: float
    pause_frequency: float

# Sleep
class SleepLogCreate(BaseModel):
    bedtime_input: str
    waketime_input: str
    disruptions: int
    night_pickups: int
    sleep_quality: int

# Behavior
class BehaviorLogCreate(BaseModel):
    social_time_mins: int
    screen_time_mins: int
    messages_sent: int
    messages_replied: int
    mood_context: str

# User Settings updates
class UserSettingsUpdate(BaseModel):
    alert_threshold: Optional[int] = None
    preferred_llm: Optional[str] = None
    name: Optional[str] = None

class LLMKeyUpdate(BaseModel):
    provider: str # gemini, claude, gpt
    api_key: str

# Clinician
class LinkPatient(BaseModel):
    patient_email: EmailStr

class LLMInsightRequest(BaseModel):
    context_type: str # 'daily', 'voice', 'checkin', 'clinical'
