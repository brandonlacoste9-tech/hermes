import { NextRequest, NextResponse } from "next/server";
import { getCampaigns, getPipelineStats, getRecentActivity, updateLeadStatus } from "@/lib/campaigns/store";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "stats";
  const leadId = req.nextUrl.searchParams.get("leadId");
  const newStatus = req.nextUrl.searchParams.get("status");

  try {
    if (action === "stats") return NextResponse.json(await getPipelineStats());
    if (action === "list") return NextResponse.json({ campaigns: await getCampaigns() });
    if (action === "activity") return NextResponse.json({ leads: await getRecentActivity() });
    if (action === "update" && leadId && newStatus) {
      await updateLeadStatus(leadId, newStatus);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(await getPipelineStats());
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
