import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await pool.query(`ALTER TABLE quests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;`);
        console.log('Successfully added user_id column to quests table.');
    } catch (e) {
        console.error('Failed to alter table:', e);
    } finally {
        await pool.end();
    }
}

main();
