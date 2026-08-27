import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getAchievementRepo, getUserAchievementRepo } from '../repositories/index.js';

export const achievementsRouter = Router();
achievementsRouter.use(requireAuth);

achievementsRouter.get('/', async (req, res, next) => {
  try {
    res.json({ achievements: await getAchievementRepo().find() });
  } catch (err) {
    next(err);
  }
});

achievementsRouter.get('/me', async (req, res, next) => {
  try {
    const earned = await getUserAchievementRepo().find({ where: { userId: req.user.id } });
    res.json({ earned });
  } catch (err) {
    next(err);
  }
});
