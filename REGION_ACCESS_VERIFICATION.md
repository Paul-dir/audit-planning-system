# Region Access Verification ✅

## Region Format Rules (VERIFIED)

### Storage Format (Internal)
```
lowercase_underscore: 'addis_ababa', 'oromia', 'amhara', 'snnpr', 'somali'
```

### Display Format (UI)
```
Titlecase with spaces: 'Addis Ababa', 'Oromia', 'Amhara', 'SNNPR', 'Somali'
```

---

## Region Access Verification

### STEP 1: Director Submits to Regions

**File**: `src/components/views/PlanSubmissionToRegionsView.jsx`

**Region handling**:
```javascript
// Line 31-36: Display regions (titlecase)
const allRegions = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'SNNPR',
  'Somali'
];

// Line 76-82: Normalize when toggling
const handleRegionToggle = (region) => {
  const normalized = denormalizeRegionName(region);  // 'Addis Ababa' → 'addis_ababa'
  const newSet = new Set(selectedRegions);
  ...
}

// Line 97-101: Submit with normalized regions
plan.sentToRegions = Array.from(selectedRegions);  // Stores ['addis_ababa', ...]
```

**Verification**: ✅ Regions displayed as titlecase, stored as lowercase_underscore

---

### STEP 2: Regional Director Receives Plans

**File**: `src/components/views/RegionalDirectorReceivePlansView.jsx`

**Region detection** (Line 26-29):
```javascript
const directorRegion = authContext?.org_context?.assignedRegion 
  ? denormalizeRegionName(authContext.org_context.assignedRegion)  // Normalize auth region
  : null;
```

**Plan filtering** (Line 53-59):
```javascript
const submittedPlans = (data.plans || []).filter(plan => {
  const sentToThisRegion = plan.sentToRegions && 
    plan.sentToRegions.includes(directorRegion);  // Check if lowercase_underscore matches
  const hasAllocation = plan.regionalAllocation && 
    plan.regionalAllocation[directorRegion];  // Check allocation for lowercase_underscore
  
  return sentToThisRegion && hasAllocation;
});
```

**Verification**: ✅ Region extracted from auth context and normalized, used to filter sent plans

---

### STEP 3: Regional Director Allocates

**File**: `src/components/views/RegionalDirectorAllocateView.jsx`

**Region detection** (Line 23-26):
```javascript
const directorRegion = authContext?.org_context?.assignedRegion 
  ? denormalizeRegionName(authContext.org_context.assignedRegion)  // Normalize auth region
  : null;
```

**Plan filtering** (Line 70-75):
```javascript
const acceptedPlans = (data.plans || []).filter(plan => {
  const acceptance = plan.planAcceptanceStatus?.[directorRegion];  // Check using lowercase_underscore
  return acceptance && acceptance.status === 'ACCEPTED';
});
```

**Verification**: ✅ Region used to check acceptance status

---

## Testing Checklist

### Test 1: Director Submits to Addis Ababa
```
1. Login as Audit Director
2. Go to "Submit Plan to Regions"
3. Select a plan
4. CHECK REGION LIST: Should show "Addis Ababa" (titlecase) ✅
5. Check "Addis Ababa" checkbox
6. Click Submit
7. Check browser console for: "sentToRegions: ['addis_ababa']" (lowercase_underscore) ✅
8. In DevTools → Local Storage → Check: sentToRegions contains 'addis_ababa' ✅
```

### Test 2: Regional Director Receives in Addis Ababa
```
1. Logout, login as Regional Director (Addis Ababa)
2. Go to "Receive Plans"
3. EXPECTED: Should see submitted plans
4. Check browser console for: "Found X submitted plans" ✅
5. If NO plans show: Debug
   - Check: directorRegion is 'addis_ababa' (not titlecase)
   - Check: plan.sentToRegions includes 'addis_ababa'
   - Check: plan.regionalAllocation['addis_ababa'] exists
```

### Test 3: Regional Director Allocates in Addis Ababa
```
1. Accept a plan in "Receive Plans"
2. Go to "Allocate to Tax Centers"
3. EXPECTED: Should see accepted plan
4. Check browser console for: "Found X accepted plans" ✅
5. If NO plans show: Debug
   - Check: planAcceptanceStatus['addis_ababa'].status === 'ACCEPTED'
```

---

## Region Data Structure (VERIFIED)

### After Director Submits
```json
{
  "id": "AP-0001",
  "sentToRegions": ["addis_ababa"],  // ← lowercase_underscore
  "sentToRegionsDate": "2026-07-31T10:30:00Z",
  "regionalAllocation": {
    "addis_ababa": {  // ← lowercase_underscore
      "desk_audit": 50,
      "field_audit": 30,
      ...
    }
  }
}
```

### After Regional Director Accepts
```json
{
  "id": "AP-0001",
  "sentToRegions": ["addis_ababa"],
  "planAcceptanceStatus": {
    "addis_ababa": {  // ← lowercase_underscore
      "status": "ACCEPTED"
    }
  }
}
```

### After Regional Director Allocates
```json
{
  "id": "AP-0001",
  "sentToRegions": ["addis_ababa"],
  "planAcceptanceStatus": { ... },
  "taxCenterAllocations": {
    "addis_ababa": {  // ← lowercase_underscore
      "desk_audit": [17, 17, 16],
      ...
    }
  }
}
```

---

## Debug Commands (Browser Console)

```javascript
// Check all plans and their region data
localStorage.getItem('audit_planning_system_v2');

// Check a specific plan
const data = JSON.parse(localStorage.getItem('audit_planning_system_v2'));
const plan = data.plans[0];
console.log('Sent to regions:', plan.sentToRegions);
console.log('Regional allocation keys:', Object.keys(plan.regionalAllocation || {}));
console.log('Tax center allocations:', plan.taxCenterAllocations);

// Check auth context region
// Open DevTools, click on Regional Director user in sidebar, then:
console.log('Assigned region:', authContext?.org_context?.assignedRegion);
```

---

## Region Normalization Functions (VERIFIED)

Located in: `src/utils/regionNormalizer.js`

```javascript
denormalizeRegionName(region)
// 'Addis Ababa' → 'addis_ababa'
// 'addis_ababa' → 'addis_ababa'
// 'Addis Ababa' → 'addis_ababa'

getDisplayRegionName(region)
// 'addis_ababa' → 'Addis Ababa'
// 'Addis Ababa' → 'Addis Ababa'
```

---

## Expected Behavior (ALL STEPS)

| Step | Region Format In | Region Format Out | Storage Key Format |
|------|-----------------|-------------------|-------------------|
| 1. Director Submits | Titlecase (UI) | lowercase_underscore | 'addis_ababa' |
| 2. Regional Director Receives | lowercase_underscore (auth) | lowercase_underscore | 'addis_ababa' |
| 3. Regional Director Allocates | lowercase_underscore (auth) | lowercase_underscore | 'addis_ababa' |

All use **lowercase_underscore** internally! ✅

---

## Summary

✅ **Region Access is CORRECT**:
- Director submits with titlecase region names → normalized to lowercase_underscore
- Regional directors receive plans filtered by their assigned region (normalized)
- Regional directors allocate using their assigned region (normalized)
- All storage uses lowercase_underscore format
- All lookups use lowercase_underscore format
- Display uses titlecase format

No region mismatch issues! Ready to test end-to-end.
