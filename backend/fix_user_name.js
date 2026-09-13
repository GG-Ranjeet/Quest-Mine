/**
 * Fetches your real profile from Clerk and updates the DB user name to match.
 * Run this once after sync_clerk_user.js.
 *
 * Requires CLERK_SECRET_KEY in .env
 * Get it from: Clerk Dashboard → API Keys → Secret key (sk_test_...)
 *
 * Usage: node fix_user_name.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fix() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error('\n❌  CLERK_SECRET_KEY not set in .env');
    console.error('    Add: CLERK_SECRET_KEY=sk_test_xxxx\n');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    // Get all users that have a clerk_id
    const dbUsers = await client.query('SELECT id, name, clerk_id FROM users WHERE clerk_id IS NOT NULL;');

    if (dbUsers.rows.length === 0) {
      console.log('\n⚠️  No users with a clerk_id found.\n');
      return;
    }

    for (const dbUser of dbUsers.rows) {
      // Fetch real profile from Clerk
      const res = await fetch(`https://api.clerk.com/v1/users/${dbUser.clerk_id}`, {
        headers: { Authorization: `Bearer ${secretKey}` },
      });

      if (!res.ok) {
        console.error(`❌  Failed to fetch Clerk user ${dbUser.clerk_id}: ${res.status}`);
        continue;
      }

      const clerkUser = await res.json();
      const realName =
        clerkUser.username ||
        [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ') ||
        clerkUser.email_addresses?.[0]?.email_address?.split('@')[0] ||
        dbUser.name;

      if (realName === dbUser.name) {
        console.log(`✓  id=${dbUser.id} "${dbUser.name}" — name already correct, skipping.`);
        continue;
      }

      await client.query('UPDATE users SET name = $1 WHERE id = $2;', [realName, dbUser.id]);
      console.log(`✅  id=${dbUser.id}: "${dbUser.name}" → "${realName}"`);
    }

    console.log('\nDone! Restart your backend to see the changes.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

fix();
