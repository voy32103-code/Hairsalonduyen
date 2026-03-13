import { Pool } from 'pg';

// Suppress the SSL security warning by explicitly setting the ssl mode
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Diagnostic logging
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
