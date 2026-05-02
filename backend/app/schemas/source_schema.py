from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID
from app.models.source import SourceHealthStatus

class SourceBase(BaseModel):
    name: str
    url: str
    source_type: str = "rss"
    is_active: bool = True
    scrape_interval: int = 5

class SourceCreate(SourceBase):
    pass

class SourceRead(SourceBase):
    id: UUID
    last_scraped: Optional[datetime] = None
    health_status: SourceHealthStatus

    class Config:
        from_attributes = True

class SourceHealth(BaseModel):
    id: UUID
    health_status: SourceHealthStatus
    last_scraped: Optional[datetime]
