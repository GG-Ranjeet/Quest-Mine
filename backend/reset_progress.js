import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

const { rows } = await client.query(
  `UPDATE users SET level = 0, xp = 0, coins = 0
   WHERE id IN (6, 7)
   RETURNING id, name, level, xp, coins;`
);

rows.forEach(u =>
  console.log(`✅  Reset: "${u.name}" — level=${u.level}, xp=${u.xp}, coins=${u.coins}`)
);

client.release();
await pool.end();
