# backend/app/routers/user_settings.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app import models, schemas
from app.routers.auth import get_current_user

settings_router = APIRouter()

@settings_router.get("/", response_model=schemas.UserSettings)
def get_user_settings(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user settings."""
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    return settings

@settings_router.put("/", response_model=schemas.UserSettings)
def update_user_settings(
    settings_update: schemas.UserSettingsUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user settings."""
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

@settings_router.get("/widgets")
def get_enabled_widgets(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's enabled widgets."""
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    enabled_widgets = settings.enabled_widgets if settings else ["calendar", "tasks", "timer", "ai_chat"]
    
    return {"enabled_widgets": enabled_widgets}

@settings_router.put("/widgets")
def update_enabled_widgets(
    widgets_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's enabled widgets."""
    settings = db.query(models.UserSettings).filter(
        models.UserSettings.user_id == current_user.id
    ).first()
    
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    settings.enabled_widgets = widgets_data.get("enabled_widgets", [])
    db.commit()
    db.refresh(settings)
    
    return {"enabled_widgets": settings.enabled_widgets}