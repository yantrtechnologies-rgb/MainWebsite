import React from "react";
import { Link } from "react-router-dom";
import { Zap, Mail, MapPin, Clock, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import { COMPANY } from "@/data/siteData";
import { useEnquiry } from "@/context/contexts";

const COLS = [
  { title: "Digital Marketing", links: ["SEO", "Social Media", "Performance Ads", "Branding", "Web Development"] },
  { title: "IT Products", links: ["Laptops", "Desktops", "Monitors", "Networking", "Accessories"] },
  { title: "Training Academy", links: ["Full-Stack", "Cloud & DevOps", "Cyber Security", "Data & AI", "Corporate Training"] },
];

export const Footer = () => {
  const { openEnquiry } = useEnquiry();
  return (
    <footer data-testid="site-footer" className="relative bg-[#0B0F19] text-slate-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#2563EB] text-white">
                <Zap className="w-5 h-5" strokeWidth={2.5} />
              </span>
              <span className="font-display font-extrabold text-xl text-white">YANTR</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">{COMPANY.tagline}</p>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mt-3">
              One ecosystem uniting creative digital marketing, enterprise IT hardware, and hands-on technology training.
            </p>
            <div className="flex gap-3 mt-6">
              {[Linkedin, Twitter, Instagram, Facebook].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="grid place-items-center w-9 h-9 rounded-md bg-white/5 hover:bg-[#84CC16] hover:text-[#0B0F19] transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.title}>
              <h4 className="font-semibold text-white text-sm mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <button onClick={() => openEnquiry("general")} className="text-sm text-slate-400 hover:text-[#84CC16] transition-colors">{l}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10 text-sm text-slate-400">
          <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#2563EB]" /> {COMPANY.email}</span>
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#2563EB]" /> {COMPANY.address}</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#2563EB]" /> {COMPANY.hours}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Yantr Technologies. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {["Privacy Policy", "Terms & Conditions", "Refund Policy", "Shipping Policy", "Warranty & Returns"].map((p) => (
              <a key={p} href="#" className="hover:text-slate-300">{p}</a>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="pointer-events-none select-none absolute -bottom-8 left-0 right-0 text-center font-display font-black text-white/[0.03] leading-none" style={{ fontSize: "min(26vw, 380px)" }}>
        YANTR
      </div>
    </footer>
  );
};
