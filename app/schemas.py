"""Pydantic schemas for API requests/responses"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from uuid import UUID


# Auth schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None


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
    phone: Optional[str]
    is_host: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Equipment schemas
class EquipmentImageSchema(BaseModel):
    id: UUID
    url: str
    position: int
    
    class Config:
        from_attributes = True


class EquipmentBase(BaseModel):
    title: str
    description: Optional[str]
    price_per_day: float
    city: Optional[str]
    category: Optional[str]
    lat: Optional[float]
    lon: Optional[float]


class EquipmentCreate(EquipmentBase):
    image_urls: List[str] = []


class EquipmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price_per_day: Optional[float] = None
    city: Optional[str] = None
    category: Optional[str] = None
    available: Optional[bool] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class EquipmentResponse(EquipmentBase):
    id: UUID
    available: bool
    category: Optional[str]
    host_id: Optional[UUID]
    created_at: datetime
    images: List[EquipmentImageSchema] = []
    
    class Config:
        from_attributes = True


class EquipmentListItem(BaseModel):
    id: UUID
    title: str
    price_per_day: float
    city: Optional[str]
    category: Optional[str]
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
    date_from: date
    date_to: date
    total_price: float
    status: str
    notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Admin schemas
class AdminStats(BaseModel):
    total_users: int
    total_equipment: int
    total_bookings: int
    pending_bookings: int
