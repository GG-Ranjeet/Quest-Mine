import { db } from '../db/db.js';
import { quests, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Helper: extract clerk_id from the JWT in Authorization header
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

// Helper: get the DB user row from the Clerk JWT
async function getUserFromReq(req, res) {
  const clerkId = getClerkIdFromReq(req);
  if (!clerkId) {
    res.status(401).json({ error: 'Unauthorized' });
    return null;
  }
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (result.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return null;
  }
  return result[0];
}

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
      // Get quest details (must belong to this user)
      const questList = await tx.select()
        .from(quests)
        .where(and(eq(quests.id, questId), eq(quests.userId, user.id)));

      if (questList.length === 0 || questList[0].completed) {
        throw new Error('Quest already completed or not found');
      }

      const quest = questList[0];

      // Mark quest as completed
      await tx.update(quests)
        .set({ completed: true })
        .where(eq(quests.id, questId));

      // Calculate rewards
      const coinsReward = Math.floor(Math.random() * 50) + 10;

      // Update user stats
      const [updatedUser] = await tx.update(users)
        .set({
          xp: (user.xp || 0) + (quest.xp || 0),
          coins: (user.coins || 0) + coinsReward
        })
        .where(eq(users.id, user.id))
        .returning();

      return {
        user: updatedUser,
        reward: { xp: quest.xp, coins: coinsReward }
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

  if (!title) {
    return res.status(400).json({ error: 'Quest title is required' });
  }

  try {
    const user = await getUserFromReq(req, res);
    if (!user) return;

    // Calculate XP based on difficulty
    let baseXP = 10;
    if (difficulty === 'Medium') baseXP = 20;
    if (difficulty === 'Hard') baseXP = 30;
    if (difficulty === 'Epic') baseXP = 40;

    // Scale with user level
    const calculatedXP = baseXP + (user.level * 2);

    const today = new Date().toISOString().split('T')[0];
    if (scheduledDate === today || isEveryday) {
      await db.update(users)
        .set({ xp: (user.xp || 0) + 1 })
        .where(eq(users.id, user.id));
    }

    const [newQuest] = await db.insert(quests).values({
      id: Date.now().toString(),
      title,
      category: category || 'General',
      stat: stat || 'STR',
      difficulty: difficulty || 'Easy',
      xp: calculatedXP,
      completed: false,
      userId: user.id,
      scheduledDate: scheduledDate || today,
      isEveryday: isEveryday || false
    }).returning();

    res.status(201).json(newQuest);
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

    if (!updatedQuest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

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

    if (!deletedQuest) {
      return res.status(404).json({ error: 'Quest not found' });
    }

    res.json({ success: true, message: 'Quest deleted successfully', deletedQuest });
  } catch (error) {
    console.error('Error deleting quest:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
