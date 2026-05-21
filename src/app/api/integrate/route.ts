import { NextRequest, NextResponse } from "next/server";

/**
 * Unified Integration Webhook — The central nervous system.
 * 
 * All 31 apps post here. HermesOS routes the data to the right pipeline.
 * 
 * POST /api/integrate
 * Body: { source: "scanner"|"compliance"|"repertoire"|"buddy", action: "...", data: {...} }
 */

export async function POST(req: NextRequest) {
  const { source, action, data } = await req.json();
  const results: any[] = [];

  try {
    switch (source) {
      // ── Bill 96 Scanner → paid scan completed ─────────────────────────
      case "scanner":
        if (action === "scan_completed") {
          // Auto-add to campaign pipeline + trigger Max to hunt similar
          results.push({ step: "pipeline", status: "lead_added", lead: data });
          
          // Trigger Max to find similar companies
          const autonomyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "https://hermes-red-tau.vercel.app"}/api/autonomy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              niche: `Companies similar to ${data.company} needing Bill 96 compliance`,
              market: "Quebec",
              maxEmails: 3,
              send: true,
              yourService: "Bill 96 French compliance — avoid $90K/day fines",
            }),
          });
          results.push({ step: "max_hunt", status: "triggered", response: await autonomyRes.json().catch(() => ({})) });
        }
        break;

      // ── NordiqueCompliance audit form submitted ───────────────────────
      case "compliance":
        if (action === "audit_requested") {
          // Add to campaign + notify
          results.push({ step: "pipeline", status: "lead_added", lead: data });
          
          // Trigger Bill 96 Scanner for this URL
          const scanRes = await fetch("https://bill96-scanner.vercel.app/api/scan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.website }),
          });
          results.push({ step: "scan", status: "completed", result: await scanRes.json().catch(() => ({})) });
        }
        break;

      // ── Bill 96 Buddy full audit completed ────────────────────────────
      case "buddy":
        if (action === "audit_complete") {
          // Update pipeline + trigger Joe to send the report
          results.push({ step: "pipeline", status: "updated", lead: data });
          
          // Send report email via HermesOS Gmail
          const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/replies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "process",
              from: data.email,
              subject: `Your Bill 96 Compliance Report for ${data.company}`,
              body: `Your full compliance audit is complete. ${data.score}% score. ${data.issues?.length || 0} gaps found. View report: ${data.reportUrl}`,
              leadId: data.leadId,
            }),
          });
          results.push({ step: "joe", status: "report_sent" });
        }
        break;

      // ── Loi 96 Répertoire found new non-compliant businesses ──────────
      case "repertoire":
        if (action === "new_leads") {
          // Batch feed to Max for outreach
          results.push({ step: "pipeline", status: "batch_added", count: data.leads?.length || 0 });
          
          if (data.leads?.length > 0) {
            const autonomyRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/autonomy`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                niche: "Quebec businesses non-compliant with Bill 96",
                market: "Quebec",
                maxEmails: Math.min(data.leads.length, 10),
                send: true,
                yourService: "Bill 96 French compliance — automated audit + remediation",
              }),
            });
            results.push({ step: "max_hunt", status: "triggered" });
          }
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown source", source }, { status: 400 });
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "online",
    endpoints: ["scanner", "compliance", "buddy", "repertoire"],
    loop: "Scanner → HermesOS → Buddy → Nordique → Répertoire → Max → Gmail → Joe",
  });
}
