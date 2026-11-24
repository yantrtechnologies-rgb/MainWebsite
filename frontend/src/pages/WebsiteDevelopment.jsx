import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Globe, LayoutTemplate, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { useEnquiry } from "@/context/contexts";

const BUILDS = [
  { icon: Globe, t: "Business websites", d: "A clear, professional site that explains what you do, where you are and how customers can reach you." },
  { icon: LayoutTemplate, t: "Landing pages", d: "Focused pages for a single service, offer or ad campaign, built to turn visitors into enquiries." },
  { icon: RefreshCw, t: "Website redesigns", d: "Refresh an old or slow website with a modern design, faster pages and up-to-date content." },
];

const INCLUDED = [
  "Mobile-friendly design that works on phones, tablets and desktops",
  "Search-ready setup: page titles, descriptions, sitemap and Google Search Console",
  "Enquiry forms, click-to-call and WhatsApp buttons so customers can reach you",
  "Links to your Google Business Profile and social media pages",
  "Help with your domain name and hosting setup",
];

const PROCESS = [
  { t: "Discuss", d: "We understand your business, customers and what the website needs to achieve." },
  { t: "Design", d: "We plan the pages and share the design for your feedback before building." },
  { t: "Build", d: "We develop the website, add your content and test it on phones and computers." },
  { t: "Launch", d: "We put the site live, set it up for Google and show you how to keep it updated." },
];

export default function WebsiteDevelopment() {
  const { openEnquiry } = useEnquiry();
  const quote = () => openEnquiry("marketing", "Website Design & Development");
  return (
    <>
      <PageHero
        eyebrow="/// Website Design & Development"
        title="Website Design & Development in Sambalpur"
        desc="Fast, mobile-friendly websites and landing pages for businesses in Sambalpur and across Odisha — designed, built and set up to be found on Google."
      >
        <div className="flex flex-wrap gap-3 mt-8">
          <Button data-testid="webdev-quote-cta" onClick={quote} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full h-12 px-7">Get a Website Quote <ArrowRight className="w-5 h-5 ml-1" /></Button>
          <Button data-testid="webdev-consult-cta" onClick={() => openEnquiry("general")} variant="outline" className="border-white/25 text-white bg-transparent hover:bg-white/10 rounded-full h-12 px-7">Talk to Our Team</Button>
        </div>
      </PageHero>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal><p className="eyebrow text-[#2563EB] mb-3">/// What We Build</p></Reveal>
          <Reveal delay={0.06}><h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 max-w-2xl">Websites that help customers find and contact you.</h2></Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-12">
            {BUILDS.map(({ icon: Icon, t, d }, i) => (
              <Reveal key={t} delay={0.05 * i}>
                <div className="h-full rounded-2xl border border-slate-200 bg-[#FAFAFA] p-6">
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><Icon className="w-5 h-5" /></span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-5">{t}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
          <div>
            <Reveal><p className="eyebrow text-[#2563EB] mb-3">/// What&apos;s Included</p></Reveal>
            <Reveal delay={0.06}><h2 className="font-display text-3xl font-extrabold text-slate-900">Built to be found, not just to look good.</h2></Reveal>
            <ul className="mt-8 space-y-3">
              {INCLUDED.map((x) => (
                <li key={x} className="flex items-start gap-3 text-slate-700"><CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#84CC16]" /> {x}</li>
              ))}
            </ul>
            <p className="mt-6 text-slate-600">
              Want more visitors after launch? Pair your website with our{" "}
              <Link to="/digital-marketing" className="text-[#2563EB] underline underline-offset-4">digital marketing services</Link> — SEO, social media and Google ads.
            </p>
          </div>
          <div className="rounded-3xl bg-[#0B0F19] text-white p-8 lg:p-10 self-start">
            <p className="eyebrow text-[#84CC16] mb-3">/// Recent Work</p>
            <h3 className="font-display text-2xl font-extrabold">Nigam&apos;s Turf</h3>
            <p className="text-slate-300 mt-3 leading-relaxed">
              Website designed and built by XOLNET Technologies for Nigam&apos;s Turf. Ask us for more examples relevant to your business.
            </p>
            <Button data-testid="webdev-examples-cta" onClick={quote} className="mt-6 bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full h-11 px-6">Ask for Examples</Button>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal><p className="eyebrow text-[#2563EB] mb-3">/// How It Works</p></Reveal>
          <Reveal delay={0.06}><h2 className="font-display text-3xl font-extrabold text-slate-900">From first call to a live website.</h2></Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {PROCESS.map((p, i) => (
              <Reveal key={p.t} delay={0.05 * i}>
                <div className="h-full rounded-2xl border border-slate-200 p-6">
                  <span className="font-mono text-sm text-[#2563EB]">0{i + 1}</span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-2">{p.t}</h3>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-[#2563EB]/5 border border-[#2563EB]/20 p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-slate-800 font-semibold">Tell us about your business and we&apos;ll send a clear quote and timeline.</p>
            <Button data-testid="webdev-bottom-cta" onClick={quote} className="bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-full h-11 px-6">Get a Website Quote</Button>
          </div>
        </div>
      </section>
    </>
  );
}
