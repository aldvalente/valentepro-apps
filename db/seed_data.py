#!/usr/bin/env python3
"""
Seed script to add sample equipment/products for Sportbnb platform.
This creates test users (hosts) and sample equipment in various categories.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from db.database import SessionLocal, init_db
from db.models import User, Equipment, EquipmentImage
from app.auth import get_password_hash
import uuid

def create_sample_hosts(db: Session):
    """Create sample host users"""
    hosts = []
    
    # Host 1 - Marco (Bike specialist)
    host1 = User(
        id=uuid.uuid4(),
        email="marco.bianchi@sportbnb.com",
        full_name="Marco Bianchi",
        first_name="Marco",
        last_name="Bianchi",
        phone="+39 340 1234567",
        hashed_password=get_password_hash("host123"),
        is_host=True,
        is_admin=False,
        email_verified=True,
        preferred_language='it'
    )
    
    # Host 2 - Laura (Ski specialist)
    host2 = User(
        id=uuid.uuid4(),
        email="laura.rossi@sportbnb.com",
        full_name="Laura Rossi",
        first_name="Laura",
        last_name="Rossi",
        phone="+39 347 9876543",
        hashed_password=get_password_hash("host123"),
        is_host=True,
        is_admin=False,
        email_verified=True,
        preferred_language='it'
    )
    
    # Host 3 - Giovanni (Water sports specialist)
    host3 = User(
        id=uuid.uuid4(),
        email="giovanni.verdi@sportbnb.com",
        full_name="Giovanni Verdi",
        first_name="Giovanni",
        last_name="Verdi",
        phone="+39 333 4567890",
        hashed_password=get_password_hash("host123"),
        is_host=True,
        is_admin=False,
        email_verified=True,
        preferred_language='it'
    )
    
    hosts = [host1, host2, host3]
    
    # Check if hosts already exist
    for host in hosts:
        existing = db.query(User).filter(User.email == host.email).first()
        if not existing:
            db.add(host)
            print(f"✓ Created host: {host.full_name} ({host.email})")
        else:
            # Use existing host
            hosts[hosts.index(host)] = existing
            print(f"○ Host already exists: {existing.full_name} ({existing.email})")
    
    db.commit()
    return hosts


def create_sample_equipment(db: Session, hosts):
    """Create sample equipment/products"""
    
    equipment_list = []
    
    # === BICI (Bikes) ===
    
    # 1. Mountain Bike
    bike1 = Equipment(
        id=uuid.uuid4(),
        title="Mountain Bike Specialized Stumpjumper",
        description="Mountain bike professionale perfetta per sentieri di montagna. Sospensione completa, 29 pollici, cambio Shimano XT. Ideale per trail e downhill.",
        price_per_day=45.0,
        category="Bici",
        sport="bike",
        city="Milano",
        address="Via Monte Nero 15",
        country="IT",
        postal_code="20135",
        lat=45.4642,
        lon=9.1900,
        host_id=hosts[0].id,
        available=True,
        rules_text="Casco obbligatorio. Controllare pressione gomme prima dell'uso. Riconsegnare pulita."
    )
    
    # 2. Road Bike
    bike2 = Equipment(
        id=uuid.uuid4(),
        title="Bici da Corsa Carbon Trek Emonda",
        description="Bici da strada in carbonio ultra-leggera. Ideale per ciclisti esperti. Cambio elettronico, ruote da competizione.",
        price_per_day=60.0,
        category="Bici",
        sport="bike",
        city="Roma",
        address="Via Appia Antica 123",
        country="IT",
        postal_code="00179",
        lat=41.8902,
        lon=12.4922,
        host_id=hosts[0].id,
        available=True,
        rules_text="Solo per uso su strada. Scarpe da ciclismo consigliate. Riconsegnare pulita."
    )
    
    # 3. E-Bike
    bike3 = Equipment(
        id=uuid.uuid4(),
        title="E-Bike Città Bosch Performance",
        description="Bici elettrica comoda per città e percorsi turistici. Autonomia 80km, batteria Bosch, cesto anteriore incluso.",
        price_per_day=35.0,
        category="Bici",
        sport="bike",
        city="Firenze",
        address="Piazza della Repubblica 7",
        country="IT",
        postal_code="50123",
        lat=43.7696,
        lon=11.2558,
        host_id=hosts[0].id,
        available=True,
        rules_text="Ricaricare la batteria dopo l'uso. Massimo 100kg di carico totale."
    )
    
    # === SCI (Ski) ===
    
    # 4. Sci da discesa
    ski1 = Equipment(
        id=uuid.uuid4(),
        title="Sci da Pista Rossignol Experience",
        description="Sci all-mountain adatti a tutti i livelli. Lunghezza 170cm, con attacchi Look. Perfetti per piste rosse e nere.",
        price_per_day=40.0,
        category="Sci",
        sport="ski",
        city="Cortina d'Ampezzo",
        address="Corso Italia 85",
        country="IT",
        postal_code="32043",
        lat=46.5369,
        lon=12.1357,
        host_id=hosts[1].id,
        available=True,
        rules_text="Controllare attacchi prima dell'uso. Scarponi NON inclusi. Riconsegnare asciutti."
    )
    
    # 5. Snowboard
    ski2 = Equipment(
        id=uuid.uuid4(),
        title="Snowboard Burton Custom X",
        description="Tavola freeride avanzata, 158cm. Perfetta per fuoripista e park. Include attacchi Burton.",
        price_per_day=45.0,
        category="Sci",
        sport="snowboard",
        city="Courmayeur",
        address="Via Roma 42",
        country="IT",
        postal_code="11013",
        lat=45.7960,
        lon=6.9698,
        host_id=hosts[1].id,
        available=True,
        rules_text="Casco raccomandato. Scarponi NON inclusi. Controllare attacchi prima dell'uso."
    )
    
    # 6. Sci da fondo
    ski3 = Equipment(
        id=uuid.uuid4(),
        title="Sci da Fondo Fischer Speedmax Classic",
        description="Sci da fondo stile classico, 195cm. Leggeri e veloci, ideali per principianti e intermedi.",
        price_per_day=25.0,
        category="Sci",
        sport="ski",
        city="Livigno",
        address="Via Saroch 123",
        country="IT",
        postal_code="23030",
        lat=46.5345,
        lon=10.1378,
        host_id=hosts[1].id,
        available=True,
        rules_text="Include bastoncini. Scarponi da fondo NON inclusi. Usare solo su piste da fondo."
    )
    
    # === ACQUATICI (Water Sports) ===
    
    # 7. Kayak
    water1 = Equipment(
        id=uuid.uuid4(),
        title="Kayak Biposto da Mare",
        description="Kayak stabile per 2 persone. Include 2 pagaie, 2 giubbotti salvagente, sacca impermeabile. Perfetto per principianti.",
        price_per_day=50.0,
        category="Acquatici",
        sport="kayak",
        city="Venezia",
        address="Fondamenta delle Zattere 1234",
        country="IT",
        postal_code="30123",
        lat=45.4408,
        lon=12.3155,
        host_id=hosts[2].id,
        available=True,
        rules_text="Giubbotto salvagente obbligatorio. Controllo meteo prima dell'uscita. Pulizia dopo l'uso."
    )
    
    # 8. Stand Up Paddle (SUP)
    water2 = Equipment(
        id=uuid.uuid4(),
        title="Stand Up Paddle Gonfiabile",
        description="SUP gonfiabile con pompa elettrica inclusa. Lunghezza 3.2m, larghezza 81cm. Stabile e facile da trasportare.",
        price_per_day=30.0,
        category="Acquatici",
        sport="sup",
        city="Como",
        address="Piazza Cavour 1",
        country="IT",
        postal_code="22100",
        lat=45.8081,
        lon=9.0852,
        host_id=hosts[2].id,
        available=True,
        rules_text="Gonfiare completamente prima dell'uso. Include pagaia e leash. Giubbotto consigliato."
    )
    
    # 9. Surf
    water3 = Equipment(
        id=uuid.uuid4(),
        title="Tavola da Surf Shortboard 6'2\"",
        description="Tavola corta per surfisti intermedi/avanzati. Ideale per onde da 1 a 2 metri. Include leash e paraffina.",
        price_per_day=35.0,
        category="Acquatici",
        sport="surf",
        city="Genova",
        address="Corso Italia 67",
        country="IT",
        postal_code="16145",
        lat=44.4056,
        lon=8.9463,
        host_id=hosts[2].id,
        available=True,
        rules_text="Esperienza richiesta. Controllare condizioni del mare. Muta NON inclusa."
    )
    
    # === MONTAGNA (Mountain Sports) ===
    
    # 10. Set da Arrampicata
    mountain1 = Equipment(
        id=uuid.uuid4(),
        title="Set Completo Arrampicata Sportiva",
        description="Kit completo: imbracatura, scarpette (taglia 42), casco, 12 rinvii, sacca porta magnesite. Per falesia.",
        price_per_day=40.0,
        category="Montagna",
        sport="climbing",
        city="Arco",
        address="Via Serafini 23",
        country="IT",
        postal_code="38062",
        lat=45.9182,
        lon=10.8856,
        host_id=hosts[1].id,
        available=True,
        rules_text="Esperienza certificata richiesta. Controllare usura materiali. Corda NON inclusa."
    )
    
    # 11. Ciaspole (Racchette da neve)
    mountain2 = Equipment(
        id=uuid.uuid4(),
        title="Ciaspole TSL Symbioz Elite",
        description="Racchette da neve moderne con sistema di ramponi avanzato. Include bastoncini regolabili. Taglia universale.",
        price_per_day=20.0,
        category="Montagna",
        sport="hiking",
        city="Bolzano",
        address="Via Alto Adige 45",
        country="IT",
        postal_code="39100",
        lat=46.4983,
        lon=11.3548,
        host_id=hosts[1].id,
        available=True,
        rules_text="Adatte a tutti i livelli. Scarponi da trekking richiesti. Non usare su ghiaccio puro."
    )
    
    # 12. Zaino da Trekking
    mountain3 = Equipment(
        id=uuid.uuid4(),
        title="Zaino da Trekking Deuter 65L",
        description="Zaino grande per trekking di più giorni. Sistema di ventilazione dorsale, copertura antipioggia inclusa.",
        price_per_day=15.0,
        category="Montagna",
        sport="hiking",
        city="Trento",
        address="Via Manci 12",
        country="IT",
        postal_code="38122",
        lat=46.0664,
        lon=11.1257,
        host_id=hosts[1].id,
        available=True,
        rules_text="Pulire e asciugare dopo l'uso. Regolare bene gli spallacci. Peso max consigliato 18kg."
    )
    
    equipment_list = [bike1, bike2, bike3, ski1, ski2, ski3, water1, water2, water3, mountain1, mountain2, mountain3]
    
    # Add equipment to database
    for equipment in equipment_list:
        existing = db.query(Equipment).filter(Equipment.title == equipment.title).first()
        if not existing:
            db.add(equipment)
            print(f"✓ Created equipment: {equipment.title}")
        else:
            print(f"○ Equipment already exists: {existing.title}")
    
    db.commit()
    return equipment_list


def create_sample_images(db: Session):
    """Add sample images to equipment"""
    # Note: Using placeholder images from picsum.photos
    # In production, these would be actual uploaded images
    
    equipment = db.query(Equipment).all()
    
    for eq in equipment:
        # Check if images already exist
        existing_images = db.query(EquipmentImage).filter(EquipmentImage.equipment_id == eq.id).count()
        if existing_images > 0:
            print(f"○ Images already exist for: {eq.title}")
            continue
        
        # Add 3 placeholder images per equipment
        for i in range(3):
            image = EquipmentImage(
                id=uuid.uuid4(),
                equipment_id=eq.id,
                url=f"https://picsum.photos/seed/{eq.id}-{i}/800/600",
                position=i
            )
            db.add(image)
        
        print(f"✓ Added images for: {eq.title}")
    
    db.commit()


def seed_database():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    print("=" * 60)
    
    # Initialize database tables
    print("\n📦 Initializing database...")
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create sample hosts
        print("\n👥 Creating sample hosts...")
        hosts = create_sample_hosts(db)
        
        # Create sample equipment
        print("\n🏄 Creating sample equipment...")
        equipment = create_sample_equipment(db, hosts)
        
        # Add sample images
        print("\n📸 Adding sample images...")
        create_sample_images(db)
        
        print("\n" + "=" * 60)
        print("✅ Database seeding completed successfully!")
        print(f"   - Created {len(hosts)} host users")
        print(f"   - Created {len(equipment)} equipment items")
        print("\n📝 You can login with any host account:")
        print("   Email: marco.bianchi@sportbnb.com")
        print("   Email: laura.rossi@sportbnb.com")
        print("   Email: giovanni.verdi@sportbnb.com")
        print("   Password: host123")
        print("\n🚀 Start the app with: uvicorn app.main:app --reload --port 3000")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
