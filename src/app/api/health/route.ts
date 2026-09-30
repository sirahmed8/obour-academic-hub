import { NextResponse } from "next/server";
import { adminDb } from "@/lib/server/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<
    string,
    { status: "up" | "down" | "degraded"; latencyMs?: number; message?: string }
  > = {};

  // Check 1: Database Connectivity
  try {
    const dbStart = Date.now();
    await adminDb.collection("settings").limit(1).get();
    checks.database = {
      status: "up",
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: unknown) {
    checks.database = {
      status: "down",
      message: err instanceof Error ? err.message : "Database connection failed",
    };
  }

  // Check 2: Core Environment Variables
  const requiredEnvVars = ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_API_KEY"];
  const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment = {
    status: missingEnvVars.length === 0 ? "up" : "degraded",
    message:
      missingEnvVars.length === 0
        ? "All essential environment keys configured"
        : `Missing: ${missingEnvVars.join(", ")}`,
  };

  const isHealthy = checks.database.status === "up";
  const totalLatencyMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      latencyMs: totalLatencyMs,
      checks,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, { status: 200 });
}
