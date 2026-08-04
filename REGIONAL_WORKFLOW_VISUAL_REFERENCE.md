# Regional Feedback Workflow - Visual Reference Guide

## Complete Workflow Diagram

```
AUDIT DIRECTOR CREATES & APPROVES PLAN
                ↓
    Plan Status: APPROVED_BY_DIRECTOR
                ↓
AUDIT DIRECTOR SENDS TO REGIONAL DIRECTORS
                ↓
    Plan Status: AWAITING_REGIONAL_FEEDBACK
                ↓
─────────────────────────────────────────────────
│ REGIONAL DIRECTOR ENTERS WORKFLOW              │
│ RegionalFeedbackAggregationView                │
│                                               │
│ ┌─────────────────────────────────────┐      │
│ │ TAB 1: "AWAITING"                   │      │
│ ├─────────────────────────────────────┤      │
│ │ Plan Status: AWAITING_REGIONAL...  │      │
│ │                                     │      │
│ │ [SELECT PLAN]                       │      │
│ │ → Button: 📤 Send Allocations       │      │
│ │                                     │      │
│ └─────────────────────────────────────┘      │
│         ↓ CLICK BUTTON                        │
│ ┌─────────────────────────────────────┐      │
│ │ System Records:                     │      │
│ │ allocationSentStatus[region] = {   │      │
│ │   status: 'SENT',                   │      │
│ │   sentDate: now,                    │      │
│ │   sentBy: 'Regional Director'       │      │
│ │ }                                   │      │
│ └─────────────────────────────────────┘      │
│         ↓                                     │
│ ┌─────────────────────────────────────┐      │
│ │ TAB 2: "COLLECTING"                 │      │
│ ├─────────────────────────────────────┤      │
│ │ Plans where allocations sent        │      │
│ │                                     │      │
│ │ Tax Centers → SUBMIT FEEDBACK       │      │
│ │ ✅ Addis Ababa TC1 - Submitted      │      │
│ │ ⏳ Dire Dawa TC2 - Awaiting        │      │
│ │ ⏳ Mekelle TC3 - Awaiting          │      │
│ │                                     │      │
│ │ [3 of 3 tax centers submitted]     │      │
│ │                                     │      │
│ │ AGGREGATED SUMMARY TABLE:           │      │
│ │ ┌─────────────┬──────┬──────────┐  │      │
│ │ │ Audit Type  │ Alloc│ Proposed │  │      │
│ │ ├─────────────┼──────┼──────────┤  │      │
│ │ │ Desk Audit  │ 50   │ 48       │  │      │
│ │ │ Field Audit │ 30   │ 28       │  │      │
│ │ │ Joint Audit │ 20   │ 20       │  │      │
│ │ └─────────────┴──────┴──────────┘  │      │
│ │                                     │      │
│ │ [TEXTAREA] Regional Comments        │      │
│ │ Button: ✅ Submit Aggregated...    │      │
│ │                                     │      │
│ └─────────────────────────────────────┘      │
│         ↓ CLICK BUTTON                        │
│ ┌─────────────────────────────────────┐      │
│ │ System Records:                     │      │
│ │ regionFeedbackStatus[region] = {   │      │
│ │   status: 'received',               │      │
│ │   aggregatedFeedback: { all },      │      │
│ │   taxCenterCount: 3,                │      │
│ │   receivedDate: now,                │      │
│ │   submittedBy: 'Regional Director'  │      │
│ │ }                                   │      │
│ └─────────────────────────────────────┘      │
│         ↓                                     │
│ ┌─────────────────────────────────────┐      │
│ │ TAB 3: "SUBMITTED"                  │      │
│ ├─────────────────────────────────────┤      │
│ │ ✅ SUBMITTED TO AUDIT DIRECTOR      │      │
│ │                                     │      │
│ │ Tax Centers Reporting: 3            │      │
│ │ Submitted: Aug 4, 2024              │      │
│ │                                     │      │
│ │ Regional Comments:                  │      │
│ │ "All tax centers ready for audit"   │      │
│ │                                     │      │
│ │ Status: Awaiting Director Review    │      │
│ │                                     │      │
│ └─────────────────────────────────────┘      │
│                                               │
└─────────────────────────────────────────────────
                ↓
    Plan Status: FEEDBACK_COLLECTED
                ↓
AUDIT DIRECTOR RECEIVES AGGREGATED DATA
        (Next workflow stage)
```

---

## Stage 1: AWAITING - Send Allocations

### Screen Layout
```
┌─────────────────────────────────────────────────────────┐
│ 📥 Feedback Aggregation & Submission                    │
│ addis_ababa Region • Collect & aggregate feedback       │
└─────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────────────────────────────┐
│ AWAITING (3) │ │ Plan Information:                    │
│ COLLECTING(0)│ │ • Plan ID: AP-2024-001               │
│ SUBMITTED (0)│ │ • Status: AWAITING_REGIONAL...       │
│              │ │ • Allocation Status: Not Sent        │
│ AP-2024-001  │ │                                      │
│ AP-2024-002  │ │ ┌──────────────────────────────────┐ │
│ AP-2024-003  │ │ │ Step 1: Send Allocations         │ │
│              │ │ │ to Tax Centers                   │ │
│              │ │ │                                  │ │
│              │ │ │ Send this plan's allocations to  │ │
│              │ │ │ all tax centers. They will then  │ │
│              │ │ │ submit feedback.                 │ │
│              │ │ │                                  │ │
│              │ │ │ [📤 Send Allocations button]     │ │
│              │ │ └──────────────────────────────────┘ │
│              │ │                                      │
└──────────────┘ └──────────────────────────────────────┘
```

### User Action
```
Click: 📤 Send Allocations to Tax Centers
       ↓
Alert: ✅ Allocations sent to tax centers in addis_ababa!
       Tax centers can now review and submit feedback.
       ↓
Plan moves to COLLECTING tab
```

---

## Stage 2: COLLECTING - Aggregate Feedback

### Screen Layout
```
┌─────────────────────────────────────────────────────────┐
│ 📥 Feedback Aggregation & Submission                    │
│ addis_ababa Region • Collect & aggregate feedback       │
└─────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────────────────────────────┐
│ AWAITING (0) │ │ Plan Information:                    │
│ COLLECTING(1)│ │ • Plan ID: AP-2024-001               │
│ SUBMITTED (0)│ │ • Status: AWAITING_REGIONAL...       │
│              │ │ • Allocation Status: SENT            │
│ AP-2024-001  │ │                                      │
│   3 FB       │ │ TAX CENTER FEEDBACK STATUS:          │
│              │ │ ┌──────────────────────────────────┐ │
└──────────────┘ │ │ ✅ Addis Ababa TC1 - Submitted  │ │
                 │ │ ✅ Dire Dawa TC2 - Submitted    │ │
                 │ │ ✅ Mekelle TC3 - Submitted      │ │
                 │ │                                  │ │
                 │ │ ✓ 3 of 3 tax centers submitted  │ │
                 │ │ └──────────────────────────────┘ │
                 │                                      │
                 │ AGGREGATED FEEDBACK SUMMARY:         │
                 │ ┌──────────────────────────────────┐ │
                 │ │ Audit  │ Alloc │ Proposed │ Cap  │ │
                 │ ├────────┼───────┼──────────┼──────┤ │
                 │ │ Desk   │  50   │   48     │ Adeq.│ │
                 │ │ Field  │  30   │   28     │ Can H│ │
                 │ │ Joint  │  20   │   20     │ Adeq.│ │
                 │ └──────────────────────────────────┘ │
                 │                                      │
                 │ Regional Director Comments:          │
                 │ [Textarea for optional comments]     │
                 │                                      │
                 │ [📋 Prepare Aggregated Submission]   │
                 │                                      │
└──────────────────────────────────────────────────────────┘
```

### Aggregation Example
```
REAL-TIME AGGREGATION (from tax centers):

Desk Audit Feedback:
  Addis Ababa TC1: Allocated: 20, Proposed: 20, Capacity: Adequate
                    Resources: Available, Timeline: On Schedule
                    "We can handle 20 desk audit cases"
  Dire Dawa TC2:   Allocated: 15, Proposed: 14, Capacity: Can Handle
                    Resources: Limited, Timeline: Need Extension
                    "Need more resources but can do 14"
  Mekelle TC3:     Allocated: 15, Proposed: 14, Capacity: Adequate
                    Resources: Available, Timeline: On Schedule
                    "Ready for all 15 cases"

AGGREGATED FOR DESK AUDIT:
  Total Allocated:    50  (20 + 15 + 15)
  Total Proposed:     48  (20 + 14 + 14)
  Capacity:           Adequate (most common)
  Resources:          Available (majority can do it)
  Timeline:           Need Extension (one flagged)
  All Remarks:        "We can handle 20..." + "Need more..." + "Ready for..."
  Tax Centers:        3 reporting
```

### User Action
```
Step 1: (Optional) Add regional comments

Step 2: Click 📋 Prepare Aggregated Submission

Step 3: Dialog shows:
        [Textarea] Regional Director Comments
        [✅ Submit] [Cancel]

Step 4: Click ✅ Submit Aggregated Feedback to Director

Step 5: Alert: ✅ Aggregated feedback from 3 tax centers 
               submitted to Audit Director!
               Director will review summary and feedback.
        ↓
Plan moves to SUBMITTED tab
```

---

## Stage 3: SUBMITTED - View Aggregated Summary

### Screen Layout
```
┌─────────────────────────────────────────────────────────┐
│ 📥 Feedback Aggregation & Submission                    │
│ addis_ababa Region • Collect & aggregate feedback       │
└─────────────────────────────────────────────────────────┘

┌──────────────┐ ┌──────────────────────────────────────┐
│ AWAITING (0) │ │ ✅ AGGREGATED FEEDBACK SUBMITTED     │
│ COLLECTING(0)│ │                                      │
│ SUBMITTED (1)│ │ Tax Centers Reporting: 3             │
│              │ │ Submitted: Aug 4, 2024               │
│ AP-2024-001  │ │                                      │
│              │ │ Regional Comments:                   │
│              │ │ "All tax centers ready for audit"    │
│              │ │                                      │
│              │ │ Status: ✅ Submitted to              │
│              │ │ Audit Director                       │
│              │ │                                      │
└──────────────┘ └──────────────────────────────────────┘
```

---

## Data Structures at Each Stage

### STAGE 1 - AWAITING
```
plan = {
  id: 'AP-2024-001',
  status: 'AWAITING_REGIONAL_FEEDBACK',
  allocationSentStatus: {}  // Empty until send button clicked
}
```

### STAGE 2 - COLLECTING (After Send)
```
plan = {
  id: 'AP-2024-001',
  status: 'AWAITING_REGIONAL_FEEDBACK',  // Status unchanged until submit
  allocationSentStatus: {
    'addis_ababa': {
      status: 'SENT',
      sentDate: '2024-08-04T10:15:00Z',
      sentBy: 'Regional Director Name'
    }
  },
  
  // Tax centers now submit feedback
  taxCenterFeedback: {
    'addis_ababa': {
      'addis_ababa-tc1': {
        feedbackByType: {
          desk_audit: {
            allocated: 20,
            proposedAmount: 20,
            capacity: 'Adequate',
            resourceStatus: 'Available',
            timeline: 'On Schedule',
            remarks: 'We can handle 20 desk audit cases'
          },
          // ... other audit types
        },
        feedbackDate: '2024-08-04T11:00:00Z',
        feedbackBy: 'Tax Center Manager'
      },
      'dire_dawa-tc2': { /* similar */ },
      'mekelle-tc3': { /* similar */ }
    }
  }
}
```

### STAGE 3 - SUBMITTED (After Submit)
```
plan = {
  id: 'AP-2024-001',
  status: 'FEEDBACK_COLLECTED',  // ✅ Updated!
  
  allocationSentStatus: { /* as above */ },
  taxCenterFeedback: { /* as above */ },
  
  regionFeedbackStatus: {
    'addis_ababa': {
      status: 'received',
      regionalComments: 'All tax centers ready for audit',
      aggregatedFeedback: {
        desk_audit: {
          totalAllocated: 50,
          totalProposed: 48,
          capacityStatuses: ['Adequate', 'Can Handle', 'Adequate'],
          resourceStatuses: ['Available', 'Limited', 'Available'],
          timelineStatuses: ['On Schedule', 'Need Extension', 'On Schedule'],
          remarks: [
            'Addis Ababa TC1: We can handle 20 desk audit cases',
            'Dire Dawa TC2: Need more resources but can do 14',
            'Mekelle TC3: Ready for all 15 cases'
          ]
        },
        field_audit: { /* similar */ }
        // ... other audit types
      },
      taxCenterCount: 3,
      receivedDate: '2024-08-04T11:30:00Z',
      submittedBy: 'Regional Director Name',
      region: 'addis_ababa'
    }
  },
  
  approvalHistory: [
    // ... previous actions
    {
      action: 'REGIONAL_FEEDBACK_AGGREGATED_SUBMITTED',
      by: 'Regional Director Name',
      date: '2024-08-04T11:30:00Z',
      region: 'addis_ababa',
      taxCenterCount: 3,
      notes: 'Regional feedback aggregated and submitted'
    }
  ]
}
```

---

## Key Metrics Displayed

### At Collection Stage
```
Tax Center Status:
  ✅ Addis Ababa TC1 - Submitted
  ⏳ Dire Dawa TC2 - Awaiting
  ⏳ Mekelle TC3 - Awaiting

  Progress: 1 of 3 tax centers submitted

Aggregated Metrics (Updates in Real-Time):
  Desk Audit:
    • Total Allocated: 20 (only TC1 so far)
    • Total Proposed: 20
    • Capacity: Adequate (only TC1 data)
    • Resources: Available
    • Timeline: On Schedule
    
  [Updates to 50/48 when all 3 submit]
```

### At Submission Stage
```
Final Aggregation:
  Desk Audit:
    • Total Allocated: 50
    • Total Proposed: 48 (-2 adjustment)
    • Capacity: Adequate (majority vote)
    • Resources: Available (majority available)
    • Timeline: Need Extension (1 flagged concern)
    • Individual Remarks: All 3 comments shown

Tax Centers Reporting: 3
Submitted: Aug 4, 2024, 11:30 AM
```

---

## Color Coding

| Element | Color | Meaning |
|---------|-------|---------|
| Tab: "Awaiting" | Warning (Orange) | Plans not yet sent to tax centers |
| Tab: "Collecting" | Info (Blue) | Allocations sent, waiting for feedback |
| Tab: "Submitted" | Teal | Aggregated feedback submitted to director |
| Status: ✅ | Green | Completed/Submitted |
| Status: ⏳ | Gray | Awaiting/Pending |
| Adjustment Highlight | Orange | Proposed different from allocated |

---

## Complete User Journey

```
1. REGIONAL DIRECTOR LOGS IN
   ↓
2. GOES TO FEEDBACK AGGREGATION VIEW
   ↓
3. SEES "AWAITING" TAB (Plans to send)
   ↓
4. SELECTS A PLAN → CLICKS "Send Allocations"
   ↓
5. PLAN MOVES TO "COLLECTING" TAB
   ↓
6. SEES TAX CENTER FEEDBACK STATUS
   ✅/⏳ indicators update as they submit
   ↓
7. REVIEWS AGGREGATED FEEDBACK SUMMARY
   (Real-time totals, statuses, remarks)
   ↓
8. (OPTIONAL) ADDS REGIONAL COMMENTS
   ↓
9. CLICKS "Prepare Aggregated Submission"
   ↓
10. REVIEWS COMMENTS & CLICKS "Submit"
    ↓
11. PLAN MOVES TO "SUBMITTED" TAB
    ↓
12. SEES CONFIRMATION: "✅ Submitted to Audit Director"
    ↓
13. AUDIT DIRECTOR RECEIVES AGGREGATED DATA
    (Next workflow stage)
```

---

## Build Status
✅ Exit Code 0 • 124 modules • No errors
