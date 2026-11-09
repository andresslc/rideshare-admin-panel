# Example Rides Admin Panel — Copilot Instructions

## Commands

```bash
npm run dev        # Start dev server on http://localhost:3001
npm run build      # Production build → dist/
npm run lint       # ESLint (zero warnings policy: --max-warnings 0)
npm run preview    # Preview production build
```

There is no test suite configured.

## Architecture

This is a **React 18 + Vite** SPA for the Example Rides ride-sharing admin panel. It targets the API at `https://api.dev.example.com/api/admin/` (staging) or `https://api.example.com/api/admin/` (production) — configured directly in `src/lib/services.js`.

### Provider nesting order (App.jsx)
```
ThemeProvider → AuthProvider → AppProvider → Router
```

### Data flow pattern
All API communication follows a strict two-layer pattern:

1. **`src/lib/services.js`** — single axios instance with request/response interceptors. All calls are wrapped in `apiHandler()`, which normalizes errors and checks `response.data.success`. Export: `api` object. This is the **only** place that talks to the backend.

2. **`src/hooks/`** — feature-grouped custom hooks that call `api.*` methods:
   - `useGet*` hooks: fetch data on mount via `useCallback`/`useEffect`, return `{ data, loading, totalPages, totalData, refresh }`
   - `use*Actions` hooks: imperative mutations, return `{ loading, actionName }`

Pages import hooks directly — no state management library (no Redux/Zustand).

### Key directories
- `src/config/constants.js` — single source of truth for all app config: `APP_CONFIG`, `API_CONFIG`, `PAGINATION_CONFIG`, `MENU_ITEMS`, status enums, `SECURITY_CONFIG`, `THEME_OPTIONS`, `COLOR_CONFIG`
- `src/lib/services.js` — all API functions; the axios instance and `apiHandler` wrapper live here
- `src/contexts/` — `AuthContext` (auth state + login/logout), `ThemeContext` (dark/light + CSS vars), `AppContext` (app-level notifications)
- `src/utils/helpers.js` — `handleError(error)` and `handleSuccess(message)` for toast feedback; formatting utilities (`formatDate`, `formatCurrency`, etc.)
- `src/components/ui/` — shared UI primitives (Button, Card, Table, Modal, Badge, Input, Select, etc.)

## Key Conventions

### Error & success handling
Always use `handleError(error)` and `handleSuccess(message)` from `src/utils/helpers.js` instead of calling `toast` directly. These functions standardize toast messages across the app.

### API responses
`apiHandler` returns `{ success, message, data, pagination }`. Access payload as `response.data`, pagination as `response.pagination?.totalPages`.

### Authentication
- Token stored in `localStorage` as `authToken`; user data as `userData`
- The axios interceptor attaches `Bearer <token>` automatically
- On 401, the interceptor clears storage and redirects to `/auth/login`
- Login lockout: 5 failed attempts → 2-minute lockout tracked in `localStorage`

### Theme & colors
Brand colors are defined in `COLOR_CONFIG` in `constants.js`. `ThemeContext` converts them to CSS custom properties (`--color-primary-*`, `--color-secondary-*`). Tailwind uses `rgb(var(--color-primary-500))` syntax — **never hardcode brand colors**; use Tailwind `primary-*` / `secondary-*` classes.

### Navigation
Add new routes by: (1) registering in `App.jsx` inside the protected `<Layout>` block, (2) adding a menu entry to `MENU_ITEMS` in `constants.js`.

### Pagination
Default page size is `PAGINATION_CONFIG.defaultPageSize` (20). All paginated `api.*` functions accept `(page, limit, search, ...)` in that order.

### Forms
Use `react-hook-form` + `zod` for all forms. Resolvers are wired via `@hookform/resolvers/zod`.

### Environment
`VITE_BASE_URL` in `.env` is read by `constants.js` but the actual axios base URL is hardcoded in `src/lib/services.js`. Change the URL there when switching environments.
