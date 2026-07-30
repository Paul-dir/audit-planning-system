# Testing Cascade Workflow - Step by Step

## Complete End-to-End Test

### STAGE 1: Tax Center Manager Accepts Plan

**Login:** Tax Center Manager (Oromia-tc1)

```
1. Go to: Navigation → Accept Approved Plan
2. You should see: TaxCenterAcceptancePlanView

3. Current Tax Center: Oromia / Tax Center 1

4. Look for: "All Approved Plans" section
   Expected: List of FINALIZED plans (status = FINALIZED)
   
5. Select a plan: Example - AP-0001 (FY 2026)
   Click: [Select]
   
6. Review plan details:
   - Plan ID: AP-0001
   - Fiscal Year: 2026
   - Version: v1
   - Status: Approved
   
7. Click: [Accept & Lock Plan]
   Expected message: "✅ Oromia-tc1 successfully accepted AP-0001!"
   
8. Result: Plan now has
   taxCenterAcceptance['Oromia']['Oromia-tc1'].status = 'ACCEPTED'
```

**Verify in Console:**
```javascript
// Open browser DevTools Console
const data = JSON.parse(localStorage.getItem('auditData'));
const plan = data.plans.find(p => p.id === 'AP-0001');
console.log(plan.taxCenterAcceptance['Oromia']);

// Should show:
// {
//   'Oromia-tc1': {
//     status: 'ACCEPTED',
//     acceptedBy: 'Tax Center Manager',
//     acceptedDate: '2026-07-27T...'
//   }
// }
```

---

### STAGE 2: Cascade Team Views Accepted Plans

**Logout and Login:** Cascade Audit Team (Oromia-tc1)

```
1. Go to: Navigation → Cascade Plan to Audit Cases
2. You should see: CascadePlanToCasesView

3. Check: Your Assigned Location
   - Region: Oromia
   - Tax Center: Tax Center 1
   
4. Look for: "SELECT APPROVED PLAN TO CASCADE"
   Dropdown should show:
   ✓ AP-0001 (FY 2026) - Accepted by Oromia-tc1
   ✓ Any other plans Oromia-tc1 accepted
   ✗ Plans other tax centers accepted (not shown)
   ✗ Plans still in Draft/Review (not shown)
   
5. This means: Filtering is working! ✅
   - Only FINALIZED plans shown
   - Only ACCEPTED by this tax center
   - Dynamic and real data
```

**Verify in Console:**
```javascript
// Open browser DevTools Console
const plans = document.querySelectorAll('select option');
plans.forEach(opt => console.log(opt.textContent));

// Should show only:
// -- Choose a Plan to Start --
// AP-0001 (FY 2026) - Annual Plan
// (Only plans this tax center accepted)
```

---

### STAGE 3: Select Plan and View Allocation

```
1. In Plan dropdown: Select AP-0001
   Expected: Form updates with:
   - CURRENT PLAN: AP-0001 (FY 2026)
   - REGION: Oromia
   - TAX CENTER: Tax Center 1
   - TOTAL ALLOCATED: XX Cases
   
2. Look for: "THIS TAX CENTER's ALLOCATION BREAKDOWN"
   Expected to show (REAL data from plan):
   
   ✅ COMPREHENSIVE:
      X / Y cases
      X allocated, 0 cascaded, Y remaining
      
   ✅ FIELD AUDIT:
      X / Y cases
      X allocated, 0 cascaded, Y remaining
      
   ✅ DESK AUDIT:
      X / Y cases
      X allocated, 0 cascaded, Y remaining
   
   This is REAL allocation from the plan! ✅
```

**Verify in Console:**
```javascript
// Find the allocation for this plan
const data = JSON.parse(localStorage.getItem('auditData'));
const plan = data.plans.find(p => p.id === 'AP-0001');
const normTC = 'Oromia-tc1';  // Normalized name
console.log(plan.taxCenterAllocations['Oromia'][normTC]);

// Should show real allocation:
// {
//   desk_audit: 50,
//   field_audit: 30,
//   comprehensive: 10,
//   joint_audit: 5,
//   transfer_pricing: 3,
//   issue_audit: 2
// }
```

---

### STAGE 4: Select Taxpayers and Create Cases

```
1. Look for: "AVAILABLE TAXPAYERS" section
   Shows: List of taxpayers with:
   - Risk Level: Critical, High, Medium, Low
   - Risk Score: 0-100
   - Audit Type (Recommended)
   - Revenue at Risk
   
2. Filter by Risk Level:
   Click: [Critical] button
   Expected: Shows only Critical-risk taxpayers
   
3. Select taxpayers:
   - Select 8 Critical (Recommended: Comprehensive)
   - You should see: "8/10 slots used for Comprehensive"
   
   - Select 25 High-risk (Recommended: Field Audit)
   - You should see: "25/30 slots used for Field Audit"
   
   - Select 40 Medium-risk (Recommended: Desk Audit)
   - You should see: "40/50 slots used for Desk Audit"
   
   Total: 73 cases selected

4. Click: [Create Cases]
   
5. Expected Validation Message:
   ✅ If valid:
      "✅ SUCCESS: Created 73 audit cases
       Plan: AP-0001
       Tax Center: Tax Center 1
       Region: Oromia
       Cases ready for prioritization"
   
   ❌ If exceeds allocation:
      "❌ ERROR: Desk Audit exceeds allocation
       Selected: 55
       Allocated: 50"
      Action blocked! ✅ (This is correct!)
   
   ❌ If plan already cascaded:
      "⚠️ WARNING: Plan already cascaded!
       Existing cases: 73
       Cannot cascade same plan twice"
      Action blocked! ✅ (This is correct!)
```

**Verify in Console:**
```javascript
// Verify cases were created
const data = JSON.parse(localStorage.getItem('auditData'));
const newCases = data.auditCases.filter(c => c.planId === 'AP-0001' && c.region === 'Oromia' && c.taxCenter === 'Tax Center 1');

console.log(`Created ${newCases.length} cases`);

// Show first case
console.log(newCases[0]);
// Should show:
// {
//   id: 'CASE-Oromia-tc1-...',
//   planId: 'AP-0001',
//   region: 'Oromia',
//   taxCenter: 'Tax Center 1',
//   taxpayerId: 'TP-0123',
//   taxpayerName: 'Solomon Trading PLC',
//   tin: 'ET1000123',
//   riskLevel: 'Critical',
//   riskScore: 92,
//   auditType: 'Comprehensive',
//   status: 'ASSIGNED',
//   createdFrom: 'CASCADE_PLAN',
//   createdDate: '2026-07-27T...'
// }

// Verify allocation was respected
const comprehensive = newCases.filter(c => c.auditType === 'Comprehensive').length;
const field = newCases.filter(c => c.auditType === 'Field Audit').length;
const desk = newCases.filter(c => c.auditType === 'Desk Audit').length;

console.log(`Comprehensive: ${comprehensive} (limit: 10) - ${comprehensive <= 10 ? '✅' : '❌'}`);
console.log(`Field Audit: ${field} (limit: 30) - ${field <= 30 ? '✅' : '❌'}`);
console.log(`Desk Audit: ${desk} (limit: 50) - ${desk <= 50 ? '✅' : '❌'}`);
```

---

## Test Case 1: Duplicate Plan Prevention

**Test:** Try to cascade same plan twice

```
1. After creating 73 cases from AP-0001:
   - Cases are now in data.auditCases
   - Status: ASSIGNED
   - createdFrom: 'CASCADE_PLAN'

2. Try to cascade AP-0001 again:
   - Go back to plan dropdown
   - Select AP-0001 again
   - Select some taxpayers
   - Click [Create Cases]

3. Expected Error:
   "⚠️ WARNING: Plan already cascaded!
    Existing cases: 73
    Cannot cascade same plan twice"
    
4. Result: ✅ Blocked!
   No duplicate cases created
   Action prevented
```

**Why This Matters:**
- Prevents accidental re-cascading
- Protects data integrity
- Ensures one cascade per plan per tax center

---

## Test Case 2: Allocation Limit Enforcement

**Test:** Try to exceed allocation limits

```
1. After setting up plan with allocation:
   - Comprehensive: 10 max
   - Field Audit: 30 max
   - Desk Audit: 50 max

2. Try to select 15 Comprehensive taxpayers

3. Expected Error:
   "❌ ERROR: Comprehensive exceeds allocation
    Selected: 15
    Allocated: 10"
    
4. Result: ✅ Blocked!
   Cannot exceed allocation
   Error message clear and specific
```

**Why This Matters:**
- Respects plan allocations
- Prevents over-allocation
- Ensures balance across regions

---

## Test Case 3: Duplicate Taxpayer Prevention

**Test:** Try to select same taxpayer twice

```
1. Select taxpayer TP-0123 (Solomon Trading)

2. Try to select TP-0123 again (if UI allows)
   OR try to add same TIN twice

3. Expected Error:
   "❌ ERROR: Same taxpayer selected twice
    Each taxpayer can only be selected once"
    
4. Result: ✅ Blocked!
   Cannot add same taxpayer twice
```

**Why This Matters:**
- Prevents duplicate audits of same taxpayer
- Ensures unique case for each taxpayer
- Maintains data consistency

---

## Test Case 4: Multi-Tax Center Independence

**Test:** Each tax center works independently

```
1. Tax Center Manager (Oromia-tc1):
   - Accepts AP-0001
   - Plan shows in dropdown ✅

2. Tax Center Manager (Oromia-tc2):
   - Accepts AP-0002 (different plan)
   - Plan shows AP-0002 in dropdown ✅
   - AP-0001 NOT shown (different plan) ✅

3. Tax Center Manager (Amhara-tc1):
   - Accepts AP-0001 (same plan as Oromia-tc1)
   - AP-0001 shows in dropdown ✅
   - But limited to Amhara allocation ✅

4. Result:
   ✅ Each tax center sees only their accepted plans
   ✅ Each cascades independently
   ✅ No data collision
```

---

## Console Debugging Commands

### Show all plans in system
```javascript
const data = JSON.parse(localStorage.getItem('auditData'));
console.table(data.plans.map(p => ({
  id: p.id,
  status: p.status,
  fiscalYear: p.fiscalYear
})));
```

### Show all audit cases
```javascript
const data = JSON.parse(localStorage.getItem('auditData'));
console.log(`Total audit cases: ${data.auditCases.length}`);
console.table(data.auditCases.slice(0, 5).map(c => ({
  id: c.id,
  planId: c.planId,
  taxpayerName: c.taxpayerName,
  riskLevel: c.riskLevel,
  auditType: c.auditType,
  status: c.status
})));
```

### Show cases for specific plan and tax center
```javascript
const data = JSON.parse(localStorage.getItem('auditData'));
const cases = data.auditCases.filter(c => 
  c.planId === 'AP-0001' && 
  c.region === 'Oromia' && 
  c.taxCenter === 'Tax Center 1'
);
console.log(`Cases for AP-0001 in Oromia-tc1: ${cases.length}`);
```

### Verify no duplicate taxpayers in cases
```javascript
const data = JSON.parse(localStorage.getItem('auditData'));
const cases = data.auditCases.filter(c => c.planId === 'AP-0001');
const taxpayerIds = cases.map(c => c.taxpayerId);
const unique = new Set(taxpayerIds);
console.log(`Total cases: ${cases.length}`);
console.log(`Unique taxpayers: ${unique.size}`);
console.log(`Duplicates: ${cases.length - unique.size} (should be 0)`);
```

### Check allocation respect
```javascript
const data = JSON.parse(localStorage.getItem('auditData'));
const cases = data.auditCases.filter(c => c.planId === 'AP-0001');
const byType = {};
cases.forEach(c => {
  byType[c.auditType] = (byType[c.auditType] || 0) + 1;
});
console.table(byType);

// Compare to plan allocation
const plan = data.plans.find(p => p.id === 'AP-0001');
const allocation = plan.taxCenterAllocations['Oromia']['Oromia-tc1'];
console.log('Allocation:', allocation);

// Check each type
Object.entries(byType).forEach(([type, count]) => {
  const key = type.toLowerCase().replace(' ', '_');
  const allocated = allocation[key];
  console.log(`${type}: ${count}/${allocated} - ${count <= allocated ? '✅' : '❌'}`);
});
```

---

## Success Criteria

✅ **All of the following should be true:**

1. **Plan Filtering**
   - Only FINALIZED plans shown
   - Only ACCEPTED by this tax center
   - Dynamic per tax center

2. **Allocation Validation**
   - Cannot exceed any audit type allocation
   - Clear error messages
   - Prevents operation

3. **Duplicate Prevention**
   - Cannot cascade same plan twice
   - Cannot select same taxpayer twice
   - Clear error messages

4. **Real Data**
   - Cases linked to actual plan
   - Taxpayer data from database
   - Risk levels and audit types correct

5. **Data Persistence**
   - Cases saved to localStorage
   - Can be retrieved later
   - Audit trail recorded

---

**Ready to Test!** 🧪

