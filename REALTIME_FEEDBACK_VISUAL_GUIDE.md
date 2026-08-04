# Real-Time Feedback Routing - Visual Guide

## Screen Layout After Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔐 Audit Platform > Feedback Collection                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  💬 Feedback Collection                                              │
│  North Region • Collect and submit feedback on audit allocations     │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │ 🔔 Real-Time Feedback: 2 new submission(s)                      ││  ← NEW!
│  │ Tax centers have submitted feedback - check below for details   ││
│  │                                              [Dismiss button]    ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────────────────────────────────┐│
│  │ My Plans        │  │ Plan Details & Feedback                      ││
│  │ ────────────────│  │ ─────────────────────────────────────────────││
│  │ Awaiting (3) ▼  │  │ Plan Information:                            ││
│  │ Submitted (1)   │  │ • Plan ID: AP-2024-001                       ││
│  │ ────────────────│  │ • Fiscal Year: 2024                          ││
│  │ ✓ AP-2024-001   │  │ • Total Cases: 150                           ││
│  │ ✓ AP-2024-002   │  │ • Status: AWAITING_REGIONAL_FEEDBACK         ││
│  │ ✓ AP-2024-003   │  │                                               ││
│  │                 │  │ 📊 Real-Time Tax Center Feedback (2):         ││  ← NEW!
│  │ 1 new feedback  │  │ ─────────────────────────────────────────────││
│  └─────────────────┘  │                                               ││
│                      │ 🆕 Addis Ababa TC1 (NEW badge, orange)        ││
│                      │ ─────────────────────────────────────────────││
│                      │ Feedback by Audit Type:                      ││
│                      │ • 5x desk_audit:                             ││
│                      │   Capacity: Adequate | Resources: Available  ││
│                      │   Timeline: On Schedule                      ││
│                      │   "We can handle 5 desk audit cases"         ││
│                      │                                               ││
│                      │ • 3x field_audit:                            ││
│                      │   Capacity: Insufficient | Resources: Limited││
│                      │   Timeline: Need Extension                   ││
│                      │   "Need more resources for field audits"     ││
│                      │                                               ││
│                      │ 🔔 Just submitted: 2024-08-04 10:30 AM       ││
│                      │                                               ││
│                      │ ✅ Dire Dawa TC2                              ││
│                      │ ─────────────────────────────────────────────││
│                      │ Can deliver: 8 / Allocated: 8                ││
│                      │ Submitted: 2024-08-04 09:15 AM               ││
│                      │                                               ││
│                      │ [📤 Submit Feedback button]                  ││
│                      │                                               ││
│                      │ 📊 Real-Time Feedback Stream (2):             ││  ← NEW!
│                      │ ─────────────────────────────────────────────││
│                      │ 🆕 Addis Ababa TC1 - AP-2024-001 [NEW]        ││
│                      │ 🔔 Just submitted 2 minutes ago              ││
│                      │                                               ││
│                      │ 🆕 Dire Dawa TC2 - AP-2024-002 [NEW]          ││
│                      │ 🔔 Just submitted 5 minutes ago              ││
│                      │                                               ││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Real-Time Notification Banner

### State: When New Feedback Arrives (ANIMATED)
```
┌───────────────────────────────────────────────────────────────────────┐
│ 🔔 Real-Time Feedback: 2 new submission(s)                            │
│ Tax centers have submitted feedback - check below for details         │
│                                                      [Dismiss button] │
└───────────────────────────────────────────────────────────────────────┘
  ↑
  └─ Animated pulse effect
  └─ Teal border & background
  └─ Shows exact count of new submissions
```

### State: When Dismissed
```
[Notification banner hidden]
[But feedback still visible in form and stream below]
```

## Tax Center Feedback Display (In Feedback Form)

### New Submission (Highlighted)
```
🆕 Addis Ababa TC1 (NEW badge)                          [NEW]
═════════════════════════════════════════════════════════════════

Feedback by Audit Type:

┌─────────────────────────────────────────────────────────────────┐
│ • 5x desk_audit                                                 │
│   Capacity: Adequate | Resources: Available | Timeline: On Sch. │
│   "We can handle 5 desk audit cases"                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ • 3x field_audit                                                │
│   Capacity: Insufficient | Resources: Limited | Timeline: Ext.  │
│   "Need more resources for field audits"                        │
└─────────────────────────────────────────────────────────────────┘

🔔 Just submitted: 2024-08-04 10:30 AM
   Orange border, pulse animation, highlights recent submission
```

### Previous Submission (Normal)
```
✅ Dire Dawa TC2
═════════════════════════════════════════════════════════════════

Can deliver: 8 / Allocated: 8
"Team ready to handle all allocated cases"

Submitted: 2024-08-04 09:15 AM
   Teal border, normal display, standard styling
```

## Real-Time Feedback Stream

### Dashboard Section
```
📊 Real-Time Feedback Stream (5)
═════════════════════════════════════════════════════════════════

🆕 Addis Ababa TC1 - Plan AP-2024-001 [NEW]
   🔔 Just submitted 2 minutes ago

🆕 Dire Dawa TC2 - Plan AP-2024-002 [NEW]
   🔔 Just submitted 5 minutes ago

✅ Mekelle TC3 - Plan AP-2024-001
   Submitted: 2024-08-04 12:00 PM

✅ Hawassa TC4 - Plan AP-2024-003
   Submitted: 2024-08-04 11:45 AM

✅ Jigjiga TC5 - Plan AP-2024-002
   Submitted: 2024-08-04 11:30 AM

[Scrollable if > 6 items]
```

## Color Coding

### New Feedback (Just Arrived)
```
Background:  Orange/10 with pulse animation
Border:      Orange (left border-left)
Text:        Orange badge "🆕 NEW"
Icon:        🔔 "Just submitted"
Effect:      Pulse animation draws attention
```

### Viewed Feedback
```
Background:  Ink/normal
Border:      Teal (left border-left)
Text:        Standard styling
Icon:        ✅ "Submitted"
Effect:      Normal display
```

### Awaiting Feedback
```
No display in real-time sections
Only appears in "Plans awaiting feedback" list
Waiting for Tax Centers to submit
```

## Timeline: How Real-Time Works

```
T+0:00   Tax Center Manager clicks "Submit Feedback"
         └─ Data saved to persistent storage

T+0:10   RegionalFeedbackCollectionView detects data change
         └─ useEffect triggers

T+0:11   loadPlans() and trackRealTimeFeedback() called
         └─ New feedback detected

T+0:12   realTimeFeedback state updated with isNew: true
         └─ newFeedbackCount increased

T+0:13   UI automatically re-renders
         ├─ Notification banner appears: "🔔 2 new submission(s)"
         ├─ Orange highlighted feedback in form
         ├─ Entries in Real-Time Feedback Stream
         └─ All visible to Regional Director

T+0:14   Regional Director sees everything
         └─ Can immediately review and act on feedback
```

## Feedback Status Progression

```
SUBMISSION FLOW:
═════════════════════════════════════════════════════════════════

Tax Center:
1. Selects allocation
2. Provides feedback by audit type
3. ✅ Clicks "Submit Feedback"
4. Data saved to storage

Regional Director (Real-Time):
5. 🔔 Notification appears
6. 🆕 Sees orange-highlighted feedback
7. 📊 Feedback in Real-Time Stream
8. Reads detailed audit type feedback
9. Reviews tax center capacity/resources/timeline
10. Provides regional feedback
11. ✅ Submits regional feedback to Director
```

## Key Features At A Glance

| Feature | Before | After |
|---------|--------|-------|
| **See new feedback** | Refresh page needed | Instant, automatic |
| **Know it's new** | Check timestamps | 🆕 Badge + orange highlight |
| **Read detailed feedback** | Show/hide different format | Structured by audit type |
| **See submission time** | Manual timestamp lookup | "Just submitted X ago" |
| **Track submissions** | Manual tracking | Automatic counter |
| **Visual priority** | Equal treatment | New submissions highlighted |
| **Know what tax centers said** | Generic summary | Detailed capacity/resources/timeline |
| **Quick overview** | Scroll through form | Dedicated feedback stream |
| **Act fast** | After manual review | Immediate with context |

---

## Testing the Feature

### Test 1: See Real-Time Notification
1. Open Regional Director view
2. Have Tax Center submit feedback
3. See "🔔 Real-Time Feedback: 1 new submission(s)" banner
4. ✅ PASS

### Test 2: See Orange Highlight
1. In feedback form, look for tax center feedback
2. Newly submitted feedback has orange left border
3. Shows "🆕 NEW" badge
4. Has "🔔 Just submitted" timestamp
5. ✅ PASS

### Test 3: See Audit Type Details
1. Click on a plan with tax center feedback
2. In "Real-Time Tax Center Feedback" section
3. See breakdown by audit type
4. Shows: allocated amount, capacity, resources, timeline, remarks
5. ✅ PASS

### Test 4: See Real-Time Stream
1. In "Real-Time Feedback Stream" section
2. All submissions listed chronologically
3. Newest first
4. Shows plan ID and tax center name
5. ✅ PASS

### Test 5: Navigation Persistence
1. Submit feedback as Tax Center
2. See notification as Regional Director
3. Navigate to different view
4. Return to Feedback Collection
5. Feedback still visible with timestamps
6. ✅ PASS

---

**Real-Time Feedback Routing is now fully operational!**
