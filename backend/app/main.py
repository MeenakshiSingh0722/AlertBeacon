import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.pipeline import router as pipeline_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.auth import router as auth_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.users import router as users_router
from app.api.routes.sources import router as sources_router
from app.api.routes.demo import router as demo_router
from app.api.routes.websocket import router as ws_router
from app.services.websocket_service import websocket_service
from app.config import settings
from app.utils.logging import setup_logging, logging_middleware
from app.utils.exceptions import global_exception_handler, sqlalchemy_exception_handler
from app.utils.demo_seeder import seed_demo_data_if_empty
from sqlalchemy.exc import SQLAlchemyError
from contextlib import asynccontextmanager
from fastapi import Request

# Initialize logging
setup_logging()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-seed demo data if enabled
    if settings.DEMO_MODE:
        await seed_demo_data_if_empty()

    # Start Redis listener for WebSockets
    task = asyncio.create_task(websocket_service.listen_to_redis())
    yield
    # Clean up
    task.cancel()

app = FastAPI(title="AlertBeacon API", lifespan=lifespan)

# Middlewares
app.middleware("http")(logging_middleware)

# Exception handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)

# Health Check (Public)
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "alertbeacon-api"
    }

# CORS middleware for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000", 
        "http://localhost"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents_router, prefix="/api/v1")
app.include_router(pipeline_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(sources_router, prefix="/api/v1")
app.include_router(demo_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/api/v1")

@app.get("/")
async def root(request: Request):
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for documentation."}
