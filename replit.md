# Cluster-AP — Audit Planning & Management System

A React + Vite frontend for Ethiopia's Ministry of Revenues **Audit Planning & Management System**. The app models a multi-role workflow (Planning Team → Director → Regional Directors → Tax Centers) for creating, distributing, and tracking annual audit plans.

## Stack

| Layer | Tech |
|---|---|
| UI | React 19, Tailwind CSS 3 |
| Build | Vite 8, `@vitejs/plugin-react` |
| Icons | lucide-react |
| State | React Context (no backend — all data in memory/localStorage) |

## Running the app

```bash
npm run dev   # dev server on port 5000
npm run build # production build
```

The Vite config already sets `host: '0.0.0.0'`, `port: 5000`, and `allowedHosts: true` for Replit compatibility.

## Project layout

```
src/
  App.jsx          # root, routing
  pages/           # one file per role/view
  components/      # shared UI components
  context/         # React context providers (state)
  data/            # seed/mock data
  services/        # data access helpers
  hooks/           # custom React hooks
  utils/           # pure utility functions
  api/             # API client stubs (future backend)
  config/          # app-level configuration
  routing/         # route definitions
```

## Roles & workflow

- **Audit Planning Team** — creates annual audit plans with audit-type quotas per region
- **Audit Director** — approves plans and sends them to regions
- **Regional Director** — distributes regional quota across tax centers
- **Tax Center** — provides feedback / accepts allocation
- **Senior Management** — final sign-off

## User preferences

<!-- Add user preferences here -->
