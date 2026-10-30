import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Signal, MonitorPlay, Loader2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";
import { useCatalog, imgUrl } from "@/lib/catalog";

export const CourseCard = ({ c, i, testid = "training" }) => {
  const { openEnquiry } = useEnquiry();
  return (
    <div data-testid={`${testid}-course-${i}`} className="group h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] overflow-hidden hover:shadow-xl hover:border-[#F97316]/40 transition-all flex flex-col">
      <div className="relative h-48 overflow-hidden bg-slate-200">
        {c.image && <img src={imgUrl(c.image)} alt={c.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
        {c.badge && <Badge className="absolute top-3 left-3 bg-[#F97316] text-white border-0">{c.badge}</Badge>}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display text-lg font-bold text-slate-900 leading-snug">{c.title}</h3>
        {c.description && <p className="text-sm text-slate-600 mt-2 line-clamp-3">{c.description}</p>}
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500 font-mono">
          {c.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {c.duration}</span>}
          {c.level && <span className="flex items-center gap-1"><Signal className="w-3.5 h-3.5" /> {c.level}</span>}
          {c.mode && <span className="flex items-center gap-1"><MonitorPlay className="w-3.5 h-3.5" /> {c.mode}</span>}
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {(c.topics || []).map((s) => <span key={s} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/5 text-slate-600">{s}</span>)}
        </div>
        <div className="mt-auto pt-5">
          <p className="text-sm font-semibold text-[#F97316]">Fees — Ask for Quote</p>
          <Button data-testid={`${testid}-enrol-${i}`} onClick={() => openEnquiry("academy", c.title)} className="mt-3 w-full bg-[#F97316] hover:bg-[#0B0F19] text-white rounded-lg font-semibold">Enrol / Enquire</Button>
        </div>
      </div>
    </div>
  );
};

export default function ITTraining() {
  const { openEnquiry } = useEnquiry();
  const { items, loading } = useCatalog("courses");
  return (
    <>
      <PageHero eyebrow="/// Yantr Training Academy" title="Learn Today. Build Tomorrow." desc="Job-ready IT courses with hands-on projects, mentorship from industry experts and flexible online and classroom batches." />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((c, i) => (
                <Reveal key={c.id} delay={0.04 * (i % 6)}><CourseCard c={c} i={i} /></Reveal>
              ))}
            </div>
          )}

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
        </div>
      </section>
    </>
  );
}
