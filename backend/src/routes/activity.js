import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getActivityLogRepo } from '../repositories/index.js';

export const activityRouter = Router();
activityRouter.use(requireAuth);

// user's own activity, or admin viewing anyone's
activityRouter.get('/', async (req, res, next) => {
  try {
    const repo = getActivityLogRepo();
    const targetUserId = req.query.userId;

    if (targetUserId && targetUserId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const logs = await repo.find({
      where: { userId: targetUserId || req.user.id },
      order: { createdAt: 'DESC' },
      take: 200,
    });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});

// GitHub-style contribution calendar: count of activities per day
activityRouter.get('/calendar', async (req, res, next) => {
  try {
    const targetUserId = req.query.userId;
    if (targetUserId && targetUserId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const year = Number(req.query.year) || new Date().getFullYear();
    const repo = getActivityLogRepo();

    const logs = await repo
      .createQueryBuilder('log')
      .where('log.userId = :uid', { uid: targetUserId || req.user.id })
      .andWhere('EXTRACT(YEAR FROM log."createdAt") = :year', { year })
      .getMany();

    const counts = {};
    for (const log of logs) {
      const day = log.createdAt.toISOString().slice(0, 10);
      counts[day] = (counts[day] || 0) + 1;
    }

    res.json({ year, days: counts });
  } catch (err) {
    next(err);
  }
});

// full system-wide activity log — admin only
activityRouter.get('/all', requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const logs = await getActivityLogRepo().find({ order: { createdAt: 'DESC' }, take: 500 });
    res.json({ logs });
  } catch (err) {
    next(err);
  }
});
