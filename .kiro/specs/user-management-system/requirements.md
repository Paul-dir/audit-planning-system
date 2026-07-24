# User Management System - Requirements Document

**Project**: Annual Audit Planning System - MOR (Ministry of Revenue, Ethiopia)  
**Component**: Centralized User Management System (External/Independent)  
**Date**: July 23, 2026  
**Status**: Requirements Phase

---

## 1. Executive Summary

This document defines the requirements for an **independent User Management System** that will serve the Annual Audit Planning (AP) System. The system will be built separately and integrated via API, handling all user authentication, authorization, role assignment, and organizational hierarchy management for the MOR.

The AP System will only consume user data through well-defined API endpoints and will not handle user management directly.

---

## 2. Organizational Context

### MOR Structure (Ministry of Revenue, Ethiopia)

```
┌─ Senior Management (Director General)
│  └─ Audit Directors (National Level)
│     └─ Regional Directors (5-6 regions)
│        └─ Tax Center Managers (3 per region)
│           └─ Cascade Audit Teams
│              └─ Audit Team (with Team Leaders & Auditors)
```

### Key Business Process

1. **Annual Planning (Top-Down)**
   - Senior Management → Approves annual audit plan
   - Audit Director → Reviews and sends to regions
   - Regional Director → Allocates cases to tax centers
   - Tax Center Manager → Cascades plan into audit cases
   - Audit Teams → Execute cases (assigned by auditors/team leads)

2. **Execution (Bottom-Up)**
   - Tax Center → Selects audit cases
   - Team Leader → Assigns cases to auditors
   - Auditors → Execute cases
   - Team Leaders → Track team progress

---

## 3. User Roles & Responsibilities

### 3.1 Senior Management

**Who**: Director General, Senior Officers (1-5 users)

**Responsibilities**:
- Review annual audit plans from Audit Director
- Approve or reject plans
- Set strategic direction and targets
- View consolidated national audit metrics

**Attributes**:
- Can view all regions/tax centers (read-only for execution)
- Can only approve/reject plans (limited write access)
- Org Level: National

---

### 3.2 Audit Director

**Who**: National audit coordination officer (1-3 users)

**Responsibilities**:
- Create annual audit plans
- Send feedback to audit team (revisions needed)
- Approve regional feedback
- Send plans to Senior Management for approval
- Deploy approved plans to regions
- Coordinate across all regions

**Attributes**:
- Can create/edit plans (before submission)
- Can view all regions/plans
- Can send plans to Senior Management
- Can deploy approved plans to all regions
- Org Level: National

---

### 3.3 Regional Director

**Who**: Each region's director (5-6 users, 1 per region)

**Responsibilities**:
- Receive approved plans from national level
- Allocate cases from plan to tax centers within their region
- Provide feedback/constraints to national level (e.g., "can only handle 50% of allocation")
- Submit plans to tax centers
- Acknowledge receipt of finalized plans
- Monitor tax center progress
- Support tax centers with resource/capacity issues

**Attributes**:
- Assigned to ONE region (Oromia, SNNPR, Addis Ababa, Amhara, Tigray, etc.)
- Can only view/manage their own region
- Can allocate to 3-5 tax centers in their region
- Can receive feedback from tax centers
- Org Level: Regional

---

### 3.4 Tax Center Manager

**Who**: Each tax center's manager (3-5 per region, ~15-25 users total)

**Responsibilities**:
- Accept/acknowledge allocated plans from regional director
- Cascade plan into audit cases (select specific taxpayers)
- Provide capacity feedback to regional director
- View their tax center's audit cases
- Coordinate with team leaders on case assignments
- Monitor case execution progress
- Report execution status

**Attributes**:
- Assigned to ONE tax center (e.g., "Oromia-tc1", "Addis Ababa-tc2")
- Can only view/manage their tax center
- Can select cases for cascade
- Can assign cases to team leaders
- Org Level: Tax Center

---

### 3.5 Team Leader (Audit Type Specific)

**Who**: Leads a team for a specific audit type (30-50 users, ~5-10 per tax center)

**Responsibilities**:
- Receive assigned audit cases from tax center manager
- Assign individual cases to auditors on their team
- Track team member workload and progress
- Provide daily/weekly status updates
- Escalate issues or resource constraints
- Ensure audit quality and compliance

**Attributes**:
- Assigned to ONE tax center
- Assigned to ONE audit type (e.g., "Desk Audit", "Field Audit", "Transfer Pricing")
- Can assign cases to auditors in their team only
- Can view team member progress
- Org Level: Tax Center / Audit Type

---

### 3.6 Auditor

**Who**: Individual auditors performing audits (100-200+ users, ~20-40 per tax center)

**Responsibilities**:
- Receive assigned audit cases from team leader
- Execute assigned audit cases
- Report case findings and status
- Update case progress
- Request case reassignment if needed
- Collaborate with other auditors on joint audits

**Attributes**:
- Assigned to ONE tax center
- Assigned to ONE or more audit types (can be multi-skilled)
- Can only view their assigned cases
- Can update case execution status
- Org Level: Tax Center / Audit Type

---

### 3.7 Cascade Audit Team (Special Role)

**Who**: Specialized team for cascading plans to cases (5-10 users, optional)

**Responsibilities**:
- Perform the cascade operation (convert plans to audit cases)
- Select taxpayers for specific tax centers
- Validate case selections against allocations

**Attributes**:
- Can be ANY org level (national or regional)
- Role is temporary/project-based (during cascade phase)
- Same permissions as Tax Center Manager for cascade operations

---

## 4. Key Attributes Required for Each User

### Basic Identity
- `userId`: Unique identifier (e.g., UUID)
- `email`: Email address
- `fullName`: Full name
- `phone`: Phone number (optional)
- `employeeId`: MOR employee ID
- `department`: Which department/office they work in

### Role Assignment
- `role`: Primary role (string, one of: "senior_management", "audit_director", "regional_director", "tax_center_manager", "team_leader", "auditor", "cascade_audit_team")
- `roles[]`: Array of roles (if multi-role user)

### Organizational Assignment
- `assignedRegion`: If regional/tax center user (e.g., "Oromia", "Addis Ababa")
- `assignedTaxCenter`: If tax center/team leader/auditor (e.g., "Addis Ababa-tc1")
- `auditType`: If team leader/auditor (e.g., "desk_audit", "field_audit", "transfer_pricing")
- `teamId`: If auditor (references team leader's ID)

### Status & Permissions
- `status`: Account status ("active", "inactive", "suspended")
- `permissions[]`: Array of specific permissions
- `createdDate`: Account creation date
- `lastLoginDate`: For audit trail
- `passwordLastChanged`: For security
- `isTemporary`: If temporary account (e.g., contractor)

---

## 5. API Endpoints Required

### 5.1 Authentication

```
POST /auth/login
  Input: { email, password }
  Output: { token, userId, role, permissions, org_context }

POST /auth/logout
  Input: { token }
  Output: { success }

POST /auth/refresh-token
  Input: { refreshToken }
  Output: { token, expiresIn }
```

### 5.2 User Profile

```
GET /users/:userId
  Output: { userId, email, fullName, role, org_context }

GET /users/me
  Output: Current logged-in user data

PUT /users/:userId/profile
  Input: { fullName, phone, ... }
  Output: Updated user object
```

### 5.3 User Management (Admin Only)

```
GET /users
  Query: { role, region, taxCenter, status }
  Output: Array of users

POST /users
  Input: { email, fullName, role, region, taxCenter, auditType }
  Output: Created user object

PUT /users/:userId
  Input: { role, status, region, taxCenter, auditType }
  Output: Updated user object

DELETE /users/:userId
  Output: { success }
```

### 5.4 Role & Permission Validation

```
GET /users/:userId/permissions
  Output: { permissions[], roles[] }

POST /validate-permission
  Input: { userId, permission }
  Output: { allowed: boolean }

GET /roles/:roleId
  Output: { roleId, name, description, permissions[] }
```

### 5.5 Organizational Context

```
GET /org/regions
  Output: Array of regions

GET /org/regions/:region/tax-centers
  Output: Array of tax centers in region

GET /org/tax-centers/:tcId/users
  Query: { role }
  Output: Array of users at that tax center

GET /org/tax-centers/:tcId/teams
  Output: Array of audit teams at that tax center

GET /org/teams/:teamId/members
  Output: Array of team members (auditors)
```

### 5.6 User Assignment (for AP System to track)

```
GET /users/by-role/:role
  Query: { region, taxCenter, auditType }
  Output: Array of users matching criteria

GET /users/:userId/audit-assignment
  Output: { currentCases, capacity, workload }

POST /users/:userId/audit-assignment
  Input: { caseId, allocate }
  Output: Updated assignment
```

---

## 6. Permission Matrix

| Permission | Senior Mgmt | Audit Dir | Regional Dir | Tax Ctr Mgr | Team Lead | Auditor |
|-----------|-----------|----------|-------------|----------|----------|---------|
| Approve plans | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create plans | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all regions | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Allocate to tax centers | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Cascade plan to cases | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View audit cases | ✅ | ✅ | ✅ | ✅ | ✅ | (own only) |
| Assign cases to auditors | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| View team members | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Update case execution | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View audit metrics | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 7. Data Storage Requirements

### User Records to Store

```
users {
  userId: UUID
  email: String (unique)
  fullName: String
  phone: String
  employeeId: String
  department: String
  
  role: String
  roles: String[]
  status: String
  
  assignedRegion: String
  assignedTaxCenter: String
  auditType: String
  teamId: String
  
  permissions: String[]
  passwordHash: String
  createdDate: DateTime
  lastLoginDate: DateTime
  passwordLastChanged: DateTime
  isTemporary: Boolean
  
  metadata: Object (custom fields)
}
```

### Audit Trail

```
audit_logs {
  logId: UUID
  userId: String
  action: String
  resource: String
  timestamp: DateTime
  changes: Object
  ipAddress: String
}
```

---

## 8. Integration Points with AP System

### 8.1 How AP System Uses User Management

1. **At Login**: 
   - AP Frontend calls `/auth/login`
   - Receives token + user context
   - Stores in localStorage/session

2. **On Each Request**:
   - AP Frontend includes token in Authorization header
   - AP Backend validates token with User Management System

3. **Role-Based UI Rendering**:
   - AP Frontend reads `role` and `permissions` from user context
   - Shows/hides views based on role

4. **Data Filtering**:
   - AP Backend filters data by user's `assignedRegion`, `assignedTaxCenter`
   - Example: Regional Director only sees their region's plans

5. **Case Assignment**:
   - When tax center manager selects auditor for case
   - AP Backend calls `/users/:auditId/audit-assignment` to track

### 8.2 Expected Response Format

When AP System gets user context after login:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user-123",
  "email": "regional@mor.gov.et",
  "fullName": "Abebe Tekle",
  "role": "regional_director",
  "permissions": [
    "view_plans",
    "allocate_cases",
    "submit_plan_to_tax_centers",
    "acknowledge_finalized_plans"
  ],
  "org_context": {
    "assignedRegion": "Oromia",
    "taxCenters": ["Oromia-tc1", "Oromia-tc2", "Oromia-tc3"]
  },
  "expiresIn": 3600
}
```

---

## 9. Security Requirements

### Authentication
- Multi-factor authentication (MFA) support (optional)
- Password policy: Min 12 chars, special chars required
- Session timeout after 30 minutes inactivity
- Token expiration: 1 hour

### Authorization
- All API endpoints require valid token
- Role-based access control (RBAC)
- No direct access to other users' data
- Audit trail for all user management actions

### Data Protection
- Encrypt passwords with bcrypt (min salt rounds: 12)
- HTTPS only for all API calls
- User session logging

---

## 10. Acceptance Criteria

### Must Have
- ✅ All 7 user roles defined and functional
- ✅ Each role can only access their authorized data
- ✅ API authentication working with token-based approach
- ✅ User can login and receive correct permissions
- ✅ Regional directors see only their region
- ✅ Tax center managers see only their tax center
- ✅ Team leaders see only their team's cases
- ✅ Auditors see only assigned cases

### Should Have
- ✅ User search/filter by role, region, tax center
- ✅ User creation/deactivation by admins
- ✅ Audit trail of login/permission changes
- ✅ Password reset functionality

### Nice to Have
- ⭐ Multi-factor authentication
- ⭐ LDAP/AD integration with MOR directory
- ⭐ Bulk user import (CSV)
- ⭐ User activity dashboard

---

## 11. Document Version & Status

**Version**: 1.0  
**Created**: July 23, 2026  
**Status**: Ready for External Team Implementation  
**Next Steps**: 
1. Review and validate with stakeholders
2. Hand off to external User Management System team
3. Define API contract/OpenAPI spec
4. Implement User Management System
5. Integrate with AP System via API

