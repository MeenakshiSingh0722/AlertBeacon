import json
import asyncio
from typing import List
from fastapi import WebSocket
from redis.asyncio import Redis
from loguru import logger
from app.config import settings

class WebSocketService:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.redis_url = settings.REDIS_URL
        self.channel = "incidents:live"

    async def connect(self, websocket: WebSocket):
        """Accepts a new WebSocket connection and adds it to the active list."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        """Removes a WebSocket connection from the active list."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        """Broadcasts a message to all currently connected WebSocket clients."""
        if not self.active_connections:
            return

        logger.debug(f"Broadcasting message to {len(self.active_connections)} clients")
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {str(e)}")
                # We don't disconnect here to avoid mutating list during iteration
                # but in a real app you'd mark for removal

    async def listen_to_redis(self):
        """
        Background task that subscribes to the Redis 'incidents:live' channel
        and broadcasts any received messages to all connected WebSocket clients.
        """
        while True:
            try:
                logger.info(f"Connecting to Redis for Pub/Sub: {self.redis_url}")
                redis = Redis.from_url(self.redis_url, decode_responses=True)
                pubsub = redis.pubsub()
                await pubsub.subscribe(self.channel)
                
                logger.info(f"Redis Pub/Sub listener active on channel: {self.channel}")
                
                async for message in pubsub.listen():
                    if message["type"] == "message":
                        await self.broadcast(message["data"])
                        
            except Exception as e:
                logger.error(f"Redis Pub/Sub Connection Error: {str(e)}")
                await asyncio.sleep(5)  # Wait before reconnecting

websocket_service = WebSocketService()
