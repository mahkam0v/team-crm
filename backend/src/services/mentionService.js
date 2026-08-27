import { getUserRepo } from '../repositories/index.js';
import { createNotification } from './notificationService.js';

// Finds @username mentions in a message and notifies those users.
export const processMentions = async ({ message, authorId, authorUsername, contextLabel, entityType, entityId }) => {
  const usernames = [...message.matchAll(/@([a-zA-Z0-9_]{3,32})/g)].map((m) => m[1]);
  if (usernames.length === 0) return;

  const userRepo = getUserRepo();
  const users = await userRepo
    .createQueryBuilder('user')
    .where('user.username IN (:...usernames)', { usernames })
    .getMany();

  for (const user of users) {
    if (user.id === authorId) continue;
    await createNotification({
      userId: user.id,
      type: 'MENTION',
      message: `${authorUsername} mentioned you in ${contextLabel}`,
      entityType,
      entityId,
    });
  }
};
