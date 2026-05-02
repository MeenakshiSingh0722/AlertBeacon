from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.alert import AlertType, AlertStatus

class AlertRead(BaseModel):
    id: UUID
    incident_id: UUID
    user_id: UUID
    alert_type: AlertType
    sent_at: datetime
    status: AlertStatus
    response_action: Optional[str] = None

    class Config:
        from_attributes = True

class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    response_action: Optional[str] = None
