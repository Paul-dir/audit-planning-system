# Feedback Data Reset/Cleanup Guide

## What Happened
The data version was incremented from **2.3 → 2.4** to trigger automatic cleanup of old feedback data.

## How It Works

### Automatic Cleanup (Version-Based)
When the app loads:
1. It checks the stored data version in localStorage
2. If `data_version` doesn't match `DATA_VERSION` in the code (2.4), it:
   - Clears ALL localStorage data
   - Resets to fresh sample data
   - Updates version to 2.4

This happens automatically on next page load after code deployment.

### When It Happens
- ✅ First page load after version change: Old feedback cleared automatically
- ✅ Fresh start: All feedback and feedback tracking removed
- ✅ No manual intervention needed: The app handles it

## Manual Cleanup (If Needed)

If you want to manually clear data without waiting for automatic cleanup:

### Option 1: Clear via Browser Console
```javascript
// Open browser DevTools (F12)
// Go to Console tab
// Paste this:

localStorage.removeItem('audit_planning_system_v2');
localStorage.removeItem('data_version');
location.reload();
```

### Option 2: Clear via Storage Inspector
1. Open DevTools (F12)
2. Go to Storage / Application tab
3. Left sidebar: LocalStorage
4. Find `localhost:3000` 
5. Delete keys:
   - `audit_planning_system_v2`
   - `data_version`
6. Refresh page

## What Gets Reset

### ✅ Cleared Data
- `taxCenterFeedback` - All feedback submitted by tax centers
- `regionFeedbackTaxCenters` - Feedback tracking arrays
- `feedbackSubmitted` state - Submission status flags
- `allocationSentStatus` - Whether allocations were sent
- `taxCenterAcceptance` - Tax center accept/reject status
- All regional feedback status

### ✅ Preserved
- Sample plans (for testing)
- Plan allocation structures
- User organizational structure
- Regional allocation data

## Testing Fresh Feedback Flow

After data reset:

1. **Regional Director** 
   - Views plans → Sends to regions (creates allocations)
   - Allocations stored with timestamp

2. **Tax Center Manager**
   - Views "Receive Allocations"
   - Sees fresh allocations (no old feedback)
   - Default template loads
   - Can provide new feedback

3. **Feedback Submission**
   - First submit: ✅ Success
   - Re-attempt same plan: ⚠️ Warning "Already submitted"
   - Different plan: ✅ Can submit

4. **Persistence Check**
   - Reload page: Submission status persists
   - Button remains disabled: "✅ Feedback Submitted"

## Data Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.3 | Previous | Tax center allocation fixes |
| 2.4 | Current | Clear old feedback data for fresh testing |

## Troubleshooting

**Issue**: Still seeing old feedback after refresh
```
→ Manually clear localStorage via browser console
→ Verify data_version was deleted
→ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

**Issue**: Sample data not loading
```
→ Check console for errors
→ Clear both localStorage keys
→ Verify getDefaultData() in dataService.jsx has sample plans
```

**Issue**: Auth context not resetting
```
→ Logout from app first
→ Clear localStorage
→ Login again to get fresh org_context
```

## Code References

- **Version check**: `src/services/dataService.jsx` line ~1025
- **Version change**: `DATA_VERSION = '2.4'`
- **Default data**: `getDefaultData()` function
- **Load function**: `loadData()` function

## Impact on Development

- No manual database migrations needed
- Fresh test data on each major update
- Users won't lose important data (only happens on version change)
- Automatic - no user action required

---

**Status**: ✅ Feedback data cleanup ready on next app load
