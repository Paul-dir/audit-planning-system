# User Management System - Handoff Document for External Team

**Project**: Annual Audit Planning (AP) System for MOR (Ministry of Revenue, Ethiopia)  
**Component Being Built**: Centralized User Management System (Independent/External)  
**Date**: July 23, 2026

---

## Quick Overview

You are building an **independent User Management System** that will serve the Annual Audit Planning System via API. Your system will handle:

1. ✅ User authentication (login/logout)
2. ✅ User roles and permissions
3. ✅ Organizational hierarchy (regions, tax centers, audit teams)
4. ✅ User assignment to organizational units
5. ✅ API endpoints for the AP System to call

The AP System will **NOT handle any user management** - it will only consume your API output.

---

## MOR Organizational Structure (For Context)

```
Ministry of Revenue (National)
├─ Senior Management (Approve plans)
├─ Audit Director (Create & coordinate plans)
└─ Regional Level (5-6 regions)
   ├─ Regional Director (1 per region)
   └─ Tax Centers (3-5 per region)
      ├─ Tax Center Manager (manages 1 tax center)
      ├─ Audit Teams (by audit type)
      │  ├─ Team Leader (leads specific audit type)
      │  └─ Auditors (execute audits)
      └─ Cascade Audit Team (special role for planning phase)
```

---

## User Roles (7 Total)

| # | Role | Count | Org Level | Main Function |
|---|------|-------|-----------|---------------|
| 1 | Senior Management | 1-5 | National | Approve annual plans |
| 2 | Audit Director | 1-3 | National | Create & coordinate plans |
| 3 | Regional Director | ~6 | Regional | Allocate to tax centers |
| 4 | Tax Center Manager | ~15-25 | Tax Center | Cascade plan to cases |
| 5 | Team Leader | ~30-50 | Tax Center + Audit Type | Assign cases to auditors |
| 6 | Auditor | ~100-200 | Tax Center + Audit Type | Execute audit cases |
| 7 | Cascade Audit Team | ~5-10 | Any | Special role for cascade phase |

---

## Key User Attributes to Track

For each user, store:

```
identity {
  userId, email, fullName, phone, employeeId, department
}

role {
  role (primary), roles (array, for multi-role)
}

organization {
  assignedRegion (if applicable)
  assignedTaxCenter (if applicable)
  auditType (if applicable)
  teamId (if auditor)
}

status {
  status (active/inactive/suspended)
  permissions[] (array of specific permissions)
  createdDate, lastLoginDate, passwordLastChanged
}
```

---

## Critical Business Rules

1. **Regional Directors** must only see their assigned region
   - Cannot view other regions' data
   - Can allocate to tax centers within their region

2. **Tax Center Managers** must only see their assigned tax center
   - Cannot view other tax centers' data
   - Can cascade plans and manage cases for their tax center

3. **Team Leaders** must only see their team's cases
   - Assigned to ONE audit type (e.g., "Desk Audit")
   - Can assign to auditors in their team

4. **Auditors** can only see their assigned cases
   - May have multiple audit types
   - Report to specific team leader

5. **Multi-level Authorization**
   - National users (Senior Mgmt, Audit Dir) → View all
   - Regional users → View only their region
   - Tax Center users → View only their tax center

---

## API Endpoints to Build

### Authentication
```
POST /auth/login → Returns token + user context
POST /auth/logout
POST /auth/refresh-token
```

### User Data
```
GET /users/me → Current user profile
GET /users/:userId
GET /users (with filters by role, region, taxCenter)
POST /users, PUT /users/:userId, DELETE /users/:userId
```

### Permissions
```
GET /users/:userId/permissions
POST /validate-permission (check if user has permission)
GET /roles/:roleId
```

### Organization
```
GET /org/regions
GET /org/regions/:region/tax-centers
GET /org/tax-centers/:tcId/users (filter by role)
GET /org/teams/:teamId/members
```

### Audit Assignment (for tracking in AP System)
```
GET /users/by-role/:role (with filters)
GET /users/:userId/audit-assignment
POST /users/:userId/audit-assignment
```

---

## Integration Pattern

### At AP System Login:
```
1. User submits email + password
2. AP System → POST /auth/login → Your User Mgmt System
3. Your System returns:
   {
     token: "...",
     userId, email, fullName, role, permissions[],
     org_context: { assignedRegion, assignedTaxCenter, auditType },
     expiresIn: 3600
   }
4. AP System stores token locally
5. All future API calls include token in Authorization header
```

### For Data Filtering:
```
1. AP System receives user context
2. When user views "Audit Cases":
   - AP System gets token + user org_context
   - Filters cases where region == user.assignedRegion (if regional user)
   - Filters cases where taxCenter == user.assignedTaxCenter (if tax center user)
3. User only sees relevant data
```

---

## Implementation Priorities

### Phase 1 (MVP)
- [ ] User model with all attributes
- [ ] 7 roles defined
- [ ] Authentication API (/login, /logout)
- [ ] Token generation & validation
- [ ] User profile API
- [ ] Permission matrix

### Phase 2
- [ ] User management CRUD (create/edit/delete users)
- [ ] Role assignment
- [ ] Organization context API (regions, tax centers)
- [ ] User filtering by role/region/taxCenter

### Phase 3
- [ ] Audit trail logging
- [ ] MFA support
- [ ] Password reset
- [ ] User search/admin dashboard

### Phase 4 (Optional)
- [ ] LDAP/AD integration with MOR directory
- [ ] Bulk user import (CSV)
- [ ] User activity metrics

---

## Technology Stack Recommendation

Your system should be:
- **Stateless** (uses tokens, not sessions)
- **RESTful API** or **GraphQL** (for flexibility)
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT tokens
- **Password Hashing**: bcrypt
- **Logging**: Audit trail of all user management actions

---

## Testing Checklist

Before integration with AP System:

- [ ] All 7 roles can login successfully
- [ ] Role-based permissions enforced correctly
- [ ] Regional directors cannot view other regions
- [ ] Tax center managers cannot view other tax centers
- [ ] Token expires after 1 hour
- [ ] Audit trail logs all login/permission changes
- [ ] Permission validation works (e.g., can auditor create plans? No)
- [ ] User can update their own profile
- [ ] Admin can create/deactivate users
- [ ] Multi-role users work correctly

---

## Questions for Your Team

1. What database will you use?
2. What API format (REST/GraphQL)?
3. Will you integrate with MOR's existing LDAP/AD?
4. What's your timeline?
5. Do you need user activity/audit dashboard?
6. Will you support password reset via email?

---

## Contact & Support

**Full Requirements Document**: See `requirements.md` in this folder  
**Questions**: Reference the requirements document sections  
**Integration**: Once ready, provide your API endpoints to the AP System team  

---

## Next Steps

1. ✅ Review this handoff document
2. ✅ Review detailed `requirements.md`
3. ⏳ Ask clarification questions
4. ⏳ Build the User Management System
5. ⏳ Test all endpoints
6. ⏳ Hand off API documentation to AP System team
7. ⏳ Integrate via API with AP System

Good luck! 🚀

