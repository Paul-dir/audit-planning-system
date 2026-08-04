# Regional Feedback Collection - Two-Tab Interface Fix

## Problem
After Regional Director submitted feedback, they would see **"0 plans to review"** even though they had already submitted. The submitted feedback disappeared from the view.

## Root Cause
The filter logic excluded submitted plans:
```javascript
// OLD CODE - filtered OUT submitted plans
if (plan.regionFeedbackStatus?.[region]?.status === 'received') return false;
```

This meant once a regional director submitted feedback:
- Plan status changed to `regionFeedbackStatus[region].status = 'received'`
- Filter excluded that plan from the list
- Plan disappeared from view
- Regional director couldn't see their submitted feedback

## Solution
Created a **two-tab interface** like the Director has:

### Tab 1: "Awaiting" (Default)
- Shows plans NOT YET submitted by this region
- Regional Directors can provide feedback
- Count: Plans where `regionFeedbackStatus[region].status !== 'received'`
- Button: "💬 Provide Feedback"

### Tab 2: "Submitted" (New)
- Shows plans ALREADY submitted by this region
- Read-only view of previously submitted feedback
- Count: Plans where `regionFeedbackStatus[region].status === 'received'`
- Shows: Regional feedback, tax center summary, submission timestamp

## Implementation Details

### Data Loading
```javascript
const loadPlans = () => {
  // ✅ Load ALL regional plans (both awaiting AND submitted)
  const allRegionalPlans = (data.plans || []).filter(plan => {
    if (plan.status !== 'AWAITING_REGIONAL_FEEDBACK' && 
        plan.status !== 'FEEDBACK_COLLECTED') return false;
    if (!plan.regionalAllocation || !plan.regionalAllocation[region]) return false;
    return true;
  });
  setPlans(allRegionalPlans);
};
```

### Tab Filtering
```javascript
const getTabPlans = () => {
  switch(activeTab) {
    case 'awaiting':
      return plans.filter(p => p.regionFeedbackStatus?.[region]?.status !== 'received');
    case 'submitted':
      return plans.filter(p => p.regionFeedbackStatus?.[region]?.status === 'received');
  }
};
```

### Tab Display
```jsx
{/* Tabs */}
<button onClick={() => setActiveTab('awaiting')}>
  Awaiting ({awaitingCount})
</button>
<button onClick={() => setActiveTab('submitted')}>
  Submitted ({submittedCount})
</button>
```

## User Experience

### Workflow
1. Regional Director goes to "Feedback Collection" view
2. Sees **"Awaiting"** tab by default with plans to review
3. Fills out feedback and submits
4. Plan disappears from "Awaiting" tab
5. Regional Director switches to **"Submitted"** tab
6. Sees their previously submitted feedback (read-only)
7. Can see exactly what they submitted, when, and any tax center details

### Tab Counts
```
Awaiting (3)          ← Plans waiting for feedback from this region
Submitted (2)         ← Plans already submitted by this region

Total: 5 plans in feedback workflow for this region
```

## Data Structure

### After Submission
```javascript
plan.regionFeedbackStatus[region] = {
  status: 'received',  // ← Key indicator - this hides from "Awaiting" tab
  regionalFeedback: 'Regional director comments about the plan...',
  taxCenterFeedback: [
    { taxCenter: 'Addis Ababa TC1', feedback: 'Good capacity' },
    { taxCenter: 'Addis Ababa TC2', feedback: 'Needs resources' }
  ],
  receivedDate: '2026-08-04T10:30:00Z'
}
```

## Submitted Tab Display

Shows read-only information:
```
✅ Your Submitted Feedback

REGIONAL DIRECTOR FEEDBACK:
"All tax centers confirmed they can handle their allocations. 
Field audits may need additional resources."

TAX CENTER SUMMARY:
• oromia-tc1: Good capacity for field audits
• oromia-tc2: Need more resources
• oromia-tc3: Standard delivery expected

📅 Submitted: August 4, 2026 10:30 AM
```

## File Changes

**File**: `src/components/views/RegionalFeedbackCollectionView.jsx`

### State Changes
- Added: `activeTab` state (default: 'awaiting')

### Function Changes
- Updated: `loadPlans()` - now loads both awaiting AND submitted plans
- Added: `getTabPlans()` - filters based on active tab
- Updated: `handleSelectPlan()` - works for both tabs

### JSX Changes
- Added: Tab buttons (Awaiting / Submitted)
- Updated: Plans list - uses `getTabPlans()` instead of `plans`
- Added: Tab-specific counts in header
- Updated: Feedback form conditional - only shows on "Awaiting" tab
- Added: Read-only submitted feedback display for "Submitted" tab

## Verification

### Scenario: Regional Director Workflow
1. ✅ Sees plans awaiting feedback in "Awaiting" tab
2. ✅ Provides feedback and submits
3. ✅ Plan moves to "Submitted" tab
4. ✅ Can view submitted feedback anytime
5. ✅ Cannot edit submitted feedback (read-only)
6. ✅ Can see submission timestamp and tax center summary

### Edge Cases Handled
- ✅ Empty "Awaiting" tab shows "No plans awaiting feedback"
- ✅ Empty "Submitted" tab shows "No plans with submitted feedback"
- ✅ Plan counts update correctly
- ✅ Tab switching doesn't lose selected plan context
- ✅ Works for any region (not hardcoded)

## Testing Checklist

- [x] Build passes: `npm run build` → Exit Code 0
- [x] "Awaiting" tab shows plans not submitted
- [x] "Submitted" tab shows plans already submitted
- [x] Tab counts update correctly
- [x] Can select plans in either tab
- [x] Feedback form only shows in "Awaiting" tab
- [x] Read-only view shows in "Submitted" tab
- [x] Submission timestamp displays
- [x] Tax center summary shows in submitted view
- [x] Regional feedback text displays

## Benefits

1. **Visibility**: Regional directors can see their submitted feedback
2. **Persistence**: Feedback doesn't disappear after submission
3. **Organization**: Clear separation between pending and completed work
4. **History**: Can review what was previously submitted
5. **Consistency**: Mirrors Director's two-tab interface pattern

## Related Files

- `src/components/views/DirectorInitialApprovalView.jsx` - Similar two-tab pattern
- `src/utils/businessLogic.js` - Status update logic
- `src/components/views/TaxCenterView.jsx` - Where tax center feedback comes from

---

## Status: ✅ COMPLETE

**Build**: Exit Code 0
**Last Updated**: August 4, 2026
**Changes**: 1 file modified

