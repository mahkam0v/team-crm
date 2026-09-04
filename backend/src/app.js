import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { projectsRouter } from './routes/projects.js';
import { tasksRouter } from './routes/tasks.js';
import { transactionsRouter } from './routes/transactions.js';
import { notificationsRouter } from './routes/notifications.js';
import { activityRouter } from './routes/activity.js';
import { achievementsRouter } from './routes/achievements.js';
import { filesRouter } from './routes/files.js';
import { tagsRouter } from './routes/tags.js';
import { notesRouter } from './routes/notes.js';
import { reportsRouter } from './routes/reports.js';
import { searchRouter } from './routes/search.js';
import { calendarRouter } from './routes/calendar.js';
import { settingsRouter } from './routes/settings.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  // Reflect the request origin when FRONTEND_URL is unset (local dev) so that
  // `credentials: true` still works in the browser.
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.use(
    '/api/auth',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }),
    authRouter
  );
  app.use('/api/users', usersRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/tasks', tasksRouter);
  app.use('/api/transactions', transactionsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/activity', activityRouter);
  app.use('/api/achievements', achievementsRouter);
  app.use('/api/files', filesRouter);
  app.use('/api/tags', tagsRouter);
  app.use('/api/notes', notesRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/search', searchRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/settings', settingsRouter);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
