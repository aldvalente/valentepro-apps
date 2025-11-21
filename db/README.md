# Database setup for Sportbnb (demo)

This folder contains:

- `schema.sql` — idempotent SQL schema to create users, equipment, images and bookings.
- `init_db.py` — convenience Python script to execute the SQL file against a Postgres instance.

- `migrations/` — folder with SQL migration files. The runner `run_migrations.py` applies them and records applied files.

Automatic migrations on app startup
----------------------------------

The FastAPI app is configured to run migrations on startup in the background when the environment variable `RUN_MIGRATIONS_ON_STARTUP` is not set to `0`. The migration runner looks for an env file `db/.env.dokku` by default (you can remove it or secure it after running).

To apply migrations manually instead of automatic startup, run:

```bash
python3 db/run_migrations.py --env-file db/.env.dokku
```

Or using a DSN:

```bash
python3 db/run_migrations.py --dsn "postgresql://postgres:password@host:5432/dbname"
```

How to run

1) Using psql on the server (recommended when you have direct access):

```bash
# copy files to the server (if needed)
scp -r db your_user@your_server:/tmp/valentepro-apps-db
ssh your_user@your_server
# then on the server
sudo -u postgres psql -f /tmp/valentepro-apps-db/schema.sql
# or, if you have a specific DB
psql "postgresql://user:password@localhost:5432/yourdb" -f /tmp/valentepro-apps-db/schema.sql
```

2) Using the Python helper (locally or on server)

```bash
# install dependency
python -m pip install psycopg2-binary
# provide connection via env vars
export PGHOST=127.0.0.1
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=secret
export PGDATABASE=apps
python3 db/init_db.py --sql db/schema.sql

# Or use a DSN directly
python3 db/init_db.py --dsn "postgresql://user:pass@host:5432/dbname" --sql db/schema.sql
```

SSH one-liner to run via remote server (example):

```bash
# copy files and execute remotely
scp -r db your_user@your_server:~/valentepro-apps-db
ssh your_user@your_server 'PGPASSWORD=secret psql "postgresql://postgres@localhost:5432/postgres" -f ~/valentepro-apps-db/schema.sql'
```

Notes & next steps

- The provided schema is intentionally simple and idempotent (uses `IF NOT EXISTS`).
- For production you'll likely want to run proper migrations (Alembic or Flyway) and add constraints or exclusion rules to prevent overlapping bookings.
- If you want, I can also generate an Alembic migration setup and the initial migration file.
