import { describe, it, expect } from "vitest";
import { parseRupeesToPaise, calculatePayout } from "./money";

describe("parseRupeesToPaise", () => {
  it("parses valid amounts", () => {
    expect(parseRupeesToPaise("5000")).toEqual({ ok: true, paise: 500000 });
    expect(parseRupeesToPaise("5,000")).toEqual({ ok: true, paise: 500000 });
    expect(parseRupeesToPaise("5,000.50")).toEqual({ ok: true, paise: 500050 });
    expect(parseRupeesToPaise("5000.5")).toEqual({ ok: true, paise: 500050 });
    expect(parseRupeesToPaise(".5")).toEqual({ ok: true, paise: 50 });
    expect(parseRupeesToPaise("0.01")).toEqual({ ok: true, paise: 1 });
  });

  it("rejects invalid amounts", () => {
    expect(parseRupeesToPaise("5000.555").ok).toBe(false);
    expect(parseRupeesToPaise("-1").ok).toBe(false);
    expect(parseRupeesToPaise("abc").ok).toBe(false);
    expect(parseRupeesToPaise("").ok).toBe(false);
    expect(parseRupeesToPaise("0").ok).toBe(false);
    expect(parseRupeesToPaise("0.00").ok).toBe(false);
    expect(parseRupeesToPaise("100000001").ok).toBe(false);
  });
});

describe("calculatePayout", () => {
  it("computes exact values for Rs 5,000", () => {
    // 5000 Rs = 500000 paise
    const result = calculatePayout(500000);
    expect(result.feePaise).toBe(500000);
    expect(result.platformFeePaise).toBe(50000);
    expect(result.gstPaise).toBe(9000);
    expect(result.tdsPaise).toBe(5000);
    expect(result.creatorPayoutPaise).toBe(495000);
    expect(result.brandCostPaise).toBe(559000);
  });
});
