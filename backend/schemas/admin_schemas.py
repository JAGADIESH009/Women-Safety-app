from pydantic import BaseModel
from typing import List
from datetime import datetime
from .api_schemas import IncidentResponse, LocationResponse, UserResponse
from typing import Optional

class IncidentAdminResponse(IncidentResponse):
    locations: List[LocationResponse] = []
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class RegistrationTrend(BaseModel):
    date: str
    count: int

class AdminDashboardResponse(BaseModel):
    total_users: int
    active_incidents: int
    resolved_incidents: int
    registration_trends: List[RegistrationTrend]
    recent_incidents: List[IncidentAdminResponse]
