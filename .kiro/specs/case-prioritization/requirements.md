# Spec: Case Prioritization & Risk Profiling

**Status:** Requirements Phase  
**Priority:** High  
**Target Version:** v2.2  
**Feature Type:** Tax Center Manager / Cascade Team functionality  

---

## OVERVIEW

Enable Tax Center Managers and Cascade Audit Teams to:
1. View **mixed audit cases** (Risk Engine + Approved Directorate Requests)
2. **Prioritize cases** by risk score and other parameters
3. **Profile taxpayers** with risk indicators
4. **Plan audit treatment** per case type
5. **Manage capacity** based on available staff
6. **Track case status** through execution workflow

---

## FR1: Case Prioritization View

### FR1.1 Data Source - Mixed Cases
**Cases displayed come from:**
- **Risk Engine Cases** - Identified by risk analysis (status: various)
- **Approved Request Cases** - From approved directorate/external requests (status: APPROVED_SCHEDULED, linked to auditCaseId)

**Filtering Logic:**
```
allCases = [
  ...riskEngineCases (all),
  ...requestCases (ONLY approved with auditCaseId)
]

selectableCases = allCases.filter(c => c.storageStatus !== 'STORED')
```

**Case Source Indicator:**
- ⚙️ **Risk Engine** - Blue badge
- 🔔 **Request** - Orange badge

### FR1.2 Tax Center Scoped Access
**Each user sees ONLY their assigned tax center's cases:**
```javascript
const userRegion = userInfo.orgContext.assignedRegion;
const userTaxCenter = userInfo.orgContext.assignedTaxCenter;

filteredCases = cases.filter(c => 
  c.region === userRegion && 
  c.taxCenter === userTaxCenter &&
  c.storageStatus !== 'STORED'
);
```

**Multi-user Support:**
- User A (Addis Ababa TC1) sees only AC-TC1 cases
- User B (Addis Ababa TC2) sees only AC-TC2 cases
- User C (Oromia TC1) sees only ORM-TC1 cases
- All at the same time, no cross-contamination

### FR1.3 Case Prioritization Table

**Columns:**
- Rank (auto-calculated, 1-N based on risk score)
- Case ID (hyperlink to details)
- TIN (Tax ID)
- Taxpayer Name
- Branch/Region
- Audit Type (desk_audit, field_audit, comprehensive, etc)
- Risk Score (0-100)
- Risk Level (Critical, High, Medium, Low) - color coded
- Risk Strength (Very Strong, Strong, Medium, Weak)
- Priority (High, Medium, Low) - based on risk + directorate urgency
- Est. Revenue at Risk (millions)
- Est. Hours (audit duration)
- Stored Status (indicator if already stored)
- Actions (View Details, Attach Treatment Plan, Store)

**Sorting Options:**
- By Risk Score (descending default)
- By Risk Level
- By Priority
- By Est. Hours
- By Revenue at Risk
- By Case ID

**Pagination:** 15 cases per page

### FR1.4 Case Details Modal

**Shows:**
- Full case information
- Risk profiling data
- Taxpayer details
- Recommended audit type
- Risk indicators with evidence
- Last audit information
- Compliance history
- Attached treatment plan (if exists)
- Action buttons: Attach Treatment Plan, Store Case, Close Details

---

## FR2: Risk Profiling

### FR2.1 Taxpayer Risk Profile

**Risk Indicators Analyzed:**
- Late Filing (count, severity)
- Late Payment (count, severity)
- VAT Mismatch (variance amount, severity)
- Continuous Losses (years, severity)
- Import vs Sales Mismatch (percentage difference, severity)
- Large Variance (from baseline, severity)
- Non-submission of Returns (count, severity)
- Repayments/Refunds (count, amount, severity)
- Transfer Pricing Issues (presence, severity)

**Risk Score Calculation:**
```
Risk Score = Weighted sum of indicators
- Critical indicators: weight 4
- High indicators: weight 3
- Medium indicators: weight 2
- Low indicators: weight 1

Score Range: 0-100
- 85-100: Critical Risk
- 70-84: High Risk
- 50-69: Medium Risk
- 0-49: Low Risk
```

**Risk Strength Assessment:**
- Very Strong (3+ critical indicators OR 5+ high indicators)
- Strong (2-3 high indicators OR 4+ medium indicators)
- Medium (1-2 medium indicators OR multiple low indicators)
- Weak (mostly low indicators)

### FR2.2 Risk Profile Display

**Section in Details Modal:**
- Risk Score gauge (visual 0-100)
- Overall Risk Level badge
- Risk Strength label
- List of active risk indicators with:
  - Indicator name
  - Evidence/details
  - Severity (High/Medium/Low)
  - Numerical data (if applicable)

**Example:**
```
RISK INDICATORS (Selected Cases)
├─ Late Filing
│  └─ Evidence: Filed 4 times late in past year
│     Severity: Medium
├─ VAT Mismatch
│  └─ Evidence: VAT variance of 450K ETB detected
│     Severity: High
├─ Import vs Sales
│  └─ Evidence: Import purchases 68% higher than sales
│     Severity: High
└─ Continuous Losses
   └─ Evidence: Reported losses 3 consecutive years
      Severity: High
```

### FR2.3 Taxpayer Background

**Display:**
- Business Name
- Business Type/Industry
- TIN
- Compliance History (summary)
- Last Audit Date (if exists)
- Years Active
- Recommended Audit Type based on risk profile

---

## FR3: Treatment Plan Attachment

### FR3.1 Treatment Plan Modal

**Triggered by:** "Attach Treatment Plan" button in case details

**Form Fields:**
- Treatment Plan Type (required) - dropdown:
  - Standard Audit Treatment Plan
  - Comprehensive Audit Plan
  - Desk Audit Plan
  - Field Audit Plan
  - Transfer Pricing Audit Plan
  - Single Issue Audit Plan
  - Forensic Audit Plan

- Plan Description (required) - textarea (200-2000 chars)
  - Objectives
  - Scope
  - Methodology

- Estimated Duration (required) - number (hours)
- Estimated Cost (optional) - number (ETB)
- Assigned Auditor (optional) - dropdown (from team)
- Key Focus Areas (required) - checkboxes:
  - Revenue Recognition
  - Transfer Pricing
  - VAT Compliance
  - Withholding Tax
  - Payroll Tax
  - Asset Valuation
  - Related Party Transactions
  - Documentation Compliance

- File Attachment (optional) - max 10MB, supports PDF, DOC, DOCX, XLS, XLSX

- Notes (optional) - textarea

**Actions:**
- Save Treatment Plan button
- Cancel button
- Delete Plan button (if exists)

### FR3.2 Treatment Plan Storage

**Data Structure:**
```javascript
treatmentPlan: {
  id: "TP-{caseId}-{timestamp}",
  caseId: string,
  planType: string,
  description: string,
  estimatedHours: number,
  estimatedCost: number,
  assignedAuditor: string,
  keyFocusAreas: [string],
  attachments: [
    {
      filename: string,
      size: number,
      type: string,
      url: string,
      uploadedDate: ISO8601
    }
  ],
  notes: string,
  createdDate: ISO8601,
  createdBy: string,
  lastModified: ISO8601,
  modifiedBy: string
}
```

### FR3.3 Treatment Plan Display

**In Case Details:**
- Show attached treatment plan summary
- Plan Type badge
- Description preview (first 150 chars)
- Estimated Hours
- Assigned Auditor (if exists)
- Key Focus Areas (tags)
- Edit/Delete buttons (for authorized users)
- View Full Plan link (expand or modal)

---

## FR4: Capacity Planning

### FR4.1 Team Capacity Dashboard

**Right Panel in Prioritization View:**

**Header:** "AUDIT TEAM CAPACITY" (for this tax center)

**Current Period:**
- Fiscal Year: 2027 (from auth context)
- Remaining Capacity: [X] hrs

**Team Configuration:**
- Available Staff Capacity
- Planned Hours (from treatment plans)
- Remaining Hours
- Utilization % (color coded: red >90%, yellow 70-90%, green <70%)

**Breakdown by Audit Type:**
- [Desk Audit] - X hrs allocated, Y hrs remaining
- [Field Audit] - X hrs allocated, Y hrs remaining
- [Comprehensive] - X hrs allocated, Y hrs remaining
- [Transfer Pricing] - X hrs allocated, Y hrs remaining
- [Single Issue] - X hrs allocated, Y hrs remaining
- [Forensic] - X hrs allocated, Y hrs remaining

### FR4.2 Capacity Configuration

**Modal:** "Configure Audit Capacity"

**Form:**
- Available Staff (number of auditors) - required
- Hours per Staff per Fiscal Year (hours) - default 2000
- Calculate Total Capacity (auto: staff × hours)
- Allocate hours by audit type:
  - [Type] - X hours (must total ≤ total capacity)
- Save Configuration button

**Stored per tax center:**
```javascript
capacityConfig: {
  region: string,
  taxCenter: string,
  fiscalYear: number,
  totalStaff: number,
  hoursPerStaff: number,
  totalCapacityHours: number,
  allocationByType: {
    desk_audit: number,
    field_audit: number,
    comprehensive: number,
    transfer_pricing: number,
    single_issue: number,
    forensic: number
  },
  configuredDate: ISO8601,
  configuredBy: string
}
```

---

## FR5: Case Selection & Storage

### FR5.1 Selection Rules

**Can Select IF:**
- ✅ Case not already stored (storageStatus !== 'STORED')
- ✅ Risk Engine case (always available)
- ✅ Request case AND status = 'APPROVED_SCHEDULED' (approved by Process Owner)

**Cannot Select IF:**
- ❌ Case already stored (storageStatus = 'STORED')
- ❌ Request case NOT approved (status = 'PENDING_REVIEW', 'REJECTED', etc)
- ❌ Different tax center (region or taxCenter mismatch)

### FR5.2 Store Cases

**Action:** "Store {N} Cases" button

**On Store:**
1. Validate capacity (sum of treatment plan hours ≤ remaining capacity)
2. Update each case: storageStatus = 'STORED'
3. Remove from prioritization view
4. Create audit case assignment
5. Save to localStorage
6. Show success: "X cases stored, Y hours allocated"

**On Error:**
- Insufficient capacity: "Insufficient capacity. Plan shows X hrs but only Y hrs available"
- Already stored: "Case already stored"
- Not approved: "Request case not approved by Process Owner"

---

## DATA STRUCTURES

### Enhanced Audit Case Object
```javascript
{
  // Core case data
  id: string,
  planId: string,
  region: string,
  taxCenter: string,
  
  // Taxpayer info
  taxpayerName: string,
  tin: string,
  businessType: string,
  
  // Audit info
  auditType: string,
  riskLevel: string,
  riskScore: number,
  riskStrength: string,
  revenueAtRisk: number,
  estimatedHours: number,
  
  // Risk indicators
  riskIndicators: [
    {
      indicator: string,
      evidence: string,
      severity: string
    }
  ],
  
  // Case source
  createdFrom: 'RISK_ENGINE' | 'AUDIT_REQUEST',
  requestId: string (if from request),
  
  // Storage status
  storageStatus: 'NEW' | 'STORED',
  storedDate: ISO8601,
  storedBy: string,
  
  // Treatment plan
  treatmentPlan: {
    id: string,
    planType: string,
    description: string,
    estimatedHours: number,
    estimatedCost: number,
    assignedAuditor: string,
    keyFocusAreas: [string],
    attachments: [],
    createdDate: ISO8601,
    createdBy: string
  },
  
  // Status tracking
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'
}
```

---

## PERMISSIONS

**Tax Center Manager:**
```javascript
[
  'cascade_plan_to_cases',
  'view_audit_cases',
  'manage_case_prioritization',
  'attach_treatment_plans',
  'view_case_details'
]
```

**Cascade Audit Team:**
```javascript
[
  'cascade_plan_to_cases',
  'view_audit_cases',
  'manage_case_prioritization',
  'attach_treatment_plans',
  'view_case_details'
]
```

---

## UI COMPONENTS NEEDED

1. **CasePrioritizationView** - Main container (table + capacity panel)
2. **CaseDetailsModal** - Full case information + risk profiling
3. **TreatmentPlanModal** - Attach/edit treatment plan
4. **CapacityConfigModal** - Configure team capacity
5. **RiskProfilePanel** - Display risk indicators (in details modal)
6. **CapacityPanel** - Right panel showing team capacity

---

## FILTERING & ACCESS CONTROL

**Applied on Load:**
```javascript
const loadCasesForTaxCenter = () => {
  const data = loadData();
  const userRegion = userInfo.orgContext.assignedRegion;
  const userTaxCenter = userInfo.orgContext.assignedTaxCenter;
  
  // Get both sources
  const riskEngineCases = (data.auditCases || [])
    .filter(c => !c.createdFrom || c.createdFrom !== 'AUDIT_REQUEST');
  
  const requestCases = (data.auditCases || [])
    .filter(c => c.createdFrom === 'AUDIT_REQUEST' && 
                 c.status === 'APPROVED_SCHEDULED');
  
  const allCases = [...riskEngineCases, ...requestCases];
  
  // FILTER by tax center + remove stored
  const userCases = allCases.filter(c =>
    c.region === userRegion &&
    c.taxCenter === userTaxCenter &&
    c.storageStatus !== 'STORED'
  );
  
  return userCases;
};
```

---

## SUCCESS CRITERIA

✅ Mixed cases display (Risk Engine + Approved Requests)  
✅ Cases sorted by risk score (descending)  
✅ Risk profiling shown in details modal  
✅ Treatment plans attachable per case  
✅ Capacity configuration per tax center  
✅ Cases stored and removed from view  
✅ Tax center scoped filtering works  
✅ Multi-user simultaneous access (no cross-contamination)  
✅ Approved request cases only visible after approval  
✅ Already stored cases not selectable  
✅ No build errors  

---

## INTEGRATION POINTS

1. **AuditCaseSelectionView** - Fix mixed case loading
2. **StoredCasesView** - Link to prioritization
3. **ProcessOwnerView** - Request approval triggers case creation
4. **Sidebar** - Add "Case Prioritization" menu item
5. **App.jsx** - Add route handler
6. **AuthContext** - New permissions

---

## NOTES

- All data persisted to localStorage
- Risk scores pre-calculated in Risk Engine
- Treatment plans optional but recommended
- Capacity planning can be updated anytime
- Cases remain in history after storage (for audit trail)
- Multi-user access verified via auth context (region + taxCenter)
