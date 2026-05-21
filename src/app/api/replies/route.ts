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
    return NextResponse.json({
      intent: result.intent,
      replySent: result.replySent || false,
      leadUpdated: !!lead,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
