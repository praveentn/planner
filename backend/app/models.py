# backend/app/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tasks = relationship("Task", back_populates="owner")
    timer_sessions = relationship("TimerSession", back_populates="user")
    user_settings = relationship("UserSettings", back_populates="user", uselist=False)
    feed_items = relationship("FeedItem", back_populates="user")

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Widget preferences
    enabled_widgets = Column(JSON, default=["calendar", "tasks", "timer", "ai_chat"])
    theme = Column(String, default="light")  # light, dark
    
    # Work preferences
    work_hours_start = Column(String, default="09:00")
    work_hours_end = Column(String, default="17:00")
    
    # Pomodoro settings
    pomodoro_work_duration = Column(Integer, default=25)  # minutes
    pomodoro_break_duration = Column(Integer, default=5)  # minutes
    pomodoro_long_break_duration = Column(Integer, default=15)  # minutes
    
    # Notification preferences
    enable_notifications = Column(Boolean, default=True)
    enable_sounds = Column(Boolean, default=True)
    
    # AI preferences
    ai_personality = Column(String, default="helpful")
    domains_of_interest = Column(JSON, default=["AI/ML", "productivity", "technology"])
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="user_settings")

class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    
    # Status and priority
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high, urgent
    
    # Dates
    due_date = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Organization
    tags = Column(JSON, default=[])
    project = Column(String)
    
    # Recurrence (for repeating tasks)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(JSON)  # {"type": "daily", "interval": 1, "end_date": null}
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

class TimerSession(Base):
    __tablename__ = "timer_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Session details
    session_type = Column(String)  # pomodoro, break, custom_timer, stopwatch
    duration_planned = Column(Integer)  # planned duration in seconds
    duration_actual = Column(Integer)  # actual duration in seconds
    
    # Task association
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    task_title = Column(String)  # snapshot of task title
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True))
    
    # Session metadata
    was_completed = Column(Boolean, default=False)
    interruptions = Column(Integer, default=0)
    notes = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="timer_sessions")

class FeedItem(Base):
    __tablename__ = "feed_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Content
    title = Column(String, nullable=False)
    content = Column(Text)
    url = Column(String)
    source = Column(String)  # RSS feed name, API source, etc.
    
    # Metadata
    category = Column(String)  # AI/ML, productivity, news, facts, etc.
    feed_type = Column(String)  # news, fact, paper, article
    
    # User interaction
    is_read = Column(Boolean, default=False)
    is_bookmarked = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    
    # Timestamps
    published_at = Column(DateTime(timezone=True))
    fetched_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="feed_items")

class ReadingItem(Base):
    __tablename__ = "reading_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Content details
    title = Column(String, nullable=False)
    url = Column(String)
    author = Column(String)
    source = Column(String)  # website, book, paper, etc.
    
    # Progress tracking
    total_pages = Column(Integer)
    current_page = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    
    # Organization
    tags = Column(JSON, default=[])
    category = Column(String)
    
    # Status
    status = Column(String, default="to_read")  # to_read, reading, completed, paused
    
    # Timestamps
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    started_reading_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    
    # Notes and highlights
    notes = Column(Text)
    highlights = Column(JSON, default=[])

class AutomationRule(Base):
    __tablename__ = "automation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Rule definition
    name = Column(String, nullable=False)
    description = Column(Text)
    
    # Trigger and action
    trigger_type = Column(String)  # task_completed, timer_finished, time_based, etc.
    trigger_config = Column(JSON)  # Configuration for the trigger
    action_type = Column(String)  # send_email, create_task, export_data, etc.
    action_config = Column(JSON)  # Configuration for the action
    
    # Status
    is_active = Column(Boolean, default=True)
    last_executed = Column(DateTime(timezone=True))
    execution_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())