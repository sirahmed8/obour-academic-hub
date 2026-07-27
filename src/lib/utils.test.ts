import { describe, it, expect } from "vitest";
import { cn, formatDate, generateAvatarUrl, calculateGPA, calculateStudyStreak } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("merges class names correctly", () => {
      const result = cn("px-4", "py-2", "bg-blue-500");
      expect(result).toContain("px-4");
      expect(result).toContain("py-2");
    });

    it("handles conditional classes", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("hidden");
    });
  });

  describe("formatDate", () => {
    it("formats Date object correctly", () => {
      const date = new Date("2024-01-15");
      const result = formatDate(date);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("handles invalid dates", () => {
      const result = formatDate(null as unknown as Date);
      expect(result).toBe("N/A");
    });
  });

  describe("generateAvatarUrl", () => {
    it("generates URL with initials", () => {
      const url = generateAvatarUrl("John Doe");
      expect(url).toContain("ui-avatars.com");
      expect(url).toContain("John%20Doe");
    });

    it("handles empty names", () => {
      const url = generateAvatarUrl("");
      expect(url).toContain("ui-avatars.com");
    });
  });

  describe("calculateGPA", () => {
    it("computes cumulative GPA accurately", () => {
      const courses = [
        { grade: "A", credits: 3 }, // 4.0 * 3 = 12
        { grade: "B", credits: 4 }, // 3.0 * 4 = 12
        { grade: "A", credits: 2 }, // 4.0 * 2 = 8
      ];
      expect(calculateGPA(courses)).toBe(3.56); // 32 / 9 = 3.5555... -> 3.56
    });

    it("returns 0 for empty or invalid course arrays", () => {
      expect(calculateGPA([])).toBe(0);
      expect(calculateGPA(null as unknown as Parameters<typeof calculateGPA>[0])).toBe(0);
    });

    it("handles diverse letter grades correctly", () => {
      const courses = [
        { grade: "A+", credits: 3 }, // 4.0 * 3 = 12
        { grade: "B+", credits: 3 }, // 3.3 * 3 = 9.9
        { grade: "C-", credits: 2 }, // 1.7 * 2 = 3.4
        { grade: "F", credits: 2 }, // 0.0 * 2 = 0
      ];
      // Total points = 25.3 / 10 = 2.53
      expect(calculateGPA(courses)).toBe(2.53);
    });
  });

  describe("calculateStudyStreak", () => {
    it("increments streak when active on consecutive calendar days", () => {
      const lastActive = new Date("2026-07-25T10:00:00Z");
      const current = new Date("2026-07-26T14:00:00Z");
      const res = calculateStudyStreak(lastActive, 5, current);

      expect(res.updated).toBe(true);
      expect(res.streak).toBe(6);
      expect(res.diffDays).toBe(1);
    });

    it("keeps streak unchanged when active on the same calendar day", () => {
      const lastActive = new Date("2026-07-26T09:00:00Z");
      const current = new Date("2026-07-26T18:00:00Z");
      const res = calculateStudyStreak(lastActive, 6, current);

      expect(res.updated).toBe(false);
      expect(res.streak).toBe(6);
      expect(res.diffDays).toBe(0);
    });

    it("resets streak to 1 when a day is skipped", () => {
      const lastActive = new Date("2026-07-20T10:00:00Z");
      const current = new Date("2026-07-26T10:00:00Z");
      const res = calculateStudyStreak(lastActive, 12, current);

      expect(res.updated).toBe(true);
      expect(res.streak).toBe(1);
      expect(res.diffDays).toBe(6);
    });
  });
});
