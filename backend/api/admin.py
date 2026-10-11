from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
import os

from database.models import User, Incident
from api.deps import get_db, get_current_user
from schemas.admin_schemas import AdminDashboardResponse, RegistrationTrend, IncidentAdminResponse, UserAdminResponse, UserDetailsAdminResponse, BulkResolveIncidentsResponse
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

@router.get("/me")
def get_current_admin(admin_user: AdminUser = Depends(verify_admin)):
    """Returns profile details for the authenticated administrator."""
    return {
        "id": admin_user.id,
        "admin_id": admin_user.admin_id,
        "email": admin_user.email
    }

@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_dashboard_stats(db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns aggregated statistics for the admin dashboard."""
    total_users = db.query(User).count()
    active_incidents = db.query(Incident).filter(Incident.status == "ACTIVE").count()
    resolved_incidents = db.query(Incident).filter(Incident.status == "RESOLVED").count()
    
    # Registration trends (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Group by date using SQLAlchemy (works in Postgres and SQLite)
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
        .options(joinedload(Incident.locations), joinedload(Incident.user).joinedload(User.contacts))
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
    """Returns all incidents with locations, user details, and emergency contacts."""
    incidents = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user).joinedload(User.contacts))
        .order_by(Incident.start_time.desc())
        .all()
    )
    return incidents

@router.put("/incidents/resolve-all", response_model=BulkResolveIncidentsResponse)
@router.post("/incidents/resolve-all", response_model=BulkResolveIncidentsResponse)
def resolve_all_incidents(db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """
    Marks all currently unresolved incidents as RESOLVED within a single database transaction.
    Records the resolution timestamp and the authenticated resolving admin for each.
    Excludes already resolved incidents to preserve their original resolution metadata.
    """
    try:
        unresolved_incidents = (
            db.query(Incident)
            .filter((Incident.status != "RESOLVED") | (Incident.status.is_(None)))
            .all()
        )
        
        now = datetime.now(timezone.utc)
        resolved_count = 0
        for incident in unresolved_incidents:
            incident.status = "RESOLVED"
            incident.end_time = now
            incident.resolved_by = admin_user.email
            resolved_count += 1
            
        db.commit()
        
        return BulkResolveIncidentsResponse(
            message=f"Successfully resolved {resolved_count} incident(s)" if resolved_count > 0 else "No unresolved incidents to resolve",
            resolved_count=resolved_count,
            unresolved_remaining=0,
            timestamp=now
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to bulk resolve incidents: {str(e)}"
        )

@router.get("/incidents/{incident_id}", response_model=IncidentAdminResponse)
def get_incident_by_id(incident_id: int, db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns comprehensive details for a specific incident including user, contacts, and locations."""
    incident = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user).joinedload(User.contacts))
        .filter(Incident.id == incident_id)
        .first()
    )
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident #{incident_id} not found"
        )
    return incident

@router.put("/incidents/{incident_id}/resolve", response_model=IncidentAdminResponse)
@router.post("/incidents/{incident_id}/resolve", response_model=IncidentAdminResponse)
def resolve_incident(incident_id: int, db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """
    Marks an incident as RESOLVED, recording the resolution timestamp and the resolving admin.
    Prevents duplicate resolution and rejects unauthorized or invalid attempts.
    """
    incident = (
        db.query(Incident)
        .options(joinedload(Incident.locations), joinedload(Incident.user).joinedload(User.contacts))
        .filter(Incident.id == incident_id)
        .first()
    )
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident #{incident_id} not found"
        )
        
    if incident.status == "RESOLVED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Incident #{incident_id} is already resolved"
        )
        
    incident.status = "RESOLVED"
    incident.end_time = datetime.now(timezone.utc)
    incident.resolved_by = admin_user.email
    
    db.commit()
    db.refresh(incident)
    return incident

@router.get("/users", response_model=List[UserAdminResponse])
def get_all_users(db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns all users with their incident statistics."""
    users = db.query(User).options(joinedload(User.incidents)).all()
    
    response = []
    for user in users:
        total_incidents = len(user.incidents)
        active_incidents = sum(1 for i in user.incidents if i.status == "ACTIVE")
        resolved_incidents = sum(1 for i in user.incidents if i.status == "RESOLVED")
        last_incident = max([i.start_time for i in user.incidents], default=None) if user.incidents else None
        
        response.append(
            UserAdminResponse(
                id=user.id,
                firebase_uid=user.firebase_uid,
                email=user.email,
                name=user.name,
                phone=user.phone,
                blood_group=user.blood_group,
                created_at=user.created_at,
                total_incidents=total_incidents,
                active_incidents=active_incidents,
                resolved_incidents=resolved_incidents,
                last_incident_date=last_incident
            )
        )
    return response

@router.get("/users/{user_id}", response_model=UserDetailsAdminResponse)
def get_user_details(user_id: int, db: Session = Depends(get_db), admin_user: AdminUser = Depends(verify_admin)):
    """Returns details for a specific user, including incident history."""
    user = (
        db.query(User)
        .options(
            joinedload(User.incidents).joinedload(Incident.locations)
        )
        .filter(User.id == user_id)
        .first()
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    total_incidents = len(user.incidents)
    active_incidents = sum(1 for i in user.incidents if i.status == "ACTIVE")
    resolved_incidents = sum(1 for i in user.incidents if i.status == "RESOLVED")
    last_incident = max([i.start_time for i in user.incidents], default=None) if user.incidents else None
    
    sorted_incidents = sorted(user.incidents, key=lambda x: x.start_time, reverse=True)
    
    return UserDetailsAdminResponse(
        id=user.id,
        firebase_uid=user.firebase_uid,
        email=user.email,
        name=user.name,
        phone=user.phone,
        blood_group=user.blood_group,
        created_at=user.created_at,
        total_incidents=total_incidents,
        active_incidents=active_incidents,
        resolved_incidents=resolved_incidents,
        last_incident_date=last_incident,
        incidents=sorted_incidents
    )
