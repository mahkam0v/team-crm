import { Router } from 'express';
import {
  registerUser,
  loginUser,
  changePassword,
  rotateRefreshToken,
  revokeRefreshToken,
  toPublicUser,
} from '../services/authService.js';
import { registerSchema, loginSchema, validate } from '../validators/authValidators.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: toPublicUser(req.user) });
});

// Exchange a valid refresh token for a fresh access + refresh pair (rotation).
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const result = await rotateRefreshToken(req.body?.refreshToken);
    if (!result) return res.status(401).json({ error: 'Not authenticated' });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Revokes the presented refresh token server-side. The access token is
// short-lived and simply discarded by the client.
authRouter.post('/logout', async (req, res, next) => {
  try {
    await revokeRefreshToken(req.body?.refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Invalid password input' });
    }
    await changePassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
