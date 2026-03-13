from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import RiskScore, User

def calculate_fused_score(db: Session, user_id: str, new_scores: dict):
    # Retrieve the last 7 risk scores to calculate trend
    recent_scores = db.query(RiskScore).filter(
        RiskScore.user_id == user_id,
        RiskScore.calculated_at >= datetime.utcnow() - timedelta(days=7)
    ).order_by(RiskScore.calculated_at.desc()).limit(7).all()

    # Get the most recent valid score for missing inputs
    last_score = recent_scores[0] if recent_scores else None

    # Merge new scores with previous scores (or defaults if completely new user)
    v_score = new_scores.get('voice', last_score.voice_score if last_score else 50.0)
    s_score = new_scores.get('sleep', last_score.sleep_score if last_score else 50.0)
    b_score = new_scores.get('behavior', last_score.behavior_score if last_score else 50.0)
    t_score = new_scores.get('typing', last_score.typing_score if last_score else 50.0)
    c_score = new_scores.get('checkin', last_score.checkin_score if last_score else 50.0)

    # Weights: voice: 0.25, sleep: 0.25, behavior: 0.20, typing: 0.15, checkin: 0.15
    overall = (v_score * 0.25) + (s_score * 0.25) + (b_score * 0.20) + (t_score * 0.15) + (c_score * 0.15)

    # Calculate trend
    trend = 'stable'
    if len(recent_scores) >= 3:
        avg_overall = sum(s.overall_score for s in recent_scores) / len(recent_scores)
        if overall > avg_overall + 5:
            trend = 'rising'
        elif overall < avg_overall - 5:
            trend = 'falling'

    # Determine dominant signal (highest absolute deviation from 50, treating 50 as neutral baseline for now)
    signals = {'voice': v_score, 'sleep': s_score, 'behavior': b_score, 'typing': t_score, 'checkin': c_score}
    dominant_signal = max(signals, key=lambda k: abs(signals[k] - 50.0))

    # Create new risk score record
    new_risk = RiskScore(
        user_id=user_id,
        overall_score=round(overall, 2),
        voice_score=round(v_score, 2),
        sleep_score=round(s_score, 2),
        behavior_score=round(b_score, 2),
        typing_score=round(t_score, 2),
        checkin_score=round(c_score, 2),
        trend=trend,
        dominant_signal=dominant_signal
    )
    
    db.add(new_risk)
    db.commit()
    db.refresh(new_risk)

    return new_risk
