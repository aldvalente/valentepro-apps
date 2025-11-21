-- 0001_create_tables.sql
-- Initial schema migration (same as schema.sql)

-- Enable uuid generation (may require superuser privileges on some hosts)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Equipment (attrezzature)
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  city TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  host_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_city ON equipment (city);
CREATE INDEX IF NOT EXISTS idx_equipment_coords ON equipment (lat, lon);

-- Images for equipment
CREATE TABLE IF NOT EXISTS equipment_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  position INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_equipment_images_eid ON equipment_images (equipment_id);

-- Bookings (prenotazioni)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (date_to >= date_from)
);

CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings (equipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);

-- Optional: simple view joining equipment with a main image
CREATE OR REPLACE VIEW equipment_with_main_image AS
SELECT e.*, ei.url AS main_image
FROM equipment e
LEFT JOIN (
  SELECT DISTINCT ON (equipment_id) equipment_id, url
  FROM equipment_images
  ORDER BY equipment_id, position ASC
) ei ON ei.equipment_id = e.id;

-- End of migration 0001
