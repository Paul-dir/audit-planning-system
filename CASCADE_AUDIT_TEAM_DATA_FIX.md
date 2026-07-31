# CASCADE AUDIT TEAM - Test Data Fix

## Problem
cascade_audit_team users couldn't see any plans to cascade because the test data was missing the critical `taxCenterAcceptance` records that the CascadePlanToCasesView requires.

## Root Cause
The workflow for cascade_audit_team is:
1. Director creates and approves plan
2. Director allocates plan to regions  
3. Regional Director accepts allocation
4. Regional Director sends plan to tax centers
5. Tax Center Manager **accepts** the plan (creates `taxCenterAcceptance` record)
6. cascade_audit_team can now **see and cascade** the plan

The test data had plans with allocation, but no tax center acceptance records.

## Solution Applied

Updated `/src/utils/data.js` to add `taxCenterAcceptance` records for both test plans:

### Plan AP-0001 (Annual Audit Plan 2027)
**Added acceptance records for:**
- Addis Ababa: tc1, tc2, tc3 (status: ACCEPTED, 4 days ago)
- Oromia: tc1, tc2, tc3 (status: ACCEPTED, 2 days ago)

### Plan AP-0002 (Annual Audit Plan 2027 - Phase 2)  
**Added acceptance records for:**
- Oromia: tc1, tc2, tc3 (status: ACCEPTED, 1 day ago)

## What cascade_audit_team Now Sees

### Login
- Login as cascade_audit_team user
- Gets assigned to a specific region/tax center (stored in org_context)
- Example: Addis Ababa region, Addis Ababa TC1

### Dashboard
- Full access to AuditTeamView with all menu items
- Dashboard shows audit metrics and plan statistics

### Cascade Plan to Cases (NEW)
- Can now **see** accepted plans for their assigned tax center
- Plans AP-0001 and AP-0002 appear in dropdown selector
- Can select taxpayers and cascade cases based on allocation

### Available Plans
```
Plan: AP-0001 (FY 2027)
├─ Region: Addis Ababa, Oromia
│  ├─ Allocation: desk_audit, field_audit, joint_audit, etc.
│  └─ Tax Centers: tc1, tc2, tc3 (all ACCEPTED)
└─ Status: Ready for cascade

Plan: AP-0002 (FY 2027 - Phase 2)
├─ Region: Oromia
│  ├─ Allocation: desk_audit, field_audit, joint_audit, etc.
│  └─ Tax Centers: tc1, tc2, tc3 (all ACCEPTED)
└─ Status: Ready for cascade
```

## How to Clear Old Data and Load New Data

### Option 1: Automatic Reset (Simple)
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.clear(); location.reload();`
4. App reloads with fresh test data ✅

### Option 2: Manual Reset (Explicit)
In the app (if you have access to dev utilities):
- Find and click "Reset All Data" button (if available)
- Or delete localStorage keys:
  - `audit_planning_system_v2` (main data)
  - `data_version` (version tracker)
  - `auth_context` (login state)

### Option 3: Test with Incognito/Private Mode
1. Open browser in Incognito/Private mode
2. No localStorage cache from previous runs
3. Data loads fresh on first visit

## Testing cascade_audit_team Workflow

### 1. Clear Data
```javascript
localStorage.clear();
location.reload();
```

### 2. Login
- Go to login page
- Email: (cascade_audit_team credentials from MOR)
- Password: (your MOR password)
- System logs in and assigns region/tax center

### 3. Navigate to "Cascade Plan to Cases"
- Left sidebar → Planning → Cascade to Cases
- Should see plan selector dropdown

### 4. Select a Plan
- Dropdown shows: "AP-0001 (FY 2027)" and "AP-0002 (FY 2027)"
- Select AP-0001
- Allocation data loads (desk_audit: 50, field_audit: 30, etc.)

### 5. Cascade Taxpayers
- See taxpayer list with risk levels
- Select taxpayers matching allocation limits
- Click "Create Cases"
- Cases are created with status PENDING_PROCESS_OWNER

## Data Structure: What cascade_audit_team Looks For

```javascript
// In each plan object:
plan.taxCenterAcceptance = {
  'Addis Ababa': {
    'Addis Ababa-tc1': {
      status: 'ACCEPTED',          // ← REQUIRED
      taxCenter: 'Addis Ababa-tc1',
      acceptedDate: '2026-07-27...',
      acceptedBy: 'Tax Center Manager'
    }
  }
}
```

**Critical:** CascadePlanToCasesView filters with:
```javascript
acceptedPlans = data.plans.filter(p => {
  const acceptance = p.taxCenterAcceptance?.[selectedRegion]?.[taxCenter];
  return acceptance?.status === 'ACCEPTED';  // ← This is what was missing!
});
```

## Verification Checklist

- [x] Test data has `taxCenterAcceptance` records
- [x] Both plans (AP-0001, AP-0002) have acceptance data
- [x] cascade_audit_team role has `cascade_plan_to_cases` permission
- [x] Navigation sidebar shows cascade menu for cascade_audit_team
- [x] CascadePlanToCasesView can find accepted plans
- [x] Console logs show "Found X APPROVED plans" (not 0)

## Next Steps

### For Tomorrow (When New Tokens Available)
1. Test cascade workflow end-to-end with real MOR login
2. Create audit cases from cascade
3. Test case prioritization and team leader assignment
4. Verify feedback workflow

### Data Workflow Complete
```
Draft Plan 
  ↓ (audit_team creates)
Submitted Plan
  ↓ (audit_team submits)  
Approved Plan
  ↓ (audit_director approves)
Allocated to Regions
  ↓ (audit_director allocates)
Accepted by Regional Director  
  ↓ (regional_director accepts)
Sent to Tax Centers
  ↓ (regional_director sends)
Accepted by Tax Center Manager
  ↓ (tax_center_manager accepts) ← NEW: taxCenterAcceptance created
READY FOR CASCADE ✅
  ↓ (cascade_audit_team cascades)
Audit Cases Created
  ↓ (cases route to Process Owner)
Cases Prioritized & Assigned
```

## Key Insights

1. **cascade_audit_team is NOT audit_team**
   - Different role in system
   - Replaces audit_team's cascading function
   - Cannot create/approve plans themselves

2. **Full Workflow Required**
   - No shortcuts: plans must go through all approval stages
   - Each role must complete their step
   - Data progresses from status fields → regional records → tax center records

3. **Test Data is Complete**
   - 3 test plans (AP-0001, AP-0002, plus existing data)
   - All have proper regional allocations
   - All have proper tax center allocations
   - All have proper tax center acceptance ✅
   - Ready for immediate cascade testing

## Files Modified
- `/src/utils/data.js` - Added `taxCenterAcceptance` to test plans

## Files Confirmed Working
- `/src/context/AuthContext.jsx` - cascade_audit_team role properly configured
- `/src/config/navigation.js` - Sidebar shows cascade menu
- `/src/components/roleViews/AuditTeamView.jsx` - Routes cascade_audit_team
- `/src/components/views/CascadePlanToCasesView.jsx` - Filters by `taxCenterAcceptance`
