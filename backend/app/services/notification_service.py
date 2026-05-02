import logging
import json
from typing import List, Dict, Any
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.incident import Incident
from app.models.alert import Alert, AlertType, AlertStatus
from app.models.agent_log import AgentLog, AgentStatus
from app.config import settings

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.email_enabled = bool(settings.SENDGRID_API_KEY)
        self.sms_enabled = bool(settings.TWILIO_SID and settings.TWILIO_AUTH_TOKEN)

    async def process_incident(self, incident: Incident):
        """
        Matches a new incident against user preferences and creates alert records.
        """
        logger.info(f"Processing notifications for incident: {incident.id}")
        alerts_created = 0
        
        async with AsyncSessionLocal() as session:
            # 1. Fetch all potential notification recipients (NGOs and Responders)
            # In a large system, you'd filter this query more aggressively.
            result = await session.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                if await self._should_notify(user, incident):
                    # Create Alert Records for each preferred channel
                    prefs = user.notification_prefs or {}
                    channels = prefs.get("channels", ["email"]) # Default to email
                    
                    for channel in channels:
                        alert_type = AlertType(channel) if channel in [c.value for c in AlertType] else AlertType.EMAIL
                        
                        new_alert = Alert(
                            incident_id=incident.id,
                            user_id=user.id,
                            alert_type=alert_type,
                            status=AlertStatus.SENT
                        )
                        session.add(new_alert)
                        
                        # 4. Mock sending
                        await self._send_notification(user, incident, alert_type)
                        alerts_created += 1

            # 6. Add agent log for notification decision
            log = AgentLog(
                agent_name="NotificationEngine",
                action="process_incident",
                input_data={"incident_id": str(incident.id)},
                output_data={"alerts_created": alerts_created},
                status=AgentStatus.SUCCESS
            )
            session.add(log)
            await session.commit()
            
        logger.info(f"Notification processing complete. Created {alerts_created} alerts.")

    async def _should_notify(self, user: User, incident: Incident) -> bool:
        """
        Matching logic based on user preferences.
        """
        prefs = user.notification_prefs or {}
        
        # 1. Category match
        pref_categories = prefs.get("categories", [])
        if pref_categories and str(incident.category) not in pref_categories:
            return False
            
        # 2. Severity threshold
        min_severity = prefs.get("min_severity", 0.0)
        if incident.severity_score < min_severity:
            return False
            
        # 3. Coverage area match (Loose matching)
        coverage = user.coverage_area or {}
        if coverage:
            # Simple check: if location_name is in user's coverage list or string match
            allowed_locations = coverage.get("locations", [])
            if allowed_locations:
                match = any(loc.lower() in incident.location_name.lower() for loc in allowed_locations)
                if not match:
                    return False
            
            # Simple radius check if center and radius are defined
            center = coverage.get("center") # [lat, lng]
            radius = coverage.get("radius_km")
            if center and radius and incident.latitude and incident.longitude:
                from geopy.distance import geodesic
                dist = geodesic(center, (incident.latitude, incident.longitude)).km
                if dist > radius:
                    return False

        return True

    async def _send_notification(self, user: User, incident: Incident, channel: AlertType):
        """
        Dispatches the actual notification via external providers or mocks it.
        """
        msg = f"ALERT: {incident.severity_label} crisis in {incident.location_name}. {incident.title}"
        
        if channel == AlertType.EMAIL:
            if self.email_enabled:
                logger.info(f"Sending real email to {user.email} via SendGrid...")
                # Implementation with SendGrid would go here
            else:
                logger.info(f"[MOCK EMAIL] To: {user.email} | Content: {msg}")
                
        elif channel == AlertType.SMS:
            if self.sms_enabled:
                logger.info(f"Sending real SMS to user via Twilio...")
                # Implementation with Twilio would go here
            else:
                logger.info(f"[MOCK SMS] To: {user.email} | Content: {msg}")

notification_service = NotificationService()
