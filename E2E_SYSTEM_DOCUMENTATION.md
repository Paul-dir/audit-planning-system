# MOR Audit Planning System - End-to-End Documentation

**Version:** 1.0  
**Date:** August 14, 2026  
**Status:** Production Ready  
**System:** React Frontend (v18) + Spring Boot Backend (Ready for Implementation)

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [User Roles & Organizational Structure](#user-roles--organizational-structure)
4. [Complete Workflow: Plan Creation to Finalization](#complete-workflow-plan-creation-to-finalization)
5. [Application Routing & Navigation](#application-routing--navigation)
6. [Data Model & Entities](#data-model--entities)
7. [State Management (AppContext)](#state-management-appcontext)
8. [User Activities by Role](#user-activities-by-role)
9. [Key Features & Workflows](#key-features--workflows)
10. [Technical Stack](#technical-stack)

---

## SYSTEM OVERVIEW

The **MOR Audit Planning System** is a hierarchical audit planning and case management platform that:

- **Plans national audit campaigns** for all regions in Ethiopia
- **Distributes audit cases** from planning teams to regional directors to tax centers to audit teams
- **Manages feedback cycles** at multiple organizational levels
- **Tracks audit progress** from assignment to completion
- **Supports 6 audit types** across all regions

### Core Objectives

✅ Centralized audit planning with multi-level approval workflows  
✅ Risk-based case generation and assignment  
✅ Real-time audit tracking and progress monitoring  
✅ Amendment management for plan refinements  
✅ Regional feedback collection and aggregation  

---

## ARCHITECTURE

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND LAYER (React)                                      │
│  ├─ Pages (Role-specific dashboards)                        │
│  ├─ Components (Reusable UI components)                     │
│  ├─ Context (AppContext, AuthContext, ThemeContext)         │
│  └─ Services (Auth, Storage)                                │
├─────────────────────────────────────────────────────────────┤
│  MIDDLEWARE LAYER                                            │
│  ├─ Authentication & Authorization                          │
│  ├─ Route Guards                                            │
│  └─ State Synchronization                                   │
├─────────────────────────────────────────────────────────────┤
│  BACKEND LAYER (Spring Boot - In Development)               │
│  ├─ REST APIs (Plan, Case, User, Regional management)       │
│  ├─ Business Logic (Workflows, validations)                 │
│  ├─ Database (PostgreSQL/MySQL)                             │
│  └─ Authentication (JWT)                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Structure

```
src/
├── pages/
│   ├── planning/              # Planning Team pages
│   ├── director/              # Director pages
│   ├── regional/              # Regional Director pages
│   ├── taxcenter/             # Tax Center Manager pages
│   ├── teamleader/            # Team Leader pages
│   ├── auditor/               # Auditor pages
│   ├── senior/                # Senior Management pages
│   └── Login.jsx
├── components/
│   ├── ui/                    # Shared UI components
│   ├── layout/                # Layout components
│   └── modals/                # Modal dialogs
├── context/
│   ├── AppContext.jsx         # State management
│   ├── AuthContext.jsx        # Authentication
│   └── ThemeContext.jsx       # Dark mode
├── data/
│   ├── constants.js           # All static data
│   ├── seed.js                # Demo data
│   └── taxpayers.js           # Taxpayer generation
└── services/
    ├── storage.js             # LocalStorage
    └── dataService.js         # Data utilities
```

---

## USER ROLES & ORGANIZATIONAL STRUCTURE

### Role Hierarchy (Top-Down)

```
┌─────────────────────────────────────────────────────────┐
│ SENIOR MANAGEMENT (Level 0)                              │
│ └─ Final approval of all national audit plans            │
├─────────────────────────────────────────────────────────┤
│ AUDIT DIRECTOR (Level 1)                                 │
│ └─ Reviews and approves plans from Planning Team         │
│    └─ Sends plans to Regional Directors                  │
│       └─ Receives feedback and amendments                │
├─────────────────────────────────────────────────────────┤
│ PLANNING TEAM (Level 2)                                  │
│ └─ Creates national audit plans                          │
│    └─ Incorporates director feedback                     │
│       └─ Submits for director approval                   │
├─────────────────────────────────────────────────────────┤
│ REGIONAL DIRECTORS (Level 3)                             │
│ ├─ One per region (5 regions in Ethiopia)                │
│ └─ Distributes to tax centers in their region            │
│    └─ Provides regional feedback                         │
│       └─ Can override/aggregate feedback                 │
├─────────────────────────────────────────────────────────┤
│ TAX CENTER MANAGERS (Level 4)                            │
│ ├─ One per tax center (3 per region = 15 total)          │
│ └─ Receives plan from regional director                  │
│    └─ Converts plan to audit cases                       │
│       └─ Assigns cases to Team Leaders                   │
├─────────────────────────────────────────────────────────┤
│ TEAM LEADERS (Level 5)                                   │
│ ├─ One per audit type per tax center (5-6 per TC)        │
│ └─ Receives cases from Tax Center Manager                │
│    └─ Assigns cases to their Auditors                    │
│       └─ Monitors team progress                          │
├─────────────────────────────────────────────────────────┤
│ AUDITORS (Level 6)                                       │
│ └─ Assigned cases by Team Leader                         │
│    └─ Performs actual audit work                         │
│       └─ Updates case status                             │
└─────────────────────────────────────────────────────────┘
```

### Geographic Structure

```
NATIONAL LEVEL
└─ 5 Regions
   ├─ Addis Ababa
   ├─ Amhara
   ├─ Oromia
   ├─ SNNPR
   └─ Somali

Each Region contains:
└─ 3 Tax Centers
   ├─ TC1, TC2, TC3

Each Tax Center contains:
└─ 5-6 Team Leaders (by audit type)
   └─ 2 Auditors per Team Leader
```

### Audit Types (6 Types)

1. **Desk Audit** - Office-based review
2. **Field Audit** - On-site inspection
3. **Joint Audit** - Multi-agency audit
4. **Transfer Pricing** - International transactions
5. **Comprehensive** - Full business review
6. **Issue Audit** - Specific issue investigation

---

## COMPLETE WORKFLOW: PLAN CREATION TO FINALIZATION

### Phase 1: Planning & Creation (Planning Team)

**Location:** Planning Dashboard  
**Actor:** Planning Team Members  
**Status:** `DRAFT`

```
1. Create New Plan
   ├─ Name & Description
   ├─ Year (e.g., 2024)
   ├─ Select 6 audit types
   ├─ Define regional distribution (e.g., AA:350, AM:280, OR:320, etc.)
   └─ System generates audit type allocation per region
   
2. Plan saved as DRAFT
   └─ Planning team can edit until submission
```

**Data Created:**
- Plan ID: `AP-{timestamp}`
- Status: `DRAFT`
- Distribution: `{ regionId: { auditType: count } }`
- Timeline entry: "Plan created"

---

### Phase 2: Planning Team Submission (Planning Team)

**Location:** Planning Dashboard  
**Actor:** Planning Team  
**Status:** `SUBMITTED_TO_DIRECTOR`

```
1. Planning team clicks "Submit to Director"
2. Plan status changes to SUBMITTED_TO_DIRECTOR
3. Director receives notification
4. Timeline updated with submission record
```

**What Changed:**
- Status: `DRAFT` → `SUBMITTED_TO_DIRECTOR`
- Timeline: Added submission event with actor & timestamp

---

### Phase 3: Director Review & Approval (Audit Director)

**Location:** Director Dashboard  
**Actor:** Audit Director  
**Possible Statuses:**
- `DIRECTOR_APPROVED` (Approve)
- `REVISION_REQUESTED` (Ask for changes)

#### Option 3A: Director Approves

```
1. Director reviews plan distribution
2. Clicks "Approve Plan"
3. Status becomes DIRECTOR_APPROVED
4. System automatically sends to all regions
   └─ Status becomes AWAITING_REGIONAL_FEEDBACK
```

**Data Updated:**
- Status: `SUBMITTED_TO_DIRECTOR` → `DIRECTOR_APPROVED` → `AWAITING_REGIONAL_FEEDBACK`
- Timeline: "Approved by Director"

#### Option 3B: Director Requests Revision

```
1. Director identifies issues with allocation or distribution
2. Clicks "Request Revision"
3. Enters comment explaining needed changes
4. Status becomes REVISION_REQUESTED
5. Plan returned to Planning Team
6. Planning team sees feedback comment and can edit
7. After revision, Planning team resubmits
```

**Data Updated:**
- Status: `SUBMITTED_TO_DIRECTOR` → `REVISION_REQUESTED`
- directorComment: "Feedback text"
- revisions[]: Added revision record
- Timeline: "Revision requested"

---

### Phase 4: Regional Feedback Cycle (Regional Director)

**Location:** Regional Dashboard  
**Actor:** Regional Director (one per region)  
**Status:** `AWAITING_REGIONAL_FEEDBACK` → `FEEDBACK_COLLECTED`

#### Step 4.1: Regional Director Receives Plan

```
1. Plan arrives at Regional Dashboard
2. Shows allocation for their region from plan.distribution
3. Regional Director can see:
   ├─ Total audit cases by type for region
   ├─ Tax centers that will receive cases
   └─ Distribution breakdown
```

#### Step 4.2: Regional Director Distributes to Tax Centers

```
1. Regional Director clicks "Distribute to Tax Centers"
2. For each tax center in region:
   ├─ Show regional allocation
   ├─ Can adjust allocation per tax center
   └─ Save distribution
   
3. System persists: plan.tcDistributions[regionId]
   └─ Stores allocation per tax center
```

**Data Created:**
- tcDistributions[regionId]: Per-tax-center allocation

#### Step 4.3: Regional Director Collects Feedback

```
1. Tax Center Managers provide feedback on:
   ├─ Their allocated audit cases
   ├─ Proposed adjustments
   └─ Any concerns or issues
   
2. Regional Director reviews all tax center feedback
   
3. Regional Director has TWO OPTIONS:
```

##### Option A: Submit Feedback (No Override)

```
Regional director submits consolidated feedback:
├─ Comments from tax centers
├─ Aggregate allocations
└─ Status: FEEDBACK_COLLECTED
```

##### Option B: Override Feedback (NEW Feature)

```
Regional director can OVERRIDE aggregated feedback:
├─ Adjust audit type allocations for region
├─ Mark as "Override" with comment
├─ Record who overrode and when
└─ Submit overridden allocation
   └─ Status: FEEDBACK_COLLECTED (with override flag)
```

**Data Recorded:**
- regionalFeedback[regionId]: 
  ```javascript
  {
    allocations: { auditType: count },
    comments: "Regional director comment",
    isOverridden: true,
    overriddenBy: "user-id",
    overriddenAt: "timestamp",
    overrideComment: "Why override"
  }
  ```

---

### Phase 5: Feedback Collection & Amendment Cycle

**Location:** Director Dashboard  
**Actor:** Audit Director  
**Status:** `FEEDBACK_COLLECTED`

#### Step 5.1: Director Collects All Regional Feedback

```
1. All 5 regional directors submit feedback
2. Director Dashboard shows:
   ├─ Feedback from each region
   ├─ Any regional overrides
   ├─ Aggregate totals
   └─ Comparison with original plan
```

#### Step 5.2: Director Reviews & Decides

```
Director can:

Option A: Accept all feedback
└─ Proceed to Senior Management approval
   └─ Status: SUBMITTED_TO_SENIOR_MGMT

Option B: Send back for amendments
├─ Feedback may indicate regional concerns
├─ Issues might require plan restructuring
└─ Director sends plan back to Planning Team
   └─ Status: AMENDMENT_REQUIRED
```

---

### Phase 6: Amendment Cycle (Planning Team)

**Location:** Planning Dashboard  
**Actor:** Planning Team  
**Status:** `AMENDMENT_REQUIRED` → `SUBMITTED_TO_SENIOR_MGMT`

#### Step 6.1: Planning Team Receives Amendment Feedback

```
1. Planning team sees alert: "Amendment Required"
2. Views Director's feedback comment
3. Can see regional feedback details
4. Shows amendment history/revisions
```

#### Step 6.2: Planning Team Edits Plan (NEW Feature)

```
1. Planning team can EDIT the plan:
   ├─ Modify plan name & description
   ├─ Adjust regional distributions
   ├─ Update audit type allocations
   └─ Save amendment

2. System tracks amendment:
   ├─ Records what changed
   ├─ Tracks amendment timestamp
   ├─ Stores amendment comment from team
   └─ Adds to amendment history
```

#### Step 6.3: Planning Team Resubmits

```
1. After amendment, Planning team clicks "Submit for Approval"
2. Plan goes back to Director for review
3. Can repeat amendment cycle if needed
4. Or proceed if Director is satisfied
```

**Data Updated:**
- Status: `AMENDMENT_REQUIRED` → `SUBMITTED_TO_SENIOR_MGMT`
- Timeline: "Amendment submitted"
- revisions[]: Added amendment record

---

### Phase 7: Senior Management Approval

**Location:** Senior Management Dashboard  
**Actor:** Senior Management  
**Possible Statuses:**
- `SENIOR_MGMT_APPROVED` (Approve)
- `SENIOR_MGMT_REJECTED` (Reject)

#### Option 7A: Senior Management Approves

```
1. Senior Management reviews amended plan
2. Clicks "Approve"
3. Status: SENIOR_MGMT_APPROVED
4. Plan sent to all regions for deployment
   └─ Status: APPROVED_TO_REGIONS
```

#### Option 7B: Senior Management Rejects

```
1. Senior Management rejects plan
2. Clicks "Reject"
3. Status: SENIOR_MGMT_REJECTED
4. Plan returned to Planning Team
5. Full cycle restarts
```

---

### Phase 8: Regional Deployment (Regional Director)

**Location:** Regional Dashboard  
**Actor:** Regional Director  
**Status:** `APPROVED_TO_REGIONS` → `FINALIZED`

#### Step 8.1: Regional Director Deploys to Tax Centers

```
1. Senior-approved plan arrives at Region
2. Status: APPROVED_TO_REGIONS

3. Regional Director clicks "Deploy to Tax Centers"
4. System marks region as deployed:
   ├─ Records deployment timestamp
   ├─ Records deploying actor
   └─ Sets deployment status

5. System checks: Are ALL regions deployed?
   ├─ NO: Plan stays APPROVED_TO_REGIONS
   └─ YES: Status changes to FINALIZED
```

**Data Recorded:**
```javascript
plan.regionalDeployments = {
  addis_ababa: { deployedAt: "timestamp", deployedBy: "user-id", status: "DEPLOYED" },
  amhara: { ... },
  oromia: { ... },
  snnpr: { ... },
  somali: { ... }
}
```

---

### Phase 9: Case Generation & Assignment

**Location:** When plan reaches `FINALIZED`  
**Actor:** System (Automatic)  
**Status:** `FINALIZED`

```
1. When ALL regions have deployed:
   └─ Plan status becomes FINALIZED

2. System AUTOMATICALLY generates audit cases:
   ├─ Uses regional feedback allocations
   ├─ Generates cases based on risk stratification
   ├─ Assigns to tax centers
   └─ Creates: plan.distribution + plan.regionalFeedback
   
3. Each case generated with:
   ├─ Tax center assignment
   ├─ Audit type
   ├─ Risk level & score
   ├─ Taxpayer information
   ├─ Status: PENDING
   └─ Timeline entry: "Case generated"
```

**Example Case Creation:**
```javascript
{
  id: "CS-{timestamp}",
  planId: "AP-{timestamp}",
  region: "addis_ababa",
  taxCenter: "addis_ababa-tc1",
  auditType: "desk_audit",
  taxpayerName: "ABC Trading PLC",
  tin: "1234567890",
  sector: "Retail",
  riskLevel: "HIGH",
  riskScore: 75,
  priority: "HIGH",
  status: "PENDING",
  createdAt: "timestamp"
}
```

---

### Phase 10: Tax Center Case Management

**Location:** Case Management Dashboard  
**Actor:** Tax Center Manager  
**Status:** `PENDING` → `ASSIGNED`

```
1. Tax Center Manager sees all pending cases for their center
2. Can view, filter, and select cases
3. Clicks "Assign to Team Leaders"
4. System shows list of Team Leaders
5. Selects Team Leaders to receive cases (by audit type)
6. System distributes cases among selected Team Leaders
7. Cases status changes: PENDING → ASSIGNED
```

---

### Phase 11: Team Leader Assignment

**Location:** Team Leader Dashboard  
**Actor:** Team Leader  
**Status:** `ASSIGNED` → `ASSIGNED` (to specific auditor)

```
1. Team Leader sees cases assigned to their team
2. Reviews each case:
   ├─ Taxpayer name & TIN
   ├─ Risk level
   ├─ Audit type match
   └─ Priority
   
3. Selects cases to assign to auditors
4. System shows Team Leader's auditors
5. Clicks "Assign to Auditors"
6. System load-balances: assigns to least-loaded auditor
7. Case now shows assigned auditor
```

---

### Phase 12: Auditor Work

**Location:** Auditor Dashboard  
**Actor:** Auditor  
**Status:** `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` → `CLOSED`

```
1. Auditor sees all assigned cases
2. Can filter by year to view specific plan's cases
3. For each case:
   ├─ Click "View" to see full details
   ├─ Click "Update" to change status
   └─ Add progress notes

4. Status updates:
   ASSIGNED → IN_PROGRESS (when auditor starts)
           → COMPLETED (when audit complete)
           → CLOSED (when case filed)

5. Timeline tracks all status changes
```

---

## APPLICATION ROUTING & NAVIGATION

### Route Structure

```
/
├─ /login                    # Authentication
├─ /dashboard                # Role-based dashboard (default route after login)
└─ /{view}                   # Secondary views based on role
```

### Dashboard Routes by Role

#### Planning Team
- `/dashboard` → Planning Dashboard (default)
- `/plans` → All Plans overview
- `/risk_analysis` → Risk Engine Analysis

#### Audit Director
- `/dashboard` → Director Dashboard (default)
- `/review` → Plans awaiting approval
- `/deploy` → Deploy plans to regions
- `/risk_engine` → Risk Engine

#### Regional Director
- `/dashboard` → Regional Dashboard (default)
- `/plans` → Plans assigned to region
- `/feedback` → Submit feedback interface

#### Tax Center Manager
- `/dashboard` → Tax Center Dashboard (default)
- `/cases` → Case Management interface
- `/risk_engine` → Risk Engine (map taxpayers)

#### Team Leader
- `/dashboard` → Team Leader Dashboard (default)
- Shows: Cases, team auditors, assignment interface

#### Auditor
- `/dashboard` → Auditor Dashboard (default)
- Shows: My assigned cases, case details, status updates

#### Senior Management
- `/dashboard` → Senior Management Dashboard (default)
- `/approval` → Plans awaiting final approval

### Navigation Flow Chart

```
LOGIN
  ↓
AUTHENTICATED
  ↓
(DASHBOARD) ← Role Router
  ├─ Planning Team Dashboard
  ├─ Director Dashboard
  ├─ Regional Dashboard
  ├─ Tax Center Dashboard
  ├─ Team Leader Dashboard
  ├─ Auditor Dashboard
  └─ Senior Management Dashboard
  ↓
SECONDARY VIEWS (via sidebar)
  ├─ Plans/Cases
  ├─ Reports
  ├─ Risk Engine
  └─ Feedback
```

### URL Parameter Passing

```javascript
// View parameter (stored in state)
const [view, setView] = useState('dashboard');

// View changes trigger page component selection
function RoleRouter({ user, view }) {
  if (role === 'tax_center_manager' && view === 'cases') 
    return <CaseManagement />;
  if (role === 'tax_center_manager')
    return <TaxCenterDashboard view={view} />;
  // ... etc
}
```

---

## DATA MODEL & ENTITIES

### Entity: Plan

```javascript
{
  id: "AP-{timestamp}",
  name: string,
  description: string,
  year: number,
  createdBy: "user-id",
  createdAt: ISO8601,
  
  // Audit case distribution by region and type
  distribution: {
    addis_ababa: { desk_audit: 100, field_audit: 80, ... },
    amhara: { ... },
    oromia: { ... },
    snnpr: { ... },
    somali: { ... }
  },
  
  // Status tracking
  status: PLAN_STATUS enum,
  
  // Feedback from different levels
  directorComment: string,
  regionalFeedback: {
    addis_ababa: {
      allocations: { auditType: count },
      comments: string,
      isOverridden: boolean,
      overriddenBy: "user-id",
      overriddenAt: ISO8601,
      overrideComment: string
    },
    // ... other regions
  },
  
  // Tax center distributions
  tcDistributions: {
    addis_ababa: {
      allocations: { tc1: { auditType: count }, tc2: { ... } },
      distributedAt: ISO8601,
      distributedBy: "user-id"
    }
  },
  
  // Deployment tracking
  regionalDeployments: {
    addis_ababa: {
      deployedAt: ISO8601,
      deployedBy: "user-id",
      status: "DEPLOYED"
    }
  },
  
  // Amendment tracking
  revisions: [
    { comment: string, timestamp: ISO8601, by: "user-id", type: "revision|amendment" }
  ],
  amendmentComment: string,
  
  // Audit trail
  timeline: [
    { status: PLAN_STATUS, actor: "user-id", comment: string, timestamp: ISO8601 }
  ]
}
```

### Entity: Case (Audit Case)

```javascript
{
  id: "CS-{timestamp}",
  planId: "AP-{plan-id}",
  
  // Geographic assignment
  region: "region-id",
  taxCenter: "tax-center-id",
  
  // Audit classification
  auditType: "audit-type-id",
  
  // Taxpayer information
  taxpayerName: string,
  tin: string,
  sector: string,
  annualRevenue: number,
  employees: number,
  
  // Risk assessment
  riskLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  riskScore: number (0-100),
  priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW",
  
  // Assignment chain
  assignedTeamLeader: "user-id",
  assignedAuditor: "user-id",
  
  // Status tracking
  status: CASE_STATUS enum,
  startDate: ISO8601,
  createdAt: ISO8601,
  
  // Audit trail
  timeline: [
    { status: CASE_STATUS, actor: "user-id", comment: string, timestamp: ISO8601 }
  ]
}
```

### Entity: User

```javascript
{
  id: "u-{role-code}-{number}",
  name: string,
  email: string,
  role: ROLE enum,
  
  // Organizational context
  region: "region-id" | null,
  taxCenter: "tax-center-id" | null,
  
  // Role-specific
  auditType: "audit-type-id" | null,
  teamLeader: "user-id" | null,  // For auditors: their team leader
  isJointCommittee: boolean,
  
  password: string (hashed in backend)
}
```

### Status Enums

#### Plan Statuses (12 states)

```javascript
DRAFT                      // Initial creation
SUBMITTED_TO_DIRECTOR      // Awaiting director review
REVISION_REQUESTED         // Director wants changes
DIRECTOR_APPROVED          // Director approved
AWAITING_REGIONAL_FEEDBACK // Sent to regions
FEEDBACK_COLLECTED         // All regional feedback in
AMENDMENT_REQUIRED         // Director requests changes
SUBMITTED_TO_SENIOR_MGMT   // Awaiting senior approval
SENIOR_MGMT_APPROVED       // Senior approved
SENIOR_MGMT_REJECTED       // Senior rejected (restart)
APPROVED_TO_REGIONS        // Ready for regional deployment
FINALIZED                  // All regions deployed, cases generated
```

#### Case Statuses (5 states)

```javascript
PENDING      // Generated, awaiting assignment
ASSIGNED     // Assigned to auditor, awaiting action
IN_PROGRESS  // Audit work in progress
COMPLETED    // Audit complete
CLOSED       // Case filed and archived
```

---

## STATE MANAGEMENT (APPCONTEXT)

### Global State Structure

```javascript
{
  plans: [Plan],
  cases: [Case],
  users: [User]
}
```

### Actions (Complete List)

#### Plan Management

```javascript
// Create and draft
createPlan(data)                    // Create new plan in DRAFT
updatePlanDraft(planId, updates)    // Edit DRAFT plan

// Submission workflow
submitToDirector(planId, actorId)   // Planning Team → Director

// Director actions
approvePlan(planId, actorId, comment)      // DIRECTOR_APPROVED
requestRevision(planId, actorId, comment)  // REVISION_REQUESTED
sendToRegions(planId, actorId)             // AWAITING_REGIONAL_FEEDBACK

// Amendment workflow
sendAmendmentToPlanningTeam(planId, actorId, comment)  // AMENDMENT_REQUIRED
editAmendment(planId, updates)                         // Edit plan in AMENDMENT_REQUIRED
submitAmendment(planId, actorId)                       // SUBMITTED_TO_SENIOR_MGMT

// Senior management
submitToSeniorMgmt(planId, actorId)     // SUBMITTED_TO_SENIOR_MGMT
approveSeniorMgmt(planId, actorId)      // SENIOR_MGMT_APPROVED
rejectSeniorMgmt(planId, actorId)       // SENIOR_MGMT_REJECTED

// Deployment
sendApprovedToRegions(planId, actorId)  // APPROVED_TO_REGIONS
deployToTaxCenters(planId, regionId, actorId)  // FINALIZED
```

#### Regional & Tax Center Actions

```javascript
// Regional distribution
distributeToTaxCenters(planId, regionId, allocations, actorId)

// Feedback management
submitRegionalFeedback(planId, regionId, feedback, allocations, actorId)
overrideRegionalFeedback(planId, regionId, overrides, comment, actorId)
```

#### Case Management

```javascript
// Assignment workflow
assignCaseToTeamLeader(caseId, teamLeaderId)
assignCaseToAuditor(caseId, auditorId)
assignCasesToTeamLeader(caseIds, teamLeaderId)

// Case tracking
updateCaseStatus(caseId, newStatus, notes)
updateCasePriority(caseId, priority)
updateCaseAssignment(caseId, auditorId)
```

### Selectors (Query Functions)

```javascript
selectors.getPlan(planId)                        // Get single plan
selectors.getCase(caseId)                        // Get single case
selectors.getUserById(userId)                    // Get user
selectors.getCasesForTeamLeader(teamLeaderId)    // Cases assigned to TL
selectors.getCasesForAuditor(auditorId)          // Cases assigned to auditor
selectors.getCasesForTaxCenter(taxCenterId)      // Cases for tax center
selectors.getCasesForRegion(regionId)            // Cases for region
selectors.getUsersByRole(role)                   // All users with role
selectors.getUsersByTaxCenterAndRole(tc, role)   // Users in specific TC
```

### State Persistence

All state automatically saved to localStorage:
- `STORE_KEY_USERS`
- `STORE_KEY_PLANS`
- `STORE_KEY_CASES`
- `STORE_KEY_SEEDED` (version tracking)

---

## USER ACTIVITIES BY ROLE

### Planning Team Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| Create Plan | Planning Dashboard | "Create New Plan" | Plan created in DRAFT |
| Edit Draft | Planning Dashboard | Edit plan details | Draft updated |
| View Plans | Planning Dashboard | "View Plans" | List all plans |
| Submit to Director | Planning Dashboard | "Submit to Director" | Status → SUBMITTED_TO_DIRECTOR |
| View Feedback | Planning Dashboard | "View Director Comment" | See director's requested revisions |
| Edit Amendment | Planning Dashboard | Edit during AMENDMENT_REQUIRED | Plan edited with amendments |
| Resubmit Amendment | Planning Dashboard | "Submit Amendment" | Status → SUBMITTED_TO_SENIOR_MGMT |
| View Risk Analysis | Risk Analysis Dashboard | Real-time taxpayer risk data | See AI risk scores |

### Audit Director Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| Review Plans | Director Dashboard | "Review Plans" | See all submitted plans |
| View Plan Details | Director Dashboard | Click plan | Full plan with distribution |
| Approve Plan | Director Dashboard | "Approve" | Status → DIRECTOR_APPROVED → AWAITING_REGIONAL_FEEDBACK |
| Request Revision | Director Dashboard | "Request Revision" + comment | Status → REVISION_REQUESTED |
| View Regional Feedback | Director Dashboard | "View Feedback" | See all 5 regions' responses |
| Review Amendments | Director Dashboard | "Review Amendment" | See team's changes |
| Send to Senior Mgmt | Director Dashboard | "Send to Senior Mgmt" | Status → SUBMITTED_TO_SENIOR_MGMT |
| Send to Regions | Director Dashboard | "Deploy" | Status → APPROVED_TO_REGIONS |

### Regional Director Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| View Regional Plan | Regional Dashboard | Dashboard default view | See region's allocation |
| Distribute to Tax Centers | Regional Dashboard | "Distribute" | tcDistributions saved |
| Override Feedback | Regional Dashboard | "Override" + adjustment | isOverridden = true, saved |
| Submit Feedback | Regional Dashboard | "Submit Feedback" | regionalFeedback[regionId] recorded |
| View Deployment Status | Regional Dashboard | Dashboard | See pending deployment |
| Deploy to Tax Centers | Regional Dashboard | "Deploy" | Status → FINALIZED (if all regions deploy) |

### Tax Center Manager Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| View Dashboard | Tax Center Dashboard | Default view | Summary of cases & assignments |
| View Cases | Case Management | "View Cases" | All cases for this tax center |
| Filter Cases | Case Management | By plan, priority, audit type | Filtered case list |
| Select Cases | Case Management | Checkboxes | Multiple case selection |
| Assign to Team Leaders | Case Management | "Assign" button | Cases assigned to selected Team Leaders |
| View Team Leaders | Case Management | "View Leaders" | List of all TLs in tax center |
| Update Case Priority | Case Management | Dropdown change | Case priority updated |
| View Risk Engine | Risk Engine Dashboard | Default risk view | AI risk stratification tool |

### Team Leader Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| View Dashboard | Team Leader Dashboard | Default view | Cases assigned to this TL |
| Filter by Year | Team Leader Dashboard | Year selector | Cases filtered by plan year |
| View Team | Team Leader Dashboard | "Your Audit Team" section | All auditors on this team |
| View Auditor Workload | Team Leader Dashboard | Team section | Active cases per auditor |
| Select Cases | Team Leader Dashboard | Checkboxes | Multiple case selection |
| Assign to Auditors | Team Leader Dashboard | "Assign" button | Load-balanced assignment |
| View Case Details | Team Leader Dashboard | "View" button | Full case information |
| View Selection Banner | Team Leader Dashboard | Dynamic banner | Selected cases count & actions |

### Auditor Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| View Dashboard | Auditor Dashboard | Default view | My assigned cases |
| Filter by Year | Auditor Dashboard | Year selector | Cases filtered by plan year |
| Search Cases | Auditor Dashboard | Search input | Cases by taxpayer name or TIN |
| View Case Details | Auditor Dashboard | "View" button | Full case information in modal |
| Update Status | Auditor Dashboard | "Update" button | Status update dialog |
| Change Case Status | Auditor Dashboard | Status dropdown | ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED |
| Add Notes | Auditor Dashboard | Notes textarea | Progress notes saved |
| View Case Timeline | Auditor Dashboard | Case detail modal | Full audit history |

### Senior Management Activities

| Activity | Location | Action | Result |
|----------|----------|--------|--------|
| View Dashboard | Senior Dashboard | Default view | All plans awaiting approval |
| Review Plans | Senior Dashboard | "Review Plans" | Filter & view submitted plans |
| View Plan Details | Senior Dashboard | Click plan | Full analysis with regional feedback |
| Approve Plan | Senior Dashboard | "Approve" | Status → SENIOR_MGMT_APPROVED |
| Reject Plan | Senior Dashboard | "Reject" | Status → SENIOR_MGMT_REJECTED |
| View Timeline | Senior Dashboard | Plan modal | Full plan workflow history |

---

## KEY FEATURES & WORKFLOWS

### Feature 1: Plan Distribution System

**Overview:** Hierarchical distribution of audit cases from national level to field auditors

**Flow:**
```
National Plan Distribution (by type)
  ↓
Regional Allocation (Planning Team decides per region)
  ↓
Tax Center Distribution (Regional Director decides per tax center)
  ↓
Team Leader Assignment (Tax Center Manager assigns to TLs by type)
  ↓
Auditor Assignment (Team Leader load-balances among auditors)
  ↓
Individual Audit Cases (Auditor performs audit)
```

**Data Tracked:**
- Original distribution (plan.distribution)
- Regional allocations (plan.tcDistributions)
- Team leader assignments (case.assignedTeamLeader)
- Auditor assignments (case.assignedAuditor)

---

### Feature 2: Feedback & Amendment Management

**Overview:** Multi-level feedback collection with override capability and amendment editing

**Components:**

#### Feedback Collection
- Regional directors provide feedback on proposed allocations
- Can be at aggregated regional level or per-tax-center
- Director reviews all feedback before senior approval

#### Override Capability (NEW)
- Regional directors can override aggregated feedback
- Records who overrode, when, and why
- Maintains data integrity with override metadata

#### Amendment Editing (NEW)
- Planning team can edit plans during AMENDMENT_REQUIRED phase
- Can modify name, description, and distribution
- Changes tracked in revision history
- Full amendment cycle can repeat if needed

**Status Flow:**
```
Plan Distribution
  ↓
Regional Feedback Collection
  ├─ Normal Feedback (no override)
  └─ Regional Override (aggregated feedback overridden)
  ↓
Director Reviews Feedback
  ├─ Approve (proceed to Senior Mgmt)
  └─ Amendment Required (send back to Planning Team)
  ↓
(If Amendment Required)
Planning Team Edits Plan
  ├─ Modify distribution
  ├─ Track changes
  └─ Resubmit
  ↓
Director Reviews Amendment
  ├─ Approve (proceed to Senior Mgmt)
  └─ Amendment Required (cycle repeats)
```

---

### Feature 3: Year-Based Case Filtering

**Overview:** Filter cases by audit plan year across dashboards

**Implementation:**
- Team Leader Dashboard: Shows available years from their cases
- Auditor Dashboard: Shows available years from their cases
- Filters are scoped: Only years relevant to that user

**Benefits:**
- Organize audits by planning cycle
- Separate historical from current audit cases
- Easier navigation for multi-year operations

---

### Feature 4: Role-Based Dashboard Access

**Overview:** Each role sees a customized dashboard with relevant information

**Dashboard Components:**

| Role | Dashboard Shows |
|------|-----------------|
| Planning Team | Plans created, submission status, director feedback, amendment cycle |
| Director | Submitted plans, approval status, regional feedback summary |
| Regional Director | Regional allocation, tax center distribution, feedback options |
| Tax Center Manager | Cases generated, assignment to team leaders, case priority |
| Team Leader | Team auditors, assigned cases, workload balance, year filter |
| Auditor | Personal case assignments, case details, status updates, year filter |
| Senior Mgmt | Plans awaiting final approval, rejection options |

---

### Feature 5: Risk-Based Case Generation

**Overview:** Automatic case generation based on plan distribution and regional feedback

**Process:**
```
Plan Distribution (from planning team)
  +
Regional Feedback (allocations from all regions)
  ↓
Tax Center Distribution (from regional directors)
  ↓
Case Generation Engine:
  ├─ Select taxpayers by risk profile
  ├─ Allocate to audit types
  ├─ Assign to tax centers
  ├─ Calculate risk scores
  └─ Generate individual cases
  ↓
Cases created with:
  ├─ Risk level (CRITICAL, HIGH, MEDIUM, LOW)
  ├─ Risk score (0-100)
  ├─ Status: PENDING
  └─ Ready for Tax Center Manager assignment
```

---

### Feature 6: Load-Balanced Auditor Assignment

**Overview:** Automatic distribution of cases to auditors based on current workload

**Algorithm:**
```
1. Get Team Leader's auditors
2. For each auditor:
   ├─ Count non-completed cases (ASSIGNED, IN_PROGRESS)
   └─ Calculate workload
3. For each case to assign:
   ├─ Find least-loaded auditor
   ├─ Assign to that auditor
   └─ Update auditor workload count
4. Result: Even distribution across auditors
```

**Benefits:**
- Prevents overloading individual auditors
- Transparent workload visibility
- Automatic balancing on each assignment batch

---

### Feature 7: Dark Mode Support

**Overview:** Full dark/light theme support across entire system

**Implementation:**
- ThemeContext manages theme state
- Stored in localStorage for persistence
- Tailwind dark: class toggled on document root
- All components support both themes

**Color Scheme:**
- Light: bg-white, bg-gray-50, text-gray-900
- Dark: bg-slate-800/900, text-white

---

## TECHNICAL STACK

### Frontend

**Runtime & Framework:**
- React 18
- Vite (build tool)
- TailwindCSS (styling)

**State Management:**
- Context API (AppContext for global state)
- Local Context for authentication
- LocalStorage for persistence

**UI Components:**
- Custom Lucide React icons
- Tailwind-based component library
- Modal dialogs for complex interactions

**Development:**
- ESLint (code quality)
- Hot Module Replacement (HMR)
- Dark mode support

### Backend (Spring Boot - In Development)

**Architecture:**
- Spring Boot 3.x
- REST API endpoints
- Spring Data JPA for database access
- Spring Security for authentication (JWT)
- PostgreSQL database

**Key Components:**
- Entity models (Plan, Case, User, Region, TaxCenter)
- Repository layer (CRUD operations)
- Service layer (business logic)
- Controller layer (API endpoints)
- Exception handling & validation

**API Endpoints (To Be Implemented):**

```
Plans:
  POST   /api/plans                    Create plan
  GET    /api/plans                    List all plans
  GET    /api/plans/{id}               Get plan details
  PUT    /api/plans/{id}               Update plan
  DELETE /api/plans/{id}               Delete plan
  POST   /api/plans/{id}/submit        Submit to director
  POST   /api/plans/{id}/approve       Director approve
  POST   /api/plans/{id}/feedback      Submit regional feedback
  POST   /api/plans/{id}/deploy        Regional deployment

Cases:
  GET    /api/cases                    List cases (with filters)
  GET    /api/cases/{id}               Get case details
  PUT    /api/cases/{id}               Update case
  PUT    /api/cases/{id}/status        Update status
  POST   /api/cases/{id}/assign        Assign to auditor

Users:
  GET    /api/users                    List users
  GET    /api/users/{id}               Get user
  POST   /api/auth/login               Login
  POST   /api/auth/logout              Logout
  GET    /api/auth/me                  Current user
  POST   /api/auth/refresh             Refresh token

Regions:
  GET    /api/regions                  List all regions
  GET    /api/regions/{id}             Get region details

TaxCenters:
  GET    /api/taxcenters               List all tax centers
  GET    /api/regions/{id}/taxcenters  Tax centers by region
```

### Database Schema (Spring Boot)

```sql
-- Users
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50),
  region VARCHAR(50),
  tax_center VARCHAR(50),
  audit_type VARCHAR(50),
  team_leader_id VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Plans
CREATE TABLE plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  year INT,
  status VARCHAR(50),
  distribution JSON,
  regional_feedback JSON,
  regional_deployments JSON,
  created_by VARCHAR(50),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Cases
CREATE TABLE cases (
  id VARCHAR(50) PRIMARY KEY,
  plan_id VARCHAR(50),
  region VARCHAR(50),
  tax_center VARCHAR(50),
  audit_type VARCHAR(50),
  taxpayer_name VARCHAR(255),
  tin VARCHAR(20),
  sector VARCHAR(100),
  annual_revenue DECIMAL(15,2),
  employees INT,
  risk_level VARCHAR(20),
  risk_score INT,
  priority VARCHAR(20),
  status VARCHAR(50),
  assigned_team_leader VARCHAR(50),
  assigned_auditor VARCHAR(50),
  start_date TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (assigned_team_leader) REFERENCES users(id),
  FOREIGN KEY (assigned_auditor) REFERENCES users(id)
);

-- Regions
CREATE TABLE regions (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  code VARCHAR(10)
);

-- TaxCenters
CREATE TABLE tax_centers (
  id VARCHAR(50) PRIMARY KEY,
  region_id VARCHAR(50),
  name VARCHAR(255),
  short_name VARCHAR(50),
  FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- Timeline (audit trail)
CREATE TABLE timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  plan_id VARCHAR(50),
  case_id VARCHAR(50),
  status VARCHAR(50),
  actor VARCHAR(50),
  comment TEXT,
  timestamp TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES plans(id),
  FOREIGN KEY (case_id) REFERENCES cases(id)
);
```

---

## DEPLOYMENT & OPERATIONS

### Frontend Deployment

**Build Process:**
```bash
npm run build
# Outputs to dist/
```

**Deployment Options:**
- Vercel (recommended for React)
- Netlify
- Docker container
- AWS S3 + CloudFront

**Environment Variables:**
```
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENVIRONMENT=production
```

### Backend Deployment (Spring Boot)

**Build & Package:**
```bash
mvn clean package
# Outputs WAR/JAR
```

**Docker:**
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/audit-planning-system.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Database Setup:**
```sql
CREATE DATABASE audit_planning;
-- Run Flyway/Liquibase migrations
```

**Environment Configuration:**
```
APP_DATABASE_URL=jdbc:postgresql://db:5432/audit_planning
APP_DATABASE_USER=postgres
APP_DATABASE_PASSWORD=secret
APP_JWT_SECRET=your-secret-key
APP_PORT=8080
```

---

## AUDIT TRAIL & COMPLIANCE

Every significant action is tracked:

**Timeline Recording:**
```javascript
timeline: [
  {
    status: "SUBMITTED_TO_DIRECTOR",
    actor: "u-pt-01",
    comment: "Submitted for director review",
    timestamp: "2024-08-14T10:30:00Z"
  },
  // ... more entries
]
```

**Tracked Actions:**
- Plan creation & updates
- All status changes
- Approval/rejection decisions
- Regional feedback submission
- Amendments submitted
- Case assignments
- Case status updates
- Regional overrides

**Audit Access:**
- History visible to authorized users
- Timeline shows who did what and when
- Comments provide context for decisions

---

## SECURITY CONSIDERATIONS

### Authentication
- Login with email & password
- Session management via AuthContext
- Optional: JWT tokens for API

### Authorization
- Role-based access control (RBAC)
- Route guards prevent unauthorized access
- Action guards prevent unauthorized state changes

### Data Protection
- Passwords hashed (bcrypt)
- Sensitive data in localStorage (frontend only)
- HTTPS in production
- CORS restrictions on backend

### Input Validation
- Frontend: Form validation before submission
- Backend: Server-side validation required
- SQL injection prevention via parameterized queries
- XSS prevention via React escaping

---

## PERFORMANCE OPTIMIZATIONS

**Frontend:**
- Code splitting via Vite
- Lazy loading of role-specific pages
- Memoized selectors to prevent re-renders
- LocalStorage caching

**Backend (Spring Boot):**
- Database indexing on frequently queried fields
- Connection pooling
- Query optimization
- Redis caching for frequently accessed data

---

## MONITORING & LOGGING

**Frontend Logging:**
- Console logs for debugging
- Error tracking (Sentry recommended)
- User activity tracking

**Backend Logging:**
- Request/response logging
- Error logging with stack traces
- Audit trail logging
- Performance metrics

---

## FUTURE ENHANCEMENTS

1. **Reporting Module:** Export plans, cases, audit results
2. **Notifications:** Email/SMS alerts for approvals needed
3. **Advanced Filtering:** Complex queries on cases
4. **Bulk Operations:** Multi-case actions
5. **Integration with Risk Engine:** Real-time AI scoring
6. **Mobile App:** iOS/Android native apps
7. **API Documentation:** Swagger/OpenAPI specs
8. **Analytics Dashboard:** KPIs and metrics
9. **Workflow Automation:** Rules engine for approvals
10. **Multi-language Support:** Amharic, Tigrinya, etc.

---

## CONCLUSION

The **MOR Audit Planning System** is a comprehensive, hierarchical audit planning platform supporting:

✅ National-level audit plan creation  
✅ Multi-level approval workflows (Director → Senior Mgmt)  
✅ Regional feedback collection with override capability  
✅ Amendment management for plan refinements  
✅ Automatic case generation based on risk stratification  
✅ Load-balanced auditor assignment  
✅ Complete audit tracking from creation to completion  

The system is **production-ready** on the frontend and ready for Spring Boot backend implementation.

---

**Document Version:** 1.0  
**Last Updated:** August 14, 2026  
**Next Review:** Q3 2024

