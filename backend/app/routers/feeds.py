# backend/app/routers/feeds.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional

from app.db import get_db
from app import models, schemas
from app.routers.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[schemas.FeedItem])
def get_feed_items(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    feed_type: Optional[str] = None,
    unread_only: bool = False,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's feed items with optional filtering."""
    query = db.query(models.FeedItem).filter(models.FeedItem.user_id == current_user.id)
    
    if category:
        query = query.filter(models.FeedItem.category == category)
    
    if feed_type:
        query = query.filter(models.FeedItem.feed_type == feed_type)
    
    if unread_only:
        query = query.filter(models.FeedItem.is_read == False)
    
    items = query.order_by(models.FeedItem.fetched_at.desc()).offset(skip).limit(limit).all()
    return items

@router.put("/{item_id}", response_model=schemas.FeedItem)
def update_feed_item(
    item_id: int,
    item_update: schemas.FeedItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update feed item (mark as read, bookmark, etc.)."""
    item = db.query(models.FeedItem).filter(
        and_(models.FeedItem.id == item_id, models.FeedItem.user_id == current_user.id)
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Feed item not found")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item

@router.get("/categories")
def get_categories(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available feed categories."""
    categories = db.query(models.FeedItem.category).filter(
        models.FeedItem.user_id == current_user.id
    ).distinct().all()
    
    return {"categories": [c[0] for c in categories if c[0]]}

@router.get("/stats")
def get_feed_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get feed statistics."""
    total_items = db.query(models.FeedItem).filter(models.FeedItem.user_id == current_user.id).count()
    unread_items = db.query(models.FeedItem).filter(
        and_(models.FeedItem.user_id == current_user.id, models.FeedItem.is_read == False)
    ).count()
    bookmarked_items = db.query(models.FeedItem).filter(
        and_(models.FeedItem.user_id == current_user.id, models.FeedItem.is_bookmarked == True)
    ).count()
    
    return {
        "total_items": total_items,
        "unread_items": unread_items,
        "bookmarked_items": bookmarked_items,
        "read_percentage": round((total_items - unread_items) / total_items * 100, 2) if total_items > 0 else 0
    }

