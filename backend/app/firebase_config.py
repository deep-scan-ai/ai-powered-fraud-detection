"""Firebase Admin SDK configuration and initialization"""
import os
import json
import firebase_admin
from firebase_admin import credentials, auth
from app.config import settings

# Load Firebase credentials from environment variable
# Expected format: JSON string in FIREBASE_CREDENTIALS env var
# Or specify path in FIREBASE_CREDENTIALS_PATH

firebase_initialized = False
firebase_app = None

def init_firebase():
    """Initialize Firebase Admin SDK"""
    global firebase_initialized, firebase_app
    
    if firebase_initialized:
        return firebase_app
    
    try:
        # Try loading from credentials path first (for Docker/production)
        creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        if creds_path and os.path.exists(creds_path):
            creds = credentials.Certificate(creds_path)
            firebase_app = firebase_admin.initialize_app(creds)
            firebase_initialized = True
            print("✅ Firebase initialized from credentials file")
            return firebase_app
        
        # Try loading from environment variable (JSON string)
        creds_json = os.getenv("FIREBASE_CREDENTIALS")
        if creds_json:
            creds_dict = json.loads(creds_json)
            creds = credentials.Certificate(creds_dict)
            firebase_app = firebase_admin.initialize_app(creds)
            firebase_initialized = True
            print("✅ Firebase initialized from environment variable")
            return firebase_app
        
        # Fallback: try to initialize without credentials (for development/emulator)
        firebase_app = firebase_admin.initialize_app()
        firebase_initialized = True
        print("⚠️  Firebase initialized without explicit credentials")
        return firebase_app
        
    except Exception as e:
        print(f"❌ Firebase initialization failed: {str(e)}")
        firebase_initialized = False
        return None

def verify_id_token(token: str) -> dict:
    """
    Verify Firebase ID token and return decoded claims
    
    Args:
        token: Firebase ID token from client
        
    Returns:
        Decoded token claims with user info
        
    Raises:
        firebase_admin.auth.InvalidIdTokenError: If token is invalid
    """
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except firebase_admin.auth.InvalidIdTokenError as e:
        raise ValueError(f"Invalid ID token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")

def verify_session_cookie(cookie: str) -> dict:
    """
    Verify Firebase session cookie and return decoded claims
    
    Args:
        cookie: Firebase session cookie from client
        
    Returns:
        Decoded cookie claims with user info
    """
    try:
        decoded_claims = auth.verify_session_cookie(
            cookie,
            check_revoked=True
        )
        return decoded_claims
    except Exception as e:
        raise ValueError(f"Session verification failed: {str(e)}")

def create_session_cookie(id_token: str, expires_in_ms: int = 3600 * 24 * 1000) -> str:
    """
    Create a session cookie from ID token
    
    Args:
        id_token: Firebase ID token
        expires_in_ms: Expiration time in milliseconds (default 24 hours)
        
    Returns:
        Session cookie string
    """
    try:
        session_cookie = auth.create_session_cookie(
            id_token,
            expires_in=expires_in_ms
        )
        return session_cookie
    except Exception as e:
        raise ValueError(f"Session cookie creation failed: {str(e)}")

def revoke_session_cookie(cookie: str):
    """Revoke a session cookie (logout)"""
    try:
        decoded_claims = auth.verify_session_cookie(cookie)
        auth.revoke_refresh_tokens(decoded_claims["uid"])
    except Exception as e:
        raise ValueError(f"Cookie revocation failed: {str(e)}")

def get_user(uid: str) -> dict:
    """Get user information by Firebase UID"""
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "email_verified": user.email_verified,
            "custom_claims": user.custom_claims
        }
    except firebase_admin.auth.UserNotFoundError:
        raise ValueError(f"User {uid} not found")
    except Exception as e:
        raise ValueError(f"Failed to get user: {str(e)}")

def set_custom_claims(uid: str, custom_claims: dict):
    """
    Set custom claims on Firebase user (for role-based access)
    
    Args:
        uid: Firebase user UID
        custom_claims: Dictionary of custom claims (e.g., {"role": "admin"})
    """
    try:
        auth.set_custom_user_claims(uid, custom_claims)
        return True
    except Exception as e:
        raise ValueError(f"Failed to set custom claims: {str(e)}")

# Initialize Firebase on module load
init_firebase()
