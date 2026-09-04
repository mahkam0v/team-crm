import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getUserRepo, getProjectMemberRepo, getTaskRepo, getUserAchievementRepo, getActivityLogRepo } from '../repositories/index.js';
import { toPublicUser } from '../services/authService.js';

const USER_STATUSES = ['AVAILABLE', 'BUSY', 'DO_NOT_DISTURB', 'OFFLINE'];
const VALID_ROLES = ['SUPER_ADMIN', 'ADMIN', 'USER'];

const isInvalidUuid = (id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id || ''));

export const usersRouter = Router();
usersRouter.use(requireAuth);

// lightweight directory for @mentions / member pickers — any authenticated user
usersRouter.get('/directory', async (req, res, next) => {
  try {
    const users = await getUserRepo().find({ where: { isDisabled: false } });
    res.json({
      users: users.map((u) => ({ id: u.id, username: u.username, avatar: u.avatar, status: u.status })),
    });
  } catch (err) {
    next(err);
  }
});

// USER can view/edit only their own profile
usersRouter.get('/me', (req, res) => res.json({ user: toPublicUser(req.user) }));

usersRouter.get('/me/stats', async (req, res, next) => {
  try {
    const [projectsCount, completedTasks, achievementsCount, activeDaysSet] = await Promise.all([
      getProjectMemberRepo().count({ where: { userId: req.user.id } }),
      getTaskRepo().count({ where: { assignedUserId: req.user.id, status: 'COMPLETED' } }),
      getUserAchievementRepo().count({ where: { userId: req.user.id } }),
      getActivityLogRepo().find({ where: { userId: req.user.id } }),
    ]);
    const activeDays = new Set(activeDaysSet.map((a) => a.createdAt.toISOString().slice(0, 10))).size;

    res.json({ projectsCount, completedTasks, achievementsCount, activeDays });
  } catch (err) {
    next(err);
  }
});

usersRouter.patch('/me', async (req, res, next) => {
  try {
    const { bio, avatar, status, currentlyWorkingOn } = req.body;
    if (status !== undefined && !USER_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${USER_STATUSES.join(', ')}` });
    }
    if (bio !== undefined && typeof bio !== 'string') return res.status(400).json({ error: 'bio must be a string' });
    if (currentlyWorkingOn !== undefined && typeof currentlyWorkingOn !== 'string') {
      return res.status(400).json({ error: 'currentlyWorkingOn must be a string' });
    }
    if (avatar !== undefined && typeof avatar !== 'string') return res.status(400).json({ error: 'avatar must be a string' });

    const userRepo = getUserRepo();
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    Object.assign(user, {
      bio: bio ?? user.bio,
      avatar: avatar ?? user.avatar,
      status: status ?? user.status,
      currentlyWorkingOn: currentlyWorkingOn ?? user.currentlyWorkingOn,
    });
    await userRepo.save(user);
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// ADMIN + SUPER_ADMIN: list/manage users
usersRouter.get('/', requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const users = await getUserRepo().find();
    res.json({ users: users.map(toPublicUser) });
  } catch (err) {
    next(err);
  }
});

// Only SUPER_ADMIN can create ADMIN or SUPER_ADMIN accounts.
// ADMIN can only create USER accounts.
usersRouter.post('/', requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { username, email, password, role = 'USER' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password are required' });
    }
    if (typeof username !== 'string' || username.trim().length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'username must be 3-32 characters' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (role !== 'USER' && req.user.role !== 'SUPER_ADMIN') {
      const err = new Error('Only Super Admin can create admin accounts');
      err.status = 403;
      throw err;
    }

    const userRepo = getUserRepo();
    const existing = await userRepo.findOne({ where: [{ email }, { username }] });
    if (existing) {
      const err = new Error('Username or email already in use');
      err.status = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepo.save(userRepo.create({ username, email, passwordHash, role }));
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
});

// disable/enable a user — SUPER_ADMIN can target anyone except self;
// ADMIN can only target USER accounts
usersRouter.patch('/:id/disable', requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    if (isInvalidUuid(req.params.id)) return res.status(404).json({ error: 'User not found' });
    const userRepo = getUserRepo();
    const target = await userRepo.findOne({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.role !== 'USER' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (target.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }

    target.isDisabled = true;
    await userRepo.save(target);
    res.json({ user: toPublicUser(target) });
  } catch (err) {
    next(err);
  }
});
