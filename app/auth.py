from datetime import datetime, timedelta
from typing import Optional
import secrets
import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
import os
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-production-use-env-var")
if SECRET_KEY == "your-secret-key-change-in-production-use-env-var":
    logger = logging.getLogger(__name__)
    logger.warning("Using default JWT_SECRET_KEY - set JWT_SECRET_KEY environment variable in production!")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
PASSWORD_RESET_EXPIRE_HOURS = 1

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se la password corrisponde all'hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Genera l'hash di una password"""
    # Bcrypt has a 72 byte limit - ensure password doesn't exceed it
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # Take only first 72 bytes and decode back to string
        password = password_bytes[:72].decode('utf-8', errors='ignore')
    
    try:
        return pwd_context.hash(password)
    except Exception as e:
        # If still fails, use a simpler approach
        if len(password) > 50:
            password = password[:50]
        return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crea un token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def generate_verification_token() -> str:
    """Generate a secure random token for email verification"""
    return secrets.token_urlsafe(32)


def generate_password_reset_token() -> str:
    """Generate a secure random token for password reset"""
    return secrets.token_urlsafe(32)

def decode_access_token(token: str) -> dict:
    """Decodifica un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Ottiene l'utente corrente dal token JWT"""
    payload = decode_access_token(token)
    email: str = payload.get("sub")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token non valido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utente non trovato",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente disabilitato"
        )
    
    return user

async def require_auth(current_user: User = Depends(get_current_user)) -> User:
    """Dependency per richiedere l'autenticazione"""
    return current_user

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency per richiedere permessi di amministratore"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permessi insufficienti"
        )
    return current_user
