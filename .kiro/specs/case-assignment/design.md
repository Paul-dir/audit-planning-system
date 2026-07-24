# Design: Case Assignment & Workflow Management

**Status:** Design Phase  
**Architecture:** Component-based React with state machine  
**Pattern:** Container → Assignment Views → Notifications  

---

## ARCHITECTURE OVERVIEW

```
CaseAssignmentView (Container)
├─ Tax Center Manager Flow
│  ├─ StoredCasesList (by audit type)
│  ├─ TeamLeaderSelector
│  └─ BulkAssignmentPanel
├─ Team Leader Flow
│  ├─ AssignedCasesView
│  ├─ AuditorRecommendations
│  ├─ ManualAuditorSelector
│  └─ MyAuditorsPanel
├─ Auditor Flow
│  ├─ AssignedCasesView
│  ├─ AssignmentDetailsModal
│  ├─ AssignmentActions (Accept/Reject)
│  └─ SkillsMatchDisplay
└─ State Machine (Orchestrator)
   ├─ Validate Transitions
   ├─ Update Assignment State
   ├─ Trigger Notifications
   └─ Log Audit Trail
```

---

## COMPONENT DESIGN

### 1. CaseAssignmentView (Container)

**Location:** `src/components/views/CaseAssignmentView.jsx`

**Responsibilities:**
- Determine current user role
- Route to appropriate sub-view:
  - Tax Center Manager → AssignToTeamLeadersView
  - Team Leader → AssignToAuditorsView
  - Auditor → MyAssignmentsView
  - Process Owner → CaseReallocationView
- Manage overall assignment state
- Handle state machine transitions

**State:**
```javascript
{
  userRole: string,
  storedCases: [],
  assignments: [],
  selectedCases: new Set(),
  filters: {},
  currentPage: 1,
  notifications: []
}
```

---

### 2. AssignToTeamLeadersView

**Location:** `src/components/views/assignments/AssignToTeamLeadersView.jsx`

**Shows:**
- Stored cases grouped by audit type
- For each audit type:
  - All available team leaders
  - Team leader capacity (3/12 active cases)
  - Workload indicator (color: green <60%, amber 60-80%, red >80%)
- Case cards showing:
  - TIN, Taxpayer, Risk Level, Est. Hours, Case ID
  - Status: STORED
  - [Assign to TL] button

**UI:**
```
┌─ ASSIGN STORED CASES TO TEAM LEADERS ──────────┐
│                                                 │
│ DESK AUDIT (3 stored cases)                    │
├─────────────────────────────────────────────────┤
│ Available Team Leaders:                         │
│ ├─ TL-DESK-001: 3/12 capacity ✓ (25%)         │
│ ├─ TL-DESK-002: 5/12 capacity ✓ (42%)         │
│ ├─ TL-DESK-003: 12/12 capacity ✗ (100% FULL)  │
│ └─ TL-DESK-004: 2/10 capacity ✓ (20% ⭐ BEST) │
│                                                 │
│ Cases to Assign:                                │
│ ├─ Case-001 [TIN-123] [HIGH] [120hrs]          │
│ │  [Assign to: TL-DESK-004 ▼]                 │
│ ├─ Case-002 [TIN-456] [MEDIUM] [80hrs]         │
│ │  [Assign to: TL-DESK-002 ▼]                 │
│ └─ Case-003 [TIN-789] [LOW] [40hrs]            │
│    [Assign to: TL-DESK-001 ▼]                 │
│                                                 │
│ [Auto-Assign All] [Bulk Assign]               │
└─────────────────────────────────────────────────┘
```

**Actions:**
- Auto-assign all cases (system uses rules)
- Manual assign (click case, select TL)
- Bulk select + assign to one TL
- View assignment status

---

### 3. AssignToAuditorsView

**Location:** `src/components/views/assignments/AssignToAuditorsView.jsx`

**Shows (for Team Leader):**
- Cases assigned to me (ASSIGNED_TO_TEAM_LEADER status)
- For each case:
  - Case details (TIN, taxpayer, complexity, skills needed)
  - System recommended auditors (ranked by match score)
  - My auditors list with workload
- Case card with:
  - [Assign to Auditor] button
  - [View Recommendations] link
  - [Manual Override] option

**UI:**
```
┌─ ASSIGN CASES TO MY AUDITORS ──────────────────┐
│                                                 │
│ Auditors in My Team (5):                       │
│ ├─ AUD-DESK-001: 2/6 active ✓ VAT Expert     │
│ ├─ AUD-DESK-002: 5/6 active ⚠️ NEAR CAPACITY │
│ ├─ AUD-DESK-003: 1/6 active ✓ Revenue Expert  │
│ ├─ AUD-DESK-004: 0/8 active ✓ NEW HIRE       │
│ └─ AUD-DESK-005: 3/6 active ✓ Audit Specialist│
│                                                 │
│ Cases to Assign (2):                           │
│ ┌─ Case-001 [TIN-123] ABC Manufacturing ─────┐│
│ │ Audit: DESK | Complexity: HIGH | Est: 120hrs││
│ │ Skills Needed: VAT, Revenue, TP             ││
│ │                                             ││
│ │ Recommended Auditors:                       ││
│ │ 1. AUD-DESK-001 ⭐ 87% match (VAT Expert)  ││
│ │    Skills: VAT ✓, Revenue ✓, TP ✓         ││
│ │    Workload: 2/6 ✓                         ││
│ │    [Assign]                                ││
│ │ 2. AUD-DESK-003 ⭐ 78% match               ││
│ │    [Assign]                                ││
│ │ 3. AUD-DESK-004 ⭐ 65% match               ││
│ │    [Assign]                                ││
│ │                                             ││
│ │ [Or select different auditor: ▼]           ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─ Case-002 [TIN-456] XYZ Retail ────────────┐│
│ │ [Assign to Auditor...]                     ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Features:**
- System recommends top 3 auditors (ranked by match score)
- Show why each auditor is recommended
- Manual override to select different auditor
- Bulk assign all cases

---

### 4. MyAssignmentsView (Auditor)

**Location:** `src/components/views/assignments/MyAssignmentsView.jsx`

**Shows (for Auditor):**
- Cases assigned to me (ASSIGNED_TO_AUDITOR status)
- Per case:
  - Full case details
  - Skills match % breakdown
  - Sector match indicator
  - Due date / SLA deadline
  - Assigned by: [Team Leader]
  - [Accept] [Request Re-assign] buttons

**UI:**
```
┌─ MY CASE ASSIGNMENTS ──────────────────────────┐
│ Pending Your Response (2):                     │
│                                                 │
│ ┌─ Case-001 [TIN-123] ABC Manufacturing ─────┐│
│ │ Audit Type: DESK AUDIT                      ││
│ │ Risk Level: HIGH ⚠️                          ││
│ │ Est. Hours: 120                             ││
│ │ Due Date: Aug 30, 2026 (37 days)            ││
│ │ Assigned By: Team Leader Desk A             ││
│ │ Assignment Date: Jul 24, 2026                ││
│ │                                             ││
│ │ SKILLS MATCH: 87% ✓ Good                    ││
│ │ ├─ VAT Compliance: Expert (you) vs Required  ││
│ │ ├─ Revenue: Advanced (you) vs Required       ││
│ │ └─ Transfer Pricing: Required (you don't have)││
│ │                                             ││
│ │ SECTOR MATCH: Manufacturing ✓               ││
│ │ (You have 2 years experience)               ││
│ │                                             ││
│ │ [✓ Accept Assignment] [❌ Request Re-assign]││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─ Case-002 [TIN-456] XYZ Retail ────────────┐│
│ │ [Accept] [Request Re-assign]                ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ACCEPTED (1):                                  │
│ ├─ Case-003 [Accepted Jul 25]                 │
│ │ [Start Execution] [Request Re-assign]       │
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Actions:**
- Accept assignment
- Request re-assignment (with reason)
- View full case details
- Start execution (only after accepted)

---

### 5. CaseReallocationView (Process Owner)

**Location:** `src/components/views/assignments/CaseReallocationView.jsx`

**Shows (for Process Owner):**
- All cases with assignment status
- Search/filter by status, case ID, TIN
- View current assignment chain
- [Re-allocate] button
- Re-allocation history

**UI:**
```
┌─ CASE RE-ALLOCATION (PROCESS OWNER ONLY) ─────┐
│                                                 │
│ Re-allocate Cases:                             │
│ ├─ Status: [ASSIGNED_TO_TEAM_LEADER ▼]        │
│ ├─ Search: [________]                         │
│ └─ [Search]                                   │
│                                                 │
│ Results (5):                                   │
│ ├─ Case-001 [TIN-123] → TL-DESK-001           │
│ │  Status: ASSIGNED_TO_AUDITOR (AUD-001)      │
│ │  Assigned: 5 days ago                       │
│ │  [Re-allocate]                              │
│ ├─ Case-002 [TIN-456] → TL-DESK-002           │
│ │  Status: IN_EXECUTION (AUD-002)             │
│ │  Started: 2 days ago                        │
│ │  [Re-allocate] ⚠️ In-progress case          │
│ └─ ...                                         │
│                                                 │
│ [Re-allocation Modal]:                         │
│ ├─ Current: TL-DESK-001 → AUD-001             │
│ ├─ New Team Leader: [TL-DESK-002 ▼]           │
│ ├─ New Auditor: [AUD-DESK-004 ▼]              │
│ ├─ Reason: [Workload balancing________]       │
│ └─ [Confirm Re-allocation]                    │
└─────────────────────────────────────────────────┘
```

---

## STATE MACHINE IMPLEMENTATION

**Location:** `src/utils/assignmentStateMachine.js`

```javascript
const ASSIGNMENT_STATES = {
  STORED: 'STORED',
  ASSIGNED_TO_TEAM_LEADER: 'ASSIGNED_TO_TEAM_LEADER',
  ASSIGNED_TO_AUDITOR: 'ASSIGNED_TO_AUDITOR',
  ACCEPTED_BY_AUDITOR: 'ACCEPTED_BY_AUDITOR',
  IN_EXECUTION: 'IN_EXECUTION',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  REALLOCATED: 'REALLOCATED'
};

const VALID_TRANSITIONS = {
  'STORED': ['ASSIGNED_TO_TEAM_LEADER', 'REALLOCATED'],
  'ASSIGNED_TO_TEAM_LEADER': ['ASSIGNED_TO_AUDITOR', 'REALLOCATED'],
  'ASSIGNED_TO_AUDITOR': ['ACCEPTED_BY_AUDITOR', 'ASSIGNED_TO_TEAM_LEADER', 'REALLOCATED'],
  'ACCEPTED_BY_AUDITOR': ['IN_EXECUTION', 'ASSIGNED_TO_TEAM_LEADER', 'REALLOCATED'],
  'IN_EXECUTION': ['PAUSED', 'COMPLETED', 'REALLOCATED'],
  'PAUSED': ['IN_EXECUTION', 'REALLOCATED'],
  'COMPLETED': [],
  'REALLOCATED': ['ASSIGNED_TO_TEAM_LEADER']
};

function isValidTransition(fromState, toState) {
  return VALID_TRANSITIONS[fromState]?.includes(toState) || false;
}

function executeTransition(case, fromState, toState, metadata) {
  if (!isValidTransition(fromState, toState)) {
    throw new Error(`Invalid transition: ${fromState} → ${toState}`);
  }
  
  // Update case state
  case.currentState = toState;
  case.assignmentChain.push({
    sequence: case.assignmentChain.length + 1,
    fromState,
    toState,
    timestamp: new Date().toISOString(),
    ...metadata
  });
  
  // Trigger notifications
  notificationService.sendNotification(toState, case, metadata);
  
  // Save audit trail
  auditTrail.log(case.id, fromState, toState, metadata);
  
  return case;
}
```

---

## SKILLS MATCHING ALGORITHM

**Location:** `src/utils/assignmentScoring.js`

```javascript
function calculateSkillsMatch(caseRequirements, auditorSkills) {
  // 1. How many required skills does auditor have?
  const matchedSkills = caseRequirements.filter(skill =>
    auditorSkills.find(as => as.area === skill.area)
  );
  
  const skillsMatchPercentage = (matchedSkills.length / caseRequirements.length) * 0.4;
  
  // 2. What's the proficiency level match?
  const avgProficiency = matchedSkills.reduce((sum, skill) => {
    const auditorSkill = auditorSkills.find(as => as.area === skill.area);
    const levelScore = { Expert: 1, Advanced: 0.8, Intermediate: 0.6, Basic: 0.4 };
    return sum + (levelScore[auditorSkill.level] || 0);
  }, 0) / matchedSkills.length;
  
  const proficiencyScore = (avgProficiency / 1) * 0.3;
  
  // 3. Sector experience match?
  const sectorMatch = caseData.sector && auditorSkills.some(s =>
    s.sectorExperience?.includes(caseData.sector)
  ) ? 0.1 : 0;
  
  // 4. Complexity vs Seniority match?
  const complexityLevels = { 'LOW': 'Junior', 'MEDIUM': 'Mid', 'HIGH': 'Senior' };
  const complexityMatch = complexityLevels[caseData.complexity] === auditor.seniority ? 0.2 : 0;
  
  // Total score (0-100)
  const totalScore = (skillsMatchPercentage + proficiencyScore + sectorMatch + complexityMatch) * 100;
  
  return Math.min(totalScore, 100);
}

function rankAuditors(caseData, auditorsList, teamLeaderId) {
  const scored = auditorsList
    .filter(a => a.teamLeaderId === teamLeaderId)  // Only this team's auditors
    .map(auditor => ({
      auditor,
      skillsScore: calculateSkillsMatch(caseData.requiredSkills, auditor.expertise),
      workloadScore: (1 - (auditor.currentWorkload / auditor.maxCapacity)) * 100,
      sectorScore: caseData.sector && auditor.sectorExperience?.includes(caseData.sector) ? 100 : 0,
      complexityScore: validateComplexitySeniority(caseData, auditor) ? 100 : 70
    }))
    .map(item => ({
      ...item,
      totalScore: (
        item.skillsScore * 0.4 +
        item.workloadScore * 0.3 +
        item.sectorScore * 0.2 +
        item.complexityScore * 0.1
      )
    }))
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return scored;  // Top auditors first
}
```

---

## DATA FLOW

```
Process Owner Stores Cases (CasePrioritizationView)
    ↓
System Trigger: Case status = STORED
    ↓
Assignment Engine (Background/On-Demand):
  1. Get case audit type
  2. Find Team Leaders by audit type
  3. Select best TL (lowest workload)
  4. Create assignment record (ASSIGNED_TO_TEAM_LEADER)
  5. Send notification to TL
    ↓
Team Leader Reviews Cases:
  1. View cases assigned to them
  2. System recommends auditors (scoring algorithm)
  3. TL selects auditor (auto or manual)
  4. Update assignment (ASSIGNED_TO_AUDITOR)
  5. Send notification to auditor
    ↓
Auditor Reviews Assignment:
  1. View assigned case
  2. See skills match %
  3. Accept or request re-assign
  4. If accept: Update state to ACCEPTED_BY_AUDITOR
  5. Notification to TL
    ↓
Auditor Starts Execution:
  1. Click "Start Execution"
  2. Case unlocked
  3. State: IN_EXECUTION
  4. Notifications sent
```

---

## NOTIFICATION FLOW

```
Event: Case assigned to Team Leader
  ├─ Send to: Team Leader
  ├─ Type: IN_APP + EMAIL
  ├─ Content: "[X] cases assigned for auditor assignment"
  └─ Link: Go to "Assign Cases" view

Event: Case assigned to Auditor
  ├─ Send to: Auditor
  ├─ Type: IN_APP + EMAIL
  ├─ Content: "Case assigned: [Taxpayer]"
  └─ Link: Go to "My Assignments" view

Event: Auditor accepts assignment
  ├─ Send to: Team Leader
  ├─ Type: IN_APP
  ├─ Content: "Auditor [Name] accepted assignment"
  └─ Link: View assignment status

Event: SLA Deadline approaching
  ├─ Send to: Team Leader + Process Owner
  ├─ Type: IN_APP + EMAIL
  ├─ Content: "Case [TIN] - Assignment pending for X days"
  └─ Link: View case details

Event: Case re-allocated
  ├─ Send to: Current owner + New owner
  ├─ Type: IN_APP + EMAIL
  ├─ Content: "Case re-allocated by Process Owner"
  └─ Link: View assignment details
```

---

## ERROR HANDLING

1. **Invalid State Transition**
   - Error: "Cannot transition from COMPLETED to IN_EXECUTION"
   - Action: Prevent operation, show error message

2. **Capacity Exceeded**
   - Error: "Auditor at max capacity (6/6 cases)"
   - Action: Recommend different auditor or acknowledge override

3. **Missing Auditors**
   - Error: "No auditors available in this team"
   - Action: Show alert, notify team leader

4. **Race Condition**
   - Error: "Case assigned by another TL while you were reviewing"
   - Action: Reload assignment, show conflict notification

---

## NEXT PHASE: TASKS

All components and flows defined above.
See `tasks.md` for detailed implementation tasks.

