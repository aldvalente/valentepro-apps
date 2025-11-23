

from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
import os

app = FastAPI(title="Sportbnb - Noleggio Attrezzature Sportive")

# Database imports
from db.database import init_db, get_db_session
from db.models import Equipment, EquipmentImage, Booking, User


# Serve static frontend
static_dir = os.path.join(os.path.dirname(__file__), '..', 'static')
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Startup event - initialize database and seed demo data
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Starting Sportbnb application...")
    try:
        init_db()
        seed_demo_data()
        print("✓ Application ready!")
    except Exception as e:
        print(f"⚠ Startup error: {e}")


def seed_demo_data():
    """Add demo data if database is empty"""
    from db.database import get_db
    
    with get_db() as db:
        # Check if we already have equipment
        existing = db.query(Equipment).first()
        if existing:
            print("✓ Demo data already exists")
            return
        
        print("📦 Seeding demo data...")
        
        # Create demo host user
        demo_host = User(
            full_name="Demo Host",
            email="host@sportbnb.demo",
            phone="+39 123 456 7890",
            is_host=True
        )
        db.add(demo_host)
        db.flush()  # Get the ID
        
        # Demo equipment data
        equipment_data = [
            {
                "title": "Bici MTB Pro",
                "description": "Mountain bike full carbon, 29 pollici. Perfetta per trail e percorsi impegnativi.",
                "price_per_day": 25.0,
                "city": "Milano",
                "lat": 45.4642,
                "lon": 9.19,
                "images": [
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
                    "https://images.unsplash.com/photo-1518655048521-f130df041f66?auto=format&fit=crop&w=400&q=80"
                ],
                "badge": "Superhost"
            },
            {
                "title": "SUP Gonfiabile",
                "description": "Stand Up Paddle per lago/mare, include pagaia e zaino. Facile da trasportare.",
                "price_per_day": 18.0,
                "city": "Verona",
                "lat": 45.4384,
                "lon": 10.9916,
                "images": [
                    "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
                ],
                "badge": "Amato dagli ospiti"
            },
            {
                "title": "Ciaspole",
                "description": "Ciaspole leggere per escursioni invernali. Adatte a tutti i livelli.",
                "price_per_day": 10.0,
                "city": "Bolzano",
                "lat": 46.4983,
                "lon": 11.3548,
                "images": [
                    "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80"
                ],
                "badge": None
            },
            {
                "title": "Kayak Singolo",
                "description": "Kayak da fiume, leggero e stabile. Include pagaia e giubbotto.",
                "price_per_day": 22.0,
                "city": "Padova",
                "lat": 45.4064,
                "lon": 11.8768,
                "images": [
                    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
                    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80"
                ],
                "badge": "Superhost"
            },
        ]
        
        for idx, eq_data in enumerate(equipment_data):
            images = eq_data.pop("images")
            badge_text = eq_data.pop("badge")
            
            equipment = Equipment(
                host_id=demo_host.id,
                **eq_data
            )
            db.add(equipment)
            db.flush()
            
            # Add images
            for pos, img_url in enumerate(images):
                img = EquipmentImage(
                    equipment_id=equipment.id,
                    url=img_url,
                    position=pos
                )
                db.add(img)
        
        db.commit()
        print("✓ Demo data seeded successfully")

# --- PYDANTIC MODELS FOR API ---
class AttrezzaturaResponse(BaseModel):
    id: str
    nome: str
    descrizione: str
    prezzo_giornaliero: float
    immagini: List[str] = []
    badge: Optional[str] = None
    
    class Config:
        from_attributes = True


class AttrezzaturaCreate(BaseModel):
    nome: str
    descrizione: str
    prezzo_giornaliero: float
    immagini: List[str] = []
    badge: Optional[str] = None


class PrenotazioneResponse(BaseModel):
    id: str
    attrezzatura_id: str
    nome_cliente: str
    data_inizio: str
    data_fine: str
    
    class Config:
        from_attributes = True


class PrenotazioneCreate(BaseModel):
    attrezzatura_id: str
    nome_cliente: str
    data_inizio: str
    data_fine: str


# --- API ENDPOINTS ---

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/api/attrezzature_coords")
def attrezzature_coords(db: Session = Depends(get_db_session)):
    """Get coordinates for all equipment"""
    equipment_list = db.query(Equipment).filter(
        Equipment.lat.isnot(None),
        Equipment.lon.isnot(None)
    ).all()
    
    coords = {}
    for eq in equipment_list:
        coords[str(eq.id)] = (eq.lat, eq.lon)
    
    return coords


@app.get("/api/attrezzature", response_model=List[AttrezzaturaResponse])
def lista_attrezzature(db: Session = Depends(get_db_session)):
    """Get all equipment with images"""
    equipment_list = db.query(Equipment).all()
    
    result = []
    for eq in equipment_list:
        # Get images for this equipment
        images = db.query(EquipmentImage).filter(
            EquipmentImage.equipment_id == eq.id
        ).order_by(EquipmentImage.position).all()
        
        result.append({
            "id": str(eq.id),
            "nome": eq.title,
            "descrizione": eq.description or "",
            "prezzo_giornaliero": eq.price_per_day,
            "immagini": [img.url for img in images],
            "badge": None  # Can be enhanced with host rating logic
        })
    
    return result


@app.post("/api/attrezzature", response_model=AttrezzaturaResponse)
def aggiungi_attrezzatura(a: AttrezzaturaCreate, db: Session = Depends(get_db_session)):
    """Add new equipment"""
    # Get or create demo host
    demo_host = db.query(User).filter(User.email == "host@sportbnb.demo").first()
    if not demo_host:
        demo_host = User(
            full_name="Demo Host",
            email="host@sportbnb.demo",
            is_host=True
        )
        db.add(demo_host)
        db.flush()
    
    # Create equipment
    equipment = Equipment(
        title=a.nome,
        description=a.descrizione,
        price_per_day=a.prezzo_giornaliero,
        host_id=demo_host.id
    )
    db.add(equipment)
    db.flush()
    
    # Add images
    for idx, img_url in enumerate(a.immagini):
        img = EquipmentImage(
            equipment_id=equipment.id,
            url=img_url,
            position=idx
        )
        db.add(img)
    
    db.commit()
    db.refresh(equipment)
    
    return {
        "id": str(equipment.id),
        "nome": equipment.title,
        "descrizione": equipment.description or "",
        "prezzo_giornaliero": equipment.price_per_day,
        "immagini": a.immagini,
        "badge": a.badge
    }


@app.get("/api/prenotazioni", response_model=List[PrenotazioneResponse])
def lista_prenotazioni(db: Session = Depends(get_db_session)):
    """Get all bookings"""
    bookings = db.query(Booking).all()
    
    result = []
    for booking in bookings:
        result.append({
            "id": str(booking.id),
            "attrezzatura_id": str(booking.equipment_id),
            "nome_cliente": booking.customer_name,
            "data_inizio": booking.date_from.isoformat(),
            "data_fine": booking.date_to.isoformat()
        })
    
    return result


@app.post("/api/prenotazioni", response_model=PrenotazioneResponse)
def crea_prenotazione(p: PrenotazioneCreate, db: Session = Depends(get_db_session)):
    """Create a new booking"""
    from datetime import datetime
    from uuid import UUID
    
    # Parse dates
    try:
        date_from = datetime.fromisoformat(p.data_inizio).date()
        date_to = datetime.fromisoformat(p.data_fine).date()
    except:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Verify equipment exists
    try:
        equipment_id = UUID(p.attrezzatura_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid equipment ID")
    
    equipment = db.query(Equipment).filter(Equipment.id == equipment_id).first()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    # Calculate total price
    days = (date_to - date_from).days + 1
    total_price = equipment.price_per_day * days
    
    # Create booking
    booking = Booking(
        equipment_id=equipment_id,
        customer_name=p.nome_cliente,
        date_from=date_from,
        date_to=date_to,
        total_price=total_price,
        status='pending'
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    
    return {
        "id": str(booking.id),
        "attrezzatura_id": str(booking.equipment_id),
        "nome_cliente": booking.customer_name,
        "data_inizio": booking.date_from.isoformat(),
        "data_fine": booking.date_to.isoformat()
    }


# --- OLD APPOINTMENTS API (kept for compatibility) ---

class Appuntamento(BaseModel):
    id: int
    nome: str
    data: datetime
    descrizione: str = ""


class AppuntamentoCreate(BaseModel):
    nome: str
    data: datetime
    descrizione: str = ""


_db: List[Appuntamento] = []
_id_counter = 1

@app.get("/appuntamenti", response_model=List[Appuntamento])
def lista_appuntamenti():
    return _db

@app.post("/appuntamenti", response_model=Appuntamento)
def crea_appuntamento(appuntamento: AppuntamentoCreate):
    global _id_counter
    nuovo = Appuntamento(id=_id_counter, **appuntamento.dict())
    _db.append(nuovo)
    _id_counter += 1
    return nuovo

@app.delete("/appuntamenti/{appuntamento_id}", response_model=Appuntamento)
def cancella_appuntamento(appuntamento_id: int):
    for i, a in enumerate(_db):
        if a.id == appuntamento_id:
            return _db.pop(i)
    raise HTTPException(status_code=404, detail="Appuntamento non trovato")
