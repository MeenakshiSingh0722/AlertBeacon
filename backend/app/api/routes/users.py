from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Any

from app.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserRead, UserUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me/preferences", response_model=Dict[str, Any])
async def get_user_preferences(
    current_user: User = Depends(get_current_user)
):
    """Returns the current user's notification preferences and coverage area."""
    return {
        "notification_prefs": current_user.notification_prefs or {},
        "coverage_area": current_user.coverage_area or {}
    }

@router.patch("/me/preferences", response_model=UserRead)
async def update_user_preferences(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates the current user's preferences."""
    update_data = user_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user
