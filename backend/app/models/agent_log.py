import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum

class AgentStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"

class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String(100), nullable=False)
    action = Column(String(255), nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    status = Column(Enum(AgentStatus), default=AgentStatus.SUCCESS)
    created_at = Column(DateTime, default=datetime.utcnow)
