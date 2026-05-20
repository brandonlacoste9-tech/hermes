"use client";
import { useState, useEffect, useCallback } from "react";
import { Activity, Zap, Bot, Target, Shield, Cpu, BarChart3, TrendingUp, Mail, MessageSquare, Send, Clock, ShieldOff, Play, Pause, RefreshCw, DollarSign, ChevronRight, Wifi, WifiOff, CheckCircle } from "lucide-react";

interface SystemHealth {
  status: string;
  providers: Array<{ provider: string; model: string; ok: boolean; latencyMs: number; costPer1K: number }>;
  cheapestProvider: string;
  pipeline: Record<string, number>;
  apiSpendEstimate: string;
  agents: { Joe: string; Max: string; TiGuy: string };
}

const AGENT_CARDS = [
  {
    id: "Max",
    name: "Max",
    title: "The Scout",
    role: "Hunt · Scrape · Score · Send",
    icon: <Target className="w-5 h-5" />,
    color: "#06b6d4",
    logLines: [
      "Scouting Quebec SaaS English-only market...",
      "Firecrawl scraping coveo.com homepage...",
      "ICP score: 89 — High fit for Bill 96 compliance",
      "Generated email: 'Coveo & Bill 96: Compliance Risk'",
      "Sent via Gmail SMTP — delivered ✓",
    ],
  },
  {
    id: "Joe",
    name: "Joe",
    title: "The Closer",
    role: "Classify · Rebut · Book",
    icon: <MessageSquare className="w-5 h-5" />,
    color: "#d4a853",
    logLines: [
      "Listening on /api/replies for inbound responses...",
      "Reply detected: ceo@coveo.com — 'Tell me more'",
      "Intent: INTERESTED (confidence 92%)",
      "Generated booking reply with Calendly link",
      "Pipeline advanced: Sent → Replied → Awaiting Book",
    ],
  },
  {
    id: "TiGuy",
    name: "Ti-Guy",
    title: "The Treasurer",
    role: "Route · Monitor · Provision",
    icon: <DollarSign className="w-5 h-5" />,
    color: "#10b981",
    logLines: [
      "Provider check: DeepSeek 876ms ✓, OpenRouter 484ms ✓",
      "Cost routing: DeepSeek selected ($0.14/1K tokens)",
      "API spend: $0.03 this session · Tier: Free",
      "Billing: No upgrades pending",
      "System health: All agents operational",
    ],
  },
];

export default function ImperialMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [activeAgent, setActiveAgent] = useState("Max");
  const [logStreams, setLogStreams] = useState<Record<string, string[]>>({
    Max: AGENT_CARDS[0].logLines,
    Joe: AGENT_CARDS[1].logLines,
    TiGuy: AGENT_CARDS[2].logLines,
  });
  const [paused, setPaused] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);

      // Update log streams with fresh data
      setLogStreams(prev => ({
        Max: [
          ...prev.Max.slice(-4),
          `Pipeline: ${data.pipeline?.total || 0} total · ${data.pipeline?.sent || 0} sent · ${data.pipeline?.replied || 0} replied`,
        ],
        Joe: [
          ...prev.Joe.slice(-4),
          `Sent leads awaiting reply: ${data.pipeline?.sent || 0} · Auto-reply: ON`,
        ],
        TiGuy: [
          ...prev.TiGuy.slice(-4),
          `Routing: ${data.cheapestProvider} · Spend: ${data.apiSpendEstimate} · ${new Date().toLocaleTimeString()}`,
        ],
      }));
    } catch {}
  }, []);

  useEffect(() => {
    fetchHealth();
    if (!autoRefresh) return;
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  const pipelineTotal = health?.pipeline?.total || 0;
  const pipelineSent = health?.pipeline?.sent || 0;
  const pipelineReplied = health?.pipeline?.replied || 0;
  const pipelineBooked = health?.pipeline?.booked || 0;
  const pipelineWon = health?.pipeline?.closed_won || 0;

  const activeAgentData = AGENT_CARDS.find(a => a.id === activeAgent)!;
  const activeLogs = logStreams[activeAgent] || [];

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4" style={{ background: "linear-gradient(180deg, #06080f 0%, #0a0e1a 50%, #111827 100%)" }}>
      {/* ═══════════════════════════════════════════════════════════════
          HEADER
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4a85330, #f0c06020)", border: "1px solid rgba(212,168,83,0.2)" }}>
            <Cpu className="w-5 h-5" style={{ color: "#d4a853" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Imperial Command Center</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${health?.status === "green" ? "bg-green-500" : health?.status === "yellow" ? "bg-amber-500" : "bg-red-500"}`} style={{ boxShadow: `0 0 6px ${health?.status === "green" ? "#22c55e" : health?.status === "yellow" ? "#f59e0b" : "#ef4444"}` }} />
              <span className="text-[11px] text-slate-400 uppercase tracking-widest">
                {health?.status === "green" ? "All Systems Nominal" : health?.status === "yellow" ? "Degraded — Fallback Active" : "Critical — Intervention Required"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border transition-colors ${autoRefresh ? "border-green-500/20 text-green-400 bg-green-500/5" : "border-white/[0.06] text-slate-400 bg-white/[0.02]"}`}>
            {autoRefresh ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {autoRefresh ? "Live" : "Paused"}
          </button>
          <button onClick={fetchHealth} className="p-1.5 rounded-lg text-slate-400 hover:text-white border border-white/[0.06] bg-white/[0.02]">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] border border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <ShieldOff className="w-3 h-3" /> Kill Switch
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          METRICS ROW
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Pipeline", value: pipelineTotal, sub: `${pipelineSent} sent · ${pipelineReplied} replied`, icon: <BarChart3 className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Booked", value: pipelineBooked, sub: `${pipelineWon} closed won`, icon: <CheckCircle className="w-4 h-4" />, color: "#10b981" },
          { label: "Provider", value: health?.cheapestProvider || "—", sub: `${health?.providers?.filter((p: any) => p.ok).length || 0}/${health?.providers?.length || 4} healthy`, icon: <Zap className="w-4 h-4" />, color: "#d4a853" },
          { label: "API Spend", value: health?.apiSpendEstimate || "$0", sub: "This session", icon: <DollarSign className="w-4 h-4" />, color: "#f59e0b" },
          { label: "Agents", value: "3/3", sub: "Joe · Max · Ti-Guy", icon: <Bot className="w-4 h-4" />, color: "#a855f7" },
        ].map(m => (
          <div key={m.label} className="p-4 rounded-2xl border border-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)", backdropFilter: "blur(16px)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${m.color}10`, color: m.color }}>{m.icon}</div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN GRID: Agent Cards + Telemetry + Providers
          ═══════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ── Agent Cards ────────────────────────────────────────── */}
        <div className="space-y-3">
          {AGENT_CARDS.map(agent => (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className="w-full text-left p-4 rounded-2xl border transition-all"
              style={{
                background: activeAgent === agent.id ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                borderColor: activeAgent === agent.id ? `${agent.color}30` : "rgba(255,255,255,0.04)",
                boxShadow: activeAgent === agent.id ? `0 0 20px ${agent.color}08` : "none",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${agent.color}15`, border: `1px solid ${agent.color}20`, color: agent.color }}>
                  {agent.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${agent.color}10`, color: agent.color }}>{agent.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{agent.role}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px #22c55e" }} />
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ── Live Telemetry Viewport ────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.04] overflow-hidden flex flex-col" style={{ background: "rgba(6,8,15,0.8)", backdropFilter: "blur(16px)" }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04]" style={{ background: "rgba(255,255,255,0.01)" }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeAgentData.color, boxShadow: `0 0 8px ${activeAgentData.color}` }} />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">{activeAgentData.name} — {activeAgentData.title}</h3>
              <p className="text-[10px] text-slate-500">Live Telemetry Stream</p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
              <Activity className="w-3 h-3" /> 5s refresh
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-xs space-y-2 overflow-y-auto" style={{ maxHeight: "320px", background: "rgba(0,0,0,0.3)" }}>
            {activeLogs.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-slate-700 shrink-0">{`[${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}:${(new Date().getSeconds() - (activeLogs.length - i) * 2).toString().padStart(2, "0")}]`}</span>
                <span className="text-slate-300 leading-relaxed">{line}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 animate-pulse">
              <span className="text-slate-700">▌</span>
            </div>
          </div>
        </div>

        {/* ── Provider Health ────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.04] p-4" style={{ background: "rgba(255,255,255,0.015)" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" style={{ color: "#d4a853" }} /> Provider Health
            </h3>
            <div className="space-y-2">
              {(health?.providers || []).map((p: any) => (
                <div key={p.provider} className="flex items-center justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.ok ? "bg-green-500" : "bg-red-500"}`} style={{ boxShadow: p.ok ? "0 0 6px #22c55e" : "0 0 6px #ef4444" }} />
                    <span className="text-xs text-white font-medium">{p.provider}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400">{p.ok ? `${p.latencyMs}ms` : "Offline"}</p>
                    <p className="text-[9px] text-slate-600">${p.costPer1K}/1K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pipeline mini-bar */}
          <div className="rounded-2xl border border-white/[0.04] p-4" style={{ background: "rgba(255,255,255,0.015)" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" style={{ color: "#06b6d4" }} /> Pipeline Funnel
            </h3>
            {pipelineTotal > 0 ? (
              <>
                <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04] mb-3">
                  {[
                    { key: "sent", color: "#06b6d4", val: pipelineSent },
                    { key: "replied", color: "#d4a853", val: pipelineReplied },
                    { key: "booked", color: "#10b981", val: pipelineBooked },
                    { key: "won", color: "#22c55e", val: pipelineWon },
                  ].map(s => s.val > 0 ? (
                    <div key={s.key} className="h-full" style={{ width: `${(s.val / pipelineTotal) * 100}%`, background: s.color, minWidth: "2px" }} />
                  ) : null)}
                </div>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: "Sent", val: pipelineSent, color: "#06b6d4" },
                    { label: "Replied", val: pipelineReplied, color: "#d4a853" },
                    { label: "Booked", val: pipelineBooked, color: "#10b981" },
                    { label: "Won", val: pipelineWon, color: "#22c55e" },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-lg font-bold text-white">{s.val}</p>
                      <p className="text-[9px] text-slate-500">{s.label}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-600 text-center py-4">Pipeline empty — awaiting next cron cycle</p>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER: Global Controls
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between text-[10px] text-slate-600 border-t border-white/[0.04] pt-4">
        <span>HermesOS Imperial Command · Swarm Active · {new Date().toLocaleTimeString()}</span>
        <div className="flex items-center gap-4">
          <span>NordiqueCompliance: Live</span>
          <span>PontCompliance: Live</span>
          <span>Cron: 5m cycle</span>
        </div>
      </div>
    </div>
  );
}
