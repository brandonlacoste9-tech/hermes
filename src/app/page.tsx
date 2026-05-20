import Link from "next/link";
import { ArrowRight, Cpu, Brain, Activity, Shield, Zap, Sparkles, TrendingUp } from "lucide-react";

const GOLD = "#d4a853";
const CYAN = "#06b6d4";
const PURPLE = "#a855f7";

function FeatureCard({ icon, title, desc, accent }: { icon: React.ReactNode; title: string; desc: string; accent: string }) {
  return (
    <div className="card-glass p-6 hover:border-opacity-60 transition-all duration-300 group" style={{ borderColor: `${accent}15` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #06080f 0%, #0a0e1a 100%)" }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04]" style={{ background: "rgba(6,8,15,0.85)", backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #f0c060)` }}>
              <Cpu className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Hermes<span className="gold-gradient">OS</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard" className="gold-btn px-5 py-2 rounded-xl text-sm">Launch App <ArrowRight className="w-4 h-4 inline ml-1.5" /></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, ${GOLD}, transparent 70%)`, filter: "blur(80px)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, ${CYAN}, transparent 70%)`, filter: "blur(80px)" }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8" style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}20`, color: GOLD }}>
            <Sparkles className="w-3.5 h-3.5" />
            Autonomous AI Workers
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            <span className="text-white">Deploy AI that </span>
            <span className="gold-gradient">works while you sleep</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            HermesOS runs your business automations 24/7. Pick a template, connect your tools, set autonomy — and let AI agents handle the rest.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="gold-btn px-8 py-3 rounded-xl text-base inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#features" className="px-8 py-3 rounded-xl text-base border text-slate-300 hover:text-white transition-colors" style={{ borderColor: `${GOLD}30` }}>
              See Features
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-xs text-slate-600">
            <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> DeepSeek</span>
            <span className="w-px h-3 bg-white/[0.06]" />
            <span className="flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Persistent Memory</span>
            <span className="w-px h-3 bg-white/[0.06]" />
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Graduated Autonomy</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Not another chatbot</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Agents that run on schedules, remember context, learn from outcomes, and make decisions — not just respond to prompts.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FeatureCard icon={<Zap className="w-5 h-5" />} title="Autonomous Execution" desc="Agents run on schedules or triggers. Scout, decide, execute, and report back — no human needed." accent={GOLD} />
            <FeatureCard icon={<Brain className="w-5 h-5" />} title="Persistent Memory" desc="Every agent remembers past work, learns from outcomes, and gets better over time." accent={PURPLE} />
            <FeatureCard icon={<Activity className="w-5 h-5" />} title="Real-Time Monitor" desc="Watch your entire fleet work in real-time. See what each agent is doing right now." accent={CYAN} />
            <FeatureCard icon={<Shield className="w-5 h-5" />} title="Graduated Autonomy" desc="Auto for routine, notify for medium-risk, ask for critical. You control the guardrails." accent={GOLD} />
            <FeatureCard icon={<TrendingUp className="w-5 h-5" />} title="Connect Your Stack" desc="Gmail, Slack, Stripe, Supabase — agents plug into your tools via templates." accent={CYAN} />
            <FeatureCard icon={<Sparkles className="w-5 h-5" />} title="Template Marketplace" desc="Revenue Scout, Support Agent, Content Engine — deploy proven automations in one click." accent={PURPLE} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-10" style={{ background: `linear-gradient(135deg, ${GOLD}06, ${CYAN}04)`, border: `1px solid ${GOLD}08` }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "10K+", label: "Tokens per Invocation" },
                { value: "3-Tier", label: "Autonomy Control" },
                { value: "24/7", label: "Agent Uptime" },
                { value: "90 Days", label: "Memory Window" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold mb-1 gold-gradient">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-glass p-12 md:p-16">
            <Sparkles className="w-10 h-10 mx-auto mb-6" style={{ color: GOLD }} />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to deploy your first agent?</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Pick a template, connect your tools, and let AI handle the work while you focus on growth.</p>
            <Link href="/dashboard" className="gold-btn px-8 py-3 rounded-xl text-base inline-flex items-center gap-2">
              Launch App <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${GOLD}, #f0c060)` }}>
              <Cpu className="w-3.5 h-3.5 text-slate-900" />
            </div>
            <span className="text-xs text-slate-500">Hermes<span style={{ color: GOLD }}>OS</span> · Autonomous Business Automations</span>
          </div>
          <div className="text-xs text-slate-600">Powered by DeepSeek · Persistent Memory Engine · {new Date().getFullYear()}</div>
        </div>
      </footer>
    </div>
  );
}
