# COMPLETE PLAN ROUTING FLOW - FROM TOP TO BOTTOM (SIMPLIFIED)

## LEVEL 1: DIRECTOR (DirectorView.jsx)
**Action:** Finalize and send to regions
**Status Change:** `SENIOR_MANAGEMENT_APPROVED` → `FINALIZED`
**Data Set:**
```javascript
plan.status = 'FINALIZED';
plan.sentToRegions = allRegions;
plan.sentToRegionsDate = new Date().toISOString();
```

## LEVEL 2: REGIONAL DIRECTOR (RegionalPlanSubmissionView.jsx)
**Action:** Submit to selected tax centers
**Filter:** Plans with:
- `status === 'FINALIZED'`
- Has allocation for this region (in `regionalAllocation` or `allocations` array)

**Data Set:**
```javascript
plan.submittedToTaxCenters[selectedRegion] = {
  status: 'SUBMITTED',
  submittedBy: 'Regional Director',
  submittedDate: new Date().toISOString(),
  taxCentersInRegion: selectedTaxCenters, // e.g., ['Addis Ababa-tc1', 'Addis Ababa-tc2']
  readyForAcceptance: true
};
```

## LEVEL 3: TAX CENTER MANAGER (TaxCenterAcceptancePlanView.jsx)
**Action:** Accept plan
**Filter:** Plans with:
- `status === 'FINALIZED'`
- `submittedToTaxCenters[region].status === 'SUBMITTED'`
- THIS tax center is in `submittedToTaxCenters[region].taxCentersInRegion` array

**Data Set:**
```javascript
plan.taxCenterAcceptance[region][taxCenterName] = {
  status: 'ACCEPTED',
  taxCenter: taxCenterName,
  region: region,
  acceptedBy: 'Tax Center Manager',
  acceptedDate: new Date().toISOString(),
  readyForExecution: true
};
```

## LEVEL 4: CASCADE TEAM (CascadePlanToCasesView.jsx)
**Action:** Create audit cases from plan
**Filter:** Plans with:
- `status === 'FINALIZED'`
- `taxCenterAcceptance[region][taxCenter].status === 'ACCEPTED'`

**Data Used:**
- Plan allocations by audit type
- Tax center specific allocation
- Creates individual audit cases

---

## SIMPLIFIED WORKFLOW (3 STEPS)

1. **Director** → Finalize Plan → Sets `status = 'FINALIZED'`
2. **Regional Director** → Select Tax Centers → Sets `submittedToTaxCenters[region]` with list
3. **Tax Center Manager** → Accept Plan → Sets `taxCenterAcceptance[region][taxCenter]`
4. **Cascade Team** → Create Cases → Uses accepted plans

**REMOVED:** Regional Acknowledgment step (unnecessary complexity)

---

## KEY FEATURES:

### ✅ Works for Existing Plans
- Any plan with `status === 'FINALIZED'` appears in Regional view
- No need to update old plans - they work immediately

### ✅ Works for New Plans
- New plans follow same 3-step workflow
- Consistent status transitions

### ✅ Multi-Tax-Center Support
- Regional Director selects which tax centers get the plan
- Each tax center sees only plans sent to them
- Each tax center accepts independently

### ✅ Data Integrity
- No status conflicts
- Each level checks previous level completed
- Complete audit trail with timestamps
