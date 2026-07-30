# COMPLETE ROUTING TEST GUIDE

## ✅ COMPLETE DATA FLOW - TOP TO BOTTOM

### STEP 1: DIRECTOR - Finalize Plan
**View:** DirectorView → "Finalized Plans" section
**Login as:** Director
**Actions:**
1. Select a plan with status `SENIOR_MANAGEMENT_APPROVED`
2. Click "FINALIZE" button (trophy icon)
3. Plan status changes to `FINALIZED`
4. Plan is sent to ALL regions

**Data Check:**
```javascript
plan.status === 'FINALIZED'
plan.sentToRegions = ['Oromia', 'SNNPR', 'Addis Ababa', ...]
```

---

### STEP 2A: REGIONAL DIRECTOR - Acknowledge Plan
**View:** RegionalFeedbackView (Acknowledge Finalized Plans)
**Login as:** Regional Director (Region: Addis Ababa)
**Filter:** Shows plans with `status === 'FINALIZED'`
**Actions:**
1. Select plan from list
2. Click "Acknowledge Plan" button
3. Plan is marked as acknowledged for your region

**Data Check:**
```javascript
plan.regionalAcknowledgment['Addis Ababa'] = {
  status: 'ACKNOWLEDGED',
  region: 'Addis Ababa',
  acknowledgedDate: '2027-01-15T10:00:00Z'
}
```

---

### STEP 2B: REGIONAL DIRECTOR - Submit to Tax Centers
**View:** RegionalPlanSubmissionView (Submit Approved Plan to Tax Centers)
**Login as:** Regional Director (Region: Addis Ababa)
**Filter:** Shows plans with:
- `status === 'FINALIZED'` 
- `regionalAcknowledgment['Addis Ababa'].status === 'ACKNOWLEDGED'`

**Actions:**
1. Select plan from "Approved Plans" table
2. Click on tax center boxes to select (e.g., Addis Ababa-tc1, Addis Ababa-tc2)
3. Click "Submit to X Tax Centers" button
4. Selected tax centers receive the plan

**Data Check:**
```javascript
plan.submittedToTaxCenters['Addis Ababa'] = {
  status: 'SUBMITTED',
  submittedDate: '2027-01-15T11:00:00Z',
  taxCentersInRegion: ['Addis Ababa-tc1', 'Addis Ababa-tc2']
}
```

---

### STEP 3: TAX CENTER MANAGER - Accept Plan
**View:** TaxCenterAcceptancePlanView (Accept Approved Plan)
**Login as:** Tax Center Manager (Region: Addis Ababa, Tax Center: Tax Center 1)
**Filter:** Shows plans with:
- `status === 'FINALIZED'`
- `submittedToTaxCenters['Addis Ababa'].status === 'SUBMITTED'`
- `'Addis Ababa-tc1' IN submittedToTaxCenters['Addis Ababa'].taxCentersInRegion`

**Actions:**
1. Select plan from "Available Plans for Acceptance" table
2. Review plan details and allocation
3. Click "Accept & Lock Plan" button
4. Plan is accepted for THIS tax center

**Data Check:**
```javascript
plan.taxCenterAcceptance['Addis Ababa']['Addis Ababa-tc1'] = {
  status: 'ACCEPTED',
  taxCenter: 'Addis Ababa-tc1',
  region: 'Addis Ababa',
  acceptedDate: '2027-01-15T12:00:00Z',
  readyForExecution: true
}
```

**Important:** Only Tax Center 1 accepted. Tax Center 2 still needs to accept independently.

---

### STEP 4: CASCADE TEAM - Create Audit Cases
**View:** CascadePlanToCasesView (Cascade Plan to Cases)
**Login as:** Cascade Team Member (Region: Addis Ababa, Tax Center: Tax Center 1)
**Filter:** Shows plans with:
- `status === 'FINALIZED'`
- `taxCenterAcceptance['Addis Ababa']['Addis Ababa-tc1'].status === 'ACCEPTED'`

**Actions:**
1. Select region and tax center (auto-populated from login)
2. Select plan from dropdown
3. Select taxpayers to audit
4. Click "Create Audit Cases" button
5. Cases are created for this tax center

---

## 🔍 VERIFICATION CHECKLIST

### After Director Finalize:
- [ ] Plan status = `FINALIZED`
- [ ] `sentToRegions` array contains all regions
- [ ] Appears in Regional Director's "Acknowledge Finalized Plans"

### After Regional Acknowledge:
- [ ] `regionalAcknowledgment[region].status === 'ACKNOWLEDGED'`
- [ ] Appears in Regional Director's "Submit to Tax Centers" view

### After Regional Submit:
- [ ] `submittedToTaxCenters[region].status === 'SUBMITTED'`
- [ ] `taxCentersInRegion` array contains selected tax centers
- [ ] Only selected tax centers see the plan in their acceptance view

### After Tax Center Accept:
- [ ] `taxCenterAcceptance[region][taxCenter].status === 'ACCEPTED'`
- [ ] Plan appears in Cascade Team view for that tax center
- [ ] Other tax centers can still accept independently

### After Cascade Create Cases:
- [ ] Audit cases created in `auditCases` array
- [ ] Each case linked to plan, region, tax center
- [ ] Taxpayers assigned to auditors

---

## 🚨 COMMON ISSUES & FIXES

### Issue: Tax Center doesn't see submitted plan
**Check:**
1. Plan is `FINALIZED`
2. Regional Director submitted to THIS tax center
3. Tax center name matches: "Tax Center 1" → "Addis Ababa-tc1"

### Issue: Cascade Team doesn't see accepted plan
**Check:**
1. Plan is `FINALIZED`
2. Tax Center acceptance exists for THIS tax center
3. Region and tax center match your login context

### Issue: Multiple tax centers conflict
**Solution:**
- Each tax center accepts independently
- Each tax center has separate `taxCenterAcceptance[region][taxCenter]` entry
- No conflicts - data is isolated per tax center

---

## 📊 DATA STRUCTURE SUMMARY

```javascript
{
  "id": "AP-0003",
  "status": "FINALIZED",
  "sentToRegions": ["Addis Ababa", "Oromia", ...],
  
  "regionalAcknowledgment": {
    "Addis Ababa": {
      "status": "ACKNOWLEDGED",
      "acknowledgedDate": "2027-01-15T10:00:00Z"
    }
  },
  
  "submittedToTaxCenters": {
    "Addis Ababa": {
      "status": "SUBMITTED",
      "taxCentersInRegion": ["Addis Ababa-tc1", "Addis Ababa-tc2"],
      "submittedDate": "2027-01-15T11:00:00Z"
    }
  },
  
  "taxCenterAcceptance": {
    "Addis Ababa": {
      "Addis Ababa-tc1": {
        "status": "ACCEPTED",
        "acceptedDate": "2027-01-15T12:00:00Z"
      },
      "Addis Ababa-tc2": {
        "status": "ACCEPTED",
        "acceptedDate": "2027-01-15T13:00:00Z"
      }
    }
  }
}
```
