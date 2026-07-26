# Role 1: Audit Team - Tailwind Conversion Guide

**Role**: Audit Team (Planning Team)  
**Primary Views**: 8 pages  
**Files to Convert**: 5 main files  
**Estimated Time**: 3-4 hours

---

## Overview

Audit Team is responsible for creating and managing annual audit plans, receiving feedback from regional directors, and submitting approved plans to senior management. They see a dashboard with metrics, workflows for plan creation/review, and feedback management.

---

## Page-by-Page Conversion Guide

### Page 1: Dashboard (AuditTeamDashboard.jsx)

**Current Structure**:
- Grid of 5 stat cards displaying plans count
- Each card has: icon, count, label, and colored left border
- Dark theme background with light text
- Card styling via `.card` class + inline styles

**Layout**: 5-column responsive grid
```
[Stat 1] [Stat 2] [Stat 3] [Stat 4] [Stat 5]
```

**Components to Convert**:
1. Main container: `div` with grid layout
2. Stat cards: 5x Card components with metrics

**Tailwind Conversion**:
```jsx
// Container
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6"

// Each Stat Card
className="card-base metric-card-accent c-gold"

// Metric label (e.g., "Total Plans")
className="metric-label"

// Metric value (e.g., "48")
className="metric-value gold"

// Metric description
className="metric-foot text-sm text-text-mid"
```

**CSS to Add** (if not in main.css):
```css
@layer components {
  .metric-card-accent {
    @apply relative overflow-hidden before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1;
  }
  .c-gold::before {
    @apply bg-gold;
  }
}
```

**Dark Mode**: ✓ Already handled by CSS variables

---

### Page 2: Risk Engine Analysis (RiskEngineView.jsx)

**Current Structure**:
- Complex dashboard with multiple sections
- Risk heatmap, compliance table, industry breakdown
- Multi-level card containers
- Heavy use of table styling

**Key Sections**:
1. Risk distribution heatmap
2. Revenue at risk summary
3. Compliance trends table
4. Industry/category breakdown

**Tailwind Classes Needed**:
```jsx
// Section container
className="space-y-6"

// Section title
className="text-2xl font-semibold text-text-hi mb-4"

// Heatmap grid
className="grid grid-cols-4 gap-2"

// Table wrapper
className="card-base overflow-x-auto"

// Table styling
className="w-full text-sm"
className="table table-auto border-collapse"
className="px-4 py-2 text-left text-text-mid border-b border-border"
className="px-4 py-2 font-semibold text-text-hi bg-panel/50"
```

**Responsive**: Stacked on mobile, grid on desktop

---

### Page 3: Create Annual Plan Modal (CreatePlanModal.jsx)

**Current Structure**:
- Modal dialog with form fields
- Region allocation table (6 regions x 5 audit types)
- Save/Submit buttons at bottom

**Form Fields**:
- Year dropdown
- Start date picker
- End date picker
- Effort slider
- Region allocation table with 6 columns (region, total, desk, field, tp, issue)

**Tailwind Conversion**:
```jsx
// Modal overlay
className="modal-overlay"

// Modal content
className="modal-content"

// Modal header
className="modal-header"

// Modal body
className="modal-body space-y-6"

// Form group
className="form-group"

// Form label
className="form-label"

// Select input
className="form-input"

// Table container
className="card-base overflow-x-auto"

// Footer buttons
className="modal-footer"
className="btn-primary"
className="btn-secondary"
```

**Special Elements**:
- Year select: `<select className="form-input">`
- Date inputs: `<input type="date" className="form-input">`
- Effort slider: `<input type="range" className="w-full">`
- Allocation table: `<table className="w-full text-sm">`

---

### Page 4: My Plans (AuditPlanningView.jsx)

**Current Structure**:
- List of plan cards
- Each card shows: plan name, year, status badge, action buttons
- Status color-coded (DRAFT=gray, SUBMITTED=orange, APPROVED=green)

**Layout**: Grid of cards (auto-fit)
```
[Plan Card] [Plan Card] [Plan Card]
[Plan Card] [Plan Card]
```

**Tailwind Conversion**:
```jsx
// Container
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Plan card
className="card-base card-hover"

// Card header (title + year)
className="flex justify-between items-start mb-4"

// Status badge
className={`badge-${plan.status.toLowerCase()}`}

// Action buttons
className="flex gap-2 mt-4"
className="btn-secondary btn-sm"
```

**Status Badge Variants**:
```jsx
badge-draft
badge-submitted (use badge-pending)
badge-approved
```

---

### Page 5: Regional Feedback (FeedbackReviewView.jsx)

**Current Structure**:
- List of feedback items from regional directors
- Each item shows: region, feedback status, action buttons
- Expandable detail section

**Tailwind Conversion**:
```jsx
// Container
className="space-y-3"

// Feedback item
className="card-base card-hover p-4"

// Feedback header
className="flex justify-between items-center"

// Region name
className="text-lg font-semibold text-text-hi"

// Status indicator
className="flex items-center gap-2"
className="w-2 h-2 rounded-full"  // Status dot
className={`bg-${statusColor}`}

// Feedback content
className="mt-4 text-text-mid text-sm leading-relaxed"

// Action buttons
className="flex gap-2 mt-4"
className="btn-primary btn-sm"
className="btn-outline btn-sm"
```

---

### Page 6: Plans in Revision (RevisionsView.jsx)

**Current Structure**:
- List of plans sent back for revision
- Shows original feedback and current status
- Amendment workflow display

**Tailwind Conversion**:
```jsx
// Container with tabs
className="space-y-4"

// Revision item card
className="card-base border-l-4 border-orange-500"

// Revision info
className="grid grid-cols-2 gap-4"

// Amendment form
className="form-group"
className="form-label"
className="form-input"  // or textarea

// Status timeline
className="flex items-center gap-2"
className="flex items-center justify-center w-8 h-8 rounded-full"
```

---

### Page 7: Reports & Analytics (ReportsView.jsx)

**Current Structure**:
- Charts and metrics
- Plan creation trends, feedback metrics
- Summary statistics

**Tailwind Conversion**:
```jsx
// Container
className="space-y-6"

// Chart card
className="card-base"

// Chart title
className="text-lg font-semibold mb-4"

// Metrics grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"

// Metric item
className="p-4 bg-panel rounded-lg"
className="text-2xl font-bold text-gold"
className="text-xs text-text-mid uppercase"
```

---

### Page 8: Configuration & Standards (ConfigurationView.jsx)

**Current Structure**:
- Tables of audit types, regions, skill types
- Add/edit/delete buttons
- Expandable rows for details

**Tailwind Conversion**:
```jsx
// Section container
className="space-y-6"

// Section title with add button
className="flex justify-between items-center mb-4"
className="text-2xl font-semibold"
className="btn-primary btn-sm"

// Table wrapper
className="card-base overflow-x-auto"

// Table
className="w-full text-sm"

// Table header
className="bg-panel/50 text-text-hi font-semibold"

// Table row
className="border-b border-border hover:bg-panel/50 transition-colors"

// Action buttons in table
className="flex gap-2"
className="btn-outline btn-sm"
```

---

## Common Components Used by Audit Team

### 1. Card Component (card-base utility)
- Used in dashboard, plan list, feedback list
- Styling: `card-base` + optional `card-hover`

### 2. Status Badges
- badge-draft (gray)
- badge-pending (orange/gold)
- badge-approved (green/teal)
- badge-info (blue)

### 3. Buttons
- btn-primary (blue) - Create, Submit
- btn-secondary (gray) - Cancel, Back
- btn-outline (border) - View, Details

### 4. Modal Dialog
- modal-overlay + modal-content
- Form inputs inside modal-body

### 5. Tables
- Table header with bg-panel/50
- Table rows with border-b border-border
- Hover effect: hover:bg-panel/50

---

## Inline Styles to Replace

### Grid Layouts
```jsx
// Before
style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}

// After
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
```

### Flex Spacing
```jsx
// Before
style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}

// After
className="flex justify-between items-center p-4"
```

### Card Styling
```jsx
// Before
style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}

// After
className="card-base"
```

---

## Color Palette for Audit Team

| Color | Usage | Tailwind Class |
|-------|-------|---|
| Gold (#C9A356) | Primary accent, warnings | text-gold, bg-gold |
| Teal (#4FA893) | Success, approved | text-teal, bg-teal |
| Coral (#D9724F) | Danger, rejected | text-coral, bg-coral |
| Blue (#5B8FBF) | Info, secondary | text-blue, bg-blue |
| Panel (#161D22) | Card backgrounds | bg-panel |
| Border (#26313A) | Borders, dividers | border-border |

---

## Responsive Breakpoints for Audit Team

- **Mobile** (< 640px): Single column layouts
- **Tablet** (640-1024px): 2-3 columns
- **Desktop** (1024-1280px): 3-4 columns
- **Wide** (> 1280px): 5 columns max

---

## Testing Checklist for Audit Team

- [ ] Dashboard displays 5 stat cards correctly
- [ ] Risk Engine view renders all sections
- [ ] Create Plan modal opens and form submits
- [ ] My Plans list displays with status badges
- [ ] Feedback review shows regional feedback
- [ ] Plans in revision display correctly
- [ ] Reports show metrics and charts
- [ ] Configuration page tables render
- [ ] Dark mode toggle works seamlessly
- [ ] All responsive breakpoints work
- [ ] No console errors

---

## Migration Order for Audit Team Pages

1. **Dashboard** (AuditTeamDashboard.jsx) - 15 min
2. **Risk Engine** (RiskEngineView.jsx) - 30 min
3. **Create Plan Modal** (CreatePlanModal.jsx) - 20 min
4. **My Plans** (AuditPlanningView.jsx) - 15 min
5. **Feedback Review** (FeedbackReviewView.jsx) - 15 min
6. **Plans in Revision** (RevisionsView.jsx) - 15 min
7. **Reports** (ReportsView.jsx) - 20 min
8. **Configuration** (ConfigurationView.jsx) - 20 min

**Total**: ~2.5 hours for all Audit Team pages

---

## Notes

- **CSS Variables**: Continue using CSS variables for theme colors (they work great with Tailwind)
- **Dark Mode**: Automatically handled by `dark:` prefix and CSS variables
- **Responsive**: Use mobile-first approach (base classes apply to all, add sm:, md:, lg: prefixes)
- **Consistency**: Use provided utility classes from main.css (@layer components)

---
