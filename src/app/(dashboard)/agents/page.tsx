"use client";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

const TEMPLATES = [
  { name: "Revenue Scout", desc: "Hunts SaaS deals, enriches leads with ICP scoring, fires personalized outreach sequences. Monitors replies and auto-responds.", icon: "🎯", category: "Sales", tools: ["web_search", "gmail_send", "hubspot_crm"], autonomy: "balanced", color: "#d4a853" },
  { name: "Support Agent", desc: "Answers customer tickets, classifies urgency, escalates complex issues. Learns from resolved tickets to improve over time.", icon: "💬", category: "Support", tools: ["gmail_read", "slack_notify", "knowledge_base"], autonomy: "strict", color: "#06b6d4" },
  { name: "Content Engine", desc: "Generates blog posts, social media content, and email campaigns. Rewrites in your brand voice. Schedules posts.", icon: "✍️", category: "Marketing", tools: ["web_search", "slack_post", "notion_write"], autonomy: "permissive", color: "#a855f7" },
  { name: "Data Analyst", desc: "Pulls reports from your database, finds insights, creates visualizations, and sends daily summaries to Slack.", icon: "📊", category: "Analytics", tools: ["postgres_query", "slack_notify", "notion_write"], autonomy: "balanced", color: "#10b981" },
  { name: "Compliance Monitor", desc: "Audits websites for regulatory risks (Bill 96, GDPR), generates compliance reports, and alerts on violations.", icon: "🛡️", category: "Legal", tools: ["web_search", "gmail_send", "pdf_generate"], autonomy: "strict", color: "#ef4444" },
  { name: "Custom Agent", desc: "Build from scratch. Choose your own tools, set autonomy levels, write custom system prompts. Full flexibility.", icon: "⚡", category: "Custom", tools: ["all_tools"], autonomy: "custom", color: "#d4a853" },
];

export default function AgentsPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Templates</h1>
          <p className="text-slate-400 mt-1">Pre-built automations — deploy in one click</p>
        </div>
        <Link href="/agents/create" className="gold-btn px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Agent
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
        <input placeholder="Search templates..." className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(t => (
          <Link key={t.name} href="/agents/create" className="card-glass p-6 hover:border-opacity-60 transition-all group block">
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${t.color}15`, color: t.color }}>{t.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: t.autonomy === "strict" ? "rgba(239,68,68,0.1)" : t.autonomy === "balanced" ? "rgba(212,168,83,0.1)" : "rgba(6,182,212,0.1)", color: t.autonomy === "strict" ? "#ef4444" : t.autonomy === "balanced" ? "#d4a853" : "#06b6d4" }}>
                  {t.autonomy}
                </span>
              </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{t.name}</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">{t.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {t.tools.map(tool => (
                <span key={tool} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/[0.04]">{tool}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
