# ⚔️ QuestMine (cautious-invention)

**QuestMine** is a gamified task-management and habit-tracking application built during a 24-Hour Hackathon. 
Turn your daily to-do lists, habits, and chores into an immersive RPG experience where you mine resources, craft equipment, and defeat bosses by staying productive in real life!

> **Hackathon Timeline:** 
> - **Start:** 12th September 2026, 10:00 AM
> - **End:** 13th September 2026, 10:00 AM
> - **Duration:** 24 Hours

## ✨ Features
- **Gamified To-Do List:** Add daily habits or schedule tasks for specific dates. Completing tasks grants you XP and levels up your character!
- **Dynamic Weekly Schedule:** A sleek 7-day calendar overlay that filters your upcoming quests and daily routines.
- **Crafting System:** Use the materials you earn from completing tasks to forge new armor and accessories.
- **Weekly Boss Fights:** Deal damage to the Weekly Boss (e.g., the Crystal Guardian) by completing your highest-priority tasks!
- **Fully Responsive & SEO Optimized:** Built with a stunning dark-mode aesthetic and optimized for search engines and performance.

## 🛠️ Tech Stack
This full-stack application was built completely from scratch during the hackathon using:
- **Frontend:** React, Vite, TypeScript, and Vanilla CSS for high-performance custom styling.
- **Backend:** Node.js, Express.
- **Database:** Neon (Serverless Postgres).
- **ORM:** Drizzle ORM.
- **Authentication:** Clerk.

## 🚀 Getting Started (Hosting Ready)

The project is structured as a monorepo and is ready for production hosting. 

1. **Clone the repository.**
2. **Install dependencies:** Run `npm install` in both the `/frontend` and `/backend` directories.
3. **Environment Setup:** Copy the `.env.example` files to `.env` in both directories and fill in your Clerk API Keys and Neon Postgres `DATABASE_URL`.
4. **Database Migration:** Run `npm run seed` in the backend directory to populate your database with initial items, quests, and dummy data.
5. **Build & Run:** 
   - Build the frontend: `cd frontend && npm run build`
   - Start the backend: `cd backend && npm start`
   - The Express backend will automatically serve the static compiled frontend!

## 👥 Team

- [Karan Mahato](https://github.com/karanmahto855)
- [Ranjeet Singh Chauhan](https://github.com/GG-Ranjeet)
- [Shreya Srivastava](https://github.com/Shreyasrivastava08)
- [Sunil Nigam](https://github.com/sunil-mca-sudo)
