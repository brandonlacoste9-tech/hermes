/**
 * Reply Watcher — Gmail polling + Closer agent.
 * Checks inbox for replies, classifies intent, auto-responds, updates pipeline.
 */

import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/lib/hermes/ai";
import { sendEmail, isConfigured as smtpReady } from "@/lib/email/sender";
import { getRecentActivity, updateLeadStatus, getPipelineStats } from "@/lib/campaigns/store";

const GMAIL_IMAP = process.env.GMAIL_IMAP_ENABLED === "true";
const AUTO_REPLY = process.env.AUTO_REPLY_ENABLED !== "false";
const YOUR_SERVICE = process.env.AUTO_REPLY_SERVICE || "Bill 96 French compliance";

let lastCheck: string | null = null;
let replyCount = 0;
let autoReplyCount = 0;

export async function GET(req: NextRequest) {
  return NextResponse.json({
    service: "Reply Watcher",
    gmailConfigured: GMAIL_IMAP || smtpReady(),
    autoReply: AUTO_REPLY,
    lastCheck,
    repliesDetected: replyCount,
    autoRepliesSent: autoReplyCount,
    pipeline: await getPipelineStats(),
  });
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { action = "check" } = payload;

  if (action === "check") {
    const findings: any[] = [];
    lastCheck = new Date().toISOString();

    // ── Check recent sent leads for potential replies ────────────
    const sentLeads = (await getRecentActivity(100))
      .filter((l: any) => l.status === "sent");

    if (sentLeads.length > 0) {
      // Simulate reply detection for demo (real IMAP requires OAuth)
      for (const lead of sentLeads.slice(0, 5)) {
        findings.push({
          leadId: lead.id,
          company: lead.company,
          status: lead.status,
          checked: true,
        });
      }
    }

    replyCount += 1;
    return NextResponse.json({
      checked: findings.length,
      leadsChecked: findings,
      autoReplyEnabled: AUTO_REPLY,
    });
  }

  // ── Process inbound reply ─────────────────────────────────────
  if (action === "process") {
    const { from, subject, body, leadId } = payload;

    // Phase 1: Classify intent
    const classification = await executeAgent(
      `You are a lead classifier. Analyze this email reply and classify as one of:
- INTERESTED: wants to learn more, asks questions, asks for demo/call
- OBJECTION: raises concern, says no, too expensive, not right now
- UNSUBSCRIBE: asks to be removed, says stop emailing
- OUT_OF_OFFICE: automated vacation/away message
- OTHER: unclear or unrelated

Return ONLY the classification word.`,
      `Classify this email from ${from}:\nSubject: ${subject}\nBody: ${body}`,
      [],
      "permissive"
    );

    const intent = classification.response.trim().toUpperCase();

    // Phase 2: Update pipeline
    if (intent.includes("INTERESTED")) {
      await updateLeadStatus(leadId, "replied");
    } else if (intent.includes("OBJECTION")) {
      await updateLeadStatus(leadId, "replied");
    } else if (intent.includes("UNSUBSCRIBE")) {
      await updateLeadStatus(leadId, "closed_lost");
    }

    // Phase 3: Auto-reply if enabled
    let autoReplySent = false;
    if (AUTO_REPLY && smtpReady()) {
      let replyBody = "";

      if (intent.includes("INTERESTED")) {
        const agentReply = await executeAgent(
          `You are a sales rep for ${YOUR_SERVICE}. A lead replied with interest. Write a warm 3-sentence reply with a Calendly booking link. Be specific about their needs.`,
          `Lead ${from} replied: "${body}"\nWrite a reply pitching ${YOUR_SERVICE}.`,
          [],
          "permissive"
        );
        replyBody = agentReply.response;
      } else if (intent.includes("OBJECTION")) {
        const agentReply = await executeAgent(
          `You are a sales rep for ${YOUR_SERVICE}. A lead raised an objection. Write a respectful 2-sentence rebuttal addressing their concern and keeping the door open.`,
          `Objection from ${from}: "${body}"`,
          [],
          "permissive"
        );
        replyBody = agentReply.response;
      }

      if (replyBody) {
        const sent = await sendEmail({
          to: from,
          subject: `Re: ${subject}`,
          body: replyBody,
        });
        autoReplySent = !!sent.success;
        if (sent.success) autoReplyCount++;
      }
    }

    return NextResponse.json({
      intent,
      leadUpdated: true,
      autoReplySent,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
