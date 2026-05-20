"use client";
import { useState } from "react";
import { Users, Play, ArrowRight, Zap, Brain, Target, PenTool, Mail, CheckCircle, Clock, User, Sparkles } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  {
    id: "sales_outreach",
    name: "Sales Outreach Crew",
    desc: "Scout → Qualify → Outreach. 3 agents working in sequence to find and contact prospects.",
    agents: [
      { role: "Lead Scout", icon: <Target className="w-3 h-3" />, color: "#d4a853" },
      { role: "Lead Qualifier", icon: <Brain className="w-3 h-3" />, color: "#06b6d4" },
      { role: "Outreach Specialist", icon: <Mail className="w-3 h-3" />, color: "#a855f7" },
    ],
    steps: ["Research 5 B2B SaaS prospects", "Score leads on ICP fit (0-100)", "Draft personalized outreach emails"],
  },
  {
    id: "content_pipeline",
    name: "Content Pipeline Crew",
    desc: "Research → Draft → Review. 3 agents producing publication-ready content.",
    agents: [
      { role: "Topic Researcher", icon: <Zap className="w-3 h-3" />, color: "#06b6d4" },
      { role: "Content Writer", icon: <PenTool className="w-3 h-3" />, color: "#d4a853" },
      { role: "Editor", icon: <CheckCircle className="w-3 h-3" />, color: "#10b981" },
    ],
    steps: ["Find trending topics + keywords", "Write 500-word blog post", "Review for quality and tone"],
  },
];

export default function CrewsPage() {
  const [deploying, setDeploying] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleDeploy = async (templateId: string) => {
    setDeploying(templateId);
    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", template: templateId }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setDeploying(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Agent Crews</h1>
        <p className="text-slate-400 mt-1">Multi-agent teams that collaborate on complex workflows</p>
      </div>

      <div className="card-glass p-5 flex items-center gap-3" style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.05), rgba(212,168,83,0.05))", borderColor: "rgba(168,85,247,0.15)" }}>
        <Users className="w-5 h-5" style={{ color: "#a855f7" }} />
        <div>
          <p className="text-sm text-white font-semibold">Powered by CrewAI</p>
          <p className="text-xs text-slate-400">Agents collaborate, delegate, and pass context between tasks</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
          2 templates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATES.map(tmpl => (
          <div key={tmpl.id} className="card-glass p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{tmpl.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{tmpl.desc}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-500 border border-white/[0.04]">
                sequential
              </span>
            </div>

            {/* Agent pipeline */}
            <div className="space-y-2 mb-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Agents</p>
              <div className="flex items-center gap-1.5">
                {tmpl.agents.map((agent, i) => (
                  <div key={agent.role} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                      <span style={{ color: agent.color }}>{agent.icon}</span>
                      <span className="text-[10px] text-white font-medium">{agent.role}</span>
                    </div>
                    {i < tmpl.agents.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2 mb-6 flex-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Workflow</p>
              {tmpl.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 mt-0.5" style={{ background: "rgba(212,168,83,0.15)", color: "#d4a853" }}>
                    {i + 1}
                  </span>
                  <span className="text-slate-400">{step}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleDeploy(tmpl.id)}
              disabled={deploying === tmpl.id}
              className="w-full gold-btn py-2.5 rounded-xl text-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deploying === tmpl.id ? (
                <><Clock className="w-4 h-4 animate-spin" /> Deploying Crew...</>
              ) : (
                <><Play className="w-4 h-4" /> Deploy Crew</>
              )}
            </button>
          </div>
        ))}
      </div>

      {result && (
        <div className="card-glass p-5" style={{ borderColor: result.error ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" style={{ color: result.error ? "#f87171" : "#34d399" }} />
            <span className="text-sm font-semibold text-white">
              {result.error ? "Deployment Failed" : "Crew Created"}
            </span>
          </div>
          <pre className="text-xs text-slate-400 overflow-auto max-h-40">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="card-glass p-5 text-center">
        <Users className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Crews scale your automation. Each agent has a specific role, tools, and goal — they collaborate on complex tasks no single agent could handle alone.</p>
      </div>
    </div>
  );
}
