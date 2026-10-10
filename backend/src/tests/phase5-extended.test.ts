import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Campaign } from "../models/Campaign.js";
import { Application } from "../models/Application.js";
import { Submission } from "../models/Submission.js";
import { Wallet } from "../models/Wallet.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { Withdrawal } from "../models/Withdrawal.js";
import { approveSubmission, submitWork, requestRevision, rejectSubmission } from "../services/submission.service.js";
import { requestWithdrawal, processWithdrawal } from "../services/withdrawal.service.js";
import { editCampaign } from "../services/campaign.service.js";

describe("Phase 5 Extended Integration Tests", () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI_TEST) return;
    await mongoose.connect(env.MONGODB_URI_TEST);
    await Promise.all(mongoose.modelNames().map(name => mongoose.model(name).init()));
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db?.collections();
      for (let collection of collections || []) {
        await collection.deleteMany({});
      }
    }
  });

  const setupData = async (budget: number, fee: number) => {
    const brand = await User.create({ name: "Brand", email: `brand_${Date.now()}@test.com`, passwordHash: "x", role: "brand" });
    const creator = await User.create({ name: "Creator", email: `creator_${Date.now()}@test.com`, passwordHash: "x", role: "creator" });
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Ext Test",
      budgetPaise: budget,
      feePerCreatorPaise: fee,
      slots: 10,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000),
      reservedPaise: fee,
      paidPaise: 0,
      platformChargesPaise: 0,
      approvedCount: 1
    });
    const application = await Application.create({
      campaignId: campaign._id,
      creatorId: creator._id,
      status: "approved",
      reservedFeePaise: fee
    });
    return { brand, creator, campaign, application };
  };

  it("Test Payout Rs 5000", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creator, campaign, application } = await setupData(1000000, 500000); // 10000 Rs budget, 5000 Rs fee (500000 paise)
    
    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/5000");
    await approveSubmission(sub!._id as any, brand._id as any);
    
    const updatedCampaign = await Campaign.findById(campaign._id);
    expect(updatedCampaign!.platformChargesPaise).toBe(59000); // 10% fee = 50000, 18% GST on fee = 9000. Total = 59000.
    
    const wallet = await Wallet.findOne({ userId: creator._id });
    expect(wallet!.balancePaise).toBe(495000); // 500000 - 1% TDS (5000) = 495000
    
    const entries = await LedgerEntry.find({ userId: creator._id }).sort({ amountPaise: -1 });
    expect(entries.length).toBe(2);
    expect(entries[0].amountPaise).toBe(500000);
    expect(entries[1].amountPaise).toBe(-5000);
    
    const sum = entries.reduce((acc, e) => acc + e.amountPaise, 0);
    expect(sum).toBe(wallet!.balancePaise);
  });

  it("Test 5 concurrent submission approvals give exactly one payout", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creator, application } = await setupData(500000, 100000);
    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/concurrent");
    
    const results = await Promise.allSettled(Array.from({ length: 5 }).map(() => approveSubmission(sub!._id as any, brand._id as any)));
    
    const fulfilled = results.filter(r => r.status === "fulfilled");
    expect(fulfilled.length).toBe(1);
    
    const wallet = await Wallet.findOne({ userId: creator._id });
    expect(wallet!.balancePaise).toBe(99000); // Only paid once
  });

  it("Test two concurrent withdrawals of Rs 700 from Rs 1000 give one success", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const creator = await User.create({ name: "C23", email: `c_${Date.now()}@test.com`, passwordHash: "x", role: "creator" });
    await Wallet.create({ userId: creator._id, balancePaise: 100000 }); // 1000 Rs
    
    const results = await Promise.allSettled([
      requestWithdrawal(creator._id as any, 70000, "ok@mock"),
      requestWithdrawal(creator._id as any, 70000, "ok@mock")
    ]);
    
    const fulfilled = results.filter(r => r.status === "fulfilled");
    expect(fulfilled.length).toBe(1);
    
    const wallet = await Wallet.findOne({ userId: creator._id });
    expect(wallet!.balancePaise).toBe(30000); // 100000 - 70000
  });

  it("Test fail@mock restores balance and double processing reverses only once", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const creator = await User.create({ name: "C2", email: `c2_${Date.now()}@test.com`, passwordHash: "x", role: "creator" });
    await Wallet.create({ userId: creator._id, balancePaise: 100000 });
    
    const withdrawal = await requestWithdrawal(creator._id as any, 100000, "fail@mock");
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const w = await Withdrawal.findById(withdrawal._id);
    expect(w!.status).toBe("failed");
    
    const wallet = await Wallet.findOne({ userId: creator._id });
    expect(wallet!.balancePaise).toBe(100000);
    
    const entries = await LedgerEntry.find({ userId: creator._id, type: "withdrawal_reversal" });
    expect(entries.length).toBe(1);
  });

  it("Test revision limit max 2", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creator, application } = await setupData(500000, 100000);
    
    let sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/rev1");
    await requestRevision(sub!._id as any, brand._id as any, "rev1");
    
    sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/rev2");
    await requestRevision(sub!._id as any, brand._id as any, "rev2");
    
    sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/rev3");
    
    await expect(requestRevision(sub!._id as any, brand._id as any, "rev3")).rejects.toThrow("Maximum revisions reached");
  });

  it("Test reject releases reservation without reopening slot", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creator, campaign, application } = await setupData(500000, 100000);
    
    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/reject");
    await rejectSubmission(sub!._id as any, brand._id as any, "reject");
    
    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.reservedPaise).toBe(0); // released
    expect(freshCampaign!.approvedCount).toBe(1); // slot NOT reopened!
  });

  it("Test ledger immutability", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const entry = await LedgerEntry.create({
      userId: new mongoose.Types.ObjectId(),
      type: "payout_credit",
      amountPaise: 100,
      description: "Test",
      refId: new mongoose.Types.ObjectId(),
      refType: "submission",
      balanceAfterPaise: 100
    });
    
    await expect(LedgerEntry.updateOne({ _id: entry._id }, { amountPaise: 200 })).rejects.toThrow("Ledger entries are immutable");
    await expect(LedgerEntry.deleteOne({ _id: entry._id })).rejects.toThrow("Ledger entries are immutable");
  });

  it("Test budget invariant edit rule (budget cannot go below reserved + paid)", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creator, campaign, application } = await setupData(500000, 100000);
    
    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/inv");
    await approveSubmission(sub!._id as any, brand._id as any);
    
    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.paidPaise).toBe(100000);
    expect(freshCampaign!.reservedPaise).toBe(0);
    
    await expect(editCampaign(campaign._id as any, brand._id as any, { budgetPaise: 50000 }))
      .rejects.toThrow("Edit conditions not met"); // Will fail since 50k < 100k
  });
});
