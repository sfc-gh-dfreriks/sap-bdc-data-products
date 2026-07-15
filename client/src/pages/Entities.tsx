import { useMemo, useState } from "react";
import { useQuery } from "../hooks/useQuery";
import { api } from "../lib/api";
import { MetricCard, ChartCard } from "../components/Cards";
import type { ExploreEntity, ExploreElement, ExploreAssociation } from "../lib/explore";

interface Row extends ExploreEntity {
  product: string;
  tech: string;
}

function FlagPill({ label, color }: { label: string; color: string }) {
  return <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: `${color}22`, color }}>{label}</span>;
}

function ElementsTable({ elements }: { elements: ExploreElement[] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="text-slate-500">
        <tr className="border-b border-slate-200">
          <th className="py-1 pr-3 font-medium">Field</th>
          <th className="py-1 pr-3 font-medium">Label</th>
          <th className="py-1 pr-3 font-medium">Snowflake type</th>
          <th className="py-1 font-medium">Flags</th>
        </tr>
      </thead>
      <tbody>
        {elements.map((e) => (
          <tr key={e.name} className="border-b border-slate-100">
            <td className="py-1 pr-3 font-mono text-slate-800">{e.name}</td>
            <td className="py-1 pr-3 text-slate-600">{e.label}</td>
            <td className="py-1 pr-3 font-mono text-slate-500">{e.data_type}</td>
            <td className="py-1 space-x-1">
              {e.is_key && <FlagPill label="PK" color="#92400E" />}
              {e.is_personal_data && <FlagPill label="PII" color="#991B1B" />}
              {e.is_language && <FlagPill label="LANG" color="#4338CA" />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AssocTable({ assocs }: { assocs: ExploreAssociation[] }) {
  return (
    <table className="w-full text-left text-xs">
      <thead className="text-slate-500">
        <tr className="border-b border-slate-200">
          <th className="py-1 pr-3 font-medium">Name</th>
          <th className="py-1 pr-3 font-medium">Type</th>
          <th className="py-1 pr-3 font-medium">Target entity</th>
          <th className="py-1 font-medium">Cardinality</th>
        </tr>
      </thead>
      <tbody>
        {assocs.map((a) => (
          <tr key={a.name} className="border-b border-slate-100">
            <td className="py-1 pr-3 font-mono text-violet-700">{a.name}</td>
            <td className="py-1 pr-3 text-slate-600">{a.type}</td>
            <td className="py-1 pr-3 font-mono text-slate-500">{a.target}</td>
            <td className="py-1 text-slate-600">{a.cardinality}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Entities() {
  const { data, loading, error } = useQuery(() => api.explore(), []);
  const [search, setSearch] = useState("");
  const [pattern, setPattern] = useState("All");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const out: Row[] = [];
    for (const p of data.products)
      for (const e of p.entities) out.push({ ...e, product: p.display, tech: p.tech });
    return out;
  }, [data]);

  const patterns = useMemo(() => Array.from(new Set(rows.map((r) => r.modeling_pattern).filter(Boolean))).sort(), [rows]);
  const categories = useMemo(() => Array.from(new Set(rows.map((r) => r.data_category).filter(Boolean))).sort(), [rows]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return rows.filter((r) =>
      (!s || r.name.toLowerCase().includes(s) || r.label.toLowerCase().includes(s) || r.product.toLowerCase().includes(s)) &&
      (pattern === "All" || r.modeling_pattern === pattern) &&
      (category === "All" || r.data_category === category)
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, search, pattern, category]);

  if (loading) return <div className="text-sm text-slate-500">Loading catalog…</div>;
  if (error) return <div className="text-sm text-rose-500">{error}</div>;
  if (!data) return null;

  const totalFields = rows.reduce((s, r) => s + r.element_count, 0);
  const sel = selected ? filtered.find((r) => `${r.tech}::${r.name}` === selected) ?? null : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="CDS entities" value={rows.length.toLocaleString()} />
        <MetricCard label="Total fields" value={totalFields.toLocaleString()} accent="from-violet-50 to-fuchsia-50 border-violet-200" />
        <MetricCard label="Modeling patterns" value={patterns.length} accent="from-amber-50 to-orange-50 border-amber-200" />
        <MetricCard label="Data products" value={data.products.length} accent="from-emerald-50 to-teal-50 border-emerald-200" />
      </div>

      <ChartCard title="Browse CDS entities" subtitle={`Showing ${filtered.length.toLocaleString()} of ${rows.length.toLocaleString()} entities across the SAP BDC portfolio`}>
        <div className="mb-3 flex flex-wrap gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entity, label, or product…"
            className="flex-1 min-w-52 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <select value={pattern} onChange={(e) => setPattern(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option>All</option>{patterns.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Entity</th>
                <th className="px-3 py-2 font-medium">Label</th>
                <th className="px-3 py-2 font-medium">Data product</th>
                <th className="px-3 py-2 text-right font-medium">Fields</th>
                <th className="px-3 py-2 text-right font-medium">Keys</th>
                <th className="px-3 py-2 text-right font-medium">Assoc.</th>
                <th className="px-3 py-2 font-medium">Pattern</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((r) => {
                const id = `${r.tech}::${r.name}`;
                return (
                  <tr key={id} onClick={() => setSelected(id)}
                    className={`cursor-pointer border-t border-slate-100 hover:bg-sky-50 ${selected === id ? "bg-sky-100" : ""}`}>
                    <td className="px-3 py-1.5 font-mono text-slate-800">{r.name}</td>
                    <td className="px-3 py-1.5 text-slate-600">{r.label}</td>
                    <td className="px-3 py-1.5 text-slate-600">{r.product}</td>
                    <td className="px-3 py-1.5 text-right">{r.element_count}</td>
                    <td className="px-3 py-1.5 text-right">{r.key_count}</td>
                    <td className="px-3 py-1.5 text-right">{r.associations.length}</td>
                    <td className="px-3 py-1.5 text-slate-500">{r.modeling_pattern}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 500 && <div className="mt-2 text-xs text-slate-400">Showing first 500 rows — refine your search to narrow results.</div>}
      </ChartCard>

      {sel && (
        <ChartCard title={sel.name} subtitle={`${sel.label || "—"} · from ${sel.product}`}>
          <div className="mb-3 flex gap-4 text-xs text-slate-600">
            <span><b>{sel.element_count}</b> fields</span>
            <span><b>{sel.key_count}</b> keys</span>
            <span><b>{sel.associations.length}</b> associations</span>
            {sel.data_category && <span>Category: <b>{sel.data_category}</b></span>}
          </div>
          {sel.elements.length > 0 && (
            <div className="mb-4">
              <div className="mb-1 text-xs font-semibold text-slate-700">Field definitions</div>
              <div className="max-h-80 overflow-auto"><ElementsTable elements={sel.elements} /></div>
            </div>
          )}
          {sel.associations.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold text-slate-700">Associations</div>
              <AssocTable assocs={sel.associations} />
            </div>
          )}
        </ChartCard>
      )}
    </div>
  );
}
