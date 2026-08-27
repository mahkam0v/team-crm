import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().int().positive(),
  category: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  date: z.string(),
  status: z.enum(['RECEIVED_PAID', 'PENDING', 'CANCELLED']).optional(),
  projectId: z.string().uuid().optional(),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });
  req.body = result.data;
  next();
};
