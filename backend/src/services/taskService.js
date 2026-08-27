import { getTaskRepo, getProjectMemberRepo } from '../repositories/index.js';

// A task is visible to: its creator, its assignee, any member of its project
// (if it belongs to one), or an ADMIN/SUPER_ADMIN.
export const canAccessTask = async (user, task) => {
  if (!task) return false;
  if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
  if (task.creatorId === user.id || task.assignedUserId === user.id) return true;

  if (task.projectId) {
    const membership = await getProjectMemberRepo().findOne({
      where: { projectId: task.projectId, userId: user.id },
    });
    return Boolean(membership);
  }

  return false;
};

export const findTaskById = async (id) => getTaskRepo().findOne({ where: { id } });
