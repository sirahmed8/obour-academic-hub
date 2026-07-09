import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { ApiError, handleRouteError, requireOwner } from "@/lib/server/auth";
import { settingsUpdateSchema } from "@/lib/server/admin-schemas";
import { logServerError, logServerInfo } from "@/lib/server/error-sanitizer";

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function PATCH(request: Request) {
  logServerInfo("Settings update request received");
  try {
    const context = await requireOwner(request);
    logServerInfo("Owner verified", { userId: context.uid });

    const rawBody = await request.json();
    logServerInfo("Settings update payload received", { rawBody });

    const body = settingsUpdateSchema.parse(rawBody);

    // Filter out undefined values to prevent silent deletion
    const cleanBody = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));

    await adminDb
      .collection("settings")
      .doc("global")
      .set(
        {
          ...cleanBody,
          updatedAt: new Date().toISOString(),
          updatedBy: context.uid,
        },
        { merge: true }
      );

    logServerInfo("Global settings updated successfully");
    return withCors(request, NextResponse.json({ success: true }));
  } catch (error) {
    logServerError("Settings update failed", error);

    if (error instanceof z.ZodError) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid settings payload", details: error.flatten() },
          { status: 400 }
        )
      );
    }

    // Explicitly handle ApiError to avoid double-wrapping
    if (error instanceof ApiError) {
      return withCors(
        request,
        NextResponse.json({ error: error.message }, { status: error.status })
      );
    }

    return handleRouteError(request, error);
  }
}
