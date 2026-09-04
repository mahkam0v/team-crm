import crypto from 'node:crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUserRepo, getUserSettingsRepo, getRefreshTokenRepo } from '../repositories/index.js';

dotenv.config();

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

if (!ACCESS_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, type: 'access' }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });

// Refresh tokens are JWT-signed AND persisted (hashed) so they can be
// revoked on logout. The raw token is only ever returned to the client.
const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });

const issueRefreshToken = async (user) => {
  const raw = signRefreshToken(user);
  const payload = jwt.decode(raw);
  await getRefreshTokenRepo().save(
    getRefreshTokenRepo().create({
      userId: user.id,
      tokenHash: hashToken(raw),
      expiresAt: new Date(payload.exp * 1000),
    })
  );
  return raw;
};

export const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user);
  return { user: toPublicUser(user), accessToken, refreshToken };
};

// Validates a refresh token, revokes it (rotation) and mints a fresh pair.
// Returns null when the token is missing, malformed, revoked or expired —
// the route turns that into a 401.
export const rotateRefreshToken = async (rawToken) => {
  if (!rawToken) return null;

  const repo = getRefreshTokenRepo();
  const userRepo = getUserRepo();

  let payload;
  try {
    payload = jwt.verify(rawToken, REFRESH_SECRET);
  } catch {
    return null;
  }
  if (payload.type !== 'refresh') return null;

  const stored = await repo.findOne({ where: { tokenHash: hashToken(rawToken) } });
  if (!stored || stored.revokedAt) return null;
  if (new Date(stored.expiresAt).getTime() <= Date.now()) return null;

  const user = await userRepo.findOne({ where: { id: payload.sub } });
  if (!user || user.isDisabled) return null;

  // rotation: the presented token can never be used again
  stored.revokedAt = new Date();
  await repo.save(stored);

  return issueTokens(user);
};

export const revokeRefreshToken = async (rawToken) => {
  if (!rawToken) return;
  const repo = getRefreshTokenRepo();
  const stored = await repo.findOne({ where: { tokenHash: hashToken(rawToken) } });
  if (stored && !stored.revokedAt) {
    stored.revokedAt = new Date();
    await repo.save(stored);
  }
};

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

  return issueTokens(user);
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

  return issueTokens(user);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const userRepo = getUserRepo();
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepo.save(user);

  // password changed — invalidate every outstanding refresh token
  await getRefreshTokenRepo()
    .createQueryBuilder()
    .update()
    .set({ revokedAt: new Date() })
    .where('"userId" = :uid AND "revokedAt" IS NULL', { uid: userId })
    .execute();
};

export { toPublicUser };
