import React from "react";
import * as Icons from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";
import { SERVICES } from "@/data/siteData";

const PROCESS = [
  { t: "Discovery", d: "We audit your brand, market and goals to find the biggest opportunities." },
  { t: "Strategy", d: "A tailored roadmap with channels, messaging and measurable KPIs." },
  { t: "Execution", d: "Creative, campaigns and builds shipped by specialists." },
  { t: "Optimize", d: "Continuous testing and reporting to compound your returns." },
];

export default function DigitalMarketing() {
  const { openEnquiry } = useEnquiry();
  return (
    <>
      <PageHero
        eyebrow="/// Digital Marketing Agency"
        title="Make Your Brand Impossible to Ignore."
        desc="Creative storytelling, performance marketing and data-driven strategy that turns attention into revenue."
      >
        <div className="flex flex-wrap gap-3 mt-8">
          <Button data-testid="dm-proposal-cta" onClick={() => openEnquiry("marketing")} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full h-12 px-7">Get a Proposal <ArrowRight className="w-5 h-5 ml-1" /></Button>
          <Button data-testid="dm-consult-cta" onClick={() => openEnquiry("general")} variant="outline" className="border-white/25 text-white bg-transparent hover:bg-white/10 rounded-full h-12 px-7">Book a Consultation</Button>
        </div>
      </PageHero>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal><p className="eyebrow text-[#2563EB] mb-3">/// What We Do</p></Reveal>
          <Reveal delay={0.06}><h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 max-w-2xl">A full-stack marketing team, on demand.</h2></Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {SERVICES.map((s, i) => {
              const Icon = Icons[s.icon] || Icons.Sparkles;
              return (
                <Reveal key={s.title} delay={0.04 * i}>
                  <div data-testid={`service-card-${i}`} className="group h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] p-6 hover:border-[#2563EB]/40 hover:bg-white hover:shadow-lg transition-all">
                    <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#2563EB]/10 text-[#2563EB] mb-5 group-hover:bg-[#2563EB] group-hover:text-white transition-colors"><Icon className="w-5 h-5" /></span>
                    <h3 className="font-display text-lg font-bold text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-[#0B0F19] text-white relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="eyebrow text-[#84CC16] mb-3">/// How We Deliver</p>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold max-w-2xl">A proven process built around your outcomes.</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-12">
            {PROCESS.map((p, i) => (
              <Reveal key={p.t} delay={0.08 * i}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                  <span className="font-display text-4xl font-black text-[#2563EB]">0{i + 1}</span>
                  <h3 className="font-display text-lg font-bold mt-3">{p.t}</h3>
                  <p className="text-sm text-slate-400 mt-2">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 rounded-3xl bg-[#FAFAFA] border border-slate-200 p-10 text-center">
          <h2 className="font-display text-3xl font-extrabold text-slate-900">Request a tailored marketing proposal</h2>
          <p className="text-slate-600 mt-3 max-w-xl mx-auto">Tell us your goals and budget — we'll come back with a concrete plan and next steps.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-slate-600">
            {["No obligation", "Response within 1 business day", "Clear scope & pricing"].map((x) => (
              <span key={x} className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#84CC16]" /> {x}</span>
            ))}
          </div>
          <Button data-testid="dm-bottom-cta" onClick={() => openEnquiry("marketing")} className="mt-7 bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-full h-12 px-8 font-semibold">Start My Proposal</Button>
        </div>
      </section>
    </>
  );
}
