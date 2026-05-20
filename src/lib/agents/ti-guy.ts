/**
 * Ti-Guy — The Treasurer & Builder Agent
 * 
 * Monitors API costs, routes providers, manages billing tiers,
 * provisions features on upgrade. Runs in background.
 */

import { ping as pingProvider, PROVIDERS, ProviderKey } from "@/lib/hermes/ai";
import { getPipelineStats } from "@/lib/campaigns/store";

// ── Provider Health & Cost Routing ─────────────────────────────────────────

export interface ProviderHealth {
  provider: string;
  model: string;
  ok: boolean;
  latencyMs: number;
  costPer1K: number; // approximate
  lastCheck: string;
}

const providerCosts: Record<string, number> = {
  deepseek: 0.14,
  "nous-hermes": 0.00, // free tier
  openai: 2.00,
  openrouter: 0.50,
};

let healthCache: ProviderHealth[] = [];
let lastHealthCheck = 0;

export async function checkProviderHealth(): Promise<ProviderHealth[]> {
  const now = Date.now();
  if (now - lastHealthCheck < 30000 && healthCache.length > 0) return healthCache;

  const results: ProviderHealth[] = [];
  for (const [key, cfg] of Object.entries(PROVIDERS)) {
    try {
      const health = await pingProvider(key as ProviderKey);
      results.push({
        provider: cfg.name,
        model: health.model || cfg.model,
        ok: health.ok,
        latencyMs: health.latencyMs || 0,
        costPer1K: providerCosts[key] || 0.50,
        lastCheck: new Date().toISOString(),
      });
    } catch {
      results.push({
        provider: cfg.name,
        model: cfg.model,
        ok: false,
        latencyMs: 0,
        costPer1K: providerCosts[key] || 0.50,
        lastCheck: new Date().toISOString(),
      });
    }
  }

  healthCache = results;
  lastHealthCheck = now;
  return results;
}

export function getBestProvider(): ProviderKey {
  const healthy = healthCache.filter(h => h.ok);
  if (healthy.length === 0) return "deepseek";
  
  // Route to cheapest healthy provider
  const cheapest = healthy.reduce((best, curr) => 
    curr.costPer1K < best.costPer1K ? curr : best
  );
  
  const entry = Object.entries(PROVIDERS).find(([_, v]) => v.name === cheapest.provider);
  return (entry?.[0] || "deepseek") as ProviderKey;
}

// ── Billing Tier Management ────────────────────────────────────────────────

export interface BillingTier {
  name: string;
  price: number;
  features: string[];
  limits: { agents: number; emailsPerDay: number; autonomy: string };
}

export const BILLING_TIERS: Record<string, BillingTier> = {
  free: {
    name: "Starter",
    price: 0,
    features: ["2 agents", "50 emails/day", "Basic autonomy"],
    limits: { agents: 2, emailsPerDay: 50, autonomy: "notify" },
  },
  pro: {
    name: "Pro",
    price: 49,
    features: ["10 agents", "Unlimited emails", "Full autonomy", "Custom tools", "Priority support"],
    limits: { agents: 10, emailsPerDay: 9999, autonomy: "auto" },
  },
  enterprise: {
    name: "Enterprise",
    price: 299,
    features: ["Unlimited agents", "White-label", "Custom integrations", "Dedicated support", "SLA"],
    limits: { agents: 999, emailsPerDay: 99999, autonomy: "full_auto" },
  },
};

export async function getSystemHealth() {
  const providers = await checkProviderHealth();
  const pipeline = await getPipelineStats();
  
  const allHealthy = providers.every(p => p.ok);
  const cheapestProvider = getBestProvider();

  return {
    status: allHealthy ? "green" : providers.some(p => p.ok) ? "yellow" : "red",
    providers,
    cheapestProvider,
    pipeline,
    apiSpendEstimate: calculateSpend(pipeline.total || 0),
    lastHealthCheck: new Date(lastHealthCheck).toISOString(),
  };
}

function calculateSpend(leadCount: number): string {
  // Rough estimate: ~$0.005 per lead (scout + score + generate)
  const estimated = (leadCount * 0.005).toFixed(2);
  return `$${estimated}`;
}
