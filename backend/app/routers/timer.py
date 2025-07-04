# backend/app/routers/timer.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.db import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/sessions", response_model=schemas.TimerSession)
def start_timer_session(
    session: schemas.TimerSessionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new timer session."""
    db_session = models.TimerSession(
        **session.dict(),
        user_id=current_user.id
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/sessions", response_model=List[schemas.TimerSession])
def get_timer_sessions(
    skip: int = 0,
    limit: int = 50,
    session_type: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's timer sessions with optional filtering."""
    query = db.query(models.TimerSession).filter(models.TimerSession.user_id == current_user.id)
    
    if session_type:
        query = query.filter(models.TimerSession.session_type == session_type)
    
    if date_from:
        query = query.filter(models.TimerSession.started_at >= date_from)
    
    if date_to:
        query = query.filter(models.TimerSession.started_at <= date_to)
    
    sessions = query.order_by(models.TimerSession.started_at.desc()).offset(skip).limit(limit).all()
    return sessions

@router.get("/sessions/today", response_model=List[schemas.TimerSession])
def get_today_sessions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get today's timer sessions."""
    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)
    
    sessions = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.user_id == current_user.id,
            models.TimerSession.started_at >= today,
            models.TimerSession.started_at < tomorrow
        )
    ).order_by(models.TimerSession.started_at.desc()).all()
    
    return sessions

@router.put("/sessions/{session_id}", response_model=schemas.TimerSession)
def update_timer_session(
    session_id: int,
    session_update: schemas.TimerSessionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a timer session (usually to end it)."""
    session = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.id == session_id,
            models.TimerSession.user_id == current_user.id
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")
    
    update_data = session_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(session, field, value)
    
    db.commit()
    db.refresh(session)
    return session

@router.get("/sessions/{session_id}", response_model=schemas.TimerSession)
def get_timer_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific timer session."""
    session = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.id == session_id,
            models.TimerSession.user_id == current_user.id
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")
    
    return session

@router.delete("/sessions/{session_id}")
def delete_timer_session(
    session_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a timer session."""
    session = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.id == session_id,
            models.TimerSession.user_id == current_user.id
        )
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Timer session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Timer session deleted successfully"}

@router.get("/stats/daily")
def get_daily_stats(
    date: Optional[datetime] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get daily timer statistics."""
    if date is None:
        date = datetime.now().date()
    else:
        date = date.date()
    
    tomorrow = date + timedelta(days=1)
    
    # Get sessions for the day
    sessions = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.user_id == current_user.id,
            models.TimerSession.started_at >= date,
            models.TimerSession.started_at < tomorrow
        )
    ).all()
    
    # Calculate statistics
    total_time = sum(s.duration_actual or 0 for s in sessions)
    pomodoro_sessions = [s for s in sessions if s.session_type == "pomodoro"]
    break_sessions = [s for s in sessions if s.session_type == "break"]
    completed_pomodoros = len([s for s in pomodoro_sessions if s.was_completed])
    
    pomodoro_time = sum(s.duration_actual or 0 for s in pomodoro_sessions)
    break_time = sum(s.duration_actual or 0 for s in break_sessions)
    
    return {
        "date": date.isoformat(),
        "total_time_seconds": total_time,
        "total_time_minutes": round(total_time / 60, 2),
        "pomodoro_time_seconds": pomodoro_time,
        "pomodoro_time_minutes": round(pomodoro_time / 60, 2),
        "break_time_seconds": break_time,
        "break_time_minutes": round(break_time / 60, 2),
        "total_sessions": len(sessions),
        "pomodoro_sessions": len(pomodoro_sessions),
        "completed_pomodoros": completed_pomodoros,
        "average_session_length": round(total_time / len(sessions), 2) if sessions else 0,
        "productivity_score": round((completed_pomodoros / len(pomodoro_sessions) * 100), 2) if pomodoro_sessions else 0
    }

@router.get("/stats/weekly")
def get_weekly_stats(
    weeks_back: int = 0,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get weekly timer statistics."""
    today = datetime.now().date()
    start_of_week = today - timedelta(days=today.weekday()) - timedelta(weeks=weeks_back)
    end_of_week = start_of_week + timedelta(days=7)
    
    sessions = db.query(models.TimerSession).filter(
        and_(
            models.TimerSession.user_id == current_user.id,
            models.TimerSession.started_at >= start_of_week,
            models.TimerSession.started_at < end_of_week
        )
    ).all()
    
    # Group by day
    daily_stats = {}
    for i in range(7):
        day = start_of_week + timedelta(days=i)
        day_sessions = [s for s in sessions if s.started_at.date() == day]
        
        total_time = sum(s.duration_actual or 0 for s in day_sessions)
        pomodoro_sessions = [s for s in day_sessions if s.session_type == "pomodoro"]
        completed_pomodoros = len([s for s in pomodoro_sessions if s.was_completed])
        
        daily_stats[day.isoformat()] = {
            "total_time_minutes": round(total_time / 60, 2),
            "total_sessions": len(day_sessions),
            "completed_pomodoros": completed_pomodoros
        }
    
    # Overall week stats
    total_time = sum(s.duration_actual or 0 for s in sessions)
    total_pomodoros = len([s for s in sessions if s.session_type == "pomodoro"])
    completed_pomodoros = len([s for s in sessions if s.session_type == "pomodoro" and s.was_completed])
    
    return {
        "week_start": start_of_week.isoformat(),
        "week_end": (end_of_week - timedelta(days=1)).isoformat(),
        "total_time_hours": round(total_time / 3600, 2),
        "total_sessions": len(sessions),
        "total_pomodoros": total_pomodoros,
        "completed_pomodoros": completed_pomodoros,
        "daily_breakdown": daily_stats,
        "average_daily_time": round(total_time / 7 / 60, 2),  # minutes per day
        "consistency_score": round(len([day for day in daily_stats.values() if day["total_sessions"] > 0]) / 7 * 100, 2)
    }

@router.get("/settings/pomodoro")
def get_pomodoro_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's Pomodoro settings."""
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        # Return default settings
        return {
            "work_duration": 25,
            "break_duration": 5,
            "long_break_duration": 15
        }
    
    return {
        "work_duration": settings.pomodoro_work_duration,
        "break_duration": settings.pomodoro_break_duration,
        "long_break_duration": settings.pomodoro_long_break_duration
    }