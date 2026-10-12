from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.api_schemas import ContactCreate, ContactUpdate, ContactResponse
from database.models import User, EmergencyContact
from api.deps import get_db, get_current_user

router = APIRouter(prefix="/contacts", tags=["Emergency Contacts"])

def _clean_phone(phone: str) -> str:
    if not phone:
        return ""
    return "".join(ch for ch in phone if ch.isdigit())

@router.get("/", response_model=List[ContactResponse])
def get_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get all emergency contacts for the current user, deduplicated by phone/name."""
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == current_user.id
    ).order_by(EmergencyContact.is_primary.desc(), EmergencyContact.id.asc()).all()
    
    seen = {}
    unique_contacts = []
    for c in contacts:
        clean = _clean_phone(c.phone)
        key = clean if clean else c.name.strip().lower()
        if key not in seen:
            seen[key] = c
            unique_contacts.append(c)
        elif c.is_primary and not seen[key].is_primary:
            unique_contacts.remove(seen[key])
            seen[key] = c
            unique_contacts.append(c)
            
    return unique_contacts

@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(contact: ContactCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Add a new emergency contact with duplicate prevention and primary exclusivity."""
    clean_target = _clean_phone(contact.phone)
    
    # Check if contact with same phone or name already exists for this user
    all_contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).all()
    existing_contact = None
    for c in all_contacts:
        c_clean = _clean_phone(c.phone)
        if (clean_target and c_clean == clean_target) or (c.name.strip().lower() == contact.name.strip().lower()):
            existing_contact = c
            break
            
    if contact.is_primary:
        db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).update({"is_primary": False})

    if existing_contact:
        existing_contact.name = contact.name.strip()
        existing_contact.phone = contact.phone.strip()
        existing_contact.relation = contact.relation
        existing_contact.is_primary = contact.is_primary
        db.commit()
        db.refresh(existing_contact)
        return existing_contact

    new_contact = EmergencyContact(
        user_id=current_user.id,
        name=contact.name.strip(),
        phone=contact.phone.strip(),
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
        
    if contact.is_primary:
        db.query(EmergencyContact).filter(
            EmergencyContact.user_id == current_user.id,
            EmergencyContact.id != contact_id
        ).update({"is_primary": False})

    if contact.name is not None:
        db_contact.name = contact.name.strip()
    if contact.phone is not None:
        db_contact.phone = contact.phone.strip()
    if contact.relation is not None:
        db_contact.relation = contact.relation
    if contact.is_primary is not None:
        db_contact.is_primary = contact.is_primary
        
    db.commit()
    db.refresh(db_contact)
    return db_contact

@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an emergency contact and clean up any identical duplicate records for this user."""
    db_contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id, 
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not db_contact:
        raise HTTPException(status_code=404, detail="Contact not found or not authorized")
        
    clean_target = _clean_phone(db_contact.phone)
    if clean_target:
        duplicates = db.query(EmergencyContact).filter(
            EmergencyContact.user_id == current_user.id
        ).all()
        for d in duplicates:
            if _clean_phone(d.phone) == clean_target or d.id == contact_id:
                db.delete(d)
    else:
        db.delete(db_contact)
        
    db.commit()
