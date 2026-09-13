import { db } from '../db/db.js';
import { quests, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// ─────────────────────────────────────────────────────────────────────────────
// XP SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

// Difficulty weights — used to proportionally split the daily 100 XP pool
const DIFFICULTY_WEIGHTS = { Easy: 1, Medium: 2, Hard: 3, Epic: 5 };

/**
 * Distribute 100 XP across a list of quests proportionally by difficulty weight.
 * Returns a map of { questId → xp }.
 * Each quest gets at least 1 XP.
 */
function distributeXP(questList) {
  if (questList.length === 0) return {};
  const totalWeight = questList.reduce((s, q) => s + (DIFFICULTY_WEIGHTS[q.difficulty] || 1), 0);
  const dist = {};
  let allocated = 0;

  questList.forEach((q, i) => {
    const weight = DIFFICULTY_WEIGHTS[q.difficulty] || 1;
    if (i === questList.length - 1) {
      // Last quest gets the remainder so the total is exactly 100
      dist[q.id] = Math.max(1, 100 - allocated);
    } else {
      const share = Math.max(1, Math.round((weight / totalWeight) * 100));
      dist[q.id] = share;
      allocated += share;
    }
  });

  return dist;
}

/**
 * Non-linear XP required to advance from level N to level N+1.
 *   Level 0 → 1 :  100 XP
 *   Level 1 → 2 :  283 XP
 *   Level 2 → 3 :  520 XP
 *   Level 3 → 4 :  800 XP
 *   Level 4 → 5 : 1118 XP  ...
 * Formula: floor(100 × (N+1)^1.5)
 */
function xpRequiredForLevel(level) {
  return Math.floor(100 * Math.pow(level + 1, 1.5));
}

/**
 * Given total accumulated XP and current level, compute new level + remaining XP.
 * Runs a while-loop so it handles multiple level-ups in one go.
 */
function applyXPGain(currentXp, currentLevel, gainedXp) {
  let xp = currentXp + gainedXp;
  let level = currentLevel;
  let levelsGained = 0;

  while (xp >= xpRequiredForLevel(level)) {
    xp -= xpRequiredForLevel(level);
    level++;
    levelsGained++;
  }

  return { newXp: xp, newLevel: level, levelsGained };
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function getClerkIdFromReq(req) {
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

async function getUserFromReq(req, res) {
  const clerkId = getClerkIdFromReq(req);
  if (!clerkId) { res.status(401).json({ error: 'Unauthorized' }); return null; }
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (result.length === 0) { res.status(404).json({ error: 'User not found' }); return null; }
  return result[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const getQuests = async (req, res) => {
  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    const activeQuests = await db.select()
      .from(quests)
      .where(and(eq(quests.completed, false), eq(quests.userId, user.id)));

    res.json(activeQuests);
  } catch (error) {
    console.error('Error fetching quests:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const completeQuest = async (req, res) => {
  const { questId, damage } = req.body;
  if (!questId) return res.status(400).json({ error: 'Quest ID required' });

  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    const result = await db.transaction(async (tx) => {
      // Fetch quest (must belong to this user and be incomplete)
      const questList = await tx.select()
        .from(quests)
        .where(and(eq(quests.id, questId), eq(quests.userId, user.id)));

      if (questList.length === 0 || questList[0].completed) {
        throw new Error('Quest already completed or not found');
      }

      const quest = questList[0];
      const questXp = quest.xp || 1;

      // Mark quest completed
      await tx.update(quests)
        .set({ completed: true })
        .where(eq(quests.id, questId));

      // Coins: difficulty-based reward with small random bonus
      const baseCoins = { Easy: 10, Medium: 20, Hard: 35, Epic: 60 }[quest.difficulty] || 10;
      const coinsReward = baseCoins + Math.floor(Math.random() * 10);

      // Apply XP gain with non-linear level-up check
      const { newXp, newLevel, levelsGained } = applyXPGain(
        user.xp || 0,
        user.level || 0,
        questXp
      );

      const [updatedUser] = await tx.update(users)
        .set({ xp: newXp, level: newLevel, coins: (user.coins || 0) + coinsReward })
        .where(eq(users.id, user.id))
        .returning();

      return {
        user: updatedUser,
        reward: { xp: questXp, coins: coinsReward },
        levelUp: levelsGained > 0,
        levelsGained,
        xpRequiredForNextLevel: xpRequiredForLevel(newLevel),
      };
    });

    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error completing quest:', error);
    if (error.message === 'Quest already completed or not found') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const createQuest = async (req, res) => {
  const { title, category, stat, difficulty, scheduledDate, isEveryday } = req.body;

  if (!title) return res.status(400).json({ error: 'Quest title is required' });

  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const targetDate = scheduledDate || today;
    const isAddedToday = (targetDate === today) || isEveryday;

    let questXp;

    if (isAddedToday) {
      // ── Same-day addition: flat +1 XP, existing quests are NOT affected ──
      questXp = 1;
    } else {
      // ── Future-date addition: redistribute 100 XP pool for that date ──
      // Get all incomplete quests already scheduled for that date
      const existingForDate = await db.select()
        .from(quests)
        .where(and(
          eq(quests.userId, user.id),
          eq(quests.scheduledDate, targetDate),
          eq(quests.completed, false)
        ));

      // Calculate new distribution including the new quest (use a placeholder id)
      const allForDate = [...existingForDate, { id: '__new__', difficulty: difficulty || 'Easy' }];
      const distribution = distributeXP(allForDate);

      // Update existing quests with their recalculated XP
      for (const q of existingForDate) {
        if (distribution[q.id] !== q.xp) {
          await db.update(quests)
            .set({ xp: distribution[q.id] })
            .where(eq(quests.id, q.id));
        }
      }

      questXp = distribution['__new__'];
    }

    const [newQuest] = await db.insert(quests).values({
      id: Date.now().toString(),
      title,
      category: category || 'General',
      stat: stat || 'STR',
      difficulty: difficulty || 'Easy',
      xp: questXp,
      completed: false,
      userId: user.id,
      scheduledDate: isEveryday ? null : targetDate,
      isEveryday: isEveryday || false,
    }).returning();

    res.status(201).json({
      ...newQuest,
      meta: {
        xpMode: isAddedToday ? 'late_addition' : 'distributed',
        message: isAddedToday
          ? 'Added today — grants +1 XP. Will be factored into the daily pool from tomorrow.'
          : `XP redistributed for ${targetDate}. This quest earns ${questXp} XP.`,
      }
    });
  } catch (error) {
    console.error('Error creating quest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateQuest = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    const [updatedQuest] = await db.update(quests)
      .set(updates)
      .where(and(eq(quests.id, id), eq(quests.userId, user.id)))
      .returning();

    if (!updatedQuest) return res.status(404).json({ error: 'Quest not found' });

    res.json(updatedQuest);
  } catch (error) {
    console.error('Error updating quest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteQuest = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    const [deletedQuest] = await db.delete(quests)
      .where(and(eq(quests.id, id), eq(quests.userId, user.id)))
      .returning();

    if (!deletedQuest) return res.status(404).json({ error: 'Quest not found' });

    res.json({ success: true, deletedQuest });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Expose the XP curve so the frontend can show progress to next level
export const getXpCurve = async (req, res) => {
  const levels = Array.from({ length: 20 }, (_, i) => ({
    level: i,
    xpRequired: xpRequiredForLevel(i),
  }));
  res.json(levels);
};
