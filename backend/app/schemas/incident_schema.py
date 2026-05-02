from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.models.incident import SourceType, Category, SeverityLabel, IncidentStatus

class IncidentBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    source_type: SourceType = SourceType.RSS
    category: Optional[Category] = None
    severity_score: float = 0.0
    severity_label: SeverityLabel = SeverityLabel.LOW
    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    affected_count: Optional[int] = None
    confidence_score: Optional[float] = None
    tags: List[str] = []
    ai_summary: Optional[str] = None

class IncidentCreate(IncidentBase):
    raw_content: Optional[str] = None

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[IncidentStatus] = None
    severity_score: Optional[float] = None
    severity_label: Optional[SeverityLabel] = None
    category: Optional[Category] = None
    ai_summary: Optional[str] = None

class IncidentRead(IncidentBase):
    id: UUID
    status: IncidentStatus
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class IncidentMapRead(BaseModel):
    id: UUID
    title: str
    severity_label: SeverityLabel
    severity_score: float
    category: Optional[Category]
    latitude: float
    longitude: float
    location_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class IncidentStats(BaseModel):
    critical: int
    high: int
    medium: int
    low: int
    active: int
    resolved: int
    total: int
