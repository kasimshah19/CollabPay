import app from "./app.js";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { Withdrawal } from "./models/Withdrawal.js";
import { processWithdrawal } from "./services/withdrawal.service.js";

const recoverStuckWithdrawals = async () => {
  try {
    const stuck = await Withdrawal.find({ status: "processing" });
    if (stuck.length > 0) {
      console.log(`[CollabPay] Recovering ${stuck.length} stuck withdrawals...`);
      for (const w of stuck) {
        processWithdrawal(w._id as any).catch(console.error);
      }
    }
  } catch (err) {
    console.error("[CollabPay] Error recovering withdrawals:", err);
  }
};

const startServer = async () => {
  await connectDb();
  
  await recoverStuckWithdrawals();

  app.listen(env.PORT, () => {
    console.log(`[CollabPay] Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
};

startServer();
