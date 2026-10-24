import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, LogOut, Search, Users, TrendingUp, Layers, Target, Loader2,
  Mail, Phone, Building2, X, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/contexts";

const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"];
const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  Qualified: "bg-violet-100 text-violet-700",
  "Proposal Sent": "bg-cyan-100 text-cyan-700",
  Converted: "bg-lime-100 text-lime-700",
  Lost: "bg-slate-200 text-slate-600",
};
const VERTICAL_LABELS = { marketing: "Marketing", products: "IT Products", academy: "Training", corporate: "Corporate", general: "General" };

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [verticalFilter, setVerticalFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "staff"))) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (verticalFilter !== "All") params.vertical = verticalFilter;
      if (search) params.search = search;
      const [l, m] = await Promise.all([
        api.get("/admin/enquiries", { params }),
        api.get("/admin/metrics"),
      ]);
      setLeads(l.data);
      setMetrics(m.data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Failed to load leads.");
    } finally { setLoading(false); }
  }, [statusFilter, verticalFilter, search]);

  useEffect(() => {
    if (!user) return;
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [user, load]);
  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/admin/enquiries/${id}/status`, { status });
      toast.success(`Moved to ${status}`);
      setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)));
      setSelected((s) => (s && s.id === id ? { ...s, status } : s));
      api.get("/admin/metrics").then((r) => setMetrics(r.data));
    } catch (e) { toast.error("Update failed."); }
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    try {
      const { data } = await api.post(`/admin/enquiries/${selected.id}/notes`, { note });
      setSelected((s) => ({ ...s, notes: [...(s.notes || []), data.note] }));
      setLeads((ls) => ls.map((l) => (l.id === selected.id ? { ...l, notes: [...(l.notes || []), data.note] } : l)));
      setNote("");
      toast.success("Note added");
    } catch (e) { toast.error("Could not add note."); }
  };

  const exportCsv = () => {
    const rows = [["ID", "Name", "Email", "Phone", "Company", "Vertical", "Status", "Interest", "Created"]];
    leads.forEach((l) => rows.push([l.id, l.name, l.email, l.phone || "", l.company || "", l.vertical, l.status, l.interest || "", l.created_at]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "yantr-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || !user) {
    return <div className="min-h-screen grid place-items-center bg-[#0B0F19]"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;
  }

  const METRIC_CARDS = metrics ? [
    { icon: Users, label: "Total Leads", value: metrics.total, color: "text-[#2563EB]" },
    { icon: TrendingUp, label: "Conversion Rate", value: `${metrics.conversion_rate}%`, color: "text-[#84CC16]" },
    { icon: Target, label: "Converted", value: metrics.converted, color: "text-[#F97316]" },
    { icon: Layers, label: "In Pipeline", value: metrics.total - metrics.converted - (metrics.by_status?.Lost || 0), color: "text-violet-500" },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <header className="border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#2563EB]"><Zap className="w-5 h-5" strokeWidth={2.5} /></span>
            <div>
              <p className="font-display font-bold leading-none">Yantr CRM</p>
              <p className="text-xs text-slate-400">Lead Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400 hidden sm:block">{user.name}</span>
            <Button data-testid="admin-logout" variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }} className="text-slate-300 hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map((m) => (
            <div key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/ /g, "-")}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <m.icon className={`w-6 h-6 ${m.color}`} />
              <p className="font-display text-3xl font-black mt-3">{m.value}</p>
              <p className="text-sm text-slate-400 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input data-testid="admin-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, company, ID…" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="admin-status-filter-dropdown" className="w-full lg:w-48 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>{["All", ...STATUSES].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={verticalFilter} onValueChange={setVerticalFilter}>
            <SelectTrigger data-testid="admin-vertical-filter" className="w-full lg:w-44 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Vertical" /></SelectTrigger>
            <SelectContent>{["All", "marketing", "products", "academy", "corporate", "general"].map((v) => <SelectItem key={v} value={v}>{v === "All" ? "All" : VERTICAL_LABELS[v]}</SelectItem>)}</SelectContent>
          </Select>
          <Button data-testid="admin-export-csv" onClick={exportCsv} variant="outline" className="border-white/15 text-white bg-transparent hover:bg-white/10">Export CSV</Button>
        </div>

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
                    <th className="text-left font-semibold px-4 py-3">Lead</th>
                    <th className="text-left font-semibold px-4 py-3 hidden md:table-cell">Vertical</th>
                    <th className="text-left font-semibold px-4 py-3 hidden lg:table-cell">Interest</th>
                    <th className="text-left font-semibold px-4 py-3">Status</th>
                    <th className="text-right font-semibold px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} data-testid={`lead-row-${l.id}`} className="border-t border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{l.name}</p>
                        <p className="text-slate-400 text-xs">{l.email}</p>
                        <p className="text-slate-500 text-xs font-mono">{l.id}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell"><Badge variant="outline" className="border-white/15 text-slate-300">{VERTICAL_LABELS[l.vertical] || l.vertical}</Badge></td>
                      <td className="px-4 py-3 hidden lg:table-cell text-slate-400 max-w-[180px] truncate">{l.interest || "—"}</td>
                      <td className="px-4 py-3">
                        <Select value={l.status} onValueChange={(v) => changeStatus(l.id, v)}>
                          <SelectTrigger data-testid={`lead-status-${l.id}`} className="h-8 w-40 border-0 bg-transparent p-0">
                            <Badge className={`${STATUS_COLORS[l.status]} border-0`}>{l.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button data-testid={`lead-view-${l.id}`} size="sm" variant="ghost" onClick={() => setSelected(l)} className="text-[#84CC16] hover:bg-white/10">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent data-testid="lead-detail-drawer" className="bg-[#0B0F19] text-white border-white/10 w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader><SheetTitle className="text-white font-display">{selected.name}</SheetTitle></SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${STATUS_COLORS[selected.status]} border-0`}>{selected.status}</Badge>
                  <span className="text-xs font-mono text-slate-500">{selected.id}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2 text-slate-300"><Mail className="w-4 h-4 text-[#2563EB]" /> {selected.email}</p>
                  {selected.phone && <p className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-[#2563EB]" /> {selected.phone}</p>}
                  {selected.company && <p className="flex items-center gap-2 text-slate-300"><Building2 className="w-4 h-4 text-[#2563EB]" /> {selected.company}</p>}
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm space-y-1.5">
                  <p><span className="text-slate-500">Vertical:</span> {VERTICAL_LABELS[selected.vertical] || selected.vertical}</p>
                  {selected.category && <p><span className="text-slate-500">Category:</span> {selected.category}</p>}
                  {selected.interest && <p><span className="text-slate-500">Interest:</span> {selected.interest}</p>}
                  {selected.budget && <p><span className="text-slate-500">Budget:</span> {selected.budget}</p>}
                  {selected.timeline && <p><span className="text-slate-500">Timeline:</span> {selected.timeline}</p>}
                  {selected.message && <p className="pt-1"><span className="text-slate-500">Message:</span><br />{selected.message}</p>}
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide">Change status</label>
                  <Select value={selected.status} onValueChange={(v) => changeStatus(selected.id, v)}>
                    <SelectTrigger data-testid="drawer-status-select" className="mt-1.5 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mb-2"><StickyNote className="w-3.5 h-3.5" /> Notes</p>
                  <div className="space-y-2 mb-3">
                    {(selected.notes || []).length === 0 && <p className="text-sm text-slate-500">No notes yet.</p>}
                    {(selected.notes || []).map((n, i) => (
                      <div key={i} className="rounded-lg bg-white/[0.04] p-3 text-sm">
                        <p className="text-slate-200">{n.text}</p>
                        <p className="text-xs text-slate-500 mt-1">{n.by} • {new Date(n.at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <Textarea data-testid="drawer-note-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" rows={2} className="bg-white/5 border-white/10 text-white" />
                  <Button data-testid="drawer-add-note" onClick={addNote} size="sm" className="mt-2 bg-[#2563EB] hover:bg-[#3B82F6] text-white">Add Note</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
