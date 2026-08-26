import { describe, it, expect } from "vitest";
import { formatSmartDate } from "./dateUtils";

describe("formatSmartDate", () => {
  it("returns 'Just now' for empty or recent timestamps", () => {
    expect(formatSmartDate(null)).toBe("Just now");
    expect(formatSmartDate("")).toBe("Just now");
    expect(formatSmartDate(new Date().toISOString())).toBe("Just now");
  });

  it("formats minutes ago correctly", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatSmartDate(fiveMinutesAgo)).toBe("5m ago");
  });

  it("formats hours ago correctly", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatSmartDate(threeHoursAgo)).toBe("3h ago");
  });

  it("formats 1 day ago for <= 36 hours", () => {
    const thirtyHoursAgo = new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString();
    expect(formatSmartDate(thirtyHoursAgo)).toBe("1d ago");
  });

  it("formats absolute date for older dates (> 36 hours)", () => {
    const oldDate = new Date("2025-04-12T10:00:00Z");
    const formatted = formatSmartDate(oldDate);
    expect(formatted).toMatch(/12\s+Apr\s+'25/);
  });
});
