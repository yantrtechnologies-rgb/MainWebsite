import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEnquiry } from "@/context/contexts";
import { useEnquiryForm } from "@/hooks/useEnquiryForm";
import { StepService, StepDetails, StepContact, EnquirySuccess } from "@/components/enquiry/EnquirySteps";

const STEPS = { 1: StepService, 2: StepDetails, 3: StepContact };
const primaryCls = "bg-[#84CC16] text-[#0B0F19] hover:bg-[#2563EB] hover:text-white font-semibold rounded-full px-6";

const Progress = ({ step }) => (
  <div className="flex gap-1.5 mt-4">
    {[1, 2, 3].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#2563EB]" : "bg-white/10"}`} />)}
  </div>
);

const Footer = ({ step, setStep, submitting, submit }) => (
  <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
    <Button variant="ghost" disabled={step === 1} onClick={() => setStep((s) => s - 1)} className="text-slate-400 hover:text-white disabled:opacity-30">
      <ChevronLeft className="w-4 h-4 mr-1" /> Back
    </Button>
    {step < 3 ? (
      <Button data-testid="enquiry-next-btn" onClick={() => setStep((s) => s + 1)} className={primaryCls}>Continue <ChevronRight className="w-4 h-4 ml-1" /></Button>
    ) : (
      <Button data-testid="enquiry-form-submit-button" disabled={submitting} onClick={submit} className={primaryCls}>
        {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Submit Enquiry"}
      </Button>
    )}
  </div>
);

export const EnquiryModal = () => {
  const { open, vertical, interest, close } = useEnquiry();
  const f = useEnquiryForm({ open, vertical, interest });
  const Step = STEPS[f.step];
  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent data-testid="enquiry-modal" className="sm:max-w-lg p-0 overflow-hidden gap-0 border-slate-800 bg-[#0B0F19] text-white">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <p className="eyebrow text-[#84CC16]">/// Start a conversation</p>
          <h3 className="font-display text-2xl font-extrabold mt-1">Tell us what you need</h3>
          {f.step < 4 && <Progress step={f.step} />}
        </div>
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {Step && <Step form={f.form} set={f.set} />}
          {f.step === 4 && f.done && <EnquirySuccess done={f.done} onClose={close} />}
        </div>
        {f.step < 4 && <Footer step={f.step} setStep={f.setStep} submitting={f.submitting} submit={f.submit} />}
      </DialogContent>
    </Dialog>
  );
};
