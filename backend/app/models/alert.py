import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base
import enum

class AlertType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    WEBHOOK = "webhook"

class AlertStatus(str, enum.Enum):
    SENT = "sent"
    FAILED = "failed"
    READ = "read"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    incident_id = Column(UUID(as_uuid=True), ForeignKey("incidents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    alert_type = Column(Enum(AlertType), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(AlertStatus), default=AlertStatus.SENT)
    response_action = Column(String(255), nullable=True)
