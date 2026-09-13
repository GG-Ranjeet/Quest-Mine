import { db } from '../db/db.js';
import { quests, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getQuests = async (req, res) => {
  try {
    const activeQuests = await db.select()
      .from(quests)
      .where(eq(quests.completed, false));
      
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
    // Start a transaction since we are updating multiple tables
    const result = await db.transaction(async (tx) => {
      // Get quest details
      const questList = await tx.select()
        .from(quests)
        .where(eq(quests.id, questId));
        
      if (questList.length === 0 || questList[0].completed) {
        throw new Error('Quest already completed or not found');
      }
      
      const quest = questList[0];

      // Update quest status
      await tx.update(quests)
        .set({ completed: true })
        .where(eq(quests.id, questId));

      // Get user (assuming ID 1 for now)
      const userList = await tx.select().from(users).limit(1);
      if (userList.length === 0) throw new Error('User not found');
      const user = userList[0];

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
