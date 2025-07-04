# backend/app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# User Settings schemas
class UserSettingsBase(BaseModel):
    enabled_widgets: Optional[List[str]] = ["calendar", "tasks", "timer", "ai_chat"]
    theme: Optional[str] = "light"
    work_hours_start: Optional[str] = "09:00"
    work_hours_end: Optional[str] = "17:00"
    pomodoro_work_duration: Optional[int] = 25
    pomodoro_break_duration: Optional[int] = 5
    pomodoro_long_break_duration: Optional[int] = 15
    enable_notifications: Optional[bool] = True
    enable_sounds: Optional[bool] = True
    ai_personality: Optional[str] = "helpful"
    domains_of_interest: Optional[List[str]] = ["AI/ML", "productivity", "technology"]

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettingsUpdate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = []
    project: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurrence_pattern: Optional[Dict[str, Any]] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    tags: Optional[List[str]] = None
    project: Optional[str] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[Dict[str, Any]] = None

class Task(TaskBase):
    id: int
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    owner_id: int
    
    class Config:
        from_attributes = True

# Timer Session schemas
class TimerSessionBase(BaseModel):
    session_type: str
    duration_planned: int
    task_id: Optional[int] = None
    task_title: Optional[str] = None

class TimerSessionCreate(TimerSessionBase):
    pass

class TimerSessionUpdate(BaseModel):
    duration_actual: Optional[int] = None
    was_completed: Optional[bool] = None
    interruptions: Optional[int] = None
    notes: Optional[str] = None
    ended_at: Optional[datetime] = None

class TimerSession(TimerSessionBase):
    id: int
    user_id: int
    duration_actual: Optional[int] = None
    started_at: datetime
    ended_at: Optional[datetime] = None
    was_completed: bool
    interruptions: int
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

# AI Chat schemas
class ChatMessage(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    model_used: str

# Feed schemas
class FeedItemBase(BaseModel):
    title: str
    content: Optional[str] = None
    url: Optional[str] = None
    source: str
    category: str
    feed_type: str

class FeedItemCreate(FeedItemBase):
    published_at: Optional[datetime] = None

class FeedItemUpdate(BaseModel):
    is_read: Optional[bool] = None
    is_bookmarked: Optional[bool] = None
    is_archived: Optional[bool] = None

class FeedItem(FeedItemBase):
    id: int
    user_id: int
    is_read: bool
    is_bookmarked: bool
    is_archived: bool
    published_at: Optional[datetime] = None
    fetched_at: datetime
    
    class Config:
        from_attributes = True

# Reading Item schemas
class ReadingItemBase(BaseModel):
    title: str
    url: Optional[str] = None
    author: Optional[str] = None
    source: Optional[str] = None
    total_pages: Optional[int] = None
    tags: Optional[List[str]] = []
    category: Optional[str] = None

class ReadingItemCreate(ReadingItemBase):
    pass

class ReadingItemUpdate(BaseModel):
    current_page: Optional[int] = None
    progress_percentage: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    highlights: Optional[List[Dict[str, Any]]] = None

class ReadingItem(ReadingItemBase):
    id: int
    user_id: int
    current_page: int
    progress_percentage: float
    status: str
    added_at: datetime
    started_reading_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    highlights: List[Dict[str, Any]]
    
    class Config:
        from_attributes = True

# Automation schemas
class AutomationRuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: Dict[str, Any]
    action_type: str
    action_config: Dict[str, Any]

class AutomationRuleCreate(AutomationRuleBase):
    pass

class AutomationRuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    trigger_config: Optional[Dict[str, Any]] = None
    action_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class AutomationRule(AutomationRuleBase):
    id: int
    user_id: int
    is_active: bool
    last_executed: Optional[datetime] = None
    execution_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardData(BaseModel):
    tasks_today: List[Task]
    tasks_overdue: List[Task]
    recent_timer_sessions: List[TimerSession]
    unread_feeds: List[FeedItem]
    productivity_stats: Dict[str, Any]