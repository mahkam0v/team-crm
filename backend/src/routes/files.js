import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { requireAuth } from '../middleware/auth.js';
import { getFileRepo, getProjectMemberRepo, getTaskRepo } from '../repositories/index.js';

const UPLOAD_DIR = path.resolve('uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

export const filesRouter = Router();
filesRouter.use(requireAuth);

const canAccessEntity = async (user, entityType, entityId) => {
  if (['ADMIN', 'SUPER_ADMIN'].includes(user.role)) return true;

  if (entityType === 'PROJECT') {
    const membership = await getProjectMemberRepo().findOne({ where: { projectId: entityId, userId: user.id } });
    return Boolean(membership);
  }
  if (entityType === 'TASK') {
    const task = await getTaskRepo().findOne({ where: { id: entityId } });
    if (!task) return false;
    if (task.creatorId === user.id || task.assignedUserId === user.id) return true;
    if (task.projectId) {
      const membership = await getProjectMemberRepo().findOne({ where: { projectId: task.projectId, userId: user.id } });
      return Boolean(membership);
    }
  }
  return false;
};

filesRouter.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;
    if (!entityType || !entityId) return res.status(400).json({ error: 'entityType and entityId are required' });
    if (!(await canAccessEntity(req.user, entityType, entityId))) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const repo = getFileRepo();
    const file = await repo.save(
      repo.create({
        ownerId: req.user.id,
        entityType,
        entityId,
        path: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      })
    );
    res.status(201).json({ file });
  } catch (err) {
    next(err);
  }
});

filesRouter.get('/:id/download', async (req, res, next) => {
  try {
    const file = await getFileRepo().findOne({ where: { id: req.params.id } });
    if (!file) return res.status(404).json({ error: 'Not found' });
    if (!(await canAccessEntity(req.user, file.entityType, file.entityId))) {
      return res.status(404).json({ error: 'Not found' }); // don't leak existence
    }
    res.download(path.join(UPLOAD_DIR, file.path), file.originalName);
  } catch (err) {
    next(err);
  }
});

filesRouter.get('/', async (req, res, next) => {
  try {
    const { entityType, entityId } = req.query;
    if (!entityType || !entityId) return res.status(400).json({ error: 'entityType and entityId are required' });
    if (!(await canAccessEntity(req.user, entityType, entityId))) {
      return res.json({ files: [] }); // don't leak existence
    }
    const files = await getFileRepo().find({ where: { entityType, entityId } });
    res.json({ files });
  } catch (err) {
    next(err);
  }
});
