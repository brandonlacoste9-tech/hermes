/**
 * Email Sender — SMTP-based email delivery for HermesOS agents.
 * Uses Gmail SMTP by default. Configure via env vars.
 */

import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_NAME = process.env.SMTP_FROM_NAME || "HermesOS Agent";
const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || SMTP_USER;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
  html?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  const transport = getTransporter();
  if (!transport) {
    return { success: false, error: "SMTP not configured. Set SMTP_USER and SMTP_PASS." };
  }

  try {
    const html = opts.html || `<html><body style="font-family:Georgia,serif;color:#1a1a1a;max-width:600px;"><pre style="white-space:pre-wrap;font-family:Georgia,serif;font-size:15px;line-height:1.6;">${opts.body}</pre></body></html>`;

    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: opts.to,
      replyTo: opts.replyTo || FROM_EMAIL,
      subject: opts.subject,
      html,
      text: opts.body,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export function isConfigured(): boolean {
  return !!(SMTP_USER && SMTP_PASS);
}
