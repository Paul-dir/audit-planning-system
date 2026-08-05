# MOR Audit Planning & Management System

## Overview
React + Vite + Tailwind CSS frontend for the Ethiopia Ministry of Revenue's Annual Audit Planning workflow. Manages the full audit plan lifecycle from creation through finalization across all organizational levels.

## How to Run
```
npm run dev
```
App runs at `http://localhost:5000` (Vite dev server).

## Tech Stack
- **React 19** + **Vite 8** + **Tailwind CSS 3**
- **State:** React Context (`AppContext`, `AuthContext`) + localStorage persistence
- **Icons:** Lucide React
- **No backend** — all data is client-side (localStorage + seed data)

## Architecture
```
src/
  context/       AuthContext, AppContext, RegionalContext, AllocationContext
  pages/         Role-based dashboards (planning, director, regional, taxcenter, teamleader, auditor, senior)
  pages/shared/  Shared UI: PlanStatusBadge, DistributionTable, PlanTimeline, CaseDetailModal
  components/    UI library (ui/index.jsx), layout, modals, views, dashboards
  data/          seed.js (users + plans), constants.js (regions, audit types, statuses)
  services/      storage.js (localStorage wrapper)
```

## Authentication
- **Login:** Email + password form at `/`
- **MOR Identity API:** Tries `VITE_MOR_IDENTITY_URL/auth/login` first (if `VITE_USE_MOR_IDENTITY=true`)
- **Local fallback:** Matches email + password against seed users (all use password `1234`)
- Demo accounts listed in the "Try a demo account" section on the login screen

## Plan Lifecycle (statuses)
```
DRAFT → SUBMITTED_TO_DIRECTOR → DIRECTOR_APPROVED → AWAITING_REGIONAL_FEEDBACK
→ FEEDBACK_COLLECTED → AMENDMENT_REQUIRED → SUBMITTED_TO_SENIOR_MGMT
→ SENIOR_MGMT_APPROVED → FINALIZED
```

## Role Responsibilities
| Role | Key Actions |
|------|-------------|
| **Planning Team** | Create plan, submit to Director, amend based on feedback |
| **Audit Director** | Approve/revise plan, send to regions, forward to Senior Mgmt, deploy finalized plan |
| **Regional Director** | Review allocation for their region, distribute to tax centers, collect TC feedback, submit to Director |
| **Tax Center Manager** | Review TC allocation, submit capacity feedback, assign cases to team leaders |
| **Team Leader** | Assign cases to auditors |
| **Auditor** | Execute cases, update status |
| **Senior Management** | Final approval of plans |

## Environment Variables (.env)
```
VITE_USE_MOR_IDENTITY=true          # Set false to skip API and use local auth only
VITE_MOR_IDENTITY_URL=https://...   # MOR Identity API base URL (includes /api/public/v1)
VITE_TOKEN_REFRESH_INTERVAL=1800000
```

## Data Seeding
On first load, `SEED_USERS` and `SEED_PLANS` are written to localStorage. To reset: open browser console and run `localStorage.clear()` then reload.

## User Preferences
- Keep dark theme (`#0F172A` background) as the default for all dashboards
- Maintain existing Tailwind class-based styling — no CSS modules
- Use AppContext (`useApp()`) for all new plan/case state — avoid the legacy `useData()` / `businessLogic.js` pattern
