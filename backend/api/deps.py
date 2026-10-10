from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database.database import SessionLocal
from database.models import User
import firebase_admin
from firebase_admin import auth, credentials
import os

# Initialize Firebase Admin if not already initialized
def init_firebase():
    if not firebase_admin._apps:
        cred_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        else:
            raise ValueError(
                "GOOGLE_APPLICATION_CREDENTIALS environment variable is not set "
                "or points to a non-existent file. A valid Firebase service account "
                "JSON file is required for token verification."
            )
            
init_firebase()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to verify Firebase token and return the UID
def verify_firebase_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Authorization header",
        )
    token = authorization.split("Bearer ")[1]
            
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid:
            raise ValueError("No UID in token")
        return uid
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Firebase authentication token: {e}",
        )

# Dependency to get current user from the database
def get_current_user(
    uid: str = Depends(verify_firebase_token), 
    db: Session = Depends(get_db)
) -> User:
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in database",
        )
    return user
