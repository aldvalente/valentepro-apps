-- 0002_add_enhanced_features.sql
-- Migration to add enhanced features: reviews, messages, payments, availability
-- and extend existing tables with new fields

-- =============================================================================
-- EXTEND EXISTING TABLES
-- =============================================================================

-- Extend users table with new authentication and preference fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'it';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Extend equipment table with new fields
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS sport TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'IT';
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS rules_text TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT TRUE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add indexes for new equipment fields
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment (category);
CREATE INDEX IF NOT EXISTS idx_equipment_sport ON equipment (sport);

-- Extend bookings table with new fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS host_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add index for host_id
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings (host_id);

-- Update booking status values (the column already exists, just document valid values)
-- Valid status values: 'pending', 'confirmed', 'rejected', 'cancelled', 'completed'

-- =============================================================================
-- CREATE NEW TABLES
-- =============================================================================

-- Equipment Availability Calendar
CREATE TABLE IF NOT EXISTS equipment_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_eid ON equipment_availability (equipment_id);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews (booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_equipment ON reviews (equipment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_author ON reviews (author_id);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages (booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages (receiver_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);

-- =============================================================================
-- UPDATE EXISTING DATA (if needed)
-- =============================================================================

-- Update existing bookings to populate host_id from equipment
UPDATE bookings b
SET host_id = (
  SELECT e.host_id 
  FROM equipment e 
  WHERE e.id = b.equipment_id
)
WHERE host_id IS NULL;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE equipment_availability IS 'Calendar-based availability tracking for equipment';
COMMENT ON TABLE reviews IS 'User reviews for completed bookings (1-5 star rating)';
COMMENT ON TABLE messages IS 'Direct messages between guests and hosts';
COMMENT ON TABLE payments IS 'Payment tracking for bookings (integration-ready)';

COMMENT ON COLUMN users.preferred_language IS 'User language preference: it (Italian) or en (English)';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN equipment.category IS 'Equipment category: bici, sci, kayak, montagna, etc.';
COMMENT ON COLUMN equipment.sport IS 'Sport type: bike, ski, tennis, water, etc.';
COMMENT ON COLUMN equipment.rules_text IS 'Rental rules and terms for this equipment';
COMMENT ON COLUMN bookings.host_id IS 'Host user ID (redundant but useful for queries)';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, confirmed, rejected, cancelled, completed';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN messages.read IS 'Whether the message has been read by receiver';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, paid, failed';

-- End of migration 0002
