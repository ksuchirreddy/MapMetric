# THE SIGNAL ORRERY — REDESIGN ARCHITECTURE & QA REPORT

## 1. REPOSITORY & STACK INSPECTION
- **Application Name**: MapMetric (Geospatial Measurement API & UTM Projection Engine)
- **Git Branch**: `redesign/signal-orrery`
- **Frontend Stack**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Three.js, React Three Fiber (R3F) v8, Drei, Framer Motion, GSAP, Lenis, Recharts, Self-hosted Instrument Serif, Geist Sans & Mono fonts
- **Backend Stack**: Python 3.14, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL (`geospatial`), GeoPandas, Shapely, PyProj, PyOgrio
- **Routes & Views**:
  - `/` (Overview / S1 Ignition Station)
  - Infrastructure (Dataset & Layer Catalog)
  - Resources (Feature Catalog & GeoJSON Inspector)
  - Analytics (Area m² & Length m Aggregates)
  - Cost Intelligence (UTM Projection & Processing Speed Engine)
  - Recommendations (Shapely Geometry Topology Audit)
  - Alerts (CRS & Validation Alerts)
  - Activity (Upload & Pipeline Stream)
  - Settings (Engine Configuration)
- **Kill Switch**: Append `?scene=off` to URL or toggle in top navigation bar to activate 2D `StaticOrrery` fallback.

---

## 2. PRE-EXISTING DIAGNOSTIC & TEST VERIFICATION
- **Backend Unit Tests**: 113/113 pytest tests passing cleanly.
- **Frontend Production Build**: Vite compilation built in 9.96s with 0 errors.

---

## 3. ENTITY → SCENE MAPPING

| Domain Entity | Orrery 3D Symbol | Visual Properties & Behavior |
| :--- | :--- | :--- |
| **Global Spatial Engine** | **The Core** ($r = 1.1$) | Procedural liquid noise sphere with noise-displaced surface, corona bloom, breathing light pulse (6s cycle). |
| **Uploaded File Datasets** | **Orrery Bodies** | Instanced icosahedron/sphere meshes placed on 5 concentric brass orbit rings ($r=3.0, 4.6, 6.4, 8.5, 11.0$). Size = feature count, Color = status (`nominal` `#5FE0B0`, `degraded` `#F2C14E`, `critical` `#FF5C4D`). |
| **Ingestion History** | **Ring Trails** | Shader-drawn fading arcs on orbit rings reflecting processing speed ($ms$). |
| **Topology Repairs** | **Comets & Flares** | Self-intersecting polygons repaired via `shapely.make_valid()` appear as crystal flares crossing orbit rings with amber trails. |
| **UTM Projection Struts** | **Brass Armature** | Procedural brass gimbals, struts, and gear housings enclosing the core and supporting the orbit rings. |

---

## 4. ADAPTIVE QUALITY TIERS

| Tier | Hardware Heuristic | Star/Dust Count | DPR | Postprocessing | Floor Reflection |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **High** | Desktop GPU, high memory | 20,000 | 1.75 | Bloom, Noise, Vignette | Instanced opacity reflection |
| **Mid** | Integrated GPU | 12,000 | 1.5 | Bloom, Vignette | Disabled |
| **Low** | Mobile / Tablet | 6,000 | 1.25 | None (Additive sprites) | Disabled |
| **Minimal** | Mobile low power | 2,500 | 1.0 | None | Disabled |
| **Off** | `?scene=off` or static fallback | 0 (SVG Fallback) | N/A | None | SVG CSS fallback |

---

## 5. CSS TOKEN SPECIFICATION
- **Backgrounds**: `--void` `#06070B`, `--ink` `#0B0E17`, `--slate` `#141A2B`, `--slate-2` `#1C2438`, `--line` `rgba(236,232,223,0.10)`
- **Text**: `--paper` `#ECE8DF`, `--paper-dim` `#A9A8A0`, `--paper-faint` `#6F7280`
- **Primary Accent "Brass"**: `#D6A24A`, hi `#F0C879`, lo `#8A6428`
- **Secondary "Glass"**: `#8EDCEB`
- **Status Tokens**: `nominal` `#5FE0B0`, `degraded` `#F2C14E`, `critical` `#FF5C4D`, `unknown` `#8FA8FF`

---

## 6. FINAL QA CHECKLIST
- [x] All 113 backend unit tests pass.
- [x] Production build passes cleanly (`npm run build`).
- [x] WebGL Kill switch `?scene=off` and 2D Static Orrery fallback verified.
- [x] Self-hosted Instrument Serif, Geist Sans, and Geist Mono fonts imported.
- [x] Rolling numbers and brass sheen animations verified.
- [x] Interactive 3D Holographic Globe, 3D Bar Chart, and 3D Topology Network verified.
- [x] Frontend running on `http://localhost:5175`, backend running on `http://localhost:8000`.
