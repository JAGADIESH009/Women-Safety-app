from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta
import os

from database.models import User, Incident
from api.deps import get_db, get_current_user
from schemas.admin_schemas import AdminDashboardResponse, RegistrationTrend, IncidentAdminResponse
from typing import List
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from database.models import AdminUser

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="admin/auth/login")
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"

router = APIRouter(prefix="/admin", tags=["Admin"])

def verify_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> AdminUser:
    """Verifies that the current user is an administrator via custom JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        admin_id: str = payload.get("sub")
        if admin_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    admin_user = db.query(AdminUser).filter(AdminUser.admin_id == admin_id).first()
    if admin_user is None:
        raise credentials_exception
        
    # Extra check for authorized emails (optional but satisfies prompt requirement to keep ADMIN_EMAILS check)
    admin_emails = [email.strip() for email in os.getenv("ADMIN_EMAILS", "").split(",") if email.strip()]
    if admin_emails and admin_user.email not in admin_emails:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as admin in ENV")
        
    return admin_user

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard_stats(db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns aggregated statistics for the admin dashboard."""
    total_users = db.query(User).count()
    active_incidents = db.query(Incident).filter(Incident.status == "ACTIVE").count()
    resolved_incidents = db.query(Incident).filter(Incident.status == "RESOLVED").count()
    
    # Registration trends (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Group by date using SQLAlchemy (works in Postgres and SQLite)
    # Using cast to Date is cross-compatible or specific to Postgres
    from sqlalchemy.types import Date
    from sqlalchemy import cast
    
    trends_query = (
        db.query(cast(User.created_at, Date).label("date"), func.count(User.id).label("count"))
        .filter(User.created_at >= seven_days_ago)
        .group_by(cast(User.created_at, Date))
        .order_by(cast(User.created_at, Date))
        .all()
    )
    
    registration_trends = [
        RegistrationTrend(date=str(trend.date), count=trend.count)
        for trend in trends_query
    ]
    
    # Recent incidents (last 10)
    recent_incidents = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user))
        .order_by(Incident.start_time.desc())
        .limit(10)
        .all()
    )
    
    return AdminDashboardResponse(
        total_users=total_users,
        active_incidents=active_incidents,
        resolved_incidents=resolved_incidents,
        registration_trends=registration_trends,
        recent_incidents=recent_incidents
    )

@router.get("/incidents", response_model=List[IncidentAdminResponse])
def get_all_incidents(db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns all incidents with locations and users for the admin map."""
    incidents = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user))
        .order_by(Incident.start_time.desc())
        .all()
    )
    return incidents
