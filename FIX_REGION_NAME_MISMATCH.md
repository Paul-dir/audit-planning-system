# FIX: Region Name Case Mismatch - "addis_ababa" vs "Addis Ababa"

## Problem

Regional director sees plans in "Plan Review" but when clicking "Allocate to Tax Centers", sees:
```
❌ No Plan Available
No plan found with regional allocation for addis_ababa
```

Even though plans exist with allocation for that region!

## Root Cause: Case Mismatch

### Test Data (data.js)
```javascript
regionalAllocation: {
  'Addis Ababa': { desk: 50, field: 30, ... },    // ← TITLECASE
  'Oromia': { desk: 60, field: 40, ... },          // ← TITLECASE
  'Amhara': { desk: 40, field: 25, ... },          // ← TITLECASE
  // ...
}
```

### MOR Identity API Response
```javascript
org_context: {
  assignedRegion: 'addis_ababa'    // ← LOWERCASE_UNDERSCORE (from MOR system)
}
```

### TaxCenterAllocationView Filter
```javascript
const planWithAllocation = plans.find(p => 
  p.regionalAllocation && p.regionalAllocation[selectedRegion]  // ← selectedRegion = 'addis_ababa'
);
// Looks for: regionalAllocation['addis_ababa']
// But test data has: regionalAllocation['Addis Ababa']
// Result: NO MATCH ✗
```

## The Workflow Break

```
1. Regional Director logs in via MOR
   - MOR returns: org_context.assignedRegion = 'addis_ababa'
   
2. Goes to RegionalFeedbackView
   - Uses filter: sentToRegions.includes(selectedRegion)
   - But RegionalFeedbackView ALSO normalizes or converts regions somewhere
   - OR displayes different region name than what MOR returned
   
3. Clicks "Allocate to Tax Centers" 
   - Routed to TaxCenterAllocationView
   - TaxCenterAllocationView tries: regionalAllocation['addis_ababa']
   - But data has: regionalAllocation['Addis Ababa']
   - NO MATCH ✗ → Shows "No Plan Available"
```

## Solutions

### SOLUTION 1: Normalize All Regions to Titlecase (RECOMMENDED)

Create a utility function to normalize region names:

```javascript
// utils/regionNormalizer.js
export const normalizeRegionName = (region) => {
  if (!region) return region;
  
  // Convert 'addis_ababa' → 'Addis Ababa'
  return region
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const denormalizeRegionName = (region) => {
  if (!region) return region;
  
  // Convert 'Addis Ababa' → 'addis_ababa'
  return region.toLowerCase().replace(/\s+/g, '_');
};

// Usage in TaxCenterAllocationView:
import { normalizeRegionName } from '../../utils/regionNormalizer';

const normalizedRegion = normalizeRegionName(selectedRegion);
const planWithAllocation = plans.find(p => 
  p.regionalAllocation && p.regionalAllocation[normalizedRegion]
);
```

### SOLUTION 2: Store All Regions in Consistent Format

Update test data to use lowercase_underscore format everywhere:

```javascript
// data.js
regionalAllocation: {
  'addis_ababa': { desk: 50, field: 30, ... },
  'oromia': { desk: 60, field: 40, ... },
  'amhara': { desk: 40, field: 25, ... },
  // ...
}

sentToRegions: ['addis_ababa', 'oromia', 'amhara', 'snnpr', 'somali'],

regionFeedbackStatus: {
  'addis_ababa': { status: 'feedback_collected', ... },
  'oromia': { status: 'feedback_collected', ... },
  // ...
}
```

Then update views to display titlecase but store lowercase:

```javascript
const displayRegionName = (region) => {
  return region
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

// In JSX:
<p>Region: {displayRegionName(selectedRegion)}</p>
```

### SOLUTION 3: Normalize in Each View

Add normalization to every view that uses region:

```javascript
// RegionalFeedbackView.jsx
const normalizedRegion = normalizeRegionName(selectedRegion);
const regionPlans = data.plans.filter(p => {
  const hasAllocation = !!p.regionalAllocation?.[normalizedRegion];
  const wasSentHere = p.sentToRegions?.includes(normalizedRegion);
  const isApproved = p.status === 'AWAITING_REGIONAL_FEEDBACK';
  return hasAllocation && wasSentHere && isApproved;
});

// TaxCenterAllocationView.jsx
const normalizedRegion = normalizeRegionName(selectedRegion);
const planWithAllocation = plans.find(p => 
  p.regionalAllocation && p.regionalAllocation[normalizedRegion]
);
```

## Recommended Fix: SOLUTION 1 + Test Data Update

### STEP 1: Create Region Normalizer Utility

Create `/src/utils/regionNormalizer.js`:

```javascript
/**
 * Region name normalization utilities
 * Handles conversion between different region name formats
 * 
 * Formats:
 * - API format: 'addis_ababa' (lowercase_underscore from MOR Identity API)
 * - Display format: 'Addis Ababa' (titlecase for UI)
 */

export const normalizeRegionName = (region) => {
  if (!region) return region;
  
  // If already titlecase with spaces, return as-is
  if (region.includes(' ')) {
    return region;
  }
  
  // Convert lowercase_underscore to Titlecase
  // 'addis_ababa' → 'Addis Ababa'
  // 'snnpr' → 'Snnpr' (handle special cases separately)
  
  const specialCases = {
    'snnpr': 'SNNPR',
    'dire_dawa': 'Dire Dawa',
    'dire dawa': 'Dire Dawa'
  };
  
  if (specialCases[region.toLowerCase()]) {
    return specialCases[region.toLowerCase()];
  }
  
  return region
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export const denormalizeRegionName = (region) => {
  if (!region) return region;
  
  // If already lowercase_underscore, return as-is
  if (region.includes('_')) {
    return region;
  }
  
  // Convert titlecase to lowercase_underscore
  // 'Addis Ababa' → 'addis_ababa'
  // 'SNNPR' → 'snnpr'
  
  const specialCases = {
    'snnpr': 'snnpr',
    'dire dawa': 'dire_dawa'
  };
  
  const lower = region.toLowerCase();
  if (specialCases[lower]) {
    return specialCases[lower];
  }
  
  return region.toLowerCase().replace(/\s+/g, '_');
};

export const getDisplayRegionName = (region) => {
  return normalizeRegionName(region);
};

export const getApiRegionName = (region) => {
  return denormalizeRegionName(region);
};
```

### STEP 2: Update Test Data (data.js)

Change ALL region keys to match MOR API format (lowercase_underscore):

```javascript
// Before:
regionalAllocation: {
  'Addis Ababa': { desk: 50, ... },
  'Oromia': { desk: 60, ... },
  // ...
}

// After:
regionalAllocation: {
  'addis_ababa': { desk: 50, ... },
  'oromia': { desk: 60, ... },
  'amhara': { desk: 40, ... },
  'snnpr': { desk: 35, ... },
  'somali': { desk: 25, ... }
}

sentToRegions: ['addis_ababa', 'oromia', 'amhara', 'snnpr', 'somali'],

regionFeedbackStatus: {
  'addis_ababa': { status: 'feedback_collected', ... },
  'oromia': { status: 'feedback_collected', ... },
  // ... etc
}
```

### STEP 3: Update Views to Display Titlecase

**RegionalFeedbackView.jsx:**
```javascript
import { getDisplayRegionName } from '../../utils/regionNormalizer';

// In render:
<h2>Regional Director - {getDisplayRegionName(selectedRegion)}</h2>
<Card title="Region" number={getDisplayRegionName(selectedRegion)} />
```

**TaxCenterAllocationView.jsx:**
```javascript
import { getDisplayRegionName } from '../../utils/regionNormalizer';

// In render:
<p>Allocate to Tax Centers in {getDisplayRegionName(selectedRegion)}</p>
```

**RegionalDirectorView.jsx:**
```javascript
import { getDisplayRegionName } from '../../utils/regionNormalizer';

// In select label:
<option value={region}>{getDisplayRegionName(region)}</option>
```

## Impact Analysis

### Files to Update

1. **Create:** `/src/utils/regionNormalizer.js` (new file)
2. **Update:** `/src/utils/data.js`
   - All `regionalAllocation` keys
   - All `sentToRegions` values
   - All `regionFeedbackStatus` keys
   - All `submittedToTaxCenters` keys
   - All `taxCenterAllocations` keys
   - All `taxCenterAcceptance` keys

3. **Update:** Views that display regions
   - `/src/components/views/RegionalFeedbackView.jsx`
   - `/src/components/views/TaxCenterAllocationView.jsx`
   - `/src/components/views/RegionalPlanSubmissionView.jsx`
   - `/src/components/roleViews/RegionalDirectorView.jsx`

### Backward Compatibility

- ✓ Views normalize input (so either format works)
- ✓ Data storage consistent (lowercase_underscore from API)
- ✓ Display layer shows titlecase (for UI)
- ✓ Old data (if any) will still work

### Benefits

1. **Eliminates case mismatch errors** - API format matches storage format
2. **Consistent with external API** - MOR Identity API uses lowercase_underscore
3. **Display layer separate from storage** - UI can show any format
4. **Easier debugging** - All internal data uses same format

## Testing After Fix

### Test Case 1: Region Normalization
```javascript
import { normalizeRegionName } from 'utils/regionNormalizer';

console.log(normalizeRegionName('addis_ababa'));  // 'Addis Ababa'
console.log(normalizeRegionName('Addis Ababa'));  // 'Addis Ababa'
console.log(normalizeRegionName('snnpr'));        // 'SNNPR'
```

### Test Case 2: Regional Director Workflow
```
1. Login as regional director
   - MOR returns: assignedRegion = 'addis_ababa'
   
2. Go to RegionalDirectorView
   - Dropdown shows: 'Addis Ababa' (normalized for display)
   - Internal value: 'addis_ababa'
   
3. Click "Plan Review"
   - RegionalFeedbackView loads
   - Filter checks: regionalAllocation['addis_ababa'] ✓
   
4. Select plan → Click "Allocate"
   - TaxCenterAllocationView loads
   - Filter checks: regionalAllocation['addis_ababa'] ✓
   - Allocation shows for this region ✓
```

### Test Case 3: All Regions
```
Repeat workflow for all 5 regions:
- addis_ababa → Addis Ababa ✓
- oromia → Oromia ✓
- amhara → Amhara ✓
- snnpr → SNNPR ✓
- somali → Somali ✓
```

## Migration Checklist

- [ ] Create `/src/utils/regionNormalizer.js`
- [ ] Test normalization functions
- [ ] Update test data in `data.js`:
  - [ ] regionalAllocation keys
  - [ ] sentToRegions array
  - [ ] regionFeedbackStatus keys
  - [ ] submittedToTaxCenters keys
  - [ ] taxCenterAllocations keys
  - [ ] taxCenterAcceptance keys
- [ ] Update RegionalFeedbackView (use getDisplayRegionName)
- [ ] Update TaxCenterAllocationView (no changes needed, uses selectedRegion from prop)
- [ ] Update RegionalPlanSubmissionView (use getDisplayRegionName)
- [ ] Test with regional director login
- [ ] Test allocation workflow
- [ ] Test all 5 regions

## Key Insight

**The Issue:** Region names from external API don't match internal test data format
**The Solution:** Normalize to API format internally, display titlecase in UI
**The Benefit:** Single source of truth for region data, eliminates case-sensitivity bugs

---

**Status:** Ready to implement
**Priority:** HIGH - Blocks regional director workflow
**Effort:** 2-3 hours (mostly find-replace in data.js)
**Risk:** Low - only affects region name handling, no business logic changes
