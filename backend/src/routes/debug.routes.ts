import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { env } from '../config/env.js';

const debugRouter = Router();

if (env.NODE_ENV !== 'production') {
  debugRouter.get('/brand-only', requireAuth, requireRole('brand'), (req, res) => {
    res.json({ message: 'Welcome brand', user: req.user });
  });
  debugRouter.get('/creator-only', requireAuth, requireRole('creator'), (req, res) => {
    res.json({ message: 'Welcome creator', user: req.user });
  });
}

export default debugRouter;
