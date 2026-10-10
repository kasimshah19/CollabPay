import { Router, Request, Response } from "express";

const healthRouter = Router();

healthRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default healthRouter;
