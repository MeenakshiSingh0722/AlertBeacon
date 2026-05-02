from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from typing import List, Optional
from app.database import get_db
from app.models.incident import Incident, IncidentStatus, Category, SeverityLabel
from app.schemas.incident_schema import IncidentRead, IncidentCreate, IncidentUpdate, IncidentMapRead, IncidentStats
from app.services.incident_pipeline import process_raw_crisis_input, update_incident_status
from uuid import UUID
from app.api.deps import get_current_user, get_optional_current_user, require_admin
from app.config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/incidents", tags=["Incidents"])

# Pydantic models for API requests
class AnalyzeRequest(BaseModel):
    raw_text: str
    source_url: Optional[str] = None
    source_type: str = "manual"

class StatusUpdateRequest(BaseModel):
    status: IncidentStatus

@router.post("/analyze", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
async def analyze_crisis(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Analyze raw text for crisis detection and create incident if crisis detected."""
    try:
        incident = await process_raw_crisis_input(
            raw_text=request.raw_text,
            source_url=request.source_url,
            source_type=request.source_type
        )
        
        if not incident:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text does not describe a crisis situation"
            )
        
        return incident
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/", response_model=List[IncidentRead])
async def get_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    severity_label: Optional[SeverityLabel] = Query(None, alias="severity_label"),
    category: Optional[Category] = Query(None, alias="category"),
    status: Optional[IncidentStatus] = Query(None, alias="status"),
    search: Optional[str] = Query(None, alias="search"),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[any] = Depends(get_optional_current_user)
):
    """Get paginated incidents with filtering."""
    if not settings.DEBUG and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    offset = (page - 1) * limit
    query = select(Incident)
    
    if status:
        query = query.where(Incident.status == status)
    if category:
        query = query.where(Incident.category == category)
    if severity_label:
        query = query.where(Incident.severity_label == severity_label)
    if search:
        query = query.where(Incident.title.ilike(f"%{search}%") | Incident.description.ilike(f"%{search}%"))
    
    query = query.offset(offset).limit(limit).order_by(Incident.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/map", response_model=List[IncidentMapRead])
async def get_map_incidents(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[any] = Depends(get_optional_current_user)
):
    """Compact view for map pins. Public if DEBUG=true."""
    if not settings.DEBUG and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    query = select(Incident).where(Incident.status != IncidentStatus.RESOLVED)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/stats", response_model=IncidentStats)
async def get_incident_stats(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[any] = Depends(get_optional_current_user)
):
    """Aggregate KPI stats. Public if DEBUG=true."""
    if not settings.DEBUG and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

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
async def get_incident(
    incident_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[any] = Depends(get_optional_current_user)
):
    if not settings.DEBUG and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

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

@router.patch("/{incident_id}/status", response_model=IncidentRead)
async def update_incident_status_endpoint(
    incident_id: UUID,
    request: StatusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Update incident status."""
    updated_incident = await update_incident_status(str(incident_id), request.status)
    
    if not updated_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return updated_incident

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
