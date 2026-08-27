import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTaskRepo, getProjectMemberRepo } from '../repositories/index.js';
import { canAccessTask, findTaskById } from '../services/taskService.js';
import { createTaskSchema, updateTaskSchema, validate } from '../validators/taskValidators.js';
import { logActivity } from '../services/activityService.js';
import { checkTaskAchievements } from '../services/achievementService.js';
import { createNotification } from '../services/notificationService.js';
import { taskCommentsRouter } from './taskComments.js';

export const tasksRouter = Router();
tasksRouter.use(requireAuth);
tasksRouter.use('/:id/comments', taskCommentsRouter);

// tasks assigned to me, created by me, or in my projects (admins see all)
tasksRouter.get('/', async (req, res, next) => {
  try {
    const taskRepo = getTaskRepo();
    const { projectId } = req.query;

    if (projectId) {
      const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
      if (!isAdmin) {
        const membership = await getProjectMemberRepo().findOne({ where: { projectId, userId: req.user.id } });
        if (!membership) return res.status(403).json({ error: 'Forbidden' });
      }
      return res.json({ tasks: await taskRepo.find({ where: { projectId } }) });
    }

    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return res.json({ tasks: await taskRepo.find() });
    }

    const memberships = await getProjectMemberRepo().find({ where: { userId: req.user.id } });
    const projectIds = memberships.map((m) => m.projectId);

    const qb = taskRepo
      .createQueryBuilder('task')
      .where('task.assignedUserId = :uid', { uid: req.user.id })
      .orWhere('task.creatorId = :uid', { uid: req.user.id });

    if (projectIds.length > 0) {
      qb.orWhere('task.projectId IN (:...projectIds)', { projectIds });
    }

    res.json({ tasks: await qb.getMany() });
  } catch (err) {
    next(err);
  }
});

tasksRouter.post('/', validate(createTaskSchema), async (req, res, next) => {
  try {
    if (req.body.projectId) {
      const membership = await getProjectMemberRepo().findOne({
        where: { projectId: req.body.projectId, userId: req.user.id },
      });
      if (!membership && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Not a member of this project' });
      }
    }

    const taskRepo = getTaskRepo();
    const task = await taskRepo.save(
      taskRepo.create({ ...req.body, creatorId: req.user.id, status: 'TODO' })
    );

    await logActivity({ userId: req.user.id, action: 'TASK_CREATED', entityType: 'TASK', entityId: task.id });

    if (task.assignedUserId && task.assignedUserId !== req.user.id) {
      await createNotification({
        userId: task.assignedUserId,
        type: 'TASK_ASSIGNED',
        message: `You were assigned task "${task.title}"`,
        entityType: 'TASK',
        entityId: task.id,
      });
    }

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

tasksRouter.get('/:id', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!(await canAccessTask(req.user, task))) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

tasksRouter.patch('/:id', validate(updateTaskSchema), async (req, res, next) => {
  try {
    const taskRepo = getTaskRepo();
    const task = await findTaskById(req.params.id);
    if (!(await canAccessTask(req.user, task))) return res.status(404).json({ error: 'Task not found' });

    const wasCompleted = task.status === 'COMPLETED';
    Object.assign(task, req.body);
    await taskRepo.save(task);

    if (!wasCompleted && task.status === 'COMPLETED') {
      await logActivity({ userId: req.user.id, action: 'TASK_COMPLETED', entityType: 'TASK', entityId: task.id });
      if (task.assignedUserId) await checkTaskAchievements(task.assignedUserId);
    } else {
      await logActivity({ userId: req.user.id, action: 'TASK_UPDATED', entityType: 'TASK', entityId: task.id });
    }

    res.json({ task });
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete('/:id', async (req, res, next) => {
  try {
    const taskRepo = getTaskRepo();
    const task = await findTaskById(req.params.id);
    if (!(await canAccessTask(req.user, task))) return res.status(404).json({ error: 'Task not found' });

    if (task.creatorId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only the creator or an admin can delete this task' });
    }

    await taskRepo.remove(task);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
