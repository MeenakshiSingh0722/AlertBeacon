import asyncio
import uuid
from datetime import datetime, timedelta
from sqlalchemy import select, func
from app.database import AsyncSessionLocal
from app.models.incident import Incident, IncidentStatus, Category, SeverityLabel, SourceType
from app.models.user import User, UserRole
from app.models.source import DataSource, SourceHealthStatus
from app.utils.security import get_password_hash
from loguru import logger

async def seed_demo_data_if_empty():
    async with AsyncSessionLocal() as session:
        # Check if users exist
        user_count = await session.execute(select(func.count(User.id)))
        if user_count.scalar_one() > 0:
            logger.info("Database already seeded. Skipping demo auto-seed.")
            return

        logger.info("Auto-seeding demo data...")
        
        # 1. Users
        users = [
            User(
                org_name="Red Cross India",
                email="admin@alertbeacon.com",
                hashed_password=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                notification_prefs={"categories": ["medical", "safety", "shelter"], "threshold": "low", "channels": ["email"]}
            ),
            User(
                org_name="Global Food Bank",
                email="food@ngo.org",
                hashed_password=get_password_hash("password123"),
                role=UserRole.NGO,
                notification_prefs={"categories": ["food"], "threshold": "medium", "channels": ["email"]}
            )
        ]
        session.add_all(users)

        # 2. Sources
        sources = [
            DataSource(name="NDMA RSS", url="https://ndma.gov.in/rss", source_type="rss", health_status=SourceHealthStatus.HEALTHY),
            DataSource(name="ReliefWeb Global", url="https://reliefweb.int/updates/rss.xml", source_type="rss", health_status=SourceHealthStatus.HEALTHY),
            DataSource(name="Mumbai Crisis Monitor", url="https://mumbai.gov/alerts/rss", source_type="rss", health_status=SourceHealthStatus.DEGRADED)
        ]
        session.add_all(sources)

        # 3. Incidents
        incidents = [
            Incident(
                title="Monsoon Flood Alert: Bihar North Regions",
                description="Rivers flowing above danger mark. 20,000 residents displaced.",
                category=Category.SHELTER,
                severity_score=0.88,
                severity_label=SeverityLabel.CRITICAL,
                status=IncidentStatus.ACTIVE,
                location_name="Darbhanga, Bihar",
                latitude=26.11,
                longitude=85.89,
                affected_count=20000,
                ai_summary="Immediate shelter and food supplies required for displaced families in Bihar.",
                source_type=SourceType.NEWS,
                created_at=datetime.utcnow() - timedelta(hours=5)
            ),
            Incident(
                title="Medical Emergency: Cholera Outbreak in Rural Assam",
                description="Local clinics reporting high volume of water-borne diseases.",
                category=Category.MEDICAL,
                severity_score=0.75,
                severity_label=SeverityLabel.HIGH,
                status=IncidentStatus.ACTIVE,
                location_name="Guwahati, Assam",
                latitude=26.14,
                longitude=91.73,
                affected_count=150,
                ai_summary="Clean water and medical teams needed to contain the outbreak.",
                source_type=SourceType.NEWS,
                created_at=datetime.utcnow() - timedelta(days=1)
            )
        ]
        session.add_all(incidents)

        await session.commit()
        logger.info("Demo data seeded successfully.")
