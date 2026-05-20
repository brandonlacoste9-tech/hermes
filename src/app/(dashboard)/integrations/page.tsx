"use client";
import { useState, useEffect } from "react";
import { Cpu, Link, Plug, Check, ExternalLink, RefreshCw, Shield, Lock, Mail, MessageSquare, Database, Calendar, GitBranch, Cloud } from "lucide-react";

const APPS = [
  { name: "gmail", label: "Gmail", desc: "Send and read emails", icon: <Mail className="w-5 h-5" />, color: "#ea4335" },
  { name: "slack", label: "Slack", desc: "Post messages and notifications", icon: <MessageSquare className="w-5 h-5" />, color: "#4a154b" },
  { name: "github", label: "GitHub", desc: "Manage repos and issues", icon: <GitBranch className="w-5 h-5" />, color: "#6e40c9" },
  { name: "supabase", label: "Supabase", desc: "Query databases", icon: <Database className="w-5 h-5" />, color: "#3ecf8e" },
  { name: "google_calendar", label: "Google Calendar", desc: "Schedule and manage events", icon: <Calendar className="w-5 h-5" />, color: "#4285f4" },
  { name: "stripe", label: "Stripe", desc: "Process payments and invoices", icon: <Cloud className="w-5 h-5" />, color: "#635bff" },
  { name: "notion", label: "Notion", desc: "Read and write documents", icon: <Shield className="w-5 h-5" />, color: "#000000" },
  { name: "hubspot", label: "HubSpot", desc: "Manage CRM and deals", icon: <Cpu className="w-5 h-5" />, color: "#ff7a59" },
];

export default function IntegrationsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/composio?action=accounts");
      const data = await res.json();
      if (data.accounts) setAccounts(data.accounts);
    } catch {
      // Composio may not be fully set up yet
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleConnect = async (appName: string) => {
    setConnecting(appName);
    setError("");
    try {
      const res = await fetch("/api/composio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app: appName,
          redirectUrl: window.location.origin + "/integrations",
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else if (data.authUrl) {
        window.open(data.authUrl, "_blank");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setConnecting(null);
    }
  };

  const isConnected = (appName: string) =>
    accounts.some(a => (a.appName || a.app)?.toLowerCase() === appName.toLowerCase() && a.status === "connected");

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-slate-400 mt-1">Connect tools your agents can use</p>
        </div>
        <button onClick={fetchAccounts} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {APPS.map(app => {
          const connected = isConnected(app.name);
          return (
            <div key={app.name} className="card-glass p-5 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${app.color}15`, color: app.color }}>
                  {app.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{app.label}</h3>
                  <p className="text-xs text-slate-400">{app.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleConnect(app.name)}
                disabled={connecting === app.name}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={
                  connected
                    ? { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }
                    : { background: "rgba(212,168,83,0.1)", border: "1px solid rgba(212,168,83,0.3)", color: "#d4a853" }
                }
              >
                {connecting === app.name ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : connected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plug className="w-3.5 h-3.5" />
                )}
                {connected ? "Connected" : "Connect"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="card-glass p-6 text-center">
        <Lock className="w-8 h-8 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-400">Connections are encrypted via Composio. Agents only access tools you authorize.</p>
      </div>
    </div>
  );
}
