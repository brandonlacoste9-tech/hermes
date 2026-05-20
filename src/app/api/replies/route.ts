import { NextRequest, NextResponse } from "next/server";
import { processReply, classifyIntent } from "@/lib/agents/joe";
import { getPipelineStats, getRecentActivity, updateLeadStatus } from "@/lib/campaigns/store";

let checkCount = 0;

export async function GET() {
  const sentLeads = (await getRecentActivity(100)).filter((l: any) => l.status === "sent");
  return NextResponse.json({
    agent: "Joe — The Closer",
    status: "online",
    autoReply: process.env.ENABLE_AUTO_REPLY !== "false",
    checksRun: checkCount,
    sentLeadsAwaitingReply: sentLeads.length,
    pipeline: await getPipelineStats(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action = "check", from, subject, replyBody, leadId } = body;

  if (action === "process" && from && replyBody && leadId) {
    const result = await processReply(leadId, from, subject || "(no subject)", replyBody);
    return NextResponse.json(result);
  }

  if (action === "classify" && replyBody) {
    const intent = await classifyIntent(from || "unknown", subject || "", replyBody);
    return NextResponse.json(intent);
  }

  if (action === "check") {
    checkCount++;
    const sentLeads = (await getRecentActivity(100)).filter((l: any) => l.status === "sent");
    
    if (sentLeads.length > 0) {
      // In production: poll Gmail API for replies from sent domains
      // For now, return leads awaiting reply
      return NextResponse.json({
        checked: sentLeads.length,
        awaitingReply: sentLeads.map((l: any) => ({
          leadId: l.id,
          company: l.company,
          sentAt: l.sentAt,
          status: l.status,
        })),
      });
    }
    
    return NextResponse.json({ checked: 0, message: "No sent leads awaiting reply" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
