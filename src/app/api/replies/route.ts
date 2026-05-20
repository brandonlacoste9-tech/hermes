/**
 * Joe — The Closer: Inbound Reply Webhook
 * 
 * Receives email replies, classifies intent, updates Supabase pipeline,
 * dispatches automated actions (booking, rebuttal, unsubscribe).
 */

import { NextRequest, NextResponse } from "next/server";
import { processReply } from "@/lib/agents/joe";
import { findLeadByEmail, updateLeadPipeline, ensurePipelineTable } from "@/lib/supabase/admin";
import { getPipelineStats } from "@/lib/campaigns/store";

// Ensure Supabase tables on first hit
let schemaEnsured = false;

export async function GET() {
  if (!schemaEnsured) { try { await ensurePipelineTable(); schemaEnsured = true; } catch {} }
  
  return NextResponse.json({
    agent: "Joe — The Closer",
    status: "online",
    endpoint: "/api/replies",
    autoReply: process.env.ENABLE_AUTO_REPLY !== "false",
    pipeline: await getPipelineStats(),
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!schemaEnsured) { try { await ensurePipelineTable(); schemaEnsured = true; } catch {} }

    const payload = await req.json();
    const { fromEmail, subject, body, threadId, action } = payload;

    // ── Manual classification test ──────────────────────────────
    if (action === "classify" && body) {
      const result = await processReply("test", fromEmail || "unknown", subject || "", body);
      return NextResponse.json(result);
    }

    // ── Live webhook processing ─────────────────────────────────
    if (!fromEmail || !body) {
      return NextResponse.json({ error: "Missing fromEmail or body" }, { status: 400 });
    }

    // 1. Locate the lead in the pipeline
    const lead = await findLeadByEmail(fromEmail);
    
    if (!lead) {
      // Cold reply from unmapped target — log and skip
      console.log(`[Joe] Reply from unmapped target: ${fromEmail} — logged, no pipeline update`);
      return NextResponse.json({
        message: "Reply from unmapped target. Logged for review.",
        from: fromEmail,
        subject,
        logged: true,
      });
    }

    // 2. Run Joe's classification + auto-reply engine
    const result = await processReply(lead.id, fromEmail, subject, body);

    // 3. Update Supabase with atomic mutation
    try {
      await updateLeadPipeline(lead.id, {
        status: result.newStatus || "replied",
        sentiment: result.intent.intent,
        reply_text: result.replyText,
      });
    } catch (dbError: any) {
      console.error(`[Joe] Supabase update failed: ${dbError.message}`);
      // Pipeline continues — in-memory store handles fallback
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      company: lead.company,
      intent: result.intent.intent,
      confidence: result.intent.confidence,
      replySent: result.replySent,
      pipelineStatus: result.newStatus,
    });
  } catch (e: any) {
    console.error(`[Joe] Webhook error: ${e.message}`);
    return NextResponse.json({ error: "Internal pipeline error" }, { status: 500 });
  }
}
