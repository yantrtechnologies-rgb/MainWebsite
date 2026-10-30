import React, { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useCatalog, imgUrl } from "@/lib/catalog";
import { ItemFormDialog } from "@/components/admin/ItemFormDialog";

export const CatalogManager = ({ kind, config }) => {
  const { items, loading, reload } = useCatalog(kind);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const openForm = (item) => { setEditing(item); setOpen(true); };

  const save = async (payload) => {
    try {
      if (editing) await api.put(`/admin/catalog/${kind}/${editing.id}`, payload);
      else await api.post(`/admin/catalog/${kind}`, payload);
      toast.success(`${config.singular} saved`);
      setOpen(false);
      reload();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Save failed");
    }
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete "${item[config.titleKey]}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/catalog/${kind}/${item.id}`);
      toast.success("Deleted");
      reload();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Delete failed");
    }
  };

  return (
    <div data-testid={`catalog-manager-${kind}`}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-slate-400"><span data-testid={`catalog-count-${kind}`}>{items.length}</span> {config.plural.toLowerCase()} on the website</p>
        <Button data-testid={`catalog-add-${kind}`} onClick={() => openForm(null)} className="bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full">
          <Plus className="w-4 h-4 mr-1" /> Add {config.singular}
        </Button>
      </div>
      {loading ? (
        <div className="grid place-items-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.id} data-testid={`catalog-item-${kind}-${it.id}`} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
              <div className="h-32 bg-white/5 grid place-items-center overflow-hidden">
                {it.image ? <img src={imgUrl(it.image)} alt={it[config.titleKey]} className="w-full h-full object-cover" /> : <ImageOff className="w-6 h-6 text-slate-600" />}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <p className="font-semibold leading-snug">{it[config.titleKey]}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{it[config.subKey]}</p>
                <div className="flex gap-2 mt-auto pt-4">
                  <Button data-testid={`catalog-edit-${it.id}`} size="sm" variant="outline" onClick={() => openForm(it)} className="flex-1 border-white/15 bg-transparent text-white hover:bg-white/10"><Pencil className="w-3.5 h-3.5 mr-1" /> Edit</Button>
                  <Button data-testid={`catalog-delete-${it.id}`} size="sm" variant="ghost" onClick={() => remove(it)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <ItemFormDialog open={open} onClose={() => setOpen(false)} config={config} item={editing} onSave={save} />
    </div>
  );
};
