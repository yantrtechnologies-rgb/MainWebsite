import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { STATUSES, STATUS_COLORS, VERTICAL_LABELS } from "@/lib/leads";

const LeadRow = ({ l, onStatus, onView }) => (
  <tr data-testid={`lead-row-${l.id}`} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
    <td className="px-4 py-3">
      <p className="font-semibold text-white">{l.name}</p>
      <p className="text-slate-400 text-xs">{l.email || l.phone}</p>
      <p className="text-slate-500 text-xs font-mono">{l.id}</p>
    </td>
    <td className="px-4 py-3 hidden md:table-cell"><Badge variant="outline" className="border-white/15 text-slate-300">{VERTICAL_LABELS[l.vertical] || l.vertical}</Badge></td>
    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 max-w-[180px] truncate">{l.interest || "—"}</td>
    <td className="px-4 py-3">
      <Select value={l.status} onValueChange={(v) => onStatus(l.id, v)}>
        <SelectTrigger data-testid={`lead-status-${l.id}`} className="h-8 w-40 border-0 bg-transparent p-0">
          <Badge className={`${STATUS_COLORS[l.status]} border-0`}>{l.status}</Badge>
        </SelectTrigger>
        <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
      </Select>
    </td>
    <td className="px-4 py-3 text-right">
      <Button data-testid={`lead-view-${l.id}`} size="sm" variant="ghost" onClick={() => onView(l)} className="text-[#84CC16] hover:bg-white/10">View</Button>
    </td>
  </tr>
);

const HEADERS = [["Lead", ""], ["Vertical", "hidden md:table-cell"], ["Interest", "hidden lg:table-cell"], ["Status", ""]];

export const LeadTable = ({ leads, loading, onStatus, onView }) => (
  <div data-testid="admin-lead-table" className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
    {loading ? (
      <div className="py-20 grid place-items-center"><Loader2 className="w-7 h-7 animate-spin text-slate-500" /></div>
    ) : leads.length === 0 ? (
      <div data-testid="admin-empty" className="py-20 text-center text-slate-500">No leads yet. Submit an enquiry on the website to see it here.</div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-slate-400 text-xs uppercase tracking-wide">
            <tr>
              {HEADERS.map(([h, cls]) => <th key={h} className={`text-left font-semibold px-4 py-3 ${cls}`}>{h}</th>)}
              <th className="text-right font-semibold px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>{leads.map((l) => <LeadRow key={l.id} l={l} onStatus={onStatus} onView={onView} />)}</tbody>
        </table>
      </div>
    )}
  </div>
);
