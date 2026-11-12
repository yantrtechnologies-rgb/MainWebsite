import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/contexts";
import { CatalogManager } from "@/components/admin/CatalogManager";

const ICON_HINT = "Search, Share2, Target, Palette, Clapperboard, Code2, PenTool, Mail, LineChart, Sparkles";

const CONFIGS = {
  "influencer-offers": {
    label: "Influencer Marketing", singular: "Influencer Offer", plural: "Influencer Offers", titleKey: "title", subKey: "description",
    fields: [
      { key: "title", label: "Offer name", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "pricing", label: "Pricing note", hint: "e.g. From ₹15,000 or leave blank for custom pricing" },
      { key: "image", label: "Main photo", type: "image" },
      { key: "second_image", label: "Second photo (optional)", type: "image" },
      { key: "third_image", label: "Third photo (optional)", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
  courses: {
    label: "IT Courses", singular: "Course", plural: "Courses", titleKey: "title", subKey: "duration",
    fields: [
      { key: "title", label: "Course name", required: true },
      { key: "description", label: "Short description", type: "textarea" },
      { key: "duration", label: "Duration", hint: "e.g. 3 Months" },
      { key: "level", label: "Level", hint: "e.g. Beginner → Advanced" },
      { key: "mode", label: "Mode", hint: "e.g. Online & Offline" },
      { key: "topics", label: "Topics (one per line)", type: "list" },
      { key: "badge", label: "Badge", hint: "e.g. Placement Support" },
      { key: "image", label: "Image", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
  packages: {
    label: "Digital Marketing Packages", singular: "Package", plural: "Packages", titleKey: "title", subKey: "description",
    fields: [
      { key: "title", label: "Package name", required: true },
      { key: "description", label: "Short description", type: "textarea" },
      { key: "features", label: "What's included (one per line)", type: "list" },
      { key: "badge", label: "Badge (optional)", hint: "e.g. Most Popular" },
      { key: "icon", label: "Icon name", hint: ICON_HINT },
      { key: "image", label: "Image (optional)", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
  products: {
    label: "IT Accessories", singular: "Accessory", plural: "Accessories", titleKey: "name", subKey: "category",
    fields: [
      { key: "name", label: "Product name", required: true },
      { key: "category", label: "Category", hint: "e.g. Storage, Networking, Printing" },
      { key: "description", label: "Short description", type: "textarea" },
      { key: "badge", label: "Badge", hint: "e.g. Ask for Quote" },
      { key: "image", label: "Image", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
  testimonials: {
    label: "Success Stories", singular: "Story", plural: "Stories", titleKey: "name", subKey: "quote",
    fields: [
      { key: "name", label: "Client / student name", required: true },
      { key: "org", label: "Company or course", hint: "e.g. Full Stack Development student" },
      { key: "service", label: "Service used", hint: "e.g. Social Media Marketing" },
      { key: "quote", label: "What they said", type: "textarea" },
      { key: "rating", label: "Rating (1–5)", type: "number", default: 5 },
      { key: "label", label: "Tag (optional)", hint: "e.g. Sample review — clear it for genuine reviews" },
      { key: "image", label: "Photo (optional)", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
  clients: {
    label: "Client Logos", singular: "Client", plural: "Clients", titleKey: "name", subKey: "name",
    fields: [
      { key: "name", label: "Client name", required: true },
      { key: "image", label: "Logo (optional — name is shown if empty)", type: "image" },
      { key: "order", label: "Display order (lower shows first)", type: "number" },
    ],
  },
};

export default function AdminContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const allowed = user && (user.role === "admin" || user.role === "staff");

  useEffect(() => { if (!loading && !allowed) navigate("/login"); }, [loading, allowed, navigate]);
  if (!allowed) return <div className="min-h-screen bg-[#0B0F19] grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/xolnet.png" alt="XOLNET" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <p className="font-display font-bold leading-none">Website Content</p>
              <p className="text-xs text-slate-400">Courses, packages & accessories</p>
            </div>
          </div>
          <Link to="/admin" data-testid="content-back-to-leads" className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white"><ArrowLeft className="w-4 h-4" /> Leads</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="courses">
          <TabsList className="bg-white/5 border border-white/10 h-auto flex-wrap">
            {Object.entries(CONFIGS).map(([k, c]) => (
              <TabsTrigger key={k} value={k} data-testid={`content-tab-${k}`} className="text-slate-300 data-[state=active]:bg-[#2563EB] data-[state=active]:text-white">{c.label}</TabsTrigger>
            ))}
          </TabsList>
          {Object.entries(CONFIGS).map(([k, c]) => (
            <TabsContent key={k} value={k} className="mt-6"><CatalogManager kind={k} config={c} /></TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
