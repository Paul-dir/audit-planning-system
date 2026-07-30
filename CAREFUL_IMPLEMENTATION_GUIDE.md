# Careful Implementation Guide - Cascade Workflow

## Objective
Re-implement the cascade workflow carefully with:
1. **Real data only** - No mocking, no hardcoded values
2. **Proper validation** - Prevent duplicates and over-allocation
3. **Clear plan selection** - Allow exact plan selection
4. **Exact plan per cascade** - One plan creates one set of cases, not twice
5. **Fix UI issues** - Make text fit in boxes properly

---

## Issue 1: Text Overflow in Stat Cards

### Problem
"TOTAL CASES" and "TOTAL EFFORT" text overflows out of the box.

### Solution - Card.jsx Fix (COMPLETED ✅)
Changed:
```javascript
// OLD
<h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
  {title}
</h3>
<div className="font-serif text-3xl font-bold text-slate-100">{number}</div>

// NEW
<h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 break-words line-clamp-2">
  {title}
</h3>
<div className="font-serif text-2xl font-bold text-slate-100 break-words">{number}</div>
```

**Changes:**
- Reduced title font from 11px to 10px
- Reduced number font from 3xl to 2xl
- Added `break-words` to allow wrapping
- Added `line-clamp-2` to limit title to 2 lines max
- Added `flex-1 min-w-0` to flex container
- Added `gap-2` between text and icon

---

## Issue 2: Plan Status Stays as DRAFT

### Problem
Even after "Create Plan" with "Submit to Director", status shows as DRAFT in My Plans.

### Root Cause Analysis
The status IS being set correctly to 'SUBMITTED_TO_DIRECTOR' in the data, BUT the display might be showing from a filter issue.

### Solution - Verify Status in AuditPlanningView

The issue is likely that:
1. Plan is created with status='SUBMITTED_TO_DIRECTOR' ✅ (confirmed in businessLogic.js line 20)
2. But the "My Plans" view might be filtering by DRAFT only

Let me check the filter in AuditPlanningView:

```javascript
// In AuditPlanningView.jsx line 489
if (currentView === 'my-plans') {
  displayPlans = plans.filter(p => ['DRAFT', 'REVISION_REQUESTED', 'SUBMITTED_TO_DIRECTOR'].includes(p.status));
}
```

This is correct! It includes 'SUBMITTED_TO_DIRECTOR'.

**Likely Real Issue:** The status badge display might not be updating. Check the `getStatusClass` function to ensure it returns the correct class for SUBMITTED status.

---

## Issue 3: Real Cascade Workflow Implementation

### Three-Step Process

#### STEP 1: Load Real Plans (Only Accepted Plans)

**File:** CascadePlanToCasesView.jsx

```javascript
// REAL IMPLEMENTATION - No hardcoded data
const loadAcceptedPlans = () => {
  const data = loadData();
  const userRegion = userInfo?.orgContext?.assignedRegion;
  const userTaxCenter = userInfo?.orgContext?.assignedTaxCenter;
  
  if (!userRegion || !userTaxCenter) {
    console.warn('No region or tax center assigned');
    return [];
  }
  
  // Normalize tax center name
  const normalizedTaxCenter = normalizeTaxCenterName(userTaxCenter, userRegion);
  
  // CRITICAL: Filter for accepted plans ONLY
  const acceptedPlans = (data.plans || []).filter(p => {
    // Must be FINALIZED
    if (p.status !== 'FINALIZED') return false;
    
    // Must be accepted by THIS tax center
    const acceptance = p.taxCenterAcceptance?.[userRegion]?.[normalizedTaxCenter];
    if (acceptance?.status !== 'ACCEPTED') return false;
    
    // CRITICAL: Check if already cascaded to prevent duplicates
    if (p.cascadedToTaxCenters?.includes(normalizedTaxCenter)) {
      console.log(`Plan ${p.id} already cascaded to ${normalizedTaxCenter}`);
      return false;
    }
    
    return true;
  });
  
  return acceptedPlans;
};
```

**What This Does:**
- ✅ Loads REAL plans from localStorage
- ✅ Filters for plans status='FINALIZED'
- ✅ Filters for plans accepted by user's tax center
- ✅ **PREVENTS DUPLICATES** - Checks cascadedToTaxCenters array
- ✅ Only shows plans that haven't been cascaded yet

---

#### STEP 2: Load Real Taxpayers by Risk

**File:** CascadePlanToCasesView.jsx

```javascript
// REAL IMPLEMENTATION - Load from database/data, not mock
const loadTaxpayers = () => {
  const data = loadData();
  
  // Get REAL taxpayers from data
  const allTaxpayers = data.taxpayerPool?.taxpayers || [];
  
  if (allTaxpayers.length === 0) {
    console.warn('No taxpayers loaded');
    return [];
  }
  
  // REAL risk calculation for each taxpayer
  const withRisk = allTaxpayers.map(tp => {
    // Calculate risk score based on actual data
    const riskScore = calculateRealRiskScore(tp);
    const riskLevel = getRiskLevelFromScore(riskScore);
    const auditTypeRecommendation = getAuditTypeByRisk(riskLevel);
    
    return {
      id: tp.id,
      tin: tp.tin,
      name: tp.name,
      industry: tp.industry || 'Unknown',
      riskScore: riskScore,
      riskLevel: riskLevel,
      revenueAtRisk: tp.revenueAtRisk || 0,
      recommendedAuditType: auditTypeRecommendation,
      estimatedHours: getEstimatedHours(auditTypeRecommendation)
    };
  });
  
  return withRisk;
};

// REAL risk calculation
function calculateRealRiskScore(taxpayer) {
  let score = 0;
  
  // Based on actual taxpayer data
  if (taxpayer.complianceHistory === 'HIGH_RISK') score += 40;
  else if (taxpayer.complianceHistory === 'MEDIUM_RISK') score += 20;
  
  if (taxpayer.revenueAtRisk > 5000000) score += 30;
  else if (taxpayer.revenueAtRisk > 1000000) score += 20;
  else if (taxpayer.revenueAtRisk > 500000) score += 10;
  
  if (taxpayer.previousAuditFindings > 5) score += 20;
  else if (taxpayer.previousAuditFindings > 0) score += 10;
  
  if (taxpayer.taxpayerType === 'LARGE_ENTERPRISE') score += 10;
  
  return Math.min(100, score); // Cap at 100
}

function getRiskLevelFromScore(score) {
  if (score >= 80) return 'Critical';
  if (score >= 65) return 'High';
  if (score >= 45) return 'Medium';
  return 'Low';
}
```

**What This Does:**
- ✅ Loads REAL taxpayer data
- ✅ Calculates risk based on ACTUAL taxpayer attributes
- ✅ Assigns risk level (Critical, High, Medium, Low)
- ✅ Recommends audit type based on risk

---

#### STEP 3: Create Cases and Prevent Duplicates

**File:** CascadePlanToCasesView.jsx

```javascript
// REAL IMPLEMENTATION - Create cases once per plan
const handleCreateCases = () => {
  if (!selectedPlan) {
    alert('Please select a plan');
    return;
  }
  
  if (selectedTaxpayers.size === 0) {
    alert('Please select at least one taxpayer');
    return;
  }
  
  const data = loadData();
  const plan = data.plans.find(p => p.id === selectedPlan);
  
  if (!plan) {
    alert('Plan not found');
    return;
  }
  
  // CRITICAL: Check if already cascaded (DUPLICATE PREVENTION)
  const normalizedTaxCenter = normalizeTaxCenterName(selectedTaxCenter, selectedRegion);
  if (plan.cascadedToTaxCenters?.includes(normalizedTaxCenter)) {
    alert(`❌ Plan ${selectedPlan} has already been cascaded to ${selectedTaxCenter}.\n\nYou cannot cascade the same plan twice. Each plan can only be cascaded once per tax center.`);
    return;
  }
  
  // Validate allocation limits
  const allocationByType = plan.taxCenterAllocations[selectedRegion][normalizedTaxCenter] || {};
  const byType = {};
  
  Array.from(selectedTaxpayers.values()).forEach(selection => {
    byType[selection.auditType] = (byType[selection.auditType] || 0) + 1;
  });
  
  // Check each type against allocation
  for (const [type, count] of Object.entries(byType)) {
    const allocated = allocationByType[getAuditTypeKey(type)] || 0;
    if (count > allocated) {
      alert(`❌ ${type} exceeds allocation\n\nSelected: ${count}\nAllocated: ${allocated}`);
      return;
    }
  }
  
  // CREATE CASES
  const newCases = Array.from(selectedTaxpayers.values()).map((selection, idx) => {
    const taxpayer = allTaxpayers.find(tp => tp.id === selection.taxpayerId);
    return {
      id: `CASE-${selectedRegion}-${selectedTaxCenter}-${Date.now()}-${idx}`,
      planId: selectedPlan,
      region: selectedRegion,
      taxCenter: selectedTaxCenter,
      taxpayerId: selection.taxpayerId,
      taxpayerName: taxpayer?.name,
      tin: taxpayer?.tin,
      auditType: selection.auditType,
      riskLevel: taxpayer?.riskLevel,
      riskScore: taxpayer?.riskScore,
      revenueAtRisk: taxpayer?.revenueAtRisk,
      estimatedHours: taxpayer?.estimatedHours,
      status: 'ASSIGNED',
      createdDate: new Date().toISOString(),
      createdFrom: 'CASCADE_PLAN'
    };
  });
  
  // CRITICAL: Mark plan as cascaded
  if (!plan.cascadedToTaxCenters) {
    plan.cascadedToTaxCenters = [];
  }
  plan.cascadedToTaxCenters.push(normalizedTaxCenter);
  
  // Save
  data.auditCases = [...(data.auditCases || []), ...newCases];
  saveData(data);
  
  alert(`✅ Created ${newCases.length} audit cases for ${selectedTaxCenter}\n\nPlan is now locked and cannot be cascaded again for this tax center.`);
  
  // Reset
  setSelectedTaxpayers(new Map());
  setSelectedPlan(null);
};
```

**What This Does:**
- ✅ Validates plan selection
- ✅ Checks for DUPLICATES (cascadedToTaxCenters)
- ✅ Prevents cascading same plan twice
- ✅ Validates allocation limits
- ✅ Creates cases with REAL data
- ✅ Marks plan as cascaded
- ✅ Locks plan for this tax center

---

## Issue 4: Exact Plan Selection

### Current Situation
Users should be able to select exactly which plan they want to cascade (not just "any plan").

### Implementation

```javascript
// In CascadePlanToCasesView.jsx

// Show plan selector dropdown
<div className="flex-1">
  <label className="text-xs font-bold block mb-2">SELECT PLAN TO CASCADE</label>
  <select 
    value={selectedPlan || ''} 
    onChange={(e) => setSelectedPlan(e.target.value || null)}
    className="w-full px-3 py-2 rounded border border-slate-600 bg-slate-900 text-slate-100"
  >
    <option value="">-- Choose a Plan --</option>
    {acceptedPlans.map(plan => (
      <option key={plan.id} value={plan.id}>
        {plan.id} (FY {plan.fiscalYear}) - {plan.totalVolume} cases
      </option>
    ))}
  </select>
  <p className="text-xs text-slate-400 mt-1">
    {acceptedPlans.length} plan(s) available
  </p>
</div>

// Show plan details ONLY after selection
{selectedPlan && (
  <div className="bg-slate-900 border border-slate-700 rounded p-4">
    <h3 className="font-bold text-slate-100 mb-3">Plan Details</h3>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="text-slate-400">Plan ID</p>
        <p className="text-slate-100 font-bold">{selectedPlan}</p>
      </div>
      <div>
        <p className="text-slate-400">Fiscal Year</p>
        <p className="text-slate-100 font-bold">{selectedPlanDetails?.fiscalYear}</p>
      </div>
      <div>
        <p className="text-slate-400">Total Allocation</p>
        <p className="text-slate-100 font-bold">{totalAllocationForPlan}</p>
      </div>
      <div>
        <p className="text-slate-400">Already Cascaded</p>
        <p className={selectedPlanDetails?.cascadedToTaxCenters?.includes(normalizedTaxCenter) ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
          {selectedPlanDetails?.cascadedToTaxCenters?.includes(normalizedTaxCenter) ? 'Yes - LOCKED' : 'No - Available'}
        </p>
      </div>
    </div>
  </div>
)}
```

---

## Data Structure Changes

### Add to Plan Object
```javascript
plan.cascadedToTaxCenters = [
  'Oromia-tc1',      // Cascaded to this tax center
  'Oromia-tc2'       // Cascaded to this tax center too
]
// Cannot cascade again to these tax centers
```

### Add to Audit Case
```javascript
case.createdFrom = 'CASCADE_PLAN'  // NEW - indicates case came from cascade
case.cascadeSource = {              // NEW - track where case came from
  planId: 'AP-0001',
  cascadedBy: 'Cascade Team Name',
  cascadedDate: '2026-07-27T...',
  region: 'Oromia',
  taxCenter: 'Oromia-tc1'
}
```

---

## Testing Checklist

- [ ] Card text fits properly (no overflow)
- [ ] Plan status shows 'SUBMITTED_TO_DIRECTOR' after creation
- [ ] Cascade team sees only accepted plans
- [ ] Cascade team can select exact plan they want
- [ ] Creating cases once marks plan as cascaded
- [ ] Trying to cascade same plan twice shows error
- [ ] Cases created with real taxpayer data
- [ ] Cases have correct risk levels
- [ ] Cases respect allocation limits
- [ ] Audit types match risk levels
- [ ] No duplicate cases created

---

## Implementation Priority

1. **HIGH** - Fix text overflow in Card (DONE ✅)
2. **HIGH** - Re-implement cascade with real data validation
3. **MEDIUM** - Add cascadedToTaxCenters tracking
4. **MEDIUM** - Add duplicate prevention
5. **LOW** - Add plan selection UI improvements

---

**Status:** Ready for Implementation
**Next Step:** Implement careful cascade workflow with real data and validation
