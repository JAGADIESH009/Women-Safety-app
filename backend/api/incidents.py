from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.api_schemas import IncidentCreate, IncidentUpdate, IncidentResponse, LocationResponse
from database.models import User, Incident, Location
from api.deps import get_db, get_current_user
from datetime import datetime, timezone

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/", response_model=List[IncidentResponse])
def get_incidents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all incidents for the current user."""
    return db.query(Incident).filter(Incident.user_id == current_user.id).order_by(Incident.start_time.desc()).all()

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(incident: IncidentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Create a new emergency incident."""
    new_incident = Incident(
        user_id=current_user.id,
        type=incident.type,
        status="ACTIVE"
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)
    return new_incident

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: int, incident: IncidentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update an incident (e.g., mark as RESOLVED)."""
    db_incident = db.query(Incident).filter(
        Incident.id == incident_id, 
        Incident.user_id == current_user.id
    ).first()
    
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found or not authorized")
        
    db_incident.status = incident.status
    if incident.end_time:
        db_incident.end_time = incident.end_time
    elif incident.status == "RESOLVED" and not db_incident.end_time:
        db_incident.end_time = datetime.now(timezone.utc)
        
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.get("/{incident_id}/locations", response_model=List[LocationResponse])
def get_incident_locations(incident_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all location updates for a specific incident."""
    # Verify incident belongs to user
    db_incident = db.query(Incident).filter(
        Incident.id == incident_id, 
        Incident.user_id == current_user.id
    ).first()
    
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found or not authorized")
        
    return db.query(Location).filter(Location.incident_id == incident_id).order_by(Location.timestamp.asc()).all()
