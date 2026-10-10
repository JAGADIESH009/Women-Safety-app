# Smart Women Security Application Using AI, IoT, and Cloud

A production-quality MVP for a women's safety platform. This project prioritizes reliability, security, and core SOS functionality over mock AI features.

## Architecture

The system consists of:
1. **Mobile Frontend**: Flutter application for users.
2. **Backend Services**: FastAPI modular monolith handling authentication, emergencies, GPS tracking, and notifications.
3. **Infrastructure**: PostgreSQL database, Redis (for caching and websockets), Docker for containerization.

## Tech Stack
- **Mobile**: Flutter, Dart, Firebase Cloud Messaging.
- **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL.
- **AI**: Scikit-learn (Risk scoring model).
- **Deployment**: Docker, AWS S3 (for evidence storage).

## Folder Structure
- `backend/`: FastAPI services and core logic.
- `frontend/mobile/`: Flutter mobile application.
- `database/`: Database schemas and migrations.
- `docker/`: Container configurations.
- `docs/`: Technical documentation.

## Local Setup

### Environment Variables
Copy `.env.example` to `.env` and fill in the actual values.

### Running Backend (Docker)
Ensure Docker is running, then execute:
```bash
docker-compose up -d
```
This will start PostgreSQL and Redis. The backend can be run via:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Frontend
Make sure you have Flutter installed.
```bash
cd frontend/mobile
flutter pub get
flutter run
```

## Security & Privacy Model
- Passwords are hashed using bcrypt.
- JWT tokens are used for authentication.
- GPS data is transmitted securely and stored with association to active incidents.
- No dummy/mocked data is presented as real statistics.
