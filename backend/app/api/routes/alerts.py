from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.alert import Alert, AlertStatus
from app.models.user import User
from app.schemas.alert_schema import AlertRead, AlertUpdate
from app.api.deps import get_current_user
from uuid import UUID

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertRead])
async def get_my_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns alerts for the currently logged-in user."""
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.sent_at.desc())
    )
    return result.scalars().all()

@router.get("/{alert_id}", response_model=AlertRead)
async def get_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns a specific alert if it belongs to the user."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.patch("/{alert_id}/read", response_model=AlertRead)
async def mark_alert_read(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks an alert as read."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = AlertStatus.READ
    await db.commit()
    await db.refresh(alert)
    return alert

@router.patch("/{alert_id}/response", response_model=AlertRead)
async def update_alert_response(
    alert_id: UUID,
    update_in: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the user response action for an alert (e.g., 'dispatching team')."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if update_in.response_action:
        alert.response_action = update_in.response_action
    if update_in.status:
        alert.status = update_in.status
        
    await db.commit()
    await db.refresh(alert)
    return alert
