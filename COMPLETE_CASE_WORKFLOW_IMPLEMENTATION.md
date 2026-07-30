# Complete Audit Case Workflow - Implementation Summary

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      AUDIT CASE LIFECYCLE                                 │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  STAGE 1: PLAN ACCEPTANCE (Tax Center Manager)                            │
│  └─→ Accept finalized plan                                                │
│  └─→ Status: FINALIZED + taxCenterAcceptance[region][tc].status='ACCEPTED'│
│                                                                            │
│  STAGE 2: PLAN CASCADING (Cascade Audit Team)                             │
│  └─→ View accepted plan allocations                                       │
│  └─→ Select taxpayers by risk level                                       │
│  └─→ Create audit cases (auditCases with status='ASSIGNED')               │
│  └─→ Cases mapped: Plan Allocation → Taxpayer Risk → Audit Type           │
│                                                                            │
│  STAGE 3: PRIORITIZATION (Process Owner)                                  │
│  └─→ Load cases (status='ASSIGNED', storageStatus≠'STORED')               │
│  └─→ Review case details                                                  │
│  └─→ Attach treatment plans (guidance for auditors)                       │
│  └─→ Rank cases by risk score                                             │
│  └─→ Store cases (storageStatus='STORED' + priorityRank)                  │
│                                                                            │
│  STAGE 4: ASSIGNMENT (Tax Center Manager / Team Leader)                   │
│  └─→ View ranked cases (storageStatus='STORED', sorted by priorityRank)   │
│  └─→ Assign cases to auditors                                             │
│  └─→ Update: case.assignedTeam, case.leadAuditor, case.status='ASSIGNED'  │
│                                                                            │
│  STAGE 5: EXECUTION (Auditors)                                            │
│  └─→ View assigned cases                                                  │
│  └─→ Execute audit fieldwork                                              │
│  └─→ Log findings and hours                                               │
│  └─→ Update: case.status='IN_PROGRESS' → 'COMPLETED'                      │
│                                                                            │
│  STAGE 6: REPORTING (Audit Director / Regional Director)                  │
│  └─→ Review completed cases                                               │
│  └─→ Generate reports                                                     │
│  └─→ Plan follow-up actions                                               │
│                                                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow

### Stage 1: Plan Acceptance
**When:** Tax Center Manager accepts finalized plan
**What Changes:**
```javascript
plan.taxCenterAcceptance[region][taxCenterName] = {
  status: 'ACCEPTED',          // ✅ Now accessible to cascade team
  taxCenter: 'Oromia-tc1',
  acceptedDate: '2026-07-27T...',
  readyForExecution: true
}
```

**Result:** Plan is now available for cascade team to cascade

---

### Stage 2: Plan Cascading
**When:** Cascade Audit Team creates audit cases from accepted plan
**Process:**
1. Cascade team loads accepted plan
2. Selects taxpayers based on risk levels (Critical, High, Medium, Low)
3. Maps taxpayers to recommended audit types based on risk
4. Creates cases respecting allocation limits

**Case Creation:**
```javascript
const newCase = {
  id: 'CASE-Oromia-tc1-1721904000000-0',
  planId: 'AP-0001',                    // ← Links to plan
  
  // Location Info
  region: 'Oromia',
  taxCenter: 'Tax Center 1',
  
  // Taxpayer Info
  taxpayerId: 'TP-0123',
  taxpayerName: 'Solomon Trading PLC',
  tin: 'ET1000123',
  
  // Risk Assessment (from taxpayer database)
  riskLevel: 'High',                    // ← Based on risk score
  riskScore: 75,                        // ← Calculated from multiple factors
  revenueAtRisk: 2500000,
  
  // Audit Planning (recommended based on risk)
  auditType: 'Field Audit',             // ← Based on riskLevel
  estimatedHours: 150,
  
  // Status Tracking
  status: 'ASSIGNED',                   // ← Initial status from cascade
  createdFrom: 'CASCADE_PLAN',
  createdDate: '2026-07-27T10:30:00Z'
}
```

**Allocation Validation:**
```javascript
// Plan says: desk_audit: 50, field_audit: 30, comprehensive: 10

Selected:
- Comprehensive: 8 ✅ (under 10)
- Field Audit: 28 ✅ (under 30)
- Desk Audit: 50 ✅ (under 50)

Total: 86 cases ✅ (all within allocation)
```

**Result:** Audit cases stored in `data.auditCases`

---

### Stage 3: Prioritization & Ranking
**When:** Process Owner reviews and ranks cases
**Process:**
1. Load cases with status='ASSIGNED' (not yet stored)
2. Exclude already-stored cases (storageStatus='STORED')
3. Review case details in modal
4. Attach treatment plan (optional guidance)
5. Select cases to prioritize
6. Click "Store Cases" → Cases ranked by risk score

**Ranking Algorithm:**
```javascript
// Sort by risk score (highest first) and assign ranks
const selectedCasesByRisk = selectedCases
  .map(id => caseData[id])
  .sort((a, b) => b.riskScore - a.riskScore);  // Highest risk first

// Assign sequential rank (1 = highest priority)
selectedCasesByRisk.forEach((case, index) => {
  case.priorityRank = index + 1;               // 1, 2, 3, 4...
  case.storageStatus = 'STORED';
  case.storedDate = now();
  case.storedBy = 'Process Owner Name';
});
```

**Case After Storage:**
```javascript
{
  ...previousData,
  
  // Prioritization Info
  storageStatus: 'STORED',              // ← Marked as ready for assignment
  priorityRank: 3,                      // ← 1 = highest priority
  storedDate: '2026-07-27T14:45:00Z',
  storedBy: 'Process Owner Name',
  
  // Treatment Plan (optional)
  treatmentPlan: {
    strategy: 'Focus on revenue recognition',
    focusAreas: ['Revenue', 'Receivables'],
    suggestedTests: ['Sample revenue transactions'],
    estimatedHours: 150
  }
}
```

**Result:** Cases ready for assignment (ranked by priority)

---

### Stage 4: Case Assignment
**When:** Team Leader assigns ranked cases to auditors
**Process:**
1. Load ranked cases (storageStatus='STORED', sorted by priorityRank)
2. View cases grouped by audit type, highest priority first
3. Select cases to assign to auditors
4. Assign to Lead Auditor + Support Team
5. Click "Assign" → Cases updated with assignments

**Case After Assignment:**
```javascript
{
  ...previousData,
  
  // Assignment Info
  assignedTeam: [
    'Lead Auditor Name',
    'Support Auditor 1',
    'Support Auditor 2'
  ],
  leadAuditor: 'Lead Auditor Name',
  assignedDate: '2026-07-28T09:00:00Z',
  assignedBy: 'Team Leader Name',
  
  status: 'ASSIGNED'                    // ← Ready for execution
}
```

**Result:** Cases assigned to auditors, ready for execution

---

### Stage 5: Execution
**When:** Auditors execute assigned cases
**Process:**
1. Auditor views assigned cases
2. Reviews case details and treatment plan
3. Starts fieldwork (status → 'IN_PROGRESS')
4. Logs findings and hours
5. Completes audit (status → 'COMPLETED')

**Case During & After Execution:**
```javascript
// During Execution
{
  ...previousData,
  status: 'IN_PROGRESS',
  startedDate: '2026-07-28T10:00:00Z'
}

// After Completion
{
  ...previousData,
  status: 'COMPLETED',
  completedDate: '2026-08-15T17:30:00Z',
  
  findings: {
    issuesFound: 5,
    highRiskIssues: 2,
    riskAssessment: 'MEDIUM',
    summary: 'Found issues in revenue recognition...',
    recommendedFollowUp: 'Additional testing required'
  },
  
  hoursSpent: 145
}
```

**Result:** Completed audit cases with findings

---

## Key Data Structures

### Audit Case Schema
```javascript
{
  // Identity
  id: string,                           // CASE-region-tc-timestamp-idx
  planId: string,                       // AP-0001
  
  // Location
  region: string,                       // Oromia, Amhara, etc.
  taxCenter: string,                    // Tax Center 1
  
  // Taxpayer Information
  taxpayerId: string,                   // TP-0123
  taxpayerName: string,
  tin: string,                          // ET1000123
  industry: string,
  
  // Risk Assessment
  riskLevel: 'Critical'|'High'|'Medium'|'Low',
  riskScore: number,                    // 0-100
  revenueAtRisk: number,                // In currency units
  
  // Audit Type & Effort
  auditType: string,                    // Field Audit, Comprehensive, etc.
  estimatedHours: number,
  
  // Status Tracking
  status: 'ASSIGNED'|'IN_PROGRESS'|'COMPLETED',
  createdFrom: 'CASCADE_PLAN'|'AUDIT_REQUEST',
  createdDate: ISO8601,
  
  // Prioritization (after Stage 3)
  storageStatus: 'STORED'|undefined,    // STORED = ranked and ready
  priorityRank: number,                 // 1 = highest
  storedDate: ISO8601,
  storedBy: string,
  
  // Treatment Plan (optional)
  treatmentPlan?: {
    strategy: string,
    focusAreas: string[],
    suggestedTests: string[],
    estimatedHours: number
  },
  
  // Assignment (after Stage 4)
  assignedTeam?: string[],              // Auditor names
  leadAuditor?: string,
  assignedDate?: ISO8601,
  assignedBy?: string,
  
  // Execution (during Stage 5)
  startedDate?: ISO8601,
  completedDate?: ISO8601,
  
  // Findings
  findings?: {
    issuesFound: number,
    highRiskIssues: number,
    riskAssessment: string,
    summary: string,
    recommendedFollowUp: string
  },
  
  hoursSpent?: number
}
```

## Cascade Team Workflow in Detail

### What Cascade Team Sees

**Step 1: Select Plan**
```
Available Plans: [✅ Dropdown of accepted plans]
├─ AP-0001 (FY 2026) - Accepted by Oromia-tc1
├─ AP-0002 (FY 2026) - Accepted by Oromia-tc1
└─ AP-0003 (FY 2026) - Not accepted yet (hidden)
```

**Step 2: View Allocations**
```
Plan: AP-0001
Region: Oromia
Tax Center: Oromia-tc1

Your Tax Center Allocation:
├─ Comprehensive: 10 cases
├─ Field Audit: 30 cases
├─ Desk Audit: 50 cases
├─ Joint Audit: 5 cases
├─ Transfer Pricing: 3 cases
└─ Issue Audit: 2 cases
TOTAL: 100 cases
```

**Step 3: Select Taxpayers by Risk**
```
Available Taxpayers: 410 total

Filters:
├─ Risk Level: [All] [Critical] [High] [Medium] [Low]
├─ Audit Type Recommendation: [All] [Comprehensive] [Field] [Desk] [Joint] [Transfer] [Issue]
└─ Industry: [All] [Construction] [Manufacturing] [Wholesale] [Services] [Import/Export] [Agriculture]

List:
┌─────────────┬──────┬──────────────┬─────────┬──────────────────┬───────────┐
│ TIN         │ Name │ Risk Level   │ R.Score │ Revenue at Risk   │ Audit     │
├─────────────┼──────┼──────────────┼─────────┼──────────────────┼───────────┤
│ ET1000001   │ A    │ Critical (↑) │ 92      │ 4,500,000 ETB    │ Comp.     │
│ ET1000002   │ B    │ High (↑)     │ 75      │ 2,500,000 ETB    │ Field     │
│ ET1000003   │ C    │ High (↑)     │ 72      │ 2,200,000 ETB    │ Field     │
│ ET1000004   │ D    │ Medium       │ 55      │ 1,200,000 ETB    │ Desk      │
└─────────────┴──────┴──────────────┴─────────┴──────────────────┴───────────┘

Selection:
☑ Critical (1 selected) → Recommended: Comprehensive (1/10 slots)
☑ High (2 selected) → Recommended: Field Audit (2/30 slots)
☑ Medium (2 selected) → Recommended: Desk Audit (2/50 slots)

✓ Auto-Cascade: Fills remaining slots automatically
```

**Step 4: Create Cases**
```
Creating 100 cases:
├─ Comprehensive: 10 cases ✅
├─ Field Audit: 30 cases ✅
├─ Desk Audit: 50 cases ✅
├─ Joint Audit: 5 cases ✅
├─ Transfer Pricing: 3 cases ✅
└─ Issue Audit: 2 cases ✅

✓ All cases created and stored
✓ 100 audit cases now in system
✓ Ready for prioritization
```

---

## Process Owner Workflow in Detail

### What Process Owner Sees

**Step 1: Load Cases**
```
Cases for Prioritization: 100 total
├─ Status: ASSIGNED (freshly cascaded)
├─ Region: Oromia
├─ Tax Center: Oromia-tc1
└─ Filter: Exclude already STORED cases
```

**Step 2: Review Cases**
```
Case List (sorted by Risk Score, Desc):

┌──────┬─────────────────┬──────────┬─────────┬─────────────────┬───────────┐
│ Rank │ TIN             │ Name     │ R.Score │ Revenue at Risk  │ Audit     │
├──────┼─────────────────┼──────────┼─────────┼─────────────────┼───────────┤
│  1   │ ET1000001       │ Solomon  │ 92      │ 4,500,000 ETB   │ Comp.     │
│  2   │ ET1000002       │ Selam    │ 75      │ 2,500,000 ETB   │ Field     │
│  3   │ ET1000003       │ Abebe    │ 72      │ 2,200,000 ETB   │ Field     │
│ ...  │ ...             │ ...      │ ...     │ ...             │ ...       │
└──────┴─────────────────┴──────────┴─────────┴─────────────────┴───────────┘

Click on case → See full details in modal
```

**Step 3: Attach Treatment Plan (Optional)**
```
For each case, can attach:
├─ Audit Strategy: "Focus on revenue recognition"
├─ Focus Areas: ["Revenue", "Receivables", "Bank Reconciliation"]
├─ Risk Indicators: ["Unusual transactions", "Round numbers"]
├─ Suggested Tests: ["Sample revenue transactions", "Aging analysis"]
└─ Estimated Hours: 150 (can adjust from 120 to 180)
```

**Step 4: Prioritize Cases**
```
Selection:
☑ Case 1 (R.Score: 92, Comprehensive)
☑ Case 2 (R.Score: 75, Field Audit)
☑ Case 3 (R.Score: 72, Field Audit)
☑ ...
☑ Case 50 (R.Score: 45, Desk Audit)

Selected: 50 out of 100 cases (50% of capacity)
Total Hours: 7,500 hours (within 10,000 hour capacity)
```

**Step 5: Store / Rank Cases**
```
✓ Click "Store Selected Cases"

Cases are ranked by risk score:
- Priority 1: R.Score 92 (Comprehensive)
- Priority 2: R.Score 75 (Field Audit)
- Priority 3: R.Score 72 (Field Audit)
- ...
- Priority 50: R.Score 45 (Desk Audit)

✓ storageStatus = 'STORED'
✓ priorityRank = 1, 2, 3, ..., 50
✓ Cases ready for assignment
```

---

## Team Leader Workflow in Detail

### What Team Leader Sees

**Step 1: View Ranked Cases**
```
Stored Cases: 50 total (ready for assignment)
Sorted by: priorityRank (1 = highest priority)

Group by Audit Type:

COMPREHENSIVE (10 cases):
┌───┬─────────────────┬──────────┬─────────────────┐
│ # │ TIN             │ Name     │ Revenue at Risk │
├───┼─────────────────┼──────────┼─────────────────┤
│ 1 │ ET1000001       │ Solomon  │ 4,500,000 ETB   │
│ 2 │ ET1000010       │ Medhin   │ 3,200,000 ETB   │
│ 3 │ ET1000015       │ Tigist   │ 2,800,000 ETB   │
└───┴─────────────────┴──────────┴─────────────────┘

FIELD AUDIT (30 cases):
[Similar structure...]

DESK AUDIT (10 cases):
[Similar structure...]
```

**Step 2: Assign to Auditors**
```
Select cases: ☑ Comprehensive 1-10
              ☑ Field Audit 1-20

Assign to:
├─ Lead Auditor: [Select from dropdown]
├─ Support Auditor 1: [Optional]
└─ Support Auditor 2: [Optional]

Capacity Check:
├─ Lead Auditor Current: 120 hours
├─ Lead Auditor Capacity: 2000 hours
├─ Available: 1,880 hours ✅
└─ Cases to Assign: 30 cases × 150 hours = 4,500 hours ❌ ERROR

Suggest: Distribute across 2-3 auditors
```

**Step 3: Create Assignments**
```
✓ Assign 10 Comprehensive to Lead Auditor 1 (1,500 hours)
✓ Assign 10 Field Audit to Lead Auditor 2 (1,500 hours)
✓ Assign 20 Desk Audit to Lead Auditor 1 + 2 (split)

✓ Assignments created
✓ Cases updated: case.assignedTeam, case.leadAuditor
✓ Ready for execution
```

---

## Complete Example: Tracing One Case Through All Stages

### Case: TP-0123 - Solomon Trading PLC

#### Stage 1: Plan Accepted
```
Plan: AP-0001 (Oromia, Tax Center 1)
Status: FINALIZED + taxCenterAcceptance['Oromia']['Oromia-tc1'].status = 'ACCEPTED'
```

#### Stage 2: Case Created (Cascade)
```javascript
case = {
  id: 'CASE-Oromia-tc1-1721904000000-5',
  planId: 'AP-0001',
  region: 'Oromia',
  taxCenter: 'Tax Center 1',
  taxpayerId: 'TP-0123',
  taxpayerName: 'Solomon Trading PLC',
  tin: 'ET1000001',
  riskLevel: 'Critical',
  riskScore: 92,
  revenueAtRisk: 4500000,
  auditType: 'Comprehensive',
  estimatedHours: 180,
  status: 'ASSIGNED',           // ← New
  createdFrom: 'CASCADE_PLAN',
  createdDate: '2026-07-27T10:30:00Z'
}
```

#### Stage 3: Case Stored & Ranked (Process Owner)
```javascript
case = {
  // ... previous ...
  storageStatus: 'STORED',      // ← Updated
  priorityRank: 1,              // ← Updated (highest risk!)
  storedDate: '2026-07-27T14:45:00Z',
  storedBy: 'Process Owner Name',
  
  treatmentPlan: {              // ← Optional
    strategy: 'Focus on revenue recognition and cutoff',
    focusAreas: ['Revenue', 'Receivables', 'Cash'],
    suggestedTests: ['Sample 30 revenue transactions', 'Trace to bank'],
    estimatedHours: 180
  }
}
```

#### Stage 4: Case Assigned (Team Leader)
```javascript
case = {
  // ... previous ...
  assignedTeam: [
    'Lead Auditor Name',
    'Support Auditor 1'
  ],
  leadAuditor: 'Lead Auditor Name',
  assignedDate: '2026-07-28T09:00:00Z',
  assignedBy: 'Team Leader Name'
  // status: still 'ASSIGNED'
}
```

#### Stage 5: Execution Starts (Auditor)
```javascript
case = {
  // ... previous ...
  status: 'IN_PROGRESS',        // ← Updated
  startedDate: '2026-07-28T10:00:00Z'
}
```

#### Stage 5: Execution Completes (Auditor)
```javascript
case = {
  // ... previous ...
  status: 'COMPLETED',          // ← Updated
  completedDate: '2026-08-15T17:30:00Z',
  
  findings: {
    issuesFound: 3,
    highRiskIssues: 1,
    riskAssessment: 'MEDIUM',
    summary: 'Found revenue cutoff issue in July transactions. One unauthorized transaction to related party detected.',
    recommendedFollowUp: 'Management meeting required. May need to adjust prior year revenue.'
  },
  
  hoursSpent: 178
}
```

---

## Implementation Checklist

### Cascade Team
- [x] Filter accepted plans (status=FINALIZED + taxCenterAcceptance.status=ACCEPTED)
- [x] Display plan allocations for tax center
- [x] Show taxpayers with risk levels (Critical, High, Medium, Low)
- [x] Map taxpayers to audit types based on risk
- [x] Create audit cases with all required fields
- [x] Respect allocation limits per audit type
- [x] Store cases with status='ASSIGNED'

### Process Owner / Prioritization
- [x] Load cases (status='ASSIGNED', storageStatus≠'STORED')
- [x] Display case details in modal
- [x] Allow treatment plan attachment
- [x] Sort cases by risk score
- [x] Calculate priority rank (highest risk = rank 1)
- [x] Set storageStatus='STORED' + priorityRank
- [x] Store storedDate and storedBy

### Team Leader / Assignment
- [x] Load ranked cases (storageStatus='STORED')
- [x] Sort by priorityRank (1 first)
- [x] Group by audit type
- [x] Assign to auditors
- [x] Check auditor capacity
- [x] Update case.assignedTeam, case.leadAuditor
- [x] Keep status='ASSIGNED' until execution

### Auditor / Execution
- [x] Load assigned cases (case.assignedTeam includes user)
- [x] View case details and treatment plan
- [x] Update status to 'IN_PROGRESS'
- [x] Log findings and hours
- [x] Update status to 'COMPLETED'

---

## Testing Strategy

### Test Case 1: Happy Path (Single Case)
1. Create plan with 10 allocation
2. Tax Center Manager accepts
3. Cascade Team creates 1 case
4. Process Owner prioritizes it (rank 1)
5. Team Leader assigns to Auditor
6. Auditor executes and completes

### Test Case 2: Multi-Case Allocation Limit
1. Plan with: desk_audit: 50, field_audit: 30
2. Cascade Team tries to create:
   - 60 desk audits → ❌ Should fail (over 50)
   - 50 desk + 30 field → ✅ Should work (within limits)

### Test Case 3: Multi-Tax Center
1. Same plan, multiple tax centers
2. Each tax center independently:
   - Accepts plan
   - Cascades to different taxpayers
   - Creates separate cases
3. Verify no data collision

### Test Case 4: Capacity Constraints
1. Process Owner's capacity: 10,000 hours
2. Store 80 cases × 120 hours = 9,600 hours → ✅
3. Store 90 cases × 120 hours = 10,800 hours → ❌ Over capacity

---

## Audit Trail

Every stage is recorded:

```javascript
// Stage 1: Plan Acceptance
plan.approvalHistory.push({
  action: 'ACCEPTED_BY_TAX_CENTER',
  by: 'Tax Center Manager',
  date: ISO8601,
  notes: 'Formally accepted. Ready for execution.'
});

// Stage 2: Case Creation
// case.createdDate records when cascade happened
// case.createdFrom records it came from CASCADE_PLAN

// Stage 3: Case Storage
case.storedDate;
case.storedBy;
case.priorityRank;

// Stage 4: Case Assignment
case.assignedDate;
case.assignedBy;
case.assignedTeam;

// Stage 5: Execution
case.startedDate;
case.completedDate;
case.hoursSpent;
```

Complete audit trail from plan creation to completion! ✅

---

**Last Updated:** July 27, 2026
**Status:** FULLY IMPLEMENTED & DOCUMENTED ✅
**Build Status:** ✅ SUCCESS (Exit Code: 0)
