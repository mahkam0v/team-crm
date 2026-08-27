import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getNoteRepo, getProjectMemberRepo } from '../repositories/index.js';
import { canAccessTask, findTaskById } from '../services/taskService.js';

export const notesRouter = Router();
notesRouter.use(requireAuth);

const canAccessProject = async (user, projectId) => {
  if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return true;
  const membership = await getProjectMemberRepo().findOne({ where: { projectId, userId: user.id } });
  return Boolean(membership);
};

notesRouter.get('/', async (req, res, next) => {
  try {
    const { projectId, taskId } = req.query;
    if (!projectId && !taskId) return res.status(400).json({ error: 'projectId or taskId required' });

    if (projectId && !(await canAccessProject(req.user, projectId))) {
      return res.json({ notes: [] });
    }
    if (taskId) {
      const task = await findTaskById(taskId);
      if (!(await canAccessTask(req.user, task))) return res.json({ notes: [] });
    }

    const repo = getNoteRepo();
    const where = projectId ? { projectId } : { taskId };
    res.json({ notes: await repo.find({ where, order: { createdAt: 'DESC' } }) });
  } catch (err) {
    next(err);
  }
});

notesRouter.post('/', async (req, res, next) => {
  try {
    const { content, projectId, taskId } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });
    if (!projectId && !taskId) return res.status(400).json({ error: 'projectId or taskId required' });

    if (projectId && !(await canAccessProject(req.user, projectId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (taskId) {
      const task = await findTaskById(taskId);
      if (!(await canAccessTask(req.user, task))) return res.status(403).json({ error: 'Forbidden' });
    }

    const repo = getNoteRepo();
    const note = await repo.save(
      repo.create({ content, authorId: req.user.id, projectId: projectId || null, taskId: taskId || null })
    );
    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
});

notesRouter.delete('/:id', async (req, res, next) => {
  try {
    const repo = getNoteRepo();
    const note = await repo.findOne({ where: { id: req.params.id } });
    if (!note) return res.status(404).json({ error: 'Not found' });
    if (note.authorId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await repo.remove(note);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
