import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Signal, MonitorPlay } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";
import { COURSES, COURSE_MODES } from "@/data/siteData";

export default function ITTraining() {
  const { openEnquiry } = useEnquiry();
  const [mode, setMode] = useState("All");
  const filtered = COURSES.filter((c) => mode === "All" || c.mode.toLowerCase().includes(mode.toLowerCase()));
  return (
    <>
      <PageHero eyebrow="/// Yantr Training Academy" title="Learn Today. Build Tomorrow." desc="Industry-grade bootcamps with hands-on projects, mentorship and flexible online, classroom and hybrid delivery.">
        <div className="flex flex-wrap gap-2 mt-8">
          {COURSE_MODES.map((m) => (
            <button key={m} data-testid={`course-mode-${m.toLowerCase()}`} onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${mode === m ? "bg-[#F97316] text-white border-[#F97316]" : "bg-white/5 text-slate-300 border-white/15 hover:border-white/40"}`}>
              {m}
            </button>
          ))}
        </div>
      </PageHero>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <Reveal key={c.title} delay={0.06 * i}>
                <div className="group h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] overflow-hidden hover:shadow-xl hover:border-[#F97316]/40 transition-all flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className="absolute top-3 left-3 bg-[#F97316] text-white border-0">{c.badge}</Badge>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">{c.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>
                      <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" /> {c.level}</span>
                      <span className="flex items-center gap-1"><MonitorPlay className="w-3.5 h-3.5" /> {c.mode}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {c.stack.map((s) => <span key={s} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/5 text-slate-600">{s}</span>)}
                    </div>
                    <Button data-testid={`training-enrol-${i}`} onClick={() => openEnquiry("academy", c.title)} className="mt-5 w-full bg-[#F97316] hover:bg-[#0B0F19] text-white rounded-lg font-semibold">Enrol / Enquire</Button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-[#0B0F19] text-white p-10 relative overflow-hidden">
              <div className="absolute inset-0 grid-lines opacity-40" />
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-extrabold">Corporate & team training</h3>
                <p className="text-slate-300 mt-3">Custom cohorts, on-site or instructor-led online, with needs assessments and progress tracking.</p>
                <Button data-testid="corporate-training-cta" onClick={() => openEnquiry("corporate")} className="mt-6 bg-[#84CC16] text-[#0B0F19] hover:bg-white rounded-full h-11 px-7 font-semibold">Enquire for Teams</Button>
              </div>
            </div>
            <div className="rounded-3xl bg-[#FAFAFA] border border-slate-200 p-10">
              <h3 className="font-display text-2xl font-extrabold text-slate-900">Not sure where to start?</h3>
              <p className="text-slate-600 mt-3">Book a free counselling session and we'll help you pick the right track for your goals.</p>
              <Button data-testid="counselling-cta" onClick={() => openEnquiry("academy")} className="mt-6 bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-full h-11 px-7 font-semibold">Book Counselling</Button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-8">Course fees, schedules and placement figures shown are demonstration content and easy to replace.</p>
        </div>
      </section>
    </>
  );
}
