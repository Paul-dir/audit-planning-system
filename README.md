# Annual Audit Planning System - Architecture & Implementation

## Project Overview

This is a React + Vite-based audit planning system for Ethiopia's tax authority. It manages the complete audit planning workflow from risk analysis through regional feedback to senior management approval.

## System Architecture

### User Roles & Workflows

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ANNUAL AUDIT PLANNING SYSTEM                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  STEP 1: RISK ENGINE ANALYSIS (Before Planning Starts)            │
│  ├─ Planning Team views national risk dashboard                   │
│  ├─ Director reviews risk distribution                            │
│  ├─ Regional Directors view only their region's risk              │
│  └─ Senior Management reviews strategic risk overview             │
│                                                                     │
│  STEP 2: AUDIT PLAN CREATION (Planning Team)                      │
│  ├─ Create plan based on risk insights                            │
│  ├─ Allocate audit resources by region                            │
│  ├─ Define audit type distribution                                │
│  └─ Submit to Director for approval                               │
│                                                                     │
│  STEP 3: DIRECTOR REVIEW & APPROVAL                               │
│  ├─ Review plan against risk distribution                         │
│  ├─ Approve or request revisions                                  │
│  ├─ Send approved plan to regions for feedback                    │
│  └─ Receive feedback from regional directors                      │
│                                                                     │
│  STEP 4: REGIONAL FEEDBACK                                        │
│  ├─ Regional Directors review allocations for their region        │
│  ├─ Provide feedback with proposed changes                        │
│  └─ Send feedback back to Planning Team                           │
│                                                                     │
│  STEP 5: AMENDMENT & RESUBMISSION (Planning Team)                 │
│  ├─ Review regional feedback                                      │
│  ├─ Amend plan if needed OR send feedback as-is                   │
│  └─ Resubmit amended/confirmed plan to Director                   │
│                                                                     │
│  STEP 6: DIRECTOR SENDS TO SENIOR MANAGEMENT                      │
│  ├─ Director sends finalized plan to Senior Management            │
│  └─ Plan includes all amendments from regional feedback           │
│                                                                     │
│  STEP 7: SENIOR MANAGEMENT APPROVAL                               │
│  ├─ Review plan against strategic objectives                      │
│  ├─ Approve or reject plan                                        │
│  └─ Notify all stakeholders of decision                           │
│                                                                     │
│  STEP 8: EXECUTION (Auditors at Tax Centers)                      │
│  ├─ Access approved plan                                          │
│  ├─ View individual taxpayer details from Risk Engine             │
│  ├─ Audit evidence & risk indicators for each taxpayer            │
│  └─ Execute audit cases based on plan                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Risk Engine - Hierarchical Information Layers

The Risk Engine provides risk intelligence at each organizational level. Users review risk data BEFORE making planning decisions.

### Level 1: National (Ministry of Revenue - MOR)

**Who sees it**: Planning Team, Director, Senior Management (all see same MOR data)

**Data provided**:
- Total registered taxpayers (e.g., 5.2M)
- Risky suspects (e.g., 430K = 8.3% of total)
- Risk distribution:
  - Low Risk: 180K
  - Medium Risk: 150K
  - High Risk: 80K
  - Critical Risk: 20K
- **Revenue at Risk**: 12.4 Billion ETB (critical metric)
- **Audit type candidates**:
  - Desk Audit: 55,000 candidates
  - Field Audit: 35,000 candidates
  - Joint Audit: 18,000 candidates
  - Transfer Pricing: 7,500 candidates
  - Comprehensive: 650 candidates
  - Single Issue: 300 candidates
- Risk by industry (Construction, Manufacturing, etc.)
- Risk by tax type (VAT, CIT, Payroll, etc.)
- Top risk indicators (Late Filing, VAT Mismatch, etc.)
- Compliance metrics (Filing, Payment, Registration rates)
- Year-over-year trends

**Planning Team Uses This To**: Decide audit volume, prioritize audit types, allocate resources strategically

### Level 2: Regional (Region-Specific)

**Who sees it**: Regional Directors see ONLY their region (not MOR data)

**Data provided** (for assigned region only):
- Regional taxpayer base (e.g., Oromia: 420K)
- Risky suspects in region (e.g., 95K)
- High risk & critical risk breakdown
- Revenue at risk (regional estimate)
- Regional audit type candidates
- Risk by industry (in this region)
- Risk by tax type (in this region)

**Planning Team Uses This To**: Propose regional allocations; understand regional risk context

**Regional Directors Use This To**: Provide informed feedback on allocations; assess capacity needs

### Level 3: Tax Center Level

**Who sees it**: Tax center managers, operational staff

**Data provided**:
- Tax center taxpayer count
- High risk & critical risk counts
- Revenue at risk (tax center)
- Risk indicators for the tax center
- Ready for operational planning

### Level 4: Individual Taxpayer (Auditor Level)

**Who sees it**: Auditors, audit teams at tax centers

**Data provided per taxpayer**:
- TIN (Tax Identification Number)
- Business name & type
- Overall risk score
- Specific risk indicators with evidence:
  - Late filing instances (dates, penalties)
  - Late payment history (amounts, dates)
  - VAT mismatch details (amounts)
  - Import vs Sales variance (numbers)
  - Continuous losses (years, amounts)
- Recommended audit type based on risk
- Suggested audit focus areas
- Historical audit results (if any)
- Compliance history

**Auditors Use This To**: Execute actual audit cases with specific evidence for each taxpayer

---

## Configuration & Configurability

### Risk Engine Configuration

The Risk Engine is configurable through `src/config/auditConfig.js`:

```javascript
export const auditConfig = {
  auditTypes: [ /* configurable list */ ],
  regions: [ /* configurable list */ ],
  skillTypes: [ /* configurable list */ ]
};
```

Users can:
- ✅ Add/Remove audit types
- ✅ Add/Remove regions
- ✅ Add/Remove skill types
- ✅ Enable/Disable Risk Engine view

### Toggling Risk Engine

To disable/enable Risk Engine for a role, modify `src/components/Sidebar.jsx`:

```javascript
// In getMenuItems() switch statement
case 'audit_team':
  return [
    { id: 'dashboard', ... },
    // Uncomment/comment next line to toggle Risk Engine
    // { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis' },
    { id: 'create-plan', ... },
    // ...
  ];
```

---

## Regional Data Isolation

### Implementation Details

**Regional Directors should see ONLY their assigned region:**

The system uses a **Global Regional Context** pattern (`src/context/RegionalContext.jsx`) to manage region selection consistently across ALL pages.

#### How It Works

1. **RegionalProvider** in App.jsx:
   - Manages `selectedRegion` globally
   - Auto-assigns region for regional directors
   - Provides `useRegional()` hook to all components

2. **Region Selection** (`RegionSelector.jsx`):
   - Shows all regions (Planning Team, Director, Senior Management)
   - Shows ONLY assigned region (Regional Directors)
   - User must select region BEFORE seeing region-specific data

3. **Regional Data Isolation**:
   - Regional directors see ONLY their region
   - Cannot see other regions or national data
   - Clear "THIS PAGE SHOWS DATA FOR [REGION] ONLY" warning
   - Percentages are relative to that region only

#### Implementation Pattern

For ANY page showing region-specific data:

```javascript
import { useRegional } from '../context/RegionalContext';
import RegionSelector from '../components/RegionSelector';

function MyRegionalPage() {
  const { selectedRegion, setSelectedRegion, userRole } = useRegional();
  
  // Show region selector first
  if (!selectedRegion) {
    return (
      <RegionSelector
        onRegionSelect={setSelectedRegion}
        currentRegion={selectedRegion}
        userRole={userRole}
      />
    );
  }
  
  // Show region-specific data
  return <div>Data for {selectedRegion} only</div>;
}
```

#### Behavior by Role

**Planning Team / Director / Senior Management**:
```
Click Risk Engine
  ↓
RegionSelector shows all 6 regions
  ↓
Select region → View that region's data
  ↓
Can click "Change Region" to select different region
```

**Regional Directors**:
```
Click Risk Engine
  ↓
RegionSelector shows ONLY their region (auto-selected)
  ↓
Click Select → View their region's data
  ↓
Cannot change to other regions (access control)
```

#### Files

- `src/context/RegionalContext.jsx` - Global region state management
- `src/components/RegionSelector.jsx` - Reusable region selection screen
- `src/components/views/RiskEngineView.jsx` - Already using this pattern
- `REGION_SELECTION_PATTERN.md` - Detailed implementation guide

---

## Testing with Postman

### API Integration Points

Currently the system uses **localStorage** for data persistence. To test with Postman:

#### Option 1: Mock Backend API

Create endpoints like:

```
GET /api/risk/national
  Response: National risk data (MOR view)

GET /api/risk/region/:regionName
  Response: Regional risk data for specific region

GET /api/risk/taxcenter/:taxCenterId
  Response: Tax center risk data

GET /api/risk/taxpayers/:taxCenterId
  Response: Array of individual taxpayer risk details

GET /api/audit/plans
  Response: All audit plans

POST /api/audit/plans
  Request: New audit plan
  Response: Created plan

PUT /api/audit/plans/:planId
  Request: Updated plan
  Response: Updated plan

POST /api/audit/plans/:planId/submit
  Request: Submission action
  Response: Updated plan with new status
```

#### Option 2: Connect to Existing Backend

Replace `src/utils/data.js` functions to call your backend:

```javascript
// Instead of loadData() from localStorage
export function loadData() {
  // Call: GET /api/audit/data
  // Return structured data with plans, riskEngine data
}

// Instead of saveData() to localStorage
export function saveData(data) {
  // Call: POST /api/audit/data
  // Send complete data structure
}
```

#### Example Postman Request

```
GET http://localhost:3000/api/risk/national
Headers:
  Authorization: Bearer YOUR_TOKEN

Response:
{
  "national": {
    "totalRegistered": 5200000,
    "riskySuspects": 430000,
    "revenueAtRisk": 12400000000,
    "riskDistribution": {
      "low": 180000,
      "medium": 150000,
      "high": 80000,
      "critical": 20000
    },
    "byAuditType": [
      { "type": "Desk Audit", "candidates": 55000 },
      ...
    ]
  }
}
```

---

## File Structure

```
src/
├── components/
│   ├── Badge.jsx
│   ├── Card.jsx
│   ├── Sidebar.jsx
│   ├── TopBar.jsx
│   ├── modals/
│   │   ├── CreateAuditPlanModal.jsx
│   │   ├── CreatePlanModal.jsx
│   │   ├── FeedbackModal.jsx
│   │   └── ...
│   └── views/
│       ├── AuditPlanningView.jsx (Planning Team)
│       ├── DirectorView.jsx (Audit Director)
│       ├── RegionalFeedbackView.jsx (Regional Directors)
│       ├── SeniorManagementView.jsx (Senior Management)
│       ├── RiskEngineView.jsx (Shared across all roles)
│       ├── PlanDetailsView.jsx
│       ├── DirectorFeedbackReviewView.jsx
│       ├── FeedbackReviewView.jsx
│       ├── ConfigurationView.jsx
│       └── AuditTeamView.jsx
├── config/
│   └── auditConfig.js (Audit types, Regions, Skills - Configurable)
├── utils/
│   ├── businessLogic.js (Workflow state machine)
│   └── data.js (Data persistence - localStorage or API)
└── App.jsx (Main router)
```

---

## Current Implementation Status

### ✅ Completed

- [x] React + Vite setup
- [x] 4 user roles with role-based sidebar
- [x] Audit plan creation workflow
- [x] Director review & approval
- [x] Regional feedback collection
- [x] Senior Management approval
- [x] Plan amendment workflow
- [x] Configuration management
- [x] Risk Engine dashboard (National, Regional, Tax Center levels)
- [x] Full approval history tracking
- [x] Global Regional Context for region selection
- [x] Region selection pattern for ALL region-specific pages
- [x] Regional data isolation (regional directors see ONLY their region)

### 🔄 In Progress / Next Steps

- [ ] Apply region selection pattern to other region-specific views (Audit Planning, Plan Details, Configuration)
- [ ] Individual taxpayer risk details (Level 4)
- [ ] Backend API integration
- [ ] Postman API testing
- [ ] Risk Engine configurability toggle
- [ ] Email notifications
- [ ] Audit case management (execution level)
- [ ] Actual audit evidence capture
- [ ] Report generation

---

## Environment Setup

### Build

```bash
npm run build
```

### Development

```bash
npm run dev
```

### Current Build Status

- **Modules**: 34
- **Bundle Size**: 301.71 kB
- **Gzipped**: 79.48 kB
- **Status**: ✅ Production Ready

---

## Key Concepts

### Separation of Concerns

**Risk Engine Provides**: "430,000 risky taxpayers exist. 80,000 are high-risk. Construction and VAT are top risk areas. 7,500 candidates for comprehensive audit. Revenue at risk: 12.4B ETB."

**Risk Engine Does NOT Do**: "Audit taxpayer TIN-001234 specifically."

**Planning Team Decides**:
- How many total audits to conduct
- Which regions get what resources
- Which audit types to prioritize
- Which specific taxpayers to audit (after approval)

### Workflow State Machine

Plans move through defined states:
```
DRAFT → SUBMITTED_TO_DIRECTOR → DIRECTOR_APPROVED → AWAITING_REGIONAL_FEEDBACK
   ↓                                    ↓
REVISION_REQUESTED                FEEDBACK_COLLECTED → SUBMITTED_TO_DIRECTOR
                                                              ↓
                                                   SUBMITTED_TO_SENIOR_MANAGEMENT
                                                              ↓
                                                   SENIOR_MANAGEMENT_APPROVED
```

## Testing Complete Plan Flow with Manual Audit Type Distribution (Step-by-Step)

### Key Feature: Same Distribution Pattern at Every Level

**Pattern Applied**:
1. **Planning Team**: Creates plan with audit type distribution across regions
   - Desk Audit: X cases to Addis Ababa, Y to Oromia, etc.
   - Field Audit: X cases to Addis Ababa, Y to Oromia, etc.
   - (Same for all 6 audit types)

2. **Regional Director**: Distributes regional audit types across tax centers
   - Same table format as Planning Team
   - Desk Audit: X cases to TC1, Y to TC2, Z to TC3
   - Field Audit: X cases to TC1, Y to TC2, Z to TC3
   - (Same for all 6 audit types)

3. **Validation**: Each audit type column must equal regional total
   - Desk Audit column total = Regional Desk Audit total
   - Field Audit column total = Regional Field Audit total
   - Etc. for all audit types

### Prerequisites
- App running on localhost:5173
- Browser localStorage clear or Incognito window

### Step-by-Step Test Sequence

#### Step 1: Director Approves and Sends Plan
1. Role: Director
2. Approve sample plan AP-0001
3. Click "Send to Regions"
4. Plan status → "Awaiting Regional Feedback"

#### Step 2: Regional Director Reviews Plan
1. Role: Regional (Auto-assigned to Oromia)
2. Click "Review Plan from Director"
3. See Step 1: Plan Review with audit type breakdown:
   - Desk Audit: 122 cases
   - Field Audit: 105 cases
   - Joint Audit: 70 cases
   - Transfer Pricing: 28 cases
   - Comprehensive: 18 cases
   - Single Issue: 7 cases
   - **TOTAL: 350 cases**

4. Click "Next: Allocate to Tax Centers"

#### Step 3: Manual Distribution Table
1. See "Tax Center Distribution" table with:
   - Rows: Oromia TC1, Oromia TC2, Oromia TC3
   - Columns: Each audit type + TOTAL

2. **Manually distribute using the same pattern**:
   ```
   Example distribution:
   
   TAX CENTER          | DESK | FIELD | JOINT | T.P. | COMP | SINGLE | TOTAL
   Oromia TC1 (large)  |  60  |  50   |  30   |  14  |  8   |  3     |  165
   Oromia TC2 (medium) |  40  |  35   |  25   |  9   |  6   |  2     |  117
   Oromia TC3 (small)  |  22  |  20   |  15   |  5   |  4   |  2     |  68
   ────────────────────────────────────────────────────────────────────────
   TOTAL               | 122  | 105   |  70   | 28   | 18   |  7     | 350
   ```

3. **Each column total must match plan exactly**:
   - DESK column = 122 ✓
   - FIELD column = 105 ✓
   - JOINT column = 70 ✓
   - Etc.

#### Step 4: Live Validation
- As you type, validation shows:
  - Green ✓ if column total matches regional
  - Red ✗ if column total doesn't match
  - Shows "Need: XX" if incorrect

- Status cards below show each audit type:
  - Allocated / Expected
  - ✓ or ✗

#### Step 5: Send Allocations
1. When ALL audit types match:
   - Button "Send Allocations to Tax Centers" becomes enabled
   - Click to send
   - Transitions to Step 3: Collect Feedback

### Expected Table Format

```
═══════════════════════════════════════════════════════════════════════
  TAX CENTER        │ DESK │ FIELD │ JOINT │ T.P. │ COMP │ SINGLE │ TOTAL
═══════════════════════════════════════════════════════════════════════
  Oromia TC1        │ [ ]  │ [ ]   │ [ ]   │ [ ] │ [ ]  │ [ ]    │  0
  Oromia TC2        │ [ ]  │ [ ]   │ [ ]   │ [ ] │ [ ]  │ [ ]    │  0
  Oromia TC3        │ [ ]  │ [ ]   │ [ ]   │ [ ] │ [ ]  │ [ ]    │  0
───────────────────────────────────────────────────────────────────────
  TOTAL             │ 122  │ 105   │ 70    │ 28  │ 18   │ 7      │ 350
                    │ ✓    │ ✓     │ ✓     │ ✓   │ ✓    │ ✓      │
═══════════════════════════════════════════════════════════════════════
```

- Editable cells: [ ] input boxes
- Read-only cells: Total columns and header
- Color coding: Green for correct, Red for incorrect
- Validation in real-time

### Key Features

✅ **Same Pattern Everywhere**:
- Planning Team distribution: Audit types → Regions
- Regional distribution: Audit types → Tax Centers
- Same table format and validation

✅ **Column Validation**:
- Each audit type must total to regional amount
- Live validation as user types
- Color-coded feedback

✅ **Can't Send Until Perfect**:
- Button disabled if any column mismatches
- Clear error messages
- Shows expected vs actual

### Testing Checklist

- [ ] Regional director sees plan review screen
- [ ] Plan shows audit type breakdown from director
- [ ] Can proceed to allocation screen
- [ ] Allocation table shows 3 tax centers and 6 audit types
- [ ] Can enter values in input boxes
- [ ] Validation shows correct/incorrect in real-time
- [ ] Green checkmarks appear when columns match
- [ ] Red X and "Need: XX" when incorrect
- [ ] Send button disabled until all match
- [ ] Send button enabled once all validated
- [ ] No console errors

### The Pattern Explained

**Why this matters:**
- **Consistency**: Same decision-making process at each level
- **Traceability**: Can see exactly how each audit type flows down
- **Validation**: Ensures nothing gets lost in distribution
- **Transparency**: Each level knows their portion of each audit type

**Example flow for "Desk Audit"**:
```
Planning Team decides: 
  → 122 Desk Audits nationally

Director sends to regions:
  → Oromia gets: 122 Desk Audits

Regional Director distributes:
  → TC1: 60, TC2: 40, TC3: 22
  → Total: 122 ✓ (matches regional)

Tax Centers execute:
  → TC1 executes 60 Desk Audits
  → TC2 executes 40 Desk Audits
  → TC3 executes 22 Desk Audits
```

---

## Summary

**What Was Fixed**:

✅ **Regional Director Workflow Improved**:
- Now manually allocates cases to tax centers (same as Planning Team)
- Two-step process: Plan Review → Manual Allocation
- Cannot submit until ALL tax centers provide feedback
- Clear visual workflow stages

✅ **Same Allocation Pattern Everywhere**:
- Planning Team: Allocates to regions (manually)
- Regional Director: Allocates to tax centers (manually)
- Both use identical allocation interface
- Both validate total cases match

✅ **Feedback Constraints**:
- Submit button disabled until all feedback received
- Clear status showing feedback from each tax center
- No bypassing the feedback collection requirement

✅ **Build Status**:
- ✅ 41 modules compiled
- ✅ 0 errors
- ✅ Ready to test

---

To add Level 4 (Auditor level) with individual taxpayer details:

1. **Create TaxpayerDetailsView.jsx**
2. **Populate from Risk Engine at Auditor level**
3. **Include per-taxpayer risk evidence**:
   - Late filing dates/penalties
   - Payment delays with amounts
   - VAT mismatches with details
   - Audit recommendations

4. **Integrate with tax center allocation**
5. **Generate auditor case lists**

---

## Questions?

Refer to specific view files for detailed implementation logic:
- Planning workflow: `AuditPlanningView.jsx`
- Director workflow: `DirectorView.jsx`
- Regional feedback: `RegionalFeedbackView.jsx`
- Risk analysis: `RiskEngineView.jsx`
- Business rules: `businessLogic.js`


---

## Complete End-to-End Workflow: Plan Flow to Tax Centers

### Full Hierarchy Flow

```
PLANNING TEAM (National Level)
  ├─ Creates audit plan with audit type distribution
  │  ├─ Desk Audit: 411 nationally
  │  ├─ Field Audit: 354 nationally
  │  └─ (6 types total, distributed across 6 regions)
  │
  └─ Submits to Director

DIRECTOR (National Level)
  ├─ Reviews plan
  ├─ Approves plan
  └─ Sends to ALL regions

REGIONAL DIRECTOR (Region Level - e.g., Oromia)
  ├─ Receives plan with regional allocation
  │  ├─ Oromia: 122 Desk, 105 Field, 70 Joint, etc.
  │  └─ Total: 350 cases
  │
  ├─ Manually distributes to 3 tax centers using same table format
  │  ├─ Oromia TC1: 60 Desk, 50 Field, 30 Joint, etc.
  │  ├─ Oromia TC2: 40 Desk, 35 Field, 25 Joint, etc.
  │  └─ Oromia TC3: 22 Desk, 20 Field, 15 Joint, etc.
  │
  ├─ Validates each column total matches regional
  └─ Sends allocations to tax centers

TAX CENTER MANAGER (Tax Center Level - e.g., Oromia TC1)
  ├─ Receives allocation (60 Desk, 50 Field, 30 Joint, etc.)
  ├─ Views complete allocation breakdown
  │  ├─ Sees regional context (regional totals)
  │  ├─ Sees how their 165 cases fit in regional 350
  │  └─ Sees effort hours required per audit type
  │
  ├─ Provides feedback on:
  │  ├─ Capacity to handle allocation
  │  ├─ Resource constraints
  │  ├─ Skill availability
  │  └─ Any concerns or suggestions
  │
  └─ Submits feedback to regional director

REGIONAL DIRECTOR (Again)
  ├─ Collects feedback from ALL tax centers
  │  ├─ Oromia TC1: "Can handle"
  │  ├─ Oromia TC2: "Need resources"
  │  └─ Oromia TC3: "OK with modifications"
  │
  ├─ CANNOT submit until all feedback received
  └─ Submits consolidated feedback to director

DIRECTOR (Again)
  ├─ Reviews feedback from all regions
  ├─ Decides to approve or request amendments
  └─ Sends to Senior Management (if approved)

SENIOR MANAGEMENT
  ├─ Reviews finalized plan
  └─ Approves or rejects
```

### Tax Center Feedback View Features

**What Tax Center Sees**:
1. **Allocation Summary** - Total cases allocated
2. **Regional Context** - How their allocation fits in regional plan
3. **Audit Type Breakdown** - Exact distribution per audit type
4. **Effort Calculation** - Hours required per audit type
5. **Feedback Form** - Provide detailed feedback

**Example Tax Center View**:
```
OROMIA TC1 ALLOCATION

Total Allocated: 165 cases

REGIONAL CONTEXT (All Tax Centers):
  Oromia TC1: 165 cases (47%)
  Oromia TC2: 117 cases (33%)
  Oromia TC3: 68 cases (20%)
  ─────────────────────────
  TOTAL: 350 cases

YOUR AUDIT TYPE ALLOCATION:
  Audit Type          | Cases | Effort/Case | Total
  Desk Audit          | 60    | 10h         | 600h
  Field Audit         | 50    | 20h         | 1000h
  Joint Audit         | 30    | 30h         | 900h
  Transfer Pricing    | 14    | 40h         | 560h
  Comprehensive       | 8     | 50h         | 400h
  Single Issue        | 3     | 15h         | 45h
  ─────────────────────────────────────────────
  TOTAL: 165         |       |             | 3505h

FEEDBACK FORM
  Can you handle this workload?
  Do you need resources?
  Etc.
```

### Testing the Complete Flow

#### Step 1: Regional Director Allocates (Same as before)
1. Approve plan as Director
2. Send to Regions
3. As Regional Director, allocate to tax centers using table
4. Validate all columns match
5. Send allocations

#### Step 2: Tax Center Receives & Provides Feedback (NEW)
1. Role: Tax Center Manager
2. Must select region first, then tax center
3. Click "View Allocation & Feedback"
4. See allocation table with regional context
5. See effort calculations
6. Provide feedback
7. Click "Submit Feedback to Regional Director"

#### Step 3: Regional Collects Feedback
1. Back to Regional Director
2. Click "Tax Center Feedback"
3. See status of all tax centers
4. Once all submit feedback → "Submit to Director" enabled
5. Submit consolidated feedback

#### Step 4: Director Receives Feedback
1. Back to Director
2. Can see feedback received
3. Approve or request amendments
4. Send to Senior Management

### Key Validation Points

✅ **Regional Level**:
- Each audit type column must total to regional amount
- Cannot send until all tax centers allocated

✅ **Tax Center Level**:
- Sees their portion of regional allocation
- Shows regional context for transparency
- Must provide feedback

✅ **Regional Feedback Collection**:
- Cannot submit until all tax centers provide feedback
- Clear status for each tax center
- Shows feedback contents

---

## Build Status

✅ **44 modules** (added RegionMultiSelector, DirectorBulkFeedbackView)  
✅ **0 errors**  
✅ **Bundle size**: 380.49 kB  
✅ **Gzip**: 92.44 kB  
✅ **Build time**: 283ms  
✅ **Production Ready**  

---

## Director's Bulk Feedback Feature (NEW)

### What It Does

Director can now:
1. Select a plan
2. Choose multiple regions at once using checkboxes
3. Send feedback/instructions to all selected regions in one action
4. Track which regions have received feedback

### How to Use

#### Step 1: Switch to Director Role
- Top bar → Select "Director"
- Sidebar → "Send Feedback to Regions"

#### Step 2: Select a Plan
- See list of plans ready for feedback
- Click "Send Feedback" button on any plan

#### Step 3: Enter Feedback/Instructions
- Type any feedback, questions, or instructions
- Example: "Please review allocation feasibility"
- Example: "We need updated capacity assessments"

#### Step 4: Select Regions (Multi-Select)
- Click "Submit Feedback to X Regions"
- See all regions with checkboxes
- Click "Select All Regions" to choose all at once
- Or click individual regions to choose specific ones
- Selection shows in real-time with green highlight

#### Step 5: Confirm and Send
- Click "Submit Feedback to [N] Regions"
- Confirm dialog shows selected regions
- Feedback sent to all selected regions
- Notification confirms success

### File Structure

**New Files Created** (Non-Breaking):
- `src/components/RegionMultiSelector.jsx` - Reusable multi-select component with checkboxes
- `src/components/views/DirectorBulkFeedbackView.jsx` - Director bulk feedback workflow

**Modified Files** (Minimal Changes):
- `src/App.jsx` - Added import and routing for new view
- `src/components/Sidebar.jsx` - Added menu item for Director role

### Data Structure

Feedback is stored in plan as:
```javascript
{
  directorFeedbackToRegions: [
    {
      region: "Oromia",
      feedback: "Please review allocation...",
      sentDate: "2026-07-18T...",
      status: "SENT"
    },
    {
      region: "Amhara",
      feedback: "Please review allocation...",
      sentDate: "2026-07-18T...",
      status: "SENT"
    }
  ]
}
```

### Testing Checklist

```
[ ] Director can see "Send Feedback to Regions" menu
[ ] Can click on plan to view details
[ ] Can enter feedback text
[ ] Region multi-selector appears
[ ] "Select All" checkbox works
[ ] Individual region checkboxes work
[ ] Selected regions show in green
[ ] Counter shows correct number selected
[ ] Submit button disabled if no regions selected
[ ] Submit button enabled when regions selected
[ ] Confirmation dialog shows selected regions
[ ] Feedback stored in plan correctly
[ ] Can verify with browser console
```

---

## File: Complete End-to-End Testing Guide

(See README section above)

---

### What This Tests

This is the **COMPLETE WORKFLOW** that routes audit allocations from Planning Team → Director → Regional Director → Tax Centers, with feedback flowing back up.

### Prerequisites

1. **Start fresh**: Clear browser localStorage or use Incognito window
2. **URL**: http://localhost:5173 (or your dev server)
3. **Build status**: ✅ 42 modules, 0 errors

### Test Sequence (Follow Exactly in Order)

---

#### **PHASE 1: PLANNING TEAM CREATES & SUBMITS PLAN**

##### 1.1 Role: Switch to "Audit Team"
- Top bar → Click current role → Select "Audit Team"
- Sidebar → "Create Annual Plan"

##### 1.2 Create Plan with Distribution
- Click "Create New Plan"
- Modal opens:
  - Plan Name: "Test Plan 2026"
  - Year: 2026
  - Duration: 12 months
  - Tactics: "Risk-based audit approach"
  - Notes: "Test for tax center feedback flow"
  - Click "Create Plan"

##### 1.3 Verify Plan Created
- You should see sample plan AP-0001 loaded
- See audit type allocation across 6 regions:
  - Desk Audit: 411 total
  - Field Audit: 354 total
  - etc.

##### 1.4 Submit to Director
- Click "Submit to Director"
- Confirm dialog
- Plan status → "SUBMITTED_TO_DIRECTOR"

---

#### **PHASE 2: DIRECTOR REVIEWS & APPROVES**

##### 2.1 Role: Switch to "Director"
- Top bar → Select "Director"
- Sidebar → "Plans to Review"

##### 2.2 Review Plan
- Click on AP-0001
- See plan details with regional breakdown
- Verify allocations look correct

##### 2.3 Approve Plan
- Click "Approve & Send to Regions"
- Confirm dialog
- Plan status → "AWAITING_REGIONAL_FEEDBACK"

---

#### **PHASE 3: REGIONAL DIRECTOR ALLOCATES TO TAX CENTERS**

##### 3.1 Role: Switch to "Regional"
- Top bar → Select "Regional"
- Auto-assigned to "Oromia" region (see top bar)
- Sidebar → "Allocate to Tax Centers"

##### 3.2 Region Selector (Region Pre-selected)
- Region selector shows "Oromia" (pre-selected, cannot change)
- Click "Select Oromia" or region name

##### 3.3 Plan Review Step
- Title: "Review Plan from Director"
- See audit type breakdown from director:
  ```
  Desk Audit: 122 cases
  Field Audit: 105 cases
  Joint Audit: 70 cases
  Transfer Pricing: 28 cases
  Comprehensive: 18 cases
  Single Issue: 7 cases
  TOTAL: 350 cases
  ```

##### 3.4 Proceed to Allocation
- Click "Next: Allocate to Tax Centers"

##### 3.5 Manual Distribution Table
- Title: "Allocate Audit Types to Tax Centers - Oromia"
- Table shows:
  - **ROWS**: 3 tax centers (Oromia TC1, Oromia TC2, Oromia TC3)
  - **COLUMNS**: 6 audit types + TOTAL column
  - **Read-only cells** at bottom show regional totals (122, 105, 70, 28, 18, 7)

##### 3.6 Fill In Distribution
- **Enter these values** (examples - can use other valid distributions):

  ```
  TAX CENTER        | DESK | FIELD | JOINT | T.P. | COMP | SINGLE | TOTAL
  Oromia TC1        | 60   | 50    | 30    | 14   | 8    | 3      | 165
  Oromia TC2        | 40   | 35    | 25    | 9    | 6    | 2      | 117
  Oromia TC3        | 22   | 20    | 15    | 5    | 4    | 2      | 68
  ──────────────────────────────────────────────────────────────────────
  TOTAL             | 122  | 105   | 70    | 28   | 18   | 7      | 350
  ```

- **Type values step-by-step**:
  1. Click on Oromia TC1, DESK column → Type "60"
  2. Click on Oromia TC1, FIELD column → Type "50"
  3. Continue for all cells...

##### 3.7 Real-Time Validation
- **Watch the totals row** as you type:
  - Should turn green ✓ when column matches regional
  - Should turn red ✗ when column doesn't match
  - Shows "Need: XX" in red if incorrect

- **Validation cards below** show status:
  - "Desk Audit: 60 / 122" (updates as you type)
  - Shows ✓ or ✗

##### 3.8 Send Allocations
- Once ALL columns show green ✓ and validation cards show all ✓:
  - Button "Send Allocations to Tax Centers" enables
  - Click button
  - Confirmation dialog: "Send allocations to 3 tax centers in Oromia?"
  - Click "OK"
  - Message: "✓ Allocations sent to 3 tax centers!"

---

#### **PHASE 4: TAX CENTER RECEIVES & VIEWS ALLOCATION**

##### 4.1 Role: Switch to "Tax Center"
- Top bar → Select "Tax Center Manager"
- Auto-assigned to "Oromia-tc1" (see console or test it)

##### 4.2 Access Feedback View
- Sidebar → "View Allocation & Feedback"

##### 4.3 Region Selection (Auto-Assigned)
- Region selector shows "Oromia" as pre-selected
- Should show "Oromia" automatically (not editable for regional assignments)
- Click "Select Oromia" or click the region

##### 4.4 Tax Center Assignment (Auto-Assigned)
- After region, tax center auto-assigned to "Oromia-tc1"
- System loads allocation for this tax center

##### 4.5 Allocation Received Banner
- Green banner: "✓ Audit Allocation Received"
- Message: "You have received your audit allocation for Oromia Tax Center 1 in Oromia region"

##### 4.6 Allocation Summary
- **Cards showing**:
  - Total Audit Cases: 165
  - Your Tax Center: Oromia-tc1
  - Region: Oromia
  - Plan Version: 1

##### 4.7 Regional Distribution Context
- **Table showing**: "Regional Distribution (All Tax Centers)"
  - AUDIT TYPE | Regional Total | Your Allocation | % of Regional
  - Desk Audit | 122 | 60 | 49.2%
  - Field Audit | 105 | 50 | 47.6%
  - Joint Audit | 70 | 30 | 42.9%
  - Transfer Pricing | 28 | 14 | 50.0%
  - Comprehensive | 18 | 8 | 44.4%
  - Single Issue | 7 | 3 | 42.9%
  - TOTAL | 350 | 165 | 47.1%

##### 4.8 Your Audit Type Allocation
- **Table showing detailed effort**:
  - AUDIT TYPE | Allocated Cases | Effort/Case | Total Effort
  - Desk Audit | 60 | 10h | 600h
  - Field Audit | 50 | 20h | 1000h
  - Joint Audit | 30 | 30h | 900h
  - Transfer Pricing | 14 | 40h | 560h
  - Comprehensive | 8 | 50h | 400h
  - Single Issue | 3 | 15h | 45h
  - TOTAL | 165 | - | 3505h

---

#### **PHASE 5: TAX CENTER PROVIDES FEEDBACK**

##### 5.1 Feedback Form
- Section: "Your Feedback"
- Textarea placeholder with example questions:
  ```
  - Can your team handle this workload with current capacity?
  - Do you have the skills required for all audit types?
  - Are there any constraints or resource limitations?
  - Which audit types are you most/least prepared for?
  - Any other concerns or suggestions?
  ```

##### 5.2 Enter Feedback
- Click in textarea
- Type example feedback:
  ```
  We can handle 165 cases. We have strong capacity for Desk and Field audits. 
  Transfer Pricing requires specialized training for 2 team members. 
  Overall, feasible with current staffing.
  ```

##### 5.3 Submit Feedback
- Click "Submit Feedback to Regional Director"
- Dialog confirms submission
- Message: "✓ Feedback submitted to Oromia Regional Director"

##### 5.4 Status Changes
- Submit button disappears
- New section appears:
  - Green banner: "✓ Feedback Submitted"
  - Message: "Your feedback has been submitted to the Oromia Regional Director..."

---

#### **PHASE 6: TAX CENTER 2 ALSO PROVIDES FEEDBACK**

##### 6.1 Switch Tax Centers (Simulate Second Tax Center)
- This is trickier because tax center is auto-assigned
- **Workaround for testing**:
  1. Clear localStorage: Open DevTools → Application → LocalStorage → Clear All
  2. Edit RegionalContext.jsx line to assign different tax center
  3. Or manually test with second browser/Incognito window

- **For now, document that TC2 and TC3 must also provide feedback**

---

#### **PHASE 7: REGIONAL DIRECTOR COLLECTS FEEDBACK**

##### 7.1 Role: Switch back to "Regional"
- Top bar → Select "Regional"
- Region remains "Oromia"
- Sidebar → "Tax Center Feedback"

##### 7.2 Feedback Collection View
- Title: "Collect Tax Center Feedback"
- Status section showing all 3 tax centers:
  ```
  Oromia TC1: ✓ FEEDBACK RECEIVED
    Feedback: "We can handle 165 cases..."
    Submitted: [timestamp]
  
  Oromia TC2: ⏳ AWAITING FEEDBACK
    [No action available]
  
  Oromia TC3: ⏳ AWAITING FEEDBACK
    [No action available]
  ```

##### 7.3 Cannot Submit Yet
- Button "Submit Feedback to Director" is DISABLED
- Reason shown: "Waiting for feedback from 2 tax centers"

---

#### **PHASE 8: SIMULATE ALL FEEDBACK RECEIVED**

##### 8.1 Manually Test Other Tax Centers
- Browser DevTools → Console → Paste:
  ```javascript
  const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
  const latestPlan = data.plans[data.plans.length - 1];
  console.log('Latest plan:', latestPlan);
  console.log('Tax center allocations:', latestPlan.taxCenterAllocations);
  console.log('Feedback:', data.taxCenterFeedback);
  ```

- This shows exactly what data is stored
- Verify tax center IDs match: `"Oromia-tc1"`, `"Oromia-tc2"`, `"Oromia-tc3"`

##### 8.2 Add Feedback for Other Tax Centers Manually
- Console:
  ```javascript
  const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
  if (!data.taxCenterFeedback) data.taxCenterFeedback = [];
  data.taxCenterFeedback.push({
    id: 'feedback-2',
    fromTaxCenter: 'Oromia-tc2',
    fromRegion: 'Oromia',
    feedback: 'Ready to execute. No concerns.',
    timestamp: new Date().toLocaleString(),
    status: 'pending_review'
  });
  data.taxCenterFeedback.push({
    id: 'feedback-3',
    fromTaxCenter: 'Oromia-tc3',
    fromRegion: 'Oromia',
    feedback: 'Allocated cases acceptable. Will need 1 additional auditor.',
    timestamp: new Date().toLocaleString(),
    status: 'pending_review'
  });
  localStorage.setItem('audit_planning_system_v2', JSON.stringify(data));
  location.reload();
  ```

---

#### **PHASE 9: REGIONAL DIRECTOR SUBMITS FEEDBACK**

##### 9.1 After Manual Feedback Addition
- Reload page (from console command above)
- Sidebar → "Tax Center Feedback"

##### 9.2 All Feedback Received
- Status shows all 3 tax centers with green checkmarks:
  ```
  Oromia TC1: ✓ FEEDBACK RECEIVED
  Oromia TC2: ✓ FEEDBACK RECEIVED
  Oromia TC3: ✓ FEEDBACK RECEIVED
  ```

##### 9.3 Submit Button Enabled
- Button "Submit Feedback to Director" is now ENABLED
- Click button
- Confirmation: "Submit consolidated feedback from 3 tax centers to Director?"
- Click "OK"

##### 9.4 Feedback Submitted
- Message: "✓ Consolidated feedback sent to Director"
- Plan status → next state

---

### Verification Checklist

Use this to verify each phase worked:

```
PHASE 1 - Planning Team
  [ ] Created plan AP-0001
  [ ] Plan has 6 regions with allocations
  [ ] Submitted to director
  [ ] Plan status: SUBMITTED_TO_DIRECTOR

PHASE 2 - Director
  [ ] Plan visible in "Plans to Review"
  [ ] Approved and sent to regions
  [ ] Plan status: AWAITING_REGIONAL_FEEDBACK

PHASE 3 - Regional Director
  [ ] Auto-assigned to "Oromia" region
  [ ] Allocate view shows plan breakdown (350 cases)
  [ ] Filled in 3 tax center allocations
  [ ] Each column total matched regional (green checkmarks)
  [ ] Sent allocations to 3 tax centers

PHASE 4 - Tax Center
  [ ] Switched to Tax Center role
  [ ] Auto-assigned to Oromia-tc1
  [ ] Saw allocation received banner (green)
  [ ] Saw summary cards (165 cases)
  [ ] Saw regional context (350 total)
  [ ] Saw audit type breakdown with effort

PHASE 5 - Tax Center Feedback
  [ ] Filled feedback form
  [ ] Clicked submit
  [ ] Saw confirmation message
  [ ] Saw status changed to "Feedback Submitted"

PHASE 7 - Regional Feedback Collection
  [ ] Switched back to Regional
  [ ] Clicked "Tax Center Feedback"
  [ ] Saw status of all 3 tax centers
  [ ] Submit button was disabled (waiting for others)

PHASE 9 - Submit All Feedback
  [ ] After adding other feedback manually
  [ ] All 3 tax centers showed "FEEDBACK RECEIVED"
  [ ] Submit button was enabled
  [ ] Clicked submit
  [ ] Saw confirmation message
```

---

### Console Commands for Testing

**Check data structure**:
```javascript
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
console.log('Plan:', data.plans[data.plans.length - 1]);
```

**Check tax center allocations**:
```javascript
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
console.log('Allocations:', data.plans[data.plans.length - 1].taxCenterAllocations);
```

**Check feedback**:
```javascript
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
console.log('Feedback:', data.taxCenterFeedback);
```

**Clear data (start fresh)**:
```javascript
localStorage.removeItem('audit_planning_system_v2');
location.reload();
```

---

### Expected Data Structure

**After Regional Director sends allocations**, localStorage should contain:

```javascript
{
  plans: [
    {
      id: "AP-0001",
      name: "Test Plan 2026",
      taxCenterAllocations: {
        "Oromia": {
          "Oromia-tc1": {
            "type_0": 60,  // Desk Audit
            "type_1": 50,  // Field Audit
            "type_2": 30,  // Joint Audit
            "type_3": 14,  // Transfer Pricing
            "type_4": 8,   // Comprehensive
            "type_5": 3    // Single Issue
          },
          "Oromia-tc2": { ... },
          "Oromia-tc3": { ... }
        }
      },
      // ... rest of plan
    }
  ],
  taxCenterFeedback: [
    {
      id: "feedback-1",
      fromTaxCenter: "Oromia-tc1",
      fromRegion: "Oromia",
      feedback: "We can handle 165 cases...",
      timestamp: "7/18/2026, 3:45:21 PM",
      status: "pending_review"
    },
    // ... more feedback
  ]
}
```

---

### Troubleshooting

**Problem**: Tax Center doesn't see allocation
- Check console: Is `selectedRegion` and `selectedTaxCenter` set?
- Check data: Does `taxCenterAllocations.Oromia["Oromia-tc1"]` exist?
- Verify IDs: Tax center IDs must match exactly (case-sensitive)

**Problem**: Regional director can't submit feedback
- Check all 3 tax centers have feedback entries
- Use console to manually add if needed

**Problem**: Validation fails in allocation table
- Verify each column total matches regional total exactly
- Check for off-by-one errors in manual entry

---

### Next: Automate Other Tax Centers

For full testing without manual console work, we could:
1. Add a "Test Mode" that auto-fills feedback from TC2 and TC3
2. Create a test helper component
3. Modify role selection to allow testing different tax centers

For now, the console approach works well for verification.

---


# Cluster-AP-Implementation
