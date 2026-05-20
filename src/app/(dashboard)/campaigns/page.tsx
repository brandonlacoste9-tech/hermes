"use client";
import { useState, useEffect, useCallback } from "react";
import { BarChart3, TrendingUp, Target, Send, MessageSquare, CheckCircle, XCircle, RefreshCw, Mail, Building2, ExternalLink, Clock } from "lucide-react";

const PIPELINE_STAGES = [
  { key: "hunted", label: "Hunted", icon: <Target className="w-3.5 h-3.5" />, color: "#64748b" },
  { key: "sent", label: "Sent", icon: <Send className="w-3.5 h-3.5" />, color: "#06b6d4" },
  { key: "replied", label: "Replied", icon: <MessageSquare className="w-3.5 h-3.5" />, color: "#d4a853" },
  { key: "booked", label: "Booked", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "#10b981" },
  { key: "closed_won", label: "Won", icon: <CheckCircle className="w-3.5 h-3.5" />, color: "#10b981" },
  { key: "closed_lost", label: "Lost", icon: <XCircle className="w-3.5 h-3.5" />, color: "#ef4444" },
];

export default function CampaignsPage() {
  const [stats, setStats] = useState<any>({});
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/campaigns?action=stats"),
        fetch("/api/campaigns?action=activity"),
      ]);
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      setStats(statsData);
      if (activityData.leads) setLeads(activityData.leads);
    } catch {}
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (leadId: string, status: string) => {
    await fetch(`/api/campaigns?action=update&leadId=${leadId}&status=${status}`);
    fetchData();
  };

  const totalLeads = stats.total || 0;
  const sentPct = totalLeads > 0 ? ((stats.sent || 0) / totalLeads * 100).toFixed(0) : 0;
  const repliedPct = totalLeads > 0 ? ((stats.replied || 0) / totalLeads * 100).toFixed(0) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Campaign Pipeline</h1>
          <p className="text-slate-400 mt-1">Track every lead from hunt to close</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Leads", value: stats.total || 0, icon: <Target className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Sent", value: `${stats.sent || 0} (${sentPct}%)`, icon: <Send className="w-4 h-4" />, color: "#3b82f6" },
          { label: "Replied", value: `${stats.replied || 0} (${repliedPct}%)`, icon: <MessageSquare className="w-4 h-4" />, color: "#d4a853" },
          { label: "Won", value: stats.closed_won || 0, icon: <CheckCircle className="w-4 h-4" />, color: "#10b981" },
        ].map(s => (
          <div key={s.label} className="card-glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}10`, color: s.color }}>{s.icon}</div>
            <div><p className="text-[10px] uppercase text-slate-500">{s.label}</p><p className="text-xl font-bold text-white">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Pipeline Bar */}
      {totalLeads > 0 && (
        <div className="card-glass p-5">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#d4a853]" /> Pipeline</h2>
          <div className="flex h-6 rounded-full overflow-hidden bg-white/[0.04]">
            {["hunted", "sent", "replied", "booked", "closed_won", "closed_lost"].map(stage => {
              const count = stats[stage] || 0;
              if (count === 0) return null;
              const pct = (count / totalLeads) * 100;
              const stageInfo = PIPELINE_STAGES.find(s => s.key === stage);
              return (
                <div key={stage} className="h-full flex items-center justify-center text-[9px] font-bold text-white transition-all" style={{ width: `${pct}%`, background: stageInfo?.color || "#64748b", minWidth: pct > 8 ? "auto" : "2px" }}>
                  {pct > 8 ? count : ""}
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {PIPELINE_STAGES.map(s => (
              <div key={s.key} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-slate-400">{s.label}: {stats[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="card-glass overflow-hidden">
        <div className="p-5 border-b border-white/[0.04]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Mail className="w-4 h-4 text-[#d4a853]" /> All Leads</h2>
        </div>
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <Target className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No leads yet. Run the autonomy engine to start hunting.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.04] text-slate-500">
                  <th className="text-left p-3 font-medium">Company</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Service</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Subject</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium hidden md:table-cell">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => {
                  const stage = PIPELINE_STAGES.find(s => s.key === lead.status);
                  return (
                    <tr key={lead.id} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <div>
                            <p className="text-white font-medium">{lead.company}</p>
                            <a href={`https://${lead.website}`} target="_blank" className="text-[10px] text-slate-500 hover:text-[#06b6d4] flex items-center gap-0.5">
                              {lead.website} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 hidden md:table-cell">{lead.service?.slice(0, 40)}</td>
                      <td className="p-3 text-slate-400 hidden md:table-cell truncate max-w-[200px]">{lead.subject?.slice(0, 50)}</td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ background: `${stage?.color || "#64748b"}15`, color: stage?.color }}>
                          {stage?.icon}{stage?.label || lead.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 hidden md:table-cell">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(lead.huntedAt).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <select
                          value={lead.status}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className="bg-white/[0.04] border border-white/[0.06] rounded-lg py-1 px-2 text-[10px] text-white focus:outline-none"
                        >
                          <option value="hunted">Hunted</option>
                          <option value="sent">Sent</option>
                          <option value="replied">Replied</option>
                          <option value="booked">Booked</option>
                          <option value="closed_won">Won</option>
                          <option value="closed_lost">Lost</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
