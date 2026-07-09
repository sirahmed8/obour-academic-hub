import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import { adminDb, Timestamp } from "@/lib/server/firebase-admin";
import { corsOptions, withCors } from "@/lib/server/cors";
import { assertCanManageUser, handleRouteError, requirePermission } from "@/lib/server/auth";
import { logServerWarning, logServerError } from "@/lib/server/error-sanitizer";
import type { UserPermission } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sanitizeEmailHtml = (html: string | undefined | null): string => {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: ["a", "b", "strong", "i", "em", "p", "br", "ul", "li", "span", "div"],
    allowedAttributes: {
      a: ["href"],
      div: ["style", "dir"],
      span: ["style", "dir"],
      p: ["style", "dir"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
};

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const context = await requirePermission(request, "manage_users");
    const { uid } = await params;
    const body = await request.json();
    const { title, message } = body;

    if (!title || !message) {
      return withCors(
        request,
        NextResponse.json({ error: "Missing title or message" }, { status: 400 })
      );
    }

    // Get user email
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return withCors(request, NextResponse.json({ error: "User not found" }, { status: 404 }));
    }
    const userData = userDoc.data()!;
    const userEmail = userData.email;

    const targetUser = { uid, ...userData } as {
      uid: string;
      role?: "student" | "admin" | "owner" | "moderator";
      permissions?: UserPermission[];
    };

    assertCanManageUser(context, targetUser);

    // 1. Send Email Alert
    let emailSent = false;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const smtpPort = Number(process.env.SMTP_PORT) || 587;
        const smtpSecure = process.env.SMTP_SECURE?.toLowerCase() === "true" || smtpPort === 465;

        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpSecure,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const htmlContent = `
          <div dir="auto" style="font-family: sans-serif; padding: 20px;">
            <h2>${title}</h2>
            <p>${message.replace(/\n/g, "<br/>")}</p>
            <hr/>
            <p style="font-size: 12px; color: #666;">This is an official alert from Obour Academic Hub Administration.</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Obour Academic Hub Admin" <${process.env.SMTP_USER}>`,
          to: userEmail,
          subject: title,
          html: sanitizeEmailHtml(htmlContent),
        });
        emailSent = true;
      } catch (emailErr) {
        logServerError("Failed to send alert email", emailErr);
        // Continue to create in-app notification even if email fails
      }
    } else {
      logServerWarning("SMTP credentials not found, skipping email alert");
    }

    // 2. Create In-App Notification
    await adminDb.collection("notifications").add({
      titleEn: title,
      titleAr: title,
      messageEn: message,
      messageAr: message,
      type: "warning",
      target: uid,
      isRead: false,
      readBy: [],
      createdBy: context.uid,
      createdAt: Timestamp.now(),
    });

    return withCors(request, NextResponse.json({ success: true, emailSent }));
  } catch (error) {
    return handleRouteError(request, error);
  }
}
