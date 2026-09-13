/**
 * Bulk sync all Clerk users into the database.
 * Safely skips users that already exist (by clerk_id).
 * Run whenever a Clerk user is missing from the DB.
 *
 * Usage: node sync_all_clerk_users.js
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function syncAll() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey || secretKey.includes('your_secret')) {
    console.error('\n❌  CLERK_SECRET_KEY not set in .env');
    console.error('    Add: CLERK_SECRET_KEY=sk_test_xxxx\n');
    process.exit(1);
  }

  console.log('\nFetching all users from Clerk...');

  // Clerk paginates with limit 500 max
  let allClerkUsers = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const res = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) {
      console.error(`\n❌  Clerk API error: ${res.status} ${await res.text()}\n`);
      process.exit(1);
    }
    const page = await res.json();
    allClerkUsers.push(...page);
    if (page.length < limit) break; // last page
    offset += limit;
  }

  console.log(`Found ${allClerkUsers.length} Clerk user(s).\n`);

  const client = await pool.connect();
  try {
    let created = 0;
    let skipped = 0;

    for (const clerkUser of allClerkUsers) {
      const clerkId = clerkUser.id;

      // Check if already in DB
      const existing = await client.query(
        'SELECT id FROM users WHERE clerk_id = $1;',
        [clerkId]
      );

      if (existing.rows.length > 0) {
        console.log(`  ⏭  Already exists: ${clerkId} (db id=${existing.rows[0].id})`);
        skipped++;
        continue;
      }

      // Build display name
      const name =
        clerkUser.username ||
        [clerkUser.first_name, clerkUser.last_name].filter(Boolean).join(' ') ||
        clerkUser.email_addresses?.[0]?.email_address?.split('@')[0] ||
        'Adventurer';

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (clerk_id, name) VALUES ($1, $2)
         ON CONFLICT (clerk_id) DO NOTHING
         RETURNING id, name;`,
        [clerkId, name]
      );

      if (result.rows.length > 0) {
        console.log(`  ✅  Created: "${name}" ← ${clerkId} (db id=${result.rows[0].id})`);
        created++;
      } else {
        console.log(`  ⏭  Conflict skipped: ${clerkId}`);
        skipped++;
      }
    }

    console.log(`\nDone! Created: ${created} | Already existed: ${skipped}\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

syncAll();
