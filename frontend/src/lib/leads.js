export const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Converted", "Lost"];
export const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-amber-100 text-amber-700",
  Qualified: "bg-violet-100 text-violet-700",
  "Proposal Sent": "bg-cyan-100 text-cyan-700",
  Converted: "bg-lime-100 text-lime-700",
  Lost: "bg-slate-200 text-slate-600",
};
export const VERTICAL_LABELS = { marketing: "Marketing", products: "IT Products", academy: "Training", corporate: "Corporate", general: "General" };

export const exportLeadsCsv = (leads) => {
  const rows = [["ID", "Name", "Email", "Phone", "Company", "Vertical", "Status", "Interest", "Created"]];
  leads.forEach((l) => rows.push([l.id, l.name, l.email || "", l.phone || "", l.company || "", l.vertical, l.status, l.interest || "", l.created_at]));
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url; a.download = "yantr-leads.csv"; a.click();
  URL.revokeObjectURL(url);
};
