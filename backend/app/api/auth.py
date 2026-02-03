"""Authentication endpoints"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from app.firebase_config import verify_id_token, set_custom_claims
from app.database import get_db
from app.models.user import UserDB, UserCreate, UserResponse, UserUpdate
from app.dependencies import get_current_user, get_current_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user after Firebase authentication
    
    Expected flow:
    1. Frontend authenticates with Firebase
    2. Frontend sends ID token to this endpoint
    3. Backend verifies token and creates user record
    """
    try:
        # Verify Firebase token if provided
        if user_data.id_token:
            decoded_token = verify_id_token(user_data.id_token)
            firebase_uid = decoded_token.get("uid")
        else:
            firebase_uid = user_data.firebase_uid
        
        # Validate that firebase_uid matches
        if firebase_uid != user_data.firebase_uid:
            raise ValueError("Firebase UID mismatch")
        
        # Check if user already exists
        stmt = select(UserDB).where(UserDB.firebase_uid == firebase_uid)
        result = await db.execute(stmt)
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            return existing_user
        
        # Create new user with pending role
        new_user = UserDB(
            firebase_uid=firebase_uid,
            email=user_data.email,
            username=user_data.username or user_data.email.split("@")[0],
            display_name=user_data.display_name,
            role="pending"  # Admin must approve
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        return new_user
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration failed: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserDB = Depends(get_current_user)
):
    """Get current user information"""
    return current_user

@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """List all users (admin only)"""
    stmt = select(UserDB).order_by(UserDB.created_at.desc())
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users

@router.put("/users/{user_id}/role", response_model=UserResponse)
async def assign_user_role(
    user_id: int,
    role_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """
    Assign role to a user (admin only)
    
    Valid roles: pending, user, analyst, admin
    """
    valid_roles = ["pending", "user", "analyst", "admin"]
    
    if role_update.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    try:
        # Get user
        stmt = select(UserDB).where(UserDB.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update user role
        user.role = role_update.role
        user.updated_at = datetime.utcnow()
        
        # Sync role to Firebase custom claims
        try:
            set_custom_claims(user.firebase_uid, {"role": role_update.role})
        except Exception as e:
            print(f"Warning: Failed to sync role to Firebase: {str(e)}")
        
        await db.commit()
        await db.refresh(user)
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to assign role: {str(e)}"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Get user details (admin only)"""
    stmt = select(UserDB).where(UserDB.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Deactivate a user (admin only)"""
    stmt = select(UserDB).where(UserDB.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    await db.commit()
    
    return {"message": f"User {user_id} has been deactivated"}
