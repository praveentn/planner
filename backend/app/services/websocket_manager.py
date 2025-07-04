# backend/app/services/websocket_manager.py
from fastapi import WebSocket
from typing import Dict, List
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        # Store active connections by client_id (usually user_id)
        self.active_connections: Dict[str, WebSocket] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except:
                # Connection might be closed, remove it
                self.disconnect(client_id)
                
    async def broadcast_message(self, message: str):
        for client_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, client_id)
            
    async def send_timer_update(self, client_id: str, timer_data: dict):
        """Send timer update to specific user."""
        message = {
            "type": "timer_update",
            "data": timer_data,
            "timestamp": timer_data.get("current_time")
        }
        await self.send_personal_message(json.dumps(message), client_id)
        
    async def send_notification(self, client_id: str, notification: dict):
        """Send notification to specific user."""
        message = {
            "type": "notification",
            "data": notification,
            "timestamp": notification.get("timestamp")
        }
        await self.send_personal_message(json.dumps(message), client_id)
        
    async def send_ai_response_stream(self, client_id: str, response_chunk: str, is_final: bool = False):
        """Send streaming AI response to specific user."""
        message = {
            "type": "ai_response_stream",
            "data": {
                "chunk": response_chunk,
                "is_final": is_final
            }
        }
        await self.send_personal_message(json.dumps(message), client_id)
        
    def get_connected_users(self) -> List[str]:
        """Get list of currently connected user IDs."""
        return list(self.active_connections.keys())
        
    def is_user_connected(self, client_id: str) -> bool:
        """Check if a specific user is connected."""
        return client_id in self.active_connections