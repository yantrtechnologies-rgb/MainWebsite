import React, { useState } from "react";
import { Mail, MapPin, Clock, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PageHero } from "@/components/PageHero";
import api, { formatApiError } from "@/lib/api";
import { COMPANY } from "@/data/siteData";

const MAP_QUERY = "Pragati Vihar, Ainthapali, Sambalpur, Odisha";

const TYPES = [
  { v: "marketing", l: "Digital Marketing" },
  { v: "products", l: "IT Product Sales" },
  { v: "academy", l: "IT Training" },
  { v: "corporate", l: "Corporate Training" },
  { v: "general", l: "Website Development" },
  { v: "general", l: "Technical Consultation" },
  { v: "general", l: "General Enquiry" },
];

export default function Contact() {
  const [form, setForm] = useState({ vertical: "general", category: "General Enquiry", name: "", email: "", phone: "", company: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || (!form.email.trim() && !form.phone.trim())) { toast.error("Please provide your name and a phone number or email."); return; }
    setSending(true);
    try {
      const { data } = await api.post("/enquiries", { ...form, email: form.email.trim() || null });
      setDone(data);
      toast.success("Message sent — we'll be in touch!");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to send.");
    } finally { setSending(false); }
  };

  return (
    <>
      <PageHero eyebrow="/// Contact & Enquiries" title="Let's start a conversation." desc="Pick an enquiry type and tell us what you need — the right specialist will get back to you." />
      <section className="py-16 lg:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-8">
          <div className="space-y-5">
            {[
              { icon: Mail, l: "Email", v: COMPANY.email },
              { icon: Phone, l: "Phone", v: COMPANY.phone },
              { icon: MapPin, l: "Office", v: COMPANY.address },
              { icon: Clock, l: "Hours", v: COMPANY.hours },
            ].map((c) => (
              <div key={c.l} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-[#2563EB]/10 text-[#2563EB]"><c.icon className="w-5 h-5" /></span>
                <div><p className="text-sm text-slate-400">{c.l}</p><p className="font-semibold text-slate-900">{c.v}</p></div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-8">
            {done ? (
              <div data-testid="contact-success" className="text-center py-16">
                <div className="grid place-items-center w-16 h-16 rounded-full bg-[#84CC16]/15 mx-auto mb-4"><CheckCircle2 className="w-9 h-9 text-[#84CC16]" /></div>
                <h3 className="font-display text-2xl font-extrabold text-slate-900">Message received!</h3>
                <p className="text-slate-600 mt-2">{done.message}</p>
                <p className="text-sm text-slate-500 mt-4">Reference ID: <span className="font-mono text-[#2563EB]">{done.id}</span></p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <Label>Enquiry type</Label>
                  <Select value={form.category} onValueChange={(v) => { const t = TYPES.find((x) => x.l === v); set("category", v); set("vertical", t?.v || "general"); }}>
                    <SelectTrigger data-testid="contact-type" className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>{TYPES.map((t) => <SelectItem key={t.l} value={t.l}>{t.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><Label>Full name *</Label><Input data-testid="contact-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5" /></div>
                  <div><Label>Email</Label><Input data-testid="contact-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div><Label>Phone</Label><Input data-testid="contact-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5" /></div>
                  <div><Label>Company</Label><Input data-testid="contact-company" value={form.company} onChange={(e) => set("company", e.target.value)} className="mt-1.5" /></div>
                </div>
                <p data-testid="contact-hint" className="text-xs text-slate-500 -mt-2">* Phone number or email is required.</p>
                <div><Label>Message</Label><Textarea data-testid="contact-message" value={form.message} onChange={(e) => set("message", e.target.value)} rows={4} className="mt-1.5" placeholder="How can we help?" /></div>
                <Button data-testid="contact-submit" type="submit" disabled={sending} className="w-full bg-[#0B0F19] hover:bg-[#2563EB] text-white rounded-full h-12 font-semibold">
                  {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div data-testid="contact-map" className="rounded-3xl overflow-hidden border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#2563EB]" />
                <p className="font-semibold text-slate-900">Visit us — {COMPANY.address}</p>
              </div>
              <a data-testid="contact-map-directions" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#2563EB] hover:underline">Get directions →</a>
            </div>
            <iframe
              data-testid="contact-map-iframe"
              title="XOLNET Technologies office location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&output=embed`}
              className="w-full h-[320px] sm:h-[400px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
