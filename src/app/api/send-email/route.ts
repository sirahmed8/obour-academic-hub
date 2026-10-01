import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import { emailRequestSchema } from "@/lib/zod-schemas";
import { corsOptions, withCors } from "@/lib/server/cors";
import { handleRouteError, requireOwner } from "@/lib/server/auth";
import { logServerWarning, logServerError } from "@/lib/server/error-sanitizer";
import { rateLimit } from "@/lib/server/rate-limit";

const sanitizeEmailHtml = (html: string | undefined | null): string => {
  if (!html) {
    return "";
  }

  return sanitizeHtml(html, {
    allowedTags: [
      "a",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "span",
      "div",
      "img",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "title"],
      img: ["src", "alt", "title", "width", "height"],
      div: ["style", "dir"],
      span: ["style", "dir"],
      p: ["style", "dir"],
      table: ["style"],
      th: ["style"],
      td: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });
};

const CAN_SPAM_FOOTER = `
<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #64748b; line-height: 1.5; text-align: center;">
  <p style="margin: 0 0 4px 0; font-weight: 600; color: #334155;">معاهد العبور العليا • Obour Academic Hub</p>
  <p style="margin: 0 0 4px 0;">Km 21 Cairo-Belbeis Desert Road, Obour City, Qalyubia, Egypt</p>
  <p style="margin: 0;">You received this institutional notification regarding your academic account. To manage notifications, visit <a href="https://obourinstitutes1.web.app/notifications" style="color: #4f46e5; text-decoration: underline;">notification preferences</a>.</p>
</div>
`;

export const runtime = "nodejs";

export async function OPTIONS(request: Request) {
  return corsOptions(request);
}

export async function POST(request: Request) {
  try {
    const context = await requireOwner(request);
    const limiter = await rateLimit({
      key: `api:send-email:${context.uid}`,
      limit: 5,
      windowMs: 60_000,
    });

    if (!limiter.allowed) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Too many email requests. Please try again shortly." },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
            },
          }
        )
      );
    }

    const body = await request.json();
    const validation = emailRequestSchema.safeParse(body);

    if (!validation.success) {
      return withCors(
        request,
        NextResponse.json(
          { error: "Invalid request data", details: validation.error.format() },
          { status: 400 }
        )
      );
    }

    const { to, subject, html } = validation.data;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logServerWarning("SMTP credentials not found in environment variables", {
        route: "/api/send-email",
      });
      return withCors(
        request,
        NextResponse.json({ error: "Email service not configured" }, { status: 500 })
      );
    }

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

    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      logServerError("Email service connection verification failed", verifyError, {
        route: "/api/send-email",
        action: "smtp_verify",
      });
      return withCors(
        request,
        NextResponse.json({ error: "Email service unavailable" }, { status: 500 })
      );
    }

    const sanitizedBody = sanitizeEmailHtml(html);
    const finalHtml = sanitizedBody.includes("Obour Academic Hub")
      ? sanitizedBody
      : `${sanitizedBody}${CAN_SPAM_FOOTER}`;

    const info = await transporter.sendMail({
      from: `"Obour Academic Hub" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      html: finalHtml,
    });

    return withCors(request, NextResponse.json({ success: true, messageId: info.messageId }));
  } catch (error) {
    logServerError("Error sending email:", error, { route: "/api/send-email" });
    return handleRouteError(request, error);
  }
}
