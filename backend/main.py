from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import users, contacts, incidents, locations, admin, admin_auth
from dotenv import load_dotenv
import os
from database.database import engine
from database.models import Base

# Auto-create tables (safe if they already exist)
Base.metadata.create_all(bind=engine)

def ensure_schema_compatibility():
    if not engine:
        return
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        if "incidents" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("incidents")]
            with engine.connect() as conn:
                if "resolved_by" not in columns:
                    conn.execute(text("ALTER TABLE incidents ADD COLUMN resolved_by VARCHAR;"))
                if "trigger_source" not in columns:
                    conn.execute(text("ALTER TABLE incidents ADD COLUMN trigger_source VARCHAR DEFAULT 'MANUAL';"))
                if "idempotency_key" not in columns:
                    conn.execute(text("ALTER TABLE incidents ADD COLUMN idempotency_key VARCHAR;"))
                conn.commit()
    except Exception as e:
        print(f"Non-critical schema check note: {e}")

ensure_schema_compatibility()

# Ensure environment variables are loaded
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path)

app = FastAPI(
    title="Women Safety System API",
    description="Backend API for the Smart Women Security Application",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(users.router)
app.include_router(contacts.router)
app.include_router(incidents.router)
app.include_router(locations.router)
app.include_router(admin.router)
app.include_router(admin_auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Women Safety System API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
