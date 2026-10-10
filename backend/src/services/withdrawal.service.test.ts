import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Wallet } from "../models/Wallet.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { requestWithdrawal, processWithdrawal } from "./withdrawal.service.js";

describe("Withdrawal Service Integration Tests", () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI_TEST) return;
    await mongoose.connect(env.MONGODB_URI_TEST);
  });

  afterAll(async () => {
    if (!env.MONGODB_URI_TEST) return;
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    if (!env.MONGODB_URI_TEST) return;
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  it("should process a successful withdrawal (mock provider)", async () => {
    if (!env.MONGODB_URI_TEST) return;

    const userId = new mongoose.Types.ObjectId();
    await Wallet.create({ userId, balancePaise: 50000 }); // 500 Rs

    const w = await requestWithdrawal(userId, 20000, "ok@mock"); // 200 Rs
    expect(w!.status).toBe("processing");

    // Process it
    await processWithdrawal(w!._id as any);

    const updatedW = await Withdrawal.findById(w!._id);
    expect(updatedW!.status).toBe("succeeded");

    const wallet = await Wallet.findOne({ userId });
    expect(wallet!.balancePaise).toBe(30000); // 300 Rs

    const entries = await LedgerEntry.find({ userId });
    expect(entries.length).toBe(1);
    expect(entries[0].type).toBe("withdrawal_debit");
    expect(entries[0].amountPaise).toBe(-20000);
  });

  it("should handle a failed withdrawal and refund balance", async () => {
    if (!env.MONGODB_URI_TEST) return;

    const userId = new mongoose.Types.ObjectId();
    await Wallet.create({ userId, balancePaise: 50000 });

    const w = await requestWithdrawal(userId, 20000, "fail@mock");
    expect(w!.status).toBe("processing");

    await processWithdrawal(w!._id as any);

    const updatedW = await Withdrawal.findById(w!._id);
    expect(updatedW!.status).toBe("failed");
    expect(updatedW!.failureReason).toBe("Mock failure requested");

    const wallet = await Wallet.findOne({ userId });
    expect(wallet!.balancePaise).toBe(50000); // refunded

    const entries = await LedgerEntry.find({ userId }).sort({ createdAt: 1 });
    expect(entries.length).toBe(2);
    expect(entries[0].type).toBe("withdrawal_debit");
    expect(entries[0].amountPaise).toBe(-20000);
    expect(entries[1].type).toBe("withdrawal_reversal");
    expect(entries[1].amountPaise).toBe(20000);
  });
});
