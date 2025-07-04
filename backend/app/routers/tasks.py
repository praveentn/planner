# backend/app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from datetime import datetime, date

from app.db import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.Task])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    project: Optional[str] = None,
    tag: Optional[str] = None,
    due_date: Optional[date] = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's tasks with optional filtering."""
    query = db.query(models.Task).filter(models.Task.owner_id == current_user.id)
    
    if completed is not None:
        query = query.filter(models.Task.is_completed == completed)
    
    if priority:
        query = query.filter(models.Task.priority == priority)
        
    if project:
        query = query.filter(models.Task.project == project)
        
    if tag:
        query = query.filter(models.Task.tags.contains([tag]))
        
    if due_date:
        query = query.filter(models.Task.due_date.cast(date) == due_date)
    
    tasks = query.order_by(models.Task.created_at.desc()).offset(skip).limit(limit).all()
    return tasks

@router.get("/today", response_model=List[schemas.Task])
def get_today_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks due today."""
    today = datetime.now().date()
    tasks = db.query(models.Task).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.due_date.cast(date) == today,
            models.Task.is_completed == False
        )
    ).order_by(models.Task.priority.desc()).all()
    return tasks

@router.get("/overdue", response_model=List[schemas.Task])
def get_overdue_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overdue tasks."""
    today = datetime.now().date()
    tasks = db.query(models.Task).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.due_date.cast(date) < today,
            models.Task.is_completed == False
        )
    ).order_by(models.Task.due_date.asc()).all()
    return tasks

@router.get("/stats")
def get_task_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task statistics for the user."""
    total_tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).count()
    completed_tasks = db.query(models.Task).filter(
        and_(models.Task.owner_id == current_user.id, models.Task.is_completed == True)
    ).count()
    
    today = datetime.now().date()
    tasks_due_today = db.query(models.Task).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.due_date.cast(date) == today,
            models.Task.is_completed == False
        )
    ).count()
    
    overdue_tasks = db.query(models.Task).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.due_date.cast(date) < today,
            models.Task.is_completed == False
        )
    ).count()
    
    completion_rate = round((completed_tasks / total_tasks * 100), 2) if total_tasks > 0 else 0
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": total_tasks - completed_tasks,
        "tasks_due_today": tasks_due_today,
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate
    }

@router.post("/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task."""
    db_task = models.Task(
        **task.dict(),
        owner_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task."""
    task = db.query(models.Task).filter(
        and_(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task."""
    task = db.query(models.Task).filter(
        and_(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    
    # If marking as completed, set completed_at timestamp
    if update_data.get("is_completed") == True and not task.is_completed:
        update_data["completed_at"] = datetime.utcnow()
    elif update_data.get("is_completed") == False:
        update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task."""
    task = db.query(models.Task).filter(
        and_(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/toggle", response_model=schemas.Task)
def toggle_task_completion(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion status."""
    task = db.query(models.Task).filter(
        and_(models.Task.id == task_id, models.Task.owner_id == current_user.id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.is_completed = not task.is_completed
    if task.is_completed:
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    return task

@router.get("/projects/list")
def get_projects(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of unique projects for the user."""
    projects = db.query(models.Task.project).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.project.isnot(None),
            models.Task.project != ""
        )
    ).distinct().all()
    
    return {"projects": [p[0] for p in projects]}

@router.get("/tags/list")
def get_tags(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of unique tags for the user."""
    tasks_with_tags = db.query(models.Task.tags).filter(
        and_(
            models.Task.owner_id == current_user.id,
            models.Task.tags.isnot(None)
        )
    ).all()
    
    # Flatten all tags from all tasks
    all_tags = set()
    for task_tags in tasks_with_tags:
        if task_tags[0]:  # task_tags is a tuple
            all_tags.update(task_tags[0])
    
    return {"tags": sorted(list(all_tags))}