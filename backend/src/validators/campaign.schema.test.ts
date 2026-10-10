import { describe, it, expect } from "vitest";
import { createCampaignSchema, editCampaignSchema } from "./campaign.schema.js";

describe("Campaign Zod Schema", () => {
  const validData = {
    title: "Awesome Campaign",
    budgetPaise: 50000,
    feePerCreatorPaise: 10000,
    slots: 5,
    applicationDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    submissionDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
  };

  it("should pass valid data", () => {
    const result = createCampaignSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject budgetPaise < feePerCreatorPaise", () => {
    const data = { ...validData, budgetPaise: 5000, feePerCreatorPaise: 10000 };
    const result = createCampaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/budgetPaise must be greater than or equal to feePerCreatorPaise/);
    }
  });

  it("should reject submissionDeadline before applicationDeadline", () => {
    const data = {
      ...validData,
      applicationDeadline: new Date(Date.now() + 86400000 * 10).toISOString(),
      submissionDeadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    };
    const result = createCampaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/submissionDeadline must be after applicationDeadline/);
    }
  });

  it("should reject applicationDeadline in the past", () => {
    const data = {
      ...validData,
      applicationDeadline: new Date(Date.now() - 86400000).toISOString(),
    };
    const result = createCampaignSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/applicationDeadline must be in the future/);
    }
  });
});
