# Spec: Directorate Requester & External Stakeholder Roles

**Status:** Requirements Phase  
**Priority:** High  
**Target Version:** v2.1  

---

## REQUIREMENTS

### Overview
Enable two new user roles to submit audit requests into the system:
1. **Directorate Requester** - Internal government directorates submitting audit requests
2. **External Stakeholder Requester** - External organizations/individuals submitting audit requests

Both roles have same functionality, distinguished by requester type in data.

---

## FR1: Directorate Requester Role

### FR1.1 Dashboard & Navigation
- **Menu Items:**
  - Dashboard (view_audit_metrics)
  - Submit Audit Request (submit_audit_requests)
  - My Requests (submit_audit_requests)
  - Risk Engine Analysis (view_audit_metrics)
  - Configuration

### FR1.2 Submit Audit Request
- **Form Fields:**
  - Requester Type: Auto-filled "Directorate"
  - Directorate Name (required) - dropdown list of directorates
  - Contact Person (required)
  - Email Address (required)
  - Request Type (required) - Tax Clearance, Business Closure, Compliance Check, Transfer Verification, Other
  - Taxpayer Name (required)
  - TIN (required)
  - Priority Level - Low, Medium, High
  - Region (required) - dropdown
  - Reason for Request (required) - textarea
  - Justification (required) - textarea
  - Attachments (optional) - file upload
  - Supporting Notes (optional) - textarea

- **Actions:**
  - Submit Request button
  - Clear Form button
  - Cancel button

- **Validation:**
  - All required fields must be filled
  - TIN format validation
  - Email format validation
  - Max file size 10MB for attachments

- **Success:**
  - Show request ID confirmation
  - Send confirmation email
  - Navigate to My Requests view
  - Console log with request details

### FR1.3 My Requests View
- **Display:**
  - List of all requests submitted by this requester
  - Columns: Request ID, Taxpayer, TIN, Type, Priority, Status, Submitted Date, Last Updated

- **Filters:**
  - By Request Type
  - By Status (Pending Review, Under Assessment, Approved & Scheduled, Rejected, Closed)
  - By Priority
  - Search by TIN, taxpayer name, request ID

- **Status Indicators:**
  - Pending Review (yellow)
  - Under Assessment (blue)
  - Approved & Scheduled (green)
  - Rejected (red)
  - Closed (gray)

- **Actions:**
  - View Request Details button
  - Edit Request button (if status = Pending Review only)
  - Cancel Request button (if status = Pending Review only)
  - Resubmit Request button (if status = Rejected only)

- **Statistics:**
  - Total Submitted
  - Pending Review
  - Approved
  - Rejected

---

## FR2: External Stakeholder Requester Role

### FR2.1 Dashboard & Navigation
- **Menu Items:**
  - Dashboard (view_audit_metrics)
  - Submit Audit Request (submit_audit_requests)
  - My Requests (submit_audit_requests)
  - Risk Engine Analysis (view_audit_metrics)
  - Configuration

### FR2.2 Submit Audit Request
- **Form Fields:**
  - Requester Type: Auto-filled "External Stakeholder"
  - Organization Name (required)
  - Contact Person (required)
  - Email Address (required)
  - Phone Number (required)
  - Request Type (required) - Tax Clearance, Business Closure, Compliance Check, Transfer Verification, Other
  - Taxpayer Name (required)
  - TIN (required)
  - Priority Level - Low, Medium, High
  - Region (required) - dropdown
  - Reason for Request (required) - textarea
  - Justification (required) - textarea
  - Attachments (optional) - file upload (max 3 files, 10MB each)
  - Supporting Notes (optional) - textarea

- **Actions:**
  - Submit Request button
  - Clear Form button
  - Cancel button

- **Validation:**
  - All required fields must be filled
  - TIN format validation
  - Email format validation
  - Phone format validation
  - Max 3 files, 10MB each

- **Success:**
  - Show request ID confirmation
  - Send confirmation email
  - Navigate to My Requests view
  - Console log with request details

### FR2.3 My Requests View
- **Display:**
  - List of all requests submitted by this stakeholder
  - Columns: Request ID, Taxpayer, TIN, Type, Priority, Status, Submitted Date, Last Updated

- **Filters:**
  - By Request Type
  - By Status
  - By Priority
  - Search

- **Status Indicators:**
  - Pending Review (yellow)
  - Under Assessment (blue)
  - Approved & Scheduled (green)
  - Rejected (red)
  - Closed (gray)

- **Actions:**
  - View Request Details button
  - Withdraw Request button (if status = Pending Review only)
  - Appeal Rejection button (if status = Rejected only)

- **Statistics:**
  - Total Submitted
  - Pending Review
  - Approved
  - Rejected

---

## DATA STRUCTURES

### Audit Request Object
```
{
  id: "REQ-{timestamp}-{random}",
  requesterType: "Directorate" | "External",
  
  // Requester Info
  requesterInfo: {
    name: string,                    // Directorate Name or Organization Name
    contactPerson: string,
    email: string,
    phone: string (external only),
    directorateName: string (directorate only)
  },
  
  // Request Details
  requestType: string,               // Tax Clearance, Business Closure, etc
  taxpayerName: string,
  tin: string,
  region: string,
  priority: "Low" | "Medium" | "High",
  reason: string,
  justification: string,
  
  // Metadata
  status: "Pending Review" | "Under Assessment" | "Approved & Scheduled" | "Rejected" | "Closed",
  submittedDate: ISO8601,
  submittedBy: string,
  lastModified: ISO8601,
  
  // Attachments
  attachments: [
    {
      id: string,
      filename: string,
      size: number,
      type: string,
      uploadedDate: ISO8601,
      url: string
    }
  ],
  
  // Process Tracking
  reviewedBy: string (optional),
  reviewedDate: ISO8601 (optional),
  approvedBy: string (optional),
  approvedDate: ISO8601 (optional),
  rejectionReason: string (optional),
  rejectedBy: string (optional),
  rejectedDate: ISO8601 (optional),
  
  // Audit Case Link
  auditCaseId: string (optional, created on approval),
  
  // Notes
  internalNotes: string (optional),
  supportingNotes: string
}
```

---

## PERMISSIONS

### Directorate Requester
```
[
  'submit_audit_requests',
  'view_audit_metrics',
  'view_own_requests'
]
```

### External Stakeholder Requester
```
[
  'submit_audit_requests',
  'view_audit_metrics',
  'view_own_requests'
]
```

---

## UI COMPONENTS NEEDED

1. **RequesterDashboard** - Container component for both roles
2. **SubmitAuditRequestForm** - Form for submitting requests
3. **MyRequestsView** - List and manage submitted requests
4. **RequestDetailsModal** - View request details
5. **EditRequestForm** - Edit request (directorate only, pending only)

---

## INTEGRATION POINTS

1. **AuthContext** - Add permissions for both roles
2. **Sidebar.jsx** - Add menu items for both roles
3. **App.jsx** - Add route handlers for both roles
4. **LoginForm** - Ensure both roles can login
5. **Data** - Add data structures and save/load logic

---

## SUCCESS CRITERIA

✅ Both roles can submit audit requests  
✅ Requests are saved to localStorage with all details  
✅ Requesters can view their own requests only  
✅ Request status tracking works (pending → approved → case created)  
✅ Process Owner can see and approve/reject requests  
✅ Approved requests create audit cases  
✅ No build errors, all components render correctly  

---

## NOTES

- Both roles have nearly identical UI, differ only in form fields and requester type
- Requests are NOT automatically converted to cases; Process Owner must approve
- Requesters can only see their own requests (data filtering by submittedBy)
- All requests stored in `data.auditRequests` array
- Attachments handled as metadata only (not actual file storage for now)
