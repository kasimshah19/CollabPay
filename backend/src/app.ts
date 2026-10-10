import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config.js";
import healthRouter from "./routes/health.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// --------------- Middleware ---------------
app.use(cors({ origin: config.frontendUrl }));
app.use(morgan("dev"));
app.use(express.json());

// --------------- Routes ------------------
app.use("/api", healthRouter);

// --------------- Error handling -----------
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
