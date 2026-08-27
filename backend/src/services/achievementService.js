import {
  getAchievementRepo,
  getUserAchievementRepo,
  getProjectRepo,
  getTaskRepo,
  getTransactionRepo,
} from '../repositories/index.js';
import { createNotification } from './notificationService.js';

export const ACHIEVEMENT_DEFS = [
  { key: 'FIRST_PROJECT', title: 'First Project', description: 'Created your first project', category: 'PROJECT' },
  { key: 'FIRST_COMPLETED_PROJECT', title: 'First Completed Project', description: 'Completed a project', category: 'PROJECT' },
  { key: 'TEN_PROJECTS', title: '10 Projects', description: 'Created 10 projects', category: 'PROJECT' },
  { key: 'FIRST_COMPLETED_TASK', title: 'First Completed Task', description: 'Completed your first task', category: 'TASK' },
  { key: 'TEN_TASKS', title: '10 Tasks', description: 'Completed 10 tasks', category: 'TASK' },
  { key: 'HUNDRED_TASKS', title: '100 Tasks', description: 'Completed 100 tasks', category: 'TASK' },
  { key: 'FIRST_INCOME', title: 'First Income', description: 'Recorded your first income', category: 'FINANCE' },
  { key: 'FIRST_POSITIVE_MONTH', title: 'First Positive Month', description: 'Ended a month with positive profit', category: 'FINANCE' },
];

export const seedAchievements = async () => {
  const repo = getAchievementRepo();
  for (const def of ACHIEVEMENT_DEFS) {
    const existing = await repo.findOne({ where: { key: def.key } });
    if (!existing) await repo.save(repo.create(def));
  }
};

const awardIfMissing = async (userId, key) => {
  const achievementRepo = getAchievementRepo();
  const userAchievementRepo = getUserAchievementRepo();

  const achievement = await achievementRepo.findOne({ where: { key } });
  if (!achievement) return;

  const already = await userAchievementRepo.findOne({ where: { userId, achievementId: achievement.id } });
  if (already) return;

  await userAchievementRepo.save(userAchievementRepo.create({ userId, achievementId: achievement.id }));
  await createNotification({
    userId,
    type: 'ACHIEVEMENT_EARNED',
    message: `🏆 You earned "${achievement.title}"`,
    entityType: 'ACHIEVEMENT',
    entityId: achievement.id,
  });
};

export const checkProjectAchievements = async (userId) => {
  const count = await getProjectRepo().count({ where: { ownerId: userId } });
  if (count >= 1) await awardIfMissing(userId, 'FIRST_PROJECT');
  if (count >= 10) await awardIfMissing(userId, 'TEN_PROJECTS');
};

export const checkProjectCompletedAchievement = async (userId) => {
  await awardIfMissing(userId, 'FIRST_COMPLETED_PROJECT');
};

export const checkTaskAchievements = async (userId) => {
  const count = await getTaskRepo().count({ where: { assignedUserId: userId, status: 'COMPLETED' } });
  if (count >= 1) await awardIfMissing(userId, 'FIRST_COMPLETED_TASK');
  if (count >= 10) await awardIfMissing(userId, 'TEN_TASKS');
  if (count >= 100) await awardIfMissing(userId, 'HUNDRED_TASKS');
};

export const checkFinanceAchievements = async (userId) => {
  const incomeCount = await getTransactionRepo().count({ where: { userId, type: 'INCOME' } });
  if (incomeCount >= 1) await awardIfMissing(userId, 'FIRST_INCOME');
};
