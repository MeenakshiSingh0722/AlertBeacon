import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    NGO = "ngo"
    RESPONDER = "responder"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False) # Added for auth
    role = Column(Enum(UserRole), default=UserRole.NGO)
    notification_prefs = Column(JSON, default=dict)
    coverage_area = Column(JSON, nullable=True) # GeoJSON polygon or circle
    api_key = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
