# Backend API Specification - Cluster AP System
**Version:** 1.0  
**Last Updated:** July 2026  
**Purpose:** Complete backend specification aligned with frontend architecture

---

## 1. ARCHITECTURE OVERVIEW

### Technology Stack (Recommended)
- **Framework**: Spring Boot 3.x (Java) or Node.js/Express
- **Database**: PostgreSQL with audit logging
- **Authentication**: OAuth 2.0 / JWT
- **API Protocol**: REST with JSON
- **Message Queue**: RabbitMQ (for async tasks)
- **Caching**: Redis

### System Components
```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React)                   │
│  - 9 Role-based views (Team Leader, Auditor, etc.)  │
│  - Real-time data sync (localStorage + API)         │
│  - Workflow state machine (6 stages)                │
└──────────────────┬──────────────────────────────────┘
                   │ REST API / WebSocket
┌──────────────────▼──────────────────────────────────┐
│          BACKEND API LAYER                           │
│  ├─ Auth Service (OAuth 2.0, JWT)                   │
│  ├─ Plan Management Service                         │
│  ├─ Case Management Service                         │
│  ├─ Assignment Service                              │
│  ├─ Audit Type Service                              │
│  └─ User/Org Service                                │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│          DATA LAYER & PERSISTENCE                    │
│  ├─ PostgreSQL (Primary datastore)                  │
│  ├─ Redis (Caching & sessions)                      │
│  └─ Audit Log Store                                 │
└─────────────────────────────────────────────────────┘
```

---

## 2. AUTHENTICATION & AUTHORIZATION

### 2.1 Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "email": "user@mor.gov.et",
  "password": "encrypted_password"
}

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "USR-0001",
    "email": "user@mor.gov.et",
    "fullName": "Ahmed Hassan",
    "role": "team_leader",
    "permissions": ["assign_cases_to_auditors", "view_team_members", ...],
    "orgContext": {
      "assignedRegion": "Addis Ababa",
      "assignedTaxCenter": "Addis Ababa TC1",
      "teamId": "TEAM-AA-001",
      "teamName": "Desk Audit Team 1",
      "auditType": "desk_audit",
      "level": "tax_center"
    }
  },
  "expiresIn": 86400
}
```

### 2.2 Token Refresh
```
POST /api/auth/refresh
Authorization: Bearer <refreshToken>

Response (200 OK):
{
  "accessToken": "eyJhbGc...",
  "expiresIn": 86400
}
```

### 2.3 Roles & Permissions Matrix
| Role | Permissions | Level | Access |
|------|-------------|-------|--------|
| audit_team | create_plans, view_metrics | National | All regions |
| audit_director | approve_plans, view_all_regions | National | All regions |
| regional_director | allocate_to_tax_centers, view_metrics | Regional | Own region |
| tax_center_manager | cascade_plan, assign_cases, manage_prioritization | Tax Center | Own tax center |
| team_leader | assign_cases_to_auditors, view_team_members, update_execution | Tax Center | Own team |
| auditor | update_case_execution, view_metrics | Tax Center | Own cases |
| senior_management | approve_plans, view_all_regions | National | All regions |

---

## 3. DATA MODELS

### 3.1 User/Team Structure
```json
{
  "id": "USR-0001",
  "email": "user@mor.gov.et",
  "fullName": "Ahmed Hassan",
  "password": "hashed_password",
  "role": "team_leader",
  "status": "ACTIVE",
  "seniority": "Senior",
  "yearsExperience": 8,
  "certifications": ["CPA", "CIA"],
  "orgContext": {
    "assignedRegion": "Addis Ababa",
    "assignedRegionCode": "AA",
    "assignedTaxCenter": "Addis Ababa TC1",
    "assignedTaxCenterCode": "AA-TC1",
    "teamId": "TEAM-AA-001",
    "teamName": "Desk Audit Team 1",
    "auditType": "desk_audit",
    "level": "tax_center",
    "managerOf": "TEAM-AA-001"
  },
  "workload": {
    "currentCases": 5,
    "maxCapacity": 12,
    "activeAudits": 3,
    "completedAudits": 28
  },
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2026-07-30T14:22:00Z"
}
```

### 3.2 Annual Audit Plan
```json
{
  "id": "AP-0001",
  "name": "Annual Audit Plan 2027",
  "fiscalYear": 2027,
  "status": "FINALIZED",
  "version": 1,
  "createdBy": "USR-0001",
  "createdDate": "2026-01-15T10:30:00Z",
  "submittedDate": "2026-03-20T15:45:00Z",
  "approvedDate": "2026-04-10T11:00:00Z",
  "approvedBy": "USR-0002",
  "regionAllocation": {
    "Addis Ababa": {
      "desk_audit": 50,
      "field_audit": 30,
      "joint_audit": 20,
      "transfer_pricing": 10,
      "comprehensive": 15,
      "issue_audit": 5
    }
  },
  "allocationStatus": {
    "Addis Ababa": {
      "status": "SENT",
      "sentDate": "2026-04-15T09:00:00Z",
      "sentBy": "USR-0003",
      "taxCenterReceipts": {
        "Addis Ababa TC1": {
          "status": "RECEIVED",
          "receivedDate": "2026-04-17T10:30:00Z",
          "receivedBy": "USR-0004"
        }
      }
    }
  },
  "submittedToTaxCenters": {
    "Addis Ababa-tc1": {
      "status": "ACCEPTED",
      "acceptedDate": "2026-04-20T14:00:00Z",
      "acceptedBy": "USR-0004"
    }
  }
}
```

### 3.3 Audit Case
```json
{
  "id": "CASE-2027-0001",
  "tin": "000123456789",
  "taxpayerName": "ABC Trading PLC",
  "sector": "Manufacturing",
  "auditType": "desk_audit",
  "status": "ASSIGNED_TO_AUDITOR",
  "region": "Addis Ababa",
  "taxCenter": "Addis Ababa TC1",
  "riskLevel": "High",
  "riskScore": 75,
  "estimatedHours": 40,
  "priority": "High",
  "assignedTeamLeaderId": "USR-0001",
  "assignedAuditorId": "USR-0005",
  "caseDetails": {
    "previousAuditDate": "2024-06-15",
    "previousFindings": "VAT compliance issues",
    "businessType": "Retail & Wholesale",
    "revenue": 5000000,
    "employees": 45
  },
  "timeline": {
    "assignedToTLDate": "2026-05-01T10:00:00Z",
    "assignedToAuditorDate": "2026-05-05T14:30:00Z",
    "startDate": null,
    "targetCompletionDate": "2026-06-30",
    "actualCompletionDate": null
  },
  "createdAt": "2026-04-25T08:00:00Z",
  "updatedAt": "2026-07-15T16:45:00Z"
}
```

### 3.4 Case Assignment (State Machine)
```json
{
  "id": "ASSIGN-00001",
  "caseId": "CASE-2027-0001",
  "currentState": "ASSIGNED_TO_AUDITOR",
  "currentOwner": "USR-0005",
  "currentOwnerRole": "AUDITOR",
  "stateHistory": [
    {
      "state": "STORED",
      "timestamp": "2026-04-25T08:00:00Z",
      "owner": "SYSTEM",
      "reason": "Case created from plan"
    },
    {
      "state": "ASSIGNED_TO_TEAM_LEADER",
      "timestamp": "2026-05-01T10:00:00Z",
      "owner": "USR-0004",
      "reason": "Assigned by Tax Center Manager"
    },
    {
      "state": "ASSIGNED_TO_AUDITOR",
      "timestamp": "2026-05-05T14:30:00Z",
      "owner": "USR-0001",
      "reason": "Auto-assigned to auditor by Team Leader"
    }
  ],
  "transitions": {
    "lastTransitionDate": "2026-05-05T14:30:00Z",
    "totalTransitions": 2
  }
}
```

---

## 4. API ENDPOINTS

### 4.1 Plan Management

#### GET /api/plans
Returns all plans
```
Query Parameters:
  - status: DRAFT|PENDING_APPROVAL|APPROVED|FINALIZED
  - region: (optional) Region name
  - fiscalYear: (optional) Year
  
Response (200 OK):
[
  { plan object },
  ...
]
```

#### POST /api/plans
Create new plan
```
Request:
{
  "name": "Annual Audit Plan 2027",
  "fiscalYear": 2027,
  "regionAllocation": { ... }
}

Response (201 Created):
{ plan object with id }
```

#### PUT /api/plans/:planId
Update plan
```
Request:
{
  "name": "...",
  "regionAllocation": { ... },
  "status": "FINALIZED"
}

Response (200 OK):
{ updated plan object }
```

#### POST /api/plans/:planId/submit
Submit plan for approval
```
Response (200 OK):
{
  "success": true,
  "plan": { ... with status: PENDING_APPROVAL },
  "message": "Plan submitted successfully"
}
```

#### POST /api/plans/:planId/approve
Approve plan (Director only)
```
Request:
{
  "approverNotes": "Approved for implementation"
}

Response (200 OK):
{ plan with status: APPROVED }
```

### 4.2 Case Management

#### GET /api/cases
Get cases with filtering
```
Query Parameters:
  - status: PENDING_PROCESS_OWNER|ASSIGNED_TO_TEAM_LEADER|ASSIGNED_TO_AUDITOR|IN_EXECUTION|COMPLETED
  - region: (optional)
  - taxCenter: (optional)
  - auditType: (optional)
  - riskLevel: (optional) Critical|High|Medium|Low
  - assignedTo: (optional) User ID

Response (200 OK):
[
  { case object },
  ...
]
```

#### GET /api/cases/:caseId
Get single case
```
Response (200 OK):
{ case object with full details }
```

#### POST /api/cases/:caseId/assign-team-leader
Assign case to Team Leader
```
Request:
{
  "teamLeaderId": "USR-0001"
}

Response (200 OK):
{
  "success": true,
  "case": { ... with status: ASSIGNED_TO_TEAM_LEADER },
  "message": "Case assigned to Team Leader"
}
```

#### POST /api/cases/:caseId/assign-auditor
Assign case to Auditor
```
Request:
{
  "auditorId": "USR-0005",
  "teamLeaderId": "USR-0001"
}

Response (200 OK):
{
  "success": true,
  "case": { ... with status: ASSIGNED_TO_AUDITOR },
  "message": "Case assigned to Auditor"
}
```

#### POST /api/cases/:caseId/start-execution
Start case execution
```
Response (200 OK):
{ case with status: IN_EXECUTION }
```

#### POST /api/cases/:caseId/complete
Complete case execution
```
Request:
{
  "findings": "No material issues found",
  "recommendations": [...],
  "completionDate": "2026-07-30T18:00:00Z"
}

Response (200 OK):
{ case with status: COMPLETED }
```

### 4.3 Assignment Management

#### GET /api/assignments
Get all assignments
```
Query Parameters:
  - state: (optional) STORED|ASSIGNED_TO_TEAM_LEADER|ASSIGNED_TO_AUDITOR|IN_EXECUTION|COMPLETED
  - teamLeaderId: (optional)
  - auditorId: (optional)

Response (200 OK):
[ { assignment objects } ]
```

#### GET /api/assignments/:assignmentId
Get assignment details with state history
```
Response (200 OK):
{ assignment object with full state history }
```

### 4.4 User & Organization

#### GET /api/users
Get all users with filtering
```
Query Parameters:
  - role: (optional)
  - region: (optional)
  - taxCenter: (optional)
  - status: (optional) ACTIVE|INACTIVE

Response (200 OK):
[ { user objects } ]
```

#### GET /api/users/:userId
Get user details
```
Response (200 OK):
{ user object with full org context and workload }
```

#### PUT /api/users/:userId/workload
Update user workload
```
Request:
{
  "currentCases": 5,
  "maxCapacity": 12
}

Response (200 OK):
{ updated user object }
```

#### GET /api/org-structure
Get complete organization hierarchy
```
Query Parameters:
  - region: (optional)
  - taxCenter: (optional)

Response (200 OK):
{
  "regions": [
    {
      "name": "Addis Ababa",
      "code": "AA",
      "taxCenters": [
        {
          "name": "Addis Ababa TC1",
          "code": "AA-TC1",
          "teams": [
            {
              "id": "TEAM-AA-001",
              "name": "Desk Audit Team 1",
              "auditType": "desk_audit",
              "teamLeader": { user object },
              "auditors": [ { user objects } ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 4.5 Audit Type Configuration

#### GET /api/audit-types
Get all audit types
```
Response (200 OK):
[
  {
    "id": "desk_audit",
    "name": "Desk Audit",
    "description": "Desktop review of financial records",
    "estimatedDuration": 30,
    "requiredTeamSize": 1,
    "riskFactors": ["financial_complexity", "previous_findings"],
    "skillsRequired": ["VAT Compliance", "Revenue Recognition"]
  },
  ...
]
```

### 4.6 Reporting & Analytics

#### GET /api/reports/plan-status
Plan implementation status report
```
Response (200 OK):
{
  "totalCases": 250,
  "byStatus": {
    "PENDING_PROCESS_OWNER": 45,
    "ASSIGNED_TO_TEAM_LEADER": 80,
    "ASSIGNED_TO_AUDITOR": 90,
    "IN_EXECUTION": 25,
    "COMPLETED": 10
  },
  "byRegion": { ... },
  "byAuditType": { ... },
  "byRiskLevel": { ... }
}
```

#### GET /api/reports/team-performance
Team performance metrics
```
Query Parameters:
  - teamLeaderId: (optional)
  - period: (optional) WEEK|MONTH|QUARTER|YEAR

Response (200 OK):
{
  "teamLeaderId": "USR-0001",
  "teamName": "Desk Audit Team 1",
  "period": "MONTH",
  "metrics": {
    "casesAssigned": 12,
    "casesCompleted": 8,
    "completionRate": 67,
    "averageExecutionTime": 28.5,
    "qualityScore": 85,
    "auditorUtilization": 92
  }
}
```

---

## 5. WORKFLOW STATE MACHINE

### State Transitions
```
STORED
  ↓
ASSIGNED_TO_TEAM_LEADER (Process Owner assigns)
  ↓
ASSIGNED_TO_AUDITOR (Team Leader routes)
  ↓
IN_EXECUTION (Auditor starts work)
  ↓
COMPLETED (Work finished)
  ↓
[REALLOCATED] (Optional: back to ASSIGNED_TO_TEAM_LEADER if needed)
```

### Backend Validation Rules
1. **STORED → ASSIGNED_TO_TEAM_LEADER**: Only Tax Center Manager can initiate
2. **ASSIGNED_TO_TEAM_LEADER → ASSIGNED_TO_AUDITOR**: Team Leader must exist, Auditor must exist, Auditor must be under Team Leader
3. **ASSIGNED_TO_AUDITOR → IN_EXECUTION**: Auditor must accept first
4. **IN_EXECUTION → COMPLETED**: Must have findings/observations
5. **COMPLETED → REALLOCATED**: Only authorized users can reallocate

---

## 6. ERROR HANDLING

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Team Leader not found",
    "details": {
      "teamLeaderId": "USR-0999 does not exist"
    },
    "timestamp": "2026-07-30T18:00:00Z"
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | User doesn't have permission |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| CONFLICT | 409 | State conflict (e.g., invalid transition) |
| INTERNAL_ERROR | 500 | Server error |
| WORKLOAD_EXCEEDED | 400 | User at capacity |
| INVALID_TRANSITION | 400 | State transition not allowed |

---

## 7. PERFORMANCE REQUIREMENTS

### Response Times
- Login: < 500ms
- Case list (100 items): < 1000ms
- Case detail: < 500ms
- Assignment: < 800ms
- Bulk operations (10 items): < 2000ms

### Caching Strategy
- User profiles: 5 minutes
- Organization structure: 10 minutes
- Case list: 1 minute
- Plan data: 5 minutes
- Audit types: 24 hours

### Rate Limiting
- Per user: 100 requests/minute
- Per role: 1000 requests/minute
- Bulk operations: 10 requests/minute

---

## 8. DATABASE SCHEMA (PostgreSQL)

### Core Tables
```sql
users (id, email, full_name, role, org_context, workload, status, created_at, updated_at)
audit_plans (id, name, fiscal_year, status, region_allocation, allocation_status, created_by, approved_by, created_at, updated_at)
audit_cases (id, tin, taxpayer_name, audit_type, status, region, tax_center, assigned_team_leader_id, assigned_auditor_id, risk_level, risk_score, created_at, updated_at)
assignments (id, case_id, current_state, current_owner, current_owner_role, state_history, created_at, updated_at)
audit_types (id, name, description, estimated_duration, required_team_size, skills_required)
teams (id, name, team_leader_id, audit_type, region, tax_center, created_at)
audit_logs (id, user_id, action, resource, details, created_at)
```

---

## 9. SECURITY REQUIREMENTS

### Authentication
- OAuth 2.0 with JWT tokens
- Token expiry: 24 hours
- Refresh token expiry: 30 days
- Password requirements: min 8 chars, uppercase, lowercase, number, special char

### Authorization
- Role-based access control (RBAC)
- Region/tax center isolation
- Org context validation on every request

### Data Protection
- All sensitive data encrypted at rest
- HTTPS/TLS for all communications
- Audit logging for all critical operations
- SQL injection prevention (parameterized queries)
- XSS protection headers

---

## 10. INTEGRATION POINTS

### Frontend ↔ Backend Integration
1. **Real-time sync**: Frontend caches data, backend provides source of truth
2. **Conflict resolution**: Last-write-wins with timestamp validation
3. **Offline capability**: Frontend can work offline, syncs when reconnected
4. **WebSocket**: Consider for real-time notifications (optional Phase 2)

### External System Integrations (Future)
- RAET integration for user authentication
- Treasury integration for tax data
- Email/SMS for notifications

---

## 11. DEPLOYMENT & DEVOPS

### Environment Configuration
- Development: localhost, SQLite (or local PostgreSQL)
- Staging: Staging environment with production-like data
- Production: Full PostgreSQL, load balancers, monitoring

### Monitoring
- Application performance: New Relic / DataDog
- Error tracking: Sentry
- Logging: ELK stack or CloudWatch
- Health checks: `/api/health` endpoint

### Backup & Recovery
- Daily database backups
- Point-in-time recovery capability
- Disaster recovery plan with RTO < 4 hours

