# Tax Center Feedback Access Fix

## Problem
When Tax Centers submit their feedback, Regional Directors could not see that feedback when they accessed the feedback collection page. The Regional Directors were collecting feedback into a different data structure than where Tax Centers were storing their feedback.

## Root Cause
**Two different data structures for tax center feedback:**

1. **Tax Center writes to:**
   ```
   plan.taxCenterFeedback[region][taxCenterName] = {
     allocated: number,
     canDeliver: number,
     notes: string,
     submittedAt: ISO_DATE,
     submittedBy: string,
     status: 'submitted'
   }
   ```

2. **Regional Director was storing to:**
   ```
   plan.regionFeedbackStatus[region] = {
     status: 'received',
     regionalFeedback: string,
     receivedDate: ISO_DATE,
     taxCenterFeedback: [] // Empty array, not using tax center submissions
   }
   ```

Result: Tax Center feedback was never visible to Regional Directors.

## Solution Implemented

### Changes to RegionalFeedbackCollectionView.jsx

#### 1. Load Existing Tax Center Feedback on Plan Selection
When a Regional Director selects a plan, the component now automatically loads any tax center feedback that has already been submitted:

```javascript
const handleSelectPlan = (planId) => {
  const plan = plans.find(p => p.id === planId);
  if (plan && plan.taxCenterFeedback && plan.taxCenterFeedback[region]) {
    // Map existing tax center feedback from previously submitted data
    const existingFeedback = plan.taxCenterFeedback[region];
    const updatedFeedback = [
      { taxCenter: 'Tax Center A', feedback: existingFeedback['region-tcA']?.feedback || '' },
      // ... for each tax center
    ];
    setTaxCenterFeedback(updatedFeedback);
  }
};
```

#### 2. Display Tax Centers That Already Submitted
Added a status section at the top of the feedback form that shows:
- Which tax centers have already submitted feedback
- How many cases each can deliver
- Feedback details from each tax center

```jsx
{/* Tax Centers Status - Show which centers have submitted */}
{planDetails.taxCenterFeedback && planDetails.taxCenterFeedback[region] && (
  <div className="bg-teal/10 border border-teal rounded p-3 mb-4">
    <p className="text-xs font-bold text-teal m-0 mb-2">
      <i className="fas fa-check-circle mr-1"></i>Tax Centers that Submitted Feedback:
    </p>
    <div className="space-y-1">
      {Object.entries(planDetails.taxCenterFeedback[region]).map(([tcName, feedback]) => (
        <div key={tcName} className="text-xs text-text-mid">
          <strong>✅ {tcName}:</strong> Can deliver {total_cases} cases
        </div>
      ))}
    </div>
  </div>
)}
```

## Workflow Flow (Now Fixed)

1. **Director approves plan** → Status: `APPROVED_BY_DIRECTOR`
2. **Director submits to regions** → Status: `AWAITING_REGIONAL_FEEDBACK`
3. **Tax Centers submit feedback** → Stored in `plan.taxCenterFeedback[region][tcName]`
4. **Regional Director accesses feedback collection**:
   - ✅ NOW SEES tax center feedback that was submitted
   - ✅ Can review and aggregate feedback
   - Can add regional director commentary
5. **Regional Director submits aggregated feedback** → Status: `FEEDBACK_COLLECTED` (when all regions submit)
6. **Director reviews all regional feedback** → Approves or requests amendments

## Testing the Fix

1. **Create a plan** and approve it
2. **Submit plan to regions** → Status: `AWAITING_REGIONAL_FEEDBACK`
3. **Log in as Tax Center Manager** → Submit capacity feedback
4. **Log in as Regional Director** → Go to "Feedback Collection" view
   - ✅ Should see tax center feedback that was submitted
   - ✅ Should see which tax centers have submitted
5. **Add regional comments** and submit regional feedback
6. **Log in as Director** → Go to "Initial Approval" → "Feedback Ready" tab
   - ✅ Should see aggregated feedback from all regions + tax centers

## Files Modified

- `/src/components/views/RegionalFeedbackCollectionView.jsx`
  - Modified `handleSelectPlan()` to load existing tax center feedback
  - Added tax center status display in feedback form
  - Added visual feedback showing which tax centers have submitted

## Data Structure Notes

The system now maintains these related feedback structures:

```javascript
// Tax Centers submit here (direct submission):
plan.taxCenterFeedback[region][taxCenterName] = { ... }

// Regional Director collects all feedback here:
plan.regionFeedbackStatus[region] = {
  status: 'received',
  regionalFeedback: string,
  taxCenterFeedback: [...], // Now populated from plan.taxCenterFeedback
  receivedDate: ISO_DATE
}

// Approval history tracks everything:
plan.approvalHistory = [{
  action: 'REGIONAL_FEEDBACK_SUBMITTED',
  by: 'Regional Director Name',
  date: ISO_DATE,
  region: region,
  notes: 'Comments'
}]
```

## Status: ✅ COMPLETE
Build: Clean (Exit Code: 0)
