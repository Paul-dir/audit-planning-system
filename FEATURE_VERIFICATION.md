# Feature Verification Checklist

## Feature 1: Amendment Distribution Table (Editable)

### ✅ Location
- **Path**: Planning Dashboard → Amendment Required Section → "Edit & Resubmit" Button → Distribution Tab

### ✅ Functionality Verified

#### When NOT Editing
- [ ] Shows read-only distribution table from DistributionTable component
- [ ] Displays all regions with their allocations
- [ ] Shows totals for each audit type

#### When Editing (Click "Edit & Resubmit")
- [ ] Plan Details Tab (editable)
  - [ ] Can edit Plan Name (text input)
  - [ ] Can edit Plan Description (textarea)
- [ ] Distribution Tab (EDITABLE)
  - [ ] Each cell shows input field (Region × Audit Type)
  - [ ] Can type new values
  - [ ] Min value validation (no negative)
  - [ ] Row totals calculate automatically
  - [ ] Column totals calculate automatically
  - [ ] Grand total updates in real-time
  - [ ] Totals row highlighted with different background
- [ ] Timeline Tab
  - [ ] Shows full plan history
  - [ ] Displays all revisions and amendments

#### After Editing
- [ ] "Save Changes" button saves amendments
- [ ] Plan status updated with amendment metadata
- [ ] Director can see edits in revision history
- [ ] All calculations preserved in database

---

## Feature 2: Regional Director Override (Regional Dashboard)

### ✅ Location
- **Path**: Regional Dashboard → Pending Feedback Section → "Allocate & Submit" → Step 2 (Distribute)

### ✅ Functionality Verified

#### Tax Center Breakdown View
- [ ] Shows all tax centers for region
- [ ] Editable allocations table
- [ ] Individual TC adjustments visible

#### Regional Aggregate View (NEW)
- [ ] Toggle button between "Tax Center Breakdown" ↔ "Regional Aggregate"
- [ ] Shows consolidated view of all TCs combined
- [ ] Columns: Audit Type | Target | Aggregated | Status
- [ ] Each audit type shows:
  - [ ] Target allocation (from director)
  - [ ] Current aggregated total
  - [ ] Status indicator (Match/Mismatch)
  - [ ] Variance displayed (+/-)
- [ ] Can override individual audit type totals
  - [ ] Input fields for each audit type
  - [ ] Accepts new values
  - [ ] Validates against constraints
- [ ] Totals update in real-time
- [ ] TOTAL row shows grand total

#### Override Tracking
- [ ] Records `isOverridden: true` flag
- [ ] Stores `overriddenBy` (user ID)
- [ ] Stores `overriddenAt` (timestamp)
- [ ] Stores `overrideComment` (reasoning)
- [ ] Audit trail shows override in revisions

---

## Feature 3: Case Management (Tax Center Dashboard)

### ✅ Location
- **Path**: Tax Center Manager Dashboard → Case Management Tab

### ✅ Functionality Verified

#### Case Viewing
- [ ] Shows all cases for tax center
- [ ] Filter by Plan
  - [ ] "All Plans" dropdown
  - [ ] Shows plan name with case count
  - [ ] Shows assignment status (✓ Assigned / ○ Pending)
- [ ] Search by Taxpayer Name or TIN
- [ ] Filter by Status (Pending / Assigned / Completed)
- [ ] Filter by Audit Type
- [ ] Filter by Priority

#### Case Tabs
- [ ] **Pending Assignment**: Shows unassigned cases
- [ ] **Assigned / In Progress**: Shows cases with team leaders
- [ ] **Completed**: Shows completed/closed cases

#### Case Details Modal
- [ ] Click on case to view details
- [ ] Shows Taxpayer Profile
  - [ ] Address, phone, email
  - [ ] Registration date
  - [ ] Business description
  - [ ] Annual revenue
  - [ ] Employee count
- [ ] Shows Risk Assessment
  - [ ] Risk score (0-100)
  - [ ] Risk level badge
  - [ ] Risk factors breakdown
- [ ] Shows Audit Information
  - [ ] Last audit date
  - [ ] Last result
  - [ ] Compliance history
  - [ ] Outstanding liabilities
- [ ] Shows current status
- [ ] Dark mode styling applied

#### Bulk Assignment
- [ ] Select multiple cases with checkboxes
- [ ] "Select All" button selects all filtered cases
- [ ] "Assign to Team Leader" button
- [ ] Smart assignment algorithm:
  - [ ] Matches audit type specialization
  - [ ] Load balances by current workload
  - [ ] Validates team leader availability
- [ ] Assignment prevents duplicates:
  - [ ] Shows warning if plan already assigned
  - [ ] Tracks assignments per tax center
- [ ] Clear success/error messages
- [ ] Cases update status to ASSIGNED

#### Individual Priority
- [ ] Each case shows priority dropdown
- [ ] Can change: LOW / MEDIUM / HIGH / URGENT
- [ ] Updates immediately on UI
- [ ] Persists to state

---

## Dark Mode Verification

### ✅ All Components Checked

#### Amendment Modal
- [ ] Background: Dark slate background
- [ ] Text: White headings, light gray body text
- [ ] Inputs: Dark background with light border
- [ ] Buttons: Proper contrast maintained
- [ ] Table: Dark header, light text

#### Regional Dashboard
- [ ] Cards: Dark slate background
- [ ] Aggregate table: Dark theme applied
- [ ] Input fields: Dark background
- [ ] Alerts: Proper dark mode styling

#### Case Management
- [ ] Main container: Dark background
- [ ] Tables: Dark headers and alternating rows
- [ ] Modals: Dark background
- [ ] Text: All readable with sufficient contrast
- [ ] Badges: Proper color visibility

---

## Data Persistence Verification

### ✅ State Management

#### Amendment Edits
- [ ] Edits saved to AppContext
- [ ] LocalStorage updated
- [ ] Refresh page - edits persisted
- [ ] Amendment status preserved
- [ ] Timeline shows all amendments

#### Override Changes
- [ ] Regional overrides saved
- [ ] Persists through page refresh
- [ ] Director sees overrides in feedback details
- [ ] Totals correctly calculated

#### Case Updates
- [ ] Case assignments persisted
- [ ] Priority changes saved
- [ ] Status updates maintained
- [ ] Case details preserved

---

## Responsive Design

### ✅ Layout Testing

#### Desktop (1920px)
- [ ] All tables readable
- [ ] Input fields properly sized
- [ ] Buttons easily clickable
- [ ] Modal displays fully

#### Tablet (768px)
- [ ] Tables remain readable (horizontal scroll if needed)
- [ ] Modals fit viewport
- [ ] Buttons accessible
- [ ] Input fields usable

#### Mobile (375px)
- [ ] Stacked layout where appropriate
- [ ] Scrolling functions properly
- [ ] Touch targets >= 44px

---

## Error Handling

### ✅ Edge Cases

#### Amendment Editing
- [ ] Cannot save without plan name
- [ ] Negative numbers prevented in distribution
- [ ] Non-numeric input rejected
- [ ] Clear error messages shown

#### Assignment
- [ ] No team leader available - shows error
- [ ] Already assigned plan - shows warning
- [ ] No cases selected - shows alert
- [ ] Clear messaging on partial success

#### Case Management
- [ ] Empty cases list - shows empty state
- [ ] No matching search results - shows empty state
- [ ] Invalid filters - gracefully handles
- [ ] Missing data - displays N/A or dash

---

## Performance

### ✅ Optimization Verified

- [ ] Amendment modal loads quickly
- [ ] Distribution table renders smoothly
- [ ] Bulk assignment completes in <1s
- [ ] Search/filter responsive (<500ms)
- [ ] No memory leaks on repeated opens/closes
- [ ] Large case lists (1000+) handle smoothly

---

## Accessibility (WCAG)

### ✅ Compliance Checked

- [ ] All inputs have associated labels
- [ ] Color not sole indicator of status (badges have text)
- [ ] Contrast ratios meet AA standard
- [ ] Keyboard navigation works
- [ ] Form validation messages clear
- [ ] Dark mode doesn't break accessibility

---

## Test Scenarios

### Scenario 1: Complete Amendment Workflow
```
1. Log in as Planning Team
2. See "Amendment Required" section
3. Click "Edit & Resubmit"
4. Edit plan name and description
5. Go to Distribution tab
6. Modify audit type allocations
7. Verify totals update
8. Click "Save Changes"
9. Verify amendment saved
10. Log in as Director
11. View plan and see edits in revision history
```

### Scenario 2: Regional Override Workflow
```
1. Log in as Regional Director
2. Click "Allocate & Submit"
3. Step 2: See Tax Center Breakdown
4. Toggle to "Regional Aggregate"
5. Modify audit type allocations
6. Toggle back to verify changes saved
7. Submit with overrides
8. Director receives updated feedback
9. Override visible in audit trail
```

### Scenario 3: Case Management Workflow
```
1. Log in as Tax Center Manager
2. Go to Case Management
3. Select a plan from dropdown
4. Search for specific taxpayer
5. Select multiple cases
6. Click "Assign to Team Leader"
7. Cases assigned and status updated
8. Click individual case to view details
9. Verify all sections (Profile, Risk, Audit Info) displayed
10. Try bulk assignment on different plan
11. Verify duplicate assignment prevented
```

---

## Known Limitations / Future Enhancements

### Current Scope
- Amendment editing at regional level (not tax center level)
- Override at audit type level (not per-region customization)
- No undo/revert for amendments (can edit again)

### Future Enhancements
- Bulk amendment approval workflow
- Amendment comparison view (before/after)
- Collaborative amendments with comments
- Case assignment templates
- Advanced filtering and bulk operations

---

## Sign-Off

**Feature Status**: ✅ READY FOR BACKEND INTEGRATION

**Tested By**: 
**Test Date**: 
**Backend Team**: Please implement corresponding API endpoints for:
1. `PUT /api/plans/:id` (amendment updates)
2. `POST /api/plans/:id/override-regional-feedback` (regional override)
3. `POST /api/cases/assign-team-leader-bulk` (case assignment)
