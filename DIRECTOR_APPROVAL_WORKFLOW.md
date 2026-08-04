# Director Plan Approval Workflow - Clear Steps

## Complete Workflow

### STEP 1: First Plan Arrives at Director
```
Status: SUBMITTED_TO_DIRECTOR
Location: DirectorInitialApprovalView → "To Approve" tab
Display: ✅ Plan details shown correctly
```

**What Director Sees:**
- Plan ID, Fiscal Year, Total Cases
- Audit Type Allocations (breakdown by desk, field, transfer pricing, etc.)
- Regional allocations (cases allocated to each region)
- Two buttons: "✅ Approve Plan" OR "❌ Send Back for Amendment"

---

### STEP 2: Director Approves Plan
```
Button: ✅ Approve Plan
Action: Click to open approval form
```

**Director fills form:**
- Optional comments/notes
- Click "✅ Confirm"

**What Happens:**
- Status changes: `SUBMITTED_TO_DIRECTOR` → `APPROVED_BY_DIRECTOR`
- Plan saved with approval details
- Approval history updated

**New Button Appears:**
- "🚀 Submit to Regions for Feedback" button replaces approval buttons
- Plan stays in "To Approve" tab

---

### STEP 3: Director Submits Plan to Regions for Feedback
```
Button: 🚀 Submit to Regions for Feedback
Location: Still in "To Approve" tab (after approval)
```

**Director fills submission form:**
- Optional submission notes/instructions for regions
- Click "✅ Submit to Regions"

**What Happens:**
- Status changes: `APPROVED_BY_DIRECTOR` → `AWAITING_REGIONAL_FEEDBACK`
- **✅ GREEN ALERT APPEARS**: "Plan Submitted to Regions" confirmation
- Shows: "This plan has been distributed to all regions for feedback collection"
- Shows: Distributed date/time
- Plan stays visible in "To Approve" tab with green status indicator

---

### STEP 4: Complete Status Summary
At this point, the plan details show:

```
┌─────────────────────────────────────────┐
│ ✅ Plan Submitted to Regions            │
│                                         │
│ This plan has been distributed to all   │
│ regions for feedback collection.        │
│ Regions can now view the allocations    │
│ and submit their feedback.              │
│                                         │
│ 📅 Distributed: Aug 4, 2026 2:30 PM    │
└─────────────────────────────────────────┘

PLAN INFORMATION
├─ Plan ID: AP-2025-001
├─ Year: 2025
├─ Total Cases: 200
└─ Status: AWAITING_REGIONAL_FEEDBACK

AUDIT TYPE ALLOCATIONS
├─ Desk Audit: 50 (25%)
├─ Field Audit: 60 (30%)
├─ Transfer Pricing: 40 (20%)
├─ Joint Audit: 30 (15%)
├─ Comprehensive: 15 (7.5%)
└─ Issue Audit: 5 (2.5%)
```

---

## What Happens Next (After Submission)

### TAX CENTERS SUBMIT FEEDBACK
- Status stays: `AWAITING_REGIONAL_FEEDBACK`
- Tax centers receive the plan
- Each tax center provides capacity feedback
- Regional directors collect feedback

### REGIONAL DIRECTORS SUBMIT FEEDBACK
- Regional directors aggregate tax center feedback
- Add regional-level comments
- Submit regional feedback

### STATUS AUTO-UPDATES
- When ALL regions submit their feedback
- Status changes: `AWAITING_REGIONAL_FEEDBACK` → `FEEDBACK_COLLECTED`
- Plan moves to Director's "Feedback Ready" tab automatically

### DIRECTOR REVIEWS FEEDBACK
- Tab: "Feedback Ready"
- Director sees ALL regional feedback
- Director sees ALL tax center details
- Options: Accept feedback OR Request more

---

## Key Points

1. **First Plan Shows Correctly** ✅
   - All plan details display properly
   - Allocations show by audit type and region
   - Status badge shows "SUBMITTED_TO_DIRECTOR"

2. **After Approval - Submit Button Appears** ✅
   - When director approves, "Approve Plan" button disappears
   - "🚀 Submit to Regions for Feedback" button replaces it
   - Plan details still show in "To Approve" tab

3. **After Submission - Green Confirmation** ✅
   - Green alert box appears: "✅ Plan Submitted to Regions"
   - Shows distribution date/time
   - Shows status: "AWAITING_REGIONAL_FEEDBACK"
   - Plan remains visible for reference

4. **Status Tracking** ✅
   - Every action recorded in approval history
   - Timestamps for all submissions
   - Who approved/submitted shown in history
   - Optional comments/notes preserved

---

## Button Visibility Chart

| Status | Tab | Buttons Shown | Action |
|--------|-----|---------------|--------|
| SUBMITTED_TO_DIRECTOR | To Approve | ✅ Approve<br>❌ Send Back | Director reviews & decides |
| APPROVED_BY_DIRECTOR | To Approve | 🚀 Submit to Regions | Director submits to regions |
| AWAITING_REGIONAL_FEEDBACK | To Approve | (None - shows green status) | Regions collecting feedback |
| FEEDBACK_COLLECTED | Feedback Ready | ✅ Accept Feedback<br>❌ Request More | Director reviews feedback |

---

## UI Indicators

### Green Alert (After Submission)
```
✅ GREEN BOX
├─ Icon: Check circle
├─ Title: "✅ Plan Submitted to Regions"
└─ Message: "This plan has been distributed to all regions 
             for feedback collection. Regions can now view 
             the allocations and submit their feedback."
└─ Date: Shows when distributed
```

### Status Badge
```
Status shows: AWAITING_REGIONAL_FEEDBACK
Color: Orange/Warning (plan in progress)
```

### Approval History
```
Each action logged:
├─ SUBMITTED_TO_DIRECTOR (by Planning Team)
├─ DIRECTOR_APPROVED (by Director with comments)
├─ SUBMITTED_TO_REGIONS_FOR_FEEDBACK (by Director with notes)
└─ [more actions...]
```

---

## Complete Flow Chart

```
┌──────────────────────────────────────┐
│ 1. PLAN ARRIVES (SUBMITTED_TO_DIRECTOR)
│    → Show plan details ✅
│    → Two buttons: Approve / Send Back
└────────────┬─────────────────────────┘
             │
             ↓ Click "Approve"
             │
┌────────────┴─────────────────────────┐
│ 2. DIRECTOR APPROVES (APPROVED_BY_DIRECTOR)
│    → Add optional comments
│    → Confirm approval ✅
│    → Button changes: Approve → Submit to Regions
└────────────┬─────────────────────────┘
             │
             ↓ Click "Submit to Regions"
             │
┌────────────┴─────────────────────────┐
│ 3. SUBMITTED (AWAITING_REGIONAL_FEEDBACK)
│    → GREEN ALERT: "✅ Plan Submitted to Regions" ✅
│    → Add optional notes
│    → Confirm submission ✅
│    → Status changes ✅
│    → Buttons disappear (no more actions)
└────────────┬─────────────────────────┘
             │
             ↓ Regions submit feedback
             │
┌────────────┴─────────────────────────┐
│ 4. AUTO-UPDATE (FEEDBACK_COLLECTED)
│    → When ALL regions submit
│    → Status auto-changes ✅
│    → Plan moves to "Feedback Ready" tab
│    → Director can review & approve
└──────────────────────────────────────┘
```

---

## What Changed Today

1. ✅ Added green "Plan Submitted to Regions" alert
2. ✅ Shows distribution date/time after submission
3. ✅ Clear status indicator at top of plan details
4. ✅ Approval buttons only show for SUBMITTED status
5. ✅ Submit button only shows for APPROVED status
6. ✅ Better visual flow for each step

---

## Status: ✅ COMPLETE

**Build**: Exit Code 0
**File Modified**: `DirectorInitialApprovalView.jsx`
**Features**: Green submission confirmation added

