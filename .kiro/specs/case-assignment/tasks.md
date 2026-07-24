# Tasks: Case Assignment & Workflow Management

**Status:** Ready for Implementation  
**Priority:** High  
**Target:** v2.3  

---

## TASK LIST

### PHASE A: Configuration & Data Models (Tier 1)

#### T-A.1 Create Team Leader & Auditor Data Models
**File:** `src/utils/assignmentDataModels.js`

**Acceptance Criteria:**
- [ ] Team Leader schema with: id, region, taxCenter, auditType, fullName, email, expertise[], assignedAuditors[], currentWorkload, maxCapacity, yearsExperience, certifications[], status
- [ ] Auditor schema with: id, region, taxCenter, teamLeaderId, auditType, fullName, email, seniority, yearsExperience, expertise[], sectorExperience[], currentWorkload, maxCapacity, certifications[], status
- [ ] Assignment schema with: id, caseId, region, taxCenter, auditType, currentState, currentOwner, assignmentChain[], slaDeadline, executionStartDate, status, notifications[]
- [ ] Helper functions to create, update, validate schemas
- [ ] No console errors

---

#### T-A.2 Create State Machine Utility
**File:** `src/utils/assignmentStateMachine.js`

**Acceptance Criteria:**
- [ ] Define ASSIGNMENT_STATES constant with all 8 states
- [ ] Define VALID_TRANSITIONS mapping
- [ ] isValidTransition(from, to) function validates transitions
- [ ] executeTransition(case, from, to, metadata) executes and logs
- [ ] Prevents invalid transitions (throws error)
- [ ] Maintains audit trail on each transition
- [ ] No console errors

---

#### T-A.3 Create Assignment Scoring Algorithm
**File:** `src/utils/assignmentScoring.js`

**Acceptance Criteria:**
- [ ] calculateSkillsMatch(caseRequirements, auditorSkills) returns 0-100
- [ ] Rankings: Skills 40%, Proficiency 30%, Sector 20%, Complexity 10%
- [ ] rankAuditors(caseData, auditors, teamLeaderId) returns sorted array
- [ ] Top 3 auditors recommended with score breakdown
- [ ] Considers workload balance (prefer lower workload)
- [ ] Prevents overloaded auditors from recommendations
- [ ] Returns results ordered by total score (highest first)
- [ ] No console errors

---

#### T-A.4 Add Configuration to AuthContext
**File:** `src/context/AuthContext.jsx`

**Acceptance Criteria:**
- [ ] Add new permissions:
  - 'assign_cases_to_team_leaders' (Process Owner, Tax Manager)
  - 'assign_cases_to_auditors' (Team Leader)
  - 'accept_case_assignment' (Auditor)
  - 'reallocate_cases' (Process Owner ONLY)
  - 'view_assignment_status' (all roles)
- [ ] Add roles for Team Leader and Auditor (not in system yet, but ready)
- [ ] Update ROLE_PERMISSIONS mapping
- [ ] No console errors

---

### PHASE B: Data Loading & Storage (Tier 2)

#### T-B.1 Create Load Team Leaders Function
**File:** `src/utils/data.js` or new `src/utils/assignmentData.js`

**Acceptance Criteria:**
- [ ] loadTeamLeaders(region, taxCenter) returns array
- [ ] Filters by region and taxCenter
- [ ] Loads from localStorage or default data
- [ ] Returns all 6 audit types' team leaders (1 TL each or more)
- [ ] Includes current workload and capacity
- [ ] Handles missing data gracefully
- [ ] No console errors

---

#### T-B.2 Create Load Auditors Function
**File:** `src/utils/assignmentData.js`

**Acceptance Criteria:**
- [ ] loadAuditors(teamLeaderId) returns array
- [ ] Filters by team leader
- [ ] Loads all auditors assigned to that TL
- [ ] Includes expertise, sector experience, workload
- [ ] Handles missing auditors gracefully
- [ ] No console errors

---

#### T-B.3 Create Load Assignments Function
**File:** `src/utils/assignmentData.js`

**Acceptance Criteria:**
- [ ] loadAssignments(caseId) returns assignment record
- [ ] loadAssignmentsByState(state, taxCenter) returns array
- [ ] loadAssignmentsByUser(userId, role) returns user's assignments
- [ ] Returns full assignment chain and history
- [ ] No console errors

---

#### T-B.4 Create Save Assignment Function
**File:** `src/utils/assignmentData.js`

**Acceptance Criteria:**
- [ ] saveAssignment(assignment) persists to localStorage
- [ ] Creates assignment record if not exists
- [ ] Updates existing assignment
- [ ] Logs audit trail entry
- [ ] Updates case status
- [ ] Updates team leader/auditor workload
- [ ] Returns saved assignment
- [ ] No console errors

---

### PHASE C: Assignment Views (Tier 3)

#### T-C.1 Create AssignToTeamLeadersView
**File:** `src/components/views/assignments/AssignToTeamLeadersView.jsx`

**Acceptance Criteria:**
- [ ] Displays stored cases grouped by audit type
- [ ] Shows available team leaders per audit type
- [ ] Displays TL capacity with color coding (green <60%, amber 60-80%, red >80%)
- [ ] Highlights best TL (lowest workload) with ⭐
- [ ] [Assign to TL] button per case
- [ ] [Auto-Assign All] button
- [ ] [Bulk Assign] for multiple cases
- [ ] View shows assignment status
- [ ] Pagination or scrolling for many cases
- [ ] No console errors

---

#### T-C.2 Create AssignToAuditorsView
**File:** `src/components/views/assignments/AssignToAuditorsView.jsx`

**Acceptance Criteria:**
- [ ] Shows cases assigned to current team leader (ASSIGNED_TO_TEAM_LEADER state)
- [ ] For each case, displays:
  - Case details (TIN, taxpayer, complexity)
  - Top 3 recommended auditors with match score %
  - Match score breakdown (Skills, Workload, Sector, Complexity)
  - [Assign] button per auditor
- [ ] Shows my auditors list with workload
- [ ] Manual auditor selector (dropdown)
- [ ] [Assign to: Auditor] action
- [ ] Bulk assignment capability
- [ ] Prevents over-capacity assignments (shows warning)
- [ ] Success message on assignment
- [ ] No console errors

---

#### T-C.3 Create MyAssignmentsView (Auditor)
**File:** `src/components/views/assignments/MyAssignmentsView.jsx`

**Acceptance Criteria:**
- [ ] Shows cases assigned to auditor (ASSIGNED_TO_AUDITOR state)
- [ ] Displays per case:
  - Full case details (TIN, taxpayer, audit type, risk, hours)
  - Skills match % with breakdown
  - Sector match indicator (✓ or ✗)
  - Due date / SLA deadline
  - Assigned by: [Team Leader]
  - Assignment date
- [ ] [✓ Accept Assignment] button
- [ ] [❌ Request Re-assign] button with reason field
- [ ] Accepted cases section with [Start Execution] button
- [ ] Case details on click/expand
- [ ] No console errors

---

#### T-C.4 Create CaseReallocationView (Process Owner)
**File:** `src/components/views/assignments/CaseReallocationView.jsx`

**Acceptance Criteria:**
- [ ] Search/filter by case ID, TIN, status, assigned user
- [ ] Shows all cases with current assignment
- [ ] Displays: Case → TL → Auditor chain
- [ ] Shows assignment status and timeline
- [ ] [Re-allocate] button per case
- [ ] Re-allocation modal with:
  - Current assignment chain
  - New Team Leader selector
  - New Auditor selector (populates based on TL)
  - Reason field (required)
  - [Confirm Re-allocation] button
- [ ] Updates case state to REALLOCATED
- [ ] Sends notifications to old and new owners
- [ ] Shows re-allocation history
- [ ] No console errors

---

### PHASE D: Notification System (Tier 4)

#### T-D.1 Create Assignment Notification Service
**File:** `src/services/notificationService.js` (may already exist)

**Acceptance Criteria:**
- [ ] sendTeamLeaderAssignmentNotification(teamLeader, caseCount)
- [ ] sendAuditorAssignmentNotification(auditor, caseData)
- [ ] sendAssignmentAcceptedNotification(teamLeader, caseData, auditor)
- [ ] sendReallocationNotification(oldOwner, newOwner, caseData, reason)
- [ ] sendSLAAlertNotification(teamLeader, processOwner, caseData)
- [ ] Each notification includes link to relevant view
- [ ] Supports in-app + email delivery
- [ ] Logs notifications in assignment record
- [ ] No console errors

---

#### T-D.2 Create SLA Monitoring Job
**File:** `src/utils/slaMonitoring.js` or `src/background/slaChecker.js`

**Acceptance Criteria:**
- [ ] Background job runs daily (or on-demand)
- [ ] Checks assignments in ASSIGNED_TO_AUDITOR or ACCEPTED_BY_AUDITOR state
- [ ] Compares slaDeadline to today
- [ ] Generates alerts for cases past deadline
- [ ] Sends notifications to Team Leader + Process Owner
- [ ] Marks alert as sent (prevent duplicate alerts)
- [ ] Handles edge cases (no deadline, completed cases)
- [ ] No console errors

---

### PHASE E: Integration & Routing (Tier 5)

#### T-E.1 Add Routes to Views
**File:** `src/components/roleViews/ProcessOwnerView.jsx`

**Acceptance Criteria:**
- [ ] Add import for CaseAssignmentView (router component)
- [ ] Add case: 'case-assignment' to renderContent()
- [ ] Returns CaseAssignmentView with appropriate role
- [ ] No console errors

---

#### T-E.2 Add Routes to Team Leader & Auditor Views
**Files:** TBD when Team Leader and Auditor views exist

**Acceptance Criteria:**
- [ ] Team Leader can access AssignToAuditorsView
- [ ] Auditor can access MyAssignmentsView
- [ ] Routes integrated with role-based navigation
- [ ] No console errors

---

#### T-E.3 Add Menu Items to Sidebar
**File:** `src/components/Sidebar.jsx`

**Acceptance Criteria:**
- [ ] Process Owner: "Case Assignment" menu item (icon: fas fa-tasks)
- [ ] Tax Center Manager: "Assign to Team Leaders" menu item
- [ ] Team Leader: "Assign to Auditors" menu item (if role exists)
- [ ] Auditor: "My Assignments" menu item (if role exists)
- [ ] Permission-based visibility
- [ ] No console errors

---

#### T-E.4 Link from CasePrioritizationView
**File:** `src/components/views/CasePrioritizationView.jsx`

**Acceptance Criteria:**
- [ ] After storing cases, show message: "Cases stored. [Next: Assign to Team Leaders]"
- [ ] [Next] button links to Case Assignment view
- [ ] Or auto-suggest next step
- [ ] No console errors

---

### PHASE F: Build & Testing (Tier 6)

#### T-F.1 Build & Verify
**Command:**
```bash
npm run build
```

**Acceptance Criteria:**
- [ ] Build succeeds with 0 errors
- [ ] Build succeeds with 0 warnings
- [ ] All new files included
- [ ] No import errors
- [ ] Bundle size acceptable

---

#### T-F.2 Integration Testing
**Manual test scenarios:**

**Scenario 1: Process Owner stores cases → Team Manager assigns to TL**
- [ ] Store 3 cases in CasePrioritizationView
- [ ] Cases visible in AssignToTeamLeadersView
- [ ] Assign to different team leaders
- [ ] Verify assignments saved

**Scenario 2: Team Leader assigns to auditors**
- [ ] Login as team leader
- [ ] View assigned cases
- [ ] See recommended auditors (ranked by match score)
- [ ] Assign case to top auditor
- [ ] Verify assignment saved and notification sent

**Scenario 3: Auditor accepts assignment**
- [ ] Login as auditor
- [ ] View assigned case
- [ ] See skills match % breakdown
- [ ] Accept assignment
- [ ] Case moves to ACCEPTED_BY_AUDITOR
- [ ] Verify team leader notified

**Scenario 4: Multi-user simultaneous access**
- [ ] Multiple team leaders assign simultaneously
- [ ] No race conditions
- [ ] All assignments saved correctly

**Scenario 5: Process Owner re-allocates**
- [ ] Process owner views case in re-allocation view
- [ ] Re-allocate case to different auditor
- [ ] Case state changes to REALLOCATED
- [ ] Audit trail updated
- [ ] Old and new owners notified

---

#### T-F.3 State Machine Testing
**Test valid transitions:**
- [ ] STORED → ASSIGNED_TO_TEAM_LEADER ✓
- [ ] ASSIGNED_TO_TEAM_LEADER → ASSIGNED_TO_AUDITOR ✓
- [ ] ASSIGNED_TO_AUDITOR → ACCEPTED_BY_AUDITOR ✓
- [ ] ACCEPTED_BY_AUDITOR → IN_EXECUTION ✓

**Test invalid transitions (should fail):**
- [ ] STORED → ACCEPTED_BY_AUDITOR ✗
- [ ] COMPLETED → IN_EXECUTION ✗
- [ ] IN_EXECUTION → ASSIGNED_TO_TEAM_LEADER ✗

---

#### T-F.4 Scoring Algorithm Testing
**Test calculations:**
- [ ] Skills match scored correctly (40% weight)
- [ ] Workload considered (30% weight)
- [ ] Sector experience considered (20% weight)
- [ ] Complexity/Seniority match (10% weight)
- [ ] Total score 0-100 range
- [ ] Auditors ranked correctly by score
- [ ] Top 3 recommendations returned

---

#### T-F.5 Git Commit
**Acceptance Criteria:**
- [ ] All changes staged and committed
- [ ] Commit message descriptive
- [ ] All new files included
- [ ] All modifications included
- [ ] Commit pushed to main branch

---

## DEPENDENCY GRAPH

```
AssignmentStateMachine (ROOT)
├─ ROLE_PERMISSIONS (AuthContext)
├─ DataModels (schemas)
├─ AssignmentScoring (algorithm)
│  └─ rankAuditors()
├─ AssignmentData (I/O)
│  ├─ loadTeamLeaders()
│  ├─ loadAuditors()
│  ├─ loadAssignments()
│  └─ saveAssignment()
├─ AssignmentViews (UI)
│  ├─ AssignToTeamLeadersView
│  ├─ AssignToAuditorsView
│  ├─ MyAssignmentsView
│  └─ CaseReallocationView
├─ NotificationService
│  └─ sendAssignmentNotification()
└─ SLAMonitoring
   └─ checkSLADeadlines()
```

---

## TESTING CHECKLIST

### Unit Tests
- [ ] State machine transitions validated
- [ ] Invalid transitions rejected
- [ ] Scoring algorithm calculations correct
- [ ] Data loading functions work
- [ ] Save functions persist data

### Integration Tests
- [ ] Case flows from STORED → ACCEPTED_BY_AUDITOR
- [ ] Notifications sent at each state change
- [ ] Workload tracked correctly
- [ ] Capacity limits enforced
- [ ] Re-allocation updates audit trail

### Manual Tests
- [ ] Multi-role workflow end-to-end
- [ ] UI displays correctly all roles
- [ ] Buttons trigger correct actions
- [ ] Modals open/close properly
- [ ] Recommendations ranked by score
- [ ] Notifications received
- [ ] SLA alerts generated
- [ ] No console errors or warnings

---

## SUCCESS CRITERIA (Overall)

✅ Multiple team leaders per audit type per tax center  
✅ Automatic case-to-TL matching by audit type  
✅ Smart auditor recommendations (skills 40%, workload 30%, sector 20%, complexity 10%)  
✅ State machine prevents invalid transitions  
✅ Full audit trail maintained  
✅ SLA alerts generated  
✅ Process Owner can re-allocate at any state  
✅ Notifications sent to appropriate roles  
✅ No conflicts or race conditions  
✅ Dynamic multi-user access (simultaneous assignments)  
✅ Build completes successfully  

---

## NOTES

- All components use custom CSS (no Tailwind)
- All data persisted to localStorage
- Audit trail immutable (append-only)
- Notifications can be in-app + email
- SLA job can run daily or on-demand
- Re-allocation requires Process Owner authorization only
- Auditor can request re-assignment (goes to Team Leader for review)
- State transitions logged immediately
- No delays or queues (synchronous for now)

---

## NEXT PHASES (Future)

After PHASE F completes, future enhancements:
- PHASE G: Automatic auditor assignment (system assigns without TL review)
- PHASE H: Workload balancing algorithms
- PHASE I: Skill-gap identification and training recommendations
- PHASE J: Auditor performance tracking
- PHASE K: Audit execution interface (IN_EXECUTION case handling)

