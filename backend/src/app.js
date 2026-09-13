import express from 'express';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';
import questRoutes from './routes/quest.routes.js';
import craftingRoutes from './routes/crafting.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/craft', craftingRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
