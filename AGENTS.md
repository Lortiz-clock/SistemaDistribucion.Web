# AGENTS.md

## Project

React 19 + TypeScript SPA (Vite 8) for a distribution/sales system (`SistemaDistribucion.Web`). Bootstrap 5 for styling, `lucide-react` for icons, `react-leaflet` for maps, `jsPDF`/`jspdf-autotable` for PDF reports, `dnd-kit` for drag-and-drop. UI text, code identifiers, and commit messages are in **Spanish** — keep new UI strings and identifiers consistent with that.

The backend is a **separate C# API** (not in this repo). This repo only contains the frontend.

**Backend location:** `C:\Users\Fernando Ortiz\source\repos\Lortiz-clock\SistemaDistribucion` (.NET / C#).  
**IMPORTANT:** Always that you create or edit services, interfaces, or HTTP requests, verify the real controllers, DTOs, and stored procedures in that Backend path. The frontend contracts must match the backend exactly.

## Commands

```bash
npm install       # no lockfile-based CI checks; package-lock.json is committed
npm run dev       # vite dev server
npm run build     # tsc -b && vite build  (typecheck + bundle)
npm run preview   # serve the production build
npm run lint      # eslint .
```

There is **no test suite, no test runner, and no typecheck-only script** — `npm run build` is the only typecheck. Verify changes with `npm run build` (plus `npm run lint` for the touched files).

### Lint is currently failing — do not treat it as a regression

`npm run lint` reports **~70 pre-existing errors** (mostly `react-hooks/set-state-in-effect` from the `useEffect(() => { cargar() }, [])` pattern used on nearly every page, plus `@typescript-eslint/no-explicit-any`). `npm run build` passes cleanly.

- Don't try to fix all of them as part of unrelated work.
- When you add code, don't introduce *new* `any` or new sync-`setState`-in-effect patterns.
- Use `eslint-disable-next-line` sparingly and only where the existing codebase already does (e.g. exhaustive-deps).

## Architecture

```
src/
  main.tsx        # entrypoint: mounts <App/>, imports bootstrap CSS + index.css
  App.tsx         # ALL routes live here (BrowserRouter + Route table)
  pages/          # one file per screen (list / Agregar / Editar per module)
  components/     # shared: Layout, modals, maps (MapaRuta, MapaUbicacion)
  services/       # one file per backend module; all HTTP via src/services/api.ts
  interfaces/     # one file per DTO (mirrors the C# response contracts)
  utils/          # permisos.ts (permission checks), formato.ts (es-GT formatters)
```

**Adding a screen requires 4 coordinated edits** — all are easy to miss:
1. `src/pages/<Name>Page.tsx` (plus `Agregar`/`Editar` variants for CRUD).
2. `src/services/<name>Service.ts` — export `consultar*`, `buscar*`, `agregar*`, `editar*` (and `desactivar*`/`eliminar*` where the backend supports it) functions.
3. `src/interfaces/<Dto>.ts` — the `Consulta`/`Agregar`/`Editar` shapes.
4. `src/App.tsx` — import the page and add the `<Route>`.

### Backend contract conventions

- Every API response is `RespuestaApi<T>`: `{ exito, mensaje, datos, detalle }` (`src/interfaces/RespuestaApi.ts`). Services return `respuesta.data` (the unwrapped `RespuestaApi<T>`), never the axios response.
- Pages must branch on `respuesta.exito && respuesta.datos`, and show `respuesta.mensaje` on failure. Use the established Spanish fallback string `'No fue posible comunicarse con la API.'` for network errors.
- Endpoints are `PascalCase` under `/api/<Controller>/<Action>` (e.g. `/api/Pedidos/ConsultarPedidos`, `/api/Producto/AgregarProducto`).
- `src/services/api.ts` holds the single axios instance and attaches `Authorization: Bearer ${localStorage.token}` to every request. **Import `api` from there**; never create another axios instance.

## Auth, routing, and permissions

- Login (`src/pages/Login.tsx`) stores three `localStorage` keys: `token`, `nombreUsuario`, `modulos` (JSON array of `Modulo`). Logout removes all three.
- `RutaProtegida` in `App.tsx` only checks that `token` exists in `localStorage` — there is no server-side session validation on navigation.
- `RutaModulo` gates each route against the `modulos` array using `rutaFront` prefix matching. `modulos[].rutaFront` is the **full path including `/dashboard`**, e.g. `/dashboard/productos`. It must exactly match what the backend returns.
- `src/utils/permisos.ts` exposes `tienePermiso(rutaModulo, 'permiteConsultar' | 'permiteAgregar' | 'permiteEditar' | 'permiteAnular')` and `tieneAcceso(rutaModulo)`. Only `RecepcionPage` currently uses `tienePermiso` — when adding buttons for a new module, gate them with these helpers rather than relying on the route guard.
- `src/components/Layout.tsx` builds the sidebar from `modulos[]`, grouping entries by `rutaFront` via `definicionGrupos`. **`contiene` in `definicionGrupos` must equal the backend's `rutaFront` exactly.** Groups with 1 matching module collapse into a direct link; 2+ become an accordion.
- `Layout.tsx` also maps `modulos[].icono` (a string) to a lucide icon through `iconosDisponibles`; unknown names fall back to `LayoutDashboard`.

### Known routing gotcha

`App.tsx` registers the metas list route as `path="Metas"` (capital M) while `MetaPage` and `MetaAgregarPage` link to `/dashboard/metas` (lowercase). React Router is case-sensitive, so `/dashboard/metas` does not match the list route — the "Agregar Meta" link and the post-save redirect land on a blank page. Fix the route casing to `"metas"` if you touch that area.

## Environment / deployment gotchas

- **The API URL is hardcoded** in `src/services/api.ts` (`https://api-distribucion-fkhpfeavh9c9gvay.canadacentral-01.azurewebsites.net`). There are **no env vars and no `.env` files** — `import.meta.env` is unused. To point at a different backend, edit that `baseURL`.
- Deployed on **Vercel** (`vercel.json` rewrites all paths to `/index.html` for client-side routing). No CI workflows, no pre-commit hooks, no formatter config.
- `BaseDatos/*.sql` are **T-SQL (SQL Server)** scripts for the backend database — stored procedures, tables, and views. They are not run by the frontend. Edit them only when the DB contract changes, and keep them consistent with the interfaces in `src/interfaces/`.
- `README.md` is the untouched Vite template boilerplate — it does **not** describe this project. Ignore it.
- Leaflet marker PNGs are imported from `node_modules` in `src/components/MapaRuta.tsx` (not from `public/`); keep that pattern if you add maps.
- Production bundle is ~810 kB (2156 modules); Vite warns about the 500 kB chunk limit. Not an error, but avoid pulling more large deps into the initial import graph.

## Conventions

- Page components are `export default function XPage()`; services use `export const consultarX = async () => {...}`.
- Import types with `import type { ... }` — `verbatimModuleSyntax` is on and `erasableSyntaxOnly` is enabled (no enums, no parameter properties).
- `noUnusedLocals`/`noUnusedParameters` are on, so unused imports break the build.
- Styling is a mix of Bootstrap utility classes plus per-page CSS files (e.g. `src/pages/ProductoPage.css`) and shared CSS in `src/components/` (`Layout.css`, `tema-oscuro.css`, `menu-acordeon.css`). The dark theme is class-based, not a CSS-variable system.
- Money and dates are formatted with `src/utils/formato.ts` (`formatoQuetzales` → `Q 1,234.56`, `formatoFecha` → `es-GT` locale). Use these instead of ad-hoc `toLocaleString`.
- The business week runs **Wednesday → Tuesday** (`rangoSemanaActual()` in `PedidosPage.tsx`), and days are numbered 1–6 (Mon–Sat). Sunday is outside the schedule.
- Report/PDF export uses `jspdf` + `jspdf-autotable`.
