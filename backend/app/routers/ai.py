# backend/app/routers/ai.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app import models, schemas
from app.routers.auth import get_current_user
from app.services.ai_service import AIService
from datetime import datetime

router = APIRouter()

@router.post("/chat", response_model=schemas.ChatResponse)
async def chat_with_ai(
    chat_message: schemas.ChatMessage,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with AI assistant. Supports general questions and task-related queries.
    """
    try:
        ai_service = AIService()
        
        # Get user context for personalized responses
        user_settings = db.query(models.UserSettings).filter(
            models.UserSettings.user_id == current_user.id
        ).first()
        
        # Prepare context with user's recent tasks, preferences, etc.
        context = {
            "user_name": current_user.full_name or current_user.username,
            "domains_of_interest": user_settings.domains_of_interest if user_settings else [],
            "ai_personality": user_settings.ai_personality if user_settings else "helpful"
        }
        
        # Add any additional context from the request
        if chat_message.context:
            context.update(chat_message.context)
        
        # Get AI response
        response = await ai_service.get_chat_response(
            message=chat_message.message,
            context=context
        )
        
        return schemas.ChatResponse(
            response=response,
            timestamp=datetime.utcnow(),
            model_used="gpt-4.1-nano"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/task-suggestions")
async def get_task_suggestions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered task suggestions based on user's current tasks and patterns.
    """
    try:
        ai_service = AIService()
        
        # Get user's recent tasks
        recent_tasks = db.query(models.Task).filter(
            models.Task.owner_id == current_user.id
        ).order_by(models.Task.created_at.desc()).limit(10).all()
        
        # Get user's productivity patterns from timer sessions
        recent_sessions = db.query(models.TimerSession).filter(
            models.TimerSession.user_id == current_user.id
        ).order_by(models.TimerSession.started_at.desc()).limit(5).all()
        
        context = {
            "recent_tasks": [{"title": task.title, "completed": task.is_completed, "priority": task.priority} for task in recent_tasks],
            "recent_focus_sessions": [{"type": session.session_type, "duration": session.duration_actual} for session in recent_sessions]
        }
        
        suggestions = await ai_service.get_task_suggestions(context)
        
        return {"suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/analyze-productivity")
async def analyze_productivity(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI analysis of user's productivity patterns and recommendations.
    """
    try:
        ai_service = AIService()
        
        # Get comprehensive user data for analysis
        tasks = db.query(models.Task).filter(
            models.Task.owner_id == current_user.id
        ).order_by(models.Task.created_at.desc()).limit(20).all()
        
        timer_sessions = db.query(models.TimerSession).filter(
            models.TimerSession.user_id == current_user.id
        ).order_by(models.TimerSession.started_at.desc()).limit(15).all()
        
        context = {
            "tasks": [{
                "title": task.title,
                "completed": task.is_completed,
                "priority": task.priority,
                "created_at": task.created_at.isoformat(),
                "completed_at": task.completed_at.isoformat() if task.completed_at else None
            } for task in tasks],
            "timer_sessions": [{
                "type": session.session_type,
                "planned_duration": session.duration_planned,
                "actual_duration": session.duration_actual,
                "completed": session.was_completed,
                "started_at": session.started_at.isoformat()
            } for session in timer_sessions]
        }
        
        analysis = await ai_service.analyze_productivity(context)
        
        return {"analysis": analysis}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/quick-fact")
async def get_quick_fact(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a quick interesting fact related to user's interests.
    """
    try:
        ai_service = AIService()
        
        # Get user's domains of interest
        user_settings = db.query(models.UserSettings).filter(
            models.UserSettings.user_id == current_user.id
        ).first()
        
        domains = user_settings.domains_of_interest if user_settings else ["technology", "productivity"]
        
        fact = await ai_service.get_quick_fact(domains)
        
        return {"fact": fact, "timestamp": datetime.utcnow()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")