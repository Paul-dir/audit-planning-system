# Migration Guide: From loadData/saveData to useData() Hook

## Overview
We're migrating from the deprecated `src/utils/data.js` to the new `useData()` hook from `src/services/dataService.jsx`.

## Current Status

### ✅ Already Migrated (4 Critical Components)
1. `RegionalFeedbackCollectionView.jsx` - Regional Directors
2. `DirectorInitialApprovalView.jsx` - Director Approval
3. `TaxCenterView.jsx` - Tax Center Feedback
4. `SeniorManagementFinalApproval.jsx` - Senior Management Approval

### ⚠️ Stub in Place
`src/utils/data.js` is now a stub that re-exports from `dataService.jsx` with deprecation warnings. This allows the build to pass while migration is in progress.

### 📋 Remaining Files (32 components)
Still importing from deprecated `utils/data.js`:

- ConfigurationView.jsx (uses: clearAllPlans, resetAllData, loadData, saveData)
- DirectorPlanReview.jsx
- SeniorManagementApprovalView.jsx
- RegionalDirectorView.jsx
- PlanJourneyView.jsx
- AuditTeamView.jsx
- AuditPlanningView.jsx
- AuditPlanningTeamAmendView.jsx
- DirectorView.jsx
- PlanSubmissionToRegionsView.jsx
- RegionalDirectorReceivePlansView.jsx
- AuditCaseSelectionView.jsx
- RequestForAuditView.jsx
- CasePrioritizationView.jsx
- ApprovedPlansDeploymentView.jsx
- CascadePlanToCasesView.jsx
- RegionalPlanSubmissionView.jsx
- RegionalPlanReviewView.jsx
- AuditCasesListView.jsx
- AuditCaseTypesConfigView.jsx
- DashboardView.jsx
- RiskEngineView.jsx
- TaxCenterAcceptancePlanView.jsx
- DirectorAmendedPlansView.jsx
- SubmitAuditRequestForm.jsx
- MyRequestsView.jsx
- StoredCasesView.jsx
- DirectorateRequesterView.jsx
- RegionFormatTest.jsx
- useAppData.js (hook)
- AssignToTeamLeadersView.jsx (and other assignment views)

## Migration Pattern

### Before (Deprecated)
```javascript
import { loadData, saveData } from '../../utils/data';

function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const data = loadData();
    setData(data);
  }, []);
  
  const handleSave = () => {
    const data = loadData();
    // modify data...
    saveData(data);
  };
}
```

### After (New Pattern)
```javascript
import { useData } from '../../services/dataService';

function MyComponent() {
  const { data, updateData } = useData();
  
  useEffect(() => {
    if (data) {
      // Use data...
    }
  }, [data]);
  
  const handleSave = () => {
    const updatedData = { ...data };
    // modify updatedData...
    updateData(updatedData);
  };
}
```

## Step-by-Step Migration

### 1. Change Import
```javascript
// OLD
import { loadData, saveData } from '../../utils/data';

// NEW
import { useData } from '../../services/dataService';
```

### 2. Get Hook
```javascript
function MyComponent() {
  const { data, updateData } = useData();
  // ... rest of component
}
```

### 3. Move Logic Inside Component
Move any `loadData()` calls into a function inside the component:

```javascript
const loadPlans = () => {
  // Use data here, not loadData()
  const plans = (data?.plans || []).filter(...);
  setPlans(plans);
};
```

### 4. Add useEffect
```javascript
useEffect(() => {
  if (data) {
    loadPlans();
  }
}, [data]); // Trigger when data changes
```

### 5. Replace saveData with updateData
```javascript
// OLD
const updatedData = { ...data };
// modify...
saveData(updatedData);

// NEW
const updatedData = { ...data };
// modify...
updateData(updatedData);
```

### 6. Handle Loading State
```javascript
const { data, loading, updateData } = useData();

if (loading) {
  return <div>Loading...</div>;
}
```

## Special Cases

### ConfigurationView - clearAllPlans & resetAllData
These functions are already available in dataService.jsx:

```javascript
// Import from dataService instead
import { clearAllPlans, resetAllData, useData } from '../../services/dataService';

// Use directly (they already save to localStorage)
const handleClearPlans = () => {
  clearAllPlans();
  window.location.reload(); // Or use refreshData() from useData()
};
```

### useAppData Hook
If there's a custom hook, migrate it to use useData internally:

```javascript
// src/hooks/useAppData.js
import { useData } from '../services/dataService';

export function useAppData() {
  const { data, updateData, loading, error } = useData();
  
  return {
    plans: data?.plans || [],
    data,
    updateData,
    loading,
    error
  };
}
```

## Testing After Migration

1. **Data Loads Correctly**
   - Plans appear in lists
   - No "0 plans found" messages
   - Allocations visible

2. **Updates Persist**
   - Changes save to localStorage
   - Data available after page reload
   - Approval/feedback submission works

3. **No Console Warnings**
   - No deprecation warnings
   - No import errors
   - Clean build

## Priority Order

### High Priority (Core Workflow)
1. ConfigurationView (admin tool)
2. DirectorView (main director workflow)
3. RegionalDirectorView (main regional workflow)
4. AuditTeamView (main audit team workflow)
5. PlanJourneyView (plan tracking)

### Medium Priority (Supporting)
6. SeniorManagementApprovalView
7. DirectorPlanReview
8. PlanSubmissionToRegionsView
9. RegionalDirectorReceivePlansView
10. AuditPlanningTeamAmendView

### Lower Priority (Utilities/Admin)
11. DashboardView
12. RiskEngineView
13. AuditCaseSelectionView
14. Other configuration/utility views

## Timeline
- ✅ Task 23 Phase 1: Critical components migrated + stub created
- 📋 Task 24+: Migrate remaining components based on priority
- 🎯 Final: Remove stub, delete data.js completely

## References
- `src/services/dataService.jsx` - New data service with useData hook
- `src/context/AuthContext.jsx` - Example of context provider pattern
- `src/components/views/RegionalFeedbackCollectionView.jsx` - Reference implementation
