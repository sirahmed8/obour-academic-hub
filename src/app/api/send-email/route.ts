import { NextResponse } from "next/server";
import { headers } from "next/headers";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import { rateLimit } from "@/lib/rate-limit";

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

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export async function POST(request: Request) {
  try {
    // 🛡️ Sentinel: Security Checks
    const headersList = await headers();
    const forwardedFor = headersList.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 1. Rate Limiting (10 requests per hour per IP)
    const { success } = rateLimit(ip, { interval: 60 * 60 * 1000, limit: 10 });
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { to, subject, html } = await request.json();

    // 2. Input Validation
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const recipients = Array.isArray(to) ? to : [to];

    // Validate recipient count
    if (recipients.length > 50) {
      return NextResponse.json({ error: "Too many recipients (max 50)" }, { status: 400 });
    }

    // Validate email format
    if (recipients.some((email: unknown) => typeof email !== 'string' || !isValidEmail(email))) {
      return NextResponse.json({ error: "Invalid recipient email format" }, { status: 400 });
    }

    // Validate content length
    if (subject.length > 200) {
      return NextResponse.json({ error: "Subject too long (max 200 chars)" }, { status: 400 });
    }

    if (html.length > 100000) { // 100KB limit
      return NextResponse.json({ error: "Message content too large" }, { status: 400 });
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP credentials not found in environment variables");
      return NextResponse.json({ error: "SMTP not configured" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Verify connection configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP Connection Error:", verifyError);
      // 🛡️ Sentinel: Don't leak internal connection details
      return NextResponse.json(
        { error: "Email service temporarily unavailable" },
        { status: 500 }
      );
    }

    const info = await transporter.sendMail({
      from: `"Obour Academic Hub" <${process.env.SMTP_USER}>`,
      to: recipients.join(","),
      subject,
      html: sanitizeEmailHtml(html),
    });

    console.log("Message sent: %s", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    // 🛡️ Sentinel: Generic error message for security
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
