import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getUserSettingsRepo } from '../repositories/index.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

settingsRouter.get('/', async (req, res, next) => {
  try {
    const repo = getUserSettingsRepo();
    let settings = await repo.findOne({ where: { userId: req.user.id } });
    if (!settings) {
      settings = await repo.save(repo.create({ userId: req.user.id, dashboardWidgets: null, notificationPrefs: null }));
    }
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

settingsRouter.patch('/', async (req, res, next) => {
  try {
    const repo = getUserSettingsRepo();
    let settings = await repo.findOne({ where: { userId: req.user.id } });
    if (!settings) settings = repo.create({ userId: req.user.id });

    if (req.body.dashboardWidgets !== undefined) settings.dashboardWidgets = req.body.dashboardWidgets;
    if (req.body.notificationPrefs !== undefined) settings.notificationPrefs = req.body.notificationPrefs;

    await repo.save(settings);
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});
