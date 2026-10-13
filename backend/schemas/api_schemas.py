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
    trigger_source: Optional[str] = "MANUAL"
    idempotency_key: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: str
    end_time: Optional[datetime] = None

class IncidentResponse(IncidentBase):
    id: int
    user_id: int
    status: str
    trigger_source: Optional[str] = "MANUAL"
    idempotency_key: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    resolved_by: Optional[str] = None

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

# LIVE LOCATION SHARING SCHEMAS
class LocationShareStartRequest(BaseModel):
    session_token: Optional[str] = None

class LocationShareStartResponse(BaseModel):
    session_token: str
    tracking_url: str
    expires_at: datetime
    is_active: bool

class LocationShareUpdateRequest(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None

class LocationSharePublicResponse(BaseModel):
    is_active: bool
    session_token: str
    user_name: Optional[str] = "SafeHer User"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accuracy: Optional[float] = None
    last_updated_at: Optional[datetime] = None
    is_stale: bool = False
    expires_at: datetime

# LOCATION SAFETY SCORE SCHEMAS
class SafetyFactor(BaseModel):
    name: str
    score_impact: float
    status: str # "POSITIVE", "NEUTRAL", "CAUTION", "ALERT", "MISSING"
    source: str
    description: str

class SafetyScoreResponse(BaseModel):
    score: float # 0.0 to 10.0
    confidence: str # "HIGH", "MEDIUM", "LOW", "UNAVAILABLE"
    factors: List[SafetyFactor]
    missing_factors: List[str]
    explanation: str
    guidance: str
    data_updated_at: datetime
