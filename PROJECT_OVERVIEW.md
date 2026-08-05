# AP Cluster Frontend - Complete Project Overview

**Comprehensive Business & Functional Requirements Document**

---

## PROJECT SUMMARY

**Project Name**: Complete AP Cluster Frontend - Tax Audit Planning System
**Organization**: Ministry of Revenue (MOR)
**Purpose**: Manage annual tax audit plans from creation through execution
**Status**: Production Ready (Version 2.5)
**Users**: 10+ different roles across headquarters, regions, and tax centers

---

## BUSINESS PROBLEM

The Ministry of Revenue needs a centralized system to:

1. **Plan Audits Nationally**: Create annual audit plans with allocations
2. **Distribute Work**: Cascade audit cases from regions to tax centers
3. **Collect Feedback**: Get tax center input on capacity and resources
4. **Track Progress**: Monitor plan execution and case completion
5. **Ensure Compliance**: Maintain audit standards and procedures

**Without this system**: Plans created in spreadsheets, no real-time tracking, duplicate work, missed deadlines

**With this system**: Centralized planning, real-time tracking, automated workflows, capacity management

---

## PROJECT GOALS

### Goal 1: Centralized Planning
- ✅ Audit Director creates national annual plans
- ✅ Defines allocations for each audit type (desk, field, joint, etc.)
- ✅ Manages plan across multiple approval stages
- ✅ Amends plans based on feedback

### Goal 2: Regional Distribution
- ✅ Regional Directors receive plans from headquarters
- ✅ Allocate cases to their assigned regions
- ✅ Distribute to tax centers within region
- ✅ Ensure balanced workload

### Goal 3: Capacity Management
- ✅ Tax centers provide feedback on capacity
- ✅ System aggregates feedback from multiple centers
- ✅ Director can see resource constraints
- ✅ Adjust allocations if needed

### Goal 4: Execution Tracking
- ✅ Cases assigned to auditors
- ✅ Track case status and progress
- ✅ Record findings and issues
- ✅ Report completion status

### Goal 5: Stakeholder Visibility
- ✅ Each role sees only their relevant information
- ✅ Real-time status updates
- ✅ Audit trail for compliance
- ✅ Performance metrics

---

## ORGANIZATIONAL STRUCTURE

### Headquarters Level

**Audit Director**
- Location: Ministry Headquarters
- Responsibility: Create and manage annual audit plans
- Authority: Final approval on allocations
- Team Size: 1-3 directors

**Senior Management**
- Location: Ministry Headquarters
- Responsibility: Approve director's plans
- Authority: Can reject and request amendments
- Team Size: 3-5 people

**Audit Planning Team**
- Location: Ministry Headquarters
- Responsibility: Support plan creation and analysis
- Authority: Data entry and report generation
- Team Size: 5-10 people

### Regional Level

**Regional Director** (5 regions)
- Location: Each of 5 regions (Addis Ababa, Oromia, Amhara, Somali, Tigray)
- Responsibility: Allocate plans to tax centers in region
- Authority: Distribute work and collect feedback
- Team Size: 1 per region
- Reports To: Audit Director

### Tax Center Level

**Tax Center Manager** (3-5 per region)
- Location: Each tax center in the region
- Responsibility: Accept allocations and manage cases
- Authority: Feedback on capacity and resources
- Team Size: 1 per tax center
- Reports To: Regional Director

**Team Leader** (2-3 per tax center)
- Location: Within tax center
- Responsibility: Distribute cases to auditors
- Authority: Manage auditor workload
- Team Size: 2-3 per tax center
- Reports To: Tax Center Manager

**Auditor** (5-10 per tax center)
- Location: Within tax center
- Responsibility: Execute audit cases
- Authority: Case work and finding documentation
- Team Size: 5-10 per tax center
- Reports To: Team Leader

---

## SYSTEM USERS & ROLES

### 1. Audit Director (1-3 users)
**What They Do**:
- Create new annual audit plans
- Define audit allocations by type (desk, field, joint, transfer pricing, comprehensive, issue)
- Submit plans for approval
- Receive feedback from regions
- Amend plans based on feedback
- Finalize plans for execution

**What They See**:
- Dashboard: All plans created by them
- Status: CREATED → SUBMITTED → APPROVED → ALLOCATED → FEEDBACK_COLLECTED → FINALIZED
- Tables: Plan summary, regional feedback, performance metrics

**Key Actions**:
- Create Plan with allocations
- Submit to Senior Management
- Allocate to Regions
- Review Regional Feedback
- Amend allocations
- Finalize for execution

---

### 2. Senior Management (3-5 users)
**What They Do**:
- Review plans from Audit Director
- Approve or request amendments
- Monitor overall system health
- View strategic metrics

**What They See**:
- Dashboard: All submitted plans
- Status: SUBMITTED, APPROVED, REJECTED
- Tables: All plans with metrics
- Charts: Risk distribution, capacity analysis

**Key Actions**:
- Review Plan Details
- Approve Plan
- Request Amendments
- View Metrics

---

### 3. Regional Director (5 users - 1 per region)
**What They Do**:
- Receive plans from Audit Director
- Distribute allocations to tax centers in their region
- Request feedback from tax centers
- Collect and aggregate feedback
- Submit aggregated feedback to director

**What They See**:
- Dashboard: Plans for their region only
- Tax Centers: All centers in their region
- Feedback Status: Which centers submitted, which pending
- Aggregated Data: Summary of all feedback

**Key Actions**:
- Receive Plans
- Allocate to Tax Centers
- Send Feedback Request
- Collect Feedback (real-time)
- Aggregate Summary
- Submit to Director

---

### 4. Tax Center Manager (3-5 per region)
**What They Do**:
- Receive allocations from regional director
- Accept or negotiate allocations
- Provide feedback on capacity/resources
- Manage cases within tax center
- Report completion status

**What They See**:
- Dashboard: Allocations assigned to their center
- Allocation Details: Breakdown by audit type
- Feedback Form: Capacity, resources, timeline
- Status Tracking: Which cases completed

**Key Actions**:
- View Allocations
- Accept Allocations
- Provide Feedback (capacity, resources, timeline, remarks)
- Submit Feedback
- Track Case Status

**Feedback They Provide**:
For each audit type:
- Capacity Status (Adequate, Can Handle, Insufficient, Need Review)
- Resource Status (Available, Limited, Need Support, Critical)
- Timeline Status (On Schedule, Delayed, Need Extension, At Risk)
- Remarks (Optional notes and concerns)

---

### 5. Team Leader (2-3 per tax center)
**What They Do**:
- Receive cases from Tax Center Manager
- Review case details and risk levels
- Distribute cases to auditors
- Track auditor workload
- Monitor case progress

**What They See**:
- Dashboard: Cases assigned to them
- Auditor List: Workload per auditor
- Case Details: Risk level, taxpayer info
- Progress: Cases in progress vs completed

**Key Actions**:
- View Assigned Cases
- Analyze Auditor Capacity
- Assign Cases to Auditors
- Monitor Progress
- Handle Extensions

---

### 6. Auditor (5-10 per tax center)
**What They Do**:
- Receive assigned cases from Team Leader
- Execute audit work
- Document findings
- Report case completion
- Escalate issues if needed

**What They See**:
- Dashboard: My assigned cases
- Case Details: Taxpayer, audit type, risk level
- Work Progress: Time spent, activities logged
- Findings: Issues identified, recommendations

**Key Actions**:
- Start Case
- Log Activities (Documentation, Reconciliation, Analysis, etc.)
- Record Findings (with severity levels)
- Track Time Spent
- Request Extensions
- Mark Complete

---

## WORKFLOW OVERVIEW

### The Complete Flow

```
STAGE 1: PLANNING (Audit Director)
├─ Creates annual plan with allocations
├─ Submits to Senior Management
└─ Awaits approval

STAGE 2: APPROVAL (Senior Management)
├─ Reviews plan
├─ Approves or requests changes
└─ Sends back to Director

STAGE 3: REGIONAL ALLOCATION (Audit Director)
├─ Approved plan allocates to regions
├─ Each region gets: desk_audit: 3, field_audit: 2, etc.
└─ Sent to Regional Directors

STAGE 4: TAX CENTER ALLOCATION (Regional Director)
├─ Regional Director breaks down further
├─ Example: 3 desk audits → TC1: 1, TC2: 1, TC3: 1
├─ Sends to Tax Centers
└─ Asks for feedback

STAGE 5: FEEDBACK COLLECTION (Tax Centers)
├─ Each Tax Center responds:
│  ├─ Capacity for each audit type
│  ├─ Resource availability
│  ├─ Timeline concerns
│  └─ Special remarks
├─ Real-time aggregation by Regional Director
└─ Sent to Audit Director

STAGE 6: AMENDMENT (Audit Director)
├─ Reviews all regional feedback
├─ Decides: Keep as is or Amend
├─ If amend: Repeat stages 4-5
└─ If approve: Move to execution

STAGE 7: CASE CREATION & PRIORITIZATION
├─ System creates cases from finalized allocations
├─ Risk engine prioritizes cases (HIGH/MEDIUM/LOW)
└─ Total: 40-50 cases created

STAGE 8: CASE SELECTION (Tax Centers)
├─ Tax Center Manager selects cases to work on
├─ Usually select HIGH priority first
├─ System calculates: capacity vs. duration
└─ Confirms selection

STAGE 9: TEAM LEADER ASSIGNMENT (Regional Director)
├─ Cases assigned to Team Leaders
├─ Example: 5 Team Leaders get 8-10 cases each
├─ Load balanced: ~50 days per team leader
└─ Team Leaders notified

STAGE 10: AUDITOR ASSIGNMENT (Team Leaders)
├─ Team Leaders distribute to Auditors
├─ Capacity check: Max 20 days per auditor
├─ Example: Auditor gets 1-3 cases (15-20 days total)
└─ Auditors notified

STAGE 11: CASE EXECUTION (Auditors)
├─ Auditor starts case
├─ Logs activities:
│  ├─ Documentation Review (2 days)
│  ├─ Bank Reconciliation (3 days)
│  ├─ Compliance Check (2 days)
│  └─ Risk Assessment (2 days)
├─ Records findings (severity: HIGH/MEDIUM/LOW)
├─ Can request extension if needed
└─ Marks complete when done

STAGE 12: COMPLETION & REPORTING
├─ Case marked COMPLETED
├─ Findings summarized
├─ Audit report generated
├─ Status visible to all stakeholders
└─ Plan execution tracked
```

---

## KEY BUSINESS PROCESSES

### Process 1: Annual Plan Creation

**Trigger**: Start of fiscal year
**Actor**: Audit Director
**Duration**: 1-2 weeks

**Steps**:
1. Director estimates national audit need:
   - "We need 50 desk audits, 30 field audits, etc."
2. Creates plan with allocations
3. Submits for approval
4. Senior Management approves
5. Director allocates to regions:
   - "Addis Ababa gets 20 desk audits"
   - "Oromia gets 15 desk audits"
   - Etc.
6. Regions allocate to tax centers
7. Tax centers provide feedback
8. Director may amend if needed
9. Plan finalized

**Success Metric**: Plan approved and ready for execution by end of month

---

### Process 2: Feedback Collection

**Trigger**: Plan allocated to tax centers
**Actor**: Tax Centers, Regional Director
**Duration**: 1-2 weeks

**Steps**:
1. Regional Director sends: "Please provide feedback on allocations by Friday"
2. Each Tax Center Manager logs in
3. Sees allocations: "desk_audit: 3, field_audit: 2"
4. Provides feedback:
   - "Desk audits: Can handle (Adequate capacity, Available resources, On Schedule)"
   - "Field audits: Can handle but stretched (Limited resources)"
5. Submits feedback
6. Regional Director sees real-time: "2 of 3 tax centers submitted"
7. Once all submitted, aggregates:
   - "Total proposed: 45 cases (vs. 50 allocated)"
   - "Resource issues in 1 tax center"
   - "Timeline concerns in 1 tax center"
8. Sends aggregated feedback to Director
9. Director reviews and decides

**Success Metric**: 100% of tax centers provide feedback; director makes decision

---

### Process 3: Case Execution

**Trigger**: Plan finalized and cases created
**Actor**: Auditors, Team Leaders
**Duration**: Full fiscal year

**Steps**:
1. System creates 50 cases from plan
2. Risk engine scores each case (0-100)
3. Tax Center selects 30 high-priority cases
4. Team Leaders distribute to Auditors
5. Auditors start cases:
   - "Start case AP-001: ABC Trading Company"
   - Begin documentation review
6. Track progress:
   - "2 days elapsed, 15 days remaining"
   - "40% complete"
7. Record findings:
   - "Transfer pricing issue: $50,000"
   - "Severity: HIGH"
8. Request extension if needed:
   - "Need 5 more days for analysis"
   - Team Leader approves or denies
9. Mark complete
10. Findings compiled into audit report

**Success Metric**: All assigned cases completed; all findings documented

---

## DATA ENTITIES & RELATIONSHIPS

### Plan (Main Entity)

**Attributes**:
- ID: AP-0001 (Unique identifier)
- Name: "Annual Plan 2026"
- Status: CREATED, SUBMITTED, APPROVED, SENT_TO_REGIONS, AWAITING_FEEDBACK, FEEDBACK_COLLECTED, FINALIZED
- Director Allocation: desk_audit: 50, field_audit: 30, etc.
- Regional Allocation: {addis_ababa: {desk_audit: 20, ...}, oromia: {...}}
- Tax Center Allocation: {addis_ababa: {tc1: {desk_audit: 5, ...}, tc2: {...}}}
- Feedback: {region: {taxCenter: {capacity: "Adequate", resources: "Limited", ...}}}
- Timeline: Created date, submitted date, approved date, finalized date

**Relationships**:
- One plan → Many regions
- One region → Many tax centers
- One tax center → Many auditors

---

### Case (Execution Entity)

**Attributes**:
- ID: CASE-2026-0001
- Type: desk_audit, field_audit, joint_audit, etc.
- Status: CREATED, SELECTED, ASSIGNED_TO_TEAM_LEADER, ASSIGNED_TO_AUDITOR, IN_PROGRESS, COMPLETED
- Risk Score: 0-100 (calculated by risk engine)
- Risk Level: HIGH, MEDIUM, LOW
- Taxpayer: ABC Trading Company
- Audit Period: 2026-01-01 to 2026-12-31
- Estimated Duration: 15 days
- Assigned Auditor: Auditor Name
- Start Date: When audit started
- Complete Date: When audit finished
- Findings: [{severity: HIGH, category: "Transfer Pricing", amount: $50,000}]

**Relationships**:
- One case → One plan
- One case → One auditor
- One case → One tax center

---

### Feedback (Communication Entity)

**Attributes**:
- Plan ID: AP-0001
- Region: addis_ababa
- Tax Center: addis_ababa-tc1
- Capacity Assessment: Adequate, Can Handle, Insufficient
- Resource Status: Available, Limited, Critical
- Timeline Status: On Schedule, Delayed, Need Extension
- Remarks: "Can handle allocations but need 2 weeks for preparation"
- Submitted Date: ISO timestamp
- Submitted By: Tax Center Manager name

---

## SUCCESS METRICS

### For Audit Director
- ✅ Plan created and approved within 2 weeks
- ✅ All regions provide feedback
- ✅ Final plan ready for execution by target date
- ✅ Amendment cycle < 2 weeks

### For Regional Director
- ✅ 100% of tax centers submit feedback
- ✅ Feedback aggregated within 1 week
- ✅ All cases assigned within 1 week
- ✅ 0 unassigned cases

### For Tax Center Manager
- ✅ Feedback submitted within 3 days of request
- ✅ All allocated cases visible in system
- ✅ Capacity concerns addressed
- ✅ Case status always up-to-date

### For Team Leader
- ✅ All assigned cases distributed within 3 days
- ✅ Auditor workload balanced (±10% variance)
- ✅ No auditor exceeds capacity
- ✅ Extension requests processed within 1 day

### For Auditor
- ✅ Cases assigned and ready to start
- ✅ Case information complete
- ✅ Progress trackable (0-100%)
- ✅ Findings documented in real-time

### System-Wide
- ✅ 100% plan completion by fiscal year end
- ✅ All cases assigned and executed
- ✅ 0 data loss (persistence across sessions)
- ✅ <1 second response time for all actions
- ✅ 99.9% uptime

---

## BUSINESS BENEFITS

### Efficiency
- **Before**: Plans in spreadsheets, manual distribution → 3-4 weeks
- **After**: Automated workflow, real-time tracking → 1-2 weeks
- **Benefit**: 50% faster plan execution

### Visibility
- **Before**: Director doesn't know capacity constraints → last-minute changes
- **After**: Real-time feedback aggregation → proactive planning
- **Benefit**: Better resource utilization

### Accountability
- **Before**: No tracking of case assignments → lost cases
- **After**: Complete audit trail → all cases tracked
- **Benefit**: 100% compliance and completion rates

### Data Quality
- **Before**: Duplicates, errors, lost data → manual reconciliation
- **After**: Centralized system → single source of truth
- **Benefit**: Accurate reporting and metrics

### Scalability
- **Before**: Manual processes break with growth → can't scale
- **After**: System-based processes → scales to 1000+ cases
- **Benefit**: Supports organizational growth

---

## IMPLEMENTATION PHASES

### Phase 1: MVP (8 weeks)
- ✅ Core workflows implemented
- ✅ Audit Director plan creation
- ✅ Regional allocation
- ✅ Tax center feedback
- ✅ Basic reporting

### Phase 2: Case Execution (8 weeks)
- ✅ Case creation from plans
- ✅ Risk scoring
- ✅ Case assignment
- ✅ Auditor tracking
- ✅ Finding documentation

### Phase 3: Analytics & Reporting (6 weeks)
- ✅ Advanced dashboards
- ✅ Performance metrics
- ✅ Capacity planning reports
- ✅ Risk analysis
- ✅ Export to Excel/PDF

### Phase 4: Integration (4 weeks)
- ✅ Backend API integration
- ✅ Legacy system migration
- ✅ Data import tools
- ✅ User training

**Total Timeline**: 26 weeks to full production

---

## ASSUMPTIONS & CONSTRAINTS

### Assumptions
1. Users have basic computer literacy
2. All users have internet access
3. Ministry provides necessary hardware
4. Training provided to all users
5. Change management plan in place

### Constraints
1. No external systems to integrate initially (MVP)
2. Single Ministry instance (not multi-org)
3. 5 regions initially (can expand)
4. 15-50 tax centers initially (can expand)
5. 100-500 auditors initially (can expand)

---

## RISK & MITIGATION

### Risk 1: User Adoption
- **Impact**: Low if users don't use system
- **Mitigation**: Extensive training, phased rollout, executive support

### Risk 2: Data Loss
- **Impact**: Critical - lost audit data
- **Mitigation**: Daily backups, redundancy, system testing

### Risk 3: Performance Issues
- **Impact**: High - system unusable with 1000+ concurrent users
- **Mitigation**: Load testing, optimization, scalable architecture

### Risk 4: Change in Requirements
- **Impact**: Medium - rework needed
- **Mitigation**: Agile development, regular stakeholder feedback

### Risk 5: Staffing Changes
- **Impact**: Medium - knowledge loss
- **Mitigation**: Documentation, knowledge transfer sessions

---

## CONCLUSION

The AP Cluster Frontend is a mission-critical system that transforms tax audit planning from manual spreadsheet-based processes to an automated, real-time system. It enables:

✅ Efficient annual planning
✅ Real-time capacity feedback
✅ Balanced workload distribution
✅ Complete case tracking
✅ Audit compliance and transparency

**Expected Outcome**: 50% faster planning, 100% case completion, improved resource utilization, better decision-making through data visibility.

---

**Document Status**: COMPLETE
**Version**: 1.0
**Last Updated**: August 4, 2026