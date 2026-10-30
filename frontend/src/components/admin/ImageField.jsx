import React, { useRef, useState } from "react";
import { Upload, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { imgUrl } from "@/lib/catalog";

export const ImageField = ({ value, onChange }) => {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be 5 MB or smaller"); return; }
    const fd = new FormData();
    fd.append("file", file);
    setBusy(true);
    try {
      const { data } = await api.post("/admin/upload", fd);
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Upload failed");
    } finally {
      setBusy(false);
      ref.current.value = "";
    }
  };

  return (
    <div className="flex gap-4 items-start">
      <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 grid place-items-center">
        {value ? <img data-testid="image-field-preview" src={imgUrl(value)} alt="" className="w-full h-full object-cover" /> : <ImageOff className="w-6 h-6 text-slate-500" />}
      </div>
      <div className="flex-1 space-y-2">
        <Input data-testid="image-field-url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Paste an image link (https://…)" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
        <input ref={ref} data-testid="image-field-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => upload(e.target.files[0])} />
        <Button type="button" data-testid="image-field-upload-btn" disabled={busy} onClick={() => ref.current.click()} variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">
          {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />} {busy ? "Uploading…" : "Upload from device"}
        </Button>
      </div>
    </div>
  );
};
