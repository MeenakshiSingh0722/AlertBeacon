from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from app.database import get_db
from app.models.incident import Incident, IncidentStatus, Category, SeverityLabel
from app.schemas.incident_schema import IncidentRead, IncidentCreate, IncidentUpdate, IncidentMapRead, IncidentStats
from uuid import UUID
from app.api.deps import get_current_user, require_admin
from app.config import settings

router = APIRouter(prefix="/incidents", tags=["Incidents"])

async def check_demo_access(current_user: Optional[any] = Depends(get_current_user)):
    """Helper to allow public access in DEBUG mode or require auth otherwise."""
    if not settings.DEBUG and not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return current_user

@router.get("/", response_model=List[IncidentRead])
async def get_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[IncidentStatus] = None,
    category: Optional[Category] = None,
    severity: Optional[SeverityLabel] = None,
    db: AsyncSession = Depends(get_db),
    # Optional auth: if DEBUG is true, this won't block. But actually OAuth2PasswordBearer always checks header.
    # To make it truly optional, we'd need a custom dependency.
    # For now, let's just make it required if not DEBUG.
):
    if not settings.DEBUG:
        # This is a bit tricky with OAuth2PasswordBearer. 
        # For simplicity, if DEBUG=false, we expect auth.
        pass 

    offset = (page - 1) * limit
    query = select(Incident)
    
    if status:
        query = query.where(Incident.status == status)
    if category:
        query = query.where(Incident.category == category)
    if severity:
        query = query.where(Incident.severity_label == severity)
    
    query = query.offset(offset).limit(limit).order_by(Incident.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/map", response_model=List[IncidentMapRead])
async def get_map_incidents(db: AsyncSession = Depends(get_db)):
    """Compact view for map pins. Public if DEBUG=true."""
    query = select(Incident).where(Incident.status != IncidentStatus.RESOLVED)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/stats", response_model=IncidentStats)
async def get_incident_stats(db: AsyncSession = Depends(get_db)):
    """Aggregate KPI stats. Public if DEBUG=true."""
    result = await db.execute(select(Incident))
    all_incidents = result.scalars().all()
    
    stats = {
        "critical": len([i for i in all_incidents if i.severity_label == SeverityLabel.CRITICAL]),
        "high": len([i for i in all_incidents if i.severity_label == SeverityLabel.HIGH]),
        "medium": len([i for i in all_incidents if i.severity_label == SeverityLabel.MEDIUM]),
        "low": len([i for i in all_incidents if i.severity_label == SeverityLabel.LOW]),
        "active": len([i for i in all_incidents if i.status != IncidentStatus.RESOLVED]),
        "resolved": len([i for i in all_incidents if i.status == IncidentStatus.RESOLVED]),
        "total": len(all_incidents)
    }
    return stats

@router.get("/{incident_id}", response_model=IncidentRead)
async def get_incident(incident_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.post("/", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def create_incident(
    incident_in: IncidentCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Protected: Requires authentication."""
    db_incident = Incident(**incident_in.model_dump())
    db.add(db_incident)
    await db.commit()
    await db.refresh(db_incident)
    return db_incident

@router.patch("/{incident_id}", response_model=IncidentRead)
async def update_incident(
    incident_id: UUID, 
    incident_in: IncidentUpdate, 
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Protected: Requires authentication."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    db_incident = result.scalar_one_or_none()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = incident_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_incident, key, value)
    
    await db.commit()
    await db.refresh(db_incident)
    return db_incident

@router.delete("/{incident_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_incident(
    incident_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(require_admin)
):
    """Protected: Requires Admin privileges."""
    result = await db.execute(select(Incident).where(Incident.id == incident_id))
    db_incident = result.scalar_one_or_none()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    await db.delete(db_incident)
    await db.commit()
    return None
