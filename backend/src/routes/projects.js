import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireProjectAccess } from '../middleware/projectAccess.js';
import { getProjectRepo, getProjectMemberRepo, getUserRepo, getTaskRepo, getTransactionRepo, getActivityLogRepo, getNoteRepo } from '../repositories/index.js';
import { createProject, getProjectOverview, markProjectCompleted, addInitialMembers } from '../services/projectService.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema, validate } from '../validators/projectValidators.js';
import { logActivity } from '../services/activityService.js';
import { createNotification } from '../services/notificationService.js';
import { projectChatRouter } from './projectChat.js';

export const projectsRouter = Router();
projectsRouter.use(requireAuth);
projectsRouter.use('/:id/chat', projectChatRouter);

const finalizeAmount = (rows, field) => rows.reduce((acc, r) => acc + Number(r[field] || 0), 0);

// list projects the user owns or is a member of (admins see all)
// supports: ?status=, ?q=, ?sort=newest|oldest|most_spent|least_spent|most_revenue|least_revenue|most_profit|least_profit|progress|deadline
projectsRouter.get('/', async (req, res, next) => {
  try {
    const projectRepo = getProjectRepo();
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    let projects;
    if (isAdmin) {
      projects = await projectRepo.find();
    } else {
      const memberships = await getProjectMemberRepo().find({ where: { userId: req.user.id } });
      const projectIds = memberships.map((m) => m.projectId);
      if (projectIds.length === 0) return res.json({ projects: [] });
      projects = await projectRepo.createQueryBuilder('project').where('project.id IN (:...ids)', { ids: projectIds }).getMany();
    }

    if (req.query.status) projects = projects.filter((p) => p.status === req.query.status);
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      projects = projects.filter((p) => p.name.toLowerCase().includes(q) || p.client?.toLowerCase().includes(q));
    }

    // batch-compute finance + progress for every visible project (avoids N+1 by grouping in memory)
    const projectIds = projects.map((p) => p.id);
    const [allTasks, allTransactions, allMembers] = await Promise.all([
      projectIds.length ? getTaskRepo().createQueryBuilder('t').where('t."projectId" IN (:...ids)', { ids: projectIds }).getMany() : [],
      projectIds.length ? getTransactionRepo().createQueryBuilder('t').where('t."projectId" IN (:...ids)', { ids: projectIds }).getMany() : [],
      projectIds.length ? getProjectMemberRepo().createQueryBuilder('m').where('m."projectId" IN (:...ids)', { ids: projectIds }).leftJoinAndSelect('m.user', 'user').getMany() : [],
    ]);

    const enriched = projects.map((p) => {
      const tx = allTransactions.filter((t) => t.projectId === p.id);
      const tasks = allTasks.filter((t) => t.projectId === p.id);
      const members = allMembers.filter((m) => m.projectId === p.id);

      const actualIncome = finalizeAmount(tx.filter((t) => t.type === 'INCOME' && t.status === 'RECEIVED_PAID'), 'amount');
      const actualExpense = finalizeAmount(tx.filter((t) => t.type === 'EXPENSE' && t.status === 'RECEIVED_PAID'), 'amount');
      const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

      return {
        ...p,
        finance: { actualIncome, actualExpense, actualProfit: actualIncome - actualExpense },
        progress: tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100),
        taskCount: tasks.length,
        members: members.map((m) => ({ userId: m.userId, username: m.user?.username })),
      };
    });

    const sorters = {
      newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      most_spent: (a, b) => b.finance.actualExpense - a.finance.actualExpense,
      least_spent: (a, b) => a.finance.actualExpense - b.finance.actualExpense,
      most_revenue: (a, b) => b.finance.actualIncome - a.finance.actualIncome,
      least_revenue: (a, b) => a.finance.actualIncome - b.finance.actualIncome,
      most_profit: (a, b) => b.finance.actualProfit - a.finance.actualProfit,
      least_profit: (a, b) => a.finance.actualProfit - b.finance.actualProfit,
      progress: (a, b) => b.progress - a.progress,
      deadline: (a, b) => new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31'),
    };
    const sort = sorters[req.query.sort] || sorters.newest;
    enriched.sort(sort);

    res.json({ projects: enriched });
  } catch (err) {
    next(err);
  }
});

projectsRouter.post('/', validate(createProjectSchema), async (req, res, next) => {
  try {
    if (req.body.memberIds?.length) {
      const existingCount = await getUserRepo().createQueryBuilder('u')
        .where('u.id IN (:...ids)', { ids: req.body.memberIds })
        .getCount();
      if (existingCount !== req.body.memberIds.length) {
        return res.status(400).json({ error: 'Some selected members do not exist' });
      }
    }

    const project = await createProject(req.user.id, req.body);

    if (req.body.memberIds?.length) {
      await addInitialMembers(project.id, req.body.memberIds);
      for (const userId of req.body.memberIds) {
        if (userId === req.user.id) continue;
        await createNotification({
          userId,
          type: 'PROJECT_MEMBER_ADDED',
          message: `You were added to "${project.name}" project.`,
          entityType: 'PROJECT',
          entityId: project.id,
        });
      }
    }

    if (req.body.note?.trim()) {
      const noteRepo = getNoteRepo();
      await noteRepo.save(noteRepo.create({ content: req.body.note, authorId: req.user.id, projectId: project.id }));
    }

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:id', requireProjectAccess, async (req, res, next) => {
  try {
    const overview = await getProjectOverview(req.params.id);
    res.json({ project: overview });
  } catch (err) {
    next(err);
  }
});

projectsRouter.patch('/:id', requireProjectAccess, validate(updateProjectSchema), async (req, res, next) => {
  try {
    const projectRepo = getProjectRepo();
    const allowedFields = ['name', 'description', 'client', 'status', 'priority', 'startDate', 'deadline', 'expectedIncome', 'expectedExpense', 'budget'];
    const wasCompleted = req.project.status === 'COMPLETED';
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) req.project[field] = req.body[field];
    }
    await projectRepo.save(req.project);
    await logActivity({ userId: req.user.id, action: 'PROJECT_UPDATED', entityType: 'PROJECT', entityId: req.project.id });

    if (!wasCompleted && req.project.status === 'COMPLETED') {
      await markProjectCompleted(req.project.id, req.project.ownerId);
    }

    res.json({ project: req.project });
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete('/:id', requireProjectAccess, async (req, res, next) => {
  try {
    if (req.project.ownerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only the project owner or an admin can delete this project' });
    }
    await getProjectRepo().remove(req.project);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

projectsRouter.get('/:id/members', requireProjectAccess, async (req, res, next) => {
  try {
    const members = await getProjectMemberRepo().find({
      where: { projectId: req.params.id },
      relations: ['user'],
    });
    res.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        username: m.user?.username,
        avatar: m.user?.avatar,
        status: m.user?.status,
        isOwner: m.userId === req.project.ownerId,
      })),
    });
  } catch (err) {
    next(err);
  }
});

projectsRouter.post('/:id/members', requireProjectAccess, validate(addMemberSchema), async (req, res, next) => {
  try {
    if (req.project.ownerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only the project owner or an admin can add members' });
    }

    const targetUser = await getUserRepo().findOne({ where: { id: req.body.userId } });
    if (!targetUser) return res.status(404).json({ error: 'User not found' });

    const memberRepo = getProjectMemberRepo();
    const existing = await memberRepo.findOne({ where: { projectId: req.params.id, userId: req.body.userId } });
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const member = await memberRepo.save(memberRepo.create({ projectId: req.params.id, userId: req.body.userId }));

    await logActivity({
      userId: req.user.id,
      action: 'PROJECT_MEMBER_ADDED',
      entityType: 'PROJECT',
      entityId: req.params.id,
      metadata: { addedUserId: req.body.userId },
    });

    await createNotification({
      userId: req.body.userId,
      type: 'PROJECT_MEMBER_ADDED',
      message: `You were added to "${req.project.name}" project.`,
      entityType: 'PROJECT',
      entityId: req.params.id,
    });

    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete('/:id/members/:userId', requireProjectAccess, async (req, res, next) => {
  try {
    if (req.project.ownerId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only the project owner or an admin can remove members' });
    }

    const memberRepo = getProjectMemberRepo();
    const membership = await memberRepo.findOne({ where: { projectId: req.params.id, userId: req.params.userId } });
    if (!membership) return res.status(404).json({ error: 'Membership not found' });

    await memberRepo.remove(membership);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Project-scoped finance: transactions tied to this project only
projectsRouter.get('/:id/transactions', requireProjectAccess, async (req, res, next) => {
  try {
    const transactions = await getTransactionRepo().find({ where: { projectId: req.params.id }, order: { date: 'DESC' } });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

// Project-scoped activity feed: references the project itself, its tasks, or its transactions
projectsRouter.get('/:id/activity', requireProjectAccess, async (req, res, next) => {
  try {
    const [tasks, transactions] = await Promise.all([
      getTaskRepo().find({ where: { projectId: req.params.id } }),
      getTransactionRepo().find({ where: { projectId: req.params.id } }),
    ]);
    const entityIds = [req.params.id, ...tasks.map((t) => t.id), ...transactions.map((t) => t.id)];

    const logs = await getActivityLogRepo()
      .createQueryBuilder('log')
      .leftJoin('users', 'u', 'u.id = log."userId"')
      .addSelect('u.username', 'actorUsername')
      .where('log."entityId" IN (:...ids)', { ids: entityIds })
      .orderBy('log."createdAt"', 'DESC')
      .limit(200)
      .getRawAndEntities();

    const merged = logs.entities.map((log, i) => ({
      ...log,
      actorUsername: logs.raw[i]?.actorUsername,
    }));

    res.json({ logs: merged });
  } catch (err) {
    next(err);
  }
});
