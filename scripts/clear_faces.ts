import pool from '../src/lib/db';

async function main() {
    try {
        console.log('Clearing faces...');
        await pool.query('UPDATE users SET face_descriptor = NULL');
        console.log('Faces cleared.');
        
        const roles = await pool.query('SELECT * FROM roles');
        console.log('Available roles:', roles.rows);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
main();
