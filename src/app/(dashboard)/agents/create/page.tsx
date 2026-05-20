"use client";
import { useState } from "react";
import { ArrowLeft, Cpu, Zap, Shield, Brain, Send, Loader2, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";

const AUTONOMY_LEVELS = [
  { key: "permissive", label: "Permissive", desc: "Agent acts freely. Notified after execution.", icon: <Zap className="w-4 h-4" />, color: "#06b6d4" },
  { key: "balanced", label: "Balanced", desc: "Auto for routine, notify for medium-risk.", icon: <Shield className="w-4 h-4" />, color: "#d4a853" },
  { key: "strict", label: "Strict", desc: "Pauses for approval on most actions.", icon: <Brain className="w-4 h-4" />, color: "#ef4444" },
];

const TOOLS = [
  "web_search", "gmail", "slack", "github", "supabase", "stripe",
  "hubspot", "notion", "google_calendar", "salesforce", "jira", "twitter",
];

const TEMPLATES: Record<string, { systemPrompt: string; suggestedTools: string[] }> = {
  revenue_scout: {
    systemPrompt: "You are an autonomous revenue agent. Find high-value B2B SaaS opportunities, score them on ICP fit (0-100), and prepare personalized outreach messages. Be concise and data-driven.",
    suggestedTools: ["gmail", "web_search", "hubspot"],
  },
  support_agent: {
    systemPrompt: "You are an autonomous customer support agent. Classify tickets by urgency, search for solutions, respond helpfully, and escalate when needed. Be empathetic and solution-oriented.",
    suggestedTools: ["gmail", "slack", "notion"],
  },
  content_engine: {
    systemPrompt: "You are an autonomous content creation agent. Research topics, generate blog posts and social media content, adapt to brand voice, and schedule publishing.",
    suggestedTools: ["slack", "notion", "web_search"],
  },
  data_analyst: {
    systemPrompt: "You are an autonomous data analyst. Query databases, find trends and anomalies, generate reports with actionable insights. Be precise and always include the 'so what'.",
    suggestedTools: ["supabase", "slack", "notion"],
  },
  compliance_monitor: {
    systemPrompt: "You are an autonomous compliance monitor. Scan systems for regulatory risks, assess severity, generate reports and alerts. Be thorough and cite specific regulations.",
    suggestedTools: ["web_search", "gmail", "notion"],
  },
};

export default function CreateAgentPage() {
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("revenue_scout");
  const [autonomy, setAutonomy] = useState("balanced");
  const [selectedTools, setSelectedTools] = useState<string[]>(["web_search"]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [task, setTask] = useState("");

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const toggleTool = (tool: string) => {
    setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]);
  };

  const selectTemplate = (key: string) => {
    setTemplate(key);
    const tmpl = TEMPLATES[key];
    if (tmpl) {
      setSystemPrompt(tmpl.systemPrompt);
      setSelectedTools(tmpl.suggestedTools);
    }
  };

  const handleDeploy = async () => {
    if (!task.trim()) {
      setError("Please enter a task for your agent to execute.");
      return;
    }
    setExecuting(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "execute",
          name: name || "Custom Agent",
          template,
          autonomy,
          tools: selectedTools,
          task: task.trim(),
          systemPrompt: systemPrompt || TEMPLATES[template]?.systemPrompt,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to execute agent");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/agents" className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to agents
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Create Agent</h1>
        <p className="text-slate-400 mt-1">Configure and deploy your autonomous AI worker</p>
      </div>

      {/* Template */}
      <div className="card-glass p-6 space-y-4">
        <label className="text-sm font-semibold text-white">Template</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => (
            <button
              key={key}
              onClick={() => selectTemplate(key)}
              className="p-3 rounded-xl text-left text-xs transition-all"
              style={{
                background: template === key ? "rgba(212,168,83,0.1)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${template === key ? "rgba(212,168,83,0.4)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <span className="font-semibold text-white block mb-0.5">
                {key.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
              </span>
              <span className="text-[10px] text-slate-500">
                {tmpl.suggestedTools.length} tools
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="card-glass p-6 space-y-3">
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
          <label className="text-sm font-semibold text-white">Tools</label>
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

      {/* Task */}
      <div className="card-glass p-6 space-y-3">
        <label className="text-sm font-semibold text-white">What should your agent do?</label>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          rows={3}
          placeholder="e.g., Find 5 SaaS companies in AI automation with under 100 employees, score them, and draft outreach emails..."
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30 resize-none"
        />
      </div>

      {/* System Prompt */}
      <div className="card-glass p-6 space-y-3">
        <label className="text-sm font-semibold text-white">System Prompt</label>
        <p className="text-xs text-slate-500">Instructions defining agent behavior (pre-filled from template)</p>
        <textarea
          value={systemPrompt}
          onChange={e => setSystemPrompt(e.target.value)}
          rows={4}
          className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30 resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl text-sm flex items-center gap-2" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="card-glass p-6 space-y-3" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-semibold">Agent Executed</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
              {result.result?.provider || "Nous Hermes"}
            </span>
          </div>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
            {result.result?.response || "No response"}
          </div>
        </div>
      )}

      {/* Deploy */}
      <div className="flex items-center justify-between p-6 card-glass">
        <div>
          <p className="text-sm text-white font-semibold">
            {executing ? "Agent executing..." : "Ready to deploy?"}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {executing ? "DeepSeek is processing your task..." : "Enter a task and deploy your agent"}
          </p>
        </div>
        <button
          onClick={handleDeploy}
          disabled={executing || !task.trim()}
          className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {executing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Send className="w-4 h-4" /> Deploy Agent</>
          )}
        </button>
      </div>
    </div>
  );
}
