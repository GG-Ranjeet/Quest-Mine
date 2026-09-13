/**
 * Seeds quests and inventory for gg-ranjeet (user id=7)
 * using the same mock data as seed.js.
 * Does NOT touch other users or wipe the DB.
 */

import { db } from './src/db/db.js';
import { quests, items, userInventories } from './src/db/schema.js';
import { eq } from 'drizzle-orm';

const RANJEET_ID = 7;

async function seedRanjeet() {
  try {
    console.log('🚀 Seeding quests and inventory for gg-ranjeet (id=7)...\n');

    // --- Clear existing quests/inventory for ranjeet only ---
    await db.delete(userInventories).where(eq(userInventories.userId, RANJEET_ID));
    await db.delete(quests).where(eq(quests.userId, RANJEET_ID));
    console.log('🧹 Cleared existing quests and inventory for ranjeet.');

    // --- Dates ---
    const today       = new Date().toISOString().split('T')[0];
    const tomorrow    = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday   = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // --- Quests (same as seed.js, unique IDs prefixed with r_ to avoid conflicts) ---
    const mockQuests = [
      { id: 'r_q1', title: 'Complete deep-work sprint', category: 'Focus',       stat: 'Intelligence', difficulty: 'Hard',   xp: 120, userId: RANJEET_ID, isEveryday: true },
      { id: 'r_q2', title: 'Morning meditation',        category: 'Mindfulness', stat: 'Wisdom',       difficulty: 'Easy',   xp: 30,  userId: RANJEET_ID, scheduledDate: today },
      { id: 'r_q3', title: 'Review pull requests',      category: 'Work',        stat: 'Intelligence', difficulty: 'Medium', xp: 60,  userId: RANJEET_ID, scheduledDate: tomorrow },
      { id: 'r_q4', title: 'Go for a run',              category: 'Fitness',     stat: 'Strength',     difficulty: 'Medium', xp: 50,  userId: RANJEET_ID, scheduledDate: yesterday },
      { id: 'r_q5', title: 'Read 20 pages',             category: 'General',     stat: 'Wisdom',       difficulty: 'Easy',   xp: 20,  userId: RANJEET_ID, scheduledDate: today },
    ];
    await db.insert(quests).values(mockQuests);
    console.log(`⚔️  Seeded ${mockQuests.length} quests.`);

    // --- Ensure master items exist (INSERT IGNORE so we don't break karan's data) ---
    const mockItems = [
      { id: 'ore_iron',    name: 'Iron Ore',         itemType: 'Material',  rarity: 'Common',    icon: '🪨', sellPrice: 10 },
      { id: 'ore_gold',    name: 'Gold Ore',         itemType: 'Material',  rarity: 'Rare',      icon: '🪙', sellPrice: 50 },
      { id: 'ore_diamond', name: 'Diamond Ore',      itemType: 'Material',  rarity: 'Legendary', icon: '💎', sellPrice: 200 },
      { id: 'eq1',         name: 'Iron Plate',       itemType: 'Armor',     rarity: 'Uncommon',  icon: '🛡️', stats: '+10 DEF',           sellPrice: 100 },
      { id: 'eq2',         name: 'Crystal Guard',    itemType: 'Armor',     rarity: 'Rare',      icon: '🛡️', stats: '+25 DEF',           sellPrice: 300 },
      { id: 'eq3',         name: 'Shadow Cloak',     itemType: 'Armor',     rarity: 'Epic',      icon: '🧥', stats: '+40 DEF, +5 AGI',  sellPrice: 800 },
      { id: 'eq4',         name: 'Ring of Focus',    itemType: 'Accessory', rarity: 'Uncommon',  icon: '💍', stats: '+5 INT',            sellPrice: 150 },
      { id: 'eq5',         name: 'Amulet of Time',   itemType: 'Accessory', rarity: 'Rare',      icon: '📿', stats: '+10 WIS',           sellPrice: 400 },
      { id: 'eq6',         name: 'Wayfinder Charm',  itemType: 'Accessory', rarity: 'Legendary', icon: '✨', stats: '+20 ALL',           sellPrice: 2000 },
    ];
    await db.insert(items).values(mockItems).onConflictDoNothing();
    console.log('💎 Ensured master item list exists.');

    // --- Inventory for ranjeet ---
    await db.insert(userInventories).values([
      { userId: RANJEET_ID, itemId: 'ore_iron',    quantity: 5 },
      { userId: RANJEET_ID, itemId: 'ore_diamond', quantity: 1 },
      { userId: RANJEET_ID, itemId: 'eq1',         quantity: 1 },
      { userId: RANJEET_ID, itemId: 'eq4',         quantity: 1 },
      { userId: RANJEET_ID, itemId: 'eq6',         quantity: 1 },
    ]);
    console.log('🎒 Populated inventory for ranjeet.');

    console.log('\n✅ Done! gg-ranjeet is ready to play.\n');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    process.exit(0);
  }
}

seedRanjeet();
