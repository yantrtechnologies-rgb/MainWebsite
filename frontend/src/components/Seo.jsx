import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://www.xolnet.in";
const BRAND = "XOLNET Technologies Private Limited";

// Per-page title + description. Every title carries the brand so Google
// learns "Xolnet" is a real name, not a misspelling.
const PAGES = {
  "/": {
    title: "XOLNET Technologies – Digital Marketing, Web Development & IT Training in Sambalpur",
    description: "XOLNET Technologies Private Limited (Xolnet), Sambalpur, Odisha: digital marketing, website development, IT products, and AI & computer training for businesses, students and professionals.",
  },
  "/digital-marketing": {
    title: `Digital Marketing Agency in Sambalpur | ${BRAND}`,
    description: "SEO, social media, performance ads, branding and website development by XOLNET Technologies, Sambalpur, Odisha.",
  },
  "/it-products": {
    title: `IT Products – Laptops, Desktops & Accessories | ${BRAND}`,
    description: "Buy laptops, desktops, monitors, networking and IT accessories from XOLNET Technologies Private Limited, Sambalpur.",
  },
  "/it-training": {
    title: `IT Training Courses in Sambalpur – XOLNET Academy | ${BRAND}`,
    description: "IT courses in Sambalpur: Full Stack, Python, Java, CCNA, Cyber Security, AI, databases, ITIL and digital marketing at XOLNET Academy.",
  },
  "/about": {
    title: `About Us | ${BRAND}`,
    description: "About XOLNET Technologies Private Limited (Xolnet), a Sambalpur, Odisha company for digital marketing, IT products and IT training.",
  },
  "/contact": {
    title: `Contact Us | ${BRAND}`,
    description: "Contact XOLNET Technologies Private Limited: info@xolnet.in, +91 9692791725, Pragati Vihar, Ainthapali, Sambalpur, Odisha.",
  },
};

const setMeta = (selector, attr, key, value) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(selector.startsWith("link") ? "link" : "meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute(selector.startsWith("link") ? "href" : "content", value);
};

export const Seo = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const path = pathname.toLowerCase().replace(/\/$/, "") || "/";
    const page = PAGES[path];
    const isPrivate = path.startsWith("/admin") || path.startsWith("/login");
    const url = `${SITE}${path === "/" ? "/" : path}`;

    document.title = page ? page.title : `${BRAND} | Xolnet`;
    if (page) {
      setMeta('meta[name="description"]', "name", "description", page.description);
      setMeta('meta[property="og:title"]', "property", "og:title", page.title);
      setMeta('meta[property="og:description"]', "property", "og:description", page.description);
    }
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('link[rel="canonical"]', "rel", "canonical", url);
    setMeta('meta[name="robots"]', "name", "robots", isPrivate || !page ? "noindex, nofollow" : "index, follow");
  }, [pathname]);
  return null;
};
