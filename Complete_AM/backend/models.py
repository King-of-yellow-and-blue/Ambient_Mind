import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # 'user' or 'clinician'
    plan = Column(String, default="free") # 'free', 'pro', 'clinical'
    alert_threshold = Column(Integer, default=70)
    clinician_id = Column(String, ForeignKey("users.id"), nullable=True)
    preferred_llm = Column(String, default="gemini") # 'gemini', 'claude', 'gpt'
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    onboarding = relationship("OnboardingProfile", back_populates="user", uselist=False)
    risk_scores = relationship("RiskScore", back_populates="user")
    checkins = relationship("Checkin", back_populates="user")
    voice_analyses = relationship("VoiceAnalysis", back_populates="user")
    sleep_data = relationship("SleepData", back_populates="user")
    behavior_logs = relationship("BehaviorLog", back_populates="user")
    alerts = relationship("Alert", back_populates="user")
    llm_config = relationship("LLMConfig", back_populates="user", uselist=False)
    
    # For clinicians linking to patients
    patients = relationship(
        "ClinicianPatient",
        foreign_keys="[ClinicianPatient.clinician_id]",
        back_populates="clinician"
    )

class OnboardingProfile(Base):
    __tablename__ = "onboarding_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    baseline_mood = Column(Integer) # 1-5
    bedtime = Column(String)
    wake_time = Column(String)
    baseline_notes = Column(Text)
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="onboarding")

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    overall_score = Column(Float)
    voice_score = Column(Float)
    sleep_score = Column(Float)
    behavior_score = Column(Float)
    typing_score = Column(Float)
    checkin_score = Column(Float)
    trend = Column(String) # 'stable', 'rising', 'falling'
    dominant_signal = Column(String)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="risk_scores")

class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    mood_score = Column(Integer) # 1-5
    mood_emoji = Column(String)
    energy_level = Column(Integer) # 1-10
    anxiety_level = Column(Integer) # 1-10
    notes = Column(Text)
    absolutist_flag = Column(Boolean, default=False)
    llm_response = Column(Text)
    checkin_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="checkins")

class VoiceAnalysis(Base):
    __tablename__ = "voice_analyses"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    pitch_score = Column(Float)
    pace_wpm = Column(Float)
    jitter = Column(Float)
    monotonicity = Column(Float)
    pause_frequency = Column(Float)
    overall_score = Column(Float)
    llm_insight = Column(Text)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="voice_analyses")

class SleepData(Base):
    __tablename__ = "sleep_data"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    bedtime_input = Column(String)
    waketime_input = Column(String)
    disruptions = Column(Integer)
    night_pickups = Column(Integer)
    sleep_quality = Column(Integer) # 1-10
    score = Column(Float)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="sleep_data")

class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    social_time_mins = Column(Integer)
    screen_time_mins = Column(Integer)
    messages_sent = Column(Integer)
    messages_replied = Column(Integer)
    mood_context = Column(Text)
    score = Column(Float)
    logged_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="behavior_logs")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    score_at_trigger = Column(Float)
    alert_type = Column(String) # 'watch', 'alert', 'crisis'
    acknowledged = Column(Boolean, default=False)
    clinician_notified = Column(Boolean, default=False)
    triggered_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="alerts")

class ClinicianPatient(Base):
    __tablename__ = "clinician_patients"

    id = Column(String, primary_key=True, default=generate_uuid)
    clinician_id = Column(String, ForeignKey("users.id"))
    patient_id = Column(String, ForeignKey("users.id"))
    linked_at = Column(DateTime, default=datetime.utcnow)
    threshold_override = Column(Integer, nullable=True)

    clinician = relationship("User", foreign_keys=[clinician_id], back_populates="patients")
    patient = relationship("User", foreign_keys=[patient_id])

class LLMConfig(Base):
    __tablename__ = "llm_config"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    active_provider = Column(String) # 'gemini', 'claude', 'gpt'
    gemini_key_hash = Column(String, nullable=True)
    claude_key_hash = Column(String, nullable=True)
    gpt_key_hash = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="llm_config")
