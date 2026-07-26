# Roles 3-8: Tailwind Conversion Quick Reference

**Coverage**: Regional Director, Tax Center Manager, Cascade Team, Team Leader, Auditor, Senior Management

---

## ROLE 3: Regional Director (3 hours estimated)

**Main Pages**: 11 pages  
**Key Files**: RegionalDirectorDashboard.jsx, RegionalFeedbackView.jsx, TaxCenterAllocationView.jsx

### Unique Layouts:

#### 1. Dashboard (RegionalDirectorDashboard.jsx)
```jsx
// Regional-specific metrics
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"

// Colored metric cards
className="card-base metric-card-accent c-gold"

// Regional context display
className="card-base p-4"
className="text-sm text-text-mid"
className="text-lg font-bold text-text-hi"
```

#### 2. Allocation Table (TaxCenterAllocationView.jsx) - CRITICAL LAYOUT
```jsx
// Two-step layout
className="grid grid-cols-1 lg:grid-cols-3 gap-6"

// Left: Allocation summary (sticky)
className="lg:sticky lg:top-0"
className="card-base space-y-4"

// Summary cards
className="flex justify-between items-center p-3 bg-panel rounded"
className="text-sm text-text-mid"
className="text-lg font-bold text-teal"

// Right: Allocation table (2/3 width)
className="lg:col-span-2"

// Table with editable cells
className="w-full text-sm border-collapse"
className="border border-border p-2"
className="hover:bg-panel/50 focus:ring-2 focus:ring-blue"

// Validation colors
className="border-teal border-2"  // Valid
className="border-coral border-2" // Invalid

// Column totals row
className="bg-panel/50 font-bold border-t-2 border-border"
```

#### 3. Feedback Collection (TaxCenterFeedbackView.jsx)
```jsx
// Status cards grid
className="grid grid-cols-1 md:grid-cols-3 gap-4"

// Tax Center feedback card
className="card-base border-l-4"
className={`border-${statusColor}`}

// Feedback status indicator
className="flex items-center gap-2 text-sm"
className="w-3 h-3 rounded-full"
className={`bg-${statusColor}`}

// Submission status
className={statusColor === 'teal' ? 'badge-approved' : 'badge-pending'}
```

#### 4. Plan to Tax Centers (Submit View)
```jsx
// Notification form
className="card-base space-y-4"

// Recipients section
className="space-y-2"
className="text-sm font-semibold"

// Tax center list
className="space-y-2"

// Tax center item
className="flex items-center gap-2 p-2 bg-panel rounded"
className="w-4 h-4 rounded border border-border"

// Message box
className="form-group"
className="form-label"
className="form-input resize-vertical"

// Send button
className="btn-primary"
```

### Regional Director Specific Patterns:

1. **Allocation Table Validation**
   - Green border: Valid sum
   - Red border: Invalid sum
   - Show totals at bottom

2. **Region Isolation**
   - Title shows region name
   - All data filtered to region
   - Cannot select other regions

3. **Multi-Step Workflow**
   - Step indicator at top
   - Step 1: Plan Review
   - Step 2: Manual Allocation
   - Step 3: Collect Feedback
   - Step 4: Submit

```jsx
// Step indicator
className="flex justify-between items-center mb-6"

// Step item
className="flex-1 text-center"

// Active step
className="text-blue font-bold"

// Completed step
className="text-teal line-through"

// Pending step
className="text-text-mid opacity-50"

// Step line
className="h-1 flex-1 mx-2"
className={`bg-${stepColor}`}
```

---

## ROLE 4: Tax Center Manager (3-4 hours estimated)

**Main Pages**: 11 pages  
**Key Files**: TaxCenterManagerDashboard.jsx, TaxCenterFeedbackView.jsx, CascadePlanToCasesView.jsx, AuditCasesListView.jsx

### Unique Layouts:

#### 1. Dashboard (TaxCenterManagerDashboard.jsx)
```jsx
// Similar structure but tax-center specific
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"

// Key metrics: cases, capacity, allocation
className="card-base metric-card-accent"
```

#### 2. Allocation & Feedback View
```jsx
// Card with allocation breakdown
className="card-base space-y-6"

// Effort calculation table
className="w-full text-sm"
className="bg-panel/50 px-3 py-2"

// Effort summary
className="flex justify-between items-center p-3 bg-panel rounded"
className="font-semibold text-text-hi"

// Feedback form
className="form-group"
className="form-label"
className="form-input"

// Submit feedback button
className="btn-primary"
```

#### 3. Cascade Plan to Cases View
```jsx
// Two-panel layout
className="grid grid-cols-1 lg:grid-cols-3 gap-6"

// Left panel: Allocation summary (sticky)
className="lg:sticky lg:top-0 lg:col-span-1"
className="card-base space-y-4"

// Allocation boxes
className="p-3 bg-panel rounded text-sm"
className="text-text-mid"
className="text-xl font-bold text-blue"

// Right panel: Taxpayer selection
className="lg:col-span-2"
className="card-base overflow-x-auto"

// Taxpayer table
className="w-full text-sm"

// Checkbox for selection
className="w-4 h-4 rounded border border-border"

// Create cases button
className="btn-primary"
```

#### 4. Case Prioritization
```jsx
// Priority ranking list
className="space-y-2"

// Case item
className="card-base p-3 cursor-move"

// Priority badge (1, 2, 3, etc)
className="flex items-center justify-center w-6 h-6 rounded-full bg-blue text-white text-xs font-bold"

// Risk indicator
className="ml-auto flex items-center gap-1"
className="w-3 h-3 rounded-full"
className={`bg-${riskColor}`}

// Risk label
className="text-xs font-semibold"
```

#### 5. Assign to Team Leaders
```jsx
// Bulk assignment form
className="card-base space-y-4"

// Select cases section
className="space-y-2"

// Cases checklist
className="space-y-2"
className="flex items-center gap-2"

// Select team leader dropdown
className="form-group"
className="form-label"
className="form-input"

// Assignment date
className="form-group"
className="form-label"
className="form-input"  // type="date"

// Assign button
className="btn-primary"
```

#### 6. Audit Cases List View
```jsx
// Cases table
className="card-base overflow-x-auto"

// Table
className="w-full text-sm"

// Status column
className="px-2 py-1"

// Status badge
className={`badge-${status.toLowerCase()}`}

// Risk indicator
className="w-2 h-2 rounded-full"
className={`bg-${riskLevel}`}

// Action buttons
className="flex gap-1"
className="btn-outline btn-xs"
```

---

## ROLE 5: Cascade Audit Team (2-3 hours estimated)

**Main Pages**: 7 pages  
**Key Files**: CascadeTeamDashboard.jsx, CascadePlanToCasesView.jsx

### Cascade Team Uses:
- Same layouts as Tax Center Manager
- Focus on: Cascade View + Case Prioritization + Audit Cases

### Difference from Tax Center Manager:
- Simpler workflow (no allocation feedback)
- No capacity planning
- Focus purely on cascading allocations to cases

---

## ROLE 6: Team Leader (2-3 hours estimated)

**Main Pages**: 6 pages  
**Key Files**: TeamLeaderDashboard.jsx, AuditCasesListView.jsx, CaseAssignmentView.jsx

### Unique Layouts:

#### 1. Dashboard (TeamLeaderDashboard.jsx)
```jsx
// Team-focused metrics
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"

// Metrics: Total cases, in-progress, completed, pending
className="card-base metric-card-accent"
```

#### 2. Audit Cases List
```jsx
// Same table pattern as Tax Center Manager
className="card-base overflow-x-auto"

// Filter toolbar
className="flex gap-3 mb-4 flex-wrap"
className="form-input"  // Search box
className="form-input"  // Status filter select

// Cases table
className="w-full text-sm"

// Row styling
className="border-b border-border hover:bg-panel/50"
```

#### 3. Assign Cases to Auditors
```jsx
// Multi-step assignment
className="space-y-6"

// Step 1: Select cases
className="card-base space-y-4"
className="space-y-2"
className="flex items-center gap-2"
className="w-4 h-4 rounded border border-border"

// Step 2: Select auditor
className="card-base space-y-4"
className="form-group"
className="form-label"
className="form-input"

// Step 3: Set dates
className="card-base space-y-4"
className="form-group"
className="form-label"
className="form-input"  // type="date"

// Assignment buttons
className="flex gap-2"
className="btn-primary"
className="btn-secondary"
```

---

## ROLE 7: Auditor (2-3 hours estimated)

**Main Pages**: 6 pages  
**Key Files**: AuditorDashboard.jsx, AuditCasesListView.jsx

### Unique Layouts:

#### 1. Dashboard (AuditorDashboard.jsx)
```jsx
// Personal metrics
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"

// Metrics: Assigned, in-progress, completed, total
className="card-base metric-card-accent"

// Recent cases table
className="card-base mt-6 overflow-x-auto"
```

#### 2. My Audit Cases (Auditor View)
```jsx
// Cases table with personal filters
className="space-y-4"

// Status filter
className="flex gap-2 mb-4"
className="btn-outline"
className={isActive ? 'bg-blue text-white' : ''}

// Cases table
className="card-base overflow-x-auto"

// Status columns with badges
className="badge-pending"  // ASSIGNED
className="badge-warning"  // IN_PROGRESS
className="badge-approved" // CLOSED

// Risk indicator column
className="flex items-center gap-1"
className="w-3 h-3 rounded-full"
className={`bg-${riskColor}`}
```

#### 3. Case Execution Detail
```jsx
// Main card
className="card-base space-y-6"

// Header with case info
className="border-b border-border pb-4"
className="text-2xl font-bold text-text-hi"

// Risk indicators section
className="space-y-3"
className="p-3 bg-panel rounded"
className="flex justify-between items-start"
className="text-text-mid text-sm"
className="badge-warning"  // Risk indicator

// Evidence tracking section
className="space-y-2"
className="flex items-start gap-3"
className="w-4 h-4 rounded border border-border"
className="text-sm"

// Update status buttons
className="flex gap-2 pt-4 border-t border-border"
className="btn-primary"  // Start audit
className="btn-secondary"  // Save
className="btn-outline"  // Complete
```

---

## ROLE 8: Senior Management (2 hours estimated)

**Main Pages**: 6 pages  
**Key Files**: SeniorManagementDashboard.jsx, SeniorManagementView.jsx

### Unique Layouts:

#### 1. Dashboard (SeniorManagementDashboard.jsx)
```jsx
// Executive metrics
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"

// Key metrics: Pending approval, approved, rejected
className="card-base metric-card-accent"

// Recent activity
className="card-base mt-6"
className="space-y-3"
```

#### 2. Plans for Review
```jsx
// Plan cards (approval required)
className="space-y-4"

// Plan card
className="card-base card-hover"

// Plan header
className="flex justify-between items-start mb-4"
className="text-xl font-semibold text-text-hi"
className="badge-pending"

// Plan summary
className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4"
className="space-y-1"
className="text-text-mid uppercase text-xs"
className="text-lg font-bold text-text-hi"

// Allocations table
className="overflow-x-auto mb-4"
className="w-full text-sm"

// Approval section
className="border-t border-border pt-4"
className="space-y-3"
className="form-group"
className="form-label"
className="form-input resize-vertical"

// Action buttons
className="flex gap-2 justify-end"
className="btn-primary"  // Approve
className="btn-danger"   // Reject
className="btn-secondary"  // Save for later
```

#### 3. Approved Plans View
```jsx
// Read-only plan display
className="space-y-4"

// Plan card (approved state)
className="card-base border-l-4 border-teal"

// Approved badge
className="badge-approved"

// Plan details (similar to review but read-only)
className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"

// Deployment status
className="p-3 bg-teal/10 rounded"
className="flex items-center gap-2"
className="text-teal font-semibold"
```

---

## Common Patterns Across All Roles

### 1. Dashboard Pattern
```jsx
// All role dashboards use same pattern:
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
// Adjust column count per role
// Then metric cards with card-base + metric-card-accent
```

### 2. List/Table Pattern
```jsx
// All list views use:
className="card-base overflow-x-auto"
className="w-full text-sm"
// Table rows with hover effect
className="border-b border-border hover:bg-panel/50"
```

### 3. Form Pattern
```jsx
// All forms use:
className="space-y-4"
// Form groups inside
className="form-group"
className="form-label"
className="form-input"
// Buttons at end
className="flex gap-2"
className="btn-primary"
```

### 4. Status Indicator Pattern
```jsx
// All status displays use:
className="flex items-center gap-2"
className="w-2 h-2 rounded-full"
className={`bg-${statusColor}`}
className="text-sm font-semibold"
```

---

## Tailwind Classes Quick Reference

### Used by Multiple Roles

| Pattern | Classes |
|---------|---------|
| Dashboard grid | `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4` |
| Card container | `card-base` or `card-base card-hover` |
| Metric accent | `metric-card-accent c-gold` (change color) |
| Table | `card-base overflow-x-auto` + `w-full text-sm` |
| Form group | `space-y-4` wrapper + `form-group` items |
| Status dot | `w-2 h-2 rounded-full bg-{color}` |
| Badge | `badge-{status}` or `badge-{color}` |
| Button | `btn-{variant} btn-{size}` |
| Modal | `modal-overlay` + `modal-content` |

---

## Total Estimated Time for All Roles

| Role | Pages | Est. Time |
|------|-------|-----------|
| 1. Audit Team | 8 | 2.5 hrs |
| 2. Audit Director | 10 | 3.5 hrs |
| 3. Regional Director | 11 | 3 hrs |
| 4. Tax Center Manager | 11 | 3.5 hrs |
| 5. Cascade Team | 7 | 2 hrs |
| 6. Team Leader | 6 | 2.5 hrs |
| 7. Auditor | 6 | 2.5 hrs |
| 8. Senior Management | 6 | 2 hrs |
| **Shared** | (Sidebar, TopBar, Modals, Config) | 4 hrs |
| **Testing** | (All roles, dark mode, responsive) | 3 hrs |
| **Total** | 66+ pages | **30-35 hours** |

---

## Priority Order for Implementation

1. ✅ **Foundation** (Phase 1): Base components, main.css, config
2. **Shared Components**: Sidebar, TopBar, RoleLayout (used by all)
3. **Audit Team**: Pages 1-8 (foundation patterns)
4. **Audit Director**: Pages 1-10 (approval workflow)
5. **Regional Director**: Pages 1-11 (allocation workflow - complex)
6. **Tax Center Manager**: Pages 1-11 (case management)
7. **Cascade Team**: Pages 1-7 (simplified cascade)
8. **Team Leader**: Pages 1-6 (assignment workflow)
9. **Auditor**: Pages 1-6 (execution workflow - simplest)
10. **Senior Management**: Pages 1-6 (approval workflow)
11. **Modals**: 11 modal components (shared)
12. **Configuration**: Settings page (shared)
13. **Risk Engine**: Used by all roles (shared)

---

## Testing Strategy by Role

- **Dashboard**: Colors, grid responsive, metrics display
- **Lists/Tables**: Hover effects, sorting/filtering, pagination
- **Forms**: Input styling, focus states, validation
- **Modals**: Open/close, form submission, dark mode
- **Buttons**: Variants, disabled state, hover/focus
- **Badges**: All status types, colors, text legibility
- **Dark Mode**: All role pages in dark mode
- **Responsive**: Mobile, tablet, desktop breakpoints

---
