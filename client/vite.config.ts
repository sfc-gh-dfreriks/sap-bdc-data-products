import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build for GitHub Pages project site:
//   https://<user>.github.io/sap-bdc-data-products/
// The app loads data/bdc_ontology.json as a static asset (no backend server).
export default defineConfig({
  base: "/sap-bdc-data-products/",
  plugins: [react()],
  server: {
    port: 5178,
    strictPort: true,
  },
});
