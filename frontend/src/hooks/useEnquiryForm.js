import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

const EMPTY = { vertical: "marketing", name: "", email: "", phone: "", company: "", budget: "", timeline: "", interest: "", message: "" };

export const hasContact = (f) => !!f.name.trim() && (!!f.email.trim() || !!f.phone.trim());

export const useEnquiryForm = ({ open, vertical, interest }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setDone(null);
    setForm({ ...EMPTY, vertical: vertical || "marketing", interest: interest || "" });
  }, [open, vertical, interest]);

  const set = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);

  const submit = useCallback(async () => {
    if (!hasContact(form)) {
      toast.error("Please provide your name and a phone number or email.");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post("/enquiries", { ...form, email: form.email.trim() || null });
      setDone(data);
      setStep(4);
      toast.success("Enquiry submitted successfully!");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  return { step, setStep, form, set, submitting, done, submit };
};
