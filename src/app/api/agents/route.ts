import { NextRequest, NextResponse } from "next/server";
import { executeAgent, ping, AGENT_TEMPLATES } from "@/lib/hermes/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, template, autonomy, tools, task, systemPrompt } = body;

    // ── Ping / health check ──────────────────────────────────────────────
    if (action === "ping") {
      const result = await ping();
      return NextResponse.json(result);
    }

    // ── Get template info ────────────────────────────────────────────────
    if (action === "template") {
      const tmpl = AGENT_TEMPLATES[template];
      if (!tmpl) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }
      return NextResponse.json(tmpl);
    }

    // ── Execute agent ────────────────────────────────────────────────────
    if (action === "execute") {
      const prompt = systemPrompt || AGENT_TEMPLATES[template]?.systemPrompt || 
        "You are an autonomous AI agent. Execute the task efficiently.";
      
      const result = await executeAgent(
        prompt,
        task || "Execute your configured mission.",
        tools || [],
        autonomy || "balanced"
      );

      return NextResponse.json({
        success: true,
        agent: { name, template, autonomy },
        result,
      });
    }

    // ── List templates ───────────────────────────────────────────────────
    if (action === "templates") {
      const templates = Object.entries(AGENT_TEMPLATES).map(([key, val]) => ({
        id: key,
        name: key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        suggestedTools: val.suggestedTools,
      }));
      return NextResponse.json({ templates });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET — health check
export async function GET() {
  const result = await ping();
  return NextResponse.json({
    status: "HermesOS Agent Runtime",
    ai: result,
    templates: Object.keys(AGENT_TEMPLATES).length,
  });
}
