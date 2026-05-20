"use client";
import { useState } from "react";
import { Zap, Play, Activity, Mail, Target, Clock, CheckCircle, XCircle, Loader2, RefreshCw, Send } from "lucide-react";

export default function AutonomyPage() {
  const [niche, setNiche] = useState("Quebec compliance SaaS");
  const [market, setMarket] = useState("Canada");
  const [maxEmails, setMaxEmails] = useState(5);
  const [send, setSend] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/autonomy");
      const data = await res.json();
      setStatus(data);
    } catch {}
    try {
      const res = await fetch("/api/autonomy?action=logs");
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch {}
  };

  const runAutonomy = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/autonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, market, maxEmails, send }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      setResult(data);
      await fetchStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Autonomy Engine</h1>
          <p className="text-slate-400 mt-1">Autonomous lead hunting, scoring, and outreach</p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Runs", value: status?.totalRuns || 0, icon: <Activity className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Emails Sent", value: status?.totalEmailsSent || 0, icon: <Mail className="w-4 h-4" />, color: "#10b981" },
          { label: "AI Status", value: status?.ai?.ok ? `${status.ai.latencyMs}ms` : "Offline", icon: <Zap className="w-4 h-4" />, color: status?.ai?.ok ? "#d4a853" : "#ef4444" },
          { label: "SMTP", value: status?.smtpConfigured ? "Ready" : "Not set", icon: <Send className="w-4 h-4" />, color: status?.smtpConfigured ? "#10b981" : "#ef4444" },
        ].map(s => (
          <div key={s.label} className="card-glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="card-glass p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Target className="w-4 h-4 text-[#d4a853]" /> New Hunt</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Niche</label>
            <input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., Quebec compliance SaaS" className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Market</label>
            <input value={market} onChange={e => setMarket(e.target.value)} placeholder="North America" className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 block">Max Leads</label>
            <input type="number" value={maxEmails} onChange={e => setMaxEmails(parseInt(e.target.value) || 5)} min={1} max={20} className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-[#d4a853]/30" />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-300 w-full">
              <input type="checkbox" checked={send} onChange={e => setSend(e.target.checked)} className="rounded" />
              Send emails
            </label>
          </div>
        </div>
        <button onClick={runAutonomy} disabled={running} className="gold-btn px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2 disabled:opacity-50">
          {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Hunting...</> : <><Play className="w-4 h-4" /> Run Autonomy Loop</>}
        </button>
      </div>

      {error && <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

      {/* Results */}
      {result?.run && (
        <div className="card-glass p-6 space-y-4" style={{ borderColor: "rgba(16,185,129,0.3)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Run Complete</span>
            </div>
            <span className="text-[10px] text-slate-500">{result.run.leadsFound} leads · {result.run.emailsSent} sent</span>
          </div>
          {result.run.results?.map((r: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: r.emailSent ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: r.emailSent ? "#34d399" : "#f87171" }}>
                {r.emailSent ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-semibold">{r.lead.name}</p>
                <p className="text-xs text-slate-400 truncate">{r.lead.website}</p>
                <p className="text-xs text-slate-500 mt-1 truncate">{r.subject}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853" }}>{r.lead.icpScore}</span>
            </div>
          ))}
        </div>
      )}

      {/* Run History */}
      {logs.length > 0 && (
        <div className="card-glass p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Run History</h2>
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] text-xs">
                <span className="text-slate-500 w-20">{new Date(log.startedAt).toLocaleTimeString()}</span>
                <span className="text-white">{log.niche}</span>
                <span className="text-slate-500">{log.leadsFound} leads</span>
                <span className="text-green-400">{log.emailsSent} sent</span>
                {log.errors > 0 && <span className="text-red-400">{log.errors} errors</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
