import { Router } from 'express';
import { registerUser, loginUser, changePassword, toPublicUser } from '../services/authService.js';
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

authRouter.post('/logout', requireAuth, (req, res) => {
  // stateless JWT — client just discards the token
  res.json({ success: true });
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
