# Hierarchical Routing & Distribution Logic
**Problem:** Cases losing their path from Plan → Tax Center → Team Leader → Auditor  
**Root Cause:** Cases assigned to ONE Team Leader instead of being distributed by Audit Type  
**Solution:** Implement strict hierarchical filtering at each level

---

## 1. CURRENT IMPLEMENTATION (WRONG ❌)

### Flow Diagram
```
Annual Plan (Addis Ababa Region)
├─ Desk Audit: 50 cases
├─ Field Audit: 30 cases
└─ Joint Audit: 20 cases
    ↓
Regional Director Distribution (per region)
    ↓
Tax Center Manager receives allocation
    ↓
CASCADE PLAN → Cases created ❌ ALL sent to ONE Team Leader
    ↓
Team Leader sees ALL cases (desk + field + joint)
    ↓
Team Leader assigns to ONE auditor ❌ Mixed audit types
    ↓
Auditor receives mixed audit type cases ❌ WRONG
```

**Problem:** Audit type filtering is LOST during cascade

---

## 2. CORRECT IMPLEMENTATION (WHAT YOU WANT ✅)

### Level 1: Plan Creation
```javascript
// Plan created at national level
const auditPlan = {
  id: 'AP-2027',
  status: 'FINALIZED',
  regionAllocation: {
    'Addis Ababa': {
      'desk_audit': 50,
      'field_audit': 30,
      'joint_audit': 20
    },
    'Oromia': {
      'desk_audit': 60,
      'field_audit': 40,
      'joint_audit': 25
    }
  }
}
```

### Level 2: Regional Distribution (Regional Director)
```
Regional Director (Addis Ababa) sees:
✅ Only Addis Ababa allocation: desk=50, field=30, joint=20
❌ Cannot see Oromia allocation

Regional Director sends to Tax Centers in their region:
├─ Addis Ababa TC1: desk=15, field=10, joint=7
├─ Addis Ababa TC2: desk=18, field=12, joint=8
└─ Addis Ababa TC3: desk=17, field=8, joint=5
```

**Key:** Each region isolation maintained ✅

### Level 3: Tax Center Cascade (Tax Center Manager)
```
Tax Center Manager (Addis Ababa TC1) sees:
✅ Only their allocation: desk=15, field=10, joint=7
❌ Cannot see TC2 or TC3 allocations

Cases created from allocation:
├─ 15 Desk Audit cases
├─ 10 Field Audit cases
└─ 7 Joint Audit cases

NOW - CRITICAL STEP - FILTER BY AUDIT TYPE FIRST:
```

### Level 4: Team Leader Assignment BY AUDIT TYPE (NEW LOGIC ✅)

**BEFORE ASSIGNMENT** - Group cases by audit type:

```javascript
// Step 1: Get all unassigned cases
const allCases = caseService.getCasesByTaxCenter('Addis Ababa TC1', 'PENDING_PROCESS_OWNER');
// Returns: 32 cases total (15 desk + 10 field + 7 joint)

// Step 2: GROUP BY AUDIT TYPE - THIS IS THE KEY
const casesByAuditType = {
  'desk_audit': [case1, case2, ..., case15],      // 15 cases
  'field_audit': [case16, case17, ..., case25],   // 10 cases
  'joint_audit': [case26, case27, ..., case32]    // 7 cases
};

// Step 3: For EACH audit type, distribute to Team Leaders of that audit type
for (const auditType in casesByAuditType) {
  const casesForType = casesByAuditType[auditType];
  
  // Get Team Leaders for THIS audit type only
  const teamLeadersForType = getTeamLeadersForAuditType('Addis Ababa TC1', auditType);
  // Example: desk_audit → [TL-Desk-1, TL-Desk-2]
  
  // Distribute cases to Team Leaders intelligently
  distributeToTeamLeadersInRoundRobin(casesForType, teamLeadersForType);
}
```

### Level 5: Team Leader Assignment to Auditors (by their audit type)

```javascript
// Team Leader (Desk Audit Team)
teamLeader = {
  id: 'USR-TL-001',
  name: 'Wabirisa Makida',
  auditType: 'desk_audit',  // ← TEAM LEADER IS SPECIFIC TO AUDIT TYPE
  region: 'Addis Ababa',
  taxCenter: 'Addis Ababa TC1'
}

// Team Leader sees ONLY desk audit cases assigned to them (8 cases)
myCases = getCasesAssignedToMe('desk_audit'); // 8 cases only ✅

// Team Leader has auditors for DESK AUDIT ONLY
myAuditors = [
  { id: 'AUD-001', name: 'Auditor 1', currentWorkload: 3/6, auditType: 'desk_audit' },
  { id: 'AUD-002', name: 'Auditor 2', currentWorkload: 5/6, auditType: 'desk_audit' },
  { id: 'AUD-003', name: 'Auditor 3', currentWorkload: 2/6, auditType: 'desk_audit' }
];

// Team Leader assigns their 8 desk audit cases to desk audit auditors only
// by load balancing:
// - Auditor 3: lowest load (2), gets 3 cases → 5/6
// - Auditor 1: next lowest (3), gets 3 cases → 6/6
// - Auditor 2: highest (5), gets 2 cases → 7/6 (over but acceptable)
```

---

## 3. IMPLEMENTATION: CASCADE PLAN LOGIC

### Current (WRONG) Code Location
`src/components/views/CasePrioritizationView.jsx` - Lines ~150-200

### NEW CORRECT LOGIC

```javascript
/**
 * HIERARCHICAL CASE DISTRIBUTION ALGORITHM
 * 
 * Ensures cases follow the path:
 * Tax Center → [Group by Audit Type] → Team Leaders of that type → Auditors of that type
 */

function cascadePlanToTeamLeaders(taxCenter, region) {
  try {
    console.log('📋 [CASCADE] Starting hierarchical distribution');
    console.log(`   Tax Center: ${taxCenter}, Region: ${region}`);
    
    // STEP 1: Load all cases for this tax center
    const allCases = caseService.getCasesByTaxCenter(taxCenter, 'PENDING_PROCESS_OWNER');
    console.log(`✅ Step 1: Loaded ${allCases.length} unassigned cases`);
    
    // STEP 2: GROUP CASES BY AUDIT TYPE (THIS IS THE KEY!)
    const casesByAuditType = {};
    allCases.forEach(auditCase => {
      if (!casesByAuditType[auditCase.auditType]) {
        casesByAuditType[auditCase.auditType] = [];
      }
      casesByAuditType[auditCase.auditType].push(auditCase);
    });
    
    console.log(`✅ Step 2: Grouped into audit types:`, Object.keys(casesByAuditType).map(
      type => `${type}(${casesByAuditType[type].length})`
    ).join(', '));
    
    // STEP 3: For EACH audit type, distribute to Team Leaders of that type
    const distributionSummary = [];
    
    for (const auditType in casesByAuditType) {
      const casesForThisType = casesByAuditType[auditType];
      
      console.log(`\n🔄 Processing ${auditType}: ${casesForThisType.length} cases`);
      
      // Get Team Leaders for THIS audit type ONLY
      const teamLeadersForThisType = getTeamLeadersForAuditType(
        region, 
        taxCenter, 
        auditType
      );
      
      console.log(`   Found ${teamLeadersForThisType.length} Team Leaders for ${auditType}`);
      if (teamLeadersForThisType.length === 0) {
        console.warn(`   ⚠️  NO Team Leaders available for ${auditType}!`);
        continue;
      }
      
      // Distribute cases to these Team Leaders intelligently
      const tlDistribution = distributeToTeamLeadersIntelligently(
        casesForThisType,
        teamLeadersForThisType,
        auditType
      );
      
      // Record for summary
      distributionSummary.push({
        auditType,
        totalCases: casesForThisType.length,
        teamLeaderCount: teamLeadersForThisType.length,
        assignments: tlDistribution
      });
    }
    
    console.log(`\n✅ [CASCADE] Distribution complete:`, distributionSummary);
    return distributionSummary;
    
  } catch (error) {
    console.error('❌ [CASCADE] Error in hierarchical distribution:', error);
    throw error;
  }
}

/**
 * Get ONLY Team Leaders for a specific audit type
 * 
 * Example:
 * - Tax Center: Addis Ababa TC1
 * - Audit Type: desk_audit
 * Returns: [TL-Desk-1, TL-Desk-2] (not field or joint leaders)
 */
function getTeamLeadersForAuditType(region, taxCenter, auditType) {
  try {
    const allTeamLeaders = userService.getAllUsers().filter(u => 
      u.role === 'team_leader' &&
      u.org_context.assignedRegion === region &&
      u.org_context.assignedTaxCenter === taxCenter &&
      u.org_context.auditType === auditType  // ← KEY: MUST match audit type
    );
    
    console.log(`  ✅ Found ${allTeamLeaders.length} Team Leaders for ${auditType}`);
    return allTeamLeaders;
  } catch (error) {
    console.error(`  ❌ Error getting Team Leaders for ${auditType}:`, error);
    return [];
  }
}

/**
 * Intelligently distribute cases to Team Leaders
 * 
 * Algorithm:
 * 1. Sort Team Leaders by current workload (ascending)
 * 2. Distribute cases in round-robin to balance load
 * 3. Don't assign if Team Leader is at/above capacity
 */
function distributeToTeamLeadersIntelligently(cases, teamLeaders, auditType) {
  try {
    console.log(`  📊 Distributing ${cases.length} ${auditType} cases to ${teamLeaders.length} Team Leaders`);
    
    // Sort by current workload (ascending)
    const sortedTLs = [...teamLeaders].sort((a, b) => 
      (a.workload?.currentCases || 0) - (b.workload?.currentCases || 0)
    );
    
    const distribution = [];
    let tlIndex = 0;
    
    for (const auditCase of cases) {
      // Find Team Leader with capacity
      let selectedTL = null;
      let attempts = 0;
      
      while (!selectedTL && attempts < sortedTLs.length) {
        const tl = sortedTLs[tlIndex % sortedTLs.length];
        const currentWorkload = tl.workload?.currentCases || 0;
        const maxCapacity = tl.workload?.maxCapacity || 12;
        
        if (currentWorkload < maxCapacity) {
          selectedTL = tl;
          console.log(`    Case ${auditCase.id} → TL ${tl.full_name} (${currentWorkload}/${maxCapacity})`);
        } else {
          console.warn(`    TL ${tl.full_name} at capacity, trying next...`);
          tlIndex++;
          attempts++;
        }
      }
      
      if (!selectedTL) {
        console.warn(`    ⚠️  No capacity available for case ${auditCase.id}!`);
        continue;
      }
      
      // Assign case to this Team Leader
      assignCaseToTeamLeader(auditCase.id, selectedTL.id);
      
      // Record assignment
      distribution.push({
        caseId: auditCase.id,
        teamLeaderId: selectedTL.id,
        teamLeaderName: selectedTL.full_name,
        auditType
      });
      
      // Move to next Team Leader for round-robin
      tlIndex++;
    }
    
    console.log(`  ✅ Distributed ${distribution.length}/${cases.length} cases`);
    return distribution;
    
  } catch (error) {
    console.error(`  ❌ Error distributing cases:`, error);
    return [];
  }
}

/**
 * THEN: Team Leader assigns ONLY to auditors of their audit type
 */
function teamLeaderAssignCaseToAuditor(teamLeaderId, caseId, auditorId) {
  try {
    // Verify Team Leader and Auditor have same audit type
    const teamLeader = userService.getUserById(teamLeaderId);
    const auditor = userService.getUserById(auditorId);
    
    console.log(`👤 Verifying audit type alignment:`);
    console.log(`   Team Leader ${teamLeader.full_name}: ${teamLeader.org_context.auditType}`);
    console.log(`   Auditor ${auditor.full_name}: ${auditor.org_context.auditType}`);
    
    if (teamLeader.org_context.auditType !== auditor.org_context.auditType) {
      throw new Error(
        `❌ AUDIT TYPE MISMATCH: TL is ${teamLeader.org_context.auditType} ` +
        `but Auditor is ${auditor.org_context.auditType}`
      );
    }
    
    // Check Auditor workload
    if (auditor.workload.currentCases >= auditor.workload.maxCapacity) {
      throw new Error(
        `❌ Auditor at capacity: ${auditor.workload.currentCases}/${auditor.workload.maxCapacity}`
      );
    }
    
    console.log(`✅ Assignment allowed - audit types match`);
    
    // Proceed with assignment
    assignCaseToAuditor(caseId, auditorId);
    
  } catch (error) {
    console.error(`❌ Assignment failed:`, error.message);
    throw error;
  }
}
```

---

## 4. DATA MODEL REQUIREMENTS

### Team Leader Entity MUST have:
```javascript
{
  id: 'USR-TL-001',
  role: 'team_leader',
  full_name: 'Wabirisa Makida',
  org_context: {
    assignedRegion: 'Addis Ababa',
    assignedTaxCenter: 'Addis Ababa TC1',
    auditType: 'desk_audit',  // ← CRITICAL: Must be specific
    teamId: 'TEAM-AA-Desk-001',
    teamName: 'Desk Audit Team 1',
    level: 'tax_center'
  },
  workload: {
    currentCases: 5,
    maxCapacity: 12
  }
}
```

### Auditor Entity MUST have:
```javascript
{
  id: 'USR-AUD-001',
  role: 'auditor',
  full_name: 'Auditor Name',
  org_context: {
    assignedRegion: 'Addis Ababa',
    assignedTaxCenter: 'Addis Ababa TC1',
    auditType: 'desk_audit',  // ← CRITICAL: Must match their TL
    teamId: 'TEAM-AA-Desk-001',
    level: 'tax_center'
  },
  workload: {
    currentCases: 3,
    maxCapacity: 6
  }
}
```

---

## 5. AUDIT TYPE FILTERING AT EACH LEVEL

### Level 1: National
```
All audit types: desk, field, joint, transfer_pricing, comprehensive
```

### Level 2: Regional
```
Regional Director sees only their region's allocation
  Addis Ababa: desk=50, field=30, joint=20
  Oromia: desk=60, field=40, joint=25 ← Different region, not visible
```

### Level 3: Tax Center
```
Tax Center Manager sees only their tax center's allocation
  TC1: desk=15, field=10, joint=7
  TC2: desk=18, field=12, joint=8 ← Different TC, not visible
```

### Level 4: Team Leader (NEW - BY AUDIT TYPE)
```
✅ Desk Audit Team Leader sees ONLY desk audit cases
  - 15 desk audit cases assigned across 2 desk TLs
  - This TL gets 8 cases
  
❌ Does NOT see field or joint audit cases

✅ Field Audit Team Leader sees ONLY field audit cases
  - 10 field audit cases assigned across 2 field TLs
  - This TL gets 5 cases
```

### Level 5: Auditor
```
✅ Desk Audit Auditor under Desk TL sees ONLY desk audit cases
  - 8 cases from their Team Leader
  - Gets 3-4 cases per auditor by load balancing
  
❌ Does NOT see field or joint audit cases
```

---

## 6. WHERE TO IMPLEMENT

### File 1: `src/utils/caseDistribution.js` (NEW)
```javascript
// New file with hierarchical distribution functions
export function cascadePlanToTeamLeadersByAuditType() { ... }
export function getTeamLeadersForAuditType() { ... }
export function distributeToTeamLeadersIntelligently() { ... }
```

### File 2: `src/components/views/CasePrioritizationView.jsx`
**Current (Line ~180):**
```javascript
// OLD: All cases to one TL
handleCascadePlan = () => {
  const tl = this.state.teamLeaders[0]; // ❌ Gets first TL only
  cases.forEach(c => assignCaseToTeamLeader(c, tl)); // ❌ All to same TL
}
```

**NEW:**
```javascript
// NEW: Group by audit type, distribute to appropriate TLs
handleCascadePlan = () => {
  const summary = cascadePlanToTeamLeadersByAuditType(
    this.state.selectedTaxCenter,
    this.state.selectedRegion
  );
  // Shows distribution: desk→2TLs, field→2TLs, joint→1TL
}
```

### File 3: `src/data/orgStructure.js`
Verify all Team Leaders have `org_context.auditType` set correctly

---

## 7. VERIFICATION CHECKLIST

- [ ] Team Leaders have specific audit types (not mixed)
- [ ] Auditors have matching audit types with their Team Leaders
- [ ] `getTeamLeadersForAuditType()` filters correctly
- [ ] Cases grouped by audit type before assignment
- [ ] Each audit type's cases go to its own Team Leaders only
- [ ] Round-robin load balancing within audit type
- [ ] Capacity checking before assignment
- [ ] Audit type validation at assignment time
- [ ] Proper error handling for no capacity
- [ ] Logging traces each case's path through system

---

## 8. TESTING SCENARIO

```
Starting State:
  Cases (Addis Ababa TC1): 15 desk, 10 field, 7 joint = 32 total
  
  Team Leaders:
    - Desk TL-1: capacity 12, current: 2
    - Desk TL-2: capacity 12, current: 1
    - Field TL-1: capacity 10, current: 3
    - Field TL-2: capacity 10, current: 2
    - Joint TL-1: capacity 8, current: 1
  
  Auditors (under Desk TL-1):
    - Aud-1: 4/6 cases, desk_audit
    - Aud-2: 2/6 cases, desk_audit
    - Aud-3: 1/6 cases, desk_audit

Expected Result After Cascade:
  ✅ 15 desk cases distributed: 8 to Desk TL-1, 7 to Desk TL-2
  ✅ 10 field cases distributed: 5 to Field TL-1, 5 to Field TL-2
  ✅ 7 joint cases all to Joint TL-1
  
  Desk TL-1 now has: 2 + 8 = 10/12 (acceptable)
  Desk TL-2 now has: 1 + 7 = 8/12 (acceptable)

When Desk TL-1 assigns their 8 cases to auditors:
  ✅ Can only assign to desk audit auditors
  ✅ Load balances: Aud-3 (1/6) gets 3, Aud-1 (4/6) gets 3, Aud-2 (2/6) gets 2
  ✅ Final: Aud-3: 4/6, Aud-1: 7/6 (over but recorded), Aud-2: 4/6
```

---

## SUMMARY

**You are 100% correct.** The current system:
1. ❌ Loses the audit type in cascade
2. ❌ Assigns ALL cases to ONE Team Leader
3. ❌ Doesn't respect Team Leader specialization
4. ❌ Doesn't use same hierarchical logic as Plan distribution

**The fix:** Apply same logic at every level - FILTER BY CONTEXT (Region → Tax Center → Audit Type)

