import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Laptop, GraduationCap, Building2, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useEnquiry } from "@/context/contexts";

const VERTICAL_OPTIONS = [
  { id: "marketing", label: "Digital Marketing", icon: TrendingUp, desc: "Grow brand & revenue" },
  { id: "products", label: "IT Products", icon: Laptop, desc: "Buy or quote hardware" },
  { id: "academy", label: "IT Training", icon: GraduationCap, desc: "Enrol in a course" },
  { id: "corporate", label: "Corporate / Bulk", icon: Building2, desc: "Teams & institutions" },
];

const BUDGETS = ["< $1,000", "$1,000 – $5,000", "$5,000 – $20,000", "$20,000+", "Not sure yet"];

const empty = { vertical: "marketing", name: "", email: "", phone: "", company: "", budget: "", timeline: "", interest: "", message: "" };

export const EnquiryModal = () => {
  const { open, vertical, interest, close } = useEnquiry();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (open) {
      setStep(1);
      setDone(null);
      setForm({ ...empty, vertical: vertical || "marketing", interest: interest || "" });
    }
  }, [open, vertical, interest]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name || !form.email) {
      toast.error("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/enquiries", form);
      setDone(data);
      setStep(4);
      toast.success("Enquiry submitted successfully!");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = step === 1 ? !!form.vertical : true;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent data-testid="enquiry-modal" className="sm:max-w-lg p-0 overflow-hidden gap-0 border-slate-800 bg-[#0B0F19] text-white">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <p className="eyebrow text-[#84CC16]">/// Start a conversation</p>
          <h3 className="font-display text-2xl font-extrabold mt-1">Tell us what you need</h3>
          {step < 4 && (
            <div className="flex gap-1.5 mt-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#2563EB]" : "bg-white/10"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div>
              <Label className="text-slate-300 mb-3 block">Which service are you interested in?</Label>
              <div className="grid grid-cols-2 gap-3">
                {VERTICAL_OPTIONS.map((o) => {
                  const Icon = o.icon;
                  const active = form.vertical === o.id;
                  return (
                    <button
                      key={o.id}
                      data-testid={`enquiry-vertical-${o.id}`}
                      onClick={() => set("vertical", o.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        active ? "border-[#84CC16] bg-[#84CC16]/10" : "border-white/10 hover:border-white/30 bg-white/[0.02]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${active ? "text-[#84CC16]" : "text-[#3B82F6]"}`} />
                      <div className="font-semibold text-sm">{o.label}</div>
                      <div className="text-xs text-slate-400">{o.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {form.interest && (
                <div>
                  <Label className="text-slate-300">Interested in</Label>
                  <Input data-testid="enquiry-interest" value={form.interest} onChange={(e) => set("interest", e.target.value)} className="mt-1.5 bg-white/5 border-white/10 text-white" />
                </div>
              )}
              <div>
                <Label className="text-slate-300">Estimated budget</Label>
                <Select value={form.budget} onValueChange={(v) => set("budget", v)}>
                  <SelectTrigger data-testid="enquiry-budget" className="mt-1.5 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Select a range" /></SelectTrigger>
                  <SelectContent>{BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Timeline</Label>
                <Input data-testid="enquiry-timeline" value={form.timeline} onChange={(e) => set("timeline", e.target.value)} placeholder="e.g. Within 2 weeks" className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
              </div>
              <div>
                <Label className="text-slate-300">Project / requirement details</Label>
                <Textarea data-testid="enquiry-message" value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us a bit about your goals…" rows={3} className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300">Full name *</Label>
                <Input data-testid="enquiry-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1.5 bg-white/5 border-white/10 text-white" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Email *</Label>
                  <Input data-testid="enquiry-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="mt-1.5 bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300">Phone</Label>
                  <Input data-testid="enquiry-phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="mt-1.5 bg-white/5 border-white/10 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Company / Organisation</Label>
                <Input data-testid="enquiry-company" value={form.company} onChange={(e) => set("company", e.target.value)} className="mt-1.5 bg-white/5 border-white/10 text-white" />
              </div>
            </div>
          )}

          {step === 4 && done && (
            <div className="text-center py-6" data-testid="enquiry-success">
              <div className="grid place-items-center w-16 h-16 rounded-full bg-[#84CC16]/15 mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-[#84CC16]" />
              </div>
              <h4 className="font-display text-2xl font-extrabold">You're all set!</h4>
              <p className="text-slate-400 mt-2">{done.message}</p>
              <p className="text-sm text-slate-500 mt-4">Reference ID: <span className="font-mono text-[#3B82F6]">{done.id}</span></p>
              <Button data-testid="enquiry-close-btn" onClick={close} className="mt-6 bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-full px-8">Done</Button>
            </div>
          )}
        </div>

        {step < 4 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)} className="text-slate-400 hover:text-white disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 3 ? (
              <Button data-testid="enquiry-next-btn" disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-[#84CC16] text-[#0B0F19] hover:bg-[#2563EB] hover:text-white font-semibold rounded-full px-6">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button data-testid="enquiry-form-submit-button" disabled={submitting} onClick={submit} className="bg-[#84CC16] text-[#0B0F19] hover:bg-[#2563EB] hover:text-white font-semibold rounded-full px-6">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Submit Enquiry"}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
