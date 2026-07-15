import { useMemo, useRef, useState } from "react";
import { useQuery } from "../hooks/useQuery";
import { api } from "../lib/api";
import { MetricCard } from "../components/Cards";
import type { ExploreProduct } from "../lib/explore";

function EntityNode({ e }: { e: ExploreProduct["entities"][number] }) {
  return (
    <details className="ml-5 border-l border-dashed border-slate-200 pl-3" data-level="2">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
        <span className="font-mono font-medium text-emerald-700">{e.name}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{e.element_count} cols · {e.key_count} keys</span>
        {e.modeling_pattern && <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">{e.modeling_pattern}</span>}
      </summary>
      <div className="ml-4 py-1">
        {e.elements.map((el) => (
          <div key={el.name} className="flex items-center gap-2 py-0.5 text-[13px]">
            <span className="text-slate-600">{el.name}</span>
            <span className="font-mono text-xs text-slate-400">{el.data_type}</span>
            {el.is_key && <span className="rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-800">PK</span>}
            {el.is_personal_data && <span className="rounded bg-rose-100 px-1 text-[10px] font-bold text-rose-800">PII</span>}
            {el.label && <span className="text-[11px] text-slate-300">— {el.label}</span>}
          </div>
        ))}
        {e.associations.map((a) => (
          <div key={a.name} className="flex items-center gap-2 py-0.5 text-[13px] text-violet-700">
            <span>↗ {a.name}</span>
            <span className="font-mono text-xs text-slate-400">{a.type} → {a.target}</span>
            <span className="rounded-full bg-slate-100 px-2 text-[11px] text-slate-500">{a.cardinality}</span>
          </div>
        ))}
      </div>
    </details>
  );
}

function ProductNode({ p }: { p: ExploreProduct }) {
  const cols = p.entities.reduce((s, e) => s + e.element_count, 0);
  return (
    <details className="ml-5 border-l border-dashed border-slate-200 pl-3" data-level="1">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
        <span className="font-medium text-slate-800">{p.display}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{p.entities.length} entities</span>
        {cols > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{cols.toLocaleString()} columns</span>}
      </summary>
      {p.entities.length ? p.entities.map((e) => <EntityNode key={e.name} e={e} />)
        : <div className="ml-6 py-1 text-xs italic text-slate-400">No entities</div>}
    </details>
  );
}

export default function Tree() {
  const { data, loading, error } = useQuery(() => api.explore(), []);
  const [area, setArea] = useState("All");
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, ExploreProduct[]>();
    for (const p of data.products) {
      if (!map.has(p.business_area)) map.set(p.business_area, []);
      map.get(p.business_area)!.push(p);
    }
    const order = data.area_order;
    return Array.from(map.entries())
      .sort((a, b) => (order.indexOf(a[0]) === -1 ? 999 : order.indexOf(a[0])) - (order.indexOf(b[0]) === -1 ? 999 : order.indexOf(b[0])))
      .map(([name, prods]) => ({ name, prods: prods.slice().sort((a, b) => a.display.localeCompare(b.display)) }));
  }, [data]);

  const setAllOpen = (open: boolean, maxLevel = 99) => {
    containerRef.current?.querySelectorAll("details").forEach((d) => {
      const lvl = parseInt((d as HTMLElement).dataset.level || "0", 10);
      (d as HTMLDetailsElement).open = open && lvl < maxLevel;
    });
  };

  if (loading) return <div className="text-sm text-slate-500">Loading catalog…</div>;
  if (error) return <div className="text-sm text-rose-500">{error}</div>;
  if (!data) return null;

  const s = search.toLowerCase();
  const visible = grouped
    .filter((g) => area === "All" || g.name === area)
    .map((g) => ({ ...g, prods: s ? g.prods.filter((p) => p.display.toLowerCase().includes(s)) : g.prods }))
    .filter((g) => g.prods.length);

  const totalCols = data.products.reduce((sum, p) => sum + p.entities.reduce((x, e) => x + e.element_count, 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Business areas" value={grouped.length} />
        <MetricCard label="Data products" value={data.products.length} accent="from-violet-50 to-fuchsia-50 border-violet-200" />
        <MetricCard label="CDS entities" value={data.meta.entities.toLocaleString()} accent="from-amber-50 to-orange-50 border-amber-200" />
        <MetricCard label="Total columns" value={totalCols.toLocaleString()} accent="from-emerald-50 to-teal-50 border-emerald-200" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-md">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select value={area} onChange={(e) => setArea(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
            <option>All</option>{grouped.map((g) => <option key={g.name}>{g.name}</option>)}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter products…"
            className="flex-1 min-w-44 rounded-lg border border-slate-300 px-3 py-1.5 text-sm" />
          <div className="flex gap-1">
            <button onClick={() => setAllOpen(true, 1)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-sf-primary hover:text-sf-primary">Areas</button>
            <button onClick={() => setAllOpen(true, 2)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-sf-primary hover:text-sf-primary">+ Products</button>
            <button onClick={() => setAllOpen(true)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-sf-primary hover:text-sf-primary">Expand all</button>
            <button onClick={() => setAllOpen(false)} className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-sf-primary hover:text-sf-primary">Collapse all</button>
          </div>
        </div>

        <div ref={containerRef} className="max-h-[600px] overflow-auto">
          {visible.map((g) => {
            const ents = g.prods.reduce((x, p) => x + p.entities.length, 0);
            return (
              <details key={g.name} data-level="0" className="mb-1">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded px-2 py-1 text-sm hover:bg-slate-50">
                  <span className="font-semibold text-sf-primary">{g.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{g.prods.length} products</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">{ents.toLocaleString()} entities</span>
                </summary>
                {g.prods.map((p) => <ProductNode key={p.tech} p={p} />)}
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
