import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProjectRepo, getTaskRepo, getTransactionRepo, getUserRepo, getProjectMemberRepo } from '../repositories/index.js';

export const searchRouter = Router();
searchRouter.use(requireAuth);

searchRouter.get('/', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ projects: [], tasks: [], transactions: [], users: [] });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    const like = `%${q}%`;

    let projectIds = null;
    if (!isAdmin) {
      const memberships = await getProjectMemberRepo().find({ where: { userId: req.user.id } });
      projectIds = memberships.map((m) => m.projectId);
    }

    const projectQb = getProjectRepo().createQueryBuilder('p').where('p.name ILIKE :q', { q: like });
    if (!isAdmin) {
      if (projectIds.length === 0) projectQb.andWhere('1=0');
      else projectQb.andWhere('p.id IN (:...ids)', { ids: projectIds });
    }
    const projects = await projectQb.take(10).getMany();

    const taskQb = getTaskRepo().createQueryBuilder('t').where('t.title ILIKE :q', { q: like });
    if (!isAdmin) {
      taskQb.andWhere('(t.assignedUserId = :uid OR t.creatorId = :uid)', { uid: req.user.id });
    }
    const tasks = await taskQb.take(10).getMany();

    const txQb = getTransactionRepo().createQueryBuilder('t').where('t.description ILIKE :q', { q: like });
    if (!isAdmin) txQb.andWhere('t.userId = :uid', { uid: req.user.id });
    const transactions = await txQb.take(10).getMany();

    const users = isAdmin
      ? await getUserRepo()
          .createQueryBuilder('u')
          .where('u.username ILIKE :q OR u.email ILIKE :q', { q: like })
          .take(10)
          .getMany()
      : [];

    res.json({ projects, tasks, transactions, users: users.map((u) => ({ id: u.id, username: u.username })) });
  } catch (err) {
    next(err);
  }
});
