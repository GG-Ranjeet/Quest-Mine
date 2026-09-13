import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, name, clerk_id, level, xp FROM users ORDER BY id;');
    console.log('\n=== Users in DB ===');
    if (result.rows.length === 0) {
      console.log('No users found in the database.');
    } else {
      result.rows.forEach(u => {
        console.log(`  id=${u.id}  name="${u.name}"  clerk_id=${u.clerk_id || '(none)'}  level=${u.level}  xp=${u.xp}`);
      });
    }
    console.log(`\nTotal: ${result.rows.length} user(s)\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

check();
