import logging
import json
from typing import List, Dict, Any
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.incident import Incident, SeverityLabel
from app.models.alert import AlertNotification, AlertType, AlertStatus
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
            # 1. Fetch all active recipients with notification preferences.
            result = await session.execute(
                select(User).where(User.role.in_([UserRole.NGO, UserRole.RESPONDER]), User.is_active == True)
            )
            users = result.scalars().all()
            matched_user_ids: List[str] = []
            
            for user in users:
                decision = await self._should_notify(user, incident)
                if decision["notify"]:
                    matched_user_ids.append(str(user.id))
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
                output_data={"alerts_created": alerts_created, "matched_users": matched_user_ids},
                status=AgentStatus.SUCCESS
            )
            session.add(log)
            await session.commit()
            
        logger.info(f"Notification processing complete. Created {alerts_created} alerts.")

    async def _should_notify(self, user: User, incident: Incident) -> Dict[str, Any]:
        """
        Matching logic based on user preferences.
        """
        prefs = user.notification_prefs or {}
        if not getattr(user, "is_active", True):
            return {"notify": False, "reason": "inactive_account"}

        # 1. Category match
        pref_categories = prefs.get("categories", [])
        if pref_categories and str(incident.category) not in pref_categories:
            return {"notify": False, "reason": "category_mismatch"}

        # 2. Severity threshold
        min_severity = prefs.get("min_severity", 0.0)
        if isinstance(min_severity, str):
            label_order = {
                SeverityLabel.LOW.value: 0.0,
                SeverityLabel.MEDIUM.value: 1.0,
                SeverityLabel.HIGH.value: 2.0,
                SeverityLabel.CRITICAL.value: 3.0,
            }
            min_severity = label_order.get(min_severity.lower(), 0.0)

        if incident.severity_score < float(min_severity):
            return {"notify": False, "reason": "severity_below_threshold"}

        # 3. Coverage area match (Loose matching)
        coverage = user.coverage_area or {}
        if coverage:
            location_name = incident.location_name or ""
            allowed_locations = coverage.get("locations", [])
            if allowed_locations:
                match = any(loc.lower() in location_name.lower() for loc in allowed_locations)
                if not match:
                    return {"notify": False, "reason": "coverage_location_mismatch"}

            center = coverage.get("center")
            radius = coverage.get("radius_km")
            if center and radius and incident.latitude is not None and incident.longitude is not None:
                from geopy.distance import geodesic
                dist = geodesic(center, (incident.latitude, incident.longitude)).km
                if dist > radius:
                    return {"notify": False, "reason": "coverage_radius_mismatch"}

        return {"notify": True, "reason": "matched"}

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
