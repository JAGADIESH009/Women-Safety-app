from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.api_schemas import ContactCreate, ContactUpdate, ContactResponse
from database.models import User, EmergencyContact
from api.deps import get_db, get_current_user

router = APIRouter(prefix="/contacts", tags=["Emergency Contacts"])

@router.get("/", response_model=List[ContactResponse])
def get_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all emergency contacts for the current user."""
    return db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()

@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact: ContactCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new emergency contact."""
    new_contact = EmergencyContact(
        user_id=current_user.id,
        name=contact.name,
        phone=contact.phone,
        relation=contact.relation,
        is_primary=contact.is_primary
    )
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, contact: ContactUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update an existing emergency contact."""
    db_contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id, 
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found or not authorized")
        
    if contact.name is not None:
        db_contact.name = contact.name
    if contact.phone is not None:
        db_contact.phone = contact.phone
    if contact.relation is not None:
        db_contact.relation = contact.relation
    if contact.is_primary is not None:
        db_contact.is_primary = contact.is_primary
        
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an emergency contact."""
    db_contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id, 
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found or not authorized")
        
    db.delete(db_contact)
    db.commit()
