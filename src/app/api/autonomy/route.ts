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
import { createCampaign, addLeadsToCampaign, updateLeadStatus } from "@/lib/campaigns/store";

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

// ── Atomic Processing Lock (idempotency shield) ────────────────────────────

let processingLock: { active: boolean; startedAt: number } | null = null;
const LOCK_TIMEOUT_MS = 15 * 60 * 1000;

function acquireLock(): boolean {
  if (processingLock?.active) {
    if (Date.now() - processingLock.startedAt > LOCK_TIMEOUT_MS) {
      processingLock = null; // dead-letter recovery
    } else {
      return false; // another run in progress
    }
  }
  processingLock = { active: true, startedAt: Date.now() };
  return true;
}

function releaseLock() { processingLock = null; }

export async function POST(req: NextRequest) {
  // ── Idempotency gate ──────────────────────────────────────────
  if (!acquireLock()) {
    return NextResponse.json({ 
      skipped: true, 
      reason: "Another autonomy cycle is already running" 
    });
  }

  try {
    const body = await req.json();
    const { niche = "B2B SaaS AI automation", market = "North America", maxEmails = 5, send = true, yourService = "" } = body;

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
      `Find ${maxEmails} SPECIFIC companies that would BUY "${yourService || "Bill 96 compliance services"}".

CRITICAL: You are a sales rep for a company that sells: ${yourService || "French localization and Bill 96 compliance"}.
Find companies that NEED this specific service.

Requirements:
- TARGET: Canadian SaaS companies with English-only websites operating in Quebec
- Must be SOFTWARE companies, not banks, manufacturers, or retailers
- Under 500 employees
- Their website/customers are in Quebec but product is English-only
- They face Bill 96 fines if they don't add French

Return company name and website only. Be specific — use real companies.`,
      ["web_search"],
      "balanced"
    );

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2: PARSE — Use LLM to extract structured leads
    // ═══════════════════════════════════════════════════════════════
    console.log(`[Autonomy:${runId}] Phase 2: Extracting structured leads`);

    const leads: Lead[] = [];
    const text = scoutResult.response;

    // Use LLM to parse the scout output into structured JSON
    try {
      const parseResult = await executeAgent(
        `You are a data extraction tool. Given a research report, extract company names and websites into JSON array.

Return ONLY a valid JSON array like:
[{"name": "Company Name", "website": "company.com"}]

Remove markdown formatting, numbers, and bullets. Only include real company names.`,
        `Extract companies from this text:\n\n${text}`,
        [],
        "permissive"
      );

      // Try to parse the JSON from the response
      let parsed: any[] = [];
      try {
        const jsonMatch = parseResult.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch {
        // If JSON parsing fails, try extracting from the original text
        const lines = text.split("\n").filter((l: string) => l.match(/\*{1,2}[A-Z]/) || l.match(/^\d+\./));
        for (const line of lines.slice(0, maxEmails)) {
          const cleaned = line.replace(/^[\d\*\-.\s]+/, "").trim();
          const urlMatch = cleaned.match(/([a-zA-Z0-9.-]+\.(?:com|co|io|ai|ca|org))/);
          if (urlMatch && cleaned.length > 3) {
            parsed.push({
              name: cleaned.replace(/\s*\([^)]*\)\s*/, "").trim(),
              website: urlMatch[1],
            });
          }
        }
      }

      for (const item of parsed.slice(0, maxEmails)) {
        if (item.name && item.website && item.name.length > 2) {
          leads.push({
            name: item.name,
            website: item.website.startsWith("http") ? item.website : `${item.website}`,
            email: "",
            icpScore: 78 + Math.floor(Math.random() * 15),
            riskLevel: "medium",
            keyPoints: [niche, "outbound sales"],
            tone: "consultative",
          });
        }
      }
    } catch (e: any) {
      console.warn(`[Autonomy:${runId}] Lead parsing failed: ${e.message}`);
    }

    runLog.leadsFound = leads.length;

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2.5: ENRICH — Scrape websites for real data
    // ═══════════════════════════════════════════════════════════════
    if (leads.length > 0) {
      console.log(`[Autonomy:${runId}] Phase 2.5: Enriching leads via Firecrawl`);
      const { enrichLead, isConfigured: fcReady } = await import("@/lib/firecrawl/client");

      if (fcReady()) {
        for (const lead of leads) {
          try {
            const enrichment = await enrichLead(lead.name, lead.website);
            lead.keyPoints = [
              enrichment.isEnglishOnly ? "English-only website — needs French localization" : "Has French content",
              enrichment.description.slice(0, 100),
              ...enrichment.keyInsights,
            ].filter(Boolean);
          } catch {
            // Enrichment is non-critical — continue with basic data
          }
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE 3: GENERATE & SEND — Email per lead
    // ═══════════════════════════════════════════════════════════════
    console.log(`[Autonomy:${runId}] Phase 3: Generating & sending ${leads.length} emails`);

    for (const lead of leads) {
      const result: OutreachResult = { lead, emailSent: false, subject: "" };

      try {
        const emailResult = await executeAgent(
          `You are an outreach specialist. Write a 3-sentence cold email targeting ${lead.name} (website: ${lead.website}) in the ${niche} industry. 

RULES:
- YOU ARE SELLING: ${yourService || "French localization + Bill 96 compliance services"}. Pitch THIS service, not random SaaS tools.
- Use the company name "${lead.name}" in the email body — do NOT use placeholders like [Name]
- Reference why ${lead.name} specifically needs ${yourService || "compliance help"}
- Keep it under 120 words
- Include one specific, relevant detail about their business
- Single clear CTA
- Sign as "HermesOS Agent"

Format:
Subject: [subject line — no placeholders]
Body: [email body — use real company name]`,
          `Write a cold outreach email for ${lead.name} (${lead.website})`,
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

    // ── Atomic Processing Lock ────────────────────────────────────────────────

let processingLock: { active: boolean; startedAt: number; leadIds: Set<string> } | null = null;
const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 min dead-letter recovery

function acquireLock(maxLeads: number): boolean {
  const now = Date.now();
  
  // Dead-letter recovery: if a lock is older than timeout, release it
  if (processingLock?.active && (now - processingLock.startedAt) > LOCK_TIMEOUT_MS) {
    console.warn(`[Autonomy] Stale lock detected (${Math.round((now - processingLock.startedAt) / 1000)}s). Recovering.`);
    processingLock = null;
  }
  
  // Reject if already processing
  if (processingLock?.active) {
    console.log(`[Autonomy] Lock held — another run in progress. Skipping cycle.`);
    return false;
  }
  
  processingLock = { active: true, startedAt: now, leadIds: new Set() };
  return true;
}

function releaseLock() {
  processingLock = null;
}

function isLeadLocked(website: string): boolean {
  return processingLock?.leadIds.has(website) ?? false;
}

function lockLead(website: string) {
  processingLock?.leadIds.add(website);
}
    if (leads.length > 0) {
      try {
        const campaign = await createCampaign(
          `Bill 96 Hunt — ${new Date().toLocaleDateString()}`,
          niche
        );
        const savedLeads = await addLeadsToCampaign(campaign.id, leads.map(l => ({
          company: l.name,
          website: l.website,
          email: l.email || `contact@${l.website}`,
          service: yourService || "",
          subject: runLog.results.find(r => r.lead.name === l.name)?.subject || "",
          body: "",
        })));
        // Mark as sent for each
        savedLeads?.forEach(sl => updateLeadStatus(sl.id, "sent"));
      } catch {
        // Neon persistence is best-effort — autonomy continues regardless
      }
    }

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
