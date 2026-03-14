const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const sqlPath = path.join(__dirname, 'advanced_features_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing migration...');
        await pool.query(sql);
        console.log('Migration successful.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await pool.end();
    }
}

migrate();
