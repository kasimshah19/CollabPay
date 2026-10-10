import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get("/health/ready", (_req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    status: isConnected ? "ok" : "error",
    db: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
