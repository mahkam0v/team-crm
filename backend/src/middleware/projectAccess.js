import { getProjectRepo, getProjectMemberRepo } from '../repositories/index.js';

// Loads the project and verifies the authenticated user may access it:
// owner, a project member, or ADMIN/SUPER_ADMIN. Attaches req.project.
export const requireProjectAccess = async (req, res, next) => {
  try {
    const project = await getProjectRepo().findOne({ where: { id: req.params.projectId || req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || project.ownerId === req.user.id) {
      req.project = project;
      return next();
    }

    const membership = await getProjectMemberRepo().findOne({
      where: { projectId: project.id, userId: req.user.id },
    });
    if (!membership) return res.status(403).json({ error: 'Forbidden' });

    req.project = project;
    next();
  } catch (err) {
    next(err);
  }
};
