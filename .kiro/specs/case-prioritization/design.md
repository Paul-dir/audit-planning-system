# Design: Case Prioritization & Risk Profiling

**Status:** Design Phase  
**Architecture:** Component-based React with localStorage  
**Pattern:** Container + Modal + Panel approach  

---

## ARCHITECTURE OVERVIEW

```
CasePrioritizationView (Container)
├─ CaseTable (Main)
│  ├─ FilterBar
│  ├─ SortOptions
│  ├─ PaginatedTable
│  └─ Actions (Store Cases)
├─ CapacityPanel (Right Sidebar)
│  ├─ CapacityDashboard
│  └─ ConfigureButton
└─ Modals (Portals)
   ├─ CaseDetailsModal
   │  ├─ RiskProfilePanel
   │  ├─ TreatmentPlanSection
   │  └─ Actions
   ├─ TreatmentPlanModal
   └─ CapacityConfigModal
```

---

## COMPONENT DESIGN

### CasePrioritizationView (Main Container)

**Location:** `src/components/views/CasePrioritizationView.jsx`

**Responsibilities:**
- Load cases (mixed Risk Engine + Approved Requests)
- Filter by tax center (from auth context)
- Remove already stored cases
- Sort cases by risk score
- Manage selection state
- Handle storage action
- Pass data to child components

**State:**
```javascript
{
  allCases: [],              // All mixed cases for this TC
  filteredCases: [],         // After filtering
  selectedCases: new Set(),  // Selected for storage
  selectedDetails: null,     // Case details modal
  showTreatmentModal: false,
  showCapacityModal: false,
  sortBy: 'risk_score',
  sortOrder: 'desc',
  filterRiskLevel: 'All',
  filterAuditType: 'All',
  searchTerm: '',
  currentPage: 1
}
```

**Effects:**
- Load cases on mount
- Load capacity config on mount
- Filter cases when inputs change

**Key Methods:**
- `loadCasesForTaxCenter()` - Mixed case loading with filters
- `toggleCaseSelection(caseId)` - Manage selected set
- `handleStoreSelectedCases()` - Store + update status
- `calculateCaseRank()` - Rank by risk score

---

### CaseTable (Sub-Component)

**Location:** `src/components/views/CaseTable.jsx`

**Displays:**
- Headers: Rank, ID, TIN, Name, Branch, Type, Risk Score, Risk Level, Strength, Priority, Revenue, Hours, Source, Actions
- Rows: One per case, color-coded by risk level
- Pagination controls

**Features:**
- Sort columns (click header)
- Row highlighting on hover
- Source badge (⚙️ / 🔔)
- Risk color coding
- Action buttons (View Details, Store)

---

### CaseDetailsModal (Portal Modal)

**Location:** `src/components/modals/CaseDetailsModal.jsx`

**Shows:**
- Case header with ID, status
- Taxpayer section (name, TIN, type, industry)
- Risk profile section (score, indicators)
- Audit info (type, est. hours, revenue)
- Treatment plan section (if attached)
- Action buttons

**Sections:**
```
┌─ Case Details Modal ──────────────┐
│ CASE-001 │ [Status Badge]        │
├───────────────────────────────────┤
│ Taxpayer Information              │
│ • Name: ABC Company               │
│ • TIN: ET100001                   │
│ • Type: Manufacturing             │
├───────────────────────────────────┤
│ Risk Profiling                    │
│ • Risk Score: 82 [High]           │
│ • Risk Strength: Strong           │
│ • Indicators: (list)              │
├───────────────────────────────────┤
│ Treatment Plan                    │
│ • Type: Comprehensive Audit       │
│ • Hours: 120                      │
│ • [Edit] [Delete]                 │
├───────────────────────────────────┤
│ [Attach Plan] [Store] [Close]     │
└───────────────────────────────────┘
```

---

### RiskProfilePanel (Sub-Component)

**Location:** `src/components/panels/RiskProfilePanel.jsx`

**Displays:**
- Risk score gauge (0-100, color coded)
- Risk level badge
- Risk strength label
- List of risk indicators with details

**Each Indicator Shows:**
- Icon (⚠️)
- Name
- Evidence/details
- Severity badge

---

### TreatmentPlanModal (Portal Modal)

**Location:** `src/components/modals/TreatmentPlanModal.jsx`

**Form Sections:**
```
┌─ Treatment Plan Modal ────────────┐
│ Plan Type *                       │
│ [Dropdown: Standard/Comprehensive]│
│                                   │
│ Description *                     │
│ [Textarea: 200-2000 chars]        │
│                                   │
│ Estimated Hours *                 │
│ [Number input]                    │
│                                   │
│ Estimated Cost                    │
│ [Number input]                    │
│                                   │
│ Assigned Auditor                  │
│ [Dropdown: Team members]          │
│                                   │
│ Key Focus Areas *                 │
│ [Checkboxes: Revenue, TP, VAT...] │
│                                   │
│ Attachments                       │
│ [File upload: max 10MB]           │
│                                   │
│ Notes                             │
│ [Textarea]                        │
│                                   │
│ [Save] [Cancel] [Delete]          │
└───────────────────────────────────┘
```

---

### CapacityPanel (Right Sidebar)

**Location:** `src/components/panels/CapacityPanel.jsx`

**Shows:**
- Header: "AUDIT TEAM CAPACITY"
- Fiscal Year badge
- Total capacity meters (remaining hours)
- Breakdown by audit type
- [Configure] button

**Visual:**
```
┌─ AUDIT TEAM CAPACITY ─────┐
│ FY 2027 | Addis AA TC1    │
├───────────────────────────┤
│ Capacity: 2000 hrs        │
│ Planned: 450 hrs (23%)    │
│ Remaining: 1550 hrs ✓     │
├───────────────────────────┤
│ BY AUDIT TYPE:            │
│ • Desk Audit      [████] │
│ • Field Audit     [██]   │
│ • Comprehensive   [████] │
│ • Transfer Pricing[█]    │
│ • Single Issue    [██]   │
├───────────────────────────┤
│ [⚙️ Configure Capacity]   │
└───────────────────────────┘
```

---

### CapacityConfigModal (Portal Modal)

**Location:** `src/components/modals/CapacityConfigModal.jsx`

**Form:**
```
┌─ Configure Audit Capacity ────┐
│ Available Staff (Auditors)  * │
│ [Number: 5]                   │
│                               │
│ Hours per Staff per Year  *   │
│ [Number: 2000]                │
│                               │
│ Total Capacity: 10,000 hrs    │
│                               │
│ ALLOCATE BY AUDIT TYPE:       │
│ ┌─────────────────────────┐   │
│ │ Desk Audit:        [XX]%│   │ 2000 hrs
│ │ Field Audit:       [XX]%│   │ 3000 hrs
│ │ Comprehensive:     [XX]%│   │ 2500 hrs
│ │ Transfer Pricing:  [XX]%│   │ 1000 hrs
│ │ Single Issue:      [XX]%│   │ 1500 hrs
│ └─────────────────────────┘   │
│ Total: 10,000 hrs ✓           │
│                               │
│ [Save] [Cancel]               │
└───────────────────────────────┘
```

---

## DATA FLOW DIAGRAM

```
User Logs In (Tax Center Auth)
    ↓
CasePrioritizationView.useEffect
    ↓
loadCasesForTaxCenter()
    ├─ Get Risk Engine cases
    ├─ Get Approved Request cases
    ├─ Combine both sources
    ├─ Filter by region + taxCenter (from auth)
    ├─ Remove stored cases
    └─ Sort by risk score DESC
    ↓
Display in Table
    ├─ Each row shows [Risk] [Source Badge] [Actions]
    ├─ User can select cases
    └─ User can view details
    ↓
View Details → CaseDetailsModal
    ├─ Shows RiskProfilePanel
    ├─ Shows TreatmentPlanSection
    └─ Can attach treatment plan
    ↓
Attach Plan → TreatmentPlanModal
    ├─ Save to case.treatmentPlan
    └─ Close modal
    ↓
Store Cases → handleStoreSelectedCases()
    ├─ Validate capacity
    ├─ Mark cases storageStatus = 'STORED'
    ├─ Save to localStorage
    ├─ Remove from view
    └─ Show success
```

---

## FILTERING LOGIC

### Case Loading (Multi-User Safe)
```javascript
const loadCasesForTaxCenter = () => {
  const data = loadData();
  const user = userInfo; // from auth context
  
  const userRegion = user.orgContext.assignedRegion;
  const userTaxCenter = user.orgContext.assignedTaxCenter;
  
  // Risk Engine cases (all, no filter)
  const riskCases = (data.auditCases || [])
    .filter(c => !c.createdFrom || c.createdFrom !== 'AUDIT_REQUEST');
  
  // Request cases (ONLY approved)
  const requestCases = (data.auditCases || [])
    .filter(c => c.createdFrom === 'AUDIT_REQUEST' && 
                 c.status === 'APPROVED_SCHEDULED');
  
  // Combine
  const allCases = [...riskCases, ...requestCases];
  
  // CRITICAL: Filter by user's tax center only
  const userCases = allCases.filter(c =>
    c.region === userRegion &&
    c.taxCenter === userTaxCenter &&
    c.storageStatus !== 'STORED'  // Don't show already stored
  );
  
  // Sort by risk score DESC
  return userCases.sort((a, b) => b.riskScore - a.riskScore);
};
```

### Case Ranking
```javascript
const getRank = (cases, caseId) => {
  const sorted = cases.sort((a, b) => b.riskScore - a.riskScore);
  return sorted.findIndex(c => c.id === caseId) + 1;
};
```

---

## STORAGE MECHANISM

### Store Cases Action
```javascript
const handleStoreSelectedCases = () => {
  // 1. Validate
  const totalHours = selectedCases.reduce((sum, caseId) => {
    const c = allCases.find(x => x.id === caseId);
    return sum + (c.treatmentPlan?.estimatedHours || c.estimatedHours || 0);
  }, 0);
  
  if (totalHours > capacityConfig.remainingHours) {
    alert(`Insufficient capacity: ${totalHours} hrs needed, ${capacityConfig.remainingHours} hrs available`);
    return;
  }
  
  // 2. Update cases
  const data = loadData();
  selectedCases.forEach(caseId => {
    const caseIdx = data.auditCases.findIndex(c => c.id === caseId);
    data.auditCases[caseIdx].storageStatus = 'STORED';
    data.auditCases[caseIdx].storedDate = new Date().toISOString();
    data.auditCases[caseIdx].storedBy = userInfo.fullName;
  });
  
  // 3. Update capacity
  capacityConfig.remainingHours -= totalHours;
  
  // 4. Save
  saveData(data);
  
  // 5. Reload & Show Success
  loadCasesForTaxCenter();
  alert(`✓ ${selectedCases.size} cases stored, ${totalHours} hours allocated`);
  setSelectedCases(new Set());
};
```

---

## COLOR SCHEME

**Risk Levels:**
- Critical: #ff5252 (red)
- High: #ff9800 (orange)
- Medium: #ffc107 (amber)
- Low: #4caf50 (green)

**Source Badges:**
- Risk Engine: #4a8fd9 (blue)
- Request: #ff9800 (orange)

**Capacity Utilization:**
- > 90%: #ff5252 (red)
- 70-90%: #ffc107 (amber)
- < 70%: #4caf50 (green)

---

## RESPONSIVE LAYOUT

**Desktop (1920px+):**
```
┌─ Sidebar ────┬─ Main Content ────────┬─ Capacity Panel ┐
│  Menu        │  Table (4 cols wide)  │  Config         │
│              │  Pagination           │                 │
└──────────────┴───────────────────────┴─────────────────┘
```

**Tablet (1024px):**
```
┌─ Sidebar ────┬─ Main Content ────────┐
│  Menu        │  Table (3 cols wide)  │
│              │  Capacity Panel below  │
└──────────────┴───────────────────────┘
```

**Mobile (768px):**
```
┌─ Sidebar ────┐
│  Menu (Icon) │
├──────────────┤
│ Table (stack)│
│ Capacity     │
└──────────────┘
```

---

## ERROR HANDLING

**Case Not Found:**
```
Modal shows: "Case not found or has been deleted"
```

**Insufficient Capacity:**
```
Alert: "Insufficient capacity. Plan shows X hrs but only Y hrs available"
Suggestions: "Configure higher capacity or reduce treatment plan hours"
```

**Treatment Plan Validation:**
```
- Plan Type required
- Description required (200+ chars)
- Estimated Hours required (> 0)
- At least 1 Focus Area required
```

**Multi-User Conflict:**
```
If case stored by other user (concurrent access):
- Show: "Case already stored by [User] at [Time]"
- Reload cases list
```

---

## SECURITY & MULTI-USER

**Authentication-Based Filtering:**
```javascript
// CRITICAL - Every load validates auth context
if (!userInfo?.orgContext?.assignedTaxCenter) {
  alert('Unauthorized: No tax center assigned');
  return [];
}

// Filter ONLY shows this user's tax center
const userTaxCenter = userInfo.orgContext.assignedTaxCenter;
```

**No Cross-Contamination:**
- User A cannot see User B's tax center cases
- Even if logged in simultaneously
- Even if on same Vercel deployment
- Filter applied at load time

---

## PERSISTENCE LAYER

**localStorage Structure:**
```javascript
{
  auditCases: [
    {
      id: "CASE-001",
      region: "Addis Ababa",
      taxCenter: "Addis Ababa TC1",
      storageStatus: "STORED",  // <-- Key for filtering
      storedDate: ISO8601,
      treatmentPlan: {
        planType: "Comprehensive",
        estimatedHours: 120
      }
    }
  ],
  
  capacityConfigs: [
    {
      region: "Addis Ababa",
      taxCenter: "Addis Ababa TC1",
      totalCapacityHours: 2000,
      remainingHours: 1550,
      allocationByType: {...}
    }
  ]
}
```

---

## NEXT PHASE: TASKS

All components and features are detailed above.
See `tasks.md` for implementation task list.
