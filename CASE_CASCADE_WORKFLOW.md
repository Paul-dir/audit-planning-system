# Case Cascade Workflow - From Plan Approval to Auditor Assignment

**Comprehensive Guide to the Complete Case Assignment Pipeline**

---

## OVERVIEW

After a plan is approved and allocations are finalized at tax center level, the system cascades audit cases through a multi-stage assignment workflow:

```
Plan FINALIZED
    ↓
Create Cases from Allocations
    ↓
Cases Ready for Selection
    ↓
Risk Engine Prioritization
    ↓
Case Selection
    ↓
Assign to Team Leaders
    ↓
Team Leaders Distribute to Auditors
    ↓
Auditors Execute Cases
    ↓
Cases Completed
```

---

## STAGE 1: PLAN FINALIZED & CASE CREATION

### When Cases Are Created

```
Trigger: Plan status = FINALIZED
Actor: System (automatic) or Audit Director
Location: Case Generation Module

Process:
├─ System reads: plans[].taxCenterAllocations[region][taxCenter]
├─ For each audit type with allocation count:
│  ├─ Creates N cases per audit type
│  └─ Example: desk_audit: 3 → Creates 3 desk audit cases
├─ Each case assigned:
│  ├─ Unique case ID (e.g., CASE-2026-0001)
│  ├─ Case type (desk_audit, field_audit, joint_audit, etc.)
│  ├─ Source plan ID (e.g., AP-0001)
│  ├─ Source allocation (region + tax center)
│  ├─ Status: CREATED
│  └─ Metadata: created date, assigned plan
├─ Cases stored in:
│  └─ data.cases = [
│       {
│         id: "CASE-2026-0001",
│         type: "desk_audit",
│         planId: "AP-0001",
│         region: "addis_ababa",
│         taxCenter: "addis_ababa-tc1",
│         status: "CREATED",
│         riskScore: null,  // To be calculated
│         createdDate: ISO timestamp,
│         createdFrom: "allocation"
│       },
│       // ... more cases
│     ]
└─ Total cases created = sum of all allocations
```

### Case Data Structure

```javascript
{
  id: "CASE-2026-0001",
  
  // Identity
  type: "desk_audit|field_audit|joint_audit|transfer_pricing|comprehensive|issue_audit",
  caseRefNumber: "TC1-DA-001",  // Human readable
  
  // Source Information
  planId: "AP-0001",
  region: "addis_ababa",
  taxCenter: "addis_ababa-tc1",
  
  // Taxpayer Information
  taxpayerId: "TP-2026-001",
  taxpayerName: "ABC Trading Company",
  taxPayerCategory: "Large|Medium|Small",
  
  // Risk & Prioritization
  riskScore: 85,  // 0-100, calculated by Risk Engine
  riskLevel: "HIGH|MEDIUM|LOW",
  riskFactors: [
    "Previous non-compliance",
    "Large transaction volume",
    "Foreign exchange activity"
  ],
  
  // Audit Details
  auditYear: 2026,
  auditPeriod: "2026-01-01 to 2026-12-31",
  estimatedDuration: 15,  // Days
  
  // Assignment Tracking
  status: "CREATED|SELECTED|ASSIGNED_TO_TEAM_LEADER|ASSIGNED_TO_AUDITOR|IN_PROGRESS|COMPLETED",
  selectedDate: null,
  selectedBy: null,
  assignedToTeamLeader: null,
  assignedToTeamLeaderDate: null,
  assignedToAuditor: null,
  assignedToAuditorDate: null,
  
  // Work Tracking
  startedDate: null,
  completedDate: null,
  findings: null,
  
  // Metadata
  createdDate: ISO timestamp,
  lastModified: ISO timestamp
}
```

---

## STAGE 2: RISK ENGINE PRIORITIZATION

### Risk Engine Overview

**Component**: RiskEngineView.jsx
**Purpose**: Calculate risk scores for all created cases
**Algorithm**: Multi-factor risk assessment

### Risk Calculation Process

```
Input: Case data
       └─ Taxpayer category
       └─ Previous audit history
       └─ Transaction patterns
       └─ Industry type
       └─ Income levels

Process:
├─ Factor 1: Taxpayer Category Weight
│  ├─ Large Taxpayers: +25 points
│  ├─ Medium Taxpayers: +15 points
│  └─ Small Taxpayers: +5 points
│
├─ Factor 2: Audit History
│  ├─ No previous audits: +20 points
│  ├─ Previous findings: +35 points
│  ├─ Repeated violations: +50 points
│  └─ Clean history: 0 points
│
├─ Factor 3: Industry Risk
│  ├─ High-risk industries: +25 points
│  │  (e.g., Finance, Mining, Import-Export)
│  ├─ Medium-risk: +10 points
│  └─ Low-risk: 0 points
│
├─ Factor 4: Transaction Volume
│  ├─ >$10M annually: +25 points
│  ├─ $1M-$10M: +15 points
│  ├─ <$1M: +5 points
│  └─ Verified transactions: -5 points
│
├─ Factor 5: Compliance Track Record
│  ├─ Perfect compliance (3+ years): -10 points
│  ├─ Minor discrepancies: 0 points
│  ├─ Significant gaps: +20 points
│  └─ Tax payments late: +15 points
│
└─ TOTAL RISK SCORE = Sum of all factors (0-100)

Output: riskScore (integer 0-100)
        riskLevel (HIGH: 70+, MEDIUM: 40-69, LOW: <40)
```

### Risk Engine Data Flow

```
1. READ CASES:
   ├─ Iterate through data.cases
   ├─ Filter: status === "CREATED"
   └─ Get: All unprocessed cases

2. ENRICH WITH TAXPAYER DATA:
   ├─ Look up taxpayer info
   ├─ Get: Category, history, industry
   └─ Join: taxpayerData with case

3. CALCULATE RISK SCORE:
   ├─ Apply algorithm to each case
   ├─ Generate: riskScore (0-100)
   ├─ Set: riskLevel (HIGH/MEDIUM/LOW)
   └─ Create: riskFactors array

4. SAVE RESULTS:
   ├─ Update: data.cases[i].riskScore = calculated
   ├─ Update: data.cases[i].riskLevel = categorized
   ├─ Update: data.cases[i].riskFactors = array
   ├─ Call: updateData()
   └─ Persist: to localStorage

5. SORT FOR PRIORITIZATION:
   ├─ Sort cases by: riskScore DESC
   ├─ HIGH risk cases first
   ├─ MEDIUM risk cases second
   ├─ LOW risk cases last
   └─ Display in: CasePrioritizationView
```

### Risk Engine Visualization

**RiskEngineView Component:**

```
┌─────────────────────────────────────────────────┐
│           RISK ENGINE ANALYSIS                  │
│─────────────────────────────────────────────────│
│                                                 │
│ Total Cases Analyzed: 47                        │
│ HIGH Risk Cases: 12 (26%)      [█████░░░░]    │
│ MEDIUM Risk Cases: 22 (47%)    [██████████]   │
│ LOW Risk Cases: 13 (28%)       [██████░░░]    │
│                                                 │
│─────────────────────────────────────────────────│
│ TOP PRIORITY CASES:                             │
│                                                 │
│ 1. CASE-2026-0001 [95] HIGH                    │
│    ABC Trading (Previous violations)            │
│    Desk Audit - 2026                            │
│                                                 │
│ 2. CASE-2026-0005 [88] HIGH                    │
│    XYZ Manufacturing (Large taxpayer)           │
│    Joint Audit - Large transaction volume       │
│                                                 │
│ 3. CASE-2026-0012 [82] HIGH                    │
│    Import Export Co (Foreign exchange)          │
│    Field Audit - Industry risk                  │
│                                                 │
│ ... (9 more HIGH risk cases)                   │
│─────────────────────────────────────────────────│
│                                                 │
│ [Start Prioritization] [View All] [Export]     │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## STAGE 3: CASE SELECTION BY TAX CENTER MANAGER

### Selection Interface

**View**: CasePrioritizationView.jsx
**Actor**: Tax Center Manager
**Purpose**: Select which cases to work on first

### Selection Process

```
1. TAX CENTER MANAGER LOGS IN:
   ├─ Dashboard shows: Cases pending selection
   ├─ For their tax center only
   └─ Filtered by risk priority

2. VIEW PRIORITIZED CASES:
   ├─ Table displays all cases
   ├─ Sorted by: riskScore DESC (HIGH risk first)
   ├─ Columns:
   │  ├─ Case ID
   │  ├─ Risk Level (color-coded: RED/YELLOW/GREEN)
   │  ├─ Taxpayer Name
   │  ├─ Audit Type
   │  ├─ Estimated Days
   │  └─ Status
   │
   └─ Selection tool:
      ├─ Checkboxes on left
      ├─ Bulk selection options:
      │  ├─ "Select All HIGH"
      │  ├─ "Select All MEDIUM"
      │  ├─ "Select All LOW"
      │  └─ "Clear All"
      │
      └─ Smart selection:
         ├─ "Auto-select for 30 days capacity"
         ├─ System calculates: estimatedDuration * count
         └─ Ensures: Realistic workload

3. MAKE SELECTION:
   ├─ Manager checks checkboxes
   ├─ Example selection:
   │  ├─ ✓ CASE-2026-0001 (HIGH, 15 days)
   │  ├─ ✓ CASE-2026-0005 (HIGH, 12 days)
   │  ├─ ✓ CASE-2026-0012 (MEDIUM, 10 days)
   │  └─ Total: 3 cases, 37 days
   │
   └─ Button: "Confirm Selection"

4. SUBMIT SELECTION:
   ├─ System validates:
   │  ├─ At least 1 case selected
   │  ├─ Estimated workload reasonable
   │  └─ All cases in CREATED status
   │
   ├─ For each selected case:
   │  ├─ Set: status = SELECTED
   │  ├─ Record: selectedDate = now
   │  ├─ Record: selectedBy = tax center name
   │  └─ Add: Ready for team leader assignment
   │
   ├─ Call: updateData()
   ├─ Persist to localStorage
   │
   └─ Show: "✅ 3 cases selected for work"
```

### Selection Data Update

```javascript
// BEFORE selection:
data.cases[0] = {
  id: "CASE-2026-0001",
  status: "CREATED",
  selectedDate: null,
  selectedBy: null,
  // ...
}

// AFTER selection:
data.cases[0] = {
  id: "CASE-2026-0001",
  status: "SELECTED",
  selectedDate: "2026-08-05T10:30:00Z",
  selectedBy: "Addis Ababa TC1",
  // ...
}
```

---

## STAGE 4: TEAM LEADER RECEIVES SELECTED CASES

### Team Leader Assignment Interface

**View**: AssignToTeamLeadersView.jsx
**Actor**: Tax Center Manager or Regional Director
**Purpose**: Assign selected cases to team leaders

### Team Leader Assignment Process

```
1. VIEW SELECTED CASES:
   ├─ System displays all SELECTED status cases
   ├─ For each tax center
   ├─ Grouped by audit type:
   │  ├─ Desk Audits (8 cases)
   │  ├─ Field Audits (5 cases)
   │  ├─ Joint Audits (2 cases)
   │  └─ etc.
   │
   └─ Each case shows:
      ├─ Case ID
      ├─ Risk Level
      ├─ Taxpayer
      ├─ Estimated Duration
      └─ "Assign to Team Leader" button

2. SELECT TEAM LEADER:
   ├─ Click "Assign to Team Leader"
   ├─ Modal opens: "Assign Case"
   │
   ├─ Field 1: Select Team Leader
   │  └─ Dropdown list of available team leaders:
   │     ├─ Team Leader A (Currently: 5 cases, 45 days)
   │     ├─ Team Leader B (Currently: 3 cases, 20 days)
   │     └─ Team Leader C (Currently: 2 cases, 18 days)
   │
   ├─ Field 2: Assign Method
   │  ├─ Direct Assignment (All to one TL)
   │  └─ Distributed Assignment (Split by availability)
   │
   ├─ Field 3: Notes
   │  └─ Optional: Special instructions for team leader
   │
   └─ Button: "Assign" [Cancel]

3. CONFIRM ASSIGNMENT:
   ├─ System validates:
   │  ├─ Team Leader selected
   │  ├─ Case status still SELECTED
   │  └─ TL has capacity
   │
   ├─ For each assigned case:
   │  ├─ Set: status = ASSIGNED_TO_TEAM_LEADER
   │  ├─ Set: assignedToTeamLeader = TL name
   │  ├─ Record: assignedToTeamLeaderDate = now
   │  ├─ Create: cases[].teamLeaderWorkload = {
   │  │    teamLeaderName: "Team Leader A",
   │  │    caseCount: 1,
   │  │    estimatedDays: 15,
   │  │    receivedDate: ISO timestamp
   │  │  }
   │  └─ Set: Ready for auditor assignment
   │
   ├─ Call: updateData()
   ├─ Persist to localStorage
   │
   └─ Notify: Team Leader (sidebar notification)
      └─ "New case assigned: CASE-2026-0001"
```

### Team Leader Assignment Data

```javascript
// BEFORE team leader assignment:
data.cases[0] = {
  id: "CASE-2026-0001",
  status: "SELECTED",
  assignedToTeamLeader: null,
  assignedToTeamLeaderDate: null,
  // ...
}

// AFTER team leader assignment:
data.cases[0] = {
  id: "CASE-2026-0001",
  status: "ASSIGNED_TO_TEAM_LEADER",
  assignedToTeamLeader: "Team Leader A",
  assignedToTeamLeaderDate: "2026-08-05T11:00:00Z",
  teamLeaderWorkload: {
    teamLeaderName: "Team Leader A",
    caseCount: 1,
    estimatedDays: 15,
    receivedDate: "2026-08-05T11:00:00Z"
  }
  // ...
}
```

---

## STAGE 5: TEAM LEADER REVIEWS & DISTRIBUTES

### Team Leader Dashboard

**View**: TeamLeaderDashboard.jsx
**Actor**: Team Leader
**Purpose**: Review assigned cases and distribute to auditors

### Team Leader Process

```
1. TEAM LEADER LOGS IN:
   ├─ Dashboard shows:
   │  ├─ My Assigned Cases: 3 cases, 42 days total
   │  ├─ Cases Waiting for Distribution: 3
   │  ├─ Cases with Auditors: 0
   │  └─ Completed Cases: 0
   │
   └─ View: "Cases Awaiting Assignment"
      ├─ CASE-2026-0001 (15 days) - Risk: HIGH
      ├─ CASE-2026-0005 (12 days) - Risk: HIGH
      └─ CASE-2026-0012 (10 days) - Risk: MEDIUM

2. REVIEW CASE DETAILS:
   ├─ Team Leader clicks case
   ├─ Modal shows full case information:
   │  ├─ Taxpayer name and category
   │  ├─ Audit type and period
   │  ├─ Risk level and factors
   │  ├─ Estimated duration
   │  ├─ Any special notes
   │  └─ Previous audit history
   │
   └─ Button: "Assign to Auditor"

3. ANALYZE TEAM CAPACITY:
   ├─ View: "My Auditors"
   │  ├─ Auditor A: 2 cases, 25 days (available: 5 days)
   │  ├─ Auditor B: 1 case, 10 days (available: 20 days)
   │  ├─ Auditor C: 0 cases, 30 days (available: 30 days)
   │  └─ Auditor D: 3 cases, 45 days (FULL - 0 days)
   │
   └─ Strategy:
      ├─ CASE-2026-0001 (15 days) → Auditor C (30 available)
      ├─ CASE-2026-0005 (12 days) → Auditor C (15 remaining)
      └─ CASE-2026-0012 (10 days) → Auditor B (20 available)

4. ASSIGN TO AUDITOR:
   ├─ Select case: CASE-2026-0001
   ├─ Click: "Assign to Auditor"
   │
   ├─ Modal: "Assign to Auditor"
   │  ├─ Field 1: Select Auditor
   │  │  └─ Dropdown showing:
   │  │     ├─ Auditor A (2/3 capacity) ⚠️
   │  │     ├─ Auditor B (1/3 capacity) ✅
   │  │     ├─ Auditor C (0/3 capacity) ✅
   │  │     └─ Auditor D (3/3 capacity) ❌ FULL
   │  │
   │  ├─ Field 2: Estimated Duration
   │  │  └─ Pre-filled: 15 days (editable)
   │  │
   │  ├─ Field 3: Special Instructions
   │  │  └─ E.g., "Focus on transfer pricing compliance"
   │  │
   │  ├─ Field 4: Audit Approach
   │  │  ├─ Standard Risk-Based
   │  │  ├─ Detailed Review
   │  │  └─ Compliance Focus
   │  │
   │  └─ Button: "Assign" [Cancel]
   │
   └─ System validates:
      ├─ Auditor selected
      ├─ Auditor has capacity
      ├─ Case status = ASSIGNED_TO_TEAM_LEADER
      └─ All required fields filled

5. CONFIRM & PERSIST:
   ├─ For assigned case:
   │  ├─ Set: status = ASSIGNED_TO_AUDITOR
   │  ├─ Set: assignedToAuditor = Auditor name
   │  ├─ Record: assignedToAuditorDate = now
   │  ├─ Store: specialInstructions = notes
   │  ├─ Store: auditApproach = selected
   │  └─ Create: auditorWorkload = {
   │       auditorName: "Auditor C",
   │       currentCases: 1,
   │       totalAllocatedDays: 15,
   │       capacityRemaining: 15 days
   │     }
   │
   ├─ Call: updateData()
   ├─ Persist to localStorage
   │
   └─ Update UI:
      ├─ Remove from "Awaiting Assignment"
      ├─ Move to "Assigned to Auditors"
      └─ Show: "✅ Assigned to Auditor C"
```

### Team Leader Dashboard View

```
┌─────────────────────────────────────────────────────────┐
│ TEAM LEADER: Ahmad Hassan                              │
│─────────────────────────────────────────────────────────│
│                                                         │
│ MY TEAM STATUS:                                        │
│ ├─ Total Cases: 3 (42 days)                           │
│ ├─ Assigned to Auditors: 1                            │
│ ├─ Awaiting Assignment: 2                             │
│ └─ Completed: 0                                        │
│                                                         │
│─────────────────────────────────────────────────────────│
│ CASES AWAITING AUDITOR ASSIGNMENT:                     │
│                                                         │
│ ┌───────────────────────────────────────────────────┐ │
│ │ CASE-2026-0005                                    │ │
│ │ HIGH PRIORITY ███                                 │ │
│ │ XYZ Manufacturing - Joint Audit                   │ │
│ │ Estimated: 12 days                                │ │
│ │ [View Details] [Assign to Auditor] →             │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│ ┌───────────────────────────────────────────────────┐ │
│ │ CASE-2026-0012                                    │ │
│ │ MEDIUM PRIORITY ██░                               │ │
│ │ Import Export Co - Field Audit                    │ │
│ │ Estimated: 10 days                                │ │
│ │ [View Details] [Assign to Auditor] →             │ │
│ └───────────────────────────────────────────────────┘ │
│                                                         │
│─────────────────────────────────────────────────────────│
│ MY AUDITORS & WORKLOAD:                               │
│                                                         │
│ Auditor A (Ahmed): 2 cases, 25 days [████░░░░░░ 75%] │
│ Auditor B (Fatima): 1 case, 10 days [███░░░░░░░ 30%] │
│ Auditor C (Dawit): 0 cases, 0 days [░░░░░░░░░░ 0%]  │
│ Auditor D (Sara): 3 cases, 45 days [██████████ 100%] │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## STAGE 6: AUDITOR RECEIVES & EXECUTES CASES

### Auditor Dashboard

**View**: AuditorDashboard.jsx
**Actor**: Auditor
**Purpose**: Execute assigned audit cases

### Auditor Workflow

```
1. AUDITOR LOGS IN:
   ├─ Dashboard shows:
   │  ├─ My Assigned Cases: 1 (15 days)
   │  ├─ Cases In Progress: 0
   │  ├─ Completed Cases: 0
   │  └─ Total Workload: 15 days
   │
   └─ View: "My Cases"
      ├─ CASE-2026-0001 (HIGH PRIORITY)
      │  ├─ Taxpayer: ABC Trading Company
      │  ├─ Type: Desk Audit
      │  ├─ Status: ASSIGNED_TO_AUDITOR
      │  ├─ Assigned Date: 2026-08-05
      │  ├─ Team Leader: Team Leader A
      │  ├─ Risk Level: HIGH (Score: 95)
      │  ├─ Estimated Duration: 15 days
      │  └─ Special Instructions: "Focus on transfer pricing"
      │
      └─ Button: "Start Case"

2. START CASE EXECUTION:
   ├─ Auditor clicks: "Start Case"
   │
   ├─ System updates:
   │  ├─ Set: status = IN_PROGRESS
   │  ├─ Record: startedDate = now
   │  └─ Save to localStorage
   │
   └─ Case details page opens:
      ├─ Case Information
      │  ├─ Case ID, Taxpayer, Type
      │  ├─ Risk Level & Factors
      │  ├─ Audit Year & Period
      │  ├─ Instructions
      │  └─ Related cases (same taxpayer)
      │
      ├─ Audit Work Sections
      │  ├─ Documentation Review
      │  ├─ Compliance Check
      │  ├─ Transaction Analysis
      │  ├─ Risk Assessment
      │  └─ Findings
      │
      ├─ Progress Tracking
      │  ├─ Started: 2026-08-05 10:00
      │  ├─ Target Completion: 2026-08-20
      │  ├─ Days Elapsed: 0
      │  ├─ Days Remaining: 15
      │  └─ Progress: 0% [░░░░░░░░░░]
      │
      └─ Buttons:
         ├─ [Update Progress]
         ├─ [Add Finding]
         ├─ [Add Note]
         ├─ [Upload Evidence]
         ├─ [Request Extension]
         └─ [Mark Complete]

3. LOG AUDIT WORK:
   ├─ Auditor performs audit activities
   ├─ Each activity logged:
   │
   ├─ Activity 1: Documentation Review
   │  ├─ Time spent: 2 days
   │  ├─ Status: COMPLETED
   │  ├─ Notes: "All tax returns filed, no issues found"
   │  └─ Evidence: [Document.pdf] [Checklist.xlsx]
   │
   ├─ Activity 2: Bank Reconciliation
   │  ├─ Time spent: 3 days
   │  ├─ Status: IN_PROGRESS
   │  ├─ Notes: "Bank statements cross-referenced with ledger"
   │  └─ Progress: 60% complete
   │
   ├─ Activity 3: Transfer Pricing Analysis
   │  ├─ Time spent: 0 days
   │  ├─ Status: NOT_STARTED
   │  ├─ Notes: "Per special instructions, high priority"
   │  └─ Estimated: 5 days
   │
   └─ Progress calculation:
      ├─ Total completed: 2 days
      ├─ In progress: 1.8 days (60% of 3)
      ├─ Remaining: 9.2 days
      └─ Overall: 28% complete [███░░░░░░]

4. RECORD FINDINGS:
   ├─ As audit progresses, auditor records findings
   │
   ├─ Finding 1: Transfer Pricing Deviation
   │  ├─ Severity: HIGH
   │  ├─ Category: Transfer Pricing
   │  ├─ Description: "Related party transaction pricing not at arm's length"
   │  ├─ Amount Involved: $50,000
   │  ├─ Recommendation: "Require adjustment per transfer pricing rules"
   │  ├─ Evidence: [Transfer Price Report.pdf]
   │  └─ Status: DOCUMENTED
   │
   ├─ Finding 2: Expense Classification Error
   │  ├─ Severity: MEDIUM
   │  ├─ Category: Expense Classification
   │  ├─ Description: "Personal expenses mixed with business expenses"
   │  ├─ Amount Involved: $15,000
   │  ├─ Recommendation: "Adjust deduction per tax rules"
   │  └─ Status: PENDING_MANAGEMENT_RESPONSE
   │
   └─ Findings automatically saved to:
      └─ data.cases[].findings = [
           { findingId, severity, category, description, amount, recommendation, evidence, status }
         ]

5. REQUEST EXTENSION (if needed):
   ├─ If work exceeds estimated time:
   ├─ Auditor clicks: "Request Extension"
   │
   ├─ Form: Request Extension
   │  ├─ Current Duration: 15 days
   │  ├─ Days Elapsed: 14 days
   │  ├─ Requested Extension: 7 days (dropdown)
   │  ├─ Reason: (required text)
   │  │  └─ "Complex transfer pricing analysis required"
   │  └─ Button: "Submit Extension Request"
   │
   ├─ System routes to:
   │  ├─ Team Leader for approval
   │  ├─ Notification: "Extension request from Auditor C"
   │  └─ Team Leader can APPROVE or REJECT
   │
   └─ If APPROVED:
      ├─ Update: estimatedDuration += 7 days (now 22 days)
      ├─ New target: 2026-08-27
      ├─ Notify Auditor: "Extension approved (7 days)"
      └─ Update workload tracking

6. MARK CASE COMPLETE:
   ├─ When audit work is done:
   ├─ Auditor clicks: "Mark Complete"
   │
   ├─ Validation:
   │  ├─ All activities logged
   │  ├─ All findings documented
   │  ├─ Final audit report generated
   │  └─ Evidence attached
   │
   ├─ Completion form:
   │  ├─ Summary of findings:
   │  │  ├─ HIGH severity: 1
   │  │  ├─ MEDIUM severity: 1
   │  │  └─ LOW severity: 0
   │  │
   │  ├─ Final Assessment:
   │  │  ├─ Overall Compliance: 70%
   │  │  ├─ Key Issues: Transfer pricing, Expense classification
   │  │  └─ Risk Level: MEDIUM (downgraded from HIGH)
   │  │
   │  ├─ Audit Report:
   │  │  └─ Auto-generated from findings & activities
   │  │
   │  └─ Button: "Submit & Mark Complete"
   │
   ├─ System updates:
   │  ├─ Set: status = COMPLETED
   │  ├─ Record: completedDate = now
   │  ├─ Set: findings = [all recorded findings]
   │  ├─ Generate: auditReport = PDF/document
   │  ├─ Calculate: actualDuration = now - startedDate
   │  └─ Save to localStorage
   │
   └─ Notification:
      ├─ Team Leader notified: "Case CASE-2026-0001 completed"
      ├─ Auditor's workload updated
      ├─ Case moved to "Completed Cases"
      └─ Audit report available for review

```

### Auditor Case Details View

```
┌──────────────────────────────────────────────────────────┐
│ AUDITOR: Dawit Mohammed                                  │
│ CASE: CASE-2026-0001 - ABC Trading Company              │
│──────────────────────────────────────────────────────────│
│                                                          │
│ STATUS: IN_PROGRESS  [███████░░░░░░░░] 35% Complete    │
│                                                          │
│ TIMELINE:                                                │
│ Started: 2026-08-05 10:00                               │
│ Target End: 2026-08-20                                  │
│ Days Used: 5 / 15                                        │
│ Days Remaining: 10                                       │
│                                                          │
│──────────────────────────────────────────────────────────│
│ WORK ACTIVITIES:                                         │
│                                                          │
│ ✓ Documentation Review (2 days)                         │
│   Last update: 2026-08-07                               │
│   Notes: "Tax returns verified, no issues"              │
│   Evidence: [3 files attached]                          │
│                                                          │
│ ⧖ Bank Reconciliation (3 days) [████░░░ 60%]            │
│   Current: Cross-referencing bank statements            │
│   Notes: "Found $2,000 discrepancy on 8/6"              │
│   Evidence: [5 files attached]                          │
│                                                          │
│ • Transfer Pricing Analysis (0 days) [░░░░░░░ 0%]       │
│   Not started                                            │
│   Estimated: 5 days                                     │
│   Priority: HIGH (special instruction)                  │
│                                                          │
│ • Risk Assessment (0 days)                              │
│   Not started                                            │
│                                                          │
│──────────────────────────────────────────────────────────│
│ FINDINGS LOGGED:                                        │
│                                                          │
│ Finding 1: [HIGH] Transfer Pricing Deviation           │
│ Amount: $50,000  |  Status: DOCUMENTED                  │
│ "Related party pricing not at arm's length"             │
│                                                          │
│ Finding 2: [MEDIUM] Expense Classification              │
│ Amount: $15,000  |  Status: PENDING RESPONSE            │
│ "Personal expenses claimed as business"                 │
│                                                          │
│──────────────────────────────────────────────────────────│
│ ACTIONS:                                                │
│ [Update Progress] [Add Finding] [Add Note]              │
│ [Upload Evidence] [Request Extension] [Mark Complete]   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## COMPLETE CASCADE DATA FLOW

### Data Updates Through Entire Pipeline

```
STAGE 1: CASE CREATION
├─ Plans[].taxCenterAllocations → Cases created
├─ Data.cases[] populated with CREATED status
└─ Count: 47 total cases

STAGE 2: RISK PRIORITIZATION
├─ Data.cases[] riskScore calculated
├─ Data.cases[] riskLevel assigned
├─ Data.cases[] riskFactors populated
└─ Status remains: CREATED

STAGE 3: TAX CENTER SELECTION
├─ Manager selects 12 HIGH priority + 8 MEDIUM
├─ For selected cases:
│  ├─ status → SELECTED
│  ├─ selectedDate → now
│  └─ selectedBy → "Addis Ababa TC1"
└─ Count: 20 cases selected, 27 cases waiting

STAGE 4: TEAM LEADER ASSIGNMENT
├─ For assigned cases:
│  ├─ status → ASSIGNED_TO_TEAM_LEADER
│  ├─ assignedToTeamLeader → "Team Leader A"
│  └─ assignedToTeamLeaderDate → now
└─ Notification: TL received 5 cases (42 days)

STAGE 5: AUDITOR ASSIGNMENT
├─ For assigned cases:
│  ├─ status → ASSIGNED_TO_AUDITOR
│  ├─ assignedToAuditor → "Auditor C"
│  └─ assignedToAuditorDate → now
└─ Auditor sees: 1 case (15 days) to work on

STAGE 6: AUDIT EXECUTION
├─ Auditor starts case:
│  ├─ status → IN_PROGRESS
│  ├─ startedDate → now
│  └─ Activities logged
│
├─ Auditor completes case:
│  ├─ status → COMPLETED
│  ├─ completedDate → now
│  ├─ findings → array of findings
│  └─ auditReport → generated
│
└─ Summary:
   ├─ Duration: 18 days (3 days over estimate)
   ├─ Findings: 2 (1 HIGH, 1 MEDIUM)
   ├─ Amount at issue: $65,000
   └─ Case ready for director review
```

---

## SUMMARY: COMPLETE CASE CASCADE

```
┌────────────────────────────────────────────────────────┐
│        COMPLETE CASE CASCADE WORKFLOW SUMMARY           │
└────────────────────────────────────────────────────────┘

STAGE 1: PLAN APPROVED
├─ Status: FINALIZED
├─ Allocations: 47 cases across 3 tax centers
└─ Action: Auto-create cases

STAGE 2: RISK CALCULATION
├─ Process: Multi-factor algorithm
├─ Output: riskScore (0-100), riskLevel (HIGH/MED/LOW)
└─ Result: Cases prioritized by risk

STAGE 3: TAX CENTER SELECTS
├─ Actor: Tax Center Manager
├─ Selection: 20 of 47 cases (HIGH/MEDIUM priority)
├─ Status: CREATED → SELECTED
└─ Workload: ~150 days of work

STAGE 4: ASSIGN TO TEAM LEADERS
├─ Actor: Tax Center/Regional Director
├─ Distribution: Cases to 3 team leaders
├─ Status: SELECTED → ASSIGNED_TO_TEAM_LEADER
└─ Each TL gets: ~50 days work (average)

STAGE 5: TEAM LEADERS DISTRIBUTE
├─ Actor: Team Leader
├─ Distribution: Cases to auditors
├─ Capacity Check: Ensure no overload
├─ Status: ASSIGNED_TO_TEAM_LEADER → ASSIGNED_TO_AUDITOR
└─ Each Auditor gets: ~15-20 days work (balanced)

STAGE 6: AUDITORS EXECUTE
├─ Actor: Auditor
├─ Duration: Estimated 15 days per case
├─ Activities: Logged and tracked
├─ Status: IN_PROGRESS → COMPLETED
├─ Output: Audit findings, report
└─ Total time: ~300+ days across 4 auditors

STAGE 7: COMPLETION & REVIEW
├─ All cases completed
├─ Findings compiled
├─ Reports generated
└─ Results available for director review
```

---

## KEY FEATURES OF CASCADE WORKFLOW

✅ **Risk-Based Prioritization**: HIGH risk cases worked on first
✅ **Capacity Management**: System tracks workload for each resource
✅ **Flexible Distribution**: Can reassign cases if needed
✅ **Progress Tracking**: Real-time tracking at each stage
✅ **Finding Documentation**: Automatic recording of audit findings
✅ **Extension Handling**: Support for time extensions when needed
✅ **Workload Visibility**: Each actor sees their assigned work
✅ **Status Transparency**: Complete status history for each case
✅ **Report Generation**: Auto-generated audit reports
✅ **Data Persistence**: All data saved to localStorage

---

**This completes the CASE CASCADE WORKFLOW from plan approval through auditor execution!**