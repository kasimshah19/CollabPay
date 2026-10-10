import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User, IUser } from '../models/User.js';
import { AppError } from './AppError.js';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized: Missing or invalid token');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'Unauthorized: Missing token');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };
    
    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new AppError(401, 'Unauthorized: User no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Unauthorized: Invalid token'));
    } else if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Unauthorized: Token expired'));
    } else {
      next(err);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Unauthorized: User not authenticated'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Forbidden: Insufficient role permissions'));
    }
    next();
  };
};
