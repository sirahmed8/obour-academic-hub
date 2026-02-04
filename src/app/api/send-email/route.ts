import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import sanitizeHtml from "sanitize-html";

// Manual Input Validation Helper
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateInput = (body: any) => {
  const { to, subject, html } = body;
  if (!to || !subject || !html) return { valid: false, error: "Missing required fields" };

  const emails = Array.isArray(to) ? to : [to];
  if (!emails.every((e: any) => typeof e === 'string' && isValidEmail(e))) {
    return { valid: false, error: "Invalid 'to' email address(es)" };
  }

  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return { valid: false, error: "Invalid 'subject'" };
  }

  if (typeof html !== 'string' || html.trim().length === 0) {
    return { valid: false, error: "Invalid 'html'" };
  }

  return { valid: true, data: { to: emails, subject, html } };
};

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
    // 1. Authentication Check
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      console.error("Firebase API Key missing in environment");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    // Verify Token via Google Identity Toolkit
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !verifyData.users || !verifyData.users.length) {
      console.warn("Invalid Token:", verifyData.error);
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userEmail = verifyData.users[0].email;
    const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL;

    // 2. Authorization Check (Owner Only)
    // We strictly limit sending emails to the owner to prevent Open Relay abuse.
    if (!userEmail || userEmail !== ownerEmail) {
      console.warn(`Unauthorized email attempt by: ${userEmail}`);
      return NextResponse.json({ error: "Forbidden: Only owner can send emails" }, { status: 403 });
    }

    // 3. Input Validation
    const body = await request.json();
    const validation = validateInput(body);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { to, subject, html } = validation.data!;

    // 4. Send Email
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

    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("SMTP Connection Error:", verifyError);
      return NextResponse.json(
        { error: "SMTP Connection failed" },
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
    // Secure Error Handling: Don't leak stack trace
    return NextResponse.json({ error: "An internal error occurred" }, { status: 500 });
  }
}
