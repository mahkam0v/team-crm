import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  client: z.string().max(200).optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
  expectedIncome: z.number().int().nonnegative().optional(),
  expectedExpense: z.number().int().nonnegative().optional(),
  budget: z.number().int().nonnegative().optional(),
  memberIds: z.array(z.string().uuid()).optional(),
  note: z.string().max(5000).optional(),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).nullable().optional(),
  client: z.string().max(200).nullable().optional(),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  startDate: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  expectedIncome: z.number().int().nonnegative().optional(),
  expectedExpense: z.number().int().nonnegative().optional(),
  budget: z.number().int().nonnegative().optional(),
}).strict();

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: result.error.issues[0].message });
  req.body = result.data;
  next();
};
