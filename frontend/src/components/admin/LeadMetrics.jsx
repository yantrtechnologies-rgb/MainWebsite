import React from "react";
import { Users, TrendingUp, Layers, Target } from "lucide-react";

const cardsFor = (m) => [
  { icon: Users, label: "Total Leads", value: m.total, color: "text-[#2563EB]" },
  { icon: TrendingUp, label: "Conversion Rate", value: `${m.conversion_rate}%`, color: "text-[#84CC16]" },
  { icon: Target, label: "Converted", value: m.converted, color: "text-[#F97316]" },
  { icon: Layers, label: "In Pipeline", value: m.total - m.converted - (m.by_status?.Lost || 0), color: "text-violet-500" },
];

export const LeadMetrics = ({ metrics }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {metrics && cardsFor(metrics).map((m) => (
      <div key={m.label} data-testid={`metric-${m.label.toLowerCase().replace(/ /g, "-")}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <m.icon className={`w-6 h-6 ${m.color}`} />
        <p className="font-display text-3xl font-black mt-3">{m.value}</p>
        <p className="text-sm text-slate-400 mt-1">{m.label}</p>
      </div>
    ))}
  </div>
);
