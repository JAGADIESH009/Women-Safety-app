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
    assert data["id"] == 1

def test_add_location_to_incident():
    incident_id = 1
    response = client.post(
        f"/locations/{incident_id}",
        headers={"Authorization": VALID_TOKEN},
        json={"latitude": 40.7128, "longitude": -74.0060, "accuracy": 5.0}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["latitude"] == 40.7128

# --- Admin Incident Management Tests ---

def test_admin_setup_and_token():
    from database.models import AdminUser
    from api.admin_auth import get_password_hash, create_access_token
    db = TestingSessionLocal()
    try:
        admin = db.query(AdminUser).filter(AdminUser.admin_id == "testadmin").first()
        if not admin:
            admin = AdminUser(
                admin_id="testadmin",
                email="admin@safeher.org",
                password_hash=get_password_hash("securepass123")
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
    finally:
        db.close()

def get_admin_headers():
    from api.admin_auth import create_access_token
    token = create_access_token({"sub": "testadmin"})
    return {"Authorization": f"Bearer {token}"}

def test_admin_get_incidents():
    test_admin_setup_and_token()
    headers = get_admin_headers()
    response = client.get("/admin/incidents", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    inc = next(i for i in data if i["id"] == 1)
    assert inc["type"] == "SOS Emergency"
    assert inc["status"] == "ACTIVE"
    assert inc["user"] is not None
    assert len(inc["locations"]) >= 1

def test_admin_get_incident_details():
    headers = get_admin_headers()
    response = client.get("/admin/incidents/1", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["status"] == "ACTIVE"
    assert data["user"]["email"] == "test@example.com"
    assert len(data["locations"]) >= 1
    assert len(data["user"]["contacts"]) >= 1

def test_admin_get_invalid_incident():
    headers = get_admin_headers()
    response = client.get("/admin/incidents/99999", headers=headers)
    assert response.status_code == 404
    assert "Incident #99999 not found" in response.json()["detail"]

def test_resolve_incident_unauthorized():
    response = client.put("/admin/incidents/1/resolve")
    assert response.status_code == 401

def test_resolve_incident_invalid_id():
    headers = get_admin_headers()
    response = client.put("/admin/incidents/99999/resolve", headers=headers)
    assert response.status_code == 404
    assert "Incident #99999 not found" in response.json()["detail"]

def test_resolve_incident_success():
    headers = get_admin_headers()
    response = client.put("/admin/incidents/1/resolve", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["status"] == "RESOLVED"
    assert data["resolved_by"] == "admin@safeher.org"
    assert data["end_time"] is not None
    # Verify original details preserved
    assert data["type"] == "SOS Emergency"
    assert data["user"]["email"] == "test@example.com"
    assert len(data["locations"]) >= 1

def test_prevent_duplicate_resolution():
    headers = get_admin_headers()
    # Attempt resolving the already resolved incident
    response = client.put("/admin/incidents/1/resolve", headers=headers)
    assert response.status_code == 400
    assert "already resolved" in response.json()["detail"]

    # Verify resolution timestamp and details were not altered or corrupted
    detail_res = client.get("/admin/incidents/1", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["status"] == "RESOLVED"
    assert detail["resolved_by"] == "admin@safeher.org"
    assert detail["end_time"] is not None
