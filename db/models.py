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
    full_name = Column(String, nullable=False)  # Keep for backwards compatibility
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    phone = Column(String)
    preferred_language = Column(String, default='it')  # 'it' or 'en'
    email_verified = Column(Boolean, default=False)
    email_verification_token = Column(String)
    password_reset_token = Column(String)
    password_reset_expires = Column(TIMESTAMP(timezone=True))
    is_host = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    hosted_equipment = relationship("Equipment", back_populates="host")
    bookings = relationship("Booking", foreign_keys="[Booking.user_id]", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")
    reviews = relationship("Review", back_populates="author")


class Equipment(Base):
    __tablename__ = "equipment"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    price_per_day = Column(Float, nullable=False, default=0)
    city = Column(String, index=True)
    category = Column(String, index=True)  # bici, sci, kayak, etc.
    sport = Column(String, index=True)  # bike, ski, tennis, etc.
    address = Column(String)  # via, numero civico
    country = Column(String, default='IT')
    postal_code = Column(String)
    rules_text = Column(Text)  # Regole di noleggio
    available = Column(Boolean, default=True)
    lat = Column(Float)
    lon = Column(Float)
    host_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    host = relationship("User", back_populates="hosted_equipment")
    images = relationship("EquipmentImage", back_populates="equipment", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="equipment", cascade="all, delete-orphan")
    availability = relationship("EquipmentAvailability", back_populates="equipment", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="equipment", cascade="all, delete-orphan")
    
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
    host_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"), index=True)  # Redundant but useful
    customer_name = Column(String)  # For bookings without user accounts (deprecated, use user_id)
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    total_price = Column(Float, nullable=False, default=0)
    status = Column(String, nullable=False, default='pending')  # pending, confirmed, rejected, cancelled, completed
    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="bookings")
    user = relationship("User", foreign_keys=[user_id], back_populates="bookings")
    host = relationship("User", foreign_keys=[host_id])
    messages = relationship("Message", back_populates="booking", cascade="all, delete-orphan")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('date_to >= date_from', name='check_date_range'),
    )


class EquipmentAvailability(Base):
    """Availability calendar for equipment"""
    __tablename__ = "equipment_availability"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    equipment_id = Column(UUID(), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    date_from = Column(Date, nullable=False)
    date_to = Column(Date, nullable=False)
    available = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    equipment = relationship("Equipment", back_populates="availability")


class Review(Base):
    """Reviews for equipment after booking completion"""
    __tablename__ = "reviews"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    equipment_id = Column(UUID(), ForeignKey("equipment.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    rating = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="review")
    equipment = relationship("Equipment", back_populates="reviews")
    author = relationship("User", back_populates="reviews")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    )


class Message(Base):
    """Messages between guests and hosts"""
    __tablename__ = "messages"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(), ForeignKey("bookings.id", ondelete="CASCADE"), index=True)
    sender_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    receiver_id = Column(UUID(), ForeignKey("users.id", ondelete="SET NULL"), nullable=False, index=True)
    text = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


class Payment(Base):
    """Payment tracking for bookings"""
    __tablename__ = "payments"
    
    id = Column(UUID(), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default='EUR')
    status = Column(String, nullable=False, default='pending')  # pending, paid, failed
    payment_method = Column(String)  # stripe, paypal, manual, etc.
    transaction_id = Column(String)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    booking = relationship("Booking", back_populates="payment")
