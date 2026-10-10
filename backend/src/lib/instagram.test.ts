import { describe, it, expect } from "vitest";
import { normalizeInstagramUrl } from "./instagram.js";

describe("normalizeInstagramUrl", () => {
  it("should normalize valid URLs", () => {
    expect(normalizeInstagramUrl("https://www.instagram.com/p/ABC123xyz/")).toBe("https://www.instagram.com/p/ABC123xyz");
    expect(normalizeInstagramUrl("https://instagram.com/reel/123/?utm_source=ig_web")).toBe("https://www.instagram.com/reel/123");
    expect(normalizeInstagramUrl("https://www.instagram.com/reels/xyz123#something")).toBe("https://www.instagram.com/reels/xyz123");
    expect(normalizeInstagramUrl("https://instagram.com/tv/abc/")).toBe("https://www.instagram.com/tv/abc");
  });

  it("should reject invalid URLs", () => {
    expect(() => normalizeInstagramUrl("http://instagram.com/p/ABC")).toThrow("Invalid Instagram URL");
    expect(() => normalizeInstagramUrl("https://notinstagram.com/p/ABC")).toThrow("Invalid Instagram URL");
    expect(() => normalizeInstagramUrl("https://instagram.com/user/profile")).toThrow("Invalid Instagram URL");
    expect(() => normalizeInstagramUrl("https://instagram.com/p/abc/def")).toThrow("Invalid Instagram URL");
    expect(() => normalizeInstagramUrl("not a url")).toThrow("Invalid Instagram URL");
  });
});
