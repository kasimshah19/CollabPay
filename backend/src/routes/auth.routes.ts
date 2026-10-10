import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { signup, login, getMe } from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { env } from '../config/env.js';

const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { message: 'Too many authentication attempts, please try again later.' } }
});

const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['brand', 'creator'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

authRouter.post('/signup', authLimiter, validate(signupSchema), signup);
authRouter.post('/login', authLimiter, validate(loginSchema), login);
authRouter.get('/me', requireAuth, getMe);

export default authRouter;
