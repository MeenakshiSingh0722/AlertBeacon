import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from loguru import logger
from app.services.ai_analysis_service import ai_analysis_service
from app.utils.severity_scorer import score_from_ai_factors
from app.models.incident import Incident, SourceType, IncidentStatus
from app.models.agent_log import AgentLog, AgentStatus
from app.models.alert import AlertNotification, AlertType, AlertStatus
from app.database import get_db
from app.services.websocket_service import websocket_service
import asyncio

async def process_raw_crisis_input(
    raw_text: str,
    source_url: Optional[str] = None,
    source_type: str = "manual"
) -> Optional[Incident]:
    """
    Process raw crisis input through the complete pipeline.
    
    Steps:
    1. AI analysis
    2. Crisis detection check
    3. Severity scoring
    4. Database creation
    5. Agent logging
    6. Alert generation for high/critical incidents
    7. WebSocket broadcasting
    
    Args:
        raw_text: Raw text to analyze
        source_url: Optional source URL
        source_type: Source type (manual, rss, news, social, demo)
    
    Returns:
        Created Incident object or None if not a crisis
    """
    start_time = datetime.utcnow()
    
    try:
        # Step 1: AI Analysis
        logger.info(f"Starting AI analysis for text: {raw_text[:100]}...")
        
        ai_result = await ai_analysis_service.analyze_crisis_text(raw_text, source_url)
        
        # Log AI analysis
        await log_agent_action(
            "AI_ANALYZER",
            "analyze_crisis_text",
            {"raw_text": raw_text[:200], "source_url": source_url},
            ai_result,
            datetime.utcnow(),
            AgentStatus.SUCCESS
        )
        
        # Step 2: Check if it's a crisis
        if not ai_result.get("is_crisis", False):
            logger.info("Text does not describe a crisis, skipping")
            await log_agent_action(
                "AI_ANALYZER",
                "crisis_check",
                {"is_crisis": False},
                {"result": "not_crisis"},
                datetime.utcnow(),
                AgentStatus.SUCCESS
            )
            return None
        
        # Step 3: Calculate severity score
        severity_factors = ai_result.get("severity_factors", {})
        severity_score, severity_label = score_from_ai_factors(severity_factors)
        
        # Log severity scoring
        await log_agent_action(
            "SEVERITY_SCORER",
            "calculate_severity",
            severity_factors,
            {"score": severity_score, "label": severity_label.value},
            datetime.utcnow(),
            AgentStatus.SUCCESS
        )
        
        # Step 4: Create incident in database
        async for db in get_db():
            try:
                incident = Incident(
                    title=ai_result.get("title", "Untitled Incident"),
                    description=ai_result.get("ai_summary", ""),
                    raw_content=raw_text,
                    source_url=source_url,
                    source_type=SourceType(source_type),
                    category=ai_result.get("category"),
                    severity_score=severity_score,
                    severity_label=severity_label,
                    status=IncidentStatus.NEW,
                    location_name=ai_result.get("location_name"),
                    affected_count=ai_result.get("affected_count"),
                    confidence_score=ai_result.get("confidence_score"),
                    urgency_keywords=ai_result.get("urgency_keywords", []),
                    ai_summary=ai_result.get("ai_summary")
                )
                
                db.add(incident)
                await db.commit()
                await db.refresh(incident)
                
                logger.info(f"Created incident: {incident.id}")
                
                # Log incident creation
                await log_agent_action(
                    "INCIDENT_CREATOR",
                    "create_incident",
                    {"title": incident.title, "severity": severity_label.value},
                    {"incident_id": str(incident.id)},
                    datetime.utcnow(),
                    AgentStatus.SUCCESS
                )
                
                # Step 5: Create alerts for high/critical incidents
                if severity_label in [IncidentStatus.HIGH, IncidentStatus.CRITICAL]:
                    await create_alert_notifications(incident, severity_label)
                
                # Step 6: WebSocket broadcast
                await broadcast_incident_created(incident, severity_label)
                
                return incident
                
            except Exception as e:
                logger.error(f"Database error creating incident: {str(e)}")
                await db.rollback()
                
                # Log database error
                await log_agent_action(
                    "INCIDENT_CREATOR",
                    "create_incident",
                    {"error": str(e)},
                    {"status": "failed"},
                    datetime.utcnow(),
                    AgentStatus.FAILED
                )
                raise
                
    except Exception as e:
        logger.error(f"Pipeline processing failed: {str(e)}")
        
        # Log pipeline error
        await log_agent_action(
            "PIPELINE",
            "process_raw_crisis_input",
            {"error": str(e)},
            {"status": "failed"},
            datetime.utcnow(),
            AgentStatus.FAILED
        )
        
        return None

async def log_agent_action(
    agent_name: str,
    action: str,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any],
    timestamp: datetime,
    status: AgentStatus
) -> None:
    """Log agent action to database."""
    try:
        async for db in get_db():
            agent_log = AgentLog(
                agent_name=agent_name,
                action=action,
                input_data=input_data,
                output_data=output_data,
                processing_time_ms=0,  # Could be calculated if needed
                status=status,
                created_at=timestamp
            )
            
            db.add(agent_log)
            await db.commit()
            break
            
    except Exception as e:
        logger.error(f"Failed to log agent action: {str(e)}")

async def create_alert_notifications(incident: Incident, severity_label) -> None:
    """Create alert notifications for high/critical incidents."""
    try:
        async for db in get_db():
            # Create dashboard alert
            dashboard_alert = AlertNotification(
                incident_id=incident.id,
                alert_type=AlertType.DASHBOARD,
                status=AlertStatus.PENDING,
                message=f"{severity_label.value.upper()}: {incident.title}"
            )
            
            # Create popup alert for critical incidents
            popup_alert = None
            if severity_label == IncidentStatus.CRITICAL:
                popup_alert = AlertNotification(
                    incident_id=incident.id,
                    alert_type=AlertType.POPUP,
                    status=AlertStatus.PENDING,
                    message=f"CRITICAL ALERT: {incident.title}"
                )
            
            db.add(dashboard_alert)
            if popup_alert:
                db.add(popup_alert)
            
            await db.commit()
            logger.info(f"Created alert notifications for incident {incident.id}")
            break
            
    except Exception as e:
        logger.error(f"Failed to create alert notifications: {str(e)}")

async def broadcast_incident_created(incident: Incident, severity_label) -> None:
    """Broadcast incident creation via WebSocket."""
    try:
        # Broadcast to all connected clients
        websocket_data = {
            "event_type": "incident_created",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "id": str(incident.id),
                "title": incident.title,
                "category": incident.category.value if incident.category else "other",
                "severity_label": incident.severity_label.value,
                "severity_score": float(incident.severity_score),
                "location_name": incident.location_name,
                "ai_summary": incident.ai_summary,
                "latitude": float(incident.latitude) if incident.latitude else None,
                "longitude": float(incident.longitude) if incident.longitude else None,
                "created_at": incident.created_at.isoformat()
            }
        }
        
        # If high/critical, also send critical alert event
        if severity_label in [IncidentStatus.HIGH, IncidentStatus.CRITICAL]:
            critical_data = {
                "event_type": "critical_alert",
                "timestamp": datetime.utcnow().isoformat(),
                "data": websocket_data["data"]
            }
            await websocket_service.broadcast_to_all(critical_data)
        
        # Always send general incident created event
        await websocket_service.broadcast_to_all(websocket_data)
        
        logger.info(f"Broadcasted incident creation: {incident.id}")
        
    except Exception as e:
        logger.error(f"Failed to broadcast incident creation: {str(e)}")

async def update_incident_status(
    incident_id: str,
    new_status: IncidentStatus
) -> Optional[Incident]:
    """Update incident status and broadcast changes."""
    try:
        async for db in get_db():
            # Get incident
            incident = await db.get(Incident, incident_id)
            if not incident:
                return None
            
            old_status = incident.status
            incident.status = new_status
            
            # Set resolved_at if resolving
            if new_status == IncidentStatus.RESOLVED:
                incident.resolved_at = datetime.utcnow()
            
            await db.commit()
            await db.refresh(incident)
            
            # Log status update
            await log_agent_action(
                "STATUS_UPDATER",
                "update_status",
                {"incident_id": incident_id, "old_status": old_status.value},
                {"new_status": new_status.value},
                datetime.utcnow(),
                AgentStatus.SUCCESS
            )
            
            # Broadcast status update
            websocket_data = {
                "event_type": "incident_status_updated",
                "timestamp": datetime.utcnow().isoformat(),
                "data": {
                    "id": str(incident.id),
                    "old_status": old_status.value,
                    "new_status": new_status.value,
                    "resolved_at": incident.resolved_at.isoformat() if incident.resolved_at else None
                }
            }
            
            await websocket_service.broadcast_to_all(websocket_data)
            
            logger.info(f"Updated incident {incident_id} status to {new_status.value}")
            return incident
            
    except Exception as e:
        logger.error(f"Failed to update incident status: {str(e)}")
        return None
