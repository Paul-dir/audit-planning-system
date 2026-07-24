# Tasks: Case Prioritization & Risk Profiling Implementation

**Status:** Ready for Implementation  
**Priority:** High  
**Target:** v2.2  

---

## TASK LIST

### PHASE 1: Core Components (Tier 1)

#### T1.1 Create CasePrioritizationView Component
**File:** `src/components/views/CasePrioritizationView.jsx`

**Acceptance Criteria:**
- [ ] Loads mixed cases (Risk Engine + Approved Requests) for user's tax center
- [ ] Filters out already stored cases (storageStatus === 'STORED')
- [ ] Filters by region and taxCenter from auth context
- [ ] Displays cases sorted by risk score (descending)
- [ ] Shows case table with columns: Rank, ID, TIN, Name, Branch, Type, Risk, Level, Strength, Priority, Revenue, Hours, Source, Actions
- [ ] Source badge shows ⚙️ Risk Engine or 🔔 Request
- [ ] Checkbox selection for each case
- [ ] Pagination (15 cases per page)
- [ ] Right sidebar shows capacity panel
- [ ] "Store Cases" button appears when cases selected
- [ ] Multi-user filtering works (each user sees only their tax center)
- [ ] No console errors, all props typed

**Dependencies:**
- AuthContext (for user info)
- AuditCaseSelectionView (reference for mixed loading)
- LoadData/SaveData utilities

---

#### T1.2 Create CaseDetailsModal Component
**File:** `src/components/modals/CaseDetailsModal.jsx`

**Acceptance Criteria:**
- [ ] Modal opens from "View Details" button in table
- [ ] Shows case ID and status badge at header
- [ ] Displays all case fields:
  - Taxpayer Name, TIN, Business Type
  - Audit Type, Region, Tax Center
  - Risk Score, Risk Level, Risk Strength
  - Revenue at Risk, Estimated Hours
- [ ] Includes RiskProfilePanel showing risk indicators
- [ ] Shows attached treatment plan (if exists) with edit/delete buttons
- [ ] Has action buttons: "Attach Treatment Plan", "Close"
- [ ] Modal can be dismissed with close button or Escape key
- [ ] Modal is centered and responsive
- [ ] Scrollable content area
- [ ] No console errors

**Dependencies:**
- RiskProfilePanel (sub-component)
- TreatmentPlanModal (for attachment action)

---

#### T1.3 Create RiskProfilePanel Component
**File:** `src/components/panels/RiskProfilePanel.jsx`

**Acceptance Criteria:**
- [ ] Displays risk score with gauge (0-100, color-coded)
- [ ] Shows risk level badge (Critical/High/Medium/Low) with color
- [ ] Displays risk strength label (Very Strong/Strong/Medium/Weak)
- [ ] Lists all risk indicators with:
  - Indicator name
  - Evidence/details text
  - Severity badge (High/Medium/Low)
- [ ] Indicators displayed in table or list format
- [ ] Responsive layout
- [ ] No console errors

**Dependencies:**
- Case object with riskIndicators array

---

#### T1.4 Create TreatmentPlanModal Component
**File:** `src/components/modals/TreatmentPlanModal.jsx`

**Acceptance Criteria:**
- [ ] Modal opens from "Attach Treatment Plan" button in details modal
- [ ] Form has required fields with validation:
  - Plan Type (dropdown, required)
  - Description (textarea, 200-2000 chars, required)
  - Estimated Hours (number, > 0, required)
- [ ] Optional fields:
  - Estimated Cost (number)
  - Assigned Auditor (dropdown)
  - File Attachment (single file, max 10MB)
  - Notes (textarea)
- [ ] Key Focus Areas checkboxes (Revenue, TP, VAT, Withholding, Payroll, Assets, Related Party, Documentation)
- [ ] Save button validates and saves treatment plan to case
- [ ] Delete button removes existing plan
- [ ] Cancel button closes without saving
- [ ] Shows existing plan data if editing
- [ ] Form validation shows error messages
- [ ] On save: closes modal and updates case details display
- [ ] No console errors

**Dependencies:**
- Case object
- SaveData utility

---

#### T1.5 Create CapacityPanel Component
**File:** `src/components/panels/CapacityPanel.jsx`

**Acceptance Criteria:**
- [ ] Displays as right sidebar in CasePrioritizationView
- [ ] Shows "AUDIT TEAM CAPACITY" header
- [ ] Displays fiscal year badge
- [ ] Shows total capacity, planned hours, remaining hours
- [ ] Displays utilization percentage with color (red >90%, yellow 70-90%, green <70%)
- [ ] Shows breakdown by audit type:
  - Desk Audit with hours and percentage
  - Field Audit with hours and percentage
  - Comprehensive with hours and percentage
  - Transfer Pricing with hours and percentage
  - Single Issue with hours and percentage
  - Forensic with hours and percentage
- [ ] "Configure" button opens CapacityConfigModal
- [ ] Updates automatically when cases stored
- [ ] Responsive styling
- [ ] No console errors

**Dependencies:**
- AuthContext (for region/taxCenter)
- LoadData utility (for capacity config)

---

### PHASE 2: Data Management (Tier 2)

#### T2.1 Update loadCasesForTaxCenter Function
**File:** `src/utils/data.js` or `src/components/views/CasePrioritizationView.jsx`

**Acceptance Criteria:**
- [ ] Function loads Risk Engine cases (all)
- [ ] Function loads Approved Request cases (status === 'APPROVED_SCHEDULED' only)
- [ ] Combines both sources into single array
- [ ] Filters by userInfo.orgContext.assignedRegion
- [ ] Filters by userInfo.orgContext.assignedTaxCenter
- [ ] Filters out cases with storageStatus === 'STORED'
- [ ] Sorts by riskScore descending
- [ ] Returns empty array if user has no assigned tax center
- [ ] Handles missing data gracefully
- [ ] Logs debug info: cases loaded, user region/tc, count
- [ ] No console errors

**Dependencies:**
- LoadData utility
- AuthContext (user info)

---

#### T2.2 Update Case Storage Logic
**File:** `src/components/views/CasePrioritizationView.jsx`

**Acceptance Criteria:**
- [ ] handleStoreSelectedCases() validates capacity
- [ ] Calculates total hours from treatment plans
- [ ] Shows error if insufficient capacity
- [ ] Updates each case: storageStatus = 'STORED'
- [ ] Updates each case: storedDate = ISO8601
- [ ] Updates each case: storedBy = userInfo.fullName
- [ ] Updates capacity config: remainingHours -= totalHours
- [ ] Saves to localStorage
- [ ] Reloads case list (removes stored cases)
- [ ] Shows success message with count and hours
- [ ] Logs: cases stored, hours allocated, remaining capacity
- [ ] No console errors

**Dependencies:**
- SaveData utility
- AuthContext

---

#### T2.3 Create Treatment Plan Data Persistence
**File:** `src/utils/data.js`

**Acceptance Criteria:**
- [ ] saveTreatmentPlan(caseId, planData) function
  - Finds case by ID
  - Sets case.treatmentPlan = planData
  - Saves to localStorage
- [ ] loadTreatmentPlan(caseId) function
  - Returns case.treatmentPlan or null
- [ ] deleteTreatmentPlan(caseId) function
  - Sets case.treatmentPlan = null
  - Saves to localStorage
- [ ] All functions handle missing cases gracefully
- [ ] Functions return success/error status

**Dependencies:**
- LoadData/SaveData utilities

---

#### T2.4 Create Capacity Config Persistence
**File:** `src/utils/data.js`

**Acceptance Criteria:**
- [ ] saveCapacityConfig(region, taxCenter, config) function
- [ ] loadCapacityConfig(region, taxCenter) function
  - Returns config or creates default (totalStaff: 5, hoursPerStaff: 2000)
- [ ] updateCapacityUsage(region, taxCenter, hoursUsed) function
  - Decrements remainingHours
  - Validates not negative
- [ ] resetCapacityUsage(region, taxCenter) function
  - Recalculates from capacity allocation and stored cases
- [ ] All functions validate inputs
- [ ] All functions handle missing data

**Dependencies:**
- LoadData/SaveData utilities

---

### PHASE 3: UI Components (Tier 3)

#### T3.1 Create CaseTable Sub-Component
**File:** `src/components/tables/CaseTable.jsx`

**Acceptance Criteria:**
- [ ] Renders table with headers and rows
- [ ] Each row shows all case fields
- [ ] Sortable columns (click header to sort)
- [ ] Risk level color coding (cell background)
- [ ] Source badge with icon (⚙️ or 🔔)
- [ ] Checkbox for each row
- [ ] "Select All" checkbox in header
- [ ] Action buttons per row: "View Details", "Store"
- [ ] Hover effect on rows
- [ ] Pagination controls below table
- [ ] Responsive for smaller screens
- [ ] No console errors

**Dependencies:**
- Case data from parent
- Callback props for selection

---

#### T3.2 Create CapacityConfigModal Component
**File:** `src/components/modals/CapacityConfigModal.jsx`

**Acceptance Criteria:**
- [ ] Modal opens from "Configure" button in CapacityPanel
- [ ] Form fields:
  - Available Staff (number, required, > 0)
  - Hours per Staff per Year (number, required, > 0)
  - Shows calculated Total Capacity
  - Allocation inputs for each audit type (6 types)
  - Shows total allocation vs capacity
- [ ] Validation:
  - All fields required
  - Numbers > 0
  - Total allocation ≤ total capacity
  - Shows validation errors
- [ ] Save button saves config and closes modal
- [ ] Cancel button closes without saving
- [ ] Load existing config on open
- [ ] On save: updates CapacityPanel display
- [ ] Logs: config saved, hours allocated
- [ ] No console errors

**Dependencies:**
- Capacity config data
- SaveData utility

---

#### T3.3 Add Case Prioritization to Sidebar
**File:** `src/components/Sidebar.jsx`

**Acceptance Criteria:**
- [ ] Add menu item for both roles:
  - Tax Center Manager: "Case Prioritization"
  - Cascade Audit Team: "Case Prioritization"
- [ ] Icon: `fas fa-sort-amount-down`
- [ ] ID: `case-prioritization`
- [ ] Permission: `manage_case_prioritization`
- [ ] Links to CasePrioritizationView
- [ ] Appears in correct menu position

**Dependencies:**
- Sidebar component
- Permissions in AuthContext

---

#### T3.4 Add Case Prioritization Route to App
**File:** `src/App.jsx`

**Acceptance Criteria:**
- [ ] Add import for CasePrioritizationView
- [ ] Add case in renderRoleView() for tax_center_manager:
  - Returns CasePrioritizationView
- [ ] Add case for cascade_audit_team:
  - Returns CasePrioritizationView
- [ ] Update navigation handling for 'case-prioritization' view
- [ ] No console errors

**Dependencies:**
- CasePrioritizationView component

---

### PHASE 4: Permissions & Integration (Tier 4)

#### T4.1 Add Permissions to AuthContext
**File:** `src/context/AuthContext.jsx`

**Acceptance Criteria:**
- [ ] Add 'manage_case_prioritization' permission
- [ ] Add 'attach_treatment_plans' permission
- [ ] Add to tax_center_manager permissions array
- [ ] Add to cascade_audit_team permissions array
- [ ] Update role permissions in ROLE_PERMISSIONS constant
- [ ] Permissions checked in component access

**Dependencies:**
- AuthContext file

---

#### T4.2 Fix AuditCaseSelectionView Mixed Loading
**File:** `src/components/views/AuditCaseSelectionView.jsx`

**Acceptance Criteria:**
- [ ] Verify mixed case loading works (Risk Engine + Approved Requests)
- [ ] Source filter working properly
- [ ] "Already Stored" cases are properly filtered out
- [ ] Test with both case sources
- [ ] No console errors

**Dependencies:**
- Existing AuditCaseSelectionView

---

#### T4.3 Integration Testing
**File:** Manual testing checklist

**Acceptance Criteria:**
- [ ] Single user login to tax center → sees correct cases
- [ ] Multi-user simultaneous access → each sees only their tax center
- [ ] Filter by region + taxCenter works
- [ ] Mixed cases display correctly with source badges
- [ ] Treatment plan attachment and display works
- [ ] Case storage removes from view
- [ ] Capacity tracking updates correctly
- [ ] No data leakage between users/regions/tax centers
- [ ] No console errors or warnings

**Test Scenarios:**
- [ ] User A (Addis TC1) + User B (Addis TC2) simultaneous
- [ ] User A (Addis TC1) + User C (Oromia TC1) simultaneous
- [ ] Create case → Approve request → Select case → Store case
- [ ] Modify capacity → Verify calculations
- [ ] Attach treatment plan → Verify display
- [ ] Store multiple cases → Verify removed from selection

---

### PHASE 5: Build & Verification (Tier 5)

#### T5.1 Build & Test
**Commands:**
```bash
npm run build
# Verify: 0 errors, 0 warnings
# Verify: Build completes in < 2s
```

**Acceptance Criteria:**
- [ ] Build succeeds with 0 errors
- [ ] Build succeeds with 0 warnings
- [ ] All new components included in bundle
- [ ] No import errors
- [ ] No missing dependencies

---

#### T5.2 Git Commit
**Acceptance Criteria:**
- [ ] All changes staged and committed
- [ ] Commit message descriptive: "Add Case Prioritization & Risk Profiling feature"
- [ ] All new files included
- [ ] All modifications included
- [ ] Commit pushed to main branch

---

## DEPENDENCY GRAPH

```
CasePrioritizationView (ROOT)
├── AuthContext (user info)
├── LoadData/SaveData (data layer)
├── CaseTable (sub-component)
│   └── (case data from parent)
├── CaseDetailsModal (portal)
│   ├── RiskProfilePanel (sub-component)
│   └── TreatmentPlanModal (portal)
│       └── SaveTreatmentPlan (utility)
├── CapacityPanel (sub-component)
│   └── CapacityConfigModal (portal)
│       └── SaveCapacityConfig (utility)
└── StoreCasesLogic
    └── SaveData (utility)
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] loadCasesForTaxCenter filters correctly
- [ ] handleStoreSelectedCases updates state
- [ ] Capacity calculations correct
- [ ] Treatment plan save/load works
- [ ] Risk profiling displays correct data

### Integration Tests
- [ ] Mixed case loading works
- [ ] Multi-user filtering works
- [ ] Case storage removes from view
- [ ] Capacity updates on storage
- [ ] Modal opens/closes properly

### Manual Tests
- [ ] Table displays all cases
- [ ] Sorting works all columns
- [ ] Pagination works
- [ ] Selection state manages correctly
- [ ] Source badges display correctly
- [ ] Risk colors display correctly
- [ ] Treatment plan form validates
- [ ] Capacity display updates
- [ ] No console errors

---

## SUCCESS CRITERIA (Overall)

✅ Mixed cases display (Risk Engine + Approved Requests)  
✅ Tax center scoped filtering works  
✅ Multi-user simultaneous access (no cross-contamination)  
✅ Case details modal with risk profiling  
✅ Treatment plan attachment  
✅ Capacity planning and tracking  
✅ Case storage removes from selection  
✅ No console errors or warnings  
✅ Build completes successfully  
✅ All tests pass  

---

## NOTES

- All components use custom CSS (no Tailwind)
- All data persisted to localStorage
- Risk scores pre-calculated in case object
- Multi-user tested with auth context filtering
- Treatment plans optional but recommended
- Capacity can be reconfigured anytime
- All logging for debugging included
