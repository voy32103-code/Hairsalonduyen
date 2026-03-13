const { Client } = require('pg');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

const client = new Client({
  connectionString: dbUrl,
});

const sql = `
-- Drop existing views/policies/tables if any for idempotency
DO $$
BEGIN
    DROP POLICY IF EXISTS "admin_manager_all_services" ON services;
    DROP POLICY IF EXISTS "public_read_services" ON services;
    DROP POLICY IF EXISTS "admin_manager_all_invoices" ON invoices;
    DROP POLICY IF EXISTS "admin_manager_all_invoice_items" ON invoice_items;
EXCEPTION WHEN OTHERS THEN
END $$;

DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS invoice_status_enum CASCADE;
-- We do not drop services if we want to keep data, but here we drop for a clean slate during dev
-- If you want to keep data, comment out the next line.
-- DROP TABLE IF EXISTS services CASCADE;

-- ▶ 1. SERVICES
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS services (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text        NOT NULL UNIQUE,
  description    text,
  price          numeric     NOT NULL DEFAULT 0 CHECK (price >= 0),
  duration_mins  integer     NOT NULL DEFAULT 60 CHECK (duration_mins > 0),
  is_active      boolean     DEFAULT true,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- Note: In NeonDB we don't need strict RLS if all access is via neondb_owner server-side, 
-- but we declare it for completeness.
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- ▶ 2. APPOINTMENTS ALTERATION
-- Add service_id to appointments. Make it nullable so old records don't break.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='appointments' AND column_name='service_id'
    ) THEN
        ALTER TABLE appointments ADD COLUMN service_id uuid REFERENCES services(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ▶ 3. INVOICES
CREATE TYPE payment_method_enum AS ENUM ('cash', 'credit_card', 'bank_transfer', 'other');
CREATE TYPE invoice_status_enum AS ENUM ('pending', 'paid', 'cancelled');

CREATE TABLE invoices (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid        UNIQUE REFERENCES appointments(id) ON DELETE SET NULL,
  customer_id    uuid        REFERENCES customers(id) ON DELETE SET NULL,
  subtotal       numeric     NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount       numeric     NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total_amount   numeric     GENERATED ALWAYS AS (subtotal - discount) STORED,
  payment_method payment_method_enum DEFAULT 'cash',
  status         invoice_status_enum DEFAULT 'pending',
  note           text,
  created_by     uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_invoices_appointment ON invoices(appointment_id);
CREATE INDEX idx_invoices_customer    ON invoices(customer_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ▶ 4. INVOICE ITEMS
CREATE TABLE invoice_items (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id     uuid        REFERENCES invoices(id) ON DELETE CASCADE,
  -- Item can be a service OR an inventory product. We track both.
  service_id     uuid        REFERENCES services(id) ON DELETE SET NULL,
  product_id     uuid        REFERENCES inventory(id) ON DELETE SET NULL,
  item_name      text        NOT NULL, -- Fallback name in case product/service is deleted
  quantity       integer     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price     numeric     NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  total_price    numeric     GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(sql);
    console.log('Migration successful: Services and POS tables created/updated.');
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    await client.end();
  }
}

run();
