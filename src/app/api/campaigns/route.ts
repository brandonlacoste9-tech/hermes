import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, getCampaign, getPipelineStats, getRecentActivity, updateLeadStatus } from "@/lib/campaigns/store";
import { migrateNeonSchema } from "@/lib/neon/client";

// Run migration on first API hit
let migrated = false;

export async function GET(req: NextRequest) {
  if (!migrated) { await migrateNeonSchema(); migrated = true; }
  const action = req.nextUrl.searchParams.get("action") || "stats";
  const campaignId = req.nextUrl.searchParams.get("campaignId");
  const leadId = req.nextUrl.searchParams.get("leadId");
  const newStatus = req.nextUrl.searchParams.get("status");

  try {
    if (action === "stats") {
      return NextResponse.json(getPipelineStats(campaignId || undefined));
    }

    if (action === "list") {
      const campaigns = getCampaigns();
      return NextResponse.json({ campaigns });
    }

    if (action === "activity") {
      return NextResponse.json({ leads: getRecentActivity(50) });
    }

    if (action === "campaign" && campaignId) {
      const campaign = getCampaign(campaignId);
      return campaign
        ? NextResponse.json(campaign)
        : NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (action === "update" && leadId && newStatus) {
      const validStatuses = ["hunted", "sent", "opened", "replied", "booked", "closed_won", "closed_lost", "bounced"];
      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      const ok = updateLeadStatus(leadId, newStatus as any);
      return NextResponse.json({ success: ok });
    }

    if (action === "check-replies") {
      return NextResponse.json({ message: "Gmail reply check requires IMAP credentials" });
    }

    return NextResponse.json(getPipelineStats());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
