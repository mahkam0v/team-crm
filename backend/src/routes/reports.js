import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTransactionRepo, getProjectRepo, getTaskRepo, getActivityLogRepo, getProjectMemberRepo } from '../repositories/index.js';

export const reportsRouter = Router();
reportsRouter.use(requireAuth);

const parseRange = (req) => {
  const now = new Date();
  let from, to;

  switch (req.query.period) {
    case 'today':
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case 'this_week': {
      const day = now.getDay();
      from = new Date(now);
      from.setDate(now.getDate() - day);
      from.setHours(0, 0, 0, 0);
      to = new Date(from);
      to.setDate(from.getDate() + 7);
      break;
    }
    case 'last_month':
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'this_year':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear() + 1, 0, 1);
      break;
    case 'custom':
      from = new Date(req.query.from);
      to = new Date(req.query.to);
      break;
    case 'this_month':
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  return { from, to };
};

reportsRouter.get('/summary', async (req, res, next) => {
  try {
    const { from, to } = parseRange(req);
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    const txRepo = getTransactionRepo();
    const qb = txRepo
      .createQueryBuilder('t')
      .where('t.date >= :from AND t.date < :to', { from, to });
    if (!isAdmin) qb.andWhere('t.userId = :uid', { uid: req.user.id });
    const transactions = await qb.getMany();

    const income = transactions
      .filter((t) => t.type === 'INCOME' && t.status === 'RECEIVED_PAID')
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE' && t.status === 'RECEIVED_PAID')
      .reduce((s, t) => s + Number(t.amount), 0);
    const pendingIncome = transactions
      .filter((t) => t.type === 'INCOME' && t.status === 'PENDING')
      .reduce((s, t) => s + Number(t.amount), 0);
    const pendingExpense = transactions
      .filter((t) => t.type === 'EXPENSE' && t.status === 'PENDING')
      .reduce((s, t) => s + Number(t.amount), 0);

    const projectRepo = getProjectRepo();
    const projectQb = projectRepo.createQueryBuilder('p').where('p.createdAt >= :from AND p.createdAt < :to', { from, to });
    if (!isAdmin) projectQb.andWhere('p.ownerId = :uid', { uid: req.user.id });
    const projectsCreated = await projectQb.getCount();

    const completedQb = projectRepo
      .createQueryBuilder('p')
      .where('p.updatedAt >= :from AND p.updatedAt < :to AND p.status = :status', { from, to, status: 'COMPLETED' });
    if (!isAdmin) completedQb.andWhere('p.ownerId = :uid', { uid: req.user.id });
    const projectsCompleted = await completedQb.getCount();

    const taskRepo = getTaskRepo();
    const taskQb = taskRepo
      .createQueryBuilder('t')
      .where('t.updatedAt >= :from AND t.updatedAt < :to AND t.status = :status', { from, to, status: 'COMPLETED' });
    if (!isAdmin) taskQb.andWhere('t.assignedUserId = :uid', { uid: req.user.id });
    const tasksCompleted = await taskQb.getCount();

    const activeDays = new Set(
      (
        await getActivityLogRepo()
          .createQueryBuilder('a')
          .where('a.userId = :uid AND a.createdAt >= :from AND a.createdAt < :to', {
            uid: req.user.id,
            from,
            to,
          })
          .getMany()
      ).map((a) => a.createdAt.toISOString().slice(0, 10))
    ).size;

    res.json({
      range: { from, to },
      income,
      expense,
      profit: income - expense,
      pendingIncome,
      pendingExpense,
      projectsCreated,
      projectsCompleted,
      tasksCompleted,
      activeDays,
    });
  } catch (err) {
    next(err);
  }
});

// Dashboard analytics: monthly trend, project performance, task stats — all real, no fake data
reportsRouter.get('/analytics', async (req, res, next) => {
  try {
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    const txQb = getTransactionRepo().createQueryBuilder('t').where("t.status = 'RECEIVED_PAID'");
    if (!isAdmin) txQb.andWhere('t."userId" = :uid', { uid: req.user.id });
    const transactions = await txQb.getMany();

    // last 6 months trend
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('uz-UZ', { month: 'short' }), income: 0, expense: 0 });
    }
    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = months.find((m) => m.key === key);
      if (!bucket) continue;
      if (t.type === 'INCOME') bucket.income += Number(t.amount);
      else bucket.expense += Number(t.amount);
    }
    const monthlyTrend = months.map((m) => ({ ...m, profit: m.income - m.expense }));

    // project performance
    const projectRepo = getProjectRepo();
    let projects;
    if (isAdmin) {
      projects = await projectRepo.find();
    } else {
      const memberships = await getProjectMemberRepo().find({ where: { userId: req.user.id } });
      const ids = memberships.map((m) => m.projectId);
      projects = ids.length ? await projectRepo.createQueryBuilder('p').where('p.id IN (:...ids)', { ids }).getMany() : [];
    }
    const allTx = await getTransactionRepo().createQueryBuilder('t').where('t."projectId" IN (:...ids)', { ids: projects.map((p) => p.id).length ? projects.map((p) => p.id) : ['00000000-0000-0000-0000-000000000000'] }).getMany();

    const projectPerformance = projects.map((p) => {
      const tx = allTx.filter((t) => t.projectId === p.id && t.status === 'RECEIVED_PAID');
      const income = tx.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
      const expense = tx.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
      return { id: p.id, name: p.name, income, expense, profit: income - expense, status: p.status };
    });

    // task stats
    const taskRepo = getTaskRepo();
    const taskQb = taskRepo.createQueryBuilder('t');
    if (!isAdmin) taskQb.where('(t."assignedUserId" = :uid OR t."creatorId" = :uid)', { uid: req.user.id });
    const tasks = await taskQb.getMany();
    const now2 = new Date();
    const taskStats = {
      completed: tasks.filter((t) => t.status === 'COMPLETED').length,
      inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      todo: tasks.filter((t) => t.status === 'TODO').length,
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now2 && !['COMPLETED', 'CANCELLED'].includes(t.status)).length,
    };

    res.json({ monthlyTrend, projectPerformance, taskStats });
  } catch (err) {
    next(err);
  }
});
