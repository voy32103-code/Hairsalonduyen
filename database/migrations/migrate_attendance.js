const { Client } = require('pg');
const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL="?([^"\n]+)"?/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1] : '';

const client = new Client({
  connectionString: dbUrl,
});

const sql = `
-- ▶ ATTENDANCE (Chấm công)
CREATE TABLE IF NOT EXISTS attendance (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        REFERENCES users(id) ON DELETE CASCADE,
  check_in     timestamptz NOT NULL DEFAULT now(),
  check_out    timestamptz,
  status       text        DEFAULT 'present', -- present, late, early_leave
  note         text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in);
`;

async function run() {
  try {
    await client.connect();
    console.log('Connected to DB');
    await client.query(sql);
    console.log('Migration successful: Attendance table created.');
  } catch (e) {
    console.error('Error during migration:', e);
  } finally {
    await client.end();
  }
}

run();
