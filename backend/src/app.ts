import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { env } from "./config/env.js";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.routes.js";
import debugRouter from "./routes/debug.routes.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --------------- Middleware ---------------
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(morgan("dev"));
app.use(express.json());

// --------------- Routes ------------------
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);

if (env.NODE_ENV !== 'production') {
  app.use("/api/_debug", debugRouter);
}

// --------------- Error handling -----------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
