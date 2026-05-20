"use client";
import { Globe, ExternalLink, Github, Server, Cpu, Shield, TrendingUp, DollarSign, Activity, Wifi, WifiOff, Users, Video, ShoppingCart, Bot, FileText } from "lucide-react";

const APPS = [
  {
    name: "HermesOS",
    url: "hermes-red-tau.vercel.app",
    repo: "brandonlacoste9-tech/hermes",
    type: "AI Automation SaaS",
    status: "live",
    stack: ["Next.js 16", "DeepSeek", "Supabase", "CrewAI", "Composio"],
    desc: "Autonomous business automation platform. Agents hunt, close, and manage billing.",
    agents: ["Max", "Joe", "Ti-Guy"],
    revenue: "$49–$299/mo",
    icon: <Cpu className="w-5 h-5" />,
    color: "#d4a853",
  },
  {
    name: "Zyeuté",
    url: "zyeute.com",
    repo: "brandonlacoste9-tech/ZyeuteV5",
    type: "Social Media Platform",
    status: "live",
    stack: ["React 19", "Express", "Supabase", "Redis", "Gemini AI"],
    desc: "Quebec's premier social video platform. TikTok-style with Trinity AI engine.",
    agents: ["Ti-Guy (Brain)", "Browser Use (Hands)", "Design System (Soul)"],
    revenue: "Pre-monetization",
    icon: <Video className="w-5 h-5" />,
    color: "#8b5cf6",
  },
  {
    name: "NordiqueCompliance",
    url: "quebec-compliance.vercel.app",
    repo: "brandonlacoste9-tech/quebec-compliance",
    type: "Compliance Firm Landing",
    status: "live",
    stack: ["Next.js 16", "Tailwind 4", "Stripe-ready"],
    desc: "Bill 96 French compliance for English-only SaaS companies.",
    agents: [],
    revenue: "$2,500–$15,000/project",
    icon: <Shield className="w-5 h-5" />,
    color: "#f59e0b",
  },
  {
    name: "PontCompliance",
    url: "pont-compliance.vercel.app",
    repo: "brandonlacoste9-tech/pont-compliance",
    type: "Compliance Firm Landing",
    status: "live",
    stack: ["Next.js 16", "Tailwind 4"],
    desc: "English GTM and localization for Quebec SaaS expanding to US markets.",
    agents: [],
    revenue: "$3,500–$25,000+/project",
    icon: <Globe className="w-5 h-5" />,
    color: "#3b82f6",
  },
  {
    name: "Cyberhound",
    url: "cyberhound-web.vercel.app",
    repo: "brandonlacoste9-tech/Cyberhound",
    type: "AI Sales Swarm",
    status: "deploying",
    stack: ["Next.js", "Python", "Supabase", "Firecrawl"],
    desc: "AI-powered sales automation swarm with 5 specialized hunting hounds.",
    agents: ["SaaSHound", "UpworkHound", "SystemHound"],
    revenue: "Pre-revenue",
    icon: <Bot className="w-5 h-5" />,
    color: "#06b6d4",
  },
  {
    name: "StaffX",
    url: "digital-employee-blueprint.vercel.app",
    repo: "brandonlacoste9-tech/digital-employee-blueprint",
    type: "Digital Employee Platform",
    status: "live",
    stack: ["Next.js", "DeepSeek", "Hermes", "Express"],
    desc: "Persistent autonomous digital employee platform with self-improvement.",
    agents: ["Task Executor", "Fleet Monitor"],
    revenue: "Pre-revenue",
    icon: <Users className="w-5 h-5" />,
    color: "#10b981",
  },
];

export default function AppsPage() {
  const liveCount = APPS.filter(a => a.status === "live").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">App Fleet</h1>
          <p className="text-slate-400 mt-1">
            {APPS.length} projects · {liveCount} live · Managed by HermesOS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[11px]">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400">{liveCount} Online</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Projects", value: APPS.length, icon: <Server className="w-4 h-4" />, color: "#06b6d4" },
          { label: "Live in Production", value: liveCount, icon: <Wifi className="w-4 h-4" />, color: "#10b981" },
          { label: "AI Agents Deployed", value: "12+", icon: <Bot className="w-4 h-4" />, color: "#d4a853" },
          { label: "Est. Monthly Revenue", value: "$5K–$25K", icon: <DollarSign className="w-4 h-4" />, color: "#f59e0b" },
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

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPS.map(app => (
          <div key={app.name} className="card-glass p-5 space-y-3" style={{ borderColor: `${app.color}15` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${app.color}15`, border: `1px solid ${app.color}20`, color: app.color }}>
                  {app.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{app.name}</h3>
                  <p className="text-[10px] text-slate-500">{app.type}</p>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${app.status === "live" ? "bg-green-500/10 text-green-400 border border-green-500/10" : "bg-amber-500/10 text-amber-400 border border-amber-500/10"}`}>
                {app.status}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{app.desc}</p>

            {app.agents.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {app.agents.map((a, i) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.04]">
                    {a}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded-full" style={{ background: `${app.color}08`, color: app.color }}>
                {app.revenue}
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-white/[0.04]">
              <a href={`https://${app.url}`} target="_blank" className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors">
                <ExternalLink className="w-3 h-3" /> {app.url}
              </a>
              <a href={`https://github.com/${app.repo}`} target="_blank" className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors">
                <Github className="w-3 h-3" /> {app.repo.split("/")[1]}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
