import { getNotificationRepo } from '../repositories/index.js';

export const createNotification = async ({ userId, type, message, entityType = null, entityId = null }) => {
  const repo = getNotificationRepo();
  return repo.save(repo.create({ userId, type, message, entityType, entityId }));
};
