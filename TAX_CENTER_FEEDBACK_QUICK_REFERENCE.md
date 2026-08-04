# Tax Center Feedback - Quick Reference Guide

## What Changed & Why

### Problem
- Tax centers submit feedback but it wasn't accessible to regional directors
- Needed to prevent duplicate submissions even after logout/login
- Needed dynamic loading of feedback from any region

### Solution
- Fixed tax center feedback visibility to regional directors
- Enhanced duplicate prevention logic
- Added dynamic tax center feedback extraction (not hardcoded to specific regions)

---

## For Tax Center Managers

### Submitting Feedback
1. Go to **Dashboard** → **Allocations** (or **Capacity/Allocations** view)
2. Review your allocation for the plan
3. Enter how much you **CAN DELIVER** for each audit type
4. Add any notes/comments about capacity constraints
5. Click **Submit Feedback to Regional Director**
6. Confirm the submission

### After Submission
- ✅ Button shows "✅ Feedback Already Submitted" (disabled)
- Cannot submit again (even if logout/login)
- Your feedback is locked in

### If You Made a Mistake
- Contact your Regional Director to request an amendment
- Once submitted, only Regional Director can modify regional-level feedback

---

## For Regional Directors

### Accessing Tax Center Feedback
1. Go to **Dashboard** → **Feedback Collection** view
2. Select a plan from the list (status: AWAITING_REGIONAL_FEEDBACK)
3. You'll see all tax center feedback that was submitted:
   - Tax center name
   - Capacity they can deliver
   - Original allocation
   - Their notes
   - When they submitted

### Aggregating Feedback
1. Review all tax center feedback
2. Add your **Regional Director Feedback** (comments/assessment)
3. Can also add individual tax center summary comments
4. Click **Submit Feedback**

### Status Display
Section shows:
```
✅ Tax Centers that Submitted Feedback (3):
  ✅ oromia-tc1: Can deliver 18 / Allocated 20
     "Good capacity for field audits"
     📅 August 4, 2026 10:30 AM
  
  ✅ oromia-tc2: Can deliver 12 / Allocated 15
     "Need more resources"
     📅 August 4, 2026 10:45 AM
  
  ✅ oromia-tc3: Can deliver 8 / Allocated 10
     "Standard delivery"
     📅 August 4, 2026 11:00 AM
```

---

## Data Structure

### Where Tax Center Feedback is Stored
```
plan.taxCenterFeedback[region][taxCenterName] = {
  desk_audit: { allocated: 20, canDeliver: 18, notes: "..." },
  field_audit: { allocated: 15, canDeliver: 14, notes: "..." },
  // ... other audit types ...
  submittedAt: "2026-08-04T10:30:00Z",
  submittedBy: "oromia-tc1",
  status: "submitted"
}
```

### Tax Center Names Pattern
- Format: `{region}-tc{number}`
- Example: `oromia-tc1`, `addis_ababa-tc2`, `amhara-tc3`

### Feedback Status Values
- `submitted` = Tax center has submitted (locked)
- Nothing stored = Tax center hasn't submitted yet (can submit)

---

## Troubleshooting

### "Tax center can't see their allocation"
- **Reason**: Plan not distributed to regions yet
- **Fix**: Director must click "🚀 Submit to Regions for Feedback"
- **Status Required**: Plan must be `APPROVED_BY_DIRECTOR`

### "Regional director doesn't see tax center feedback"
- **Reason**: Tax center hasn't submitted yet OR feedback in different location
- **Fix**: Check if tax center is showing "Feedback Submitted" button disabled
- **Check**: Go to that plan and verify tax centers have submitted

### "Tax center can't submit again (want to fix typo)"
- **Reason**: Design - submissions are locked once submitted
- **Fix**: Ask Regional Director to note issues in their feedback, or contact admin to reset

### "Build error with tax center changes"
- **Check**: npm run build
- **Should see**: Exit Code 0
- **If error**: Check component import paths and syntax

---

## Process Flow

```
┌─────────────────────────────────────────────────────────┐
│                  FEEDBACK WORKFLOW                       │
└─────────────────────────────────────────────────────────┘

STEP 1: Director Approves Plan
  └─ Status: APPROVED_BY_DIRECTOR

STEP 2: Director Submits to Regions
  └─ Status: AWAITING_REGIONAL_FEEDBACK
  └─ Action: "🚀 Submit to Regions for Feedback"

STEP 3: Tax Centers Submit Feedback ← YOU ARE HERE
  └─ Status: No change
  └─ Data: plan.taxCenterFeedback[region][tcName]
  └─ Button: "Submit Feedback to Regional Director"

STEP 4: Regional Director Reviews
  └─ Status: No change
  └─ Sees: All tax center feedback from Step 3
  └─ Action: "💬 Provide Feedback" + submit

STEP 5: Auto-Status Update
  └─ Trigger: All regions submit
  └─ Status: FEEDBACK_COLLECTED

STEP 6: Director Reviews All Feedback
  └─ Tab: "Feedback Ready"
  └─ Sees: Regional aggregates + tax center details
  └─ Action: Accept or Request More Feedback
```

---

## Key Points to Remember

1. **Tax centers submit once** - Cannot submit twice, even after logout
2. **Regional directors aggregate** - See all tax center feedback + add regional notes
3. **Status matters** - Can only submit when plan is `AWAITING_REGIONAL_FEEDBACK`
4. **Data persists** - localStorage keeps everything even after browser close
5. **Dynamic regions** - Works for any region, not hardcoded
6. **Timestamp tracking** - Every submission tracked with date/time
7. **Comments optional** - Can submit with or without notes

---

## Files Involved

| File | Role |
|------|------|
| TaxCenterView.jsx | Tax center submits feedback (duplicate prevention) |
| RegionalFeedbackCollectionView.jsx | Regional director reviews & aggregates feedback |
| businessLogic.js | Status auto-updates when all regions submit |
| data.js | localStorage persistence |

---

**Last Updated**: August 4, 2026
**Status**: ✅ Complete & Verified
