import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import { headers } from "next/headers";
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

export async function POST(request: Request) {
  try {
    // 🛡️ Sentinel: Add rate limiting to prevent spam
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(ip, { interval: 60 * 1000, limit: 5 }); // 5 emails per minute

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { to, subject, html } = await request.json();

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
      return NextResponse.json(
        { error: "SMTP Connection failed. Check credentials." },
        { status: 500 }
      );
    }

    const info = await transporter.sendMail({
      from: `"Obour Academic Hub" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(",") : to,
      subject,
      html: sanitizeEmailHtml(html),
    });

    console.log("Message sent: %s", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
