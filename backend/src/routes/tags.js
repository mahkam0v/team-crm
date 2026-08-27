import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTagRepo } from '../repositories/index.js';

export const tagsRouter = Router();
tagsRouter.use(requireAuth);

tagsRouter.get('/', async (req, res, next) => {
  try {
    res.json({ tags: await getTagRepo().find() });
  } catch (err) {
    next(err);
  }
});

tagsRouter.post('/', async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.length > 50) {
      return res.status(400).json({ error: 'Invalid tag name' });
    }
    const repo = getTagRepo();
    const existing = await repo.findOne({ where: { name } });
    if (existing) return res.json({ tag: existing });

    const tag = await repo.save(repo.create({ name }));
    res.status(201).json({ tag });
  } catch (err) {
    next(err);
  }
});
