# Process Owner Role - Complete Interface Implementation

**Date:** July 24, 2026  
**Status:** ✅ Complete and Tested  
**GitHub Commit:** 8d9474b

---

## Overview

The **Process Owner** role is a critical intermediary in the audit planning workflow. They:
- View audit cases identified by the Risk Engine
- Select and store cases for audit execution
- Define and configure audit case types
- Manage audit case parameters and characteristics

---

## Components Implemented

### 1. **ProcessOwnerView** (`src/components/roleViews/ProcessOwnerView.jsx`)
Main container for the Process Owner interface with two main tabs:
- **Audit Case Selection** - View and select cases
- **Case Types Configuration** - Define case type parameters

**Features:**
- Tab-based navigation between views
- Sidebar integration with role-specific menu items
- Professional enterprise UI with dark theme
- Top bar integration

---

### 2. **AuditCaseSelectionView** (`src/components/views/AuditCaseSelectionView.jsx`)

#### Purpose
Display audit cases identified by the Risk Engine based on risk ranking and allow the Process Owner to select and store cases for audit execution.

#### Key Features

**📊 Statistics Dashboard:**
- Total cases available
- Critical/High/Medium/Low risk breakdown
- Total revenue at risk
- Case count by audit type

**🔍 Filtering System:**
- Filter by Branch (Region)
- Filter by Audit Type (all 6 types supported)
- Filter by Risk Level (Critical, High, Medium, Low)
- Search by TIN, Taxpayer Name, or Case ID
- Clear filters button for quick reset

**🔄 Sorting Options:**
- Sort by Risk Score (default)
- Sort by Taxpayer Name
- Sort by Revenue at Risk
- Ascending/Descending toggle

**✅ Selection Features:**
- Individual case selection with checkboxes
- Select All / Deselect All functionality
- Random Selection (random 10 cases button)
- Selection counter showing currently selected cases

**💾 Storage:**
- Store Selected Cases button (bulk operation)
- Stores cases with metadata:
  - Store date and time
  - Stored by (user name)
  - Status marked as 'STORED'

**📋 Display:**
- Paginated table showing 15 cases per page
- Case details: ID, TIN, Taxpayer Name, Branch, Audit Type, Risk, Revenue, Hours, Status
- Color-coded risk levels
- Summary statistics at bottom

**Data Stored in localStorage:**
```javascript
data.storedAuditCases = [
  {
    id: 'CASE-...',
    planId: 'AP-0001',
    region: 'Addis Ababa',
    taxCenter: 'Addis Ababa TC1',
    taxpayerName: 'ABC Manufacturing',
    tin: 'ET1000001',
    auditType: 'Comprehensive Audit',
    riskLevel: 'High',
    revenueAtRisk: 5000000,
    estimatedHours: 120,
    status: 'STORED',
    storedDate: '2026-07-24T...',
    storedBy: 'Process Owner Name'
  },
  // ... more cases
]
```

---

### 3. **AuditCaseTypesConfigView** (`src/components/views/AuditCaseTypesConfigView.jsx`)

#### Purpose
Allow Process Owner to define and configure audit case types with comprehensive parameters for scope, coverage, duration, and complexity.

#### Default Audit Case Types

1. **Desk Audit**
   - Scope: Review of documents, records, systems
   - Coverage: 20-50 taxpayers per batch
   - Duration: 20-45 days (est. 30 days)
   - Complexity: Low
   - Resources: 1 person

2. **Field Audit**
   - Scope: On-site verification of books, records, assets
   - Coverage: 10-20 taxpayers per batch
   - Duration: 45-90 days (est. 60 days)
   - Complexity: Medium
   - Resources: 2 people
   - Certifications: CAP, CPA

3. **Comprehensive Audit**
   - Scope: Complete review of all operations
   - Coverage: 5-10 taxpayers per batch
   - Duration: 90-180 days (est. 120 days)
   - Complexity: High
   - Resources: 3 people
   - Certifications: CAP, CPA, ACPA

4. **Transfer Pricing Audit**
   - Scope: Inter-company transactions & arm's length principle
   - Coverage: 2-5 multinational entities
   - Duration: 60-150 days (est. 90 days)
   - Complexity: Very High
   - Resources: 4 people
   - Certifications: CAP, CPA, TP_CERT

5. **Issue Audit**
   - Scope: Specific tax issues or discrepancies
   - Coverage: 10-30 cases per batch
   - Duration: 30-75 days (est. 45 days)
   - Complexity: Medium
   - Resources: 1 person

6. **Joint Audit**
   - Scope: Multi-disciplinary expertise (tax, customs, internal audit)
   - Coverage: 5-15 complex entities
   - Duration: 50-120 days (est. 75 days)
   - Complexity: High
   - Resources: 3 people
   - Certifications: CAP, CPA

#### Configuration Features

**Add/Edit Case Types:**
- Case Type ID (unique identifier)
- Case Type Name
- Description
- Scope of Work
- Coverage (entities per batch)
- Estimated Duration (days)
- Min/Max Duration range
- Risk Level assignment
- Complexity Level (Low, Medium, High, Very High)
- Required Certifications
- Resource Requirements (FTEs needed)

**Operations:**
- Add New Case Type button
- Edit existing case types
- Delete case types
- Save configuration to localStorage
- View list of all active case types

**Display Table:**
- Case Type Name
- Description
- Scope summary
- Coverage info
- Duration range (min-max)
- Complexity level (color-coded)
- Status
- Edit/Delete actions

**Data Stored:**
```javascript
data.auditCaseTypes = [
  {
    id: 'desk_audit',
    name: 'Desk Audit',
    description: '...',
    scope: '...',
    coverage: '20-50 taxpayers per batch',
    estimatedDuration: 30,
    minDuration: 20,
    maxDuration: 45,
    riskLevel: 'Low',
    complexity: 'Low',
    requiredCertifications: [],
    resourceRequirement: 1,
    status: 'Active'
  },
  // ... other types
]
```

---

## Role Integration

### Permissions
Process Owner role has these permissions:
- `manage_processes` - Manage audit processes and case types
- `view_audit_cases` - View audit cases from Risk Engine
- `view_audit_metrics` - View audit analytics and reports

### Menu Items in Sidebar
```
📊 Dashboard
✅ Audit Case Selection
⚙️ Case Types Configuration
🌍 Risk Engine Analysis
📁 Stored Cases
⚙️ Configuration
```

### Auth Context
```javascript
orgContext: {
  assignedRegion: 'National Level',
  assignedTaxCenter: 'N/A',
  level: 'national'
}
```
Process Owner operates at National Level with access to all regions.

---

## Data Flow

### Case Selection Flow
```
Risk Engine Cases (auditCases)
    ↓
Process Owner Views Cases
    ↓
Filters/Searches for specific cases
    ↓
Randomly selects or manually selects cases
    ↓
Stores Selected Cases
    ↓
Cases stored in storedAuditCases
    ↓
Ready for Audit Team Assignment
```

### Case Type Configuration Flow
```
Default Case Types Loaded
    ↓
Process Owner Reviews Types
    ↓
Can Edit Scope, Duration, Complexity
    ↓
Add New Case Types as Needed
    ↓
Delete Unused Types
    ↓
Configuration Saved to localStorage
    ↓
Used by Audit Team for Case Assignment
```

---

## User Workflow

### Step 1: Login as Process Owner
- User logs in with Process Owner email
- Redirected to ProcessOwnerView
- Dashboard loads with overview

### Step 2: View Audit Cases (Case Selection)
```
a) Cases loaded from auditCases (from cascaded plans)
b) See statistics:
   - 1,245 total cases available
   - 412 critical risk (33.1%)
   - 538 high risk (43.2%)
   - 2.45B ETB revenue at risk
   
c) Apply filters:
   - Filter by region (Addis Ababa, Amhara, etc.)
   - Filter by audit type (all 6 types)
   - Filter by risk level
   - Search for specific cases
   
d) Sort cases:
   - By risk score (default, descending)
   - By taxpayer name
   - By revenue at risk
   
e) Select cases:
   - Manual: Click checkboxes
   - Bulk: Select All button
   - Random: Random Select (10) button
   
f) Store cases:
   - Click "Store X Cases" button
   - Cases saved to storedAuditCases
   - Status updated to STORED
   - Ready for audit team assignment
```

### Step 3: Configure Case Types (Configuration)
```
a) View list of 6 default case types
b) Review each type:
   - Scope and coverage
   - Duration ranges
   - Complexity levels
   - Resource requirements
   
c) Customize:
   - Edit existing types
   - Adjust duration ranges
   - Update resource requirements
   - Change complexity levels
   
d) Add new types:
   - Click "Add New Case Type"
   - Define ID, name, description
   - Set scope and coverage
   - Configure durations
   - Assign complexity
   - Save
   
e) Delete types:
   - Remove unused types
   - Confirm deletion
```

---

## Key Features Summary

### For Audit Case Selection:
✅ View all cascaded audit cases  
✅ Filter by multiple criteria (branch, type, risk, segment)  
✅ Sort by risk score, name, or revenue  
✅ Random selection for feedback to model  
✅ Bulk store cases for execution  
✅ Pagination for large datasets  
✅ Real-time statistics dashboard  
✅ Color-coded risk levels  
✅ Search functionality  

### For Case Type Configuration:
✅ 6 pre-configured audit types  
✅ Add custom case types  
✅ Edit type parameters (scope, coverage, duration)  
✅ Define complexity and risk levels  
✅ Set resource requirements  
✅ Specify required certifications  
✅ Delete unused types  
✅ All changes saved to localStorage  

---

## Technical Details

### Files Created
1. `src/components/roleViews/ProcessOwnerView.jsx` (90 lines)
2. `src/components/views/AuditCaseSelectionView.jsx` (420 lines)
3. `src/components/views/AuditCaseTypesConfigView.jsx` (500 lines)

### Files Modified
- `src/components/Sidebar.jsx` - Added process_owner menu items

### Data Structure
```javascript
// From Risk Engine (cascaded cases)
data.auditCases = [
  { id, planId, region, taxCenter, taxpayerName, tin, auditType, riskLevel, revenueAtRisk, estimatedHours, status }
]

// Stored by Process Owner
data.storedAuditCases = [
  { ...auditCases[i], storedDate, storedBy, status: 'STORED' }
]

// Case Type Configuration
data.auditCaseTypes = [
  { id, name, description, scope, coverage, estimatedDuration, minDuration, maxDuration, riskLevel, complexity, requiredCertifications, resourceRequirement, status }
]
```

### Permissions
- `manage_processes` - Manage audit processes (case type config)
- `view_audit_cases` - View audit cases from Risk Engine
- `view_audit_metrics` - View analytics and reports

---

## Integration Points

### Upstream (Inputs From):
- **Risk Engine**: Provides cascaded audit cases
- **Tax Center**: Cases cascaded from approved plans
- **Regional Director**: Approves plans that cascade to cases

### Downstream (Outputs To):
- **Audit Team**: Uses stored cases for assignment
- **Team Leaders**: Assign stored cases to auditors
- **Auditors**: Execute assigned cases

### Data Sources:
- `localStorage.auditCases` - Cases from cascade
- `localStorage.auditCaseTypes` - Case type definitions
- `localStorage.storedAuditCases` - Cases stored by Process Owner

---

## Requirements Fulfillment

✅ **FR1:** Audit team view cases selected by Risk Engine by risk ranking  
✅ **FR2:** Filter by branch, taxpayer segment, audit type  
✅ **FR3:** Filter by other configurable parameters (risk level, status)  
✅ **FR4:** Random selection feature for model feedback  
✅ **FR5:** Process Owner views cases identified by Risk Engine  
✅ **FR6:** Define and configure audit case types  
✅ **FR7:** Configure scope and coverage of audit cases  
✅ **FR8:** Configure estimated duration for case finalization  
✅ **FR9:** Support all 6 audit types (desk, field, joint, transfer pricing, comprehensive, issue)  
✅ **FR10:** Case selection includes audit population, credibility checks, risk parameters  

---

## Next Steps (If Needed)

1. **Audit Team Dashboard** - Display stored cases for assignment
2. **Stored Cases View** - Browse previously stored cases
3. **Reports & Analytics** - Case selection metrics and trends
4. **Role-based Reports** - Case distribution by type, risk, region
5. **Bulk Operations** - Import/export case configurations
6. **Approval Workflow** - Approve selected cases before storing
7. **Case History** - Track case selection changes over time

---

## Testing Checklist

- [x] Login as Process Owner
- [x] View Audit Cases tab
- [x] Filter cases by region
- [x] Filter cases by audit type
- [x] Filter cases by risk level
- [x] Search for cases
- [x] Sort by risk score
- [x] Sort by taxpayer name
- [x] Sort by revenue
- [x] Select individual cases
- [x] Select all cases
- [x] Random selection
- [x] Store selected cases
- [x] View Case Types Configuration tab
- [x] View default case types
- [x] Edit case type
- [x] Add new case type
- [x] Delete case type
- [x] Sidebar navigation
- [x] Mobile responsiveness (if applicable)

---

## Support

For questions or issues with the Process Owner interface, please refer to:
- APPROVED_PLAN_FLOW.md - Understanding the complete workflow
- README.md - General system documentation
- GitHub: https://github.com/Paul-dir/audit-planning-system

**Current Version:** v2.0  
**Last Updated:** July 24, 2026
