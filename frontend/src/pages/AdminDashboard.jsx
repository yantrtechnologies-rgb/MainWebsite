import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/contexts";
import { useLeads } from "@/hooks/useLeads";
import { exportLeadsCsv } from "@/lib/leads";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { LeadMetrics } from "@/components/admin/LeadMetrics";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { LeadTable } from "@/components/admin/LeadTable";
import { LeadDrawer } from "@/components/admin/LeadDrawer";

const isTeam = (u) => u && (u.role === "admin" || u.role === "staff");

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const crm = useLeads(isTeam(user));

  useEffect(() => {
    if (!authLoading && !isTeam(user)) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return <div className="min-h-screen grid place-items-center bg-[#0B0F19]"><Loader2 className="w-8 h-8 text-white animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <AdminHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LeadMetrics metrics={crm.metrics} />
        <LeadFilters filters={crm.filters} setFilter={crm.setFilter} onExport={() => exportLeadsCsv(crm.leads)} />
        <LeadTable leads={crm.leads} loading={crm.loading} onStatus={crm.changeStatus} onView={crm.setSelected} />
      </div>
      <LeadDrawer lead={crm.selected} onClose={() => crm.setSelected(null)} onStatus={crm.changeStatus} onAddNote={crm.addNote} />
    </div>
  );
}
