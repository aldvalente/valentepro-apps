"""Main FastAPI application - Sportbnb Equipment Rental"""
import os
import logging
import smtplib
from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import timedelta, date, datetime
import uuid

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment
env_file = os.path.join(os.path.dirname(__file__), '..', 'db', '.env.dokku')
if os.path.exists(env_file):
    with open(env_file) as f:
        for line in f:
            if line.strip() and not line.startswith('#') and '=' in line:
                k, v = line.strip().split('=', 1)
                os.environ.setdefault(k, v)

from db.database import get_db_session, init_db
from db.models import User, Equipment, EquipmentImage, Booking, Review, Message, Payment
from app.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_auth, require_admin,
    generate_verification_token, generate_password_reset_token,
    PASSWORD_RESET_EXPIRE_HOURS
)
from app.schemas import (
    UserRegister, UserLogin, Token, UserProfile, PasswordResetRequest, PasswordReset,
    EquipmentCreate, EquipmentUpdate, EquipmentResponse, EquipmentListItem,
    BookingCreate, BookingResponse, BookingStatusUpdate,
    ReviewCreate, ReviewResponse,
    MessageCreate, MessageResponse,
    AdminStats
)
from app.i18n import t, get_user_language
from app.email_service import (
    send_verification_email, send_password_reset_email,
    send_booking_confirmation_guest, send_booking_confirmation_host,
    send_booking_cancelled_email, send_new_message_notification
)

app = FastAPI(title="Sportbnb - Equipment Rental Platform")

# Serve static files
static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
async def startup_event():
    """Initialize database and seed data on startup"""
    print("🚀 Starting Sportbnb application...")
    
    # Create tables
    init_db()
    
    # Seed initial data
    db = next(get_db_session())
    try:
        # Create admin user if not exists
        admin = db.query(User).filter(User.email == "admin@sportbnb.com").first()
        if not admin:
            try:
                admin = User(
                    email="admin@sportbnb.com",
                    full_name="Admin User",
                    hashed_password=get_password_hash("admin123"),
                    is_admin=True,
                    is_host=True,
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print("✓ Admin user created (admin@sportbnb.com / admin123)")
            except Exception as e:
                db.rollback()
                print(f"⚠️ Could not create admin user: {e}")
                # Try to find existing admin
                admin = db.query(User).filter(User.email == "admin@sportbnb.com").first()
                if not admin:
                    print("❌ No admin user found and could not create one")
                    return
        
        # Create demo equipment if none exists
        if db.query(Equipment).count() == 0:
            demo_equipment = [
                {
                    "title": "Bici MTB Pro",
                    "description": "Mountain bike full carbon, 29 pollici. Perfetta per trail e percorsi impegnativi.",
                    "price_per_day": 25.0,
                    "city": "Milano",
                    "category": "bici",
                    "lat": 45.4642,
                    "lon": 9.19,
                    "available": True,
                    "host_id": admin.id,
                    "images": [
                        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=400&h=300&fit=crop"
                    ]
                },
                {
                    "title": "SUP Gonfiabile",
                    "description": "Stand Up Paddle per lago/mare, include pagaia e zaino. Facile da trasportare.",
                    "price_per_day": 18.0,
                    "city": "Verona",
                    "category": "acquatici",
                    "lat": 45.4384,
                    "lon": 10.9916,
                    "available": True,
                    "host_id": admin.id,
                    "images": [
                        "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop"
                    ]
                },
                {
                    "title": "Ciaspole",
                    "description": "Ciaspole leggere per escursioni invernali. Adatte a tutti i livelli.",
                    "price_per_day": 10.0,
                    "city": "Bolzano",
                    "category": "montagna",
                    "lat": 46.4983,
                    "lon": 11.3548,
                    "available": True,
                    "host_id": admin.id,
                    "images": [
                        "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=300&fit=crop"
                    ]
                },
                {
                    "title": "Kayak Singolo",
                    "description": "Kayak da fiume, leggero e stabile. Include pagaia e giubbotto.",
                    "price_per_day": 22.0,
                    "city": "Padova",
                    "category": "acquatici",
                    "lat": 45.4064,
                    "lon": 11.8768,
                    "available": True,
                    "host_id": admin.id,
                    "images": [
                        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&h=300&fit=crop",
                        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=400&h=300&fit=crop"
                    ]
                }
            ]
            
            for eq_data in demo_equipment:
                images = eq_data.pop("images")
                equipment = Equipment(**eq_data)
                db.add(equipment)
                db.flush()
                
                for idx, img_url in enumerate(images):
                    img = EquipmentImage(equipment_id=equipment.id, url=img_url, position=idx)
                    db.add(img)
            
            db.commit()
            print("✓ Demo equipment added")
        
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()


# Root redirect
@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/static/index.html")


# ========== AUTH ENDPOINTS ==========

@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserRegister, db: Session = Depends(get_db_session)):
    """Register a new user"""
    lang = user_data.preferred_language or 'it'
    
    # Check if user exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=400, 
            detail=t('auth.email_already_registered', lang)
        )
    
    # Generate email verification token
    verification_token = generate_verification_token()
    
    # Create user
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        hashed_password=get_password_hash(user_data.password),
        preferred_language=lang,
        email_verified=False,
        email_verification_token=verification_token,
        is_host=False,
        is_admin=False,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send verification email
    try:
        send_verification_email(
            user.email,
            user.full_name,
            verification_token,
            lang
        )
    except smtplib.SMTPException as e:
        logger.warning(f"SMTP error sending verification email: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending verification email: {e}")
    
    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db_session)):
    """Login with email and password"""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserProfile)
def get_me(current_user: User = Depends(require_auth)):
    """Get current user profile"""
    return current_user


@app.post("/api/auth/become-host")
def become_host(current_user: User = Depends(require_auth), db: Session = Depends(get_db_session)):
    """User requests to become a host"""
    lang = get_user_language(current_user)
    current_user.is_host = True
    db.commit()
    return {"message": t('auth.now_host', lang)}


@app.get("/api/auth/verify-email")
def verify_email(token: str, db: Session = Depends(get_db_session)):
    """Verify user email with token"""
    user = db.query(User).filter(User.email_verification_token == token).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail=t('auth.token_invalid', 'it')
        )
    
    user.email_verified = True
    user.email_verification_token = None
    db.commit()
    
    lang = get_user_language(user)
    return {"message": t('auth.email_verified_success', lang)}


@app.post("/api/auth/forgot-password")
def forgot_password(request: PasswordResetRequest, db: Session = Depends(get_db_session)):
    """Request password reset email"""
    user = db.query(User).filter(User.email == request.email).first()
    
    # Always return success to prevent email enumeration
    if not user:
        return {"message": t('auth.password_reset_sent', 'it')}
    
    # Generate reset token
    reset_token = generate_password_reset_token()
    user.password_reset_token = reset_token
    user.password_reset_expires = datetime.utcnow() + timedelta(hours=PASSWORD_RESET_EXPIRE_HOURS)
    db.commit()
    
    # Send reset email
    lang = get_user_language(user)
    try:
        send_password_reset_email(
            user.email,
            user.full_name,
            reset_token,
            lang
        )
    except smtplib.SMTPException as e:
        logger.warning(f"SMTP error sending password reset email: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending password reset email: {e}")
    
    return {"message": t('auth.password_reset_sent', lang)}


@app.post("/api/auth/reset-password")
def reset_password(request: PasswordReset, db: Session = Depends(get_db_session)):
    """Reset password with token"""
    user = db.query(User).filter(User.password_reset_token == request.token).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail=t('auth.token_invalid', 'it')
        )
    
    # Check if token expired
    if user.password_reset_expires and user.password_reset_expires < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail=t('auth.password_reset_expired', get_user_language(user))
        )
    
    # Update password
    user.hashed_password = get_password_hash(request.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()
    
    lang = get_user_language(user)
    return {"message": t('auth.password_reset_success', lang)}


# ========== EQUIPMENT ENDPOINTS ==========

@app.get("/api/equipment", response_model=List[EquipmentListItem])
def list_equipment(
    search: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    available: bool = True,
    db: Session = Depends(get_db_session)
):
    """List all equipment with optional filters"""
    query = db.query(Equipment)
    
    if available:
        query = query.filter(Equipment.available == True)
    
    if search:
        query = query.filter(
            or_(
                Equipment.title.ilike(f"%{search}%"),
                Equipment.description.ilike(f"%{search}%"),
                Equipment.city.ilike(f"%{search}%")
            )
        )
    
    if city:
        query = query.filter(Equipment.city.ilike(f"%{city}%"))
    
    if category:
        query = query.filter(Equipment.category == category)
    
    equipment_list = query.order_by(Equipment.created_at.desc()).all()
    
    # Format response with image URLs
    result = []
    for eq in equipment_list:
        result.append({
            "id": eq.id,
            "title": eq.title,
            "price_per_day": eq.price_per_day,
            "city": eq.city,
            "category": eq.category,
            "sport": eq.sport,
            "available": eq.available,
            "images": [img.url for img in sorted(eq.images, key=lambda x: x.position)],
            "lat": eq.lat,
            "lon": eq.lon
        })
    
    return result


@app.get("/api/equipment/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(equipment_id: uuid.UUID, db: Session = Depends(get_db_session)):
    """Get equipment details"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@app.post("/api/equipment", response_model=EquipmentResponse)
def create_equipment(
    data: EquipmentCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Create new equipment (hosts only)"""
    if not current_user.is_host and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You must be a host to add equipment")
    
    equipment = Equipment(
        title=data.title,
        description=data.description,
        price_per_day=data.price_per_day,
        city=data.city,
        category=data.category,
        lat=data.lat,
        lon=data.lon,
        host_id=current_user.id,
        available=True
    )
    db.add(equipment)
    db.flush()
    
    # Add images
    for idx, url in enumerate(data.image_urls):
        img = EquipmentImage(equipment_id=equipment.id, url=url, position=idx)
        db.add(img)
    
    db.commit()
    db.refresh(equipment)
    return equipment


@app.put("/api/equipment/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: uuid.UUID,
    data: EquipmentUpdate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Update equipment (owner or admin only)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Update fields
    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(equipment, key, value)
    
    db.commit()
    db.refresh(equipment)
    return equipment


@app.delete("/api/equipment/{equipment_id}")
def delete_equipment(
    equipment_id: uuid.UUID,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Delete equipment (owner or admin only)"""
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    if equipment.host_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db.delete(equipment)
    db.commit()
    return {"message": "Equipment deleted"}


@app.get("/api/equipment/my", response_model=List[EquipmentListItem])
def my_equipment(current_user: User = Depends(require_auth), db: Session = Depends(get_db_session)):
    """Get current user's equipment"""
    equipment_list = db.query(Equipment).filter(Equipment.host_id == current_user.id).all()
    
    result = []
    for eq in equipment_list:
        result.append({
            "id": eq.id,
            "title": eq.title,
            "price_per_day": eq.price_per_day,
            "city": eq.city,
            "category": eq.category,
            "sport": eq.sport,
            "available": eq.available,
            "images": [img.url for img in sorted(eq.images, key=lambda x: x.position)],
            "lat": eq.lat,
            "lon": eq.lon
        })
    
    return result


# ========== BOOKING ENDPOINTS ==========

@app.post("/api/bookings", response_model=BookingResponse)
def create_booking(
    data: BookingCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Create a new booking"""
    lang = get_user_language(current_user)
    
    # Check equipment exists
    equipment = db.query(Equipment).filter(Equipment.id == data.equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail=t('equipment.not_found', lang))
    
    if not equipment.available:
        raise HTTPException(status_code=400, detail=t('equipment.not_available', lang))
    
    # Check for overlapping bookings
    overlaps = db.query(Booking).filter(
        Booking.equipment_id == data.equipment_id,
        Booking.status.in_(["pending", "confirmed"]),
        or_(
            Booking.date_from.between(data.date_from, data.date_to),
            Booking.date_to.between(data.date_from, data.date_to),
            ((Booking.date_from <= data.date_from) & (Booking.date_to >= data.date_to))
        )
    ).first()
    
    if overlaps:
        raise HTTPException(status_code=400, detail=t('booking.already_booked', lang))
    
    # Calculate total price
    days = (data.date_to - data.date_from).days + 1
    total_price = float(equipment.price_per_day) * days
    
    # Create booking
    booking = Booking(
        equipment_id=data.equipment_id,
        user_id=current_user.id,
        host_id=equipment.host_id,
        date_from=data.date_from,
        date_to=data.date_to,
        total_price=total_price,
        notes=data.notes,
        status="pending"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    # Send confirmation emails
    try:
        # Email to guest
        send_booking_confirmation_guest(
            current_user.email,
            current_user.full_name,
            equipment.title,
            str(data.date_from),
            str(data.date_to),
            total_price,
            lang
        )
        
        # Email to host
        if equipment.host:
            host_lang = get_user_language(equipment.host)
            send_booking_confirmation_host(
                equipment.host.email,
                equipment.host.full_name,
                equipment.title,
                current_user.full_name,
                str(data.date_from),
                str(data.date_to),
                total_price,
                host_lang
            )
    except smtplib.SMTPException as e:
        logger.warning(f"SMTP error sending booking confirmation emails: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending booking confirmation emails: {e}")
    
    return booking


@app.get("/api/bookings/my", response_model=List[BookingResponse])
def my_bookings(current_user: User = Depends(require_auth), db: Session = Depends(get_db_session)):
    """Get current user's bookings"""
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()
    return bookings


@app.patch("/api/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: uuid.UUID,
    status_update: BookingStatusUpdate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Update booking status (owner of equipment, guest for cancel, or admin only)"""
    lang = get_user_language(current_user)
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail=t('booking.not_found', lang))
    
    equipment = db.query(Equipment).filter(Equipment.id == booking.equipment_id).first()
    
    # Check permissions
    is_host = equipment.host_id == current_user.id
    is_guest = booking.user_id == current_user.id
    is_admin = current_user.is_admin
    
    # Only host can confirm/reject, guest can cancel, admin can do all
    if status_update.status in ["confirmed", "rejected"] and not (is_host or is_admin):
        raise HTTPException(status_code=403, detail=t('auth.insufficient_permissions', lang))
    
    if status_update.status == "cancelled" and not (is_host or is_guest or is_admin):
        raise HTTPException(status_code=403, detail=t('auth.insufficient_permissions', lang))
    
    if status_update.status not in ["pending", "confirmed", "rejected", "cancelled", "completed"]:
        raise HTTPException(status_code=400, detail=t('booking.invalid_status', lang))
    
    booking.status = status_update.status
    db.commit()
    
    # Send cancellation emails if cancelled
    if status_update.status == "cancelled":
        try:
            # Email to guest
            if booking.user:
                guest_lang = get_user_language(booking.user)
                send_booking_cancelled_email(
                    booking.user.email,
                    booking.user.full_name,
                    equipment.title,
                    str(booking.date_from),
                    str(booking.date_to),
                    guest_lang
                )
            
            # Email to host
            if equipment.host:
                host_lang = get_user_language(equipment.host)
                send_booking_cancelled_email(
                    equipment.host.email,
                    equipment.host.full_name,
                    equipment.title,
                    str(booking.date_from),
                    str(booking.date_to),
                    host_lang
                )
        except smtplib.SMTPException as e:
            logger.warning(f"SMTP error sending cancellation emails: {e}")
        except Exception as e:
            logger.error(f"Unexpected error sending cancellation emails: {e}")
    
    return {"message": t('booking.status_updated', lang)}


# ========== REVIEW ENDPOINTS ==========

@app.post("/api/reviews", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Create a review for a completed booking"""
    lang = get_user_language(current_user)
    
    # Check booking exists and belongs to user
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail=t('booking.not_found', lang))
    
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail=t('auth.insufficient_permissions', lang))
    
    # Check booking is completed
    if booking.status != "completed":
        raise HTTPException(status_code=400, detail=t('review.booking_not_completed', lang))
    
    # Check if already reviewed
    existing = db.query(Review).filter(Review.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=t('review.already_reviewed', lang))
    
    # Validate rating
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail=t('review.invalid_rating', lang))
    
    # Create review
    review = Review(
        booking_id=data.booking_id,
        equipment_id=booking.equipment_id,
        author_id=current_user.id,
        rating=data.rating,
        comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    
    return review


@app.get("/api/equipment/{equipment_id}/reviews", response_model=List[ReviewResponse])
def get_equipment_reviews(
    equipment_id: uuid.UUID,
    db: Session = Depends(get_db_session)
):
    """Get all reviews for equipment"""
    reviews = db.query(Review).filter(
        Review.equipment_id == equipment_id
    ).order_by(Review.created_at.desc()).all()
    
    return reviews


# ========== MESSAGE ENDPOINTS ==========

@app.post("/api/messages", response_model=MessageResponse)
def create_message(
    data: MessageCreate,
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Send a message to another user"""
    lang = get_user_language(current_user)
    
    # Check receiver exists
    receiver = db.query(User).filter(User.id == data.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail=t('auth.user_not_found', lang))
    
    # Create message
    message = Message(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        booking_id=data.booking_id,
        text=data.text,
        read=False
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    
    # Send email notification
    try:
        receiver_lang = get_user_language(receiver)
        send_new_message_notification(
            receiver.email,
            receiver.full_name,
            current_user.full_name,
            data.text,
            receiver_lang
        )
    except smtplib.SMTPException as e:
        logger.warning(f"SMTP error sending message notification: {e}")
    except Exception as e:
        logger.error(f"Unexpected error sending message notification: {e}")
    
    return message


@app.get("/api/messages/thread", response_model=List[MessageResponse])
def get_message_thread(
    user_id: Optional[uuid.UUID] = Query(None),
    booking_id: Optional[uuid.UUID] = Query(None),
    current_user: User = Depends(require_auth),
    db: Session = Depends(get_db_session)
):
    """Get message thread with a user or for a booking"""
    query = db.query(Message)
    
    if booking_id:
        # Messages for a specific booking
        query = query.filter(Message.booking_id == booking_id)
    elif user_id:
        # Messages between current user and another user
        query = query.filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == user_id),
                (Message.sender_id == user_id) & (Message.receiver_id == current_user.id)
            )
        )
    else:
        # All messages involving current user
        query = query.filter(
            or_(
                Message.sender_id == current_user.id,
                Message.receiver_id == current_user.id
            )
        )
    
    messages = query.order_by(Message.created_at.asc()).all()
    
    # Mark received messages as read
    for msg in messages:
        if msg.receiver_id == current_user.id and not msg.read:
            msg.read = True
    db.commit()
    
    return messages


# ========== ADMIN ENDPOINTS ==========

@app.get("/api/admin/stats", response_model=AdminStats)
def admin_stats(current_user: User = Depends(require_admin), db: Session = Depends(get_db_session)):
    """Get admin dashboard statistics"""
    total_users = db.query(func.count(User.id)).scalar()
    total_hosts = db.query(func.count(User.id)).filter(User.is_host == True).scalar()
    total_equipment = db.query(func.count(Equipment.id)).scalar()
    active_equipment = db.query(func.count(Equipment.id)).filter(Equipment.available == True).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    pending_bookings = db.query(func.count(Booking.id)).filter(Booking.status == "pending").scalar()
    
    return {
        "total_users": total_users,
        "total_hosts": total_hosts,
        "total_equipment": total_equipment,
        "active_equipment": active_equipment,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings
    }


@app.get("/api/admin/users", response_model=List[UserProfile])
def admin_list_users(current_user: User = Depends(require_admin), db: Session = Depends(get_db_session)):
    """List all users (admin only)"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@app.get("/api/admin/bookings", response_model=List[BookingResponse])
def admin_list_bookings(current_user: User = Depends(require_admin), db: Session = Depends(get_db_session)):
    """List all bookings (admin only)"""
    bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return bookings


# Legacy endpoint for backwards compatibility
@app.get("/api/attrezzature")
def legacy_attrezzature(db: Session = Depends(get_db_session)):
    """Legacy endpoint - redirects to /api/equipment"""
    return list_equipment(db=db)
