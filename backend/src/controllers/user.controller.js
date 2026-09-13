import { db } from '../db/db.js';
import { users, userInventories, items } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getUserProfile = async (req, res) => {
  try {
    const allUsers = await db.select().from(users).limit(1);
    
    if (allUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = allUsers[0];

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

    res.json({
      ...user,
      inventory: inventoryData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
