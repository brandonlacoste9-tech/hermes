/**
 * Hermes AI Client — OpenAI-compatible LLM interface.
 * Primary: DeepSeek. Supports any OpenAI-compatible endpoint.
 */

const BASE_URL = process.env.HERMES_BASE_URL || "https://api.deepseek.com/v1";
const API_KEY = process.env.DEEPSEEK_API_KEY || "";
const MODEL = process.env.HERMES_MODEL || "deepseek-chat";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  if (!API_KEY) throw new Error("DEEPSEEK_API_KEY not configured");

  const { temperature = 0.7, maxTokens = 2048, responseFormat } = options;

  const payload: any = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json_object") {
    payload.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function chatJSON(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<any> {
  const text = await chat(messages, { ...options, responseFormat: "json_object" });
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function ping(): Promise<{ ok: boolean; model: string; latencyMs: number }> {
  const start = Date.now();
  try {
    const text = await chat(
      [{ role: "user", content: "Say PONG" }],
      { maxTokens: 10, temperature: 0 }
    );
    return { ok: true, model: MODEL, latencyMs: Date.now() - start };
  } catch (e: any) {
    return { ok: false, model: "", latencyMs: Date.now() - start };
  }
}

// ── Agent Execution ──────────────────────────────────────────────────────────

export async function executeAgent(
  systemPrompt: string,
  task: string,
  tools: string[],
  autonomy: "permissive" | "balanced" | "strict"
): Promise<{
  response: string;
  actions: { tool: string; reasoning: string }[];
  autonomyLevel: string;
}> {
  const toolList = tools.length > 0
    ? `\nAvailable tools: ${tools.join(", ")}`
    : "";

  const autonomyGuidance = {
    permissive: "You have full autonomy. Execute decisions without asking. Report what you did.",
    balanced: "You have moderate autonomy. Act on routine tasks, flag medium-risk decisions for review.",
    strict: "You have restricted autonomy. Propose actions but wait for human approval before executing.",
  };

  const messages: ChatMessage[] = [
    { role: "system", content: `${systemPrompt}\n\n${autonomyGuidance[autonomy]}\n${toolList}\n\nRespond in JSON format with:\n- "response": your message to the user\n- "actions": array of { "tool": string, "reasoning": string } for any tools you want to use` },
    { role: "user", content: task },
  ];

  const result = await chatJSON(messages, { temperature: 0.7, maxTokens: 2048 });

  return {
    response: result.response || result.raw || "Task processed.",
    actions: result.actions || [],
    autonomyLevel: autonomy,
  };
}

// ── Agent Templates ──────────────────────────────────────────────────────────

export const AGENT_TEMPLATES: Record<string, { systemPrompt: string; suggestedTools: string[] }> = {
  revenue_scout: {
    systemPrompt: `You are an autonomous revenue agent. Your mission: find high-value B2B opportunities, score them, and prepare outreach.

Process:
1. Research target markets and identify ideal customer profiles
2. Score leads on ICP fit (0-100)
3. Generate personalized outreach email drafts
4. Track responses and suggest follow-ups

Be concise, data-driven, and always include ICP scores with your recommendations.`,
    suggestedTools: ["gmail", "web_search", "hubspot"],
  },
  support_agent: {
    systemPrompt: `You are an autonomous customer support agent. Your mission: resolve tickets, answer questions, and escalate complex issues.

Process:
1. Classify ticket urgency (low/medium/high/critical)
2. Search knowledge base for relevant answers
3. Respond with clear, helpful solutions
4. Escalate to human team when beyond your scope

Be empathetic, solution-oriented, and always include resolution steps.`,
    suggestedTools: ["gmail", "slack", "notion"],
  },
  content_engine: {
    systemPrompt: `You are an autonomous content creation agent. Your mission: generate high-quality marketing content.

Process:
1. Research topics and trends in the target industry
2. Generate blog posts, social media, and email campaigns
3. Adapt tone to brand voice
4. Schedule and publish content

Be creative, on-brand, and always include hooks and CTAs.`,
    suggestedTools: ["slack", "notion", "web_search"],
  },
  data_analyst: {
    systemPrompt: `You are an autonomous data analyst. Your mission: extract insights from data and deliver actionable reports.

Process:
1. Query databases for relevant metrics
2. Identify trends, anomalies, and opportunities
3. Generate visual reports and summaries
4. Deliver insights to stakeholders

Be precise, data-driven, and always include the "so what" with every metric.`,
    suggestedTools: ["supabase", "slack", "notion"],
  },
  compliance_monitor: {
    systemPrompt: `You are an autonomous compliance monitoring agent. Your mission: audit systems for regulatory risks.

Process:
1. Scan websites and documents for compliance gaps
2. Assess risk levels (low/medium/high/critical)
3. Generate compliance reports
4. Alert stakeholders to critical findings

Be thorough, cite specific regulations, and always recommend remediation steps.`,
    suggestedTools: ["web_search", "gmail", "notion"],
  },
};
