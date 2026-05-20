"use client";
import { CreditCard, Check, ArrowRight, Cpu } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    desc: "For trying out HermesOS",
    agents: 2,
    runs: "50 runs/mo",
    tools: "3 tools",
    features: ["2 active agents", "50 agent runs per month", "3 tool integrations", "Community support", "7-day memory window"],
    popular: false,
    color: "#64748b",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    desc: "For serious automation",
    agents: 10,
    runs: "Unlimited runs",
    tools: "All tools",
    features: ["10 active agents", "Unlimited runs", "All tool integrations", "Custom system prompts", "90-day memory window", "Priority support", "Fleet dashboard"],
    popular: true,
    color: "#d4a853",
  },
  {
    name: "Enterprise",
    price: "$299",
    period: "/month",
    desc: "For teams and agencies",
    agents: "Unlimited",
    runs: "Unlimited runs",
    tools: "All tools + custom",
    features: ["Unlimited agents", "Unlimited runs", "All integrations + custom tools", "White-label option", "Full memory persistence", "Dedicated support", "SLA guarantee", "Team accounts"],
    popular: false,
    color: "#a855f7",
  },
];

export default function BillingPage() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 mt-1">Choose the plan that fits your automation needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <div
            key={plan.name}
            className="card-glass p-6 relative flex flex-col"
            style={plan.popular ? { borderColor: "rgba(212,168,83,0.3)", boxShadow: "0 0 40px rgba(212,168,83,0.08)" } : {}}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 gold-btn text-[10px] font-bold px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-slate-400">{plan.period}</span>
            </div>

            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4" style={{ color: plan.color }} />
                <span className="text-white font-medium">{plan.agents}</span>
                <span className="text-slate-500 text-xs">agents</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4" style={{ color: plan.color }} />
                <span className="text-white font-medium">{plan.runs}</span>
              </div>
            </div>

            <div className="space-y-2 mb-8 flex-1">
              {plan.features.map(f => (
                <div key={f} className="flex items-start gap-2 text-xs">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} />
                  <span className="text-slate-400">{f}</span>
                </div>
              ))}
            </div>

            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={plan.popular ? {
                background: "linear-gradient(135deg, #d4a853, #f0c060)",
                color: "#06080f",
              } : {
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#e2e8f0",
              }}
            >
              {plan.price === "Free" ? "Get Started" : "Subscribe"} <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        ))}
      </div>

      <div className="card-glass p-6 text-center">
        <p className="text-sm text-slate-400">All plans include the HermesOS AI engine powered by DeepSeek. Cancel anytime.</p>
      </div>
    </div>
  );
}
