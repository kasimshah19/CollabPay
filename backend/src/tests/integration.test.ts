import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Campaign } from "../models/Campaign.js";
import { Application } from "../models/Application.js";
import { approveApplication, withdrawApplication } from "../services/application.service.js";
import { editCampaign, cancelCampaign } from "../services/campaign.service.js";

describe("Integration Tests", () => {
  beforeAll(async () => {
    if (!env.MONGODB_URI_TEST) {
      console.warn("MONGODB_URI_TEST is not set. Skipping integration tests.");
      return;
    }
    if (!env.MONGODB_URI_TEST.includes("_test")) {
      throw new Error("MONGODB_URI_TEST must include '_test' for safety.");
    }
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

  const setupData = async () => {
    const brand = await User.create({ name: "Brand", email: "brand@test.com", passwordHash: "x", role: "brand" });
    const creators = await Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        User.create({ name: `C${i}`, email: `c${i}@test.com`, passwordHash: "x", role: "creator" })
      )
    );
    return { brand, creators };
  };

  it("Test 1 (slots race): exactly ONE succeeds out of 5 concurrent approvals", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 1",
      budgetPaise: 500000,
      feePerCreatorPaise: 10000,
      slots: 1,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const apps = await Promise.all(creators.map(c => Application.create({ campaignId: campaign._id, creatorId: c._id })));

    const results = await Promise.allSettled(apps.map(app => approveApplication(app._id as any, brand._id as any)));
    
    const fulfilled = results.filter(r => r.status === "fulfilled");
    expect(fulfilled.length).toBe(1);

    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(1);
    expect(freshCampaign!.reservedPaise).toBe(10000);
  });

  it("Test 2 (budget race): exactly TWO succeed out of 5", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 2",
      budgetPaise: 250000, // 2500 Rs
      feePerCreatorPaise: 100000, // 1000 Rs
      slots: 5,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const apps = await Promise.all(creators.map(c => Application.create({ campaignId: campaign._id, creatorId: c._id })));

    const results = await Promise.allSettled(apps.map(app => approveApplication(app._id as any, brand._id as any)));
    
    const fulfilled = results.filter(r => r.status === "fulfilled");
    expect(fulfilled.length).toBe(2);

    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(2);
    expect(freshCampaign!.reservedPaise).toBe(200000);
  });

  it("Test 3 (double approve): approving same application twice reserves only once", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 3",
      budgetPaise: 250000,
      feePerCreatorPaise: 100000,
      slots: 5,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const app = await Application.create({ campaignId: campaign._id, creatorId: creators[0]._id });
    
    const results = await Promise.allSettled([
      approveApplication(app._id as any, brand._id as any),
      approveApplication(app._id as any, brand._id as any)
    ]);
    
    const fulfilled = results.filter(r => r.status === "fulfilled");
    expect(fulfilled.length).toBe(1); // One should fail due to state change

    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(1);
    expect(freshCampaign!.reservedPaise).toBe(100000);
  });

  it("Test 4 (withdraw releases): withdraw releases reserved paise", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 4",
      budgetPaise: 250000,
      feePerCreatorPaise: 100000,
      slots: 5,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const app = await Application.create({ campaignId: campaign._id, creatorId: creators[0]._id });
    await approveApplication(app._id as any, brand._id as any);
    
    let freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(1);
    
    await withdrawApplication(app._id as any, creators[0]._id as any);
    
    freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(0);
    expect(freshCampaign!.reservedPaise).toBe(0);

    const doubleWithdraw = await withdrawApplication(app._id as any, creators[0]._id as any).catch(e => e);
    expect(doubleWithdraw.message).toMatch(/Cannot withdraw application in current state/);
  });

  it("Test 5 (edit limits): edit validations", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 5",
      budgetPaise: 250000,
      feePerCreatorPaise: 100000,
      slots: 5,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const app = await Application.create({ campaignId: campaign._id, creatorId: creators[0]._id });
    await approveApplication(app._id as any, brand._id as any);

    await expect(editCampaign(campaign._id as any, brand._id as any, { slots: 0 }))
      .rejects.toThrow("Edit conditions not met");

    await expect(editCampaign(campaign._id as any, brand._id as any, { budgetPaise: 50000 }))
      .rejects.toThrow("Edit conditions not met");

    await expect(editCampaign(campaign._id as any, brand._id as any, { feePerCreatorPaise: 50000 }))
      .rejects.toThrow("Edit conditions not met");

    const validEdit = await editCampaign(campaign._id as any, brand._id as any, { slots: 10 });
    expect(validEdit.slots).toBe(10);
  });

  it("Test 6 (cancel): pending rejected, approved stays", async (ctx) => {
    if (!env.MONGODB_URI_TEST) return ctx.skip();
    const { brand, creators } = await setupData();
    const campaign = await Campaign.create({
      brandId: brand._id,
      title: "Test 6",
      budgetPaise: 250000,
      feePerCreatorPaise: 100000,
      slots: 5,
      applicationDeadline: new Date(Date.now() + 100000),
      submissionDeadline: new Date(Date.now() + 200000)
    });

    const app1 = await Application.create({ campaignId: campaign._id, creatorId: creators[0]._id });
    const app2 = await Application.create({ campaignId: campaign._id, creatorId: creators[1]._id });
    
    await approveApplication(app1._id as any, brand._id as any);
    await cancelCampaign(campaign._id as any, brand._id as any);

    const f1 = await Application.findById(app1._id);
    expect(f1!.status).toBe("approved");

    const f2 = await Application.findById(app2._id);
    expect(f2!.status).toBe("rejected");
    expect(f2!.rejectionReason).toBe("campaign_cancelled");

    const freshCampaign = await Campaign.findById(campaign._id);
    expect(freshCampaign!.approvedCount).toBe(1);
    expect(freshCampaign!.reservedPaise).toBe(100000);
  });
});
