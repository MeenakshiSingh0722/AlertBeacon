from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import websocket_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/incidents")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time incident updates.
    Handles connection lifecycle and client heartbeats (ping/pong).
    """
    await websocket_service.connect(websocket)
    try:
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            
            # Simple ping/pong mechanism for keepalive
            if data == "ping":
                await websocket.send_text("pong")
                
    except WebSocketDisconnect:
        logger.info("Client disconnected normally")
        websocket_service.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        websocket_service.disconnect(websocket)
