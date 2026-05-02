import json
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.incident import Incident, Category, SeverityLabel, IncidentStatus, SourceType
from app.services.websocket_service import websocket_service
from app.services.incident_pipeline import process_raw_crisis_input
from app.config import settings
from datetime import datetime
import uuid

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/seed", status_code=status.HTTP_201_CREATED)
async def seed_demo_data(db: AsyncSession = Depends(get_db)):
    """Seed demo data with realistic Indian crisis scenarios."""
    if not settings.DEMO_MODE:
        return {"message": "Demo mode is disabled. Set DEMO_MODE=True in .env"}

    demo_incidents = [
        {
            "raw_text": "Major medical emergency at KEM Hospital Mumbai - over 50 patients affected due to oxygen supply shortage, immediate medical assistance required",
            "source_url": "https://timesofindia.indiatimes.com/city/mumbai/hospital-crisis",
            "source_type": "demo"
        },
        {
            "raw_text": "Severe flooding in Bihar affecting 5000 people in Patna district, food shortage crisis emerging, urgent relief supplies needed",
            "source_url": "https://hindustantimes.com/india/bihar-floods",
            "source_type": "demo"
        },
        {
            "raw_text": "Infrastructure collapse in Kerala - bridge collapse on NH-66 near Kozhikode, traffic blocked, emergency services on site",
            "source_url": "https://thehindu.com/news/kerala/bridge-collapse",
            "source_type": "demo"
        },
        {
            "raw_text": "Shelter crisis in Delhi - over 2000 homeless people affected by cold wave, emergency shelters needed urgently",
            "source_url": "https://ndtv.com/delhi/cold-wave-shelter",
            "source_type": "demo"
        },
        {
            "raw_text": "Food shortage outbreak in Assam - 1000 families affected by supply chain disruption, immediate food assistance required",
            "source_url": "https://indianexpress.com/assam/food-crisis",
            "source_type": "demo"
        }
    ]

    created_incidents = []
    for incident_data in demo_incidents:
        incident = await process_raw_crisis_input(
            raw_text=incident_data["raw_text"],
            source_url=incident_data["source_url"],
            source_type=incident_data["source_type"]
        )
        if incident:
            created_incidents.append(str(incident.id))

    return {
        "message": f"Seeded {len(created_incidents)} demo incidents",
        "incident_ids": created_incidents
    }

@router.post("/simulate-crisis", status_code=status.HTTP_201_CREATED)
async def simulate_crisis(db: AsyncSession = Depends(get_db)):
    """Create a new high or critical incident and broadcast it."""
    if not settings.DEMO_MODE:
        return {"message": "Demo mode is disabled. Set DEMO_MODE=True in .env"}

    # Use a guaranteed crisis scenario
    crisis_text = "Massive fire outbreak in Delhi's Chandni Chowk market - hundreds trapped, immediate evacuation required"
    
    incident = await process_raw_crisis_input(
        raw_text=crisis_text,
        source_url="https://emergency-alerts.gov.in/simulate",
        source_type="demo"
    )
    
    if incident:
        return {
            "message": "Crisis incident created and broadcasted",
            "incident_id": str(incident.id),
            "severity": incident.severity_label.value,
            "title": incident.title
        }
    else:
        # Fallback: create a manual incident
        from app.models.incident import Incident, Category, SeverityLabel, IncidentStatus, SourceType
        from datetime import datetime
        
        manual_incident = Incident(
            title="Massive Fire Outbreak - Delhi Chandni Chowk",
            description="Major fire incident in crowded market area with hundreds trapped",
            raw_content=crisis_text,
            source_url="https://emergency-alerts.gov.in/simulate",
            source_type=SourceType.DEMO,
            category=Category.SAFETY,
            severity_score=0.9,
            severity_label=SeverityLabel.CRITICAL,
            status=IncidentStatus.NEW,
            location_name="Delhi, India",
            latitude=28.7041,
            longitude=77.1025,
            affected_count=500,
            confidence_score=0.95,
            ai_summary="Critical fire incident requiring immediate evacuation and emergency response",
            created_at=datetime.utcnow()
        )
        
        db.add(manual_incident)
        await db.commit()
        await db.refresh(manual_incident)
        
        return {
            "message": "Crisis incident created and broadcasted",
            "incident_id": str(manual_incident.id),
            "severity": manual_incident.severity_label.value,
            "title": manual_incident.title
        }

@router.post("/simulate-incident", status_code=status.HTTP_201_CREATED)
async def simulate_incident(db: AsyncSession = Depends(get_db)):
    """Creates a realistic high/critical incident and broadcasts it via WebSocket."""
    if not settings.DEMO_MODE:
        return {"message": "Demo mode is disabled. Set DEMO_MODE=True in .env"}

    # Realistic mock incident
    incident_id = uuid.uuid4()
    incident_data = {
        "id": incident_id,
        "title": "URGENT: Flash Flood Alert in Mumbai Coastal Regions",
        "description": "Rising water levels reported in Juhu and Versova. Residents advised to move to higher ground.",
        "category": Category.SHELTER,
        "severity_score": 0.92,
        "severity_label": SeverityLabel.CRITICAL,
        "status": IncidentStatus.NEW,
        "location_name": "Mumbai, Maharashtra",
        "latitude": 19.1176,
        "longitude": 72.8273,
        "affected_count": 500,
        "confidence_score": 0.95,
        "ai_summary": "Critical flash flood risk in Mumbai coastal areas requiring immediate evacuation of low-lying zones.",
        "created_at": datetime.utcnow()
    }

    db_incident = Incident(**incident_data)
    db.add(db_incident)
    await db.commit()
    await db.refresh(db_incident)

    # Prepare WS message
    ws_message = {
        "type": "new_incident",
        "payload": {
            "id": str(db_incident.id),
            "title": db_incident.title,
            "category": db_incident.category.value,
            "severity_label": db_incident.severity_label.value,
            "latitude": float(db_incident.latitude),
            "longitude": float(db_incident.longitude),
            "location_name": db_incident.location_name,
            "created_at": db_incident.created_at.isoformat()
        }
    }

    # Broadcast
    await websocket_service.broadcast(json.dumps(ws_message))

    return {"status": "success", "incident_id": str(db_incident.id)}
