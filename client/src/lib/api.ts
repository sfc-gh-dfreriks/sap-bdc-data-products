// Static, client-side API for the SAP BDC Ontology Explorer.
//
// This app ships as a fully static site (e.g. GitHub Pages). Instead of calling
// an Express backend, it loads the precomputed ontology JSON once and reproduces
// every endpoint the UI needs in the browser. Method signatures match the
// original server client so the pages are unchanged.

import {
  type Ontology, type GraphOpts,
  buildGraph, shapeMeta, shapeProducts, shapeCorrelation,
  shapeScorecard, shapeCoverage, shapeSemanticRoles,
} from "./ontology";

export type { GraphOpts };

export interface ProcessDef { code: string; name: string; color: string; products: number; }
export interface RoleDef { role: string; label: string; color: string; count: number; pct: number; }
export interface Meta {
  processes: ProcessDef[];
  lobs: string[];
  industries: string[];
  sources: string[];
  provenance: string[];
  roles: RoleDef[];
  role_label: Record<string, string>;
  role_color: Record<string, string>;
  totals: { products: number; mapped: number; entities: number; associations: number; cross_products: number; odm_links: number };
  overall: number;
}
export interface ProductRow { tech: string; label: string; process: string; entity_count: number; }

// Load the precomputed ontology once. BASE_URL makes this work under a GitHub
// Pages sub-path (e.g. /sap-bdc-data-products/).
let _ontologyPromise: Promise<Ontology> | null = null;
function loadOntology(): Promise<Ontology> {
  if (!_ontologyPromise) {
    const url = `${import.meta.env.BASE_URL}bdc_ontology.json`;
    _ontologyPromise = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ontology data (HTTP ${res.status})`);
      return res.json() as Promise<Ontology>;
    });
  }
  return _ontologyPromise;
}

export const api = {
  meta: async (): Promise<Meta> => shapeMeta(await loadOntology()) as Meta,
  graph: async (o: GraphOpts): Promise<{ elements: any[] }> => ({ elements: buildGraph(await loadOntology(), o) }),
  products: async (o: GraphOpts): Promise<ProductRow[]> =>
    shapeProducts(await loadOntology(), { ...o, expand: null, cross: undefined }),
  processes: async (): Promise<any[]> => (await loadOntology()).rollup,
  correlation: async (): Promise<any> => shapeCorrelation(await loadOntology()),
  scorecard: async (): Promise<any> => shapeScorecard(await loadOntology()),
  coverage: async (): Promise<any> => shapeCoverage(await loadOntology()),
  insightApps: async (): Promise<any[]> => (await loadOntology()).insight_apps,
  semanticRoles: async (): Promise<any> => shapeSemanticRoles(await loadOntology()),
  lenses: async (): Promise<any> => (await loadOntology()).lens_summary,
};
