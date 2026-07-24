# Spec: Case Assignment & Workflow Management

**Status:** Requirements Phase  
**Priority:** High  
**Target Version:** v2.3  
**Feature Type:** Case execution workflow - links case prioritization to audit execution  

---

## OVERVIEW

Enable smooth handoff of stored audit cases from Process Owner → Tax Center Manager → Team Leaders → Auditors through an **automated, intelligent assignment system** that:
1. Automatically matches cases to team leaders by audit type
2. Recommends auditor assignments based on skills, workload, sector experience
3. Manages case state transitions to prevent conflicts
4. Tracks assignment chain with full audit trail
5. Allows Process Owner to re-allocate cases if needed
6. Monitors SLA compliance (alerts if case not started after deadline)

---

## ORGANIZATIONAL STRUCTURE

### Team Leader Model
- **Specialization:** ONE Team Leader per audit type per tax center
  - E.g., "TL-DESK-001" handles all DESK audits in "Addis Ababa TC1"
  - "TL-FIELD-001" handles all FIELD audits in same TC
  - etc. (6 audit types per TC)
- **Reporting:** One Team Leader per audit type per tax center
- **Auditors:** Reports 3-10 auditors who report ONLY to that team leader
- **Capacity:** Tracks workload (current assignments / max capacity)

### Auditor Model
- **Reporting:** Reports to EXACTLY ONE Team Leader
- **Specialization:** Matches team leader's audit type
- **Skills:** Has expertise areas (VAT, Revenue, Transfer Pricing, etc.)
- **Sector Experience:** Has business sector knowledge (Manufacturing, Retail, etc.)
- **Workload:** Tracks active assignments vs capacity
- **Seniority:** Senior, Mid, or Junior level

### Assignment Hierarchy
```
Case (STORED)
  ↓
  Assigned to Team Leader (by audit type)
  ↓
  Team Leader assigns to specific Auditor
  ↓
  Auditor accepts assignment
  ↓
  Auditor starts execution (case unlocked)
```

---

## FR1: Team Leader & Auditor Configuration

### FR1.1 Team Leader Setup
- System must support N team leaders per audit type per tax center
  - Minimum: 1 (if only 1 TL available for DESK)
  - Typical: 3-5 per audit type
  - Maximum: 8-10 per audit type
- Each team leader has:
  - Name, email, expertise area
  - Assigned auditors (list of auditor IDs)
  - Current workload (# of active cases)
  - Max capacity (max # concurrent cases)
  - Status: ACTIVE, ON_LEAVE, INACTIVE
  - Years of experience, certifications

### FR1.2 Auditor Setup
- Each auditor reports to EXACTLY ONE team leader
- Each auditor has:
  - Name, email, seniority level
  - Team Leader ID (reference)
  - Expertise areas with proficiency level (Expert, Advanced, Intermediate, Basic)
  - Business sector experience (Manufacturing, Retail, Financial Services, etc.)
  - Current workload (# active cases)
  - Max capacity
  - Status: ACTIVE, ON_LEAVE, UNAVAILABLE
  - Years of experience, certifications

### FR1.3 Assignment Rules Configuration
**System must be configurable with rules for automatic assignment:**
- Rule 1: Match case audit type to team leader's specialization
- Rule 2: Prefer team leaders with available capacity (not overloaded)
- Rule 3: Balance workload across team leaders of same type
- Rule 4: For auditor selection within a team:
  - Match case complexity to auditor seniority
  - Match case sector to auditor sector experience
  - Match case skills requirement to auditor expertise
  - Balance workload across team's auditors
- Rule 5: SLA deadline = today + configurable days (e.g., 5 days)

---

## FR2: Automatic Case Assignment (System Process)

### FR2.1 Assignment Trigger
**Trigger:** When Process Owner stores cases (STORED status)

**Automatic Flow:**
1. System retrieves stored cases (status = STORED)
2. For each case:
   - Find Team Leader matching case.auditType
   - Check available team leaders (not overloaded)
   - Recommend best team leader (lowest workload)
   - Assign case to team leader → Status: ASSIGNED_TO_TEAM_LEADER
   - Send notification to team leader

### FR2.2 Automatic Auditor Assignment
**Process (triggered by Team Leader OR by system after X hours):**

1. Team Leader reviews assigned cases
2. System recommends auditors based on:
   - Skills match score (0-100) for case requirements vs auditor expertise
   - Workload balance (prefer auditors with available capacity)
   - Sector match (case sector vs auditor sector experience)
   - Case complexity vs auditor seniority
3. Team leader can:
   - Accept system recommendation → Auto-assign
   - Override and assign to different auditor
   - Request system recalculate recommendation

4. Case assigned to auditor → Status: ASSIGNED_TO_AUDITOR
5. Notification sent to auditor

### FR2.3 Assignment Scoring Algorithm
```
SKILLS_MATCH = (
  (expertise_match_count / total_case_skills) * 0.4 +
  (average_proficiency_level / 5) * 0.3
)

WORKLOAD_SCORE = (1 - (auditor_current / auditor_max)) * 0.2

SECTOR_MATCH = (sector_match_found ? 0.1 : 0)

SENIORITY_MATCH = (
  case_complexity === auditor_seniority ? 0.2 : 0
)

TOTAL_SCORE = (SKILLS + WORKLOAD + SECTOR + SENIORITY) * 100
Range: 0-100, where 80+ is "Good match"
```

---

## FR3: Case State Machine & Transitions

### FR3.1 Case States
```
STORED
  ↓ (Tax Manager assigns to Team Leader)
ASSIGNED_TO_TEAM_LEADER
  ├─ (Team Leader assigns to Auditor)
  └─ (Auditor gets notification)
      ↓
ASSIGNED_TO_AUDITOR
  ├─ (Auditor accepts)
  └─ Auditor can request re-assignment
      ↓
ACCEPTED_BY_AUDITOR
  ├─ (Auditor starts work)
  └─ Case unlocked for execution
      ↓
IN_EXECUTION
  ├─ (Work progressing)
  ├─ (Can pause if needed)
  └─ (Can be re-allocated by Process Owner)
      ↓
PAUSED / REALLOCATED / COMPLETED
```

### FR3.2 Valid Transitions
```
STORED:
  → ASSIGNED_TO_TEAM_LEADER (automatic)
  → REALLOCATED (Process Owner re-allocates)

ASSIGNED_TO_TEAM_LEADER:
  → ASSIGNED_TO_AUDITOR (Team Leader assigns)
  → REALLOCATED (Process Owner re-allocates)

ASSIGNED_TO_AUDITOR:
  → ACCEPTED_BY_AUDITOR (Auditor accepts)
  → ASSIGNED_TO_TEAM_LEADER (Auditor requests re-assign)
  → REALLOCATED (Process Owner re-allocates)

ACCEPTED_BY_AUDITOR:
  → IN_EXECUTION (Auditor starts)
  → ASSIGNED_TO_TEAM_LEADER (Auditor declines)
  → REALLOCATED (Process Owner re-allocates)

IN_EXECUTION:
  → PAUSED (Temporary stop)
  → COMPLETED (Work done)
  → REALLOCATED (Process Owner re-allocates)

PAUSED:
  → IN_EXECUTION (Resume)
  → REALLOCATED (Process Owner re-allocates)

COMPLETED / REALLOCATED:
  Terminal or restart from STORED
```

### FR3.3 State Validation
- **Prevent invalid transitions** (throw error)
- **Maintain audit trail** of all transitions
- **Block execution start** until state = ACCEPTED_BY_AUDITOR
- **Require authorization** for re-allocation (Process Owner only)

---

## FR4: Assignment Views by Role

### FR4.1 Tax Center Manager View
**"Assign Stored Cases to Team Leaders"**
- List stored cases grouped by audit type
- For each audit type:
  - Show available team leaders
  - Display team leader capacity (X/Y active cases)
  - Show which TL has lowest workload (recommendation)
- Manual assignment options:
  - Click case → Assign to selected TL
  - Bulk select cases → Assign all to TL
  - System default (auto-assign using rules)
- View current assignments (status per case)

### FR4.2 Team Leader View
**"Assign Cases to My Auditors"**
- List cases assigned to this team leader (status: ASSIGNED_TO_TEAM_LEADER)
- For each case:
  - Show case details (TIN, taxpayer, complexity, skills needed)
  - Show recommended auditors ranked by match score
  - Auditor card shows: name, skills, workload, sector experience
- Assignment options:
  - Accept system recommendation (auto-assign)
  - Manually select different auditor
  - Request system recalculate
  - Bulk assign to multiple auditors
- Track my auditors:
  - List all my auditors with current workload
  - Capacity utilization per auditor

### FR4.3 Auditor View
**"My Assignments"**
- List cases assigned to me (status: ASSIGNED_TO_AUDITOR)
- Per case show:
  - Case details (taxpayer, TIN, audit type, complexity)
  - Risk level, estimated hours
  - Skills match score (%, breakdown)
  - Sector match indicator
  - Due date / SLA deadline
  - Assigned by: [Team Leader name]
  - Assignment date
- Actions:
  - Accept assignment → Case moves to ACCEPTED_BY_AUDITOR
  - Request re-assignment to different auditor (reason required)
  - View case details (stored treatment plan, risk profile)
- Once accepted:
  - Start case execution button (unlocks case for work)
  - Case moves to IN_EXECUTION
  - Links to execution/audit tools

---

## FR5: Assignment Notifications

### FR5.1 Notification Types
1. **Team Leader Assignment**
   - Trigger: Case assigned to team leader
   - To: Team Leader
   - Content: "X cases assigned to you for auditor assignment by [Tax Manager]"
   - Link: Go to "Assign Cases" view

2. **Auditor Assignment**
   - Trigger: Case assigned to auditor
   - To: Auditor
   - Content: "Case assigned: [TIN] [Taxpayer] assigned by [Team Leader]"
   - Link: Go to "My Assignments" view

3. **Assignment Accepted**
   - Trigger: Auditor accepts assignment
   - To: Team Leader
   - Content: "Auditor [Name] accepted case assignment for [Taxpayer]"

4. **Re-assignment Request**
   - Trigger: Auditor requests re-assignment
   - To: Team Leader + Process Owner
   - Content: "Auditor [Name] requested re-assignment for case [TIN]: [Reason]"

5. **SLA Alert**
   - Trigger: Case not started after SLA deadline
   - To: Team Leader + Process Owner
   - Content: "Case [TIN] assigned to [Auditor] but NOT STARTED - assigned X days ago"

### FR5.2 Delivery Methods
- In-system notifications (toast/banner)
- Email notifications (configurable)
- Dashboard alerts (high priority)

---

## FR6: Re-allocation by Process Owner

### FR6.1 Re-allocation Capability
- **Only Process Owner can re-allocate**
- **Allowed at any state:**
  - ASSIGNED_TO_TEAM_LEADER (reassign to different TL)
  - ASSIGNED_TO_AUDITOR (reassign to different auditor or TL)
  - IN_EXECUTION (emergency re-assignment)

### FR6.2 Re-allocation Flow
1. Process Owner views case
2. Selects "Re-allocate Case"
3. Chooses new Team Leader (by audit type)
4. If needed, chooses new Auditor
5. Provides reason for re-allocation
6. Confirms re-allocation

### FR6.3 Re-allocation Effects
- Case status → REALLOCATED
- Previous assignments recorded in audit trail
- New notifications sent
- Audit trail maintained (who → who → when → why)
- If case IN_EXECUTION:
  - Current auditor notified
  - New auditor takes over
  - Execution history preserved

---

## FR7: SLA Monitoring & Alerts

### FR7.1 SLA Configuration
- Configurable deadline: e.g., "Alert if case not started within 5 days"
- Start point: Assignment to auditor date
- Deadline: Start date + N days

### FR7.2 SLA Checks
- Daily background job checks:
  - Cases in ASSIGNED_TO_AUDITOR for > N days
  - Cases in ACCEPTED_BY_AUDITOR but not started for > N days
- Alert types:
  - Yellow: 1-2 days before deadline
  - Red: Past deadline
  - Critical: 2+ weeks overdue

### FR7.3 Alert Actions
- Alert sent to: Team Leader + Process Owner
- Suggested actions:
  - Follow up with auditor
  - Re-allocate to another auditor
  - Adjust due date (if justified)

---

## FR8: Assignment Audit Trail

### FR8.1 Track Every Transition
```javascript
assignment_history: [
  {
    sequence: 1,
    fromState: 'STORED',
    toState: 'ASSIGNED_TO_TEAM_LEADER',
    fromUser: 'System',
    toUser: 'TL-DESK-001',
    timestamp: ISO8601,
    reason: 'Automatic assignment by system',
    matchScore: null
  },
  {
    sequence: 2,
    fromState: 'ASSIGNED_TO_TEAM_LEADER',
    toState: 'ASSIGNED_TO_AUDITOR',
    fromUser: 'TL-DESK-001',
    toUser: 'AUD-001',
    timestamp: ISO8601,
    reason: 'Manual assignment by team leader',
    matchScore: 0.87,  // 87% skills match
    recommendedAuditors: ['AUD-001', 'AUD-002', 'AUD-003'],
    selectedReason: 'Best match - VAT expert, low workload'
  },
  {
    sequence: 3,
    fromState: 'ASSIGNED_TO_AUDITOR',
    toState: 'ACCEPTED_BY_AUDITOR',
    fromUser: 'AUD-001',
    toUser: 'AUD-001',
    timestamp: ISO8601,
    reason: 'Auditor accepted assignment'
  }
]
```

---

## DATA STRUCTURES

### Team Leader Document
```javascript
{
  id: 'TL-DESK-TC1-001',
  region: 'Addis Ababa',
  taxCenter: 'Addis Ababa TC1',
  auditType: 'desk_audit',  // ONLY ONE audit type
  fullName: 'Team Leader Desk A',
  email: 'tl.desk.a@mor.gov.et',
  expertise: ['VAT', 'Revenue', 'Documentation', 'Withholding Tax'],
  assignedAuditors: ['AUD-DESK-001', 'AUD-DESK-002', 'AUD-DESK-003'],
  currentWorkload: 5,  // active cases
  maxCapacity: 12,
  yearsExperience: 15,
  certifications: ['CPA', 'ACCA'],
  status: 'ACTIVE',
  createdDate: ISO8601,
  lastModified: ISO8601
}
```

### Auditor Document
```javascript
{
  id: 'AUD-DESK-001',
  region: 'Addis Ababa',
  taxCenter: 'Addis Ababa TC1',
  teamLeaderId: 'TL-DESK-TC1-001',
  auditType: 'desk_audit',  // Same as team leader
  fullName: 'Auditor A',
  email: 'auditor.a@mor.gov.et',
  seniority: 'Senior',  // Senior, Mid, Junior
  yearsExperience: 8,
  expertise: [
    { area: 'VAT Compliance', level: 'Expert' },      // Expert, Advanced, Intermediate, Basic
    { area: 'Revenue Recognition', level: 'Advanced' },
    { area: 'Transfer Pricing', level: 'Intermediate' }
  ],
  sectorExperience: ['Manufacturing', 'Retail'],
  currentWorkload: 3,  // active cases
  maxCapacity: 6,
  certifications: ['CPA'],
  status: 'ACTIVE',  // ACTIVE, ON_LEAVE, UNAVAILABLE
  createdDate: ISO8601,
  lastModified: ISO8601
}
```

### Assignment Document
```javascript
{
  id: 'ASSIGN-CASE-001-001',
  caseId: 'CASE-001',
  region: 'Addis Ababa',
  taxCenter: 'Addis Ababa TC1',
  auditType: 'desk_audit',
  
  currentState: 'ASSIGNED_TO_AUDITOR',
  currentOwner: 'AUD-DESK-001',  // Current auditor/team leader
  
  assignmentChain: [
    {
      sequence: 1,
      fromState: 'STORED',
      toState: 'ASSIGNED_TO_TEAM_LEADER',
      toUser: 'TL-DESK-TC1-001',
      timestamp: ISO8601,
      assignedBy: 'System',
      reason: 'Automatic assignment'
    },
    {
      sequence: 2,
      fromState: 'ASSIGNED_TO_TEAM_LEADER',
      toState: 'ASSIGNED_TO_AUDITOR',
      toUser: 'AUD-DESK-001',
      timestamp: ISO8601,
      assignedBy: 'TL-DESK-TC1-001',
      reason: 'Manual assignment by team leader',
      matchScore: 0.87
    }
  ],
  
  slaDeadline: ISO8601,
  executionStartDate: null,
  status: 'PENDING_AUDITOR_RESPONSE',  // Auditor hasn't accepted yet
  notifications: [
    { toUser: 'TL-DESK-TC1-001', type: 'TEAM_LEADER_ASSIGNMENT', status: 'SENT' },
    { toUser: 'AUD-DESK-001', type: 'AUDITOR_ASSIGNMENT', status: 'SENT' }
  ]
}
```

---

## PERMISSIONS

**Process Owner:**
```javascript
[
  'view_stored_cases',
  'assign_cases_to_team_leaders',
  'reallocate_cases',  // ONLY Process Owner has this
  'view_assignment_status',
  'view_audit_trail'
]
```

**Tax Center Manager:**
```javascript
[
  'view_stored_cases',
  'assign_cases_to_team_leaders',
  'view_assignment_status'
]
```

**Team Leader:**
```javascript
[
  'view_assigned_cases',
  'assign_cases_to_auditors',
  'view_my_auditors',
  'request_case_reallocation',  // Notify Process Owner
  'view_assignment_status'
]
```

**Auditor:**
```javascript
[
  'view_assigned_cases',
  'accept_case_assignment',
  'request_case_reallocation',
  'start_case_execution'
]
```

---

## INTEGRATION POINTS

1. **After Case Prioritization** - Stored cases feed into assignment
2. **Before Audit Execution** - Case must be ACCEPTED_BY_AUDITOR
3. **Notifications System** - Sends emails/in-app alerts
4. **Audit Trail** - Historical tracking
5. **SLA Monitoring** - Background job/scheduler

---

## SUCCESS CRITERIA

✅ Multiple team leaders per audit type per tax center  
✅ Automatic case-to-TL matching by audit type  
✅ Smart auditor recommendations (skills, workload, sector)  
✅ State machine prevents invalid transitions  
✅ Full audit trail of all assignments  
✅ SLA alerts generated correctly  
✅ Process Owner can re-allocate at any state  
✅ Notifications sent to appropriate roles  
✅ No conflicts or race conditions  
✅ Case locked until auditor accepts  

