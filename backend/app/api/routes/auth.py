from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user_schema import UserRead, UserCreate, TokenWithRefresh, Token
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    ALGORITHM
)
from app.config import settings
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Curl examples:
# Register:
# curl -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" \
#   -d '{"email":"user@example.com","org_name":"Example Org","password":"secret123"}'
#
# Login:
# curl -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/x-www-form-urlencoded" \
#   -d 'username=user@example.com&password=secret123'
#
# Refresh:
# curl -X POST http://localhost:8000/api/v1/auth/refresh -H "Content-Type: application/json" \
#   -d '{"refresh_token":"<token>"}'
#
# Get current user:
# curl -X GET http://localhost:8000/api/v1/auth/me -H "Authorization: Bearer <access_token>"
#
# Logout:
# curl -X DELETE http://localhost:8000/api/v1/auth/logout -H "Authorization: Bearer <access_token>"

@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Registers a new user and hashes their password."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    
    db_user = User(
        email=user_in.email,
        org_name=user_in.org_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=TokenWithRefresh)
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Authenticates a user and returns access and refresh tokens."""
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    """Exchanges a valid refresh token for a new access token."""
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    new_access_token = create_access_token(subject=user.id)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user

@router.delete("/logout")
async def logout():
    """Placeholder for logout (tokens are stateless, client should delete them)."""
    return {"message": "Successfully logged out (stateless)"}
