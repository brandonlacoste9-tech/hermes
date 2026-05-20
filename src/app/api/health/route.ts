import { NextResponse } from "next/server";
import { getSystemHealth, checkProviderHealth, getBestProvider } from "@/lib/agents/ti-guy";
import { getPipelineStats } from "@/lib/campaigns/store";

export async function GET() {
  const health = await getSystemHealth();
  return NextResponse.json({
    ...health,
    agents: { Joe: "online", Max: "online", TiGuy: "online" },
  });
}

export async function POST() {
  await checkProviderHealth();
  const best = getBestProvider();
  return NextResponse.json({ provider: best, message: `Routing to ${best}` });
}
