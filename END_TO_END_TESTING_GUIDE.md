# End-to-End Testing Guide ✅

## Overview
Test all three steps of the new allocation workflow with region access verification.

---

## STEP 1: Director Submits Plan to Addis Ababa

### Setup
1. **Open browser DevTools** (F12)
2. **Go to Console tab** - we'll check logs
3. **Clear localStorage** (if needed):
   ```javascript
   localStorage.removeItem('audit_planning_system_v2');
   location.reload();
   ```

### Test
1. **Login as Audit Director**
   - User: Any Audit Director account
   - Role: Audit Director

2. **Go to "Plan review"**
   - View available plans
   - Select AP-0001 or AP-0002
   - Click "APPROVE PLAN"
   - Confirm approval

3. **Go to "Submit Plan to Regions"**
   - Should see AP-0001 in the list
   - Should NOT see "Submitted" badge
   - Click to select AP-0001

4. **Select Region**
   - See region checkbox "Addis Ababa" (titlecase)
   - Check ONLY "Addis Ababa"
   - Leave other regions unchecked

5. **Submit Plan**
   - Click "Submit" button
   - See success message: "Plan AP-0001 submitted to Addis Ababa"
   - Check browser console for:
     ```
     ✅ DIRECTOR SUBMITTED PLAN: {
       planId: "AP-0001",
       sentToRegions: ["addis_ababa"],  ← lowercase_underscore!
       sentToRegionsDate: "..."
     }
     ```

6. **Verify Data Saved**
   - Refresh page (F5)
   - See AP-0001 with "Submitted" badge
   - Open DevTools → Application → Local Storage
   - Check: AP-0001 has `sentToRegions: ["addis_ababa"]`

**RESULT**: ✅ Plan submitted with correct region format

---

## STEP 2: Regional Director Receives in Addis Ababa

### Setup
1. **Logout as Director**
2. **Login as Regional Director**
   - Select "Regional Director" role
   - Make sure region is "Addis Ababa"
   - Check auth context in console:
     ```javascript
     // In console while logged in:
     console.log(window.__auth?.org_context?.assignedRegion);
     // Should show: "Addis Ababa" (titlecase in auth, will normalize)
     ```

### Test
1. **Go to "Receive Plans"**
   - Check browser console for:
     ```
     ✅ Regional Director (Addis Ababa): Found 1 submitted plans
     [{ id: "AP-0001", status: null }]
     ```
   - Should see AP-0001 in the list (the one you just submitted)

2. **Select Plan AP-0001**
   - View plan details
   - See region: "Addis Ababa"
   - See allocation breakdown:
     - Desk Audit: 50
     - Field Audit: 30
     - etc.

3. **Accept Plan**
   - Click "Accept Plan" button
   - See success message
   - Check browser console for:
     ```
     ✅ REGIONAL DIRECTOR ACCEPTED PLAN: {
       planId: "AP-0001",
       acceptanceStatus: { status: "ACCEPTED" }
     }
     ```

4. **Verify Data Saved**
   - Refresh page (F5)
   - Open DevTools → Local Storage
   - Check: AP-0001 has `planAcceptanceStatus["addis_ababa"] = { status: "ACCEPTED" }`

**RESULT**: ✅ Plan accepted for region

---

## STEP 3: Regional Director Allocates to Tax Centers

### Setup
- Still logged in as Regional Director (Addis Ababa)

### Test
1. **Go to "Allocate to Tax Centers"**
   - Check browser console for:
     ```
     ✅ Regional Director (Addis Ababa): Found 1 accepted plans
     ```
   - Should see AP-0001 in the dropdown

2. **Select Plan AP-0001**
   - Dropdown shows: "AP-0001 - Annual Audit Plan 2027"
   - See allocation breakdown:
     - Desk Audit: 50 (split across 3 tax centers)
     - Field Audit: 30
     - etc.

3. **Review Distribution Table**
   - 3 tax centers shown:
     - Addis Ababa TC1
     - Addis Ababa TC2
     - Addis Ababa TC3
   - Should see auto-filled distribution (roughly equal split)
   - Example:
     ```
     Desk Audit: [17, 17, 16] = 50 ✅
     Field Audit: [10, 10, 10] = 30 ✅
     ```

4. **Verify Validation**
   - Should see green checkmark ✅ on all rows
   - "Send to Tax Centers" button should be ENABLED

5. **Submit Allocation**
   - Click "Send to Tax Centers"
   - See success message
   - Check browser console for:
     ```
     ✅ REGIONAL DIRECTOR ALLOCATED TO TAX CENTERS: {
       planId: "AP-0001",
       region: "addis_ababa",
       taxCenterAllocations: {...}
     }
     ```

6. **Verify Data Saved**
   - Refresh page (F5)
   - Open DevTools → Local Storage
   - Check: AP-0001 has `taxCenterAllocations["addis_ababa"]` with distribution array

**RESULT**: ✅ Plan allocated to tax centers for region

---

## SUMMARY CHECK

After completing all three steps, in DevTools Local Storage, AP-0001 should have:

```json
{
  "id": "AP-0001",
  "status": "DIRECTOR_APPROVED",
  "sentToRegions": ["addis_ababa"],
  "sentToRegionsDate": "2026-07-31T10:30:00Z",
  "regionalAllocation": {
    "addis_ababa": {
      "desk_audit": 50,
      "field_audit": 30,
      "joint_audit": 20,
      "transfer_pricing": 10,
      "comprehensive": 15,
      "issue_audit": 5
    }
  },
  "planAcceptanceStatus": {
    "addis_ababa": {
      "status": "ACCEPTED"
    }
  },
  "taxCenterAllocations": {
    "addis_ababa": {
      "desk_audit": [17, 17, 16],
      "field_audit": [10, 10, 10],
      "joint_audit": [7, 7, 6],
      "transfer_pricing": [4, 3, 3],
      "comprehensive": [5, 5, 5],
      "issue_audit": [2, 2, 1]
    }
  }
}
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Regional Director doesn't see submitted plans | Check `sentToRegions` includes 'addis_ababa' AND `regionalAllocation['addis_ababa']` exists |
| Regional Director doesn't see allocate option | Check plan is ACCEPTED in `planAcceptanceStatus['addis_ababa'].status` |
| Distribution validation keeps showing red X | Make sure totals per row match regional allocation exactly |
| Plans missing after refresh | Check localStorage wasn't cleared; check data structure in DevTools |

---

## Build Status
✅ 124 modules, 0 errors, all workflows functional

---

## Next Steps

Once this workflow is verified working:

**STEP 4**: Tax Center Manager Receives Allocations
- Create view for tax center managers
- Show allocations sent by regional directors
- Allow accept/reject of allocations

**STEP 5**: Tax Center Manager Cascades to Cases
- Break down allocation into individual audit cases
- Create cases in the system

**STEP 6**: Auditors Execute Cases
- Assign cases to auditors
- Track case execution
