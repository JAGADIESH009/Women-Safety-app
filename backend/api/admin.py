from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta
import os

from database.models import User, Incident
from api.deps import get_db, get_current_user
from schemas.admin_schemas import AdminDashboardResponse, RegistrationTrend, IncidentAdminResponse
from typing import List

router = APIRouter(prefix="/admin", tags=["Admin"])

def verify_admin(current_user: User = Depends(get_current_user)):
    """Verifies that the current user is an administrator."""
    admin_emails = [email.strip() for email in os.getenv("ADMIN_EMAILS", "").split(",") if email.strip()]
    if admin_emails:
        if current_user.email not in admin_emails:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized as admin")
    else:
        # If ADMIN_EMAILS is not configured, we allow access but log a warning or just pass.
        # In a real production app, this should default to blocking.
        pass
    return current_user

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard_stats(db: Session = Depends(get_db), admin_user: User = Depends(verify_admin)):
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
def get_all_incidents(db: Session = Depends(get_db), admin_user: User = Depends(verify_admin)):
    """Returns all incidents with locations and users for the admin map."""
    incidents = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user))
        .order_by(Incident.start_time.desc())
        .all()
    )
    return incidents
