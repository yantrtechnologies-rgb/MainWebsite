import React from "react";

export const PageHero = ({ eyebrow, title, desc, children }) => (
  <section className="relative bg-[#0B0F19] text-white overflow-hidden pt-32 pb-20">
    <div className="absolute inset-0 grid-lines opacity-50" />
    <div className="absolute -top-20 right-0 w-[600px] h-[500px] rounded-full bg-[#2563EB]/20 blur-[130px]" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <p className="eyebrow text-[#84CC16] mb-4">{eyebrow}</p>
      <h1 className="font-display font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl max-w-3xl text-balance">{title}</h1>
      {desc && <p className="mt-5 text-lg text-slate-300 max-w-2xl">{desc}</p>}
      {children}
    </div>
  </section>
);
