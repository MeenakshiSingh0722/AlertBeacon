import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.auth import router as auth_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.websocket import router as ws_router
from app.services.websocket_service import websocket_service
from app.config import settings
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start Redis listener for WebSockets
    task = asyncio.create_task(websocket_service.listen_to_redis())
    yield
    # Clean up
    task.cancel()

app = FastAPI(title="AlertBeacon API", lifespan=lifespan)

# CORS middleware for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router, prefix="/api/v1")
app.include_router(pipeline_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for documentation."}

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "alertbeacon-api"
    }
