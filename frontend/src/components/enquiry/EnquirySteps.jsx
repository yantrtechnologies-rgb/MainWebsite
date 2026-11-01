import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, Laptop, GraduationCap, Building2, CheckCircle2 } from "lucide-react";

const VERTICAL_OPTIONS = [
  { id: "marketing", label: "Digital Marketing", icon: TrendingUp, desc: "Grow brand & revenue" },
  { id: "products", label: "IT Products", icon: Laptop, desc: "Buy or quote hardware" },
  { id: "academy", label: "IT Training", icon: GraduationCap, desc: "Enrol in a course" },
  { id: "corporate", label: "Corporate / Bulk", icon: Building2, desc: "Teams & institutions" },
];

const inputCls = "mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500";

const Field = ({ label, k, form, set, type = "text", placeholder, area }) => (
  <div>
    <Label className="text-slate-300">{label}</Label>
    {area ? (
      <Textarea data-testid={`enquiry-${k}`} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} rows={3} className={inputCls} />
    ) : (
      <Input data-testid={`enquiry-${k}`} type={type} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} className={inputCls} />
    )}
  </div>
);

export const StepService = ({ form, set }) => (
  <div>
    <Label className="text-slate-300 mb-3 block">Which service are you interested in?</Label>
    <div className="grid grid-cols-2 gap-3">
      {VERTICAL_OPTIONS.map(({ id, label, icon: Icon, desc }) => {
        const active = form.vertical === id;
        return (
          <button key={id} data-testid={`enquiry-vertical-${id}`} onClick={() => set("vertical", id)}
            className={`text-left p-4 rounded-xl border transition-all ${active ? "border-[#84CC16] bg-[#84CC16]/10" : "border-white/10 hover:border-white/30 bg-white/[0.02]"}`}>
            <Icon className={`w-5 h-5 mb-2 ${active ? "text-[#84CC16]" : "text-[#3B82F6]"}`} />
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-slate-400">{desc}</div>
          </button>
        );
      })}
    </div>
  </div>
);

export const StepDetails = ({ form, set }) => (
  <div className="space-y-4">
    {form.interest && <Field label="Interested in" k="interest" form={form} set={set} />}
    <Field label="Your budget range" k="budget" form={form} set={set} placeholder="e.g. ₹50,000 – ₹1,00,000" />
    <Field label="Timeline" k="timeline" form={form} set={set} placeholder="e.g. Within 2 weeks" />
    <Field label="Project / requirement details" k="message" form={form} set={set} placeholder="Tell us a bit about your goals…" area />
  </div>
);

export const StepContact = ({ form, set }) => (
  <div className="space-y-4">
    <Field label="Full name *" k="name" form={form} set={set} />
    <div className="grid sm:grid-cols-2 gap-4">
      <Field label="Email" k="email" type="email" form={form} set={set} />
      <Field label="Phone" k="phone" type="tel" form={form} set={set} />
    </div>
    <p data-testid="enquiry-contact-hint" className="text-xs text-[#84CC16] -mt-2">* Phone number or email is required so we can send your quote.</p>
    <Field label="Company / Organisation" k="company" form={form} set={set} />
  </div>
);

export const EnquirySuccess = ({ done, onClose }) => (
  <div className="text-center py-6" data-testid="enquiry-success">
    <div className="grid place-items-center w-16 h-16 rounded-full bg-[#84CC16]/15 mx-auto mb-4">
      <CheckCircle2 className="w-9 h-9 text-[#84CC16]" />
    </div>
    <h4 className="font-display text-2xl font-extrabold">You're all set!</h4>
    <p className="text-slate-400 mt-2">{done.message}</p>
    <p className="text-sm text-slate-500 mt-4">Reference ID: <span className="font-mono text-[#3B82F6]">{done.id}</span></p>
    <Button data-testid="enquiry-close-btn" onClick={onClose} className="mt-6 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-full px-8">Done</Button>
  </div>
);
