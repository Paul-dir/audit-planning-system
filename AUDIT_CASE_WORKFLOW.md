# Complete Audit Case Workflow: From Plan to Execution

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 1: PLAN ACCEPTANCE                                            │
│ (Tax Center Manager)                                                │
└─────────────────────────────────────────────────────────────────────┘
    ↓
Director Finalizes Plan → Tax Center Manager Accepts → Status: ACCEPTED
    ↓
    └─→ taxCenterAcceptance[region][taxCenter].status = 'ACCEPTED'

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 2: PLAN CASCADING (Cascade Audit Team)                       │
│ View: CascadePlanToCasesView                                        │
└─────────────────────────────────────────────────────────────────────┘
    ↓
1. SELECT ACCEPTED PLAN
   └─→ Filter: status='FINALIZED' + taxCenterAcceptance[region][tc].status='ACCEPTED'
   
2. VIEW PLAN ALLOCATIONS
   └─→ taxCenterAllocations[region][taxCenter]
   └─→ Shows: desk_audit: 50, field_audit: 30, comprehensive: 10, etc.
   
3. SELECT TAXPAYERS BY RISK
   ├─→ Risk Level: Critical, High, Medium, Low
   ├─→ Risk Score: 80-100, 65-79, 45-64, 20-44
   ├─→ Audit Type Recommendation: Based on Risk Level
   ├─→ Filter by Industry, Revenue at Risk
   └─→ Recommended Audit Type: Comprehensive, Field, Desk, etc.
   
4. CREATE AUDIT CASES
   └─→ handleCreateCases() creates case objects with:
       ├─ id: CASE-Oromia-tc1-timestamp-idx
       ├─ status: ASSIGNED
       ├─ planId: AP-0001
       ├─ taxCenter: Tax Center 1
       ├─ region: Oromia
       ├─ taxpayerId: TP-0001
       ├─ taxpayerName: Solomon Trading PLC
       ├─ tin: ET1000001
       ├─ auditType: Field Audit
       ├─ riskLevel: High
       ├─ riskScore: 75
       ├─ revenueAtRisk: 2500000
       ├─ estimatedHours: 150
       └─ createdDate: ISO timestamp
   
5. STORE IN AUDIT CASES
   └─→ data.auditCases.push(...newCases)
   └─→ saveData(data)

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 3: CASE PRIORITIZATION (Process Owner / Cascade Team)        │
│ View: CasePrioritizationView                                        │
└─────────────────────────────────────────────────────────────────────┘
    ↓
1. LOAD AUDIT CASES
   └─→ Filter: region + taxCenter matching user context
   └─→ Exclude: storageStatus = 'STORED' (already ranked)
   └─→ Include: status = ASSIGNED (from cascade)
   
2. REVIEW CASE DETAILS
   ├─→ Case ID, TIN, Taxpayer Name
   ├─→ Risk Level, Risk Score
   ├─→ Recommended Audit Type
   ├─→ Revenue at Risk
   ├─→ Estimated Hours
   └─→ Modal: CaseDetailsModal shows full details
   
3. ATTACH TREATMENT PLAN (Optional)
   └─→ Modal: TreatmentPlanModal
   └─→ Stores: treatment plan strategy for auditor guidance
   
4. PRIORITIZE / RANK CASES
   ├─→ Sort by Risk Score (Default: Desc)
   ├─→ Filter by Risk Level, Audit Type
   ├─→ Manual ranking via drag-drop or priority selection
   └─→ Selection: Check boxes for bulk operations
   
5. STORE / RANK CASES
   └─→ handleStoreCases() marks cases with:
       ├─ status: PRIORITIZED (or keep ASSIGNED)
       ├─ storageStatus: STORED
       ├─ priorityRank: 1, 2, 3, ...
       ├─ storedDate: ISO timestamp
       └─ storedBy: Process Owner name

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 4: RANKED CASE REPOSITORY                                     │
│ (Read-only for Team Leader)                                         │
└─────────────────────────────────────────────────────────────────────┘
    ↓
Stored Cases = Cases with storageStatus='STORED' + priorityRank
    ├─→ Ranked by priority (1 = highest)
    ├─→ Ready for assignment
    └─→ Immutable once stored (audit trail)

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 5: CASE ASSIGNMENT (Team Leader)                             │
│ View: CaseAssignmentView                                            │
└─────────────────────────────────────────────────────────────────────┘
    ↓
1. VIEW RANKED CASES
   └─→ Filter: storageStatus='STORED' (prioritized cases)
   └─→ Sort: By priorityRank (1 → highest priority)
   
2. SELECT CASES FOR ASSIGNMENT
   ├─→ Multi-select from ranked case list
   ├─→ Respect team capacity/hours
   └─→ Consider audit type requirements
   
3. ASSIGN TO AUDITORS
   ├─→ Select: Lead Auditor + Support Team
   ├─→ Map: Case → Auditor Assignment
   ├─→ Update: case.assignedTeam, case.leadAuditor, case.status = 'ASSIGNED'
   └─→ Save: assignment to data.auditCases
   
4. GENERATE EXECUTION PLAN
   └─→ Create detailed execution roadmap for auditor

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 6: EXECUTION (Auditors)                                       │
│ View: AuditCasesListView                                            │
└─────────────────────────────────────────────────────────────────────┘
    ↓
1. VIEW ASSIGNED CASES
   └─→ Filter: assignedTeam = current user
   └─→ Status: ASSIGNED (ready for execution)
   
2. START EXECUTION
   ├─→ Review treatment plan (if attached)
   ├─→ Review case details
   ├─→ Begin fieldwork
   └─→ Update: case.status = 'IN_PROGRESS'
   
3. LOG FINDINGS
   ├─→ Document observations
   ├─→ Record issues/risks found
   ├─→ Track hours spent
   └─→ Update: case.findings
   
4. COMPLETE AUDIT
   ├─→ Finalize report
   ├─→ Upload findings
   └─→ Update: case.status = 'COMPLETED'

┌─────────────────────────────────────────────────────────────────────┐
│ STAGE 7: REPORTING & FOLLOW-UP                                      │
│ (Audit Director / Regional Director)                                │
└─────────────────────────────────────────────────────────────────────┘
    ↓
Review Completed Cases → Report Generation → Follow-up Actions
```

## Data Structure: Audit Case Lifecycle

### Creation (Stage 2)
```javascript
{
  id: "CASE-Oromia-tc1-1721904000000-0",
  planId: "AP-0001",
  region: "Oromia",
  taxCenter: "Tax Center 1",
  
  // Taxpayer Info
  taxpayerId: "TP-0123",
  taxpayerName: "Solomon Trading PLC",
  tin: "ET1000123",
  industry: "Construction",
  
  // Risk Assessment
  riskLevel: "High",
  riskScore: 75,
  revenueAtRisk: 2500000,
  
  // Audit Planning
  auditType: "Field Audit",
  estimatedHours: 150,
  
  // Status Tracking
  status: "ASSIGNED",
  createdDate: "2026-07-27T10:30:00Z",
  createdFrom: "CASCADE_PLAN"  // or "AUDIT_REQUEST"
}
```

### After Prioritization (Stage 3)
```javascript
{
  // ... all above ...
  
  // Prioritization
  storageStatus: "STORED",
  priorityRank: 3,
  storedDate: "2026-07-27T14:45:00Z",
  storedBy: "Process Owner Name",
  
  // Treatment Plan (Optional)
  treatmentPlan: {
    strategy: "Focus on revenue recognition policies",
    focusAreas: ["Revenue", "Receivables"],
    riskIndicators: ["Unusual transactions"],
    suggestedTests: ["Sample revenue transactions"],
    estimatedHours: 150
  },
  
  status: "PRIORITIZED"
}
```

### After Assignment (Stage 5)
```javascript
{
  // ... all above ...
  
  // Assignment
  assignedTeam: ["Lead Auditor Name", "Support Auditor 1", "Support Auditor 2"],
  leadAuditor: "Lead Auditor Name",
  assignedDate: "2026-07-28T09:00:00Z",
  assignedBy: "Team Leader Name",
  
  status: "ASSIGNED"
}
```

### After Execution (Stage 6)
```javascript
{
  // ... all above ...
  
  // Execution Tracking
  startedDate: "2026-07-28T10:00:00Z",
  completedDate: "2026-08-15T17:30:00Z",
  
  findings: {
    issuesFound: 5,
    highRiskIssues: 2,
    riskAssessment: "MEDIUM",
    summary: "Found issues in revenue recognition...",
    recommendedFollowUp: "Additional testing required"
  },
  
  hoursSpent: 145,
  status: "COMPLETED"
}
```

## Key Files & Their Responsibilities

### 1. CascadePlanToCasesView.jsx
**Responsibility:** Create audit cases from plan allocations
- Load accepted plans
- Display taxpayers with risk levels
- Create cases mapped to taxpayers
- Save to `data.auditCases` with status='ASSIGNED'

### 2. CasePrioritizationView.jsx
**Responsibility:** Prioritize and rank cases
- Load cases with status='ASSIGNED'
- Filter by risk level, audit type
- Display case details
- Attach treatment plans
- Store/rank cases (storageStatus='STORED')

### 3. CaseAssignmentView.jsx
**Responsibility:** Assign ranked cases to auditors
- Load ranked cases (storageStatus='STORED')
- Select cases by priority
- Assign to team leaders/auditors
- Update status='ASSIGNED' (for execution)

### 4. AuditCasesListView.jsx
**Responsibility:** Execute assigned cases
- Load assigned cases
- Display execution details
- Track hours and findings
- Log completion

## Status Transitions

```
ASSIGNED (from cascade)
    ↓
PRIORITIZED (after ranking in CasePrioritizationView)
    ↓
ASSIGNED (again, after assignment in CaseAssignmentView)
    ↓
IN_PROGRESS (when auditor starts)
    ↓
COMPLETED (when auditor finishes)
```

## Storage Status Transitions

```
(none) - Fresh audit case
    ↓
STORED - After prioritization/ranking
    ↓
(stays STORED) - Until execution starts, then moves to status
```

## Taxpayer Risk Mapping

### Risk Level Determination
```javascript
riskLevel = {
  'Critical': riskScore 80-100,
  'High': riskScore 65-79,
  'Medium': riskScore 45-64,
  'Low': riskScore 20-44
}
```

### Audit Type Recommendation
```javascript
auditTypeByRisk = {
  'Critical': 'Comprehensive',     // Deep, detailed audit
  'High': 'Field Audit',           // On-site examination
  'Medium': 'Desk Audit',          // Desktop review
  'Low': 'Desk Audit'              // Simple review
}
```

### Allocation Respect
When cascading, respect the plan allocation:
```javascript
// Cascade Team must not exceed allocation
Plan Allocation: desk_audit: 50, field_audit: 30, comprehensive: 10

Selected Cases by Type:
- Comprehensive: 8 (out of 10) ✅
- Field Audit: 28 (out of 30) ✅
- Desk Audit: 50 (out of 50) ✅

Total: 86 cases (respects all limits)
```

## Validation & Error Handling

### In CascadePlanToCasesView
- ✅ Validate allocation limits per audit type
- ✅ Prevent exceeding plan allocation
- ✅ Show remaining slots available

### In CasePrioritizationView
- ✅ Filter out already-stored cases
- ✅ Show only this tax center's cases
- ✅ Validate tax center/region context

### In CaseAssignmentView
- ✅ Filter by storageStatus='STORED'
- ✅ Sort by priorityRank
- ✅ Validate auditor capacity

## Testing Workflow

### Test Scenario: Complete Flow
1. **Login as Tax Center Manager**
   - Accept finalized plan for Oromia-tc1

2. **Login as Cascade Team (Oromia-tc1)**
   - View cascade plan
   - See accepted plan in dropdown
   - Select 100 taxpayers by risk
   - Create 100 audit cases
   - Verify cases in data.auditCases

3. **Login as Process Owner**
   - Go to Case Prioritization
   - View 100 cases
   - Prioritize top 50 cases
   - Store/rank them
   - Verify storageStatus='STORED' + priorityRank

4. **Login as Team Leader**
   - Go to Case Assignment
   - View 50 ranked cases (sorted by priority)
   - Assign 25 to Auditor 1, 25 to Auditor 2
   - Verify case.assignedTeam populated

5. **Login as Auditor 1**
   - Go to Audit Cases
   - See 25 assigned cases
   - Start execution
   - Log findings
   - Mark complete

## Debugging Checklist

- [ ] Cases created with correct planId from cascade plan
- [ ] Cases have region and taxCenter matching login context
- [ ] Cases have correct riskLevel based on riskScore
- [ ] Cases have recommended auditType based on riskLevel
- [ ] Allocation limits respected during cascade
- [ ] Prioritization filters out STORED cases
- [ ] priorityRank assigned correctly (1, 2, 3, ...)
- [ ] storageStatus set to STORED after prioritization
- [ ] Assignment view shows only STORED cases
- [ ] Cases assigned to correct auditor
- [ ] Auditor can view assigned cases

---

**Last Updated:** July 27, 2026
**Status:** DOCUMENTED & READY FOR VERIFICATION
