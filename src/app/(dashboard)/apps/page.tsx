"use client";
import { Globe, ExternalLink, Github, Server, Shield, Video, Bot, Users, Music, Briefcase, Search, FileText, TrendingUp, Truck, DollarSign, Wifi, Cpu } from "lucide-react";

const iconMap: Record<string, any> = { Cpu, Shield, Globe, Bot, Users, Video, Music, ExternalLink, Briefcase, Search, FileText, TrendingUp, Truck, DollarSign };

const APPS = [
  { name: "HermesOS", url: "hermes-red-tau.vercel.app", repo: "brandonlacoste9-tech/hermes", type: "AI Automation SaaS", status: "live", desc: "Autonomous business platform with agents, crews, and campaign pipeline.", agents: ["Max","Joe","Ti-Guy"], revenue: "$49-$299/mo", icon: "Cpu", color: "#d4a853" },
  { name: "NordiqueCompliance", url: "quebec-compliance.vercel.app", repo: "brandonlacoste9-tech/quebec-compliance", type: "Compliance Firm", status: "live", desc: "Bill 96 French compliance for English-only SaaS companies.", agents: [], revenue: "$2.5K-$15K", icon: "Shield", color: "#f59e0b" },
  { name: "PontCompliance", url: "pont-compliance.vercel.app", repo: "brandonlacoste9-tech/pont-compliance", type: "Compliance Firm", status: "live", desc: "English GTM and localization for Quebec SaaS expanding to US.", agents: [], revenue: "$3.5K-$25K+", icon: "Globe", color: "#3b82f6" },
  { name: "Cyberhound", url: "cyberhound-web.vercel.app", repo: "brandonlacoste9-tech/Cyberhound", type: "AI Sales Swarm", status: "live", desc: "Python AI sales automation with 5 specialized hunting hounds.", agents: ["SaaSHound","Upwork","System"], revenue: "Pre-revenue", icon: "Bot", color: "#06b6d4" },
  { name: "StaffX", url: "digital-employee-blueprint.vercel.app", repo: "brandonlacoste9-tech/digital-employee-blueprint", type: "Employee Platform", status: "live", desc: "Persistent autonomous digital employee with self-improvement.", agents: ["Executor","Monitor"], revenue: "Pre-revenue", icon: "Users", color: "#10b981" },
  { name: "Zyeute", url: "zyeute.com", repo: "brandonlacoste9-tech/ZyeuteV5", type: "Social Media", status: "live", desc: "Quebec social video platform with Trinity AI engine.", agents: ["Ti-Guy","Browser","Design"], revenue: "Pre-monetization", icon: "Video", color: "#8b5cf6" },
  { name: "FlowGuru", url: "flow-guru-web.vercel.app", repo: "brandonlacoste9-tech/flow-guru-web", type: "AI Assistant", status: "live", desc: "AI assistant with memory, calendar, music, persistent context.", agents: ["FLO GURU"], revenue: "Subscription", icon: "Music", color: "#ec4899" },
  { name: "Zipd", url: "zipd.vercel.app", repo: "brandonlacoste9-tech/v0-linksnip-dashboard", type: "URL Shortener", status: "live", desc: "Enterprise URL management with biometric auth and analytics.", agents: [], revenue: "Enterprise", icon: "ExternalLink", color: "#6366f1" },
  { name: "Trades Canada", url: "trades-canada.vercel.app", repo: "brandonlacoste9-tech/trades-canada-v2", type: "Lead Gen", status: "live", desc: "Contractor leads across 10 Canadian cities.", agents: ["Scraper","Telegram"], revenue: "Subscription", icon: "Briefcase", color: "#f97316" },
  { name: "Koloni Studio", url: "koloni.vercel.app", repo: "brandonlacoste9-tech/adgenxai", type: "AI Creator", status: "dev", desc: "Gen Z AI content creation: video, image, script generation.", agents: ["Content Engine"], revenue: "Freemium", icon: "Search", color: "#a855f7" },
  { name: "Korean AI Comp", url: "korean-ai.vercel.app", repo: "brandonlacoste9-tech/korean-AI-compliance-", type: "Regulatory SaaS", status: "dev", desc: "Korean AI Act and PIPC compliance with 77-day countdown.", agents: [], revenue: "Subscription", icon: "FileText", color: "#ef4444" },
  { name: "QMetier", url: "qmetier.vercel.app", repo: "brandonlacoste9-tech/QMETIER-", type: "Jobs Platform", status: "dev", desc: "Quebec multilingual job and employment platform.", agents: ["Telegram Bot"], revenue: "Pre-revenue", icon: "Briefcase", color: "#14b8a6" },
  { name: "Trades USA", url: "trades-usa.vercel.app", repo: "brandonlacoste9-tech/trades-usa-v2", type: "Lead Gen", status: "dev", desc: "Contractor leads across US cities.", agents: ["Scraper","Telegram"], revenue: "Subscription", icon: "TrendingUp", color: "#eab308" },
  { name: "TruckerHub", url: "truckerhub.vercel.app", repo: "brandonlacoste9-tech/truckerhub", type: "Logistics", status: "dev", desc: "Trucking and logistics management platform.", agents: [], revenue: "Pre-revenue", icon: "Truck", color: "#84cc16" },
  { name: "KryptTrac", url: "krypttrac.com", repo: "brandonlacoste9-tech/krypttrac.com", type: "Crypto Portfolio", status: "dev", desc: "Cryptocurrency portfolio tracking and analytics.", agents: [], revenue: "Pre-revenue", icon: "DollarSign", color: "#f59e0b" },
];

export default function AppsPage() {
  const liveCount = APPS.filter(a => a.status === "live").length;
  const devCount = APPS.filter(a => a.status === "dev").length;
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">App Fleet</h1>
          <p className="text-slate-400 mt-1">{APPS.length} projects · {liveCount} live · {devCount} in development</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-green-500/5 border border-green-500/10 text-[11px] text-green-400"><Wifi className="w-3 h-3 inline mr-1" />{liveCount} Live</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[11px] text-amber-400"><Server className="w-3 h-3 inline mr-1" />{devCount} Dev</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[["Projects",APPS.length,"#06b6d4"],["Live",liveCount,"#10b981"],["Agents","20+","#d4a853"],["MRR Est.","$8K-40K","#f59e0b"]].map(([l,v,c]) => (
          <div key={String(l)} className="card-glass p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:`${c}10`,color:c}}><Server className="w-4 h-4" /></div>
            <div><p className="text-[10px] uppercase text-slate-500">{l}</p><p className="text-xl font-bold text-white">{v}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {APPS.map(app => {
          const Icon = iconMap[app.icon] || Globe;
          return (
            <div key={app.name} className="card-glass p-4 space-y-2" style={{borderColor:`${app.color}15`}}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{background:`${app.color}15`,border:`1px solid ${app.color}20`,color:app.color}}><Icon className="w-4 h-4" /></div>
                  <div><h3 className="font-bold text-white text-sm">{app.name}</h3><p className="text-[9px] text-slate-500">{app.type}</p></div>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${app.status==="live"?"bg-green-500/10 text-green-400 border-green-500/10":"bg-amber-500/10 text-amber-400 border-amber-500/10"} border`}>{app.status}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{app.desc}</p>
              {app.agents.length>0 && <div className="flex flex-wrap gap-1">{app.agents.map((a,i)=><span key={i} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.04]">{a}</span>)}</div>}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full inline-block" style={{background:`${app.color}08`,color:app.color}}>{app.revenue}</span>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04] text-[9px]">
                <a href={`https://${app.url}`} target="_blank" className="text-slate-400 hover:text-white flex items-center gap-1"><ExternalLink className="w-2.5 h-2.5" />{app.url.split(".")[0]}</a>
                <a href={`https://github.com/${app.repo}`} target="_blank" className="text-slate-500 hover:text-white"><Github className="w-2.5 h-2.5" /></a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
