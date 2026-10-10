# Smart Women Security Backend API

This backend is built using FastAPI and Neon PostgreSQL, using Firebase Authentication for secure identity verification.

## Setup Instructions

1. **Environment Variables**:
   Create a `.env` file in the `backend/` directory based on `.env.example`:
   ```
   DATABASE_URL=postgresql+psycopg://username:password@your-neon-host/dbname?sslmode=require
   FIREBASE_CREDENTIALS_PATH=./firebase-admin.json
   ```
   *Note: Do not commit your `.env` or `firebase-admin.json` files!*

2. **Firebase Admin Credentials**:
   - Go to your Firebase Console -> Project Settings -> Service Accounts.
   - Generate a new private key (JSON format).
   - Save it in the `backend/` folder (e.g. `firebase-admin.json`).
   - Update `FIREBASE_CREDENTIALS_PATH` in `.env` to point to it.

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations (if not already done)**:
   ```bash
   alembic upgrade head
   ```

5. **Run the API Server**:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Testing
Run the test suite using `pytest`:
```bash
pytest
```
*Note: The test suite uses an in-memory SQLite database and mocks the Firebase verification by bypassing headers that start with `Bearer test-token-`.*
