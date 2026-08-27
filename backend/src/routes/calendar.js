import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTaskRepo, getProjectRepo, getTransactionRepo, getProjectMemberRepo } from '../repositories/index.js';

export const calendarRouter = Router();
calendarRouter.use(requireAuth);

// Aggregates task deadlines, project deadlines, and pending transaction dates
// the user is authorized to see, for a given month.
calendarRouter.get('/', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    const taskQb = getTaskRepo().createQueryBuilder('t').where('t.dueDate IS NOT NULL');
    if (!isAdmin) taskQb.andWhere('(t.assignedUserId = :uid OR t.creatorId = :uid)', { uid: req.user.id });
    const tasks = await taskQb.getMany();

    let projectIds = null;
    if (!isAdmin) {
      projectIds = (await getProjectMemberRepo().find({ where: { userId: req.user.id } })).map((m) => m.projectId);
    }
    const projectQb = getProjectRepo().createQueryBuilder('p').where('p.deadline IS NOT NULL');
    if (!isAdmin) {
      if (projectIds.length === 0) projectQb.andWhere('1=0');
      else projectQb.andWhere('p.id IN (:...ids)', { ids: projectIds });
    }
    const projects = await projectQb.getMany();

    const txQb = getTransactionRepo().createQueryBuilder('t').where("t.status = 'PENDING'");
    if (!isAdmin) txQb.andWhere('t.userId = :uid', { uid: req.user.id });
    const pendingTransactions = await txQb.getMany();

    const events = [
      ...tasks.map((t) => ({ type: 'TASK_DEADLINE', date: t.dueDate, title: t.title, id: t.id })),
      ...projects.map((p) => ({ type: 'PROJECT_DEADLINE', date: p.deadline, title: p.name, id: p.id })),
      ...pendingTransactions.map((tx) => ({
        type: tx.type === 'INCOME' ? 'EXPECTED_INCOME' : 'EXPECTED_EXPENSE',
        date: tx.date,
        amount: Number(tx.amount),
        id: tx.id,
      })),
    ];

    res.json({ events });
  } catch (err) {
    next(err);
  }
});
