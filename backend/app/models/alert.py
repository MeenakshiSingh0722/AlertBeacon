import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class AlertType(str, enum.Enum):
    POPUP = "popup"
    EMAIL = "email"
    SMS = "sms"
    DASHBOARD = "dashboard"

class AlertStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    READ = "read"

class AlertNotification(Base):
    __tablename__ = "alert_notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.PENDING)
    message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
