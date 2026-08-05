# Ministry of Revenues — Audit Planning System

## Overview

A complete multi-role audit planning and management system for the Ethiopian Ministry of Revenues. Built with React + Vite + Tailwind CSS, running entirely in the browser with localStorage for persistence.

## How to Run

```bash
npm run dev
```

The app starts on **port 5000** and is available via the Replit webview.

## Tech Stack

- **React 19** — UI framework
- **Vite 8** — build tool and dev server
- **Tailwind CSS 3** — utility-first styling
- **Lucide React** — icon library
- **localStorage** — data persistence (no backend needed)

## Architecture

```
src/
  data/
    constants.js      # All enums: regions, audit types, roles, statuses
    seed.js           # Initial demo data (users, plans, cases)
  services/
    storage.js        # localStorage wrapper with namespaced keys
  context/
    AuthContext.jsx   # Session management + login/logout
    AppContext.jsx    # Main app state + all business actions
  components/
    ui/index.jsx      # Full UI component library (Button, Badge, Card, Modal, Table, etc.)
    layout/           # Sidebar, TopBar, Layout wrapper
  pages/
    Login.jsx         # Role-based account selector
    shared/           # PlanStatusBadge, PlanTimeline, DistributionTable, CaseDetailModal
    planning/         # Planning team: create plans, submit, track feedback
    director/         # Audit director: review, approve, send to regions
    regional/         # Regional director: allocate to tax centers, submit feedback
    senior/           # Senior management: final approval, finalize
    taxcenter/        # Tax center manager: assign cases to team leaders
    teamleader/       # Team leader: assign cases to auditors
    auditor/          # Auditor: track and update case status
```

## Workflow / Business Logic

Plan states (in order):
```
DRAFT
  → SUBMITTED_TO_DIRECTOR  (planning team submits)
  → DIRECTOR_APPROVED      (director approves)   ←─ REVISION_REQUESTED (loop back)
  → AWAITING_REGIONAL_FEEDBACK  (director sends to regions)
  → FEEDBACK_COLLECTED     (all 5 regions submit feedback)
  → SUBMITTED_TO_SENIOR_MGMT  (planning team submits)
  → SENIOR_MGMT_APPROVED   (senior management approves)
  → FINALIZED              (cases deployed to tax centers)
```

## Roles & Responsibilities

| Role | What They Do |
|------|-------------|
| `planning_team` | Create annual audit plans, distribute cases by region × audit type, submit to director |
| `audit_director` | Review and approve/reject plans, send approved plans to regions |
| `regional_director` | Allocate regional cases across tax centers, submit feedback |
| `senior_management` | Final plan approval, finalize and deploy plans (generates cases) |
| `tax_center_manager` | Assign cases to team leaders |
| `team_leader` | Assign cases to auditors |
| `auditor` | Execute audits, update case status |

## Org Structure

- **5 Regions**: Addis Ababa, Amhara, Oromia, SNNPR, Somali
- **3 Tax Centers per region** = 15 total
- **6 Audit Types**: Desk Audit, Field Audit, Joint Audit, Transfer Pricing, Comprehensive, Issue Audit

## Demo Accounts

Sign in by selecting any account on the login screen. All accounts use the same pre-seeded system with 4 sample plans at different workflow stages.

## Resetting Data

On the login screen, click "Reset Data" → "Reset all data" to restore all demo plans and users to their defaults.

## User Preferences

- Keep port at 5000 for Vite dev server
- Use Tailwind CSS utility classes for all styling
- Maintain the single-context state management pattern (AppContext)
