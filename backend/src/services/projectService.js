import {
  getProjectRepo,
  getProjectMemberRepo,
  getTaskRepo,
  getTransactionRepo,
} from '../repositories/index.js';
import { logActivity } from './activityService.js';
import { checkProjectAchievements, checkProjectCompletedAchievement } from './achievementService.js';

const SUM = (rows, field) => rows.reduce((acc, r) => acc + Number(r[field] || 0), 0);

// Actual/expected finance is always derived from live transactions —
// never cached — per the "data consistency" rule.
export const getProjectFinance = async (projectId) => {
  const transactions = await getTransactionRepo().find({ where: { projectId } });

  const actualIncome = SUM(
    transactions.filter((t) => t.type === 'INCOME' && t.status === 'RECEIVED_PAID'),
    'amount'
  );
  const actualExpense = SUM(
    transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'RECEIVED_PAID'),
    'amount'
  );
  const pendingIncome = SUM(
    transactions.filter((t) => t.type === 'INCOME' && t.status === 'PENDING'),
    'amount'
  );
  const pendingExpense = SUM(
    transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'PENDING'),
    'amount'
  );

  return {
    actualIncome,
    actualExpense,
    actualProfit: actualIncome - actualExpense,
    pendingIncome,
    pendingExpense,
    expectedProfit: actualIncome + pendingIncome - (actualExpense + pendingExpense),
  };
};

export const getProjectProgress = async (projectId) => {
  const tasks = await getTaskRepo().find({ where: { projectId } });
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  return { total, completed, progress: total === 0 ? 0 : Math.round((completed / total) * 100) };
};

export const createProject = async (ownerId, data) => {
  const projectRepo = getProjectRepo();
  const project = await projectRepo.save(
    projectRepo.create({
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? 'PLANNING',
      priority: data.priority ?? 'MEDIUM',
      client: data.client ?? null,
      ownerId,
      startDate: data.startDate ?? null,
      deadline: data.deadline ?? null,
      expectedIncome: data.expectedIncome ?? 0,
      expectedExpense: data.expectedExpense ?? 0,
      budget: data.budget ?? 0,
    })
  );

  await getProjectMemberRepo().save(
    getProjectMemberRepo().create({ projectId: project.id, userId: ownerId })
  );

  await logActivity({ userId: ownerId, action: 'PROJECT_CREATED', entityType: 'PROJECT', entityId: project.id });
  await checkProjectAchievements(ownerId);

  return project;
};

export const markProjectCompleted = async (projectId, ownerId) => {
  await checkProjectCompletedAchievement(ownerId);
};

export const addInitialMembers = async (projectId, userIds = []) => {
  const memberRepo = getProjectMemberRepo();
  for (const userId of userIds) {
    const existing = await memberRepo.findOne({ where: { projectId, userId } });
    if (!existing) await memberRepo.save(memberRepo.create({ projectId, userId }));
  }
};

export const getProjectOverview = async (projectId) => {
  const project = await getProjectRepo().findOne({ where: { id: projectId } });
  if (!project) return null;

  const [finance, progress, members] = await Promise.all([
    getProjectFinance(projectId),
    getProjectProgress(projectId),
    getProjectMemberRepo().find({ where: { projectId }, relations: ['user'] }),
  ]);

  const spent = finance.actualExpense;
  const budgetRemaining = Number(project.budget) - spent;

  return {
    ...project,
    finance,
    progress,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      username: m.user?.username,
      avatar: m.user?.avatar,
      status: m.user?.status,
      isOwner: m.userId === project.ownerId,
    })),
    budget: {
      total: Number(project.budget),
      spent,
      remaining: budgetRemaining,
      exceeded: budgetRemaining < 0,
    },
  };
};
