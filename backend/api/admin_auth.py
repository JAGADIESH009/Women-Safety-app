from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from passlib.context import CryptContext
from jose import jwt, JWTError

from database.database import SessionLocal
from database.models import AdminUser, PasswordResetToken

router = APIRouter(prefix="/admin/auth", tags=["Admin Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 24 hours

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class AdminLogin(BaseModel):
    admin_id: str
    password: str

class ForgotPasswordReq(BaseModel):
    email: EmailStr

class ResetPasswordReq(BaseModel):
    token: str
    new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_email(to_email: str, subject: str, html_body: str):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_pass = os.environ.get("SMTP_PASSWORD")
    
    if not all([smtp_host, smtp_user, smtp_pass]):
        print("SMTP config missing. Cannot send email.")
        return False
        
    msg = MIMEMultipart()
    msg['From'] = smtp_user
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_body, 'html'))
    
    try:
        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

@router.post("/setup")
def setup_initial_admin(db: Session = Depends(get_db)):
    """Creates the initial admin if none exists (for dev/setup)"""
    if db.query(AdminUser).first():
        return {"msg": "Admin already exists"}
    
    # We will use the user's provided email and a default id
    admin = AdminUser(
        admin_id="admin",
        email="work.jagadiesh@gmail.com",
        password_hash=get_password_hash("admin123")
    )
    db.add(admin)
    db.commit()
    return {"msg": "Created initial admin. ID: admin, Pass: admin123"}

@router.post("/login", response_model=TokenResponse)
def login(creds: AdminLogin, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.admin_id == creds.admin_id).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid Admin ID or Password")
    
    access_token = create_access_token(data={"sub": user.admin_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordReq, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.email == req.email).first()
    if not user:
        # Don't leak whether user exists
        return {"msg": "If your email is registered, you will receive a reset link shortly."}
        
    token = secrets.token_urlsafe(32)
    reset_entry = PasswordResetToken(
        admin_user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )
    db.add(reset_entry)
    db.commit()
    
    # Build frontend reset URL
    frontend_url = os.environ.get("FRONTEND_URL", "https://safeher-admin-panel.vercel.app")
    reset_link = f"{frontend_url}/?reset_token={token}"
    
    body = f"""
    <h3>SafeHer Admin Password Reset</h3>
    <p>You requested a password reset for your SafeHer Admin account.</p>
    <p>Your Admin ID is: <strong>{user.admin_id}</strong></p>
    <p><a href="{reset_link}">Click here to reset your password</a></p>
    <p>This link will expire in 1 hour.</p>
    """
    send_email(user.email, "SafeHer Admin - Password Reset", body)
    
    return {"msg": "If your email is registered, you will receive a reset link shortly."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordReq, db: Session = Depends(get_db)):
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user = reset_token.admin_user
    user.password_hash = get_password_hash(req.new_password)
    reset_token.used = True
    
    db.commit()
    return {"msg": "Password updated successfully"}
