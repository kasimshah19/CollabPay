import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/AppError.js';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      // 409 is required by the prompt
      return next(new AppError(409, 'User with this email already exists', 'DUPLICATE_RESOURCE'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
    });

    const token = generateToken(user.id, user.role);

    const userObj = user.toObject();
    // @ts-ignore
    delete userObj.passwordHash;

    res.status(201).json({ user: userObj, token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const invalidAuthError = new AppError(401, 'Invalid email or password');

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
    if (!user) {
      return next(invalidAuthError);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(invalidAuthError);
    }

    const token = generateToken(user.id, user.role);

    const userObj = user.toObject();
    // @ts-ignore
    delete userObj.passwordHash;

    res.json({ user: userObj, token });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};
