const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Get User Profile
app.get('/api/user', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Quests
app.get('/api/quests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quests WHERE completed = false ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete Quest
app.post('/api/quests/complete', async (req, res) => {
  const { questId, damage } = req.body;
  if (!questId) return res.status(400).json({ error: 'Quest ID required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get quest details
    const questResult = await client.query('SELECT * FROM quests WHERE id = $1 AND completed = false', [questId]);
    if (questResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Quest already completed or not found' });
    }
    const quest = questResult.rows[0];

    // Update quest status
    await client.query('UPDATE quests SET completed = true WHERE id = $1', [questId]);

    // Update user stats
    const coinsReward = Math.floor(Math.random() * 50) + 10;
    const energyCost = 7;
    const dmg = damage || 40;

    const userResult = await client.query(`
      UPDATE users 
      SET 
        xp = xp + $1,
        coins = coins + $2,
        energy = GREATEST(0, energy - $3),
        boss_hp = GREATEST(0, boss_hp - $4)
      WHERE id = 1
      RETURNING *
    `, [quest.xp, coinsReward, energyCost, dmg]);

    await client.query('COMMIT');
    
    res.json({
      success: true,
      user: userResult.rows[0],
      reward: { xp: quest.xp, coins: coinsReward }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
