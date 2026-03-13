const { Client } = require('pg');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

const client = new Client({
  connectionString: dbUrl,
});

const sql = `
-- ▶ 1. CUSTOMERS (If missing)
CREATE TABLE IF NOT EXISTS customers (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name   text        NOT NULL,
  phone       text        UNIQUE,
  email       text,
  notes       text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- ▶ 2. INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name  text        NOT NULL,
  description   text,
  quantity      integer     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock     integer     NOT NULL DEFAULT 5 CHECK (min_stock >= 0),
  unit_price    numeric     NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ▶ 3. REVENUE_LOGS
CREATE TABLE IF NOT EXISTS revenue_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid        REFERENCES appointments(id) ON DELETE CASCADE,
  amount         numeric     NOT NULL CHECK (amount >= 0),
  created_at     timestamptz DEFAULT now()
);

-- ▶ 4. EXPENSES
CREATE TABLE IF NOT EXISTS expenses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text        NOT NULL,
  amount        numeric     NOT NULL CHECK (amount >= 0),
  category      text        DEFAULT 'Other',
  expense_date  date        DEFAULT current_date,
  note          text,
  created_by    uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- ▶ 5. VIEW: low_stock_items
DROP VIEW IF EXISTS low_stock_items CASCADE;
CREATE VIEW low_stock_items AS
SELECT id, product_name, quantity, min_stock, unit_price
FROM inventory
WHERE quantity <= min_stock;
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(sql);
    console.log('Migration successful: Missing tables and views repaired.');
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    await client.end();
  }
}

run();
