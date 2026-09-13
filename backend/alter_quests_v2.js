import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
    try {
        await pool.query(`ALTER TABLE quests ADD COLUMN scheduled_date VARCHAR(50);`);
        await pool.query(`ALTER TABLE quests ADD COLUMN is_everyday BOOLEAN DEFAULT FALSE;`);
        console.log('Successfully added scheduling columns to quests table.');
    } catch (e) {
        console.error('Failed to alter table:', e);
    } finally {
        await pool.end();
    }
}

main();
