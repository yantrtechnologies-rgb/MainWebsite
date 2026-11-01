import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageField } from "@/components/admin/ImageField";

const fieldCls = "mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500";

const toFormValue = (f, v) => {
  if (f.type === "list") return (v || []).join("\n");
  return v ?? f.default ?? (f.type === "number" ? 0 : "");
};

const toPayloadValue = (f, v) => {
  if (f.type === "list") return (v || "").split("\n").map((x) => x.trim()).filter(Boolean);
  if (f.type === "number") return Number(v) || 0;
  return v;
};

const FieldInput = ({ f, value, onChange }) => {
  if (f.type === "image") return <div className="mt-1.5"><ImageField value={value || ""} onChange={onChange} /></div>;
  if (f.type === "textarea" || f.type === "list") {
    return <Textarea data-testid={`item-field-${f.key}`} rows={f.type === "list" ? 4 : 3} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={f.hint} className={fieldCls} />;
  }
  return <Input data-testid={`item-field-${f.key}`} type={f.type === "number" ? "number" : "text"} required={f.required} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={f.hint} className={fieldCls} />;
};

export const ItemFormDialog = ({ open, onClose, config, item, onSave }) => {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(Object.fromEntries(config.fields.map((f) => [f.key, toFormValue(f, item?.[f.key])])));
  }, [open, item, config]);

  const submit = async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(config.fields.map((f) => [f.key, toPayloadValue(f, form[f.key])]));
    setSaving(true);
    try { await onSave(payload); } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="item-form-dialog" className="sm:max-w-xl bg-[#0B0F19] border-slate-800 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-display text-xl">{item ? "Edit" : "Add"} {config.singular}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {config.fields.map((f) => (
            <div key={f.key}>
              <Label className="text-slate-300">{f.label}{f.required && " *"}</Label>
              <FieldInput f={f} value={form[f.key]} onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))} />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-300 hover:text-white hover:bg-white/10">Cancel</Button>
            <Button data-testid="item-form-save" type="submit" disabled={saving} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full px-6">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
