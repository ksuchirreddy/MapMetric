# THE SIGNAL ORRERY — REDESIGN ARCHITECTURE & NOTES

## 1. REPOSITORY & STACK INSPECTION
- **Application Name**: MapMetric (Geospatial Measurement API & UTM Projection Engine)
- **Frontend Stack**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Three.js, React Three Fiber (R3F) v8, Drei, Framer Motion, GSAP, Lenis, Recharts
- **Backend Stack**: Python 3.14, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL (`geospatial`), GeoPandas, Shapely, PyProj, PyOgrio
- **Routes & Views**:
  - `/` (Overview / Ignition Station)
  - Infrastructure (Dataset & Layer Catalog)
  - Resources (Feature Catalog & GeoJSON Inspector)
  - Analytics (Area m² & Length m Aggregates)
  - Cost Intelligence (UTM Projection & Processing Speed Engine)
  - Recommendations (Shapely Geometry Topology Audit)
  - Alerts (CRS & Validation Alerts)
  - Activity (Upload & Pipeline Stream)
  - Settings (Engine Configuration)
- **Kill Switch**: Append `?scene=off` to URL or toggle in settings to force fallback 2D rendering mode.

---

## 2. PRE-EXISTING DIAGNOSTIC VERIFICATION
- **Backend Unit Tests**: 113/113 pytest tests passing cleanly.
- **Frontend Build**: Vite production compilation succeeds with 0 errors.

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
