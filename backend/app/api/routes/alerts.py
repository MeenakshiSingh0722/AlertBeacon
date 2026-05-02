from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.database import get_db
from app.models.alert import AlertNotification, AlertStatus, AlertType
from app.models.incident import Incident, SeverityLabel
from app.api.deps import get_current_user, get_optional_current_user
from app.config import settings
from uuid import UUID
from pydantic import BaseModel

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[dict])
async def get_alerts(
    severity: Optional[SeverityLabel] = None,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[any] = Depends(get_optional_current_user)
):
    """Return high/critical generated alerts."""
    if not settings.DEBUG and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    # Query for high and critical severity incidents with alerts
    query = select(AlertNotification).join(Incident, AlertNotification.incident_id == Incident.id)
    
    if severity:
        query = query.where(Incident.severity_label == severity)
    else:
        # Default to high and critical only
        query = query.where(Incident.severity_label.in_([SeverityLabel.HIGH, SeverityLabel.CRITICAL]))
    
    query = query.order_by(AlertNotification.created_at.desc())
    result = await db.execute(query)
    alerts = result.scalars().all()
    
    # Format response
    formatted_alerts = []
    for alert in alerts:
        formatted_alerts.append({
            "id": str(alert.id),
            "incident_id": str(alert.incident_id),
            "alert_type": alert.alert_type.value,
            "status": alert.status.value,
            "message": alert.message,
            "created_at": alert.created_at.isoformat()
        })
    
    return formatted_alerts

@router.patch("/{alert_id}/read")
async def mark_alert_read(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: any = Depends(get_current_user)
):
    """Mark popup/dashboard alert as read."""
    result = await db.execute(
        select(AlertNotification).where(AlertNotification.id == alert_id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = AlertStatus.READ
    await db.commit()
    
    return {"message": "Alert marked as read"}
