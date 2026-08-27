import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTaskCommentRepo } from '../repositories/index.js';
import { canAccessTask, findTaskById } from '../services/taskService.js';
import { processMentions } from '../services/mentionService.js';
import { createNotification } from '../services/notificationService.js';

export const taskCommentsRouter = Router({ mergeParams: true });
taskCommentsRouter.use(requireAuth);

taskCommentsRouter.get('/', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!(await canAccessTask(req.user, task))) return res.status(404).json({ error: 'Task not found' });

    const comments = await getTaskCommentRepo().find({
      where: { taskId: req.params.id },
      order: { createdAt: 'ASC' },
      relations: ['author'],
    });
    res.json({
      comments: comments.map((c) => ({
        id: c.id,
        message: c.message,
        createdAt: c.createdAt,
        authorId: c.authorId,
        authorUsername: c.author?.username,
      })),
    });
  } catch (err) {
    next(err);
  }
});

taskCommentsRouter.post('/', async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!(await canAccessTask(req.user, task))) return res.status(404).json({ error: 'Task not found' });

    const { message } = req.body;
    if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' });

    const repo = getTaskCommentRepo();
    const comment = await repo.save(repo.create({ taskId: req.params.id, authorId: req.user.id, message }));

    if (task.assignedUserId && task.assignedUserId !== req.user.id) {
      await createNotification({
        userId: task.assignedUserId,
        type: 'TASK_COMMENT',
        message: `New comment on task "${task.title}"`,
        entityType: 'TASK',
        entityId: task.id,
      });
    }

    await processMentions({
      message,
      authorId: req.user.id,
      authorUsername: req.user.username,
      contextLabel: `task "${task.title}"`,
      entityType: 'TASK',
      entityId: task.id,
    });

    res.status(201).json({ comment: { ...comment, authorUsername: req.user.username } });
  } catch (err) {
    next(err);
  }
});
