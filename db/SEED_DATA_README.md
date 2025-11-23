# 🌱 Seed Data - Sample Products for Sportbnb

This document explains how to populate the database with sample test products for the Sportbnb platform.

## Overview

The `seed_data.py` script creates:
- **3 sample host users** who own the equipment
- **12 sample equipment items** across 4 categories
- **3 placeholder images** per equipment item

## Equipment Categories

### 🚴 Bici (Bikes) - 3 items
1. **Mountain Bike Specialized Stumpjumper** - €45/day - Milano
2. **Bici da Corsa Carbon Trek Emonda** - €60/day - Roma  
3. **E-Bike Città Bosch Performance** - €35/day - Firenze

### ⛷️ Sci (Ski) - 3 items
4. **Sci da Pista Rossignol Experience** - €40/day - Cortina d'Ampezzo
5. **Snowboard Burton Custom X** - €45/day - Courmayeur
6. **Sci da Fondo Fischer Speedmax Classic** - €25/day - Livigno

### 🏄 Acquatici (Water Sports) - 3 items
7. **Kayak Biposto da Mare** - €50/day - Venezia
8. **Stand Up Paddle Gonfiabile** - €30/day - Como
9. **Tavola da Surf Shortboard 6'2"** - €35/day - Genova

### 🏔️ Montagna (Mountain) - 3 items
10. **Set Completo Arrampicata Sportiva** - €40/day - Arco
11. **Ciaspole TSL Symbioz Elite** - €20/day - Bolzano
12. **Zaino da Trekking Deuter 65L** - €15/day - Trento

## Sample Host Users

Three test host accounts are created:

| Name | Email | Password | Specialty |
|------|-------|----------|-----------|
| Marco Bianchi | marco.bianchi@sportbnb.com | host123 | Bikes |
| Laura Rossi | laura.rossi@sportbnb.com | host123 | Ski & Mountain |
| Giovanni Verdi | giovanni.verdi@sportbnb.com | host123 | Water Sports |

## Usage

### Run the seed script

```bash
# From the repository root
python db/seed_data.py
```

Or with explicit database URL:

```bash
DATABASE_URL='sqlite:///./sportbnb.db' python db/seed_data.py
```

### Expected Output

```
🌱 Starting database seeding...
============================================================

📦 Initializing database...

👥 Creating sample hosts...
✓ Created host: Marco Bianchi (marco.bianchi@sportbnb.com)
✓ Created host: Laura Rossi (laura.rossi@sportbnb.com)
✓ Created host: Giovanni Verdi (giovanni.verdi@sportbnb.com)

🏄 Creating sample equipment...
✓ Created equipment: Mountain Bike Specialized Stumpjumper
✓ Created equipment: Bici da Corsa Carbon Trek Emonda
... (12 total)

📸 Adding sample images...
✓ Added images for: Mountain Bike Specialized Stumpjumper
... (12 total)

============================================================
✅ Database seeding completed successfully!
   - Created 3 host users
   - Created 12 equipment items
```

### Idempotent Operation

The seed script is **idempotent** - it can be run multiple times safely:
- If hosts already exist, they are reused
- If equipment already exists, it's skipped
- If images already exist, they're skipped

### Verify the Data

Check the database contents:

```bash
# Count users
sqlite3 sportbnb.db "SELECT COUNT(*) FROM users;"

# Count equipment
sqlite3 sportbnb.db "SELECT COUNT(*) FROM equipment;"

# Equipment by category
sqlite3 sportbnb.db "SELECT category, COUNT(*) FROM equipment GROUP BY category;"
```

Or via the API:

```bash
# List all equipment
curl http://localhost:3000/api/equipment | python -m json.tool

# Get specific equipment details
curl http://localhost:3000/api/equipment/{equipment_id} | python -m json.tool
```

## Testing the Application

After seeding, start the application:

```bash
DATABASE_URL='sqlite:///./sportbnb.db' uvicorn app.main:app --reload --port 3000
```

Then:
1. Visit http://localhost:3000
2. Login with one of the host accounts (e.g., `marco.bianchi@sportbnb.com` / `host123`)
3. Browse the equipment catalog
4. Filter by category
5. View equipment details on the map

## Notes

- **Images**: The script uses placeholder images from picsum.photos. In production, these would be replaced with actual uploaded images.
- **Location Data**: All equipment includes realistic Italian city locations with GPS coordinates for map display.
- **Descriptions**: Each product has detailed Italian descriptions matching the platform's primary language.
- **Rules**: Each equipment item includes rental rules to demonstrate the complete feature set.

## Development Tips

To reset and reseed the database:

```bash
# Remove the database
rm sportbnb.db

# Run the seed script again
python db/seed_data.py
```

## Production Considerations

This seed script is intended for **development and testing only**. For production:
- Don't use these sample accounts
- Replace placeholder images with real photos
- Adjust pricing based on actual market rates
- Verify all location data
- Update descriptions as needed
