from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import users, contacts, incidents, locations, admin
from dotenv import load_dotenv
import os

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Women Safety System API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
