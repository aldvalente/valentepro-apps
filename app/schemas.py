"""Pydantic schemas for API requests/responses"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = 'it'  # 'it' or 'en'


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: str
    first_name: Optional[str]
    last_name: Optional[str]
    phone: Optional[str]
    preferred_language: str
    email_verified: bool
    is_host: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str


# Equipment schemas
class EquipmentImageSchema(BaseModel):
    id: UUID
    url: str
    position: int
    
    class Config:
        from_attributes = True


class EquipmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    price_per_day: float
    city: Optional[str] = None
    category: Optional[str] = None
    sport: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = 'IT'
    postal_code: Optional[str] = None
    rules_text: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class EquipmentCreate(EquipmentBase):
    image_urls: List[str] = []


class EquipmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    city: Optional[str] = None
    category: Optional[str] = None
    sport: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    rules_text: Optional[str] = None
    available: Optional[bool] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class EquipmentResponse(EquipmentBase):
    id: UUID
    available: bool
    host_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    images: List[EquipmentImageSchema] = []
    
    class Config:
        from_attributes = True


class EquipmentListItem(BaseModel):
    id: UUID
    title: str
    price_per_day: float
    city: Optional[str]
    category: Optional[str]
    sport: Optional[str]
    available: bool
    images: List[str] = []
    lat: Optional[float]
    lon: Optional[float]
    
    class Config:
        from_attributes = True


# Booking schemas
class BookingCreate(BaseModel):
    equipment_id: UUID
    date_from: date
    date_to: date
    notes: Optional[str] = None


class BookingResponse(BaseModel):
    id: UUID
    equipment_id: UUID
    user_id: Optional[UUID]
    host_id: Optional[UUID]
    date_from: date
    date_to: date
    total_price: float
    status: str
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: str  # confirmed, rejected, cancelled, completed


# Review schemas
class ReviewCreate(BaseModel):
    booking_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: UUID
    booking_id: UUID
    equipment_id: UUID
    author_id: Optional[UUID]
    rating: int
    comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Message schemas
class MessageCreate(BaseModel):
    receiver_id: UUID
    booking_id: Optional[UUID] = None
    text: str


class MessageResponse(BaseModel):
    id: UUID
    booking_id: Optional[UUID]
    sender_id: UUID
    receiver_id: UUID
    text: str
    read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Payment schemas  
class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    amount: float
    currency: str
    status: str
    payment_method: Optional[str]
    transaction_id: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Admin schemas
class AdminStats(BaseModel):
    total_users: int
    total_equipment: int
    total_bookings: int
    pending_bookings: int
    total_hosts: int = 0
    active_equipment: int = 0
