# Test Data Documentation

This document describes the test data that is automatically seeded into the database when running migrations.

## Overview

The seed migration (`20241123210000_seed_test_data`) populates the database with sample users, equipment, reviews, and bookings to help with development and testing.

## Test Users

Three test users are created with pre-hashed passwords:

| Email | Password | Role | User ID | Description |
|-------|----------|------|---------|-------------|
| mario.rossi@example.com | `password123` | USER | test-user-1 | Owner of skiing, surfing, tennis, and climbing equipment |
| giulia.bianchi@example.com | `password123` | USER | test-user-2 | Owner of cycling, water sports, hiking, and diving equipment |
| admin@gearbnb.com | `admin123` | ADMIN | test-admin-1 | Administrator account for testing admin features |

## Test Equipment

Ten sports equipment items are created across various categories:

### Winter Sports
1. **Sci Rossignol Experience 88** - `test-equip-1`
   - Sport: Skiing
   - Price: €35/day
   - Location: Cortina d'Ampezzo, BL
   - Owner: Mario Rossi

2. **Snowboard Burton Custom** - `test-equip-2`
   - Sport: Snowboarding
   - Price: €40/day
   - Location: Livigno, SO
   - Owner: Mario Rossi

### Cycling
3. **Mountain Bike Trek X-Caliber** - `test-equip-3`
   - Sport: Cycling
   - Price: €25/day
   - Location: Trento, TN
   - Owner: Giulia Bianchi

4. **Bici da Corsa Bianchi Oltre** - `test-equip-4`
   - Sport: Cycling
   - Price: €50/day
   - Location: Milano, MI
   - Owner: Giulia Bianchi

### Water Sports
5. **Tavola da Surf 7''6"** - `test-equip-5`
   - Sport: Surfing
   - Price: €30/day
   - Location: Forte dei Marmi, LU
   - Owner: Mario Rossi

6. **Kayak da Mare Wilderness Systems** - `test-equip-6`
   - Sport: Kayaking
   - Price: €45/day
   - Location: La Spezia, SP
   - Owner: Giulia Bianchi

### Other Sports
7. **Racchetta da Tennis Wilson Pro Staff** - `test-equip-7`
   - Sport: Tennis
   - Price: €20/day
   - Location: Roma, RM
   - Owner: Mario Rossi

8. **Kit Completo da Trekking** - `test-equip-8`
   - Sport: Hiking
   - Price: €35/day
   - Location: Bolzano, BZ
   - Owner: Giulia Bianchi

9. **Set Arrampicata Completo** - `test-equip-9`
   - Sport: Climbing
   - Price: €40/day
   - Location: Arco, TN
   - Owner: Mario Rossi

10. **Attrezzatura Subacquea Completa** - `test-equip-10`
    - Sport: Diving
    - Price: €60/day
    - Location: Taormina, ME
    - Owner: Giulia Bianchi

## Sample Reviews

Four reviews are created to demonstrate the review system:

1. 5-star review on Sci Rossignol (by Giulia Bianchi)
2. 4-star review on Mountain Bike Trek (by Mario Rossi)
3. 5-star review on Tavola da Surf (by Giulia Bianchi)
4. 4-star review on Racchetta da Tennis (by Admin)

## Sample Bookings

Three bookings are created in different states:

1. **Future booking** - CONFIRMED
   - Equipment: Sci Rossignol
   - User: Giulia Bianchi
   - Dates: 7-10 days from now
   - Total: €105

2. **Upcoming booking** - REQUESTED
   - Equipment: Kayak da Mare
   - User: Mario Rossi
   - Dates: 3-5 days from now
   - Total: €90

3. **Past booking** - COMPLETED
   - Equipment: Bici da Corsa Bianchi
   - User: Admin
   - Dates: 5-3 days ago
   - Total: €100

## How to Use

### Logging In

You can log in to the application using any of the test user credentials:

```
Email: mario.rossi@example.com
Password: password123
```

```
Email: giulia.bianchi@example.com
Password: password123
```

```
Email: admin@gearbnb.com
Password: admin123
```

### Viewing Equipment

After running the migration, browse to the home page to see all 10 test equipment items displayed with:
- Title and description
- Sport type
- Daily price
- Location on the map
- Sample images from Unsplash

### Testing Features

1. **Search & Filter**: Filter equipment by sport type or price range
2. **Equipment Details**: Click on any equipment to view full details, reviews, and booking options
3. **Bookings**: Try creating a booking for available equipment
4. **Reviews**: View existing reviews or add new ones (requires authentication)
5. **Dashboard**: Log in and access your dashboard to manage your equipment and bookings
6. **Admin Features**: Log in with the admin account to test administrative functions

## Verifying the Data

### Using Prisma Studio

The easiest way to verify the test data:

```bash
npm run db:studio
```

Then open http://localhost:5555 to browse all tables and data.

### Using Database Queries

If you have direct database access:

```sql
-- Count test users
SELECT COUNT(*) FROM users WHERE id LIKE 'test-%';
-- Should return: 3

-- Count test equipment
SELECT COUNT(*) FROM equipment WHERE id LIKE 'test-%';
-- Should return: 10

-- Count test reviews
SELECT COUNT(*) FROM reviews WHERE id LIKE 'test-%';
-- Should return: 4

-- Count test bookings
SELECT COUNT(*) FROM bookings WHERE id LIKE 'test-%';
-- Should return: 3

-- List all test users
SELECT id, name, email, role FROM users WHERE id LIKE 'test-%';

-- List all test equipment with prices
SELECT id, title, "sportType", "dailyPrice", "locationAddress" 
FROM equipment 
WHERE id LIKE 'test-%'
ORDER BY "dailyPrice";
```

## Removing Test Data

If you need to remove the test data (e.g., for production), you can run:

```sql
DELETE FROM reviews WHERE id LIKE 'test-%';
DELETE FROM bookings WHERE id LIKE 'test-%';
DELETE FROM equipment WHERE id LIKE 'test-%';
DELETE FROM users WHERE id LIKE 'test-%';
```

Or for a cleaner approach, create a new migration that removes only the test data:

```bash
npx prisma migrate dev --name remove_test_data
```

## Notes

- All test entities use IDs starting with `test-` for easy identification
- Passwords are hashed using bcrypt with 10 rounds, just like production users
- All descriptions are in Italian to match the target audience
- Equipment locations are real Italian cities with accurate coordinates
- Images use Unsplash URLs for realistic equipment photos
- The `ON CONFLICT DO NOTHING` clause prevents errors if the migration is run multiple times

## Purpose

This test data serves several purposes:

1. **Development**: Provides realistic data for local development
2. **Testing**: Enables manual and automated testing of all features
3. **Demonstrations**: Shows potential clients/users how the platform works
4. **Onboarding**: Helps new developers understand the data structure and relationships
5. **UI/UX Testing**: Allows designers to see the interface with real content

## Maintenance

When updating the application schema or adding new features, consider:

1. Updating test data to reflect new fields or relationships
2. Adding new test cases for new equipment types or features
3. Keeping passwords and test data patterns consistent
4. Ensuring all test data is easily identifiable and removable
