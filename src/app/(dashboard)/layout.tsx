"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, LayoutDashboard, Bot, Activity, CreditCard, Plus, Zap, Plug, Users } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/agents/create", label: "New Agent", icon: Plus },
  { href: "/crews", label: "Crews", icon: Users },
  { href: "/autonomy", label: "Autonomy", icon: Zap },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/monitor", label: "Monitor", icon: Activity },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#06080f" }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/[0.05]" style={{ background: "rgba(10,14,26,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="p-5 border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #d4a853, #f0c060)" }}>
              <Zap className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-bold text-white tracking-tight">Hermes<span style={{ color: "#d4a853" }}>OS</span></span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "text-[#d4a853] font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
                style={active ? { background: "rgba(212,168,83,0.1)", borderLeft: "2px solid #d4a853" } : { borderLeft: "2px solid transparent" }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/[0.05]">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
            System Online
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
