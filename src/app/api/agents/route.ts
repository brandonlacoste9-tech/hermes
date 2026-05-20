import { NextRequest, NextResponse } from "next/server";
import { executeAgent, ping, AGENT_TEMPLATES, PROVIDERS, ProviderKey } from "@/lib/hermes/ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, name, template, autonomy, tools, task, systemPrompt, provider } = body;

    // ── Ping / health check ──────────────────────────────────────────────
    if (action === "ping") {
      const prov = (provider || "nous-hermes") as ProviderKey;
      const result = await ping(prov);
      return NextResponse.json(result);
    }

    // ── List providers ───────────────────────────────────────────────────
    if (action === "providers") {
      const list = Object.entries(PROVIDERS).map(([key, cfg]) => ({
        id: key,
        name: cfg.name,
        model: cfg.model,
        color: cfg.color,
        configured: !!cfg.apiKey,
      }));
      return NextResponse.json({ providers: list });
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
      
      const prov = (provider || "nous-hermes") as ProviderKey;
      
      const result = await executeAgent(
        prompt,
        task || "Execute your configured mission.",
        tools || [],
        autonomy || "balanced",
        prov
      );

      return NextResponse.json({
        success: true,
        agent: { name, template, autonomy, provider: prov },
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

export async function GET(req: NextRequest) {
  const prov = (req.nextUrl.searchParams.get("provider") || "nous-hermes") as ProviderKey;
  const result = await ping(prov);
  return NextResponse.json({
    status: "HermesOS Agent Runtime — Multi-Provider",
    providers: Object.keys(PROVIDERS).length,
    ai: result,
    templates: Object.keys(AGENT_TEMPLATES).length,
  });
}
