import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Laptop, GraduationCap, ChevronRight, ArrowRight, ArrowUpRight,
  Workflow, Sparkles, ReceiptText, LifeBuoy, Star, Quote, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";
import {
  VERTICALS, WHY_US, PORTFOLIO, PORTFOLIO_FILTERS, PRODUCTS, COURSES,
  TESTIMONIALS, JOURNEY,
} from "@/data/siteData";

const ICONS = { TrendingUp, Laptop, GraduationCap, Workflow, Sparkles, ReceiptText, LifeBuoy };

const Hero = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="relative bg-[#0B0F19] text-white overflow-hidden pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="absolute inset-0 grid-lines opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#2563EB]/20 blur-[140px]" />
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#84CC16]/10 blur-[120px]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Reveal>
          <p className="eyebrow text-[#84CC16] mb-5">/// Yantr Technologies — Three Powerhouse Verticals</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display font-black tracking-tight leading-[0.98] text-4xl sm:text-5xl lg:text-6xl max-w-4xl text-balance">
            Transforming Brands, Equipping Teams &{" "}
            <span className="text-[#3B82F6]">Educating</span> Tech Leaders.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl leading-relaxed">
            We unite creative digital marketing, enterprise hardware deployment, and hands-on IT
            career bootcamps under one ecosystem — helping businesses and people grow.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button data-testid="hero-primary-cta" onClick={() => openEnquiry("marketing")} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full px-7 h-12 text-base">
              Explore Our Services <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
            <Button data-testid="hero-secondary-cta" onClick={() => openEnquiry("general")} variant="outline" className="border-white/25 text-white bg-transparent hover:bg-white/10 rounded-full px-7 h-12 text-base">
              Talk to Our Team
            </Button>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16">
          {VERTICALS.map((v, i) => {
            const Icon = ICONS[v.icon];
            return (
              <Reveal key={v.id} delay={0.1 * i}>
                <Link to={v.to} data-testid={`hero-card-${v.id}`} className="group block h-full">
                  <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-[#84CC16]/50 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                      <span className="grid place-items-center w-12 h-12 rounded-xl bg-[#2563EB]/20 text-[#3B82F6] group-hover:bg-[#84CC16] group-hover:text-[#0B0F19] transition-colors">
                        <Icon className="w-6 h-6" />
                      </span>
                      <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-[#84CC16] transition-colors" />
                    </div>
                    <p className="eyebrow text-slate-500 mt-5">{v.tag}</p>
                    <h3 className="font-display text-xl font-bold mt-1">{v.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{v.vertical}</p>
                    <div className="mt-5 pt-4 border-t border-white/10 font-mono text-sm text-[#84CC16]">{v.metric}</div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const SectionHeading = ({ eyebrow, title, desc, light }) => (
  <div className="max-w-2xl">
    <Reveal><p className={`eyebrow mb-3 ${light ? "text-[#84CC16]" : "text-[#2563EB]"}`}>{eyebrow}</p></Reveal>
    <Reveal delay={0.06}>
      <h2 className={`font-display text-3xl sm:text-4xl font-extrabold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>{title}</h2>
    </Reveal>
    {desc && <Reveal delay={0.12}><p className={`mt-4 text-lg ${light ? "text-slate-300" : "text-slate-600"}`}>{desc}</p></Reveal>}
  </div>
);

const Verticals = () => {
  const { openEnquiry } = useEnquiry();
  const blocks = [
    { id: "marketing", kicker: "Digital Marketing", title: "Make Your Brand Impossible to Ignore.", desc: "We combine creative storytelling, performance marketing and data-driven strategies to help brands attract customers and grow revenue.", cta: "Explore Marketing", to: "/digital-marketing", accent: "#2563EB" },
    { id: "products", kicker: "IT Products", title: "Technology That Works for You.", desc: "Computers, laptops, accessories and business IT equipment selected to meet your performance, productivity and budget needs.", cta: "Explore Products", to: "/it-products", accent: "#84CC16" },
    { id: "academy", kicker: "IT Training", title: "Learn Today. Build Tomorrow.", desc: "Practical technology skills through expert-led training, hands-on projects and flexible online and classroom learning.", cta: "Explore Courses", to: "/it-training", accent: "#F97316" },
  ];
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {blocks.map((b, i) => (
          <Reveal key={b.id} delay={0.05 * i}>
            <div className="grid lg:grid-cols-12 gap-6 items-center rounded-3xl border border-slate-200 bg-[#FAFAFA] p-8 lg:p-12">
              <div className="lg:col-span-7">
                <p className="eyebrow mb-3" style={{ color: b.accent }}>{b.kicker}</p>
                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 max-w-xl">{b.title}</h3>
                <p className="mt-4 text-lg text-slate-600 max-w-xl">{b.desc}</p>
              </div>
              <div className="lg:col-span-5 lg:text-right">
                <Link to={b.to}>
                  <Button data-testid={`vertical-cta-${b.id}`} className="rounded-full h-12 px-7 text-base font-semibold text-white" style={{ backgroundColor: b.accent }}>
                    {b.cta} <ArrowRight className="w-5 h-5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const WhyUs = () => (
  <section className="py-20 lg:py-28 bg-[#0B0F19] text-white relative overflow-hidden">
    <div className="absolute inset-0 grid-lines opacity-40" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <SectionHeading light eyebrow="/// Why Choose Yantr" title="One partner. Three powerhouses. Zero compromise." desc="We bring marketing, hardware and training together so your growth never stalls at a gap in capability." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {WHY_US.map((w, i) => {
          const Icon = ICONS[w.icon];
          return (
            <Reveal key={w.title} delay={0.08 * i}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:border-[#84CC16]/40 transition-colors">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#2563EB]/20 text-[#3B82F6] mb-5"><Icon className="w-5 h-5" /></span>
                <h3 className="font-display text-lg font-bold">{w.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{w.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  </section>
);

const Work = () => {
  const [filter, setFilter] = useState("All");
  const items = filter === "All" ? PORTFOLIO : PORTFOLIO.filter((p) => p.category === filter);
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading eyebrow="/// Featured Work" title="Campaigns and builds that moved the needle." />
          <div className="flex flex-wrap gap-2">
            {PORTFOLIO_FILTERS.map((f) => (
              <button key={f} data-testid={`portfolio-filter-${f.toLowerCase().replace(/[^a-z]+/g, "-")}`} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f ? "bg-[#0B0F19] text-white border-[#0B0F19]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {items.map((p, i) => (
            <motion.div key={p.title} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-2xl hover:shadow-slate-900/10 transition-all">
              <div className="relative h-56 overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3"><Badge className="bg-[#0B0F19]/85 text-white border-0">{p.category}</Badge></div>
                <div className="absolute bottom-3 right-3 font-mono text-sm font-bold text-white bg-[#84CC16]/90 text-[#0B0F19] px-2.5 py-1 rounded-md">{p.stat}</div>
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-400 font-mono">{p.industry}</p>
                <h3 className="font-display text-lg font-bold text-slate-900 mt-1">{p.title}</h3>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{p.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedProducts = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="py-20 lg:py-28 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading eyebrow="/// Featured IT Products" title="Hardware built for serious work." />
          <Link to="/it-products"><Button variant="outline" className="rounded-full border-slate-300">View Full Catalog <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.name} delay={0.06 * i}>
              <div data-testid={`product-card-${i}`} className="group h-full rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl transition-all flex flex-col">
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-3 left-3 bg-[#2563EB] text-white border-0">{p.badge}</Badge>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-mono text-slate-400">{p.brand}</p>
                  <h3 className="font-display font-bold text-slate-900 mt-1 leading-snug">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 font-mono">{p.specs}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-display text-xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs font-medium text-[#84CC16] bg-[#84CC16]/10 px-2 py-1 rounded-md">{p.stock}</span>
                  </div>
                  <Button data-testid={`product-quote-${i}`} onClick={() => openEnquiry("products", p.name)} className="mt-4 w-full bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-lg text-sm">Request a Quote</Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const FeaturedCourses = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <section className="py-20 lg:py-28 bg-[#111827] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <SectionHeading light eyebrow="/// Yantr Academy" title="Career-grade bootcamps, built with industry." />
          <Link to="/it-training"><Button variant="outline" className="rounded-full border-white/25 text-white bg-transparent hover:bg-white/10">All Courses <ArrowRight className="w-4 h-4 ml-1" /></Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {COURSES.map((c, i) => (
            <Reveal key={c.title} delay={0.08 * i}>
              <div data-testid={`course-card-${i}`} className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[#F97316]/40 transition-all flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-3 left-3 bg-[#F97316] text-white border-0">{c.badge}</Badge>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-xs font-mono text-[#F97316]">{c.duration} • {c.mode}</p>
                  <h3 className="font-display font-bold mt-1.5 leading-snug">{c.title}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {c.stack.map((s) => <span key={s} className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">{s}</span>)}
                  </div>
                  <Button data-testid={`course-enrol-${i}`} onClick={() => openEnquiry("academy", c.title)} className="mt-5 w-full bg-[#F97316] hover:bg-white hover:text-[#0B0F19] text-white rounded-lg text-sm font-semibold">Enrol / Enquire</Button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

const Journey = () => (
  <section className="py-20 lg:py-28 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="/// How We Help Businesses" title="One connected journey from idea to impact." desc="Engage any single vertical — or let them compound. You never have to buy all three." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {JOURNEY.map((s, i) => (
          <Reveal key={s.step} delay={0.08 * i}>
            <div className="relative h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] p-6">
              <span className="font-display text-5xl font-black text-slate-200">{s.step}</span>
              <h3 className="font-display text-lg font-bold text-slate-900 mt-3">{s.name}</h3>
              <p className="text-sm text-slate-600 mt-2">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-20 lg:py-28 bg-[#FAFAFA]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="/// Trust & Testimonials" title="Success stories (demonstration placeholders)." desc="Clearly-labelled sample feedback — replace with verified testimonials from your admin content." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={i} delay={0.08 * i}>
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-6">
              <Quote className="w-8 h-8 text-[#2563EB]/30" />
              <div className="flex gap-0.5 mt-3">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="w-4 h-4 fill-[#F97316] text-[#F97316]" />)}</div>
              <p className="text-slate-700 mt-4 leading-relaxed">"{t.quote}"</p>
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="font-semibold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">{t.org} • {t.service}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const LeadCTA = () => {
  const { openEnquiry } = useEnquiry();
  const btns = [
    { label: "Get a Marketing Proposal", v: "marketing" },
    { label: "Request IT Products", v: "products" },
    { label: "Enquire About Training", v: "academy" },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#0B0F19] text-white relative overflow-hidden">
      <div className="absolute inset-0 grid-lines opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-[#2563EB]/20 blur-[130px]" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Reveal><p className="eyebrow text-[#84CC16] mb-4">/// Let's build something</p></Reveal>
        <Reveal delay={0.08}><h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-balance">Ready to Take Your Business to the Next Level?</h2></Reveal>
        <Reveal delay={0.16}><p className="mt-5 text-lg text-slate-300 max-w-2xl mx-auto">Whether you need more customers, better technology, or stronger technical skills — let's build the right solution for you.</p></Reveal>
        <Reveal delay={0.24}>
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            {btns.map((b) => (
              <Button key={b.v} data-testid={`leadcta-${b.v}`} onClick={() => openEnquiry(b.v)} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full h-12 px-7 text-base">
                {b.label}
              </Button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default function Home() {
  return (
    <>
      <Hero />
      <Verticals />
      <WhyUs />
      <Work />
      <FeaturedProducts />
      <FeaturedCourses />
      <Journey />
      <Testimonials />
      <LeadCTA />
    </>
  );
}
