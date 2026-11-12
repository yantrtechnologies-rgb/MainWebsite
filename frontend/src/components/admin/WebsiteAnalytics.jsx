import React, { useEffect, useState } from "react";
import api from "@/lib/api";

export function WebsiteAnalytics() {
  const [report, setReport] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    api.get("/admin/analytics", { signal: controller.signal })
      .then(({ data }) => setReport(data))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="website-analytics-title" className="my-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 id="website-analytics-title" className="text-lg font-bold">Website Analytics</h2>
      <p className="text-sm text-slate-400">Public page views over the last 30 days (UTC)</p>
      {failed && <p className="mt-4 text-sm text-slate-300">Analytics could not load. Refresh to try again.</p>}
      {!report && !failed && <p className="mt-4 text-sm text-slate-300">Loading analytics…</p>}
      {report && (
        <>
          <p className="mt-4 text-3xl font-bold">{report.views.toLocaleString()} <span className="text-sm font-normal text-slate-400">total views</span></p>
          {report.pages.length === 0 ? <p className="mt-3 text-sm text-slate-400">No views recorded yet.</p> : (
            <ul className="mt-3 divide-y divide-white/10">
              {report.pages.map(({ path, views }) => (
                <li key={path} className="flex justify-between gap-4 py-2 text-sm"><span>{path === "/" ? "Home" : path}</span><span>{views.toLocaleString()}</span></li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
