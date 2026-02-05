import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";
import { emailRequestSchema } from "@/lib/zod-schemas";

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
    // 🛡️ Sentinel: Security Check
    // Verify Authentication & Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify token with Google Identity Toolkit
    const verifyResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!verifyResponse.ok) {
      console.error("Token verification failed:", await verifyResponse.text());
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const verifyData = await verifyResponse.json();
    const user = verifyData.users?.[0];

    if (!user) {
      return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
    }

    // Strict Owner Check
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;
    if (!ownerEmail || user.email !== ownerEmail) {
      console.warn(`Unauthorized email attempt by: ${user.email}`);
      return NextResponse.json({ error: "Forbidden: Only the owner can send emails" }, { status: 403 });
    }
    // 🛡️ End Security Check

    const body = await request.json();
    const validation = emailRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { to, subject, html } = validation.data;

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
