const { Client } = require('pg');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

const client = new Client({
  connectionString: dbUrl,
});

const sql = `
-- Drop existing views/policies/tables if any for idempotency (optional, but let's be safe if rerunning)
DO $$
BEGIN
    DROP POLICY IF EXISTS "admin_manager_all_work_schedules" ON work_schedules;
    DROP POLICY IF EXISTS "staff_read_work_schedules" ON work_schedules;
    DROP POLICY IF EXISTS "admin_manager_all_payroll" ON payroll;
    DROP POLICY IF EXISTS "staff_read_payroll" ON payroll;
EXCEPTION WHEN OTHERS THEN
END $$;

DROP TABLE IF EXISTS work_schedules CASCADE;
DROP TABLE IF EXISTS payroll CASCADE;
DROP TYPE IF EXISTS shift_status CASCADE;
DROP TYPE IF EXISTS payroll_status CASCADE;

-- ▶ WORK_SCHEDULES
CREATE TYPE shift_status AS ENUM ('scheduled', 'completed', 'absent', 'cancelled');

CREATE TABLE work_schedules (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid        REFERENCES users(id) ON DELETE CASCADE,
  date        date        NOT NULL,
  shift_start time        NOT NULL,
  shift_end   time        NOT NULL,
  status      shift_status DEFAULT 'scheduled',
  note        text,
  created_by  uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_work_schedules_employee_id ON work_schedules(employee_id);
CREATE INDEX idx_work_schedules_date        ON work_schedules(date);

-- ▶ PAYROLL
CREATE TYPE payroll_status AS ENUM ('draft', 'paid', 'cancelled');

CREATE TABLE payroll (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id  uuid        REFERENCES users(id) ON DELETE CASCADE,
  period_month integer     NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  period_year  integer     NOT NULL,
  base_salary  numeric     NOT NULL DEFAULT 0 CHECK (base_salary >= 0),
  bonus        numeric     NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  deductions   numeric     NOT NULL DEFAULT 0 CHECK (deductions >= 0),
  net_pay      numeric     GENERATED ALWAYS AS (base_salary + bonus - deductions) STORED,
  status       payroll_status DEFAULT 'draft',
  note         text,
  created_by   uuid        REFERENCES users(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE(employee_id, period_month, period_year)
);

CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);

-- RLS (Optional, ignored since neondb_owner bypasses it anyway)
-- Policies removed to avoid "role authenticated does not exist" on NeonDB
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(sql);
    console.log('Migration successful');
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    await client.end();
  }
}

run();
