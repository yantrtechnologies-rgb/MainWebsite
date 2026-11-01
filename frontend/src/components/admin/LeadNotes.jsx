import React, { useState } from "react";
import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const LeadNotes = ({ notes, onAdd }) => {
  const [note, setNote] = useState("");
  const submit = async () => {
    if (!note.trim()) return;
    if (await onAdd(note)) setNote("");
  };
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2"><StickyNote className="w-3.5 h-3.5" /> Notes</p>
      <div className="space-y-2 mb-3">
        {notes.length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
        {notes.map((n) => (
          <div key={`${n.at}-${n.by}-${n.text.slice(0, 20)}`} className="rounded-lg bg-white/[0.04] p-3 text-sm">
            <p className="text-slate-200">{n.text}</p>
            <p className="text-xs text-slate-500 mt-1">{n.by} • {new Date(n.at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <Textarea data-testid="drawer-note-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" rows={2} className="bg-white/5 border-white/10 text-white" />
      <Button data-testid="drawer-add-note" onClick={submit} size="sm" className="mt-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white">Add Note</Button>
    </div>
  );
};
