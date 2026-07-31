# FIX: Regional Directors Cannot See Allocated Plans

## Problem Statement

Regional directors login via MOR Identity API and receive an `assignedRegion` in their `org_context`. However, they cannot see plans sent to them because:

1. **Region Mismatch:** Test data `sentToRegions: ['Addis Ababa', 'Oromia']` doesn't include ALL regions where regional directors are assigned
2. **API Integration Issue:** MOR API returns regional director's assigned region, but if that region isn't in plan's `sentToRegions`, the director sees "No Plan has been received yet"
3. **Filter Logic:** `RegionalFeedbackView.jsx` filters by:
   ```javascript
   const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
   ```
   But also needs to check if plan was actually `sentToRegions`

## Root Cause

When Audit Director dispatches plans to regions:
```javascript
// Current code in DirectorView.jsx
const handleSendToRegions = (planId, selectedRegions) => {
  directorSendToRegions(planId, selectedRegions);  // ← Only sends to selected regions
}
```

If director sends to ['Addis Ababa', 'Oromia'] but Almaz Desta is assigned to 'SNNPR', then Almaz sees no plans.

**Example:**
- Regional Director assigned to: SNNPR (from MOR API)
- Plan sent to regions: ['Addis Ababa', 'Oromia']
- Plan has regionalAllocation for SNNPR: YES ✓
- Result: Almaz sees plan in dropdown BUT cannot allocate because not in `sentToRegions` ✗

## Solution

### Option A: Flexible Region Matching (RECOMMENDED)

Change filter logic to accept either:
1. Plan explicitly sent to this region (`sentToRegions.includes(region)`)
2. OR plan has allocation for this region AND status is AWAITING_REGIONAL_FEEDBACK

**Code Change in RegionalFeedbackView.jsx:**

```javascript
// BEFORE (line 60-75):
useEffect(() => {
  const data = loadData();
  const regionPlans = data.plans.filter(p => {
    const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
    const isApproved = p.status === 'APPROVED' || p.status === 'DIRECTOR_APPROVED' 
      || p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
    return hasAllocation && isApproved;  // ← Too permissive, shows all plans with allocation
  });
  setPlans(regionPlans);
}, [selectedRegion]);

// AFTER - More strict filtering:
useEffect(() => {
  const data = loadData();
  const regionPlans = data.plans.filter(p => {
    const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
    const wasSentHere = p.sentToRegions?.includes(selectedRegion);  // ← NEW CHECK
    const isApproved = p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
    
    // STRICT: Only show if both allocation AND sent to this region AND approved status
    return hasAllocation && (wasSentHere || isApproved) && isApproved;
  });
  
  console.log('RegionalFeedbackView: Filtering', {
    selectedRegion,
    totalPlans: data.plans.length,
    withAllocation: data.plans.filter(p => p.regionalAllocation?.[selectedRegion]).length,
    sentToThis: data.plans.filter(p => p.sentToRegions?.includes(selectedRegion)).length,
    result: regionPlans.length
  });
  
  setPlans(regionPlans);
}, [selectedRegion]);
```

### Option B: Relax for Development (QUICK FIX)

If using external API with unpredictable regions, temporarily relax filter:

```javascript
// Fallback: Show all plans with allocation for this region if status is awaiting feedback
const regionPlans = data.plans.filter(p => {
  const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
  const needsFeedback = p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
  
  // If plan needs feedback and has allocation for this region, show it
  // (even if not explicitly in sentToRegions - accounts for API-provided regions)
  return hasAllocation && needsFeedback;
});
```

### Option C: Sync Test Data with Possible API Regions

Update test data to include all possible regions where regional directors exist:

```javascript
// In data.js - Update both test plans:
const samplePlan = {
  id: 'AP-0001',
  status: 'FINALIZED',
  // Send to ALL regions with allocations
  sentToRegions: ['Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Somali'],  // ← ALL 5 regions
  sentToRegionsDate: new Date(Date.now() - 8*24*60*60*1000).toISOString(),
  regionFeedbackStatus: {
    'Addis Ababa': { status: 'feedback_collected', receivedDate: '...' },
    'Oromia': { status: 'feedback_collected', receivedDate: '...' },
    'Amhara': { status: 'feedback_collected', receivedDate: '...' },
    'SNNPR': { status: 'feedback_collected', receivedDate: '...' },
    'Somali': { status: 'feedback_collected', receivedDate: '...' }
  },
  // Already has regionalAllocation for all 5 regions ✓
  ...
}
```

---

## Recommended Fix (OPTION A + OPTION C)

### Step 1: Update Test Data in `data.js`

Make plans available to ALL regional directors:

```javascript
// For both samplePlan and secondPlan, update:
sentToRegions: ['Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Somali'],
regionFeedbackStatus: {
  'Addis Ababa': { status: 'feedback_collected', ... },
  'Oromia': { status: 'feedback_collected', ... },
  'Amhara': { status: 'feedback_collected', ... },
  'SNNPR': { status: 'feedback_collected', ... },
  'Somali': { status: 'feedback_collected', ... }
}
```

### Step 2: Update Filter in `RegionalFeedbackView.jsx`

Add strict sentToRegions check:

```javascript
useEffect(() => {
  const data = loadData();
  
  // Debug logging
  console.log('🔍 Loading plans for region:', selectedRegion);
  
  const regionPlans = data.plans.filter(p => {
    const hasAllocation = !!p.regionalAllocation?.[selectedRegion];
    const wasSentHere = p.sentToRegions?.includes(selectedRegion);
    const isAwaitingFeedback = p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
    
    const matches = hasAllocation && wasSentHere && isAwaitingFeedback;
    
    if (!matches && hasAllocation) {
      console.log(`Plan ${p.id}: Has allocation ✓, Sent here: ${wasSentHere}, Awaiting feedback: ${isAwaitingFeedback}`);
    }
    
    return matches;
  });
  
  console.log(`✅ RegionalFeedbackView: Found ${regionPlans.length} plans for ${selectedRegion}`);
  setPlans(regionPlans);
  
  if (regionPlans.length > 0 && !selectedPlan) {
    setSelectedPlan(regionPlans[0].id);
  }
}, [selectedRegion]);
```

### Step 3: Test the Fix

1. Clear localStorage: `localStorage.clear()`
2. Login as regional director (any region)
3. Go to RegionalDirectorView → Plan Review
4. Should see dropdown with available plans ✓

---

## How This Interacts with MOR Identity API

### Current Flow:
```
1. User logs in via MOR login page (https://mor-org-forge.lovable.app/)
2. MOR Identity API returns response with:
   {
     role: 'regional_director',
     org_context: {
       assignedRegion: 'SNNPR'  // ← From MOR system
     }
   }
3. RegionalFeedbackView gets selectedRegion from:
   userInfo?.orgContext?.assignedRegion  // ← SNNPR
4. Filters plans where regionalAllocation['SNNPR'] exists
5. But plan.sentToRegions: ['Addis Ababa', 'Oromia']
6. Result: No plans shown ✗
```

### After Fix:
```
1. Same login...
2. Same org_context.assignedRegion: 'SNNPR'
3. RegionalFeedbackView filters plans where:
   - regionalAllocation['SNNPR'] ✓
   - sentToRegions.includes('SNNPR') ✓
   - status === 'AWAITING_REGIONAL_FEEDBACK' ✓
4. Result: Plans shown ✓
```

---

## Implementation Steps

### IMMEDIATE (Fix Test Data):

Update `/src/utils/data.js`:

```javascript
// Find both samplePlan and secondPlan objects

// For samplePlan (AP-0001):
sentToRegions: ['Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Somali'],
regionFeedbackStatus: {
  'Addis Ababa': { status: 'feedback_collected', ... },
  'Oromia': { status: 'feedback_collected', ... },
  'Amhara': { status: 'feedback_collected', ... },
  'SNNPR': { status: 'feedback_collected', ... },
  'Somali': { status: 'feedback_collected', ... }
}

// For secondPlan (AP-0002):
sentToRegions: ['Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Somali'],
regionFeedbackStatus: {
  'Addis Ababa': { status: 'feedback_collected', ... },
  'Oromia': { status: 'feedback_collected', ... },
  'Amhara': { status: 'feedback_collected', ... },
  'SNNPR': { status: 'feedback_collected', ... },
  'Somali': { status: 'feedback_collected', ... }
}
```

### SHORT-TERM (Update Filter Logic):

Update `/src/components/views/RegionalFeedbackView.jsx` around line 60-75:

```javascript
useEffect(() => {
  const data = loadData();
  
  const regionPlans = data.plans.filter(p => {
    const hasAllocation = !!p.regionalAllocation?.[selectedRegion];
    const wasSentHere = p.sentToRegions?.includes(selectedRegion);
    const isAwaitingFeedback = p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
    
    return hasAllocation && wasSentHere && isAwaitingFeedback;
  });
  
  console.log('RegionalFeedbackView: Found', regionPlans.length, 'APPROVED plans for', selectedRegion);
  setPlans(regionPlans);
  
  if (regionPlans.length > 0 && !selectedPlan) {
    setSelectedPlan(regionPlans[0].id);
  }
}, [selectedRegion]);
```

### LONG-TERM (Full API Integration):

When Director sends plans:
```javascript
// DirectorView.jsx - Add all regions by default
const handleSendToRegions = (planId, selectedRegions) => {
  // If no regions selected, send to ALL regions with allocations
  const targetRegions = selectedRegions || 
    Object.keys(directorsPlans[planId]?.regionalAllocation || {});
  
  directorSendToRegions(planId, targetRegions);
}
```

---

## Verification Checklist

- [ ] Test data updated: sentToRegions includes all 5 regions
- [ ] Test data updated: regionFeedbackStatus has entry for all 5 regions  
- [ ] RegionalFeedbackView checks `sentToRegions.includes(selectedRegion)`
- [ ] Console logs show region matching logic
- [ ] Regional director can see plans for ANY assigned region
- [ ] Regional director can allocate to tax centers
- [ ] Regional director can submit feedback

---

## Testing After Fix

### Test 1: Regional Director for SNNPR
1. Login as regional director for SNNPR
2. Go to RegionalDirectorView
3. Sidebar shows SNNPR region
4. Should see plan dropdown with "AP-0001" and "AP-0002"
5. Click on plan → should show allocation breakdown
6. Click "Allocate to Tax Centers" → should proceed ✓

### Test 2: Regional Director for Oromia
1. Login as regional director for Oromia
2. Same flow as above but for Oromia
3. Should see same plans ✓

### Test 3: All Regional Directors
Repeat for: Addis Ababa, Amhara, Somali

---

## Related Files

- `/src/utils/data.js` - Test data with sentToRegions
- `/src/components/views/RegionalFeedbackView.jsx` - Filter logic
- `/src/services/morIdentityAPI.js` - API that provides assignedRegion
- `/src/context/AuthContext.jsx` - Stores org_context from login

---

## Key Insight

**The Fix:** Regional directors must be able to see plans that:
1. Have a regionalAllocation for their assigned region ✓
2. Were explicitly sent to their region (`sentToRegions`) ✓
3. Are in AWAITING_REGIONAL_FEEDBACK status ✓

**Without** all three conditions, they see "No Plan has been received yet"
