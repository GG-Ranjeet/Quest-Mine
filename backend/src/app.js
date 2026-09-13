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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../../../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all route to serve the React app
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

export default app;
