# Case Assignment & Workflow Management - Complete Spec Summary

**Commit:** 81327fb  
**Date:** July 24, 2026  
**Status:** ✅ READY FOR IMPLEMENTATION  

---

## 🎯 What This Spec Defines

This spec bridges the gap between **Case Prioritization** (where cases are selected) and **Audit Execution** (where auditors do the work).

It creates a **dynamic, multi-role workflow** that automatically and intelligently assigns audit cases from:
- **Process Owner** (stores cases)
- → **Tax Center Manager** (assigns to team leaders)
- → **Team Leader** (assigns to auditors)
- → **Auditor** (accepts and executes)

---

## 📋 Key Organizational Structure

### Team Leaders (NEW ROLE)
- **Specialization:** 1 Team Leader per audit type per tax center
  - E.g., "TL-DESK-001" for Desk Audit in Addis TC1
  - "TL-FIELD-001" for Field Audit in same TC
  - One TL per: DESK, FIELD, COMPREHENSIVE, TP, ISSUE, FORENSIC
- **Auditors:** Manages 3-10 auditors who report ONLY to that TL
- **Capacity:** Tracks workload (active cases / max capacity)

### Auditors
- **Reporting:** Reports to EXACTLY ONE Team Leader
- **Specialization:** Same audit type as team leader
- **Skills:** VAT, Revenue, TP, Withholding, etc. with proficiency levels
- **Sectors:** Business sector experience (Manufacturing, Retail, etc.)
- **Workload:** Tracks active assignments vs capacity

---

## 🔄 Case Flow (Dynamic State Machine)

```
STORED (Case ready for assignment)
  ↓ [Automatic by system]
ASSIGNED_TO_TEAM_LEADER (Team Leader chosen by audit type)
  ↓ [Team Leader assigns to auditor]
ASSIGNED_TO_AUDITOR (Auditor sees assignment)
  ├─ [Auditor accepts]
  └─→ ACCEPTED_BY_AUDITOR (Auditor ready)
       ↓ [Auditor starts]
       IN_EXECUTION (Work in progress)

REALLOCATED [At any state by Process Owner only]
```

**Invalid Transitions BLOCKED:**
- Cannot jump from STORED to ACCEPTED_BY_AUDITOR
- Cannot go backward (ACCEPTED → ASSIGNED)
- Cannot change from COMPLETED
- etc. (12 validation rules enforced)

---

## 🧠 Smart Assignment Algorithm

**System recommends best auditor based on:**

| Factor | Weight | How It Works |
|--------|--------|------------|
| **Skills Match** | 40% | Does auditor have VAT expertise if case needs it? |
| **Workload** | 30% | Prefer auditor with fewer active cases |
| **Sector Match** | 20% | Does auditor have Manufacturing experience for Manufacturing case? |
| **Complexity** | 10% | Match case complexity to auditor seniority (HIGH→Senior, LOW→Junior) |

**Score = (0.4 × Skills) + (0.3 × Workload) + (0.2 × Sector) + (0.1 × Complexity)**

Result: 0-100 score, ranked by System, Top 3 recommended to Team Leader.

---

## 👥 User Roles & Permissions

### Process Owner
- ✅ Stores cases (from Case Prioritization)
- ✅ **ONLY can re-allocate cases** (unique permission)
- ✅ Views assignment status
- ✅ Receives SLA alerts
- ✅ Views audit trail

### Tax Center Manager
- ✅ Assigns stored cases to team leaders
- ✅ Sees team leader capacity
- ✅ Can bulk assign cases

### Team Leader
- ✅ Views cases assigned to them
- ✅ Sees smart recommendations for auditors
- ✅ Assigns cases to their auditors
- ✅ Can override recommendations
- ✅ Receives notifications

### Auditor
- ✅ Views cases assigned to them
- ✅ Sees skills match % breakdown
- ✅ Accepts or requests re-assignment
- ✅ Can start execution (after accepting)

---

## 📲 Notifications Sent At Each Step

1. **Case assigned to Team Leader**
   - "X cases assigned for auditor assignment"
   - Link: Go to Assign Cases view

2. **Case assigned to Auditor**
   - "Case assigned: [Taxpayer]"
   - Link: Go to My Assignments view

3. **Auditor accepts assignment**
   - To Team Leader: "Auditor [Name] accepted case"
   - Link: View assignment

4. **Case re-allocated by Process Owner**
   - To old owner: "Case re-allocated"
   - To new owner: "Case assigned to you"

5. **SLA Alert (if not started after N days)**
   - To Team Leader + Process Owner
   - "Case [TIN] - assignment pending for X days"

---

## 🔍 Tracking & Audit Trail

**Every transition logged with:**
- From state → To state
- Who made the change (User + Role)
- When (timestamp)
- Why (reason, match score, recommendation)

**Example chain for one case:**
```
1. System → ASSIGNED_TO_TEAM_LEADER (TL-DESK-001)
   Reason: Automatic assignment by system
   
2. TL-DESK-001 → ASSIGNED_TO_AUDITOR (AUD-DESK-001)
   Reason: Manual assignment by team leader
   Match Score: 87%
   Recommended: [AUD-DESK-001, AUD-DESK-002, AUD-DESK-003]
   Selected Reason: Best match - VAT expert, low workload
   
3. AUD-DESK-001 → ACCEPTED_BY_AUDITOR
   Reason: Auditor accepted assignment
```

---

## ⚡ Re-allocation (Process Owner Only)

**When:** Can re-allocate at ANY state
- ASSIGNED_TO_TEAM_LEADER
- ASSIGNED_TO_AUDITOR
- IN_EXECUTION (emergency)

**How:**
1. Process Owner views case
2. Clicks "Re-allocate"
3. Selects new Team Leader (by audit type)
4. Selects new Auditor
5. Provides reason (required)
6. Confirms

**Effects:**
- Case state → REALLOCATED
- Audit trail updated
- Old owner notified
- New owner notified
- Previous history preserved

---

## 📊 Spec Document Breakdown

### requirements.md (16KB) - WHAT to build
- **FR1:** Team Leader & Auditor configuration
- **FR2:** Automatic case assignment (system process)
- **FR3:** Case state machine & transitions (8 states, 12 rules)
- **FR4:** Assignment views by role (Tax Manager, TL, Auditor, PO)
- **FR5:** Assignment notifications (5 types)
- **FR6:** Re-allocation by Process Owner
- **FR7:** SLA monitoring & alerts
- **FR8:** Assignment audit trail
- Data structures (Team Leader, Auditor, Assignment objects)
- Permissions per role

### design.md (18KB) - HOW to build it
- Architecture overview (component hierarchy)
- Component design for all 4 views:
  - AssignToTeamLeadersView
  - AssignToAuditorsView
  - MyAssignmentsView
  - CaseReallocationView
- State machine implementation
- Skills matching algorithm (code snippet)
- Data flow diagrams
- Notification flow
- Error handling strategies

### tasks.md (15KB) - STEP-BY-STEP implementation
- **PHASE A:** Configuration & Data Models (4 tasks)
- **PHASE B:** Data Loading & Storage (4 tasks)
- **PHASE C:** Assignment Views (4 tasks)
- **PHASE D:** Notification System (2 tasks)
- **PHASE E:** Integration & Routing (4 tasks)
- **PHASE F:** Build & Testing (5 tasks)
- **Total:** 23 implementation tasks with detailed acceptance criteria
- Dependency graph
- Testing checklist with 6 end-to-end scenarios
- Success criteria (11 items)

---

## ✅ Alignment With Your Requirements

### "Team leaders specialized by audit type ONLY"
✅ **Implemented:** One Team Leader per audit type per tax center (1:1 relationship)

### "Auditors report to ONE team leader"
✅ **Implemented:** Each Auditor has `teamLeaderId` field, reports ONLY to that TL

### "Automatic assignment by system"
✅ **Implemented:** Cases automatically assigned to TL by audit type on storage

### "Process Owner can re-allocate only"
✅ **Implemented:** ONLY Process Owner has `reallocate_cases` permission. All others cannot.

### "Dynamic for every step - no conflicts"
✅ **Implemented:** State machine with 8 states and 12 valid transitions prevents invalid flows

### "Case flows through correctly without stopping"
✅ **Implemented:** State machine ensures progressive flow: STORED → TL → AUDITOR → ACCEPTED → EXECUTION

### "Smart assignment considering skills, sector, complexity, workload"
✅ **Implemented:** Scoring algorithm with 4 factors weighted: Skills 40%, Workload 30%, Sector 20%, Complexity 10%

---

## 🚀 Ready To Implement?

**YES - This spec is COMPLETE and READY.**

### To Start Implementation:

1. **Review** this summary
2. **Read** requirements.md (understand the feature)
3. **Read** design.md (understand the architecture)
4. **Follow** tasks.md (implement step-by-step)

### Implementation Sequence:

**PHASE A** (Data Models) → **PHASE B** (Data Layer) → **PHASE C** (UI) → **PHASE D** (Notifications) → **PHASE E** (Integration) → **PHASE F** (Testing)

Each phase builds on the previous, no cross-dependencies.

---

## 📈 Estimated Effort

- **PHASE A:** ~4 hours (data models, state machine, scoring algorithm)
- **PHASE B:** ~3 hours (data loading/saving functions)
- **PHASE C:** ~8 hours (4 complex views with modals)
- **PHASE D:** ~2 hours (notifications, SLA job)
- **PHASE E:** ~2 hours (routing, menu items, linking)
- **PHASE F:** ~3 hours (build, testing, git commit)

**Total:** ~22 hours (varies by coding speed)

---

## 🎓 Key Learnings

1. **State machines** prevent invalid states (critical for workflows)
2. **Multi-factor scoring** enables smart recommendations
3. **Audit trail** maintains accountability
4. **Role-based permissions** ensure authorization
5. **Dynamic transitions** support re-allocation without breaking flow

---

## 🔗 Connection to Previous Features

```
Case Prioritization (PHASE 1)
  ↓ Stores cases
Case Assignment (THIS SPEC)
  ↓ Assigns to team leaders → auditors
Audit Execution (FUTURE)
  ↓ Auditors perform the work
```

---

## ❓ Questions About The Spec?

Key questions answered in requirements.md:
- Q: Can one TL have cases from multiple audit types?
  - A: No, team leaders specialized by audit type ONLY
- Q: Can auditor report to multiple team leaders?
  - A: No, each auditor reports to ONE team leader
- Q: Who can re-allocate?
  - A: Process Owner ONLY
- Q: What happens if all auditors are overloaded?
  - A: System still recommends but shows capacity warning
- Q: Can auditor request re-assignment?
  - A: Yes, goes to Team Leader for approval
- Q: When is SLA alert sent?
  - A: If case not started after N days (configurable)

---

## 🎯 Next Step

**Ready to proceed with PHASE A implementation?**

I'll guide you through:
1. Creating data models (Team Leader, Auditor, Assignment schemas)
2. Building state machine (transitions & validation)
3. Implementing scoring algorithm
4. Adding to AuthContext

Let me know! 🚀
