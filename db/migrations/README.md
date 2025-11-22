# Database Migrations

This directory contains SQL migration scripts for the Sportbnb database.

## Migration Files

- **0001_create_tables.sql** - Initial schema (users, equipment, equipment_images, bookings)
- **0002_add_enhanced_features.sql** - Enhanced features (reviews, messages, payments, availability, extended fields)

## Running Migrations

### Using the Migration Runner

The migration runner (`db/run_migrations.py`) applies migrations in order and tracks which ones have been applied:

```bash
# Set environment variables
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=your_password
export PGDATABASE=sportbnb

# Run migrations
python3 db/run_migrations.py
```

Or with a DSN:

```bash
python3 db/run_migrations.py --dsn "postgresql://user:pass@host:5432/dbname"
```

Or with an env file:

```bash
python3 db/run_migrations.py --env-file db/.env.local
```

### What the Migration Runner Does

1. Creates a `schema_migrations` table to track applied migrations
2. Lists all `.sql` files in `db/migrations/` directory
3. Applies only the migrations that haven't been applied yet
4. Records each applied migration with timestamp
5. All operations are transactional (commit or rollback together)

### Manual Application (Not Recommended)

If you need to apply migrations manually:

```bash
# Apply all migrations in order
psql -h localhost -U postgres -d sportbnb -f db/migrations/0001_create_tables.sql
psql -h localhost -U postgres -d sportbnb -f db/migrations/0002_add_enhanced_features.sql
```

## Migration File Naming Convention

Migrations should be named with a 4-digit prefix for ordering:

- `0001_description.sql`
- `0002_description.sql`
- `0003_description.sql`

This ensures they are applied in the correct order.

## Writing New Migrations

When creating new migrations:

1. Use `IF NOT EXISTS` for CREATE statements
2. Use `ADD COLUMN IF NOT EXISTS` for ALTER statements
3. Make migrations idempotent (safe to run multiple times)
4. Include comments explaining complex operations
5. Test migrations on a copy of production data before applying

## Development vs Production

### Development (SQLite)

For local development, the application uses SQLAlchemy's `create_all()` which automatically creates all tables based on models. SQLite doesn't need these SQL migrations.

```bash
# Start with SQLite (auto-creates tables)
DATABASE_URL='sqlite:///./sportbnb.db' uvicorn app.main:app --reload
```

### Production (PostgreSQL)

For production with PostgreSQL, use the migration runner to apply schema changes:

```bash
# Run migrations first
python3 db/run_migrations.py --env-file db/.env.dokku

# Then start the application
gunicorn app.main:app -k uvicorn.workers.UvicornWorker
```

## Migration History

| File | Description | Date |
|------|-------------|------|
| 0001_create_tables.sql | Initial schema with users, equipment, bookings | Original |
| 0002_add_enhanced_features.sql | Reviews, messages, payments, availability, extended fields | 2025-11-22 |

## Schema Diagram

```
users
  ├─ hosted_equipment -> equipment
  ├─ bookings (as guest)
  ├─ sent_messages -> messages
  ├─ received_messages -> messages
  └─ reviews (as author)

equipment
  ├─ host -> users
  ├─ images -> equipment_images
  ├─ bookings
  ├─ availability -> equipment_availability
  └─ reviews

bookings
  ├─ equipment
  ├─ user (guest)
  ├─ host -> users
  ├─ messages
  ├─ review
  └─ payment

reviews
  ├─ booking
  ├─ equipment
  └─ author -> users

messages
  ├─ booking
  ├─ sender -> users
  └─ receiver -> users

payments
  └─ booking

equipment_availability
  └─ equipment
```

## Troubleshooting

### "already exists" errors

If you get errors about objects already existing, the migration is working correctly (it's idempotent). The `IF NOT EXISTS` clauses prevent errors.

### Migration tracking

To see which migrations have been applied:

```sql
SELECT * FROM schema_migrations ORDER BY applied_at;
```

### Reset migrations (DANGER - DATA LOSS)

To reset and reapply all migrations (development only):

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then run migrations again:

```bash
python3 db/run_migrations.py
```
