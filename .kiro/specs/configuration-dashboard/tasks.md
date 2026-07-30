# Configuration Dashboard Enhancement - Implementation Tasks

**Version:** 1.0  
**Date:** July 27, 2026  
**Status:** Ready for Implementation  
**Estimated Effort:** 18-22 hours  
**Phases:** 4 (Foundation → Modules → Features → Integration)

---

## Implementation Plan Overview

### Phase A: Foundation & Infrastructure (3-4 hours)
- Task A1-A4: Core components, routing, data layer

### Phase B: Dashboard & Basic Modules (5-6 hours)
- Task B1-B6: Dashboard, Audit Types, Tax Types, Industries

### Phase C: Complex Modules (6-8 hours)
- Task C1-C5: Skills, Regions, Risk Indicators, Standards, Workflow

### Phase D: Advanced Features & Integration (4-5 hours)
- Task D1-D4: Feature Flags, National KPI, Import/Export, Integration

---

## PHASE A: Foundation & Infrastructure (3-4 hours)

### Task A1: Create Component Directory Structure
**Effort:** 30 minutes

**Description:**
Create the folder structure for all configuration components as defined in design.md section 16.

**Steps:**
1. Create `src/components/configuration/` directory
2. Create `src/components/configuration/modules/` subdirectory
3. Create `src/components/configuration/shared/` subdirectory
4. Create placeholder files for all 12 module components
5. Create shared component files (ModuleCard, ModuleForm, ConfirmDialog, ModuleTable, StatusBadge)

**Acceptance Criteria:**
- ✅ All directories exist
- ✅ Placeholder files created
- ✅ Correct names matching component hierarchy

---

### Task A2: Create Routing Structure
**Effort:** 45 minutes

**Description:**
Add routing configuration for Configuration Dashboard in App.jsx and create route components.

**Steps:**
1. Add route `/configuration` to App.jsx
2. Add child routes for each of 12 modules
3. Create route wrappers if needed
4. Add Configuration navigation in Sidebar.jsx
5. Create active state styling for Configuration menu

**Acceptance Criteria:**
- ✅ All routes navigate correctly
- ✅ No console errors
- ✅ Sidebar shows Configuration menu

---

### Task A3: Create Shared/Utility Functions
**Effort:** 1 hour

**Description:**
Create utility functions for common configuration operations.

**Steps:**
1. Create `src/utils/configurationUtils.js`:
   - `getStatusIndicator(moduleKey)` - returns status color & label
   - `getModuleCount(moduleKey)` - counts items in module
   - `validateConfigurationItem(item, type)` - validates data
   - `calculateModuleStats(module)` - returns stats object
   - `getModuleIcon(moduleKey)` - returns icon name
2. Create `src/utils/auditTrail.js`:
   - `logConfigChange(action, module, details)` - log change
   - `getAuditTrail()` - retrieve audit trail
   - `exportAuditTrail()` - export as JSON/CSV
3. Add localStorage helpers in existing storage functions

**Acceptance Criteria:**
- ✅ All functions work correctly
- ✅ Error handling present
- ✅ Functions tested with sample data

---

### Task A4: Update auditConfig.js with Audit Trail
**Effort:** 1 hour

**Description:**
Extend auditConfig.js to include audit trail tracking system.

**Steps:**
1. Add `systemAuditTrail: []` array to auditConfig
2. Create audit trail entry structure:
   ```
   {
     timestamp: Date,
     action: 'add'|'edit'|'delete',
     module: string,
     itemId: string,
     changes: object,
     user: string (or 'admin'),
     status: 'success'|'failed'
   }
   ```
3. Add function `auditConfig.logChange(action, module, changes)`
4. Integrate with localStorage persistence

**Acceptance Criteria:**
- ✅ Audit trail structure defined
- ✅ Logging function works
- ✅ Data persists to localStorage

---

## PHASE B: Dashboard & Basic Modules (5-6 hours)

### Task B1: Create ConfigurationDashboard.jsx
**Effort:** 1 hour

**Description:**
Main dashboard component showing all 12 modules.

**Implementation:**
1. Create ConfigurationDashboard.jsx with:
   - State: selectedModule (null shows dashboard, module key shows module view)
   - State: configurations (loaded from localStorage)
   - Effect: Load configurations on mount
2. Conditional rendering: Dashboard OR selected module view
3. Header with title, search, summary
4. ModuleGrid with 12 ModuleCard components
5. Navigation back button
6. Search functionality to filter modules by name

**File:** `src/components/configuration/ConfigurationDashboard.jsx`

**Acceptance Criteria:**
- ✅ Renders all 12 module cards
- ✅ Search filters cards
- ✅ Click card switches to module view
- ✅ Back button returns to dashboard
- ✅ Build successful (0 errors)

---

### Task B2: Create ModuleCard Component
**Effort:** 45 minutes

**Description:**
Reusable card component for dashboard grid.

**Implementation:**
1. Create ModuleCard.jsx:
   - Props: icon, title, count, status, onClick
   - Displays icon, title, count badge, status indicator
   - Hover effect (shadow, scale, border color)
   - Action button labeled "Configure"
   - Proper spacing and layout
2. CSS: Responsive sizing, transitions

**File:** `src/components/configuration/ModuleCard.jsx`

**Acceptance Criteria:**
- ✅ Card displays correctly
- ✅ Hover effects smooth
- ✅ Responsive on mobile/tablet/desktop
- ✅ Click handler fires

---

### Task B3: Create AuditTypesModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 6 audit types (FR2).

**Implementation:**
1. Create AuditTypesModule.jsx:
   - List view table with columns: Name, Effort, Complexity, Skills, Actions
   - Add button opens form in modal
   - Edit button pre-fills form
   - Delete button with confirmation
   - Form fields: ID, Name, Effort, Complexity, Skills multi-select
   - Validation for all fields
   - Save persists to localStorage
   - Status indicator shows "6 configured"
2. Display all 6 audit types correctly

**File:** `src/components/configuration/modules/AuditTypesModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 6 audit types
- ✅ Add new audit type works
- ✅ Edit existing type works
- ✅ Delete with confirmation works
- ✅ Validation prevents invalid data
- ✅ Changes persist
- ✅ No build errors

---

### Task B4: Create TaxTypesModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 7 tax types (FR3).

**Implementation:**
1. Create TaxTypesModule.jsx:
   - List view table: Name, Risk Weight, Compliance, Revenue Impact, Actions
   - Add/Edit/Delete operations
   - Form fields: Name, Risk Weight (slider 0.5-2.0), Compliance % (0-100)
   - Validation rules
   - Display all 7 tax types
   - Status shows "7 configured"

**File:** `src/components/configuration/modules/TaxTypesModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 7 tax types
- ✅ Risk weight slider works (0.5-2.0)
- ✅ Compliance percentage tracked
- ✅ All CRUD operations work
- ✅ Data persists correctly

---

### Task B5: Create IndustriesModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 10 industries (FR4).

**Implementation:**
1. Create IndustriesModule.jsx:
   - List view table: Name, Risk Score, Compliance, Audit Count, Actions
   - Add/Edit/Delete operations
   - Form fields: Name, Risk Score (1-100), Compliance % (0-100), Code
   - Bulk risk score adjustment button
   - Display all 10 industries
   - Status shows "10 configured"

**File:** `src/components/configuration/modules/IndustriesModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 10 industries
- ✅ Risk score 1-100 scale
- ✅ Bulk edit updates multiple items
- ✅ All CRUD operations work
- ✅ Validation enforces ranges

---

### Task B6: Create TaxpayerCategoriesModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 4 taxpayer categories (FR5).

**Implementation:**
1. Create TaxpayerCategoriesModule.jsx:
   - List view table: Category, Turnover Range, Frequency, Actions
   - Add/Edit/Delete operations
   - Form fields: Name, Turnover From/To, Audit Frequency, Complexity
   - All 4 categories must remain (Large, Medium, Small, Micro)
   - Prevent deletion if would leave less than 4 total
   - Status shows "4 configured"

**File:** `src/components/configuration/modules/TaxpayerCategoriesModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 4 taxpayer categories
- ✅ Turnover ranges validate correctly
- ✅ Audit frequency 0.25-4.0 per year
- ✅ Cannot delete below 4 categories
- ✅ All CRUD operations work

---

## PHASE C: Complex Modules (6-8 hours)

### Task C1: Create SkillsModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 12 skills with gap analysis (FR6).

**Implementation:**
1. Create SkillsModule.jsx:
   - List view table: Name, Level, Category, Availability, Actions
   - Add/Edit/Delete operations
   - Form fields: Name, Level (1-5), Category select, Description
   - Display all 12 skills
   - Skills gap analysis feature:
     - Compare required skills to available auditors per region
     - Show shortage count by skill
   - Status shows "12 configured"

**File:** `src/components/configuration/modules/SkillsModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 12 skills
- ✅ Level range 1-5 enforced
- ✅ Gap analysis shows shortage calculation
- ✅ All CRUD operations work
- ✅ Validation prevents invalid levels

---

### Task C2: Create RegionsTaxCentersModule Component
**Effort:** 2 hours

**Description:**
Two-section interface for 6 regions and 18 tax centers (FR7).

**Implementation:**
1. Create RegionsTaxCentersModule.jsx with two sections:
   - **Regions Section:**
     - Table: Name, Taxpayers, Auditors, Tax Centers Count, Actions
     - Add/Edit/Delete region
     - Display 6 regions correctly
   - **Tax Centers Section:**
     - Grouped by region (collapsible/expandable)
     - Show capacity utilization %
     - Add/Edit/Delete tax center under region
     - Display 18 tax centers (3 per region)
     - Bottleneck alert if >85% capacity
2. Forms for add/edit region and tax center
3. Cascade delete handling (deleting region warns about tax centers)

**File:** `src/components/configuration/modules/RegionsTaxCentersModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 6 regions with correct taxpayer counts
- ✅ Displays 18 tax centers in hierarchy
- ✅ Add/Edit/Delete all entities
- ✅ Capacity % shows and calculates
- ✅ Bottleneck alerts at >85%
- ✅ Cascade delete prevented or warned

---

### Task C3: Create RiskIndicatorsModule Component
**Effort:** 1.5 hours

**Description:**
Full CRUD interface for 10 risk indicators with weight distribution (FR8).

**Implementation:**
1. Create RiskIndicatorsModule.jsx:
   - List view table: Name, Weight, Category, Sources, Actions
   - Add/Edit/Delete operations
   - Form fields: Name, Weight (1-10), Category select, Description, Data Sources
   - Display all 10 risk indicators
   - Weight distribution pie chart (visual)
   - Impact analysis: % of taxpayers flagged by each indicator
   - Status shows "10 configured"

**File:** `src/components/configuration/modules/RiskIndicatorsModule.jsx`

**Acceptance Criteria:**
- ✅ Displays 10 risk indicators
- ✅ Weight range 1-10 enforced
- ✅ Pie chart shows weight distribution
- ✅ Impact analysis calculates coverage
- ✅ All CRUD operations work

---

### Task C4: Create AuditStandardsModule Component
**Effort:** 1.5 hours

**Description:**
Configuration form for audit quality standards (FR9).

**Implementation:**
1. Create AuditStandardsModule.jsx:
   - Configuration form (not list-based):
     - Documentation Required toggle
     - Work Paper Standards select
     - Compliance Framework select
     - Reporting Format select
     - Quality Review Level (1-3) select
     - Requirement Coverage % input
     - Review Timeline (days) input
     - Evidence Retention (months) input
   - Save/Reset buttons
   - Apply standard template button
   - Display current audit standards
   - Show audit trail of who changed what

**File:** `src/components/configuration/modules/AuditStandardsModule.jsx`

**Acceptance Criteria:**
- ✅ Form displays all fields
- ✅ Save persists changes
- ✅ Reset restores previous state
- ✅ Audit trail shows changes
- ✅ Validation prevents invalid inputs

---

### Task C5: Create WorkflowApprovalModule Component
**Effort:** 1.5 hours

**Description:**
Configuration interface for approval workflows and rules (FR10).

**Implementation:**
1. Create WorkflowApprovalModule.jsx:
   - Configuration form with sections:
     - Approval Requirements (toggles: Director, Regional, Senior Mgmt)
     - Amendment Rules (max rounds, deadlines)
     - Rejection Handling (allow rejection, reason required)
     - Escalation Rules
   - Workflow diagram showing approval hierarchy
   - Role-based approval matrix table
   - Notification configuration per stage
   - SLA configuration (response times)
   - Save/Cancel buttons
   - Historical metrics display (approval rates, avg time)

**File:** `src/components/configuration/modules/WorkflowApprovalModule.jsx`

**Acceptance Criteria:**
- ✅ Form displays all configuration options
- ✅ Approval chain diagram shows hierarchy
- ✅ Validation prevents invalid workflows
- ✅ Save persists changes
- ✅ Metrics calculate correctly

---

## PHASE D: Advanced Features & Integration (4-5 hours)

### Task D1: Create FeatureFlagsModule Component
**Effort:** 1.5 hours

**Description:**
Feature flag toggles and system controls (FR11).

**Implementation:**
1. Create FeatureFlagsModule.jsx:
   - Toggle switches for 7 feature flags:
     - Risk Engine
     - Advanced Risk Modeling
     - Automated Allocation
     - Cascade to Case
     - Feedback Workflow
     - Bulk Director Feedback
     - Regional Data Isolation
   - Each flag has description and impact warning
   - Feature dependency validation (e.g., Advanced RM requires Risk Engine)
   - System maintenance mode toggle
   - Beta features section
   - Change log showing feature flag history with timestamps
   - Rollback capability (revert to previous state)
   - Save/Cancel buttons

**File:** `src/components/configuration/modules/FeatureFlagsModule.jsx`

**Acceptance Criteria:**
- ✅ All 7 flags toggle correctly
- ✅ Dependencies prevent invalid combinations
- ✅ System behavior changes based on flags
- ✅ Change log tracks all changes
- ✅ Rollback restores previous state
- ✅ Validation prevents conflicts

---

### Task D2: Create NationalKPIModule Component
**Effort:** 2 hours

**Description:**
National KPI configuration, capacity summary, and data management (FR12).

**Implementation:**
1. Create NationalKPIModule.jsx with 4 parts:

   **Part A: National KPI Configuration**
   - Add new KPI with form
   - Edit/Delete KPI
   - Display KPI name, target, period, actual, status
   - Trending line chart for each KPI

   **Part B: National Capacity Summary (Read-only)**
   - Auto-consolidated from regions (not manual)
   - Show: Total auditors, total hours, utilization %
   - Skills inventory by skill type
   - Regional breakdown table
   - Bottleneck flags (regions >85%)

   **Part C: Capacity Analysis**
   - Total taxpayers by category
   - Audit coverage % calculation
   - Audit types distribution
   - Skills gap analysis (required vs available)
   - Gauge charts for visualization
   - Recommendations engine suggestions

   **Part D: Data Management & Utilities**
   - [Export Data] [Import Data] [System Backup] [Restore]
   - Danger zone buttons:
     - Clear All Plans (triple confirmation)
     - Reset All Configurations
     - Database Health Check
   - Backup management UI

**File:** `src/components/configuration/modules/NationalKPIModule.jsx`

**Acceptance Criteria:**
- ✅ KPIs configurable and displayed
- ✅ National capacity auto-consolidates
- ✅ Skills gap analysis accurate
- ✅ Gauge charts render
- ✅ Import/Export maintains data
- ✅ Backup/Restore works correctly
- ✅ Dangerous operations require confirmation

---

### Task D3: Create Import/Export Functionality
**Effort:** 1.5 hours

**Description:**
Import and export configurations to/from JSON and CSV formats.

**Implementation:**
1. Create `src/utils/configurationImportExport.js`:
   - `exportConfigurationJSON()` - Export all configs as JSON
   - `exportConfigurationCSV(moduleKey)` - Export specific module as CSV
   - `importConfigurationJSON(file)` - Import JSON file
   - `importConfigurationCSV(file, moduleKey)` - Import CSV to module
   - Validation on import (check data integrity)
   - Error handling for invalid files
2. Add import/export buttons to NationalKPIModule
3. Create file dialogs for upload/download

**Acceptance Criteria:**
- ✅ Export JSON contains all configs
- ✅ Export CSV is properly formatted
- ✅ Import validates file format
- ✅ Import maintains data integrity
- ✅ Error messages helpful
- ✅ File dialogs work correctly

---

### Task D4: Integration & Final Testing
**Effort:** 1 hour

**Description:**
Integrate ConfigurationDashboard into main app flow and test all components.

**Steps:**
1. Add Configuration option to role-based dashboards (if appropriate)
2. Add Configuration menu to Sidebar
3. Test all routes work correctly
4. Test localStorage persistence across page reloads
5. Test responsive design on mobile/tablet/desktop
6. Test all CRUD operations in all 12 modules
7. Test validation prevents invalid data
8. Test audit trail tracks changes
9. Run build verification: `npm run build`
10. Confirm 0 errors, 0 warnings

**Acceptance Criteria:**
- ✅ ConfigurationDashboard accessible from sidebar
- ✅ All routes work correctly
- ✅ All 12 modules functional
- ✅ Data persists across reloads
- ✅ Responsive design works
- ✅ Build passes (0 errors, 0 warnings)
- ✅ No console errors
- ✅ All tests pass

---

## Summary of Implementation

| Phase | Tasks | Hours | Status |
|-------|-------|-------|--------|
| A | A1-A4 | 3-4 | Foundation |
| B | B1-B6 | 5-6 | Dashboard & Basic |
| C | C1-C5 | 6-8 | Complex Modules |
| D | D1-D4 | 4-5 | Advanced & Integration |
| **TOTAL** | **16 Tasks** | **18-22** | **Ready** |

---

## Testing Checklist

- [ ] All 12 modules render without errors
- [ ] All 6 audit types display
- [ ] All 7 tax types display
- [ ] All 10 industries display
- [ ] All 4 taxpayer categories display
- [ ] All 12 skills display
- [ ] All 6 regions display
- [ ] All 18 tax centers display
- [ ] All 10 risk indicators display
- [ ] Add operations work for all modules
- [ ] Edit operations work for all modules
- [ ] Delete operations work with confirmation
- [ ] Validation prevents invalid data
- [ ] localStorage persistence works
- [ ] Audit trail tracks changes
- [ ] Status indicators update
- [ ] Search filters modules
- [ ] Import/Export functionality works
- [ ] Backup/Restore works
- [ ] Responsive design works
- [ ] Build verification passes

---

## Git Commit Strategy

```
PHASE A: Configuration Dashboard - Foundation
- Feat: Add configuration component structure
- Feat: Add configuration routing
- Feat: Add configuration utilities
- Feat: Add audit trail tracking

PHASE B: Configuration Dashboard - Basic Modules
- Feat: Add Audit Types module
- Feat: Add Tax Types module
- Feat: Add Industries module
- Feat: Add Taxpayer Categories module

PHASE C: Configuration Dashboard - Complex Modules
- Feat: Add Skills module with gap analysis
- Feat: Add Regions & Tax Centers module
- Feat: Add Risk Indicators module
- Feat: Add Audit Standards module
- Feat: Add Workflow & Approval module

PHASE D: Configuration Dashboard - Advanced Features
- Feat: Add Feature Flags module
- Feat: Add National KPI & Data Management module
- Feat: Add import/export functionality
- Feat: Complete Configuration Dashboard integration
- Chore: Verify build and test all modules
```

---

**Status:** Ready for Implementation

Begin with **PHASE A** to establish the foundation, then proceed sequentially through PHASES B, C, and D.

Next step: Start Task A1 (Component Directory Structure)
