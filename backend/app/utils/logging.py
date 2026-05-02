import sys
import time
from loguru import logger
from fastapi import Request

def setup_logging():
    # Remove default logger
    logger.remove()
    
    # Add structured logging to stdout
    logger.add(
        sys.stdout,
        colorize=True,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )

async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"{request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.2f}ms"
    )
    
    return response
