import React from "react";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";

const VALUES = [
  { icon: Target, t: "Our Mission", d: "To be the single growth partner businesses and individuals trust across marketing, technology and skills." },
  { icon: Eye, t: "Our Vision", d: "A world where great ideas are never held back by weak marketing, outdated tools or skill gaps." },
  { icon: Heart, t: "Our Philosophy", d: "Custom over templated. Outcomes over output. Partnership over transactions." },
];

export default function About() {
  const { openEnquiry } = useEnquiry();
  return (
    <>
      <PageHero eyebrow="/// About XOLNET Technologies" title="Creativity, hardware and talent — under one roof." desc="XOLNET Technologies unites a creative digital agency, an enterprise IT store and a hands-on technology academy into one dependable partner." />
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <Reveal key={v.t} delay={0.08 * i}>
                <div className="h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] p-7">
                  <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#2563EB]/10 text-[#2563EB] mb-5"><v.icon className="w-6 h-6" /></span>
                  <h3 className="font-display text-xl font-bold text-slate-900">{v.t}</h3>
                  <p className="text-slate-600 mt-2 leading-relaxed">{v.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 rounded-3xl bg-[#0B0F19] text-white p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute inset-0 grid-lines opacity-40" />
            <div className="relative z-10 max-w-3xl">
              <p className="eyebrow text-[#84CC16] mb-4">/// Our Approach</p>
              <h2 className="font-display text-3xl font-extrabold">A practical business partner — not a vendor.</h2>
              <p className="text-slate-300 mt-4 leading-relaxed">
                We start with your goals, not our services. Whether you need more customers, better technology, or a
                stronger team, we assemble the right mix from our three verticals and stay accountable to measurable results.
              </p>
              <p className="text-slate-400 mt-4 text-sm">
                Company history, leadership, certifications and achievements are intentionally left as editable placeholders
                until verified details are provided.
              </p>
              <Button data-testid="about-cta" onClick={() => openEnquiry("general")} className="mt-7 bg-[#84CC16] text-[#0B0F19] hover:bg-white rounded-full h-12 px-8 font-semibold">Work With Us <ArrowRight className="w-5 h-5 ml-1" /></Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
