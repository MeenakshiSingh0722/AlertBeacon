import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, Integer, DateTime, Enum, DECIMAL, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum

class SourceType(str, enum.Enum):
    RSS = "rss"
    NEWS = "news"
    SOCIAL = "social"
    MANUAL = "manual"

class Category(str, enum.Enum):
    MEDICAL = "medical"
    FOOD = "food"
    SHELTER = "shelter"
    INFRASTRUCTURE = "infra"
    SAFETY = "safety"

class SeverityLabel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IncidentStatus(str, enum.Enum):
    NEW = "new"
    ACTIVE = "active"
    RESOLVED = "resolved"

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    raw_content = Column(Text, nullable=True)
    source_url = Column(String(1000), nullable=True)
    source_type = Column(Enum(SourceType), default=SourceType.RSS)
    category = Column(Enum(Category), nullable=True)
    severity_score = Column(Float, default=0.0)
    severity_label = Column(Enum(SeverityLabel), default=SeverityLabel.LOW)
    status = Column(Enum(IncidentStatus), default=IncidentStatus.NEW)
    location_name = Column(String(255), nullable=True)
    latitude = Column(DECIMAL(10, 8), nullable=True)
    longitude = Column(DECIMAL(11, 8), nullable=True)
    affected_count = Column(Integer, nullable=True)
    confidence_score = Column(Float, default=0.0)
    tags = Column(JSON, default=list)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
