/**
 * Hermes AI Client — Multi-provider LLM interface.
 *
 * Providers:
 *   deepseek    — DeepSeek API (default)
 *   nous-hermes — Nous Research Hermes via OpenRouter
 *   openai      — OpenAI API
 *   custom      — Any OpenAI-compatible endpoint
 */

// ── Provider Configs ─────────────────────────────────────────────────────────

export const PROVIDERS = {
  deepseek: {
    name: "DeepSeek",
    baseUrl: process.env.HERMES_BASE_URL || "https://api.deepseek.com/v1",
    apiKey: process.env.DEEPSEEK_API_KEY || "",
    model: process.env.HERMES_MODEL || "deepseek-chat",
    color: "#4f46e5",
  },
  "nous-hermes": {
    name: "Nous Hermes",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || process.env.NOUS_HERMES_API_KEY || "",
    model: "nousresearch/hermes-3-llama-3.1-405b:free",
    color: "#a855f7",
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "HermesOS",
    },
  },
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY || "",
    model: "gpt-4o",
    color: "#10b981",
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY || "",
    model: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
    color: "#06b6d4",
  },
};

export type ProviderKey = keyof typeof PROVIDERS;

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json_object";
}

// ── Core Client ──────────────────────────────────────────────────────────────

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
  provider: ProviderKey = "deepseek"
): Promise<string> {
  const cfg = PROVIDERS[provider];
  if (!cfg.apiKey) throw new Error(`${cfg.name} API key not configured`);

  const { temperature = 0.7, maxTokens = 2048, responseFormat } = options;

  const payload: any = {
    model: cfg.model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (responseFormat === "json_object") {
    payload.response_format = { type: "json_object" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cfg.apiKey}`,
    ...(cfg.headers || {}),
  };

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${cfg.name} error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function chatJSON(
  messages: ChatMessage[],
  options: ChatOptions = {},
  provider: ProviderKey = "deepseek"
): Promise<any> {
  const text = await chat(messages, { ...options, responseFormat: "json_object" }, provider);
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ── Ping ─────────────────────────────────────────────────────────────────────

export async function ping(provider: ProviderKey = "deepseek"): Promise<{
  ok: boolean; provider: string; model: string; latencyMs: number;
}> {
  const start = Date.now();
  const cfg = PROVIDERS[provider];
  try {
    const text = await chat(
      [{ role: "user", content: "Say PONG" }],
      { maxTokens: 10, temperature: 0 },
      provider
    );
    return { ok: true, provider: cfg.name, model: cfg.model, latencyMs: Date.now() - start };
  } catch (e: any) {
    return { ok: false, provider: cfg.name, model: cfg.model, latencyMs: Date.now() - start };
  }
}

// ── Agent Execution ──────────────────────────────────────────────────────────

export async function executeAgent(
  systemPrompt: string,
  task: string,
  tools: string[],
  autonomy: "permissive" | "balanced" | "strict",
  provider: ProviderKey = "deepseek"
): Promise<{
  response: string;
  actions: { tool: string; reasoning: string }[];
  autonomyLevel: string;
  provider: string;
  model: string;
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

  const result = await chatJSON(messages, { temperature: 0.7, maxTokens: 2048 }, provider);

  return {
    response: result.response || result.raw || "Task processed.",
    actions: result.actions || [],
    autonomyLevel: autonomy,
    provider: PROVIDERS[provider].name,
    model: PROVIDERS[provider].model,
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
