from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.api_schemas import UserCreate, UserResponse, UserBase
from database.models import User
from api.deps import get_db, verify_firebase_token, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/sync", response_model=UserResponse)
def sync_user(user_data: UserCreate, uid: str = Depends(verify_firebase_token), db: Session = Depends(get_db)):
    """Creates or updates a user profile based on Firebase UID."""
    user = db.query(User).filter(User.firebase_uid == uid).first()
    
    if user:
        # Update existing
        user.email = user_data.email
        if user_data.name is not None:
            user.name = user_data.name
        if user_data.phone is not None:
            user.phone = user_data.phone
        if user_data.blood_group is not None:
            user.blood_group = user_data.blood_group
    else:
        # Create new
        user = User(
            firebase_uid=uid,
            email=user_data.email,
            name=user_data.name,
            phone=user_data.phone,
            blood_group=user_data.blood_group
        )
        db.add(user)
        
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Retrieves the currently authenticated user's profile."""
    return current_user
