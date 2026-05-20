"use client";
import { Cpu, Zap, Activity, Brain, TrendingUp, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  { name: "Revenue Scout", desc: "Hunts deals, enriches leads, fires outreach sequences", icon: "🎯", category: "Sales", status: "Popular", color: "#d4a853" },
  { name: "Support Agent", desc: "Answers tickets, escalates complex issues to humans", icon: "💬", category: "Support", status: "Available", color: "#06b6d4" },
  { name: "Content Engine", desc: "Generates blog posts, social media, email campaigns", icon: "✍️", category: "Marketing", status: "Available", color: "#a855f7" },
  { name: "Data Analyst", desc: "Pulls reports, finds insights, sends summaries", icon: "📊", category: "Analytics", status: "Available", color: "#10b981" },
  { name: "Compliance Monitor", desc: "Audits websites, flags regulatory risks, generates reports", icon: "🛡️", category: "Legal", status: "Beta", color: "#ef4444" },
  { name: "Custom Agent", desc: "Build your own with tools, memory, and autonomy controls", icon: "⚡", category: "Custom", status: "Build", color: "#d4a853" },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Deploy and manage your autonomous AI workers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Agents", value: "0", icon: <Cpu className="w-4 h-4" />, color: "#d4a853" },
          { label: "Total Runs", value: "0", icon: <Zap className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Heuristics", value: "0", icon: <Brain className="w-4 h-4" />, color: "#a855f7" },
          { label: "Cost MTD", value: "$0.00", icon: <TrendingUp className="w-4 h-4" />, color: "#10b981" },
        ].map(s => (
          <div key={s.label} className="card-glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div className="card-glass p-8 text-center" style={{ borderColor: "rgba(212,168,83,0.15)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.2)" }}>
          <Cpu className="w-8 h-8" style={{ color: "#d4a853" }} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Deploy your first agent</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">Pick a template, connect your tools, set your autonomy level, and let HermesOS handle the rest.</p>
        <Link href="/agents/create" className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Agent
        </Link>
      </div>

      {/* Templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Agent Templates</h2>
          <Link href="/agents" className="text-sm text-[#d4a853] hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TEMPLATES.map(t => (
            <Link key={t.name} href="/agents/create" className="card-glass p-5 hover:border-opacity-60 transition-all group block">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{t.icon}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
                  {t.status}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-1">{t.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
              <div className="mt-3 text-[10px] text-slate-500 uppercase tracking-wider">{t.category}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
