import { Pool } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

const pool = global.pgPool || new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
    // Prevent Neon from dropping idle connections unexpectedly
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    max: 10
});

if (process.env.NODE_ENV !== 'production') {
    global.pgPool = pool;
}

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
