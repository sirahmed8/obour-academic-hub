"use client";

// "systeminformation" is a Node.js library and cannot run in the browser/static export.
// We are switching to accurate Client-Side detection.

export interface SystemStats {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    load: number;
  };
  mem: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
  uptime: number;
}

export async function getSystemStats(): Promise<SystemStats | null> {
  if (typeof window === "undefined") return null;

  // Browser API detection
  const nav = window.navigator as Navigator & { deviceMemory?: number };
  const memory = (nav.deviceMemory || 4) * 1024 * 1024 * 1024; // Est. RAM in bytes
  const cores = nav.hardwareConcurrency || 4;
  const platform = nav.platform || "Unknown";
  const userAgent = nav.userAgent;

  // Mocking "Load" and "Uptime" as they are backend concepts
  // We can treat "uptime" as "time since page load"
  const uptime = performance.now() / 1000;

  return {
    cpu: {
      manufacturer: "Client Device",
      brand: "Processor", // Browser doesn't expose exact model for privacy
      speed: 0,
      cores: cores,
      load: 0, // Cannot measure CPU load from JS
    },
    mem: {
      total: memory,
      free: 0, // Browser doesn't know
      used: 0, // Browser doesn't know
      active: 0,
      available: memory,
    },
    os: {
      platform: platform,
      distro: userAgent.includes("Win") ? "Windows" : userAgent.includes("Mac") ? "macOS" : "Linux",
      release: "Client",
      arch: "x64", // Assumption
    },
    uptime: uptime,
  };
}
