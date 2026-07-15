// Static data layer for the Explore section (Data Product Explorer,
// CDS Entity Browser, Data Product Tree). Loads the precomputed explore.json
// once, on demand (it is larger than the ontology file, so it is only fetched
// when an Explore page is opened).

export interface ExploreElement {
  name: string; label: string; data_type: string;
  is_key: boolean; is_personal_data: boolean; is_language: boolean;
}
export interface ExploreAssociation {
  name: string; type: string; target: string; cardinality: string; assoc_type: string;
}
export interface ExploreEntity {
  name: string; label: string; modeling_pattern: string; data_category: string;
  element_count: number; key_count: number;
  elements: ExploreElement[]; associations: ExploreAssociation[];
}
export interface SemanticTable {
  name: string; description: string; base_table: string; primary_key: string[];
  synonyms: string[];
  dimensions: { name: string; description: string; expr: string; data_type: string; synonyms: string[] }[];
  facts: { name: string; description: string; expr: string; data_type: string }[];
  metrics: { name: string; description: string; expr: string; synonyms: string[] }[];
}
export interface SemanticModel {
  name: string; description: string;
  tables: SemanticTable[];
  relationships: { name: string; left_table: string; right_table: string; relationship_type: string; columns: string[] }[];
}
export interface ExploreProduct {
  tech: string; display: string; business_area: string; lob_key: string;
  short_text: string; description: string; source: string; type: string;
  state: string; version: string; package: string; responsible_org: string;
  ord_id: string; entity_name: string; created: string; modified: string;
  industries: string; line_of_business: string; countries: string;
  business_process: string; business_suite_packages: string;
  input_ports: { type: string; technical_name: string }[];
  output_ports: { type: string; technical_name: string }[];
  business_objects: { name: string; description: string }[];
  csn_version: string;
  entities: ExploreEntity[];
  semantic: SemanticModel | null;
}
export interface ExploreData {
  meta: { generated_at: string; products: number; entities: number; columns: number; source: string };
  area_order: string[];
  lob_descriptions: Record<string, string>;
  products: ExploreProduct[];
}

let _explorePromise: Promise<ExploreData> | null = null;

export function loadExplore(): Promise<ExploreData> {
  if (!_explorePromise) {
    const url = `${import.meta.env.BASE_URL}explore.json`;
    _explorePromise = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to load explore data (HTTP ${res.status})`);
      return res.json() as Promise<ExploreData>;
    });
  }
  return _explorePromise;
}
