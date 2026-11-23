// Post-build step: write one static HTML file per public page (build/about.html, ...)
// with its own <title>, description, canonical and readable fallback text, so
// crawlers that do not run JavaScript (Bing, ChatGPT, link previews) see real,
// page-specific content. React replaces the fallback text when it loads.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(here, "../build");
const template = fs.readFileSync(path.join(buildDir, "index.html"), "utf8");

const SITE = "https://www.xolnet.in";
const BRAND = "XOLNET Technologies Private Limited";
const CONTACT = `<p>Contact ${BRAND}: <a href="mailto:info@xolnet.in">info@xolnet.in</a> · <a href="tel:+919692791725">+91 9692791725</a> · Pragati Vihar, Ainthapali, Sambalpur, Odisha 768004, India. Open Monday to Saturday, 9:30 am to 6:30 pm. <a href="https://g.page/r/CcXo8lTM8JOuEBM/review">Review us on Google</a>.</p>`;
const SOCIAL = `<p>Follow XOLNET Technologies: <a href="https://www.linkedin.com/company/xolnet-technologies-pvt-ltd/" rel="me">LinkedIn</a> · <a href="https://x.com/xolnettech" rel="me">X (Twitter)</a> · <a href="https://www.instagram.com/xolnettechnologies/" rel="me">Instagram</a> · <a href="https://www.facebook.com/profile.php?id=61595691696048" rel="me">Facebook</a></p>`;
const NAV = `<nav><a href="/">Home</a> · <a href="/digital-marketing">Digital Marketing</a> · <a href="/it-products">IT Products</a> · <a href="/it-training">IT Training</a> · <a href="/about">About XOLNET</a> · <a href="/contact">Contact</a></nav>`;

const list = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

const PAGES = [
  {
    path: "/",
    file: "index.html",
    title: "XOLNET Technologies – Digital Marketing, Web Development & IT Training in Sambalpur",
    description: "XOLNET Technologies Private Limited (Xolnet), Sambalpur, Odisha: digital marketing, website development, IT products, and AI & computer training for businesses, students and professionals.",
    h1: "Digital Marketing, Web Development & IT Training in Sambalpur – XOLNET Technologies Private Limited",
    body: `<p>XOLNET Technologies Private Limited (Xolnet) helps businesses in Sambalpur and across Odisha with digital marketing, website development and IT hardware, and trains students and professionals in AI, programming and computer skills.</p>
<h2>Digital marketing</h2>${list(["Search engine optimisation (SEO)", "Social media marketing", "Performance marketing on Google and Meta", "Brand strategy and identity", "Creative and video production", "Website design and development", "Content, email and marketing automation", "Analytics and conversion optimisation", "Influencer marketing"])}
<h2>IT products and accessories</h2><p>Computers, laptops, components, networking, printing and accessories, with bulk and corporate procurement quotations.</p>
<h2>XOLNET Academy – IT training</h2><p>Job-ready IT courses in full stack development, Python, Java, networking (CCNA), cyber security, artificial intelligence, databases, ITIL and digital marketing, with hands-on projects, mentorship and online or classroom batches.</p>`,
  },
  {
    path: "/digital-marketing",
    title: `Digital Marketing Agency in Sambalpur | ${BRAND}`,
    description: "SEO, social media, performance ads, branding and website development by XOLNET Technologies, Sambalpur, Odisha.",
    h1: "Digital Marketing Agency in Sambalpur – XOLNET Technologies",
    body: `<p>Creative storytelling, performance marketing and data-driven strategy that turns attention into revenue. Xolnet builds digital marketing packages around your goals.</p>
<h2>Services</h2>${list(["Search Engine Optimization – technical SEO, content and authority building", "Social Media Marketing – always-on content that builds communities", "Performance Marketing – paid media across Google, Meta and beyond", "Brand Strategy & Identity – positioning, messaging and visual systems", "Creative & Video Production – reels, ads and brand films", "Website Design & Development – fast, conversion-first websites", "Content Marketing", "Email & Marketing Automation", "Analytics & CRO", "Influencer Marketing – find creators who fit your audience"])}
<p>Request a tailored marketing proposal: tell us your goals and budget and we will come back with a concrete plan.</p>`,
  },
  {
    path: "/it-products",
    title: `IT Products – Laptops, Desktops & Accessories | ${BRAND}`,
    description: "Buy laptops, desktops, monitors, networking and IT accessories from XOLNET Technologies Private Limited, Sambalpur.",
    h1: "IT Products & Accessories in Sambalpur – XOLNET Technologies",
    body: `<p>Computers, laptops, components, networking, printing and accessories — tell us what you need and we will send the best quote.</p>${list(["Laptops", "Desktops and workstations", "Monitors", "Networking", "Storage", "Printers", "Computer accessories"])}
<h2>Bulk & corporate procurement</h2><p>Kitting out an office, lab or team? Send us your list and we will prepare a competitive quotation by phone or email.</p>`,
  },
  {
    path: "/it-training",
    title: `IT Training Courses in Sambalpur – XOLNET Academy | ${BRAND}`,
    description: "IT courses in Sambalpur: Full Stack, Python, Java, CCNA, Cyber Security, AI, databases, ITIL and digital marketing at XOLNET Academy.",
    h1: "XOLNET Academy – IT Training Courses in Sambalpur",
    body: `<p>Learn today, build tomorrow. Job-ready IT courses with hands-on projects, mentorship from industry experts and flexible online and classroom batches.</p>${list(["Full Stack Development", "Python Programming", "Core & Advanced Java", "Networking (CCNA)", "Cyber Security", "Artificial Intelligence", "Database Management", "ITIL Foundation", "Digital Marketing"])}
<p>Corporate training: custom cohorts, on-site or instructor-led online. Book a free counselling session to pick the right track.</p>`,
  },
  {
    path: "/about",
    title: `About Us | ${BRAND}`,
    description: "About XOLNET Technologies Private Limited (Xolnet), a Sambalpur, Odisha company for digital marketing, IT products and IT training.",
    h1: `About ${BRAND}`,
    body: `<p>${BRAND} (Xolnet) unites a creative digital agency, an enterprise IT store and a hands-on technology academy into one dependable partner — creativity, hardware and talent under one roof.</p>
<p>The company is registered in India (CIN U62090OD2026PTC056154) and is based in Sambalpur, Odisha.</p>`,
  },
  {
    path: "/contact",
    title: `Contact Us | ${BRAND}`,
    description: "Contact XOLNET Technologies Private Limited: info@xolnet.in, +91 9692791725, Pragati Vihar, Ainthapali, Sambalpur, Odisha.",
    h1: `Contact ${BRAND}`,
    body: `<p>Pick an enquiry type and tell us what you need — the right specialist will get back to you.</p>`,
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const replaceOnce = (html, re, value, label) => {
  if (!re.test(html)) throw new Error(`prerender-seo: could not find ${label} in build/index.html`);
  return html.replace(re, value);
};

for (const page of PAGES) {
  const url = `${SITE}${page.path}`;
  let html = template;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`, "<title>");
  html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${esc(page.description)}" />`, "meta description");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`, "canonical");
  html = replaceOnce(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${esc(page.title)}" />`, "og:title");
  html = replaceOnce(html, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${esc(page.description)}" />`, "og:description");
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`, "og:url");
  html = replaceOnce(
    html,
    // The fallback holds no nested <div>, so its closing tag is the first </div> followed by a script or </body>.
    /<div id="root">[\s\S]*?<\/div>(\s*(?:<script|<\/body>))/,
    `<div id="root">\n<header><h1>${page.h1}</h1></header>\n${NAV}\n<main>${page.body}</main>\n<footer>${CONTACT}${SOCIAL}<p>© ${new Date().getFullYear()} ${BRAND}. All rights reserved.</p></footer>\n</div>$1`,
    "#root fallback"
  );
  const file = page.file || `${page.path.slice(1)}.html`;
  fs.writeFileSync(path.join(buildDir, file), html);
  console.log(`prerender-seo: wrote ${file}`);
}
