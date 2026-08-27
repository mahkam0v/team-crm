import dotenv from 'dotenv';
dotenv.config();

import { AppDataSource } from './config/data-source.js';
import { createApp } from './app.js';
import { seedAchievements } from './services/achievementService.js';

const start = async () => {
  await AppDataSource.initialize();
  console.log('Database connected');

  await seedAchievements();

  const app = createApp();
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
