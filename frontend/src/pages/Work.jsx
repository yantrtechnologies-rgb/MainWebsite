import React, { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/PageHero";
import { PORTFOLIO, PORTFOLIO_FILTERS } from "@/data/siteData";

export default function Work() {
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter);
  return (
    <>
      <PageHero eyebrow="/// Our Work" title="Creativity, engineered for measurable impact." desc="A selection of demonstration case studies across marketing, branding, performance and product. Replace with your real portfolio anytime." />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {PORTFOLIO_FILTERS.map((f) => (
              <button key={f} data-testid={`work-filter-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f ? "bg-[#0B0F19] text-white border-[#0B0F19]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((p, i) => (
              <motion.div key={p.title} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl transition-all">
                <div className="relative h-64 overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-4 left-4 bg-[#0B0F19]/85 text-white border-0">{p.category}</Badge>
                  <span className="absolute bottom-4 right-4 font-mono text-sm font-bold bg-[#84CC16] text-[#0B0F19] px-3 py-1 rounded-md">{p.stat}</span>
                </div>
                <div className="p-7">
                  <p className="text-xs font-mono text-slate-400">{p.industry}</p>
                  <h3 className="font-display text-2xl font-bold text-slate-900 mt-1">{p.title}</h3>
                  <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-900">Challenge: </span><span className="text-slate-600">{p.challenge}</span></p>
                    <p><span className="font-semibold text-slate-900">Solution: </span><span className="text-slate-600">{p.solution}</span></p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
