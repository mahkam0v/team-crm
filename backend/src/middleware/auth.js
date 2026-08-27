import jwt from 'jsonwebtoken';
import { getUserRepo } from '../repositories/index.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserRepo().findOne({ where: { id: payload.sub } });

    if (!user || user.isDisabled) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.user = user; // never trust req.body role/id after this point
    next();
  } catch {
    return res.status(401).json({ error: 'Not authenticated' });
  }
};

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};
