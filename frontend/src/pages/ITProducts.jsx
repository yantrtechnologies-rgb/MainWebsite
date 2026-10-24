import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";
import { PRODUCTS, PRODUCT_CATEGORIES } from "@/data/siteData";

export default function ITProducts() {
  const { openEnquiry } = useEnquiry();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const cats = ["All", ...PRODUCT_CATEGORIES];
  const filtered = PRODUCTS.filter(
    (p) => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <PageHero eyebrow="/// IT Products & E-Commerce" title="Technology That Works for You." desc="Enterprise laptops, workstations, displays, networking and accessories — specced for performance and value.">
        <div className="mt-8 max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input data-testid="product-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="pl-12 h-12 bg-white/5 border-white/15 text-white placeholder:text-slate-500 rounded-full" />
        </div>
      </PageHero>

      <section className="py-16 lg:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-10">
            {cats.map((c) => (
              <button key={c} data-testid={`product-cat-${c.toLowerCase()}`} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${cat === c ? "bg-[#0B0F19] text-white border-[#0B0F19]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {c}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div data-testid="product-empty" className="text-center py-20 text-slate-500">No products match your search.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filtered.map((p, i) => (
                <Reveal key={p.name} delay={0.05 * i}>
                  <div data-testid={`products-page-card-${i}`} className="group h-full rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all flex flex-col">
                    <div className="relative h-44 bg-slate-100 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <Badge className="absolute top-3 left-3 bg-[#2563EB] text-white border-0">{p.badge}</Badge>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-xs font-mono text-slate-400">{p.brand} • {p.category}</p>
                      <h3 className="font-display font-bold text-slate-900 mt-1 leading-snug">{p.name}</h3>
                      <p className="text-xs text-slate-500 mt-2 font-mono">{p.specs}</p>
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="font-display text-xl font-extrabold text-slate-900">{p.price}</span>
                        <span className="text-xs font-medium text-[#84CC16] bg-[#84CC16]/10 px-2 py-1 rounded-md">{p.stock}</span>
                      </div>
                      <Button data-testid={`products-page-quote-${i}`} onClick={() => openEnquiry("products", p.name)} className="mt-4 w-full bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-lg text-sm">Request a Quote</Button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <div className="mt-16 rounded-3xl bg-[#0B0F19] text-white p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 grid-lines opacity-40" />
            <div className="relative z-10">
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold">Bulk & corporate procurement</h2>
              <p className="text-slate-300 mt-3 max-w-xl mx-auto">Kitting out an office, lab or team? Send us your list and we'll prepare a competitive quotation.</p>
              <Button data-testid="bulk-quote-cta" onClick={() => openEnquiry("corporate")} className="mt-6 bg-[#84CC16] text-[#0B0F19] hover:bg-white rounded-full h-12 px-8 font-semibold">Request Bulk Quote</Button>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">Prices and availability shown are demonstration content and easy to replace with verified live data.</p>
        </div>
      </section>
    </>
  );
}
