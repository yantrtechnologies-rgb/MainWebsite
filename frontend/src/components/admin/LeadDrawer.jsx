import React from "react";
import { Mail, Phone, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LeadNotes } from "@/components/admin/LeadNotes";
import { STATUSES, STATUS_COLORS, VERTICAL_LABELS } from "@/lib/leads";

const Detail = ({ label, value }) => value ? <p><span className="text-slate-500">{label}:</span> {value}</p> : null;

const Contact = ({ icon: Icon, value }) => value ? <p className="flex items-center gap-2 text-slate-300"><Icon className="w-4 h-4 text-[#2563EB]" /> {value}</p> : null;

export const LeadDrawer = ({ lead, onClose, onStatus, onAddNote }) => (
  <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
    <SheetContent data-testid="lead-detail-drawer" className="bg-[#0B0F19] text-white border-white/10 w-full sm:max-w-md overflow-y-auto">
      {lead && (
        <>
          <SheetHeader><SheetTitle className="text-white font-display">{lead.name}</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${STATUS_COLORS[lead.status]} border-0`}>{lead.status}</Badge>
              <span className="text-xs font-mono text-slate-500">{lead.id}</span>
            </div>
            <div className="space-y-2 text-sm">
              <Contact icon={Mail} value={lead.email} />
              <Contact icon={Phone} value={lead.phone} />
              <Contact icon={Building2} value={lead.company} />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm space-y-1.5">
              <Detail label="Vertical" value={VERTICAL_LABELS[lead.vertical] || lead.vertical} />
              <Detail label="Category" value={lead.category} />
              <Detail label="Interest" value={lead.interest} />
              <Detail label="Budget" value={lead.budget} />
              <Detail label="Timeline" value={lead.timeline} />
              {lead.message && <p className="pt-1"><span className="text-slate-500">Message:</span><br />{lead.message}</p>}
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide">Change status</label>
              <Select value={lead.status} onValueChange={(v) => onStatus(lead.id, v)}>
                <SelectTrigger data-testid="drawer-status-select" className="mt-1.5 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <LeadNotes key={lead.id} notes={lead.notes || []} onAdd={(n) => onAddNote(lead.id, n)} />
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);
