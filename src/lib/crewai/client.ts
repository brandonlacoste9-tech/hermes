/**
 * CrewAI Client — Multi-agent orchestration for HermesOS.
 *
 * Docs: https://docs.crewai.com
 * API: https://api.crewai.com/v1
 */

const CREWAI_BASE = "https://api.crewai.com/v1";
const API_KEY = process.env.CREWAI_API_KEY || "";

function headers(): HeadersInit {
  if (!API_KEY) throw new Error("CREWAI_API_KEY not configured");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };
}

// ── Crew Types ────────────────────────────────────────────────────────────────

export interface CrewAgent {
  role: string;
  goal: string;
  backstory: string;
  tools: string[];        // Composio tool names
  llm?: string;           // Provider override (deepseek, nous-hermes, openai)
  allowDelegation?: boolean;
}

export interface CrewTask {
  description: string;
  expectedOutput: string;
  agent: string;          // Agent role name
  context?: string[];     // Task IDs for context
}

export interface Crew {
  id?: string;
  name: string;
  description: string;
  agents: CrewAgent[];
  tasks: CrewTask[];
  process?: "sequential" | "hierarchical";
  verbose?: boolean;
}

export interface CrewRun {
  id: string;
  crewId: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  completedAt?: string;
  result?: string;
  tokenUsage?: { total: number; prompt: number; completion: number };
}

// ── API Calls ─────────────────────────────────────────────────────────────────

export async function createCrew(crew: Crew): Promise<Crew> {
  const res = await fetch(`${CREWAI_BASE}/crews`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(crew),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CrewAI create failed: ${err.slice(0, 200)}`);
  }
  return res.json();
}

export async function listCrews(): Promise<Crew[]> {
  const res = await fetch(`${CREWAI_BASE}/crews`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`CrewAI list failed: ${res.status}`);
  const data = await res.json();
  return data.crews || data.items || [];
}

export async function runCrew(crewId: string, inputs?: Record<string, any>): Promise<CrewRun> {
  const res = await fetch(`${CREWAI_BASE}/crews/${crewId}/runs`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ inputs: inputs || {} }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`CrewAI run failed: ${err.slice(0, 200)}`);
  }
  return res.json();
}

export async function getRunStatus(runId: string): Promise<CrewRun> {
  const res = await fetch(`${CREWAI_BASE}/runs/${runId}`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`CrewAI status failed: ${res.status}`);
  return res.json();
}

export async function listRuns(crewId: string): Promise<CrewRun[]> {
  const res = await fetch(`${CREWAI_BASE}/crews/${crewId}/runs`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error(`CrewAI runs list failed: ${res.status}`);
  const data = await res.json();
  return data.runs || data.items || [];
}

export async function ping(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${CREWAI_BASE}/crews?limit=1`, {
      headers: headers(),
    });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

// ── Pre-built Crew Templates ──────────────────────────────────────────────────

export const CREW_TEMPLATES: Record<string, Crew> = {
  sales_outreach: {
    name: "Sales Outreach Crew",
    description: "Scout → Qualify → Outreach sequence",
    process: "sequential",
    agents: [
      {
        role: "Lead Scout",
        goal: "Find high-value B2B prospects in target markets",
        backstory: "Expert market researcher with deep knowledge of SaaS and technology sectors",
        tools: ["web_search"],
        allowDelegation: false,
      },
      {
        role: "Lead Qualifier",
        goal: "Score and qualify leads on ICP fit and revenue potential",
        backstory: "Experienced B2B sales strategist who can quickly assess company fit",
        tools: ["web_search"],
        allowDelegation: false,
      },
      {
        role: "Outreach Specialist",
        goal: "Draft personalized outreach emails for qualified leads",
        backstory: "Senior SDR who writes compelling, concise cold emails that get responses",
        tools: ["gmail"],
        allowDelegation: false,
      },
    ],
    tasks: [
      {
        description: "Research and identify 5 B2B SaaS companies with 50-200 employees in growing markets",
        expectedOutput: "A list of 5 companies with name, website, industry, and why they're a good target",
        agent: "Lead Scout",
      },
      {
        description: "Score each lead on ICP fit (0-100). Evaluate market position, growth signals, and outreach readiness",
        expectedOutput: "Scored leads with ICP score, risk level, and recommended approach",
        agent: "Lead Qualifier",
      },
      {
        description: "Draft a personalized 3-sentence outreach email for each qualified lead (score > 60)",
        expectedOutput: "Personalized outreach emails with subject lines for each qualified lead",
        agent: "Outreach Specialist",
      },
    ],
  },
  content_pipeline: {
    name: "Content Pipeline Crew",
    description: "Research → Draft → Review → Publish",
    process: "sequential",
    agents: [
      {
        role: "Topic Researcher",
        goal: "Find trending topics and keywords in the target industry",
        backstory: "SEO and content strategist who identifies high-impact content opportunities",
        tools: ["web_search"],
        allowDelegation: false,
      },
      {
        role: "Content Writer",
        goal: "Write engaging, SEO-optimized blog posts and social content",
        backstory: "Professional copywriter with expertise in B2B SaaS content marketing",
        tools: ["web_search", "notion"],
        allowDelegation: false,
      },
      {
        role: "Editor",
        goal: "Review content for quality, tone, and accuracy before publishing",
        backstory: "Senior editor ensuring all content meets brand standards and is publication-ready",
        tools: ["notion"],
        allowDelegation: false,
      },
    ],
    tasks: [
      {
        description: "Research 3 trending topics in AI automation for the current week",
        expectedOutput: "3 topic ideas with target keywords, search volume estimates, and content angles",
        agent: "Topic Researcher",
      },
      {
        description: "Write a 500-word blog post on the highest-potential topic",
        expectedOutput: "A complete blog post with headline, subheadings, and call to action",
        agent: "Content Writer",
      },
      {
        description: "Review the blog post for quality, grammar, tone, and SEO optimization",
        expectedOutput: "Reviewed content with edit suggestions and a final approval status",
        agent: "Editor",
      },
    ],
  },
};
