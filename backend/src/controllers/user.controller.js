import { db } from '../db/db.js';
import { users, userInventories, items } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { Webhook } from 'svix';

// GET /api/users — return all users (public leaderboard data)
export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        title: users.title,
        level: users.level,
        xp: users.xp,
        coins: users.coins,
      })
      .from(users)
      .orderBy(users.xp);

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


// Helper: extract clerk_id from the Bearer JWT without full verification
// (Clerk's clerkMiddleware handles full JWT verification on protected routes)
function getClerkIdFromReq(req) {
  // If using @clerk/express clerkMiddleware, auth is on req.auth
  if (req.auth?.userId) return req.auth.userId;

  // Fallback: manually decode the JWT payload (no verification — only used for clerk_id lookup)
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.sub || null;
  } catch {
    return null;
  }
}

// GET /api/user — fetch profile for the signed-in Clerk user
export const getUserProfile = async (req, res) => {
  try {
    const clerkId = getClerkIdFromReq(req);
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];

    const inventoryData = await db.select({
      id: items.id,
      name: items.name,
      itemType: items.itemType,
      rarity: items.rarity,
      icon: items.icon,
      stats: items.stats,
      sellPrice: items.sellPrice,
      quantity: userInventories.quantity
    })
    .from(userInventories)
    .innerJoin(items, eq(userInventories.itemId, items.id))
    .where(eq(userInventories.userId, user.id));

    res.json({ ...user, inventory: inventoryData });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/webhooks/clerk — Clerk sends user.created events here
export const handleClerkWebhook = async (req, res) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Verify the webhook signature using svix
  const svixId = req.headers['svix-id'];
  const svixTimestamp = req.headers['svix-timestamp'];
  const svixSignature = req.headers['svix-signature'];

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ error: 'Missing svix headers' });
  }

  let event;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(req.body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  if (event.type === 'user.created') {
    const { id: clerkId, first_name, last_name, username, email_addresses } = event.data;

    // Build a display name: prefer username, then first+last, then email prefix
    const name =
      username ||
      [first_name, last_name].filter(Boolean).join(' ') ||
      (email_addresses?.[0]?.email_address?.split('@')[0]) ||
      'Adventurer';

    try {
      // Upsert: ignore if already exists (idempotent)
      await db.insert(users).values({ clerkId, name }).onConflictDoNothing();
      console.log(`✅ Created DB user for Clerk ID: ${clerkId} (${name})`);
    } catch (err) {
      console.error('Error creating user from webhook:', err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }

  res.status(200).json({ received: true });
};
