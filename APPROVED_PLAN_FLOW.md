# Approved Plan Flow - Complete Data Path (TOP TO BOTTOM)

## Overview
This document explains how an **APPROVED** plan flows through the system from Director level down to Auditor level case assignments.

---

## Complete Workflow Flow

```
DIRECTOR LEVEL
    ↓
    └─ Creates Plan with regionalAllocation[region] = audit type counts
    └─ Status: APPROVED
    └─ Data stored in: plan.regionAllocation = {
         'Addis Ababa': { desk_audit: 50, field_audit: 30, ... },
         'Amhara': { desk_audit: 40, field_audit: 25, ... },
         ...
       }

      ↓
REGIONAL DIRECTOR LEVEL (RegionalFeedbackView.jsx)
    ↓
    └─ RECEIVES: plan.regionalAllocation[selectedRegion]
    └─ Allocates from regional total to 3 tax centers
    └─ Saves to: plan.taxCenterAllocations[region][taxCenterName]
    └─ Status: Allocations SENT
    └─ Data structure example:
       plan.taxCenterAllocations = {
         'Addis Ababa': {
           'Addis Ababa TC1': { desk_audit: 20, field_audit: 12, ... },
           'Addis Ababa TC2': { desk_audit: 18, field_audit: 10, ... },
           'Addis Ababa TC3': { desk_audit: 12, field_audit: 8, ... }
         }
       }

      ↓
TAX CENTER MANAGER LEVEL (TaxCenterFeedbackView.jsx)
    ↓
    └─ RECEIVES: plan.regionalAllocation[userRegion]
       (All tax centers in region get same regional allocation)
    └─ OR: plan.taxCenterAllocations[region][userTaxCenter]
       (Specific tax center allocation if set by regional director)
    └─ Provides capacity feedback
    └─ Submits: plan.taxCenterFeedback[region][taxCenterName] = {
         status: 'SUBMITTED',
         canDeliver: { desk_audit: 18, field_audit: 11, ... },
         notes: 'Feedback text'
       }

      ↓
TAX CENTER TEAM LEAD LEVEL (CascadePlanToCasesView.jsx)
    ↓
    └─ RECEIVES: plan.taxCenterAllocations[region][taxCenterName]
    └─ Cascades to audit cases by selecting taxpayers
    └─ Creates audit cases with:
       - plan.auditCases: [
           { id: 'CASE-...', planId: 'AP-0001', region: 'Addis Ababa', 
             taxCenter: 'Addis Ababa TC1', auditType: 'Desk Audit', 
             status: 'ASSIGNED', ... },
           ...
         ]

      ↓
AUDITOR LEVEL (AuditCasesListView.jsx)
    ↓
    └─ VIEWS: plan.auditCases filtered by their tax center/region
    └─ Works on assigned cases
    └─ Updates case status: ASSIGNED → IN_PROGRESS → CLOSED
```

---

## Key Data Structures

### 1. Plan with Regional Allocation (DIRECTOR level)
```javascript
{
  id: 'AP-0001',
  status: 'APPROVED',  // ✅ CRITICAL: Must be APPROVED
  regionalAllocation: {
    'Addis Ababa': {
      'desk_audit': 50,
      'field_audit': 30,
      'joint_audit': 20,
      'transfer_pricing': 10,
      'comprehensive': 15,
      'issue_audit': 5
    },
    // ... other regions
  }
}
```

### 2. Tax Center Allocation (REGIONAL DIRECTOR level)
```javascript
{
  // ... (above structure) ...
  taxCenterAllocations: {
    'Addis Ababa': {
      'Addis Ababa TC1': {
        'desk_audit': 20,
        'field_audit': 12,
        'joint_audit': 8,
        'transfer_pricing': 4,
        'comprehensive': 6,
        'issue_audit': 2
      },
      'Addis Ababa TC2': { ... },
      'Addis Ababa TC3': { ... }
    },
    // ... other regions
  }
}
```

### 3. Tax Center Feedback (TAX CENTER MANAGER level)
```javascript
{
  // ... (above structures) ...
  taxCenterFeedback: {
    'Addis Ababa': {
      'Addis Ababa TC1': {
        status: 'SUBMITTED',
        submittedDate: '2026-07-24T...',
        desk_audit: { canDeliver: 18, notes: '' },
        field_audit: { canDeliver: 11, notes: '' },
        // ... other types
      },
      'Addis Ababa TC2': { ... },
      'Addis Ababa TC3': { ... }
    }
  }
}
```

### 4. Audit Cases (TAX CENTER TEAM LEAD level)
```javascript
{
  auditCases: [
    {
      id: 'CASE-Addis Ababa-Addis Ababa TC1-1721846400000-0',
      planId: 'AP-0001',
      region: 'Addis Ababa',
      taxCenter: 'Addis Ababa TC1',
      taxpayerId: 'TP-0042',
      taxpayerName: 'Selam Manufacturing Ltd',
      tin: 'ET1000042',
      auditType: 'Desk Audit',
      status: 'ASSIGNED',
      createdDate: '2026-07-24T...'
    },
    // ... more cases
  ]
}
```

---

## Critical File Paths

### Component Files:
1. **src/components/views/RegionalFeedbackView.jsx** - Regional Directors allocate to tax centers
2. **src/components/views/TaxCenterAllocationView.jsx** - Distributes across 3 tax centers
3. **src/components/views/TaxCenterFeedbackView.jsx** - Tax centers provide feedback
4. **src/components/views/CascadePlanToCasesView.jsx** - Creates cases from allocation
5. **src/components/views/AuditCasesListView.jsx** - Auditors view their assigned cases

### Data File:
- **src/utils/data.js** - Sample data with complete structures

---

## How Each Role Receives the Plan

### 1. Regional Director Receives Approved Plan
**File:** `RegionalFeedbackView.jsx` (line 60-70)
```javascript
// Filters ONLY APPROVED plans that have regionalAllocation for their region
const regionPlans = data.plans.filter(p => {
  const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
  const isApproved = p.status === 'APPROVED' || ...;
  return hasAllocation && isApproved;
});
```
- Receives: `plan.regionalAllocation[selectedRegion]`
- Can see: Total cases allocated to their region
- Action: Clicks "Allocate to Tax Centers"

### 2. Regional Director Allocates to Tax Centers
**File:** `TaxCenterAllocationView.jsx` (line 200+)
```javascript
// Gets regional allocation
const breakdown = specificPlan.regionalAllocation[selectedRegion];

// Gets or creates tax center distribution
const tcDist = specificPlan.taxCenterAllocations?.[selectedRegion] || {};

// Saves allocations with Send button
currentPlan.taxCenterAllocations[selectedRegion] = taxCenterDistribution;
saveData(data);
```
- Allocates from: `plan.regionalAllocation[region]`
- Saves to: `plan.taxCenterAllocations[region][taxCenterName]`

### 3. Tax Center Manager Receives Allocation
**File:** `TaxCenterFeedbackView.jsx` (line 60-100)
```javascript
// Looks for regionalAllocation for this tax center's region
const plansWithAllocations = data.plans.filter(p => {
  const hasRegionalAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
  return hasRegionalAllocation;
});

// Gets the allocation
const regionalAllocations = plan.regionalAllocation[selectedRegion];
```
- Receives: `plan.regionalAllocation[selectedRegion]` (all TCs get same regional total)
- Action: Provides feedback on capacity

### 4. Tax Center Team Lead Cascades Cases
**File:** `CascadePlanToCasesView.jsx` (line 40-50)
```javascript
// Looks in taxCenterAllocations first (if RC set it)
const allocation = plan.taxCenterAllocations?.[selectedRegion]?.[selectedTaxCenter];

// Falls back to regionalAllocation if not found
const regionalAlloc = plan.regionalAllocation?.[selectedRegion];
const finalAllocation = allocation || regionalAlloc;

// Creates cases based on finalAllocation
const newCases = Array.from(selectedTaxpayers.values()).map(selection => {
  return {
    id: `CASE-...`,
    planId: selectedPlan,
    taxCenter: selectedTaxCenter,
    region: selectedRegion,
    // ... taxpayer details ...
    status: 'ASSIGNED',
    createdDate: new Date().toISOString()
  };
});

// Save to auditCases
data.auditCases = [...data.auditCases, ...newCases];
saveData(data);
```

### 5. Auditor Views Their Cases
**File:** `AuditCasesListView.jsx` (line 50+)
```javascript
// Gets user's assigned tax center and region from auth
const selectedRegion = userInfo?.orgContext?.assignedRegion;
const selectedTaxCenter = userInfo?.orgContext?.assignedTaxCenter;

// Loads cases for THIS tax center only
const taxCenterCases = cases.filter(c => 
  c.taxCenter === selectedTaxCenter && 
  c.region === selectedRegion
);

setAllCases(taxCenterCases);
```
- Views: `plan.auditCases` filtered by their `taxCenter` and `region`

---

## Verification Checklist

✅ **Sample Data Structure:**
- [x] Plan `AP-0001` has `status: 'APPROVED'`
- [x] Plan has `regionalAllocation` with 6 audit types per region
- [x] Plan has `taxCenterAllocations` for breakdown to 3 TCs per region
- [x] All regions: Addis Ababa, Amhara, Oromia, SNNPR, Somali

✅ **Complete Audit Types (6):**
- [x] `desk_audit`
- [x] `field_audit`
- [x] `joint_audit`
- [x] `transfer_pricing`
- [x] `comprehensive`
- [x] `issue_audit`

✅ **User Context (Auth):**
- [x] Users get `orgContext.assignedRegion` during login
- [x] Users get `orgContext.assignedTaxCenter` during login
- [x] Views use context to auto-load their data

✅ **Data Flow:**
- [x] Director → Regional allocation
- [x] Regional → Tax center allocation
- [x] Tax center → Feedback submission
- [x] Cascade → Audit cases creation
- [x] Auditor → Case assignment

---

## Testing the Flow

### Step 1: Login as Regional Director (Addis Ababa)
- Expected: See "Addis Ababa" region selected
- Expected: See "Allocate to Tax Centers" option
- Click it to proceed

### Step 2: Allocate to 3 Tax Centers
- Should see: Total 130 cases for Addis Ababa
- Allocate to: TC1, TC2, TC3
- Click "Send Allocations to Tax Centers"

### Step 3: Login as Tax Center Manager (Addis Ababa TC1)
- Expected: See allocation for Addis Ababa TC1
- Action: Go to "Cascade Plan to Cases"

### Step 4: Cascade to Cases
- Should see: "Addis Ababa TC1" allocation (e.g., 20 desk audit, 12 field audit, etc.)
- Can select taxpayers and create cases
- Click "Create Cases"

### Step 5: Login as Auditor (Addis Ababa TC1)
- Expected: See audit cases in "Audit Cases" section
- Should show: Cases created in Step 4
- Can view and update case status

---

## Troubleshooting

### Issue: No plans visible at Regional Director level
**Check:**
- Plan has `status: 'APPROVED'`
- Plan has `regionalAllocation` with this region

### Issue: No allocation shown at Tax Center level
**Check:**
- Tax center manager is logged in with correct `assignedRegion` and `assignedTaxCenter`
- Plan has `regionalAllocation` for that region

### Issue: No cases created after cascading
**Check:**
- Tax center allocation was properly set by regional director
- Taxpayers were selected and "Create Cases" was clicked
- Check browser console for any errors

### Issue: Cases not visible to Auditor
**Check:**
- Auditor is logged in with correct `assignedRegion` and `assignedTaxCenter`
- Cases were created with `taxCenter` and `region` matching auditor's assignment

---

## Summary

The approved plan system now properly routes:
1. **APPROVED** plans from Director
2. With `regionalAllocation` to each region
3. Broken down to 3 tax centers by Regional Director
4. Feedback provided by Tax Center Managers
5. Cases cascaded by Team Leads
6. Assigned to and worked by Auditors

All 6 audit types are supported: desk, field, joint, transfer pricing, comprehensive, and issue audits.

**Date Updated:** July 24, 2026
**Status:** ✅ Complete and Tested
