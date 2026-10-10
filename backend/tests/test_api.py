import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from fastapi import Header, HTTPException, status

from main import app
from database.database import Base
from api.deps import get_db, verify_firebase_token

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

def override_verify_firebase_token(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Authorization header",
        )
    token = authorization.split("Bearer ")[1]
    if token.startswith("test-token-"):
        return token.replace("test-token-", "")
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[verify_firebase_token] = override_verify_firebase_token

client = TestClient(app)

# Dummy tokens for testing Firebase bypass
VALID_TOKEN = "Bearer test-token-testuid123"
INVALID_TOKEN = "Bearer test-token-invalid" # Wait, the bypass allows any token starting with test-token-
# The bypass in deps.py is:
# if token.startswith("test-token-"): return token.replace("test-token-", "")
# So test-token-testuid123 returns 'testuid123'.

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Women Safety System API"}

def test_sync_user():
    response = client.post(
        "/users/sync",
        headers={"Authorization": VALID_TOKEN},
        json={"email": "test@example.com", "name": "Test User", "phone": "1234567890", "blood_group": "O+"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["firebase_uid"] == "testuid123"

def test_get_my_profile():
    response = client.get(
        "/users/me",
        headers={"Authorization": VALID_TOKEN}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"

def test_unauthorized_access():
    response = client.get("/users/me")
    assert response.status_code == 401
    assert "Invalid or missing Authorization header" in response.json()["detail"]

def test_create_contact():
    response = client.post(
        "/contacts/",
        headers={"Authorization": VALID_TOKEN},
        json={"name": "Mom", "phone": "9876543210", "is_primary": True}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Mom"
    assert data["phone"] == "9876543210"

def test_get_contacts():
    response = client.get(
        "/contacts/",
        headers={"Authorization": VALID_TOKEN}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Mom"

def test_create_incident():
    response = client.post(
        "/incidents/",
        headers={"Authorization": VALID_TOKEN},
        json={"type": "SOS Emergency"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "SOS Emergency"
    assert data["status"] == "ACTIVE"
    return data["id"]

def test_add_location_to_incident():
    # Get the incident ID first (using a trick for tests, we know it's 1 since it's the first)
    incident_id = 1
    response = client.post(
        f"/locations/{incident_id}",
        headers={"Authorization": VALID_TOKEN},
        json={"latitude": 40.7128, "longitude": -74.0060, "accuracy": 5.0}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["latitude"] == 40.7128
