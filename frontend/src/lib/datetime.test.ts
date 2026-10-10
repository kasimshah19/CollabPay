import { describe, it, expect } from "vitest";
import { istInputToUtcIso, utcIsoToIstInput, formatIst, timeUntil } from "./datetime";

describe("datetime utilities", () => {
  it("converts IST input to UTC ISO correctly with exact 5h30m offset", () => {
    // 2026-10-15 18:30 IST -> UTC is 2026-10-15 13:00:00Z
    expect(istInputToUtcIso("2026-10-15T18:30")).toBe("2026-10-15T13:00:00.000Z");
  });

  it("handles date crossing midnight backwards", () => {
    // 2026-10-15 01:00 IST -> UTC is 2026-10-14 19:30:00Z
    expect(istInputToUtcIso("2026-10-15T01:00")).toBe("2026-10-14T19:30:00.000Z");
  });

  it("handles month and year boundaries", () => {
    // 2026-01-01 01:00 IST -> UTC is 2025-12-31 19:30:00Z
    expect(istInputToUtcIso("2026-01-01T01:00")).toBe("2025-12-31T19:30:00.000Z");
    
    // 2026-03-01 01:00 IST -> UTC is 2026-02-28 19:30:00Z
    expect(istInputToUtcIso("2026-03-01T01:00")).toBe("2026-02-28T19:30:00.000Z");
  });

  it("round trips datetime values correctly", () => {
    const input = "2026-10-15T18:30";
    const utc = istInputToUtcIso(input);
    const roundTripped = utcIsoToIstInput(utc);
    expect(roundTripped).toBe(input);
  });

  it("formats to IST display string correctly", () => {
    const utc = "2026-10-15T13:00:00.000Z";
    // 13:00 UTC + 5.5 = 18:30 = 6:30 PM
    const formatted = formatIst(utc);
    // Depending on Node version, exact formatting might slightly differ (e.g. 15 Oct, 6:30 pm)
    // We expect "15 Oct 2026, 6:30 PM IST"
    expect(formatted).toContain("15 Oct 2026");
    expect(formatted).toContain("6:30 PM IST");
  });

  it("calculates timeUntil correctly", () => {
    const now = new Date("2026-10-15T12:00:00.000Z");
    
    // 3 days later
    expect(timeUntil("2026-10-18T12:00:00.000Z", now)).toBe("Closes in 3 days");
    
    // 5 hours later
    expect(timeUntil("2026-10-15T17:00:00.000Z", now)).toBe("Closes in 5 hours");
    
    // 30 minutes later
    expect(timeUntil("2026-10-15T12:30:00.000Z", now)).toBe("Closes in 30 mins");
    
    // Past
    expect(timeUntil("2026-10-15T11:00:00.000Z", now)).toBe("Closed");
  });
});
