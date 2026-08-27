import { getActivityLogRepo } from '../repositories/index.js';

export const logActivity = async ({ userId, action, entityType, entityId, metadata = null }) => {
  const repo = getActivityLogRepo();
  await repo.save(repo.create({ userId, action, entityType, entityId, metadata }));
};
