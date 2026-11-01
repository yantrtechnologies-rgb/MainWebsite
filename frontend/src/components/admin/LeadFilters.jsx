import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUSES, VERTICAL_LABELS } from "@/lib/leads";

const triggerCls = "w-full bg-white/5 border-white/10 text-white";

export const LeadFilters = ({ filters, setFilter, onExport }) => (
  <div className="flex flex-col lg:flex-row gap-3 mb-5">
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
      <Input data-testid="admin-search" value={filters.search} onChange={(e) => setFilter("search", e.target.value)} placeholder="Search name, email, company, ID…" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
    </div>
    <Select value={filters.status} onValueChange={(v) => setFilter("status", v)}>
      <SelectTrigger data-testid="admin-status-filter-dropdown" className={`${triggerCls} lg:w-48`}><SelectValue placeholder="Status" /></SelectTrigger>
      <SelectContent>{["All", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
    </Select>
    <Select value={filters.vertical} onValueChange={(v) => setFilter("vertical", v)}>
      <SelectTrigger data-testid="admin-vertical-filter" className={`${triggerCls} lg:w-44`}><SelectValue placeholder="Vertical" /></SelectTrigger>
      <SelectContent>{["All", ...Object.keys(VERTICAL_LABELS)].map((v) => <SelectItem key={v} value={v}>{v === "All" ? "All" : VERTICAL_LABELS[v]}</SelectItem>)}</SelectContent>
    </Select>
    <Button data-testid="admin-export-csv" onClick={onExport} variant="outline" className="border-white/15 text-white bg-transparent hover:bg-white/10">Export CSV</Button>
  </div>
);
