/**
 * One-time sync script to link an existing DB user to their Clerk account.
 * 
 * Usage:
 *   node sync_clerk_user.js <clerk_user_id> [db_user_id]
 * 
 * Example:
 *   node sync_clerk_user.js user_2abc123xyz
 *
 * Your Clerk User ID: go to Clerk Dashboard → Users → click your account → copy the User ID
 * It looks like: user_2NxxxxxxxxxxxxxxxZ
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function sync() {
  const clerkId = process.argv[2];
  const dbUserId = process.argv[3]; // optional — if not given, uses the only user in the DB

  if (!clerkId || !clerkId.startsWith('user_')) {
    console.error('\n❌  Please provide your Clerk User ID as the first argument.');
    console.error('    It starts with "user_" and can be found in Clerk Dashboard → Users.\n');
    console.error('    Usage: node sync_clerk_user.js user_2abc123xyz\n');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    let targetUserId = dbUserId;

    if (!targetUserId) {
      // Auto-detect: use the only user in the DB if there's exactly one
      const result = await client.query('SELECT id, name FROM users WHERE clerk_id IS NULL ORDER BY id LIMIT 1;');
      if (result.rows.length === 0) {
        console.error('\n❌  No users without a clerk_id found in the database.\n');
        process.exit(1);
      }
      targetUserId = result.rows[0].id;
      console.log(`\nAuto-selected DB user: id=${targetUserId} name="${result.rows[0].name}"`);
    }

    // Check the clerk_id isn't already taken by another user
    const conflict = await client.query('SELECT id FROM users WHERE clerk_id = $1;', [clerkId]);
    if (conflict.rows.length > 0) {
      console.error(`\n❌  clerk_id "${clerkId}" is already linked to DB user id=${conflict.rows[0].id}.\n`);
      process.exit(1);
    }

    const update = await client.query(
      'UPDATE users SET clerk_id = $1 WHERE id = $2 RETURNING id, name, clerk_id;',
      [clerkId, targetUserId]
    );

    if (update.rows.length === 0) {
      console.error(`\n❌  No user found with id=${targetUserId}.\n`);
      process.exit(1);
    }

    const u = update.rows[0];
    console.log(`\n✅  Linked successfully!`);
    console.log(`    DB user id=${u.id} "${u.name}" ← clerk_id: ${u.clerk_id}\n`);
    console.log('    Restart your backend and the user should now appear in /api/user/all.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

sync();
