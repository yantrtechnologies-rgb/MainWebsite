import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "@/lib/api";

export const useLeads = (enabled) => {
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", status: "All", vertical: "All" });
  const [selected, setSelected] = useState(null);

  const refreshMetrics = useCallback(() => api.get("/admin/metrics").then((r) => setMetrics(r.data)), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status !== "All") params.status = filters.status;
      if (filters.vertical !== "All") params.vertical = filters.vertical;
      if (filters.search) params.search = filters.search;
      const [l] = await Promise.all([api.get("/admin/enquiries", { params }), refreshMetrics()]);
      setLeads(l.data);
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Failed to load leads.");
    } finally { setLoading(false); }
  }, [filters, refreshMetrics]);

  useEffect(() => {
    if (!enabled) return undefined;
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [enabled, load]);

  const patchLead = useCallback((id, fn) => {
    setLeads((ls) => ls.map((l) => (l.id === id ? fn(l) : l)));
    setSelected((s) => (s && s.id === id ? fn(s) : s));
  }, []);

  const changeStatus = useCallback(async (id, status) => {
    try {
      await api.patch(`/admin/enquiries/${id}/status`, { status });
      toast.success(`Moved to ${status}`);
      patchLead(id, (l) => ({ ...l, status }));
      if (filters.status !== "All" && filters.status !== status) setLeads((ls) => ls.filter((l) => l.id !== id));
      refreshMetrics();
    } catch (e) { toast.error("Update failed."); }
  }, [patchLead, refreshMetrics, filters.status]);

  const addNote = useCallback(async (id, note) => {
    try {
      const { data } = await api.post(`/admin/enquiries/${id}/notes`, { note });
      patchLead(id, (l) => ({ ...l, notes: [...(l.notes || []), data.note] }));
      toast.success("Note added");
      return true;
    } catch (e) { toast.error("Could not add note."); return false; }
  }, [patchLead]);

  const setFilter = useCallback((k, v) => setFilters((f) => ({ ...f, [k]: v })), []);

  return { leads, metrics, loading, filters, setFilter, selected, setSelected, changeStatus, addNote };
};
