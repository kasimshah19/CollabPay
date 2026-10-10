import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Campaign } from "../models/Campaign.js";
import { Application } from "../models/Application.js";
import { Submission } from "../models/Submission.js";
import { Wallet } from "../models/Wallet.js";
import { LedgerEntry } from "../models/LedgerEntry.js";
import { submitWork, approveSubmission, requestRevision, rejectSubmission } from "./submission.service.js";
import { AppError } from "../middleware/AppError.js";

describe("Submission Service Integration Tests", () => {
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

  it("should allow a creator to submit work for an approved application", async () => {
    if (!env.MONGODB_URI_TEST) return;

    const brand = await User.create({ name: "Brand", email: "b@b.com", passwordHash: "h", role: "brand" });
    const creator = await User.create({ name: "Creator", email: "c@c.com", passwordHash: "h", role: "creator" });
    
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Campaign 1",
      budgetPaise: 100000,
      feePerCreatorPaise: 10000,
      slots: 1,
      applicationDeadline: new Date(Date.now() + 86400000),
      submissionDeadline: new Date(Date.now() + 86400000),
      status: "open",
      reservedPaise: 10000
    });

    const application = await Application.create({
      campaignId: campaign._id,
      creatorId: creator._id,
      status: "approved",
      reservedFeePaise: 10000
    });

    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/1234");
    expect(sub!).toBeDefined();
    expect(sub!.status).toBe("submitted");
    expect(sub!.instagramUrl).toBe("https://www.instagram.com/p/1234");
  });

  it("should handle the full approval flow: reserve -> approve submission -> check wallet and ledger", async () => {
    if (!env.MONGODB_URI_TEST) return;
    
    const brand = await User.create({ name: "Brand", email: "b2@b.com", passwordHash: "h", role: "brand" });
    const creator = await User.create({ name: "Creator", email: "c2@c.com", passwordHash: "h", role: "creator" });
    
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Campaign 2",
      budgetPaise: 100000,
      feePerCreatorPaise: 10000, // 100 Rs
      slots: 1,
      applicationDeadline: new Date(Date.now() + 86400000),
      submissionDeadline: new Date(Date.now() + 86400000),
      status: "open",
      reservedPaise: 10000, // already reserved 100 Rs
      paidPaise: 0,
      platformChargesPaise: 0
    });

    const application = await Application.create({
      campaignId: campaign._id,
      creatorId: creator._id,
      status: "approved",
      reservedFeePaise: 10000 // 100 Rs
    });

    const sub = await submitWork(application._id as any, creator._id as any, "https://instagram.com/p/5678");
    
    const approvedSub = await approveSubmission(sub!._id as any, brand._id as any);
    expect(approvedSub!.status).toBe("approved");

    const updatedCampaign = await Campaign.findById(campaign._id);
    expect(updatedCampaign!.reservedPaise).toBe(0);
    expect(updatedCampaign!.paidPaise).toBe(10000); // 100 Rs
    
    // Fee = 10% of 100Rs = 10Rs. GST = 1.8 Rs. Total = 11.8 Rs
    expect(updatedCampaign!.platformChargesPaise).toBe(1180);

    const wallet = await Wallet.findOne({ userId: creator._id });
    // Creator net: 100Rs - 1Rs (TDS) = 99Rs = 9900 paise
    expect(wallet!.balancePaise).toBe(9900);

    const entries = await LedgerEntry.find({ userId: creator._id }).sort({ amountPaise: -1 }); // credit first
    expect(entries.length).toBe(2);
    expect(entries[0].type).toBe("payout_credit");
    expect(entries[0].amountPaise).toBe(10000);
    
    expect(entries[1].type).toBe("tds_deduction");
    expect(entries[1].amountPaise).toBe(-100);
  });
});
