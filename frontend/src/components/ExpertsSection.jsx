import React from "react";
import { Award, TrendingUp, Network, Code2, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const AREAS = [
  { icon: TrendingUp, title: "Digital Marketing Strategists", desc: "Brand, SEO and performance specialists who have grown businesses across industries." },
  { icon: Network, title: "Hardware & Networking Engineers", desc: "Certified engineers who design, supply and support reliable IT infrastructure." },
  { icon: Code2, title: "Software & AI Trainers", desc: "Industry practitioners teaching Java, Python, Full Stack, databases and AI." },
  { icon: ShieldCheck, title: "Cyber Security & ITIL Specialists", desc: "Professionals who secure systems and run IT services to global standards." },
];

export const ExpertsSection = () => (
  <section data-testid="experts-section" className="py-20 lg:py-28 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-5 lg:sticky lg:top-28">
        <Reveal><p className="eyebrow text-[#2563EB] mb-3">/// Meet Our Experts</p></Reveal>
        <Reveal delay={0.06}>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Seasoned professionals behind every project and classroom.</h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-4 text-lg text-slate-600">Our team brings together professionals with an overall experience of more than 15 years across marketing, IT hardware, software and training.</p>
        </Reveal>
        <Reveal delay={0.18}>
          <div data-testid="experts-years" className="mt-8 inline-flex items-center gap-4 rounded-2xl bg-[#0B0F19] text-white px-6 py-5">
            <Award className="w-10 h-10 text-[#84CC16]" />
            <div>
              <p className="font-display text-4xl font-black leading-none">15+</p>
              <p className="text-sm text-slate-300 mt-1">Years of overall industry experience</p>
            </div>
          </div>
        </Reveal>
      </div>
      <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
        {AREAS.map((a, i) => (
          <Reveal key={a.title} delay={0.08 * i}>
            <div data-testid={`expert-area-${i}`} className={`h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] p-6 hover:border-[#2563EB]/40 hover:bg-white hover:shadow-lg transition-all ${i % 2 ? "sm:translate-y-8" : ""}`}>
              <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] mb-5"><a.icon className="w-6 h-6" /></span>
              <h3 className="font-display text-lg font-bold text-slate-900">{a.title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{a.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
