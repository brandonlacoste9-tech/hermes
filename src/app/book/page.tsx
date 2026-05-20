"use client";
import { CheckCircle, ArrowRight, Clock, Shield, FileText, Zap, Calendar } from "lucide-react";

export default function BookPage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #06080f 0%, #0a0e1a 50%, #111827 100%)" }}>
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", color: "#34d399" }}>
          <Shield className="w-3.5 h-3.5" /> Trusted by SaaS companies across Quebec
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
          Your SaaS is one audit away from
          <span style={{ background: "linear-gradient(135deg, #d4a853, #f0c060)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}> full Bill 96 compliance</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-lg mx-auto mb-8">
          We've helped 40+ Canadian SaaS companies become Quebec-compliant in under 6 weeks. Here's how we do it — and what it costs.
        </p>

        {/* The Process */}
        <div className="space-y-4 mb-12 text-left">
          {[
            { icon: <Shield className="w-5 h-5" />, title: "1. Technical Audit (3-5 days)", desc: "We scan your entire SaaS — UI, docs, contracts, emails — and map every Bill 96 gap. You get a prioritized risk report." },
            { icon: <FileText className="w-5 h-5" />, title: "2. French Localization (2-4 weeks)", desc: "Legal-grade Quebec French translation for all customer-facing surfaces. Not Google Translate — OQLF-compliant, human-translated, industry-specific." },
            { icon: <CheckCircle className="w-5 h-5" />, title: "3. OQLF Filing & Monitoring", desc: "We handle all regulatory filings, set up ongoing compliance monitoring, and prepare your OQLF inspection readiness package." },
          ].map((step, i) => (
            <div key={i} className="p-5 rounded-2xl border border-white/[0.04]" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(212,168,83,0.1)", color: "#d4a853" }}>{step.icon}</div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { name: "Audit", price: "$2,500", desc: "Full Bill 96 assessment", popular: false },
            { name: "Localize", price: "$7,500", desc: "Audit + French translation", popular: true },
            { name: "Enterprise", price: "$15,000", desc: "Full compliance package", popular: false },
          ].map(p => (
            <div key={p.name} className={`p-5 rounded-2xl border ${p.popular ? "border-[#d4a853]/30" : "border-white/[0.04]"}`} style={{ background: p.popular ? "rgba(212,168,83,0.04)" : "rgba(255,255,255,0.015)", boxShadow: p.popular ? "0 0 30px rgba(212,168,83,0.06)" : "none" }}>
              {p.popular && <div className="text-[10px] font-bold text-[#d4a853] mb-2">MOST POPULAR</div>}
              <h3 className="font-bold text-white">{p.name}</h3>
              <p className="text-2xl font-bold text-white mt-2">{p.price}</p>
              <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="p-8 rounded-2xl border border-[#d4a853]/20" style={{ background: "rgba(212,168,83,0.03)" }}>
          <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: "#d4a853" }} />
          <h2 className="text-xl font-bold text-white mb-3">Ready to become Quebec-compliant?</h2>
          <p className="text-sm text-slate-400 mb-6">Book a 15-minute call and we'll walk you through your compliance gaps — free.</p>
          <a href="https://calendly.com/hermesos/15min" target="_blank" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #d4a853, #f0c060)" }}>
            Book Your Free Audit <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-[10px] text-slate-600 mt-3">No commitment · 15 minutes · Confidential</p>
        </div>
      </div>
    </div>
  );
}
