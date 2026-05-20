import { NextRequest, NextResponse } from "next/server";
import { ping, listCrews, createCrew, runCrew, getRunStatus, CREW_TEMPLATES } from "@/lib/crewai/client";

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "status";
  const crewId = req.nextUrl.searchParams.get("crewId");
  const runId = req.nextUrl.searchParams.get("runId");

  try {
    if (action === "list") {
      const crews = await listCrews();
      return NextResponse.json({ crews });
    }
    if (action === "runs" && crewId) {
      const { listRuns } = await import("@/lib/crewai/client");
      const runs = await listRuns(crewId);
      return NextResponse.json({ runs });
    }
    if (action === "run" && runId) {
      const status = await getRunStatus(runId);
      return NextResponse.json(status);
    }

    // Default: health check
    const health = await ping();
    return NextResponse.json({
      status: "CrewAI Connected",
      health,
      templates: Object.keys(CREW_TEMPLATES).length,
    });
  } catch (e: any) {
    // If not configured, return graceful degradation
    if (e.message?.includes("not configured")) {
      return NextResponse.json({
        status: "CrewAI — add CREWAI_API_KEY to activate",
        configured: false,
        templates: Object.keys(CREW_TEMPLATES).length,
      });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, template, crew, inputs } = body;

    if (action === "create") {
      const crewData = template ? CREW_TEMPLATES[template] : crew;
      if (!crewData) return NextResponse.json({ error: "No crew template or data" }, { status: 400 });
      const result = await createCrew(crewData);
      return NextResponse.json({ success: true, crew: result });
    }

    if (action === "run" && crew?.id) {
      const result = await runCrew(crew.id, inputs);
      return NextResponse.json({ success: true, run: result });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
