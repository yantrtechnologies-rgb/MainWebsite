import React from "react";
import { useCatalog, imgUrl } from "@/lib/catalog";

const Tile = ({ c }) => (
  <div className="shrink-0 mx-3 h-20 w-48 rounded-2xl border border-slate-200 bg-white grid place-items-center px-5 hover:border-[#2563EB]/40 hover:shadow-md transition-all">
    {c.image ? (
      <img src={imgUrl(c.image)} alt={c.name} className="max-h-12 max-w-full object-contain grayscale hover:grayscale-0 transition" />
    ) : (
      <span className="font-display font-extrabold text-lg text-slate-700 text-center leading-tight tracking-tight">{c.name}</span>
    )}
  </div>
);

export const ClientMarquee = () => {
  const { items } = useCatalog("clients");
  if (!items.length) return null;
  return (
    <section data-testid="clients-marquee" className="py-16 bg-[#FAFAFA] border-y border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="eyebrow text-[#2563EB]">/// Our Clients</p>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">Trusted by brands big and small.</h2>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-[#FAFAFA] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-[#FAFAFA] to-transparent" />
        <div data-testid="clients-track" className="flex w-max animate-marquee-right">
          {[...items, ...items].map((c, i) => <Tile key={`${c.id}-${i}`} c={c} />)}
        </div>
      </div>
    </section>
  );
};
