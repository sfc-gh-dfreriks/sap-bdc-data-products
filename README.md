# SAP Business Data Cloud — Data Product Portfolio Explorer

An interactive visualization of the **SAP Business Data Cloud (BDC)** data product
portfolio and its underlying ontology, mined from the public
[SAP Business Accelerator Hub](https://api.sap.com/dataproducts) catalog.

> **Live site:** https://sfc-gh-dfreriks.github.io/sap-bdc-data-products/

It maps the full BDC catalog as a **Process → Product → CDS Entity** ontology:

| Metric | Count |
|---|---:|
| Data products | **334** |
| CDS entities | **2,361** |
| Typed associations | **2,576** |
| Cross-product ODM links | **426** |
| SAP value-chain processes | **10** |

## Pages

**Explore**
- **Portfolio Overview** — KPIs, six-criteria completeness gauge, value-chain summary,
  entity semantic-role distribution, and source-system / provenance lenses.
- **Data Product Explorer** — deep dive into a single data product: metadata, description,
  CDS views/entities (expandable to field level), Snowflake semantic model, and business objects.
- **CDS Entity Browser** — cross-product search over all ~2,361 CDS entities with field
  definitions, key/PII flags, and associations.
- **Data Product Tree** — collapsible Business Area → Product → Entity → Column hierarchy.

**Ontology**
- **Ontology Graph** — interactive Process → Product graph (Cytoscape fcose). Filter by
  value chain, line of business, industry, source system, and provenance; toggle ODM
  master-data links; expand any product into its CDS entities (colored by semantic role).
- **Business-Process Ontology** — SAP value-chain cards, process rollup, members.
- **Use Cases / Intelligent Applications** — maps data products to BDC Insight Apps.
- **Process Correlation** — process × process heatmap from the ODM master-data overlay.
- **Coverage & Scorecard** — ontology-quality criteria + semantic-model coverage by process.

## Architecture

This is a **fully static** single-page app (Vite + React 18 + TypeScript + Tailwind +
ECharts + Cytoscape). It loads a single precomputed catalog file,
`bdc_ontology.json`, and does all filtering / graph shaping in the browser — no backend
server required, which is what makes it deployable to GitHub Pages.

```
sap-bdc-data-products/
├── client/                     # Vite + React + TS app
│   ├── public/
│   │   ├── bdc_ontology.json   # precomputed ontology (Ontology pages)
│   │   └── explore.json        # per-product CDS/semantic detail (Explore pages)
│   └── src/lib/{api,ontology,explore}.ts  # in-browser data layer
├── data/bdc_ontology.json      # canonical copy of the mined catalog
└── .github/workflows/deploy.yml   # build + deploy to GitHub Pages
```

## Run locally

```bash
cd client
npm install
npm run dev      # http://localhost:5178/sap-bdc-data-products/
```

Build the static site:

```bash
cd client
npm run build    # outputs client/dist
npm run preview
```

## Data provenance

The ontology is derived entirely from the **public** SAP Business Accelerator Hub
Data Product catalog (`https://api.sap.com/odata/1.0/catalog.svc`, no authentication):
data product metadata, business processes, lines of business, industries, and CDS
entity/association structure from the published CSN Interop schemas. Semantic-model
"coverage" reflects which products have a generated Snowflake semantic view.

No customer data, credentials, or internal systems are included.

## License

[MIT](LICENSE)
