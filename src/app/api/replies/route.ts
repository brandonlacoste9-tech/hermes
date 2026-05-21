import { NextRequest, NextResponse } from "next/server";
import { processReply } from "@/lib/agents/joe";
import { findLeadByEmail, updateLeadPipeline } from "@/lib/supabase/admin";
import { getPipelineStats } from "@/lib/campaigns/store";

export async function GET() {
  return NextResponse.json({ agent: "Joe — The Closer", status: "online" });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { fromEmail, subject, body, threadId, action } = payload;

    if (action === "classify") {
      const result = await processReply(body, "test_lead");
      return NextResponse.json(result);
    }

    if (!fromEmail || !body) {
      return NextResponse.json({ error: "Missing fromEmail or body" }, { status: 400 });
    }

    const lead = await findLeadByEmail(fromEmail);
    if (lead) await updateLeadPipeline(lead.id, { status: "replied" });

    const result = await processReply(body, lead?.id || "unknown");
    
    // Telegram alert on reply
    if (result.intent === "INTERESTED") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
      if (botToken) {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_HOME_CHANNEL || "", text: `🔥 REPLY: ${result.intent} (${result.confidence}%)\n📧 ${fromEmail}\n💬 ${body.slice(0, 100)}` }),
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      intent: result.intent,
      replySent: result.replySent || false,
      leadUpdated: !!lead,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
