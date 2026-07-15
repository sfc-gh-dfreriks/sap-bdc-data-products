import { useMemo, useState } from "react";
import { useQuery } from "../hooks/useQuery";
import { api } from "../lib/api";
import { MetricCard, ChartCard } from "../components/Cards";
import type { ExploreProduct, ExploreEntity } from "../lib/explore";

function Badge({ text, color }: { text: string; color: string }) {
  return <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${color}1a`, color }}>{text}</span>;
}

function EntityCard({ e }: { e: ExploreEntity }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-slate-200">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50">
        <span className="text-[10px] text-slate-400">{open ? "▼" : "▶"}</span>
        <span className="font-mono font-medium text-emerald-700">{e.name}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{e.element_count} fields · {e.key_count} keys</span>
        {e.modeling_pattern && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">{e.modeling_pattern}</span>}
        {e.label && <span className="truncate text-xs text-slate-400">— {e.label}</span>}
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-3 py-2">
          {e.elements.length > 0 && (
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500"><tr className="border-b border-slate-200">
                <th className="py-1 pr-3 font-medium">Field</th><th className="py-1 pr-3 font-medium">Label</th>
                <th className="py-1 pr-3 font-medium">Type</th><th className="py-1 font-medium">Flags</th>
              </tr></thead>
              <tbody>
                {e.elements.map((el) => (
                  <tr key={el.name} className="border-b border-slate-100">
                    <td className="py-1 pr-3 font-mono text-slate-800">{el.name}</td>
                    <td className="py-1 pr-3 text-slate-600">{el.label}</td>
                    <td className="py-1 pr-3 font-mono text-slate-500">{el.data_type}</td>
                    <td className="py-1 space-x-1">
                      {el.is_key && <span className="rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-800">PK</span>}
                      {el.is_personal_data && <span className="rounded bg-rose-100 px-1 text-[10px] font-bold text-rose-800">PII</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {e.associations.length > 0 && (
            <div>
              <div className="mb-1 text-[11px] font-semibold text-slate-600">Associations</div>
              {e.associations.map((a) => (
                <div key={a.name} className="text-xs text-violet-700">
                  ↗ <span className="font-mono">{a.name}</span> <span className="text-slate-400">{a.type} → {a.target} ({a.cardinality})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Explorer() {
  const { data, loading, error } = useQuery(() => api.explore(), []);
  const [tech, setTech] = useState<string | null>(null);

  const sorted = useMemo(() => data ? [...data.products].sort((a, b) => a.display.localeCompare(b.display)) : [], [data]);
  const p: ExploreProduct | undefined = useMemo(() => {
    if (!sorted.length) return undefined;
    return sorted.find((x) => x.tech === tech) ?? sorted[0];
  }, [sorted, tech]);

  if (loading) return <div className="text-sm text-slate-500">Loading catalog…</div>;
  if (error) return <div className="text-sm text-rose-500">{error}</div>;
  if (!p) return null;

  const sem = p.semantic;
  return (
    <div className="space-y-5">
      <ChartCard title="Select a data product" subtitle="Deep dive into metadata, CDS views, semantic model, and business objects">
        <select value={p.tech} onChange={(e) => setTech(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {sorted.map((x) => <option key={x.tech} value={x.tech}>{x.display}</option>)}
        </select>
      </ChartCard>

      <div>
        <h2 className="text-xl font-bold text-slate-800">{p.display}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.type && <Badge text={p.type === "primary" ? "Primary" : p.type === "derived" ? "Derived" : p.type} color="#0070F2" />}
          {p.source && <Badge text={p.source} color="#EA6300" />}
          {p.state === "ACTIVE" && <Badge text="Active" color="#059669" />}
          {p.business_area && <Badge text={p.business_area} color="#6B7280" />}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <span className="font-mono">{p.tech}</span> · Version {p.version || "n/a"} · Package {p.package || "n/a"}
        </div>
      </div>

      {(p.short_text || p.description) && (
        <ChartCard title="Description">
          {p.short_text && <p className="text-sm font-semibold text-slate-700">{p.short_text}</p>}
          {p.description && p.description !== p.short_text && <p className="mt-1 text-sm text-slate-600">{p.description}</p>}
        </ChartCard>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <MetricCard label="CDS entities" value={p.entities.length} />
        <MetricCard label="Semantic tables" value={sem?.tables.length ?? 0} accent="from-violet-50 to-fuchsia-50 border-violet-200" />
        <MetricCard label="Relationships" value={sem?.relationships.length ?? 0} accent="from-amber-50 to-orange-50 border-amber-200" />
        <MetricCard label="Input ports" value={p.input_ports.length} accent="from-emerald-50 to-teal-50 border-emerald-200" />
        <MetricCard label="Output ports" value={p.output_ports.length} accent="from-slate-50 to-gray-100 border-slate-200" />
      </div>

      {p.entities.length > 0 && (
        <ChartCard title="CDS views / entities" subtitle={`CSN Interop ${p.csn_version || "n/a"} · click an entity to expand its fields`}>
          <div className="space-y-2">{p.entities.map((e) => <EntityCard key={e.name} e={e} />)}</div>
        </ChartCard>
      )}

      {sem && (
        <ChartCard title="Snowflake semantic model" subtitle={sem.name}>
          {sem.description && <p className="mb-3 text-sm text-slate-600">{sem.description}</p>}
          <div className="overflow-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500"><tr className="border-b border-slate-200">
                <th className="py-1 pr-3 font-medium">Table</th><th className="py-1 pr-3 font-medium">Base table</th>
                <th className="py-1 pr-3 text-right font-medium">Dims</th><th className="py-1 pr-3 text-right font-medium">Facts</th>
                <th className="py-1 text-right font-medium">Metrics</th>
              </tr></thead>
              <tbody>
                {sem.tables.map((t) => (
                  <tr key={t.name} className="border-b border-slate-100">
                    <td className="py-1 pr-3 font-medium text-slate-800">{t.name}</td>
                    <td className="py-1 pr-3 font-mono text-slate-500">{t.base_table}</td>
                    <td className="py-1 pr-3 text-right">{t.dimensions.length}</td>
                    <td className="py-1 pr-3 text-right">{t.facts.length}</td>
                    <td className="py-1 text-right">{t.metrics.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}

      {p.business_objects.length > 0 && (
        <ChartCard title="Business objects">
          <div className="space-y-2">
            {p.business_objects.map((bo) => (
              <div key={bo.name}><div className="text-sm font-semibold text-slate-700">{bo.name}</div>
                {bo.description && <div className="text-xs text-slate-500">{bo.description}</div>}</div>
            ))}
          </div>
        </ChartCard>
      )}

      <ChartCard title="Metadata">
        <div className="grid grid-cols-1 gap-x-8 gap-y-1 text-xs text-slate-600 md:grid-cols-2">
          <div>ORD ID: <span className="font-mono">{p.ord_id || "n/a"}</span></div>
          <div>Version: {p.version || "n/a"}</div>
          <div>Package: <span className="font-mono">{p.package || "n/a"}</span></div>
          <div>State: {p.state || "n/a"}</div>
          <div>Entity name: <span className="font-mono">{p.entity_name || "n/a"}</span></div>
          <div>Created: {p.created || "n/a"}</div>
          {p.industries && <div>Industries: {p.industries}</div>}
          {p.line_of_business && <div>Line of business: {p.line_of_business}</div>}
          {p.business_process && <div>Business process: {p.business_process}</div>}
          {p.business_suite_packages && <div>Suite packages: {p.business_suite_packages}</div>}
        </div>
      </ChartCard>
    </div>
  );
}
