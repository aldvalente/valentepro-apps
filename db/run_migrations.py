#!/usr/bin/env python3
"""Simple migration runner: applies SQL files from db/migrations in order and records applied files.

Usage: set env vars or provide a DSN via --dsn

It will create a table `schema_migrations(filename TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())`.

Caveats: migrations are executed as plain SQL. Use with care.
"""
import os
import psycopg2
from psycopg2 import sql
from datetime import datetime

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), 'migrations')


def get_dsn_from_env_or_file(env_file_path=None):
    # Prefer DATABASE_URL
    dsn = os.environ.get('DATABASE_URL') or os.environ.get('PGDSN')
    if dsn:
        return dsn
    # If .env file provided and exists, read key=value lines
    if env_file_path and os.path.exists(env_file_path):
        with open(env_file_path, 'r') as fh:
            for line in fh:
                if '=' in line and not line.strip().startswith('#'):
                    k, v = line.strip().split('=', 1)
                    os.environ.setdefault(k, v)
    host = os.environ.get('PGHOST')
    if not host:
        return None
    port = os.environ.get('PGPORT', '5432')
    user = os.environ.get('PGUSER', 'postgres')
    password = os.environ.get('PGPASSWORD')
    db = os.environ.get('PGDATABASE', 'postgres')
    if password:
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"
    else:
        return f"postgresql://{user}@{host}:{port}/{db}"


def ensure_schema_migrations_table(cur):
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ DEFAULT now()
        )
        """
    )


def get_applied_migrations(cur):
    cur.execute("SELECT filename FROM schema_migrations")
    rows = cur.fetchall()
    return {r[0] for r in rows}


def apply_migration(cur, path, filename):
    print(f"Applying {filename}...")
    with open(path, 'r', encoding='utf-8') as fh:
        sql_text = fh.read()
    # Execute inside transaction handled by caller
    cur.execute(sql.SQL(sql_text))
    cur.execute("INSERT INTO schema_migrations(filename) VALUES (%s)", (filename,))


def run_migrations(dsn=None, env_file=None):
    dsn = dsn or get_dsn_from_env_or_file(env_file)
    if not dsn:
        raise RuntimeError('No DSN available (set DATABASE_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE)')
    print('Connecting to', dsn)
    conn = psycopg2.connect(dsn)
    try:
        with conn:
            with conn.cursor() as cur:
                ensure_schema_migrations_table(cur)
                applied = get_applied_migrations(cur)
                # list files
                files = sorted([f for f in os.listdir(MIGRATIONS_DIR) if f.endswith('.sql')])
                to_apply = [f for f in files if f not in applied]
                if not to_apply:
                    print('No new migrations to apply.')
                    return []
                applied_now = []
                for f in to_apply:
                    path = os.path.join(MIGRATIONS_DIR, f)
                    apply_migration(cur, path, f)
                    applied_now.append(f)
                print('Applied migrations:', applied_now)
                return applied_now
    finally:
        conn.close()


if __name__ == '__main__':
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('--dsn', help='Postgres DSN')
    p.add_argument('--env-file', help='Optional env file to load (key=value)')
    args = p.parse_args()
    try:
        run_migrations(dsn=args.dsn, env_file=args.env_file)
        print('Migrations finished.')
    except Exception as e:
        print('Migration error:', e)
        raise
