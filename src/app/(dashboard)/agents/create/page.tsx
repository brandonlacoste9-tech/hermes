"use client";
import { useState } from "react";
import { ArrowLeft, Cpu, Zap, Shield, Brain } from "lucide-react";
import Link from "next/link";

const AUTONOMY_LEVELS = [
  { key: "permissive", label: "Permissive", desc: "Agent acts freely. Notified after execution.", icon: <Zap className="w-4 h-4" />, color: "#06b6d4" },
  { key: "balanced", label: "Balanced", desc: "Auto for routine, notify for medium-risk.", icon: <Shield className="w-4 h-4" />, color: "#d4a853" },
  { key: "strict", label: "Strict", desc: "Pauses for approval on most actions.", icon: <Brain className="w-4 h-4" />, color: "#ef4444" },
];

const TOOLS = [
  "web_search", "gmail_send", "gmail_read", "slack_notify", "slack_post",
  "hubspot_crm", "stripe_invoice", "postgres_query", "notion_write",
  "pdf_generate", "google_calendar", "github_api",
];

export default function CreateAgentPage() {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("custom");
  const [autonomy, setAutonomy] = useState("balanced");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      <Link href="/agents" className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to agents
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Create Agent</h1>
        <p className="text-slate-400 mt-1">Configure your autonomous AI worker</p>
      </div>

      {/* Name */}
      <div className="card-glass p-6 space-y-4">
        <label className="text-sm font-semibold text-white">Agent Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Revenue Scout — North America"
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30"
        />
      </div>

      {/* Autonomy */}
      <div className="card-glass p-6 space-y-4">
        <label className="text-sm font-semibold text-white">Autonomy Level</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {AUTONOMY_LEVELS.map(l => (
            <button
              key={l.key}
              onClick={() => setAutonomy(l.key)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: autonomy === l.key ? `${l.color}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${autonomy === l.key ? `${l.color}40` : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: l.color }}>
                {l.icon}
                <span className="text-sm font-semibold text-white">{l.label}</span>
              </div>
              <p className="text-xs text-slate-400">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="card-glass p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white">Tools & Integrations</label>
          <span className="text-[10px] text-slate-500">{selectedTools.length} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOOLS.map(tool => {
            const active = selectedTools.includes(tool);
            return (
              <button
                key={tool}
                onClick={() => toggleTool(tool)}
                className="text-xs px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: active ? "rgba(212,168,83,0.1)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${active ? "rgba(212,168,83,0.3)" : "rgba(255,255,255,0.06)"}`,
                  color: active ? "#d4a853" : "#94a3b8",
                }}
              >
                {tool}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Prompt */}
      <div className="card-glass p-6 space-y-4">
        <label className="text-sm font-semibold text-white">System Prompt</label>
        <p className="text-xs text-slate-500">Instructions that define how your agent behaves</p>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          rows={6}
          placeholder="You are an autonomous revenue agent. Your mission: hunt for SaaS lifetime deals, enrich leads with ICP scoring, and fire personalized outreach sequences..."
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30 resize-none"
        />
      </div>

      {/* Deploy */}
      <div className="flex items-center justify-between p-6 card-glass">
        <div>
          <p className="text-sm text-white font-semibold">Ready to deploy?</p>
          <p className="text-xs text-slate-400 mt-0.5">Your agent will be available in the fleet dashboard</p>
        </div>
        <button className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Deploy Agent
        </button>
      </div>
    </div>
  );
}
