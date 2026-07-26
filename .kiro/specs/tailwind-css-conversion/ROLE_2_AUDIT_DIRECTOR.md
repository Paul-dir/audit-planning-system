# Role 2: Audit Director - Tailwind Conversion Guide

**Role**: Audit Director  
**Primary Views**: 10 pages  
**Files to Convert**: 7 main files  
**Estimated Time**: 4-5 hours

---

## Overview

Audit Director reviews plans from audit team, approves or requests revisions, sends feedback to regional directors, and manages the approval workflow. They have decision-making authority and oversight of the entire planning process.

---

## Page-by-Page Conversion Guide

### Page 1: Dashboard (AuditDirectorDashboard.jsx)

**Current Structure**:
- Similar to Audit Team dashboard but with director-specific metrics
- 5 stat cards: Plans to Review, Feedback Sent, Plans in Revision, Approved, Finalized

**Tailwind Conversion**:
```jsx
// Container (same as audit team)
className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6"

// Stat cards with color accents
className="card-base metric-card-accent"
className="c-gold"  // Plans to review (warning color)
className="c-teal"  // Approved (success color)
className="c-coral" // In revision (danger color)

// Layout same as audit team
```

**Colors**:
- Plans to Review: Gold (pending action)
- Feedback Sent: Blue (info)
- Plans in Revision: Orange (warning)
- Approved Plans: Teal (success)
- Finalized Plans: Green (completed)

---

### Page 2: Risk Engine Analysis (RiskEngineView.jsx)

**Same as Audit Team**
- See ROLE_1_AUDIT_TEAM.md for details

---

### Page 3: Plans to Review (Review Queue) (DirectorReviewView.jsx)

**Current Structure**:
- List/table of plans submitted by audit team
- Each row shows: plan name, submitted date, audit types, regions, action buttons
- Status column shows "PENDING REVIEW"

**Layout**: Table with columns:
| Plan Name | Year | Submitted Date | Regions | Actions |

**Tailwind Conversion**:
```jsx
// Table container
className="card-base overflow-x-auto"

// Table wrapper
className="w-full text-sm"

// Table header
className="bg-panel/50 text-text-hi font-semibold"
className="px-4 py-3 text-left border-b border-border"

// Table row
className="border-b border-border hover:bg-panel/50 transition-colors"
className="px-4 py-3"

// Plan name link
className="text-blue hover:underline cursor-pointer"

// Regions badge group
className="flex gap-1 flex-wrap"
className="badge-info badge-sm"

// Action buttons
className="flex gap-2 whitespace-nowrap"
className="btn-primary btn-sm"  // Approve
className="btn-danger btn-sm"   // Reject
className="btn-outline btn-sm"  // View Details
```

**Key Elements**:
- Plan title is clickable to view details
- Regions shown as small badges
- Action buttons: Approve, Reject, View
- Hover effect on rows

---

### Page 4: Send Feedback to Regions (DirectorBulkFeedbackView.jsx)

**Current Structure**:
- Form with region multi-select checkboxes
- All regions visible with checkboxes
- Feedback textarea
- Send button

**Layout**: 
```
[Region Checkboxes Section]
[Feedback Form Section]
[Send Button]
```

**Tailwind Conversion**:
```jsx
// Main container
className="card-base space-y-6"

// Checkboxes section
className="space-y-3"

// Section title
className="text-lg font-semibold text-text-hi mb-4"

// Select all checkbox
className="flex items-center gap-3 mb-3"

// Individual checkboxes
className="flex items-center gap-2"
className="w-4 h-4 rounded border border-border"

// Feedback textarea
className="form-group"
className="form-label"
className="form-input resize-none"  // Remove resize

// Button group
className="flex gap-3 justify-end"
className="btn-primary"  // Send
className="btn-secondary"  // Cancel
```

**Regions Display**:
- Use region names from configuration
- Checkbox for each region
- "Select All" checkbox to toggle all

---

### Page 5: Review Amended Plans (AmendedPlansView.jsx)

**Current Structure**:
- List of plans that were revised by audit team
- Shows original plan vs amended version
- Side-by-side comparison
- Accept or request more revisions

**Tailwind Conversion**:
```jsx
// Main container
className="space-y-6"

// Plan card
className="card-base"

// Comparison section (2-column)
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// Original plan section
className="space-y-3 p-4 bg-panel/50 rounded-lg"
className="text-sm font-semibold text-text-mid uppercase"

// Changes highlight
className="p-3 bg-gold/10 border-l-4 border-gold rounded"
className="text-sm text-text-hi"

// Amendment notes
className="p-3 bg-teal/10 border-l-4 border-teal rounded"

// Action buttons
className="flex gap-2"
className="btn-primary btn-sm"  // Approve
className="btn-outline btn-sm"  // Request more revision
```

---

### Page 6: Approved Plans (ApprovedPlansView.jsx)

**Current Structure**:
- List of plans director has approved
- Shows plan details, approval date
- Send to senior management button

**Tailwind Conversion**:
```jsx
// Container
className="space-y-4"

// Plan card (approved state)
className="card-base border-l-4 border-teal"

// Plan info grid
className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm"

// Info item
className="space-y-1"
className="text-text-mid text-xs uppercase"
className="text-text-hi font-semibold"

// Status badge
className="badge-approved"

// Send to senior button
className="btn-primary btn-sm"
```

---

### Page 7: Deploy Approved Plans (DeploymentView.jsx)

**Current Structure**:
- List of approved plans ready for deployment
- Shows deployment status
- Deploy button per plan

**Tailwind Conversion**:
```jsx
// List container
className="space-y-3"

// Deployment item card
className="card-base card-hover p-4"

// Plan name
className="font-semibold text-text-hi"

// Deployment status
className="flex items-center gap-2 mt-2"
className="w-2 h-2 rounded-full"
className={`bg-${statusColor}`}

// Deploy button
className="btn-primary btn-sm mt-3"

// Deployment progress bar (if deployed)
className="w-full h-2 bg-panel rounded-full mt-2 overflow-hidden"
className="h-full bg-teal transition-all duration-300"
```

---

### Page 8: Regional Feedback (FeedbackReviewView.jsx)

**Current Structure**:
- List of feedback received from regional directors
- Shows region, feedback content, received date
- Expandable to view full feedback

**Tailwind Conversion**:
```jsx
// Container
className="space-y-3"

// Feedback item
className="card-base card-hover"

// Header
className="flex justify-between items-start mb-3"

// Region name
className="text-lg font-semibold text-text-hi"

// Received date
className="text-xs text-text-mid"

// Feedback preview
className="text-sm text-text-mid line-clamp-2"

// View details link
className="text-blue hover:underline text-sm mt-2"

// Full feedback modal
// See modal pattern in main.css
```

---

### Page 9: Finalized Plans (FinalizedView.jsx)

**Current Structure**:
- List of plans finalized by senior management
- Shows final allocations, status "FINALIZED"
- View/download options

**Tailwind Conversion**:
```jsx
// Same as approved plans but read-only
className="card-base border-l-4 border-green-500"

// Status badge
className="badge-info"  // Finalized

// Actions (view only)
className="btn-outline btn-sm"  // View Details
```

---

### Page 10: Configuration & Standards (ConfigurationView.jsx)

**Same as Audit Team**
- See ROLE_1_AUDIT_TEAM.md for details

---

## Special Components for Audit Director

### 1. Region Multi-Select Checkboxes
- Used in "Send Feedback to Regions"
- Checkbox per region
- Select all / Deselect all option

```jsx
<div className="space-y-2">
  <label className="flex items-center gap-2">
    <input type="checkbox" className="w-4 h-4" />
    <span>Select All</span>
  </label>
  {regions.map(region => (
    <label key={region.id} className="flex items-center gap-2">
      <input type="checkbox" className="w-4 h-4" />
      <span>{region.name}</span>
    </label>
  ))}
</div>
```

### 2. Plan Comparison View
- Side-by-side original vs amended
- Highlight changes
- Use colored borders to show changes

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-3">
    <h4 className="font-semibold text-text-mid">Original</h4>
    {/* original plan details */}
  </div>
  <div className="space-y-3">
    <h4 className="font-semibold text-text-mid">Amended</h4>
    {/* amended plan details, highlight changes */}
  </div>
</div>
```

### 3. Approval Status Badge
```jsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-teal" />
  <span className="text-sm text-teal font-semibold">Approved</span>
</div>
```

---

## Inline Styles to Replace

Same patterns as Audit Team:
- Grid layouts → `grid grid-cols-*` classes
- Flex layouts → `flex` + justify, items, gap
- Cards → `card-base` utility
- Buttons → `btn-*` utilities
- Tables → table wrapper with proper styling

---

## Color Palette for Audit Director

| Color | Usage | Tailwind Class |
|-------|-------|---|
| Teal (#4FA893) | Approved status | text-teal, bg-teal |
| Gold (#C9A356) | Pending/warning | text-gold, bg-gold |
| Coral (#D9724F) | Rejected/danger | text-coral, bg-coral |
| Blue (#5B8FBF) | Info/secondary | text-blue, bg-blue |
| Green | Finalized/completed | text-green, bg-green |

---

## Testing Checklist for Audit Director

- [ ] Dashboard shows 5 director-specific metrics
- [ ] Review queue displays plan list correctly
- [ ] Can select regions for bulk feedback
- [ ] Amended plans show comparison view
- [ ] Approved plans list displays
- [ ] Deployment status shows correctly
- [ ] Regional feedback displays all items
- [ ] Finalized plans readonly view works
- [ ] All modals open/close properly
- [ ] Status badges show correct colors
- [ ] Dark mode works seamlessly

---

## Migration Order for Audit Director Pages

1. **Dashboard** (AuditDirectorDashboard.jsx) - 15 min
2. **Review Queue** (DirectorReviewView.jsx) - 25 min
3. **Send Feedback** (DirectorBulkFeedbackView.jsx) - 20 min
4. **Amended Plans** (AmendedPlansView.jsx) - 20 min
5. **Approved Plans** (ApprovedPlansView.jsx) - 15 min
6. **Deploy** (DeploymentView.jsx) - 15 min
7. **Regional Feedback** (FeedbackReviewView.jsx) - 15 min
8. **Finalized Plans** (FinalizedView.jsx) - 10 min
9. **Risk Engine** (RiskEngineView.jsx) - 30 min
10. **Configuration** (ConfigurationView.jsx) - 20 min

**Total**: ~3-3.5 hours for all Audit Director pages

---
