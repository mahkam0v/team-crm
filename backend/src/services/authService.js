import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserRepo, getUserSettingsRepo } from '../repositories/index.js';

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  status: user.status,
  currentlyWorkingOn: user.currentlyWorkingOn,
  createdAt: user.createdAt,
});

// First-ever user in the system becomes SUPER_ADMIN. All later registrations
// default to USER — admins/super admins are promoted explicitly, not self-registered.
export const registerUser = async ({ username, email, password }) => {
  const userRepo = getUserRepo();

  const existing = await userRepo.findOne({ where: [{ email }, { username }] });
  if (existing) {
    const err = new Error('Username or email already in use');
    err.status = 409;
    throw err;
  }

  const userCount = await userRepo.count();
  const role = userCount === 0 ? 'SUPER_ADMIN' : 'USER';

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.save(
    userRepo.create({ username, email, passwordHash, role })
  );

  await getUserSettingsRepo().save(
    getUserSettingsRepo().create({ userId: user.id, dashboardWidgets: null, notificationPrefs: null })
  );

  return { user: toPublicUser(user), token: signToken(user) };
};

export const loginUser = async ({ email, password }) => {
  const userRepo = getUserRepo();
  const user = await userRepo.findOne({ where: { email } });

  if (!user || user.isDisabled) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  return { user: toPublicUser(user), token: signToken(user) };
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const userRepo = getUserRepo();
  const user = await userRepo.findOne({ where: { id: userId } });

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);
};

export { toPublicUser };
