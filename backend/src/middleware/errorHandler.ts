import { Request, Response, NextFunction } from "express";
import { env } from "../config/env.js";
import { AppError } from "./AppError.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod Errors
  if (err.name === "ZodError") {
    res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: err.errors,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    res.status(409).json({
      error: {
        message: "Resource already exists",
        code: "DUPLICATE_RESOURCE",
      },
    });
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : (err.status || err.statusCode || 500);
  const message = err.message || "Internal Server Error";
  const code = err instanceof AppError ? err.code : undefined;

  if (statusCode >= 500) {
    console.error(`[Error] ${statusCode} - ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 && env.NODE_ENV === "production" ? "Internal Server Error" : message,
      code,
    },
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
