# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import json
import asyncio
from typing import List
import os
from dotenv import load_dotenv

from app.db import get_db, create_tables
from app.routers import auth, tasks, timer, ai, feeds, user_settings
from app.services.websocket_manager import ConnectionManager

load_dotenv()

app = FastAPI(title="EunoiaFlow", description="AI-Powered Productivity Planner", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
create_tables()

# WebSocket manager
manager = ConnectionManager()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(timer.router, prefix="/api/timer", tags=["timer"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(feeds.router, prefix="/api/feeds", tags=["feeds"])
app.include_router(user_settings.settings_router, prefix="/api/settings", tags=["settings"])

@app.get("/")
async def root():
    return {"message": "EunoiaFlow API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

# WebSocket endpoint for real-time features
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "timer_update":
                # Broadcast timer updates to all connected clients of this user
                await manager.send_personal_message(json.dumps({
                    "type": "timer_update",
                    "data": message_data.get("data")
                }), client_id)
            elif message_data.get("type") == "ai_chat":
                # Handle AI chat streaming (will be implemented in ai service)
                await manager.send_personal_message(json.dumps({
                    "type": "ai_response",
                    "data": "Processing your request..."
                }), client_id)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)