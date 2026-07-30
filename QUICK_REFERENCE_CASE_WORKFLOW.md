# Quick Reference: Audit Case Workflow

## 5-Second Overview
```
Plan Accepted → Cases Cascaded → Cases Prioritized → Cases Assigned → Cases Executed
    (TCM)          (Cascade)       (Process Owner)     (Team Leader)      (Auditor)
```

## Who Does What

| Role | View | Action | Result |
|------|------|--------|--------|
| **Tax Center Manager** | Accept Approved Plan | Accept finalized plan | `taxCenterAcceptance.status = 'ACCEPTED'` |
| **Cascade Audit Team** | Cascade Plan to Cases | Select taxpayers by risk → Create cases | `case.status = 'ASSIGNED'` |
| **Process Owner** | Case Prioritization | Review → Rank cases → Store | `storageStatus = 'STORED'` + `priorityRank` |
| **Team Leader** | Case Assignment | View ranked cases → Assign to auditors | `case.assignedTeam` populated |
| **Auditor** | Audit Cases List | Execute → Log findings → Complete | `case.status = 'COMPLETED'` |

## Key Statuses

### Case Status
- `ASSIGNED` - Ready for prioritization (from cascade)
- `PRIORITIZED` - Ranked but not yet assigned
- `IN_PROGRESS` - Auditor is executing
- `COMPLETED` - Audit finished

### Storage Status
- `undefined` - Fresh case
- `STORED` - Ranked and ready for assignment

## Critical Fields to Track

```javascript
// Created by Cascade Team
case.planId                    // Links to plan
case.riskLevel                 // Critical, High, Medium, Low
case.riskScore                 // 0-100
case.auditType                 // Based on risk
case.status = 'ASSIGNED'

// Added by Process Owner
case.priorityRank              // 1 = highest
case.storageStatus = 'STORED'
case.treatmentPlan             // Optional guidance

// Added by Team Leader
case.assignedTeam              // Auditor names
case.leadAuditor               // Lead auditor

// Added by Auditor
case.status = 'COMPLETED'
case.findings
case.hoursSpent
```

## Filtering Rules

| Stage | Filter | Sort |
|-------|--------|------|
| Cascade | `status='FINALIZED' + taxCenterAcceptance[region][tc].status='ACCEPTED'` | By plan ID |
| Prioritization | `status='ASSIGNED' + storageStatus≠'STORED'` | By risk score DESC |
| Assignment | `storageStatus='STORED'` | By priorityRank ASC |
| Execution | `case.assignedTeam includes user` | By priority or date |

## Allocation Respect

```javascript
// Plan says:
allocationLimits = {
  desk_audit: 50,
  field_audit: 30,
  comprehensive: 10
}

// When cascading, validate:
deskAuditCasesCreated ≤ 50      // ✅ if true, ❌ if false
fieldAuditCasesCreated ≤ 30     // ✅ if true, ❌ if false
comprehensiveCasesCreated ≤ 10  // ✅ if true, ❌ if false
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Cascade team can't see plan | Plan not accepted | Tax Center Manager must accept first |
| Can't create more than allocated cases | Exceeding limits | Select fewer cases respecting allocation |
| Cases not appearing in prioritization | storageStatus already STORED | Load only non-STORED cases |
| Ranked cases not in priority order | Sorting wrong field | Sort by priorityRank, not riskScore |
| Auditor can't see assigned case | Not in assignedTeam array | Team Leader must assign first |
| Can't complete case | Status not IN_PROGRESS | Auditor must click Start first |

## Data Model Quick View

```
Plan (status='FINALIZED')
├─ taxCenterAcceptance[region][taxCenter].status = 'ACCEPTED'
└─ taxCenterAllocations[region][taxCenter] = {
    desk_audit: 50,
    field_audit: 30,
    comprehensive: 10
}

Case (created from plan)
├─ id: CASE-region-tc-timestamp-idx
├─ planId: AP-0001
├─ status: ASSIGNED → PRIORITIZED → IN_PROGRESS → COMPLETED
├─ storageStatus: STORED (after prioritization)
├─ priorityRank: 1, 2, 3... (after prioritization)
├─ assignedTeam: ['Auditor 1', 'Auditor 2'] (after assignment)
└─ findings: {...} (after execution)
```

## Capacity Management

```
Total Capacity: 10,000 hours
Allocated: 7,500 hours
Remaining: 2,500 hours

When storing cases:
totalHours = selectedCases × estimatedHours
if (totalHours > remainingHours) {
  alert('❌ Insufficient capacity');
} else {
  store cases;
  remainingHours -= totalHours;
}
```

## Risk-Based Audit Type Assignment

```javascript
riskLevel = {
  'Critical' (score 80-100) → 'Comprehensive'
  'High' (score 65-79)      → 'Field Audit'
  'Medium' (score 45-64)    → 'Desk Audit'
  'Low' (score 20-44)       → 'Desk Audit'
}
```

## Revenue Protection

```javascript
// Cascade team selects by revenue at risk
highRevenueAtRisk = taxpayer with $4.5M revenue
lowRevenueAtRisk = taxpayer with $50K revenue

// Higher revenue = Higher priority
riskScore affects priorityRank
highRevenueHighRisk → priorityRank 1 (do first)
lowRevenueLowRisk → priorityRank 50 (do later)
```

## Treatment Plan Purpose

```javascript
// Optional guidance attached during prioritization
treatmentPlan = {
  strategy: 'What to focus on',
  focusAreas: ['Revenue', 'Receivables'],
  riskIndicators: ['Unusual patterns'],
  suggestedTests: ['Specific audit procedures'],
  estimatedHours: 120 (can override)
}

// Used by auditor during execution
auditor reads → follows guidance → potentially finds issues
```

## Multi-Tax Center Support

```javascript
// Same plan accepted by multiple tax centers

Plan AP-0001:
├─ Oromia-tc1: taxCenterAcceptance.status = 'ACCEPTED' ✅
│  └─ 50 cases created for Oromia-tc1
│  └─ Cascade team Oromia-tc1 sees all 50
│
├─ Oromia-tc2: taxCenterAcceptance.status = 'PENDING' ❌
│  └─ Not yet accepted
│  └─ Cascade team Oromia-tc2 cannot see these cases
│
└─ Amhara-tc1: taxCenterAcceptance.status = 'ACCEPTED' ✅
   └─ 45 cases created for Amhara-tc1
   └─ Cascade team Amhara-tc1 sees their 45
```

---

**Pro Tips:**

1. **High Risk = High Priority** - Cascade Team prioritizes critical/high-risk taxpayers first
2. **Allocation Limits Matter** - Respect them to avoid over-allocation
3. **Priority Ranking** - Process Owner ranks by risk, so Team Leader doesn't have to
4. **Treatment Plans** - Optional but helpful for auditor guidance
5. **Audit Trail** - Every action is recorded with date/time/who
6. **Capacity Planning** - Consider hours when storing cases
7. **Multi-Center** - Each center has independent workflow, no conflicts

---

**Last Updated:** July 27, 2026
