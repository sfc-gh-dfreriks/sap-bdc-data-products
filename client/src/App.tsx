import { useState } from "react";
import { Sidebar, type PageId } from "./components/Sidebar";
import { useQuery } from "./hooks/useQuery";
import { api } from "./lib/api";
import Overview from "./pages/Overview";
import Explorer from "./pages/Explorer";
import Entities from "./pages/Entities";
import Tree from "./pages/Tree";
import Graph from "./pages/Graph";
import Processes from "./pages/Processes";
import UseCases from "./pages/UseCases";
import Correlation from "./pages/Correlation";
import Coverage from "./pages/Coverage";

const TITLES: Record<PageId, string> = {
  overview: "Portfolio Overview",
  explorer: "Data Product Explorer",
  entities: "CDS Entity Browser",
  tree: "Data Product Tree",
  graph: "Ontology Graph",
  processes: "Business-Process Ontology",
  usecases: "Use Cases / Intelligent Applications",
  correlation: "Process Correlation",
  coverage: "Coverage & Scorecard",
};

export default function App() {
  const [page, setPage] = useState<PageId>("overview");
  const meta = useQuery(() => api.meta(), []);

  const render = () => {
    switch (page) {
      case "overview": return <Overview />;
      case "explorer": return <Explorer />;
      case "entities": return <Entities />;
      case "tree": return <Tree />;
      case "graph": return <Graph />;
      case "processes": return <Processes />;
      case "usecases": return <UseCases />;
      case "correlation": return <Correlation />;
      case "coverage": return <Coverage />;
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar active={page} onNavigate={setPage}
        products={meta.data?.totals.products ?? 0}
        entities={meta.data?.totals.entities ?? 0} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-lg font-bold text-slate-800">{TITLES[page]}</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            full SAP BDC catalog
          </span>
          {meta.error && <span className="ml-auto text-xs text-rose-500">{meta.error}</span>}
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-6">{render()}</main>
      </div>
    </div>
  );
}
