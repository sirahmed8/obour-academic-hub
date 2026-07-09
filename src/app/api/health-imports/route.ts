import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { getApps } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    const { getStorage } = await import("firebase-admin/storage");
    const { getAuth } = await import("firebase-admin/auth");

    const apps = getApps();
    return NextResponse.json({
      status: "healthy",
      appsCount: apps.length,
      dbType: typeof getFirestore,
      storageType: typeof getStorage,
      authType: typeof getAuth,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
