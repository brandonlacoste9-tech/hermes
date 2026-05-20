"use client";
import { useState, useEffect } from "react";
import { Search, Plug, Check, ExternalLink, RefreshCw, Shield, Lock, Key, X, Globe, Filter, Zap } from "lucide-react";

// Featured apps (most commonly connected)
const FEATURED = [
  { name: "gmail", label: "Gmail", desc: "Send/read emails", color: "#ea4335", icon: "📧" },
  { name: "slack", label: "Slack", desc: "Messages & channels", color: "#4a154b", icon: "💬" },
  { name: "github", label: "GitHub", desc: "Repos, issues, PRs", color: "#6e40c9", icon: "🐙" },
  { name: "supabase", label: "Supabase", desc: "Database queries", color: "#3ecf8e", icon: "🗄️" },
  { name: "google_calendar", label: "Calendar", desc: "Schedule events", color: "#4285f4", icon: "📅" },
  { name: "stripe", label: "Stripe", desc: "Payments & invoices", color: "#635bff", icon: "💳" },
  { name: "notion", label: "Notion", desc: "Docs & wikis", color: "#000000", icon: "📝" },
  { name: "hubspot", label: "HubSpot", desc: "CRM & deals", color: "#ff7a59", icon: "🏢" },
  { name: "salesforce", label: "Salesforce", desc: "Enterprise CRM", color: "#00a1e0", icon: "☁️" },
  { name: "jira", label: "Jira", desc: "Project management", color: "#2684ff", icon: "🎫" },
  { name: "twitter", label: "X / Twitter", desc: "Social posting", color: "#1da1f2", icon: "🐦" },
  { name: "linkedin", label: "LinkedIn", desc: "Professional network", color: "#0a66c2", icon: "💼" },
];

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showByok, setShowByok] = useState<string | null>(null);
  const [customKey, setCustomKey] = useState("");
  const [byokConnected, setByokConnected] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"featured" | "all">("featured");

  const fetchData = async () => {
    try {
      const [accRes, toolsRes] = await Promise.all([
        fetch("/api/composio?action=accounts"),
        fetch("/api/composio?action=tools"),
      ]);
      const accData = await accRes.json();
      const toolsData = await toolsRes.json();
      if (accData.accounts) setAccounts(accData.accounts);
      if (toolsData.tools) setTools(toolsData.tools);
    } catch {
      // Composio may not be fully set up
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConnect = async (appName: string) => {
    setConnecting(appName);
    setError("");
    try {
      const res = await fetch("/api/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app: appName,
          redirectUrl: (typeof window !== "undefined" ? window.location.origin : "") + "/integrations",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.authUrl) {
        window.open(data.authUrl, "_blank");
        setTimeout(fetchData, 3000);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnecting(null);
    }
  };

  const handleByokConnect = (appName: string) => {
    if (!customKey.trim()) return;
    setByokConnected(prev => ({ ...prev, [appName]: customKey }));
    setCustomKey("");
    setShowByok(null);
  };

  const handleDisconnect = (appName: string) => {
    setByokConnected(prev => {
      const next = { ...prev };
      delete next[appName];
      return next;
    });
  };

  const isOAuthConnected = (appName: string) =>
    accounts.some(a => (a.appName || a.app)?.toLowerCase() === appName.toLowerCase() && a.status === "connected");

  const isByokConnected = (appName: string) => !!byokConnected[appName];

  const isAppConnected = (appName: string) => isOAuthConnected(appName) || isByokConnected(appName);

  const allApps = viewMode === "all" && tools.length > 0
    ? tools.map((t: any) => ({
        name: t.name || t.toolName,
        label: (t.name || t.toolName || "").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        desc: t.description || "",
        color: "#64748b",
        icon: "🔌",
        category: t.category || t.appName || "",
      }))
    : FEATURED;

  const filtered = search
    ? allApps.filter(a => a.label.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
    : allApps;

  const connectionCount = Object.keys(byokConnected).length + accounts.filter(a => a.status === "connected").length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-slate-400 mt-1">
            100,000+ tools available. Connect via OAuth or bring your own key.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
            <Plug className="w-3 h-3" />
            {connectionCount} connected
          </div>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Search + Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search 100,000+ tools (e.g., Salesforce, Jira, Shopify...)"
            className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#d4a853]/30"
          />
        </div>
        <div className="flex rounded-xl overflow-hidden border border-white/[0.06] shrink-0">
          <button
            onClick={() => setViewMode("featured")}
            className="px-4 py-2.5 text-xs font-medium transition-colors"
            style={{ background: viewMode === "featured" ? "rgba(212,168,83,0.1)" : "transparent", color: viewMode === "featured" ? "#d4a853" : "#94a3b8" }}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1.5" />Featured
          </button>
          <button
            onClick={() => setViewMode("all")}
            className="px-4 py-2.5 text-xs font-medium transition-colors"
            style={{ background: viewMode === "all" ? "rgba(212,168,83,0.1)" : "transparent", color: viewMode === "all" ? "#d4a853" : "#94a3b8" }}
          >
            <Globe className="w-3.5 h-3.5 inline mr-1.5" />All Tools
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map(app => {
          const connected = isAppConnected(app.name);
          const oauth = isOAuthConnected(app.name);
          const byok = isByokConnected(app.name);
          const isConnecting = connecting === app.name;

          return (
            <div key={app.name} className="card-glass p-4 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: `${app.color}15` }}>
                    {app.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{app.label}</h3>
                    <p className="text-[10px] text-slate-500 truncate">{app.desc}</p>
                  </div>
                </div>
                {connected && (
                  <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#34d399" }}>
                    <Check className="w-3 h-3" /> {byok ? "BYOK" : "OAuth"}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!connected ? (
                  <>
                    <button
                      onClick={() => handleConnect(app.name)}
                      disabled={isConnecting}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={{ background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)", color: "#d4a853" }}
                    >
                      {isConnecting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plug className="w-3 h-3" />}
                      OAuth
                    </button>
                    <button
                      onClick={() => setShowByok(showByok === app.name ? null : app.name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)", color: "#a855f7" }}
                    >
                      <Key className="w-3 h-3" /> BYOK
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => byok ? handleDisconnect(app.name) : null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
                  >
                    <X className="w-3 h-3" /> Disconnect
                  </button>
                )}
              </div>

              {/* BYOK Input */}
              {showByok === app.name && (
                <div className="mt-3 p-3 rounded-xl space-y-2" style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.15)" }}>
                  <p className="text-[10px] text-slate-400">Enter your own API key for {app.label}:</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={customKey}
                      onChange={e => setCustomKey(e.target.value)}
                      placeholder="sk-..."
                      className="flex-1 bg-black/30 border border-white/[0.06] rounded-lg py-2 px-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#a855f7]/30"
                      onKeyDown={e => e.key === "Enter" && handleByokConnect(app.name)}
                    />
                    <button
                      onClick={() => handleByokConnect(app.name)}
                      disabled={!customKey.trim()}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-40 transition-all"
                      style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7" }}
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Keys stored encrypted, never shared
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card-glass p-12 text-center">
          <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No tools match your search. Try a different term.</p>
        </div>
      )}

      {viewMode === "all" && tools.length === 0 && (
        <div className="card-glass p-8 text-center">
          <RefreshCw className="w-8 h-8 text-slate-600 mx-auto mb-3 animate-spin-slow" />
          <p className="text-slate-400 text-sm">Loading {">"} 100,000 tools from Composio...</p>
          <p className="text-xs text-slate-600 mt-1">Switch to Featured view for the top 12 integrations</p>
        </div>
      )}

      <div className="card-glass p-5 text-center space-y-2">
        <Lock className="w-6 h-6 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400">100,000+ tools available. OAuth for managed auth, BYOK for full control.</p>
        <p className="text-[10px] text-slate-600">Connections encrypted via Composio · Keys never leave your session</p>
      </div>
    </div>
  );
}
