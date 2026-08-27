import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTransactionRepo, getProjectMemberRepo } from '../repositories/index.js';
import { createTransactionSchema, validate } from '../validators/transactionValidators.js';
import { logActivity } from '../services/activityService.js';
import { checkFinanceAchievements } from '../services/achievementService.js';

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

// a user only ever sees their own transactions, unless admin
transactionsRouter.get('/', async (req, res, next) => {
  try {
    const repo = getTransactionRepo();
    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
      return res.json({ transactions: await repo.find() });
    }
    res.json({ transactions: await repo.find({ where: { userId: req.user.id } }) });
  } catch (err) {
    next(err);
  }
});

transactionsRouter.post('/', validate(createTransactionSchema), async (req, res, next) => {
  try {
    if (req.body.projectId) {
      const membership = await getProjectMemberRepo().findOne({
        where: { projectId: req.body.projectId, userId: req.user.id },
      });
      if (!membership && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Not a member of this project' });
      }
    }

    const repo = getTransactionRepo();
    const transaction = await repo.save(
      repo.create({
        ...req.body,
        status: req.body.status ?? 'PENDING',
        currency: 'UZS',
        userId: req.user.id,
      })
    );

    await logActivity({
      userId: req.user.id,
      action: transaction.type === 'INCOME' ? 'INCOME_ADDED' : 'EXPENSE_ADDED',
      entityType: 'TRANSACTION',
      entityId: transaction.id,
    });

    if (transaction.type === 'INCOME') await checkFinanceAchievements(req.user.id);

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
});

transactionsRouter.get('/:id', async (req, res, next) => {
  try {
    const repo = getTransactionRepo();
    const transaction = await repo.findOne({ where: { id: req.params.id } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });

    const isOwner = transaction.userId === req.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(404).json({ error: 'Not found' });

    res.json({ transaction });
  } catch (err) {
    next(err);
  }
});

transactionsRouter.patch('/:id', async (req, res, next) => {
  try {
    const repo = getTransactionRepo();
    const transaction = await repo.findOne({ where: { id: req.params.id } });
    if (!transaction) return res.status(404).json({ error: 'Not found' });

    const isOwner = transaction.userId === req.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(404).json({ error: 'Not found' });

    const allowedFields = ['category', 'description', 'status', 'date'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    }
    await repo.save(transaction);
    res.json({ transaction });
  } catch (err) {
    next(err);
  }
});
