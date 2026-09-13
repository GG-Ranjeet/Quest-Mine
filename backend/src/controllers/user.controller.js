import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const getUserProfile = async (req, res) => {
  try {
    const allUsers = await db.select().from(users).limit(1);
    
    if (allUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(allUsers[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
