"""Firebase authentication dependencies and utilities"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.firebase_config import verify_id_token
from app.models.user import UserDB, TokenPayload
from app.database import get_db

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> UserDB:
    """
    Verify Firebase token and return current user from database
    """
    try:
        token = credentials.credentials
        decoded_token = verify_id_token(token)
        firebase_uid = decoded_token.get("uid")
        
        if not firebase_uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing UID"
            )
        
        # Get user from database
        stmt = select(UserDB).where(UserDB.firebase_uid == firebase_uid)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in database"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

async def get_current_admin(
    current_user: UserDB = Depends(get_current_user)
) -> UserDB:
    """
    Verify that current user is an admin
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access this resource"
        )
    return current_user

async def get_current_analyst(
    current_user: UserDB = Depends(get_current_user)
) -> UserDB:
    """
    Verify that current user is an analyst or admin
    """
    if current_user.role not in ["admin", "analyst"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only analysts and administrators can access this resource"
        )
    return current_user

async def require_role(*allowed_roles):
    """
    Dependency factory to require specific roles
    
    Usage:
        @router.get("/some-endpoint")
        async def endpoint(user = Depends(require_role("admin", "analyst"))):
            ...
    """
    async def check_role(current_user: UserDB = Depends(get_current_user)) -> UserDB:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User role '{current_user.role}' not authorized. Required: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return check_role
