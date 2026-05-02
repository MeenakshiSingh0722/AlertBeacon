from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models.source import DataSource
from app.schemas.source_schema import SourceRead, SourceHealth
from app.api.deps import get_current_user

router = APIRouter(prefix="/sources", tags=["Sources"])

@router.get("/", response_model=List[SourceRead])
async def get_sources(
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Returns all data sources."""
    result = await db.execute(select(DataSource))
    return result.scalars().all()

@router.get("/{source_id}/health", response_model=SourceHealth)
async def get_source_health(
    source_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Returns the health status of a specific source."""
    result = await db.execute(select(DataSource).where(DataSource.id == source_id))
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return {
        "id": source.id,
        "health_status": source.health_status,
        "last_scraped": source.last_scraped
    }
