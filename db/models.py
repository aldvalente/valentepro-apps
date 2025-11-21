"""SQLAlchemy models for Sportbnb equipment rental application"""
from sqlalchemy import Column, String, Float, Integer, Boolean, Date, ForeignKey, TIMESTAMP, CheckConstraint, Index, Text, TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()


# UUID type compatible with both PostgreSQL and SQLite
class UUID(TypeDecorator):
    """Platform-independent GUID type. Uses PostgreSQL's UUID type, otherwise uses CHAR(36)."""
    impl = CHAR
    cache_ok = True
    
    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID())
        else:
            return dialect.type_descriptor(CHAR(36))
    
    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)
    
    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    phone = Column(String)
    is_host = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    hosted_equipment = relationship("Equipment", back_populates="host")
    bookings = relationship("Booking", back_populates="user")


class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    price_per_day = Column(Float, nullable=False, default=0)
    city = Column(String, index=True)
    category = Column(String, index=True)
    available = Column(Boolean, default=True)
    lat = Column(Float)
    lon = Column(Float)
    host_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    host = relationship("User", back_populates="hosted_equipment")
    images = relationship("EquipmentImage", back_populates="equipment", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="equipment", cascade="all, delete-orphan")
    
    # Index for geo queries
    __table_args__ = (
        Index('idx_equipment_coords', 'lat', 'lon'),
    )


class EquipmentImage(Base):
    __tablename__ = "equipment_images"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    equipment_id = Column(UUID(), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    position = Column(Integer, default=0)
    
    # Relationships
    equipment = relationship("Equipment", back_populates="images")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    equipment_id = Column(UUID(), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    customer_name = Column(String, nullable=False)  # For bookings without user accounts
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False, default=0)
    status = Column(String, nullable=False, default='pending')  # pending, confirmed, cancelled
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="bookings")
    user = relationship("User", back_populates="bookings")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('date_to >= date_from', name='check_date_range'),
    )
