/**
 * Joe — The Closer Agent
 * 
 * Lives in the reply webhook. Intercepts responses, classifies sentiment,
 * handles objections, generates booking links, advances pipeline.
 * 
 * Metric: Moving leads from Replied → Booked → Closed/Won
 */

import { executeAgent } from "@/lib/hermes/ai";
import { sendEmail, isConfigured as smtpReady } from "@/lib/email/sender";
import { getRecentActivity, updateLeadStatus, getPipelineStats } from "@/lib/campaigns/store";

// ── Configuration ──────────────────────────────────────────────────────────

const AUTO_REPLY = process.env.ENABLE_AUTO_REPLY !== "false";
const DEFAULT_SERVICE = process.env.DEFAULT_SERVICE || "Bill 96 French compliance";
const BOOKING_LINK = process.env.BOOKING_LINK || "https://calendly.com/hermesos/15min";

export interface ReplyIntent {
  intent: "INTERESTED" | "OBJECTION" | "UNSUBSCRIBE" | "OUT_OF_OFFICE" | "OTHER";
  confidence: number;
  keyPhrases: string[];
  suggestedAction: "send_booking" | "handle_objection" | "unsubscribe" | "ignore" | "escalate";
}

export interface CloserResult {
  leadId: string;
  from: string;
  subject: string;
  intent: ReplyIntent;
  pipelineUpdated: boolean;
  newStatus?: string;
  replySent: boolean;
  replyText?: string;
  timestamp: string;
}

// ── Intent Classification ─────────────────────────────────────────────────

export async function classifyIntent(from: string, subject: string, body: string): Promise<ReplyIntent> {
  const classification = await executeAgent(
    `You are Joe, the Closer agent for HermesOS. Analyze reply intent.

CLASSIFY AS ONE:
- INTERESTED: wants demo, asks about pricing, asks for details, says "tell me more", positive tone
- OBJECTION: says no, too expensive, not right now, went with competitor, needs to think
- UNSUBSCRIBE: asks to be removed, says stop, unsubscribe request
- OUT_OF_OFFICE: automated vacation/absence message
- OTHER: unclear, spam, unrelated

Return JSON:
{
  "intent": "INTERESTED",
  "confidence": 85,
  "keyPhrases": ["wants demo", "asks about pricing"],
  "suggestedAction": "send_booking"
}`,
    `Classify: From ${from}, Subject "${subject}", Body: ${body.slice(0, 1000)}`,
    [],
    "permissive"
  );

  try {
    const json = JSON.parse(classification.response.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return {
      intent: json.intent || "OTHER",
      confidence: json.confidence || 50,
      keyPhrases: json.keyPhrases || [],
      suggestedAction: json.suggestedAction || "ignore",
    };
  } catch {
    const text = classification.response.toUpperCase();
    return {
      intent: text.includes("INTERESTED") ? "INTERESTED" : text.includes("OBJECTION") ? "OBJECTION" : text.includes("UNSUBSCRIBE") ? "UNSUBSCRIBE" : "OTHER",
      confidence: 70,
      keyPhrases: [],
      suggestedAction: text.includes("INTERESTED") ? "send_booking" : "ignore",
    };
  }
}

// ── Reply Generation ──────────────────────────────────────────────────────

async function generateBookingReply(from: string, body: string): Promise<string> {
  const reply = await executeAgent(
    `You are Joe, closing deals for ${DEFAULT_SERVICE}. A lead replied with INTEREST.

Write a warm 3-sentence reply that:
1. Thanks them for their interest
2. References their specific needs
3. Includes booking link: ${BOOKING_LINK}
4. Makes it easy to say yes

Be warm, professional, and direct.`,
    `Reply to ${from} who said: "${body.slice(0, 300)}"`,
    [],
    "permissive"
  );
  return reply.response;
}

async function generateObjectionReply(from: string, body: string): Promise<string> {
  const reply = await executeAgent(
    `You are Joe, handling objections for ${DEFAULT_SERVICE}. A lead pushed back.

Write a respectful 2-3 sentence rebuttal that:
1. Acknowledges their concern
2. Addresses it directly (cost: emphasize ROI; timing: mention urgency; competitor: differentiate)
3. Keeps the door open with a soft CTA

Be empathetic, not pushy.`,
    `Objection from ${from}: "${body.slice(0, 300)}"`,
    [],
    "permissive"
  );
  return reply.response;
}

// ── Main Closer Pipeline ──────────────────────────────────────────────────

export async function processReply(
  leadId: string,
  from: string,
  subject: string,
  body: string
): Promise<CloserResult> {
  const result: CloserResult = {
    leadId,
    from,
    subject,
    intent: { intent: "OTHER", confidence: 0, keyPhrases: [], suggestedAction: "ignore" },
    pipelineUpdated: false,
    replySent: false,
    timestamp: new Date().toISOString(),
  };

  // 1. Classify
  result.intent = await classifyIntent(from, subject, body);

  // 2. Update pipeline
  const { intent, suggestedAction } = result.intent;
  
  if (intent === "INTERESTED") {
    await updateLeadStatus(leadId, "replied");
    result.pipelineUpdated = true;
    result.newStatus = "replied";
  } else if (intent === "OBJECTION") {
    await updateLeadStatus(leadId, "replied");
    result.pipelineUpdated = true;
    result.newStatus = "replied";
  } else if (intent === "UNSUBSCRIBE") {
    await updateLeadStatus(leadId, "closed_lost");
    result.pipelineUpdated = true;
    result.newStatus = "closed_lost";
  }

  // 3. Auto-reply if enabled
  if (AUTO_REPLY && smtpReady()) {
    if (suggestedAction === "send_booking") {
      result.replyText = await generateBookingReply(from, body);
    } else if (suggestedAction === "handle_objection") {
      result.replyText = await generateObjectionReply(from, body);
    }

    if (result.replyText) {
      const sent = await sendEmail({
        to: from,
        subject: `Re: ${subject}`,
        body: result.replyText,
      });
      result.replySent = !!sent.success;
    }
  }

  // 4. If reply sent, advance to booked status
  if (result.replySent && intent === "INTERESTED") {
    // Don't auto-book — wait for human confirmation. But mark as replied.
    // For full autonomy, uncomment:
    // await updateLeadStatus(leadId, "booked");
  }

  return result;
}
