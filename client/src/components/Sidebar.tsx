import { Network, Workflow, Grid3x3, ShieldCheck, LayoutDashboard, Boxes, Compass, Table2, ListTree } from "lucide-react";

export type PageId =
  | "overview" | "explorer" | "entities" | "tree"
  | "graph" | "processes" | "usecases" | "correlation" | "coverage";

const SECTIONS: { title: string; items: { id: PageId; label: string; icon: any }[] }[] = [
  {
    title: "Explore",
    items: [
      { id: "overview", label: "Portfolio Overview", icon: LayoutDashboard },
      { id: "explorer", label: "Data Product Explorer", icon: Compass },
      { id: "entities", label: "CDS Entity Browser", icon: Table2 },
      { id: "tree", label: "Data Product Tree", icon: ListTree },
    ],
  },
  {
    title: "Ontology",
    items: [
      { id: "graph", label: "Ontology Graph", icon: Network },
      { id: "processes", label: "Business Processes", icon: Workflow },
      { id: "usecases", label: "Use Cases / Insight Apps", icon: Boxes },
      { id: "correlation", label: "Correlation", icon: Grid3x3 },
      { id: "coverage", label: "Coverage & Scorecard", icon: ShieldCheck },
    ],
  },
];

export function Sidebar({ active, onNavigate, products, entities }: {
  active: PageId; onNavigate: (p: PageId) => void; products: number; entities: number;
}) {
  return (
    <aside className="flex w-64 flex-col bg-gradient-to-b from-sf-dark to-sf-deeper text-white">
      <div className="px-5 py-5">
        <div className="inline-flex rounded-md bg-sf-primary px-3 py-1 text-lg font-extrabold tracking-widest">SAP</div>
        <div className="mt-2 text-base font-semibold leading-tight">BDC Data Product Portfolio</div>
        <div className="text-xs text-sf-pale">{products} products &bull; {entities.toLocaleString()} entities</div>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-sf-pale/60">
              {section.title}
            </div>
            {section.items.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => onNavigate(id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  active === id ? "bg-white/15 font-semibold text-white" : "text-sf-pale hover:bg-white/10"
                }`}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 px-4 py-4 text-[10px] leading-tight text-sf-pale/70">
        SAP value chains &middot; ODM overlay &middot; mined from the full SAP BDC catalog
      </div>
    </aside>
  );
}
