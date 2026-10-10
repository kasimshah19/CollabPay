import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName] as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: { message: `Invalid ObjectId for param ${paramName}`, code: "INVALID_OBJECT_ID" } });
      return;
    }
    next();
  };
};
