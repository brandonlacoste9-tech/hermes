"use client";
import { Activity, Brain, Cpu, TrendingUp, Clock } from "lucide-react";

const MOCK_AGENTS = [
  { name: "Revenue Scout — NA", status: "idle", lastRun: "Never", runs: 0, heuristics: 0, cost: "$0.00", color: "#d4a853" },
  { name: "Support Agent — Main", status: "offline", lastRun: "Never", runs: 0, heuristics: 0, cost: "$0.00", color: "#06b6d4" },
  { name: "Content Engine — Blog", status: "offline", lastRun: "Never", runs: 0, heuristics: 0, cost: "$0.00", color: "#a855f7" },
];

export default function MonitorPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Fleet Monitor</h1>
        <p className="text-slate-400 mt-1">Real-time view of your autonomous workforce</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Online", value: "0 / 3", icon: <Cpu className="w-4 h-4" />, color: "#10b981" },
          { label: "Total Runs", value: "0", icon: <Activity className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Heuristics", value: "0", icon: <Brain className="w-4 h-4" />, color: "#a855f7" },
          { label: "Cost Today", value: "$0.00", icon: <TrendingUp className="w-4 h-4" />, color: "#d4a853" },
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

      {/* Agent list */}
      <div className="space-y-2">
        {MOCK_AGENTS.map(agent => (
          <div key={agent.name} className="card-glass p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${agent.color}10`, border: `1px solid ${agent.color}20` }}>
                  <Cpu className="w-5 h-5" style={{ color: agent.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{agent.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3" /> Last run: {agent.lastRun}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Runs</p>
                  <p className="text-sm font-semibold text-white">{agent.runs}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Learned</p>
                  <p className="text-sm font-semibold text-white">{agent.heuristics}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Cost</p>
                  <p className="text-sm font-semibold text-white">{agent.cost}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${
                  agent.status === "idle" ? "text-[#d4a853] bg-[#d4a853]/10 border border-[#d4a853]/20" :
                  agent.status === "running" ? "text-green-400 bg-green-500/10 border border-green-500/20" :
                  "text-slate-600 bg-white/[0.02] border border-white/[0.04]"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    agent.status === "idle" ? "bg-[#d4a853] animate-pulse-dot" :
                    agent.status === "running" ? "bg-green-500 animate-pulse-dot" :
                    "bg-slate-600"
                  }`} />
                  {agent.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {MOCK_AGENTS.length === 0 && (
        <div className="card-glass p-12 text-center">
          <Cpu className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No agents deployed</h3>
          <p className="text-slate-400 text-sm">Create your first agent to see it here in real-time.</p>
        </div>
      )}
    </div>
  );
}
