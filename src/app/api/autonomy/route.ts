/**
 * Autonomy Engine API — Full autonomous outreach loop.
 *
 * POST /api/autonomy
 * Body: { niche: string, market: string, maxEmails: number, send: boolean }
 *
 * Loop: Scout → Score → Generate → Send
 */

import { NextRequest, NextResponse } from "next/server";
import { executeAgent, AGENT_TEMPLATES, ping } from "@/lib/hermes/ai";
import { sendEmail, isConfigured } from "@/lib/email/sender";

interface Lead {
  name: string;
  website: string;
  email: string;
  icpScore: number;
  riskLevel: string;
  keyPoints: string[];
  tone: string;
}

interface OutreachResult {
  lead: Lead;
  emailSent: boolean;
  subject: string;
  error?: string;
}

interface RunLog {
  id: string;
  startedAt: string;
  completedAt?: string;
  niche: string;
  market: string;
  leadsFound: number;
  emailsSent: number;
  errors: number;
  results: OutreachResult[];
}

// In-memory run log (replace with DB later)
const runLogs: RunLog[] = [];

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "status";

  if (action === "logs") {
    return NextResponse.json({ logs: runLogs.slice(-20).reverse() });
  }

  if (action === "log" && req.nextUrl.searchParams.get("id")) {
    const log = runLogs.find(l => l.id === req.nextUrl.searchParams.get("id"));
    return log ? NextResponse.json(log) : NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const health = await ping();
  return NextResponse.json({
    status: "HermesOS Autonomy Engine",
    smtpConfigured: isConfigured(),
    ai: health,
    totalRuns: runLogs.length,
    totalEmailsSent: runLogs.reduce((s, l) => s + l.emailsSent, 0),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche = "B2B SaaS AI automation", market = "North America", maxEmails = 5, send = true } = body;

    const runId = `run_${Date.now()}`;
    const runLog: RunLog = {
      id: runId,
      startedAt: new Date().toISOString(),
      niche,
      market,
      leadsFound: 0,
      emailsSent: 0,
      errors: 0,
      results: [],
    };
    runLogs.push(runLog);

    // ═══════════════════════════════════════════════════════════════
    // PHASE 1: SCOUT — Find leads
    // ═══════════════════════════════════════════════════════════════
    console.log(`[Autonomy:${runId}] Phase 1: Scouting for ${niche} in ${market}`);

    const scoutResult = await executeAgent(
      AGENT_TEMPLATES.revenue_scout.systemPrompt,
      `Find ${maxEmails} real B2B SaaS companies in the ${niche} space in ${market}. For each, provide: company name, website URL, and a brief reason why they'd benefit from outbound sales services. Be specific — use real company names.`,
      ["web_search"],
      "balanced"
    );

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: PARSE — Extract leads from scout response
    // ═══════════════════════════════════════════════════════════════
    console.log(`[Autonomy:${runId}] Phase 2: Parsing leads`);

    const leads: Lead[] = [];
    const text = scoutResult.response;
    
    // Extract company names and websites using regex patterns
    const companyMatches = text.match(/\*\*([^*]+)\*\*\s*\(([^)]+)\)/g) || [];
    const bulletMatches = text.match(/[•\-\d]+\.\s*\*?\*?([^*\n]+)/g) || [];
    
    // Fallback: extract any Company (domain.com) pattern
    const genericMatches = text.match(/([A-Z][a-zA-Z\s&]+)\s*\(([a-zA-Z0-9.-]+\.(?:com|co|io|ai|ca|org))\)/g) || [];
    
    const allMatches = [...new Set([...companyMatches, ...genericMatches])];
    
    for (const match of allMatches.slice(0, maxEmails)) {
      const cleaned = match.replace(/^\d+\.\s*/, "").replace(/^\*\*/, "").replace(/\*\*$/, "");
      const parts = cleaned.match(/(.+?)\s*\(([^)]+)\)/);
      if (parts) {
        leads.push({
          name: parts[1].trim(),
          website: parts[2].trim(),
          email: "", // Will need enrichment
          icpScore: 75 + Math.floor(Math.random() * 20),
          riskLevel: "medium",
          keyPoints: ["AI automation", "outbound sales"],
          tone: "consultative",
        });
      }
    }

    runLog.leadsFound = leads.length;

    // If parsing failed, use the raw scout response as fallback leads
    if (leads.length === 0) {
      // Extract any capitalized company names
      const nameMatches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/g) || [];
      const uniqueNames = [...new Set(nameMatches)].filter(n => n.length > 5 && !["North America", "B2B SaaS", "The Company"].includes(n));
      for (const name of uniqueNames.slice(0, maxEmails)) {
        leads.push({
          name,
          website: `${name.toLowerCase().replace(/\s+/g, "")}.com`,
          email: "",
          icpScore: 75,
          riskLevel: "medium",
          keyPoints: ["AI automation"],
          tone: "consultative",
        });
      }
      runLog.leadsFound = leads.length;
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3: GENERATE & SEND — Email per lead
    // ═══════════════════════════════════════════════════════════════
    console.log(`[Autonomy:${runId}] Phase 3: Generating & sending ${leads.length} emails`);

    for (const lead of leads) {
      const result: OutreachResult = { lead, emailSent: false, subject: "" };

      try {
        const emailResult = await executeAgent(
          `You are an outreach specialist. Write a 3-sentence cold email targeting ${lead.name} (${lead.website}). They are in the ${niche} space. Keep it under 100 words. Include a clear CTA. Use this exact format:

Subject: [subject line]
Body: [email body]

Make the subject line specific to ${lead.name}.`,
          `Write a cold outreach email for ${lead.name}`,
          [],
          "permissive"
        );

        const subjectMatch = emailResult.response.match(/Subject:\s*(.+)/i);
        const bodyMatch = emailResult.response.match(/Body:\s*([\s\S]+)/i);

        const subject = subjectMatch?.[1]?.trim() || `Strategic Partnership: ${lead.name}`;
        const body = bodyMatch?.[1]?.trim() || emailResult.response;
        result.subject = subject;

        if (send && isConfigured()) {
          const toEmail = lead.email || `contact@${lead.website.replace(/^https?:\/\//, "").replace(/\/$/, "").replace("www.", "")}`;
          
          const sent = await sendEmail({
            to: toEmail,
            subject,
            body,
            replyTo: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
          });

          result.emailSent = sent.success;
          if (!sent.success) result.error = sent.error;

          if (sent.success) {
            runLog.emailsSent++;
          } else {
            runLog.errors++;
          }
        }
      } catch (e: any) {
        result.error = e.message;
        runLog.errors++;
      }

      runLog.results.push(result);
    }

    runLog.completedAt = new Date().toISOString();

    console.log(`[Autonomy:${runId}] Complete: ${runLog.emailsSent} sent, ${runLog.errors} errors`);

    return NextResponse.json({
      success: true,
      run: runLog,
      smtpConfigured: isConfigured(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, success: false }, { status: 500 });
  }
}
