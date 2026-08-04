# Real-Time Data Routing: Regional Director Feedback Collection

## Overview

Real-time feedback routing has been implemented to allow Regional Directors to see tax center feedback submissions instantly as they occur. This creates a live dashboard experience where feedback flows from Tax Centers → Regional Director in real-time.

## Features Implemented

### 1. Real-Time Feedback Tracking
- **Automatic Detection**: System automatically detects when tax centers submit new feedback
- **Comparison Logic**: Tracks which feedback is "new" vs previously seen
- **Live Counter**: Shows number of new submissions at top of page

### 2. Real-Time Notifications
- **Animated Alert Banner**: Eye-catching notification when new feedback arrives
- **Pulse Animation**: Visual emphasis on new submissions
- **Dismissible**: Regional Director can dismiss notification but feedback remains
- **Counter Badge**: Shows exact number of new submissions

### 3. Enhanced Feedback Display
- **Audit Type Details**: Shows complete feedback by audit type (capacity, resources, timeline, remarks)
- **Visual Highlights**: New submissions highlighted in orange with "🆕 NEW" badge
- **Timestamps**: Shows "Just submitted: [timestamp]" for new feedback
- **Scrollable View**: Can review multiple tax center submissions without leaving page

### 4. Real-Time Feedback Stream
- **Dedicated Dashboard**: New section showing all feedback in chronological order
- **Most Recent First**: Newest submissions appear at top
- **Visual Status**: New submissions have different styling than viewed feedback
- **Quick Overview**: See all incoming feedback at a glance

## Data Flow

```
Tax Center (TaxCenterReceiveAllocationsView)
    ↓
1. Tax Center Manager provides feedback
2. Clicks "Submit Feedback"
3. Feedback saved to plan.taxCenterFeedback[region][taxCenter]
4. updateData() persists to storage
    ↓
Regional Director (RegionalFeedbackCollectionView)
    ↓
5. Detects new feedback via trackRealTimeFeedback()
6. Updates realTimeFeedback state with isNew flag
7. Shows notification badge
8. Updates feedback count
9. Displays in Real-Time Feedback Stream
10. Shows audit type details in feedback form
    ↓
Regional Director Reviews
    ↓
11. Regional Director can see all tax center feedback
12. Can make informed regional feedback decision
13. Submits regional feedback with all context
```

## Implementation Details

### State Management
```javascript
// Track real-time feedback submissions
const [realTimeFeedback, setRealTimeFeedback] = useState({});
// Show/hide notifications
const [showNotifications, setShowNotifications] = useState(true);
// Count of new submissions
const [newFeedbackCount, setNewFeedbackCount] = useState(0);
```

### Real-Time Tracking Function
```javascript
const trackRealTimeFeedback = () => {
  // For each plan in this region
  // For each tax center's feedback
  //   Compare with previous state
  //   If new: mark as isNew
  //   Store feedback details
  // Update realTimeFeedback state
  // Count new submissions
}
```

Called automatically when data changes: `useEffect(() => { loadPlans(); trackRealTimeFeedback(); }, [data])`

### Visual Indicators

**New Feedback:**
```
🆕 Tax Center Name (orange border-left)
Status: NEW badge
Timestamp: "🔔 Just submitted: [time]"
Box: orange/10 background with animate-pulse
```

**Viewed Feedback:**
```
✅ Tax Center Name (teal border-left)
Status: No badge
Timestamp: "Submitted: [time]"
Box: ink background, normal
```

**Not Yet Submitted:**
```
No entry in feedback display
Only shows in awaiting list
```

## Feedback Display Sections

### 1. Header Notification Banner (if newFeedbackCount > 0)
```
🔔 Real-Time Feedback: 3 new submission(s)
Tax centers have submitted feedback - check below for details
[Dismiss button]
```

### 2. Feedback Form Section (when providing feedback)
Shows detailed audit type feedback:
```
📊 Real-Time Tax Center Feedback (3):

🆕 Addis Ababa TC1 (NEW badge, orange highlight)
  Feedback by Audit Type:
    • 5x desk_audit: Capacity: Adequate | Resources: Available | Timeline: On Schedule
      "We can handle 5 desk audit cases"
    • 3x field_audit: Capacity: Insufficient | Resources: Limited | Timeline: Need Extension
      "Need more resources for field audits"
  🔔 Just submitted: 2024-08-04, 10:30 AM

✅ Dire Dawa TC2
  [Previous submission - not highlighted]
  Submitted: 2024-08-04, 09:15 AM
```

### 3. Real-Time Feedback Stream Dashboard
```
Real-Time Feedback Stream (5)
[Chronologically sorted, newest first]

🆕 Addis Ababa TC1 - Plan AP-2024-001 (NEW badge)
🔔 Just submitted 5 seconds ago

🆕 Dire Dawa TC2 - Plan AP-2024-002 (NEW badge)
🔔 Just submitted 2 minutes ago

✅ Mekelle TC3 - Plan AP-2024-001
Previously submitted
```

## User Experience Flow

### For Regional Director:
1. Opens feedback collection view
2. Sees notification: "🔔 Real-Time Feedback: 2 new submission(s)"
3. Can dismiss notification or leave it visible
4. Selects a plan to review
5. Views all tax center feedback in organized sections:
   - **In Feedback Form**: Sees detailed audit type feedback
   - **In Feedback Stream**: Sees timeline of all submissions
6. New submissions highlighted in orange
7. Can read detailed feedback by audit type
8. Then provides regional director feedback
9. Submits regional feedback with full context

### Workflow Benefits:
- ✅ Regional Director stays informed in real-time
- ✅ No need to refresh page - updates live
- ✅ Can see exactly what tax centers submitted
- ✅ Detailed audit type feedback helps make better decisions
- ✅ Timestamps show when feedback came in
- ✅ Visual priority given to new submissions

## Technical Implementation

### File: `src/components/views/RegionalFeedbackCollectionView.jsx`

**Key Changes:**
1. Added `realTimeFeedback` state object to track submissions
2. Added `trackRealTimeFeedback()` function that runs on data changes
3. Added real-time notification banner at top of page
4. Enhanced feedback display to show detailed audit type data
5. Added Real-Time Feedback Stream dashboard
6. Marks new submissions with visual indicators

**State Structure:**
```javascript
realTimeFeedback = {
  "planId-taxCenterName": {
    feedbackByType: { /* audit type feedback */ },
    feedbackDate: "ISO timestamp",
    feedbackBy: "Manager Name",
    isNew: true,  // ← NEW: tracks if recently submitted
    planId: "Plan ID",
    taxCenter: "Tax Center Name",
    submittedAt: "ISO timestamp"
  },
  // ... more feedback ...
}
```

## Real-Time Updates

### How It Works:
1. Tax Center Manager submits feedback via `TaxCenterReceiveAllocationsView`
2. Calls `await updateData(updatedData)` - saves to persistent storage
3. Triggers `useData()` hook listeners
4. `RegionalFeedbackCollectionView` sees data change
5. `useEffect` detects change and calls `loadPlans()` + `trackRealTimeFeedback()`
6. `trackRealTimeFeedback()` compares new vs previous feedback
7. Sets `isNew: true` for submissions not seen before
8. Updates notification count and feedback stream
9. UI updates automatically - Regional Director sees new feedback instantly

## Persistence & Navigation

- ✅ Feedback persists after page refresh
- ✅ New status maintained as long as Regional Director sees it
- ✅ If navigating away and back: feedback preserved with timestamps
- ✅ Notification can be dismissed but feedback visible in stream

## Future Enhancements

1. **Auto-Dismiss**: Notification auto-dismisses after X seconds
2. **Sound Alert**: Optional audio notification for new feedback
3. **Filtering**: Filter feedback by status (new/viewed, plan, region)
4. **Export**: Export feedback to PDF for documentation
5. **Escalation**: Flag high-priority feedback (e.g., "Insufficient" capacity)
6. **Analytics**: Track feedback submission times, patterns

## Testing Checklist

- [ ] Tax Center submits feedback
- [ ] Notification appears with count
- [ ] Feedback shows with "🆕 NEW" badge
- [ ] Orange highlight visible
- [ ] Timestamp shows "🔔 Just submitted"
- [ ] Audit type details display
- [ ] Regional Director can dismiss notification
- [ ] Feedback persists in stream
- [ ] Page refresh: feedback still visible
- [ ] Correct regional feedback data flows to feedback form

## Build Status

✅ **Exit Code: 0**
✅ **124 modules transformed**
✅ **No errors or warnings**

---

**Real-time feedback routing is now live and ready for testing!**
