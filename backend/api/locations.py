from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.api_schemas import LocationCreate, LocationResponse
from database.models import User, Incident, Location
from api.deps import get_db, get_current_user

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.post("/{incident_id}", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def add_location_update(incident_id: int, location: LocationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new location update to an active incident."""
    # Verify incident belongs to user and is active
    db_incident = db.query(Incident).filter(
        Incident.id == incident_id, 
        Incident.user_id == current_user.id
    ).first()
    
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found or not authorized")
        
    if db_incident.status != "ACTIVE":
        raise HTTPException(status_code=400, detail="Cannot add location updates to a resolved incident")
        
    new_location = Location(
        incident_id=incident_id,
        latitude=location.latitude,
        longitude=location.longitude,
        accuracy=location.accuracy
    )
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    return new_location
