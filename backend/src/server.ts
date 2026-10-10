import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";

const startServer = async () => {
  await connectDb();
  
  app.listen(env.PORT, () => {
    console.log(`[CollabPay] Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
};

startServer();
