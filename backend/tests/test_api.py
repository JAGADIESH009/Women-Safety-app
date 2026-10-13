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

def test_resolve_all_unauthorized():
    response = client.post("/admin/incidents/resolve-all")
    assert response.status_code == 401
    put_response = client.put("/admin/incidents/resolve-all")
    assert put_response.status_code == 401

def test_resolve_all_with_unresolved_incidents():
    from database.models import Incident
    db = TestingSessionLocal()
    try:
        # Save incident 1's original resolution timestamp
        inc1 = db.query(Incident).filter(Incident.id == 1).first()
        orig_inc1_endtime = inc1.end_time
        orig_inc1_resolved_by = inc1.resolved_by

        # Add 2 new unresolved incidents
        inc2 = Incident(user_id=1, type="Harassment Alert", status="ACTIVE")
        inc3 = Incident(user_id=1, type="Medical Emergency", status="IN_PROGRESS")
        db.add_all([inc2, inc3])
        db.commit()
        db.refresh(inc2)
        db.refresh(inc3)
        inc2_id = inc2.id
        inc3_id = inc3.id
    finally:
        db.close()

    headers = get_admin_headers()
    response = client.post("/admin/incidents/resolve-all", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["resolved_count"] == 2
    assert data["unresolved_remaining"] == 0
    assert "Successfully resolved 2 incident(s)" in data["message"]

    # Verify newly resolved incidents
    db = TestingSessionLocal()
    try:
        check2 = db.query(Incident).filter(Incident.id == inc2_id).first()
        check3 = db.query(Incident).filter(Incident.id == inc3_id).first()
        assert check2.status == "RESOLVED"
        assert check2.resolved_by == "admin@safeher.org"
        assert check2.end_time is not None

        assert check3.status == "RESOLVED"
        assert check3.resolved_by == "admin@safeher.org"
        assert check3.end_time is not None

        # Verify previously resolved incident 1 was preserved untouched
        check1 = db.query(Incident).filter(Incident.id == 1).first()
        assert check1.status == "RESOLVED"
        assert check1.end_time == orig_inc1_endtime
        assert check1.resolved_by == orig_inc1_resolved_by
    finally:
        db.close()

def test_resolve_all_when_none_unresolved():
    headers = get_admin_headers()
    # Call resolve-all when 0 incidents are unresolved
    response = client.post("/admin/incidents/resolve-all", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["resolved_count"] == 0
    assert data["unresolved_remaining"] == 0
    assert "No unresolved incidents" in data["message"]

def test_idempotent_incident_creation():
    idemp_key = "unique-test-key-999"
    # First create
    res1 = client.post(
        "/incidents/",
        headers={"Authorization": VALID_TOKEN},
        json={"type": "SOS Emergency", "trigger_source": "SHAKE", "idempotency_key": idemp_key}
    )
    assert res1.status_code == 201
    inc1 = res1.json()
    assert inc1["trigger_source"] == "SHAKE"
    assert inc1["idempotency_key"] == idemp_key

    # Second create with identical key
    res2 = client.post(
        "/incidents/",
        headers={"Authorization": VALID_TOKEN},
        json={"type": "SOS Emergency", "trigger_source": "SHAKE", "idempotency_key": idemp_key}
    )
    assert res2.status_code in (200, 201)
    inc2 = res2.json()
    assert inc2["id"] == inc1["id"]

def test_incident_voice_trigger_source():
    res = client.post(
        "/incidents/",
        headers={"Authorization": VALID_TOKEN},
        json={"type": "SOS Emergency", "trigger_source": "VOICE", "idempotency_key": "voice-trigger-key-1"}
    )
    assert res.status_code == 201
    data = res.json()
    assert data["trigger_source"] == "VOICE"

def test_live_location_share_lifecycle():
    # 1. Start sharing session
    start_res = client.post(
        "/locations/share/start",
        headers={"Authorization": VALID_TOKEN}
    )
    assert start_res.status_code == 200
    start_data = start_res.json()
    token = start_data["session_token"]
    assert token
    assert start_data["is_active"] is True
    assert "/track?token=" in start_data["tracking_url"]
    assert start_data["tracking_url"].startswith("https://")
    assert "safeher.app" not in start_data["tracking_url"]
    assert "localhost" not in start_data["tracking_url"]
    assert "127.0.0.1" not in start_data["tracking_url"]

    # 1b. Start sharing with client-supplied explicit session token
    explicit_res = client.post(
        "/locations/share/start",
        headers={"Authorization": VALID_TOKEN},
        json={"session_token": "client_explicit_token_12345"}
    )
    assert explicit_res.status_code == 200
    token = explicit_res.json()["session_token"]
    assert token == "client_explicit_token_12345"
    assert "token=client_explicit_token_12345" in explicit_res.json()["tracking_url"]

    # 2. Update coordinates
    update_res = client.post(
        "/locations/share/update",
        headers={"Authorization": VALID_TOKEN},
        json={"latitude": 16.506, "longitude": 80.648, "accuracy": 12.5}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "updated"

    # 3. Read active session
    active_res = client.get(
        "/locations/share/active",
        headers={"Authorization": VALID_TOKEN}
    )
    assert active_res.status_code == 200
    active_data = active_res.json()
    assert active_data["latitude"] == 16.506
    assert active_data["longitude"] == 80.648
    assert active_data["accuracy"] == 12.5
    assert active_data["is_active"] is True

    # 4. Public track via token (unauthenticated for emergency recipient)
    track_res = client.get(f"/locations/share/track/{token}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["latitude"] == 16.506
    assert track_data["is_active"] is True

    # 5. Non-existent token returns 404
    missing_res = client.get("/locations/share/track/non-existent-random-token-999")
    assert missing_res.status_code == 404

    # 6. Stop sharing session
    stop_res = client.post(
        "/locations/share/stop",
        headers={"Authorization": VALID_TOKEN}
    )
    assert stop_res.status_code == 200
    assert stop_res.json()["status"] == "stopped"

    # 7. Verify token is revoked and location is masked
    revoked_res = client.get(f"/locations/share/track/{token}")
    assert revoked_res.status_code == 200
    assert revoked_res.json()["is_active"] is False
    assert revoked_res.json()["latitude"] is None
    assert revoked_res.json()["longitude"] is None

def test_location_safety_score_calculation():
    # Normal coordinates
    res = client.get("/locations/safety-score?latitude=16.506&longitude=80.648&accuracy=15.0")
    assert res.status_code == 200
    data = res.json()
    assert 0.0 <= data["score"] <= 10.0
    assert data["confidence"] in ["HIGH", "MEDIUM", "LOW", "UNAVAILABLE"]
    assert len(data["factors"]) > 0
    assert "explanation" in data
    assert "guidance" in data

    # Invalid coordinates
    bad_res = client.get("/locations/safety-score?latitude=999&longitude=80.648")
    assert bad_res.status_code == 400


