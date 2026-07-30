# INTELLIGENT CASE DISTRIBUTION SYSTEM
## Multi-Team Leader, Dynamic Auditor Routing, Real-time Load Balancing

---

## System Overview

The new Intelligent Case Distribution Engine replaces the simple batch assignment system with a sophisticated, real-time load-balancing algorithm that:

### Core Features

1. **Multiple Team Leaders Per Audit Type**
   - Distributes cases across ALL available Team Leaders for a given audit type
   - Not limited to one Team Leader - scales horizontally
   - Example: If you have 3 Desk Audit Team Leaders, all 3 receive cases

2. **Dynamic Case Capacity**
   - **10-15 cases per Team Leader** (configurable by audit type)
   - Before: Hardcoded 5 cases per TL
   - Now: `CASES_PER_TEAM_LEADER` config with per-type customization
   ```javascript
   Desk Audit: 15 cases
   Field Audit: 12 cases
   Transfer Pricing: 10 cases
   etc.
   ```

3. **Real-time Auditor Routing**
   - Cases automatically route to available auditors
   - System sees auditor capacity and workload
   - Routes to least-loaded auditor first
   - Cases "skip" Team Leader level if auditor available

4. **Dynamic Re-routing**
   - Monitors pending cases waiting for auditor availability
   - Automatically routes when auditor capacity opens up
   - Runs every time system saves data

5. **Load Balancing**
   - Distributes cases to Team Leader with lowest current workload
   - Considers all auditors under each Team Leader
   - Ensures even distribution across all resources

---

## Architecture

### File Structure
```
src/
├── utils/
│   ├── intelligentCaseDistribution.js    ← NEW: Main engine
│   ├── data.js                            ← Already exists
│   └── businessLogic.js                   ← Already exists
├── components/
│   └── views/
│       └── CasePrioritizationView.jsx     ← UPDATED: Uses new engine
└── data/
    └── orgStructure.js                    ← Defines Team Leaders & Auditors
```

### Key Data Model

Each case flows through these states:

```
Process Owner selects cases
        ↓
Cases ranked by risk score
        ↓
Intelligent Distribution Algorithm
        ↓
   ┌────────────────────┐
   │ ASSIGNED_TO_TEAM_LEADER (if no auditors available)
   └────────────────────┘
           ↓
   (Real-time check: Any auditors available?)
           ↓
   ┌────────────────────┐
   │ ASSIGNED_TO_AUDITOR (auditor found - auto-routed)
   └────────────────────┘
           ↓
   Auditor starts work
```

---

## Algorithm Flow

### Step 1: Case Selection & Grouping
```
Input: Selected case IDs from Process Owner

1. Get all selected cases
2. Sort by risk score (descending)
3. Group by audit type (all Desk Audits together, Field Audits together, etc.)
```

### Step 2: Team Leader Distribution
```
For each audit type group:
  1. Get ALL Team Leaders for this audit type in tax center
  2. Calculate current workload for each TL
  3. For each case:
     a. Find TL with lowest workload
     b. Assign case to that TL
     c. Increment TL's workload
     d. Proceed to Step 3 (auditor routing)
```

### Step 3: Auditor Routing (Real-time)
```
For each assigned case at TL level:
  1. Get all auditors under this Team Leader
  2. Calculate current workload for each auditor
  3. Find auditor with lowest workload
  4. If auditor has capacity:
     a. Route case directly to auditor
     b. Set status: ASSIGNED_TO_AUDITOR
     c. Record in assignment history
  5. If NO auditors available:
     a. Keep case at TL level
     b. Set status: ASSIGNED_TO_TEAM_LEADER
     c. Mark for future re-routing
```

### Step 4: Dynamic Re-routing (Continuous)
```
Every time data is saved:
  1. Find all cases stuck at TL level (ASSIGNED_TO_TEAM_LEADER)
  2. For each stuck case:
     a. Check if auditor now available
     b. If yes: Route to auditor, update status, log history
  3. Repeat until no more re-routing possible
```

---

## Configuration

### File: `src/utils/intelligentCaseDistribution.js`

#### Configurable Constants

```javascript
// Cases per Team Leader by audit type
const CASES_PER_TEAM_LEADER = {
  'Desk Audit': 15,           // Maximum 15 cases per Desk Audit TL
  'Field Audit': 12,          // Maximum 12 cases per Field Audit TL
  'Joint Audit': 12,
  'Transfer Pricing': 10,
  'Comprehensive': 10,
  'Issue Audit': 15
};

// Auditor capacity (default)
DEFAULT_AUDITOR_CAPACITY: 6   // Each auditor can handle 6 cases

// System-wide settings
MULTIPLE_TLS_PER_TYPE: true   // Multiple TLs per audit type enabled
DYNAMIC_ROUTING_ENABLED: true // Real-time auditor routing enabled
```

#### To Modify Capacity
Edit `CASES_PER_TEAM_LEADER` to change max cases per Team Leader:
```javascript
'Desk Audit': 20              // Increase from 15 to 20 cases per TL
```

---

## API Reference

### Main Function: `intelligentDistributeCases()`

**Purpose**: Intelligently distribute selected cases to Team Leaders and Auditors

**Signature**:
```javascript
intelligentDistributeCases(
  selectedCaseIds: string[],    // Array of case IDs to distribute
  data: object,                 // Full data object (with auditCases, assignments)
  userInfo: object              // Current user info (for logging)
): Array<SummaryObject>         // Summary of what was distributed
```

**Returns**:
```javascript
[
  {
    caseId: 'ASN-xxx',
    rank: 1,
    auditType: 'Desk Audit',
    teamLeader: 'John Abebe',
    teamLeaderId: 'USR-0001-TL',
    auditor: 'Selam Tadesse',           // or '(Pending)'
    auditorId: 'USR-0050-AUD',          // or null
    status: 'ROUTED_TO_AUDITOR',        // or 'AWAITING_AUDITOR'
    teamName: 'Addis TC1 - Desk Audit Team 1'
  },
  ...
]
```

### Utility Function: `getTeamLeadersForAuditType()`

**Purpose**: Get all Team Leaders for specific audit type

**Usage**:
```javascript
const tls = getTeamLeadersForAuditType('Addis Ababa TC1', 'Desk Audit');
// Returns: Array of 2+ Team Leaders (not just 1)
```

### Utility Function: `getBestAvailableAuditor()`

**Purpose**: Find best auditor under a Team Leader

**Usage**:
```javascript
const auditor = getBestAvailableAuditor(teamLeaderId, data);
// Returns: Auditor object with lowest workload, or null if no capacity
```

### Utility Function: `dynamicRerouteIfNeeded()`

**Purpose**: Re-route pending cases to newly available auditors

**Usage**:
```javascript
const reroutedCount = dynamicRerouteIfNeeded(data);
// Returns: Number of cases re-routed
```

### Utility Function: `getDistributionStats()`

**Purpose**: Get real-time workload statistics

**Usage**:
```javascript
const stats = getDistributionStats(data);
// Returns:
// {
//   totalTeamLeaders: 45,
//   teamLeaderWorkload: {
//     'Addis TC1-Desk Audit': [
//       {
//         teamLeader: 'John Abebe',
//         id: 'USR-xxx',
//         currentWorkload: 8,
//         maxCapacity: 15,
//         utilizationPercent: '53.3%'
//       },
//       ...
//     ]
//   }
// }
```

---

## Example Scenario

### Scenario: 30 Desk Audit Cases in Addis TC1

**Setup**:
- 3 Desk Audit Team Leaders in Addis TC1
- Each TL has 5 auditors
- Max 15 cases per TL
- Max 6 cases per auditor

**Process**:

```
Input: 30 cases selected

Step 1: Group by type
├─ 30 Desk Audit cases
└─ Sort by risk (highest first)

Step 2: Find Team Leaders
├─ TL1: John (0/15 capacity)
├─ TL2: Marie (0/15 capacity)
└─ TL3: Samuel (0/15 capacity)

Step 3: Distribute cases (intelligent load balance)
├─ Cases 1-5: → TL1, John (then route to his auditors)
│  ├─ Case 1 → Auditor: Selam (1/6)
│  ├─ Case 2 → Auditor: Liam (1/6)
│  ├─ Case 3 → Auditor: Abeba (1/6)
│  ├─ Case 4 → Auditor: Girma (1/6)
│  └─ Case 5 → Auditor: Maha (1/6)
│
├─ Cases 6-10: → TL2, Marie (distribute among her auditors)
├─ Cases 11-15: → TL3, Samuel (distribute among his auditors)
├─ Cases 16-20: → TL1, John (now at 5/15, has capacity)
├─ Cases 21-25: → TL2, Marie (now at 5/15, has capacity)
└─ Cases 26-30: → TL3, Samuel (now at 5/15, has capacity)

Final State:
├─ TL1 (John): 10 cases assigned (10/15 capacity)
├─ TL2 (Marie): 10 cases assigned (10/15 capacity)
└─ TL3 (Samuel): 10 cases assigned (10/15 capacity)

All Auditors:
├─ Most have 2 cases (2/6 capacity)
├─ All have available capacity for future cases
└─ System can dynamically route more as auditors complete work
```

**Result**:
- ✅ All 30 cases distributed evenly across 3 TLs (10 each)
- ✅ Cases routed to auditors with capacity
- ✅ Load balanced (not overloading any single auditor)
- ✅ System ready for real-time re-routing as work completes

---

## Real-time Monitoring

### Assignment Summary Modal

When Process Owner clicks "Prioritize & Auto-Assign", they see:

```
┌─────────────────────────────────────────────────────┐
│ Intelligent Distribution Complete                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Total Cases Distributed: 30                         │
│ Routed to Auditors: 28                              │
│ Awaiting Auditor: 2                                 │
│                                                      │
├─────────────────────────────────────────────────────┤
│ Rank │ Case ID │ Type       │ Team Leader │ Auditor  │ Status    │
├─────────────────────────────────────────────────────┤
│ 1    │ ASN-xxx │ Desk Audit │ John Abebe  │ Selam    │ ✓ Routed  │
│ 2    │ ASN-yyy │ Desk Audit │ Marie       │ Liam     │ ✓ Routed  │
│ 3    │ ASN-zzz │ Desk Audit │ Samuel      │ (Pending)│ ⏳ Pending │
│ ...  │ ...     │ ...        │ ...         │ ...      │ ...       │
│                                                      │
│ ℹ️ Cases awaiting auditors will auto-route when    │
│    auditor capacity becomes available.              │
└─────────────────────────────────────────────────────┘
```

---

## Integration Points

### How It's Used in CasePrioritizationView

**Before** (Old Code):
```javascript
// Simple round-robin, 5 cases per TL
const tlAssignmentCounters = {};
if (tlAssignmentCounters[tlGroupKey].count >= 5) {
  // Switch to next TL
}
```

**After** (New Code):
```javascript
// Intelligent distribution
import { intelligentDistributeCases, dynamicRerouteIfNeeded } from '../../utils/intelligentCaseDistribution';

const handleStoreSelectedCases = () => {
  const data = loadData();
  const summaryList = intelligentDistributeCases(
    Array.from(selectedCases), 
    data, 
    userInfo
  );
  dynamicRerouteIfNeeded(data);  // Trigger re-routing
  saveData(data);
  loadCasesForTaxCenter();
};
```

---

## Logging & Debugging

### Console Output

System logs detailed information for debugging:

```
[Distribution] Found 3 Team Leaders for Addis TC1 - Desk Audit

[Distribution] Processing 30 cases of type "Desk Audit" in Addis TC1

  ✅ Case ASN-xxx: TL=John Abebe → Auditor=Selam Tadesse
  ✅ Case ASN-yyy: TL=Marie → Auditor=Liam Gebremedhin
  ⚠️ Case ASN-zzz: Assigned to TL=Samuel (no auditors available)

[Distribution] Team Leader Summary for Desk Audit:
  TL: John Abebe
    Cases assigned: 10/15 (66.7% utilization)
  TL: Marie
    Cases assigned: 10/15 (66.7% utilization)
  TL: Samuel
    Cases assigned: 10/15 (66.7% utilization)

[Dynamic Routing] Checking for re-routing opportunities...
[Dynamic Routing] ✅ Case ASN-zzz routed to Samuel's available auditor
[Dynamic Routing] Re-routed 1 cases to available auditors
```

---

## Benefits Summary

### For Process Owner
- ✅ Simpler: Just select cases and system handles intelligent distribution
- ✅ Transparent: Sees exactly where each case goes and to which auditor
- ✅ Scalable: Can assign 100+ cases at once, system balances automatically

### For Team Leaders
- ✅ Fair: Cases distributed based on current workload (no overloading)
- ✅ Predictable: Can plan around 10-15 case capacity
- ✅ Flexible: Can receive cases from multiple types

### For Auditors
- ✅ Balanced: Work distributed evenly across all auditors
- ✅ Real-time: Immediately routed to cases when capacity available
- ✅ Progressive: System monitors and re-routes continuously

### For System Administrators
- ✅ Configurable: Change case capacity per audit type easily
- ✅ Observable: Monitor utilization and bottlenecks
- ✅ Scalable: Automatically handles any number of Team Leaders

---

## Future Enhancements

### Phase 2: Advanced Features
1. **Skill-based Routing**: Route based on auditor skills & audit type
2. **Complexity Matching**: Match case complexity to auditor seniority
3. **Sector Expertise**: Route to auditors with sector experience
4. **Manual Override**: Allow Team Leaders to override assignments
5. **Predictive Redistribution**: Pre-emptively balance before overload
6. **Assignment History**: Full audit trail of all assignments
7. **Performance Metrics**: Track auditor productivity and quality

### Phase 3: Machine Learning
1. Learn optimal case distribution patterns
2. Predict completion times
3. Auto-adjust capacity recommendations
4. Identify bottlenecks and suggest solutions

---

## Testing Checklist

- [x] Build compiles successfully
- [x] Multiple Team Leaders get assigned cases
- [x] Cases distribute evenly across Team Leaders
- [x] Cases route to available auditors automatically
- [x] Pending cases update when auditors become available
- [x] Assignment summary shows correct auditor names
- [x] Workload balanced across all resources
- [x] Capacity respected (not overloaded)
- [x] Real-time re-routing works
- [x] Console logging shows intelligent decisions
- [x] No React errors or warnings

---

## Build Status

✅ **Exit Code: 0** - Builds successfully
✅ **126 modules transformed**
✅ **0 TypeScript errors**
✅ **0 React errors**

---

## Files Modified

- ✅ `src/utils/intelligentCaseDistribution.js` (NEW - 381 lines)
- ✅ `src/components/views/CasePrioritizationView.jsx` (UPDATED - imports + logic)

## Files Not Modified (But Integrated)

- `src/data/orgStructure.js` - Team Leaders with audit types
- `src/utils/data.js` - Case data
- `src/components/views/AssignToAuditorsView.jsx` - Team Leader workflows

---

## Conclusion

The Intelligent Case Distribution System transforms case assignment from a simple batch process into a sophisticated, real-time load-balancing engine that:

- ✅ Scales to multiple Team Leaders per audit type
- ✅ Respects capacity constraints (10-15 cases per TL)
- ✅ Routes cases dynamically to available auditors
- ✅ Monitors and re-routes in real-time
- ✅ Provides full transparency and reporting

This enables the Process Owner to handle 100+ cases at once with confidence that they'll be distributed intelligently across all available resources.
