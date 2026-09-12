const pool = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Starting database seeding...");

    // Create tables
    await client.query(`
      DROP TABLE IF EXISTS quests;
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        energy INTEGER DEFAULT 100,
        coins INTEGER DEFAULT 0,
        boss_hp INTEGER DEFAULT 1000
      );

      CREATE TABLE quests (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        stat VARCHAR(100),
        duration VARCHAR(50),
        difficulty VARCHAR(50),
        rarity VARCHAR(50),
        xp INTEGER,
        completed BOOLEAN DEFAULT false
      );
    `);

    // Insert mock user
    await client.query(`
      INSERT INTO users (name, title, level, xp, energy, coins, boss_hp) 
      VALUES ('Rin', 'the Wayfinder', 7, 4820, 68, 1284, 640)
    `);

    // Insert mock quests
    const quests = [
      { id: "q1", title: "Complete deep-work sprint", category: "Focus", stat: "Intelligence", duration: "90m", difficulty: "Hard", rarity: "Legendary", xp: 120 },
      { id: "q2", title: "Morning meditation", category: "Mindfulness", stat: "Wisdom", duration: "15m", difficulty: "Easy", rarity: "Common", xp: 30 },
      { id: "q3", title: "Review pull requests", category: "Work", stat: "Intelligence", duration: "45m", difficulty: "Medium", rarity: "Rare", xp: 60 },
      { id: "q4", title: "Go for a run", category: "Fitness", stat: "Strength", duration: "30m", difficulty: "Medium", rarity: "Uncommon", xp: 50 },
    ];

    for (const q of quests) {
      await client.query(`
        INSERT INTO quests (id, title, category, stat, duration, difficulty, rarity, xp, completed)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      `, [q.id, q.title, q.category, q.stat, q.duration, q.difficulty, q.rarity, q.xp]);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
