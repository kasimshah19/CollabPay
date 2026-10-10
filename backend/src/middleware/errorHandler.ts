import { Request, Response, NextFunction } from "express";
import { config } from "../config.js";

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.status || err.statusCode || 500;

  console.error(`[Error] ${statusCode} - ${err.message}`);

  res.status(statusCode).json({
    error: statusCode >= 500 ? "Internal Server Error" : err.message,
    ...(config.nodeEnv === "development" && { stack: err.stack }),
  });
}
