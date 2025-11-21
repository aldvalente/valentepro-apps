#!/usr/bin/env python3
"""init_db.py
Simple runner to apply `db/schema.sql` to a PostgreSQL database.
Usage examples:
  PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGPASSWORD=secret PGDATABASE=apps python3 db/init_db.py
  # or
  python3 db/init_db.py --dsn "postgresql://user:pass@host:5432/dbname"

This script executes the SQL file as-is. It's idempotent (schema uses IF NOT EXISTS).
"""

import os
import argparse
import sys

try:
    import psycopg2
    from psycopg2 import sql
except Exception:
    print("Missing dependency 'psycopg2-binary'. Install with: python -m pip install psycopg2-binary")
    sys.exit(1)

DEFAULT_SQL = 'db/schema.sql'


def get_conn_from_env():
    dsn = os.environ.get('DATABASE_URL') or os.environ.get('PGDSN')
    if dsn:
        return dsn
    host = os.environ.get('PGHOST', 'localhost')
    port = os.environ.get('PGPORT', '5432')
    user = os.environ.get('PGUSER', 'postgres')
    password = os.environ.get('PGPASSWORD')
    db = os.environ.get('PGDATABASE', 'postgres')
    if password:
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"
    else:
        return f"postgresql://{user}@{host}:{port}/{db}"


def apply_sql(dsn, sql_path):
    print(f"Connecting to: {dsn}")
    conn = psycopg2.connect(dsn)
    try:
        with conn:
            with conn.cursor() as cur:
                print(f"Reading SQL file: {sql_path}")
                with open(sql_path, 'r', encoding='utf-8') as fh:
                    sql_text = fh.read()
                print("Executing SQL... (this may take a few seconds)")
                cur.execute(sql.SQL(sql_text))
        print("Schema applied successfully.")
    finally:
        conn.close()


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--sql', default=DEFAULT_SQL, help='Path to SQL file to execute')
    p.add_argument('--dsn', help='Postgres DSN (overrides env variables)')
    args = p.parse_args()

    dsn = args.dsn or get_conn_from_env()
    if not dsn:
        print('No DSN provided and environment variables missing. Set PGHOST/PGUSER/PGPASSWORD/PGDATABASE or provide --dsn')
        sys.exit(2)

    if not os.path.exists(args.sql):
        print(f"SQL file not found: {args.sql}")
        sys.exit(3)

    try:
        apply_sql(dsn, args.sql)
    except Exception as e:
        print('Error applying schema:', e)
        sys.exit(4)
