import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getNotificationRepo } from '../repositories/index.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get('/', async (req, res, next) => {
  try {
    const notifications = await getNotificationRepo().find({
      where: { userId: req.user.id },
      order: { createdAt: 'DESC' },
    });
    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch('/:id/read', async (req, res, next) => {
  try {
    const repo = getNotificationRepo();
    const notification = await repo.findOne({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }
    notification.isRead = true;
    await repo.save(notification);
    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

notificationsRouter.patch('/read-all', async (req, res, next) => {
  try {
    const repo = getNotificationRepo();
    await repo
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('userId = :uid AND isRead = false', { uid: req.user.id })
      .execute();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

