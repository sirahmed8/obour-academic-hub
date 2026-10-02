import { describe, it, expect } from "vitest";
import {
  isOwner,
  isAdmin,
  isVip,
  canAccessFeature,
  getFeatureLimit,
  formatEGP,
} from "./permissions";
import { User } from "@/types";

describe("permissions & feature gating engine", () => {
  const mockFreeUser: User = {
    uid: "student-1",
    email: "student@example.com",
    displayName: "Student User",
    role: "student",
    createdAt: new Date().toISOString(),
    isVip: false,
    subscriptionTier: "free",
  };

  const mockVipUser: User = {
    uid: "vip-1",
    email: "vip@example.com",
    displayName: "VIP User",
    role: "student",
    createdAt: new Date().toISOString(),
    isVip: true,
    subscriptionTier: "vip",
    vipExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days ahead
  };

  const mockExpiredVipUser: User = {
    uid: "expired-1",
    email: "expired@example.com",
    displayName: "Expired User",
    role: "student",
    createdAt: new Date().toISOString(),
    isVip: true,
    subscriptionTier: "vip",
    vipExpiresAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  };

  const mockAdminUser: User = {
    uid: "admin-1",
    email: "admin@example.com",
    displayName: "Admin User",
    role: "admin",
    createdAt: new Date().toISOString(),
  };

  const mockOwnerUser: User = {
    uid: "owner-1",
    email: "a7medorabe7@gmail.com",
    displayName: "Owner User",
    role: "owner",
    createdAt: new Date().toISOString(),
  };

  describe("isOwner", () => {
    it("identifies owner by role or verified email", () => {
      expect(isOwner(mockOwnerUser)).toBe(true);
      expect(isOwner({ ...mockFreeUser, email: "a7medorabe7@gmail.com" })).toBe(true);
      expect(isOwner(mockAdminUser)).toBe(false);
      expect(isOwner(mockFreeUser)).toBe(false);
      expect(isOwner(null)).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("identifies admins and owners as having admin rights", () => {
      expect(isAdmin(mockOwnerUser)).toBe(true);
      expect(isAdmin(mockAdminUser)).toBe(true);
      expect(isAdmin(mockFreeUser)).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe("isVip", () => {
    it("grants VIP to active subscribers and OP mode admins/owners", () => {
      expect(isVip(mockOwnerUser)).toBe(true);
      expect(isVip(mockAdminUser)).toBe(true);
      expect(isVip(mockVipUser)).toBe(true);
      expect(isVip(mockExpiredVipUser)).toBe(false);
      expect(isVip(mockFreeUser)).toBe(false);
      expect(isVip(null)).toBe(false);
    });
  });

  describe("canAccessFeature", () => {
    it("handles access correctly across tiers", () => {
      // Owner OP mode
      expect(canAccessFeature(mockOwnerUser, "unlimited_quizzes")).toBe(true);
      expect(canAccessFeature(mockOwnerUser, "admin_dashboard")).toBe(true);
      expect(canAccessFeature(mockOwnerUser, "audit_logs")).toBe(true);

      // Admin access
      expect(canAccessFeature(mockAdminUser, "unlimited_quizzes")).toBe(true);
      expect(canAccessFeature(mockAdminUser, "admin_dashboard")).toBe(true);
      expect(canAccessFeature(mockAdminUser, "audit_logs")).toBe(false);

      // VIP Student access
      expect(canAccessFeature(mockVipUser, "unlimited_quizzes")).toBe(true);
      expect(canAccessFeature(mockVipUser, "unlimited_transcriptions")).toBe(true);
      expect(canAccessFeature(mockVipUser, "unlimited_mindmaps")).toBe(true);
      expect(canAccessFeature(mockVipUser, "xp_boost")).toBe(true);
      expect(canAccessFeature(mockVipUser, "admin_dashboard")).toBe(false);

      // Free Student access
      expect(canAccessFeature(mockFreeUser, "unlimited_quizzes")).toBe(false);
      expect(canAccessFeature(mockFreeUser, "unlimited_transcriptions")).toBe(false);
      expect(canAccessFeature(mockFreeUser, "admin_dashboard")).toBe(false);
    });
  });

  describe("getFeatureLimit", () => {
    it("returns Infinity for VIP/Owner and tier limits for free students", () => {
      expect(getFeatureLimit(mockOwnerUser, "quizzes")).toBe(Infinity);
      expect(getFeatureLimit(mockVipUser, "transcribe")).toBe(Infinity);
      expect(getFeatureLimit(mockFreeUser, "quizzes")).toBe(5);
      expect(getFeatureLimit(mockFreeUser, "transcribe")).toBe(3);
      expect(getFeatureLimit(mockFreeUser, "chat")).toBe(10);
    });
  });

  describe("formatEGP", () => {
    it("formats Egyptian Pounds in Arabic and English locales", () => {
      const arFormatted = formatEGP(199, "ar");
      expect(arFormatted).toBeDefined();
      expect(arFormatted.length).toBeGreaterThan(0);

      const enFormatted = formatEGP(199, "en");
      expect(enFormatted).toBeDefined();
      expect(enFormatted).toContain("EGP");
    });
  });
});
