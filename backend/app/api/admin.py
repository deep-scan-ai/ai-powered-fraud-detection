"""Admin dashboard endpoints"""
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import UserDB, UserResponse
from app.models.fraud_alert import FraudAlertDB
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/dashboard")
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Get admin dashboard statistics"""
    try:
        # Total users
        user_count = await db.execute(
            select(func.count(UserDB.id))
        )
        total_users = user_count.scalar() or 0
        
        # Users by role
        role_counts = await db.execute(
            select(UserDB.role, func.count(UserDB.id))
            .group_by(UserDB.role)
        )
        roles = dict(role_counts.all())
        
        # Pending approvals
        pending_count = await db.execute(
            select(func.count(UserDB.id)).where(UserDB.role == "pending")
        )
        pending_users = pending_count.scalar() or 0
        
        # Recent alerts (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        alert_count = await db.execute(
            select(func.count(FraudAlertDB.id))
            .where(FraudAlertDB.created_at >= seven_days_ago)
        )
        recent_alerts = alert_count.scalar() or 0
        
        return {
            "total_users": total_users,
            "roles": roles,
            "pending_approvals": pending_users,
            "recent_alerts_7d": recent_alerts,
            "admin_info": {
                "name": admin.display_name or admin.username,
                "email": admin.email,
                "role": admin.role
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch dashboard: {str(e)}"
        )

@router.get("/pending-approvals", response_model=list[UserResponse])
async def get_pending_approvals(
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Get users pending role approval"""
    stmt = select(UserDB).where(
        UserDB.role == "pending"
    ).order_by(UserDB.created_at.asc())
    
    result = await db.execute(stmt)
    users = result.scalars().all()
    return users

@router.get("/users", response_model=list[UserResponse])
async def list_all_users(
    skip: int = 0,
    limit: int = 50,
    role: str = None,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Get all users with optional filtering by role"""
    query = select(UserDB)
    
    if role:
        query = query.where(UserDB.role == role)
    
    query = query.order_by(UserDB.created_at.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    return users

@router.post("/users/{user_id}/approve")
async def approve_user(
    user_id: int,
    role: str = "user",
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """
    Approve a pending user and assign role
    
    Roles: user, analyst, admin
    """
    valid_roles = ["user", "analyst", "admin"]
    
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )
    
    try:
        stmt = select(UserDB).where(UserDB.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.role != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User is already approved with role: {user.role}"
            )
        
        user.role = role
        user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(user)
        
        return {
            "message": f"User {user.username} approved with role: {role}",
            "user": UserResponse.from_orm(user)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to approve user: {str(e)}"
        )

@router.post("/users/{user_id}/reject")
async def reject_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Reject/deactivate a pending user"""
    try:
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
        
        return {
            "message": f"User {user.username} has been rejected"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reject user: {str(e)}"
        )

@router.get("/audit-log")
async def get_audit_log(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: UserDB = Depends(get_current_admin)
):
    """Get audit log of user actions"""
    # This would be implemented with an AuditLog table
    # For now, return recent user modifications
    stmt = select(UserDB).order_by(
        UserDB.updated_at.desc()
    ).offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    users = result.scalars().all()
    
    return {
        "audit_entries": [
            {
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "updated_at": user.updated_at
            }
            for user in users
        ]
    }
