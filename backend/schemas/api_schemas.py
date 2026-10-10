from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# USER SCHEMAS
class UserBase(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    blood_group: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr

class UserResponse(UserBase):
    id: int
    firebase_uid: str
    email: EmailStr
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# EMERGENCY CONTACT SCHEMAS
class ContactBase(BaseModel):
    name: str
    phone: str
    relation: Optional[str] = None
    is_primary: bool = False

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    name: Optional[str] = None
    phone: Optional[str] = None

class ContactResponse(ContactBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# INCIDENT SCHEMAS
class IncidentBase(BaseModel):
    type: str

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: str
    end_time: Optional[datetime] = None

class IncidentResponse(IncidentBase):
    id: int
    user_id: int
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

# LOCATION SCHEMAS
class LocationBase(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: int
    incident_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
