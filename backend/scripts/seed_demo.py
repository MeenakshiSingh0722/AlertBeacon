import asyncio
import uuid
from datetime import datetime, timedelta
from sqlalchemy import delete
from app.database import AsyncSessionLocal, engine
from app.models.incident import Incident, IncidentStatus, Category, SeverityLabel, SourceType
from app.models.user import User, UserRole
from app.models.source import DataSource, SourceHealthStatus

import hashlib

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

async def seed_data():
    async with AsyncSessionLocal() as session:
        print("Cleaning up old data...")
        await session.execute(delete(Incident))
        await session.execute(delete(User))
        await session.execute(delete(DataSource))
        await session.commit()

        print("Seeding Users/NGOs...")
        users = [
            User(
                org_name="Red Cross India",
                email="india@redcross.org",
                hashed_password=hash_password("password123"),
                role=UserRole.NGO,
                notification_prefs={"categories": ["medical", "safety"], "min_severity": "high"}
            ),
            User(
                org_name="Global Food Bank",
                email="alerts@globalfood.org",
                hashed_password=hash_password("password123"),
                role=UserRole.NGO,
                notification_prefs={"categories": ["food"], "min_severity": "medium"}
            ),
            User(
                org_name="Disaster Management Admin",
                email="admin@alertbeacon.gov",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
                notification_prefs={"all": True}
            )
        ]
        session.add_all(users)

        print("Seeding Data Sources...")
        sources = [
            DataSource(name="NDMA RSS Feed", url="https://ndma.gov.in/rss", source_type="rss"),
            DataSource(name="ReliefWeb Global", url="https://reliefweb.int/updates/rss.xml", source_type="rss"),
            DataSource(name="Google News India", url="https://news.google.com/rss/search?q=crisis+india", source_type="rss"),
            DataSource(name="Twitter Crisis Monitor", url="api.twitter.com/v2/search", source_type="api", is_active=False),
            DataSource(name="Local News Scraper", url="localnews.in/disaster", source_type="scrape")
        ]
        session.add_all(sources)

        print("Seeding Incidents...")
        incidents = [
            # 1. Bihar Flood
            Incident(
                title="Severe Flooding in North Bihar",
                description="Heavy monsoon rains have caused the Kosi river to overflow, affecting 50,000 residents.",
                category=Category.SHELTER,
                severity_score=9.2,
                severity_label=SeverityLabel.CRITICAL,
                status=IncidentStatus.ACTIVE,
                location_name="Darbhanga, Bihar",
                latitude=26.11,
                longitude=85.89,
                affected_count=50000,
                ai_summary="Immediate evacuation needed for 12 villages. Severe infrastructure damage reported.",
                source_type=SourceType.NEWS
            ),
            # 2. Mumbai Medical
            Incident(
                title="Mass Casualty Incident: Mumbai Central",
                description="Stampede reported at railway station during peak hours. Local hospitals at capacity.",
                category=Category.MEDICAL,
                severity_score=9.5,
                severity_label=SeverityLabel.CRITICAL,
                status=IncidentStatus.ACTIVE,
                location_name="Mumbai Central, Maharashtra",
                latitude=18.96,
                longitude=72.81,
                affected_count=200,
                ai_summary="Hospitals requesting urgent blood donations and emergency medical staff.",
                source_type=SourceType.SOCIAL
            ),
            # 3. Kerala Landslide
            Incident(
                title="Landslide in Wayanad District",
                description="Debris flow has blocked major highway. Rescue operations underway.",
                category=Category.INFRASTRUCTURE,
                severity_score=7.8,
                severity_label=SeverityLabel.HIGH,
                status=IncidentStatus.ACTIVE,
                location_name="Wayanad, Kerala",
                latitude=11.68,
                longitude=76.08,
                affected_count=1500,
                ai_summary="Connectivity lost to 3 hills. Earthmovers required for road clearance.",
                source_type=SourceType.RSS
            ),
            # 4. Delhi Heatwave
            Incident(
                title="Severe Heatwave Warning: Delhi NCR",
                description="Temperatures reaching 48°C. High risk for vulnerable populations.",
                category=Category.SHELTER,
                severity_score=6.5,
                severity_label=SeverityLabel.HIGH,
                status=IncidentStatus.ACTIVE,
                location_name="New Delhi, Delhi",
                latitude=28.61,
                longitude=77.20,
                affected_count=100000,
                ai_summary="Urgent need for cooling centers and hydration points in low-income colonies.",
                source_type=SourceType.NEWS
            ),
            # 5. Assam Food Shortage
            Incident(
                title="Food Scarcity in Relief Camps",
                description="Displaced families in Majuli camp reporting shortage of dry rations.",
                category=Category.FOOD,
                severity_score=8.1,
                severity_label=SeverityLabel.HIGH,
                status=IncidentStatus.ACTIVE,
                location_name="Majuli, Assam",
                latitude=26.96,
                longitude=94.12,
                affected_count=2000,
                ai_summary="3 camps reporting zero grain stock. Immediate supply chain intervention needed.",
                source_type=SourceType.MANUAL
            ),
        ]
        
        # Add 15 more varied incidents to reach 20
        for i in range(15):
            incidents.append(Incident(
                title=f"Minor Crisis Event #{i+1}",
                description=f"Automated demo description for event {i+1}.",
                category=list(Category)[i % len(Category)],
                severity_score=4.0 + (i % 4),
                severity_label=list(SeverityLabel)[i % len(SeverityLabel)],
                status=IncidentStatus.RESOLVED if i > 10 else IncidentStatus.NEW,
                location_name=f"City_{i}, India",
                latitude=20.0 + i,
                longitude=75.0 + i,
                affected_count=100 * i,
                ai_summary="System-generated summary for demo purposes.",
                source_type=SourceType.RSS
            ))

        session.add_all(incidents)
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
