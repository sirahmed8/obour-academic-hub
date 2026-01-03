import { describe, it, expect } from "vitest";
import { cn, formatDate, generateAvatarUrl } from "@/lib/utils";

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
      expect(url).toContain("JD");
    });

    it("handles empty names", () => {
      const url = generateAvatarUrl("");
      expect(url).toContain("ui-avatars.com");
    });
  });
});
