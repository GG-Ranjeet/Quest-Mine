import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding clerk_id column to users table...');
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
    `);
    console.log('✅ Done! clerk_id column added (or already existed).');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
