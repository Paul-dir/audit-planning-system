# User Management System - Complete Specification Package

**Project**: Annual Audit Planning (AP) System for MOR (Ministry of Revenue, Ethiopia)  
**Component**: Centralized User Management System (Independent/External)  
**Created**: July 23, 2026  
**Status**: Ready for External Development

---

## 📋 Document Package Contents

This folder contains complete specifications for building an **independent User Management System** that will serve the AP System via API.

### Documents Included:

1. **README.md** (this file)
   - Overview and navigation guide

2. **requirements.md** ⭐ **START HERE**
   - Complete requirements document
   - All 7 user roles defined
   - All API endpoints specified
   - Permission matrix
   - Data structure requirements
   - Security requirements

3. **HANDOFF_TO_EXTERNAL_TEAM.md**
   - Quick reference for external development team
   - Summary of roles, responsibilities
   - Key business rules
   - Implementation priorities
   - Testing checklist

4. **AP_SYSTEM_INTEGRATION_GUIDE.md**
   - How the AP System will integrate with your User Management System
   - Code examples (frontend & backend)
   - API response formats
   - Integration testing checklist

---

## 🎯 Quick Summary

### What You're Building
A **User Management System (UMS)** that handles:
- ✅ User authentication (login/logout/token refresh)
- ✅ Role management (7 roles for MOR hierarchy)
- ✅ Organizational structure (regions, tax centers, audit teams)
- ✅ Permissions and access control
- ✅ RESTful API endpoints

### Who Will Use It
The **Annual Audit Planning (AP) System** will make API calls to your system to:
- Authenticate users
- Determine what data they can see
- Assign cases to auditors
- Track user workload

### Key Difference from AP System
- **AP System**: Manages audit plans, cases, workflows
- **Your System**: Manages users, roles, permissions, org hierarchy
- **Integration**: Via REST API (token-based)

---

## 👥 User Roles (7 Total)

```
NATIONAL LEVEL
├─ Senior Management (1-5 users) → Approve plans
├─ Audit Director (1-3 users) → Create & coordinate plans
│
REGIONAL LEVEL
├─ Regional Director (1 per region, ~6 total) → Allocate to tax centers
│
TAX CENTER LEVEL
├─ Tax Center Manager (1 per tax center, ~15-25 total) → Cascade plan to cases
├─ Team Leader (1 per audit type, ~30-50 total) → Assign cases to auditors
├─ Auditor (~100-200 total) → Execute audit cases
│
SPECIAL
└─ Cascade Audit Team (~5-10) → Special role for cascade operations
```

---

## 🔑 Key Concepts

### Organization Context
Each user is assigned to organizational units:
- **Regional Director**: Assigned to ONE region (e.g., "Oromia")
- **Tax Center Manager**: Assigned to ONE tax center (e.g., "Oromia-tc1")
- **Team Leader**: Assigned to ONE audit type (e.g., "Desk Audit")
- **Auditor**: Assigned to ONE or more audit types

### Data Visibility Rule
**Users can only see data for their assigned organizational unit**
- Regional director sees only their region's data
- Tax center manager sees only their tax center's data
- Team leader sees only their team's cases
- Auditor sees only their assigned cases

### Permission-Based Access
Each role has specific permissions:
- Can create plans? (Audit Director only)
- Can allocate cases? (Regional Director only)
- Can cascade plans? (Tax Center Manager only)
- Can assign cases? (Tax Center Manager & Team Leader)
- Can execute cases? (Auditor only)

---

## 🔌 API Pattern

### All APIs follow this pattern:

```
REQUEST:
  POST/GET/PUT /api/{resource}
  Authorization: Bearer {token}
  Content-Type: application/json

RESPONSE (Success):
  {
    "data": { ... },
    "success": true
  }

RESPONSE (Error):
  {
    "error": "Error message",
    "code": 400/401/403/500
  }
```

### Token-Based Authentication
- Users login → receive JWT token
- Token stored locally in AP System
- Token sent with every API call
- Token expires after 1 hour
- Token can be refreshed

---

## 📊 Implementation Roadmap

### Phase 1: MVP (Must Have)
- [ ] User model with required attributes
- [ ] 7 roles defined and functional
- [ ] Authentication API (login/logout)
- [ ] Token generation and validation
- [ ] User profile API
- [ ] Permission checking

**Estimated Time**: 2-3 weeks

### Phase 2: Extended (Should Have)
- [ ] User management (create/edit/deactivate)
- [ ] Organization structure APIs
- [ ] User filtering and search
- [ ] Audit trail logging

**Estimated Time**: 2 weeks

### Phase 3: Polish (Nice to Have)
- [ ] MFA support
- [ ] Password reset
- [ ] User activity dashboard
- [ ] Bulk user import

**Estimated Time**: 2 weeks

### Phase 4: Integration
- [ ] Integrate with AP System
- [ ] End-to-end testing
- [ ] Load testing
- [ ] Security audit

**Estimated Time**: 1-2 weeks

---

## 📚 How to Use This Package

### For External Development Team:

1. **Start with `requirements.md`**
   - Get complete picture of what to build
   - Understand all roles and responsibilities
   - Review all API endpoints needed
   - Check data structure requirements

2. **Reference `HANDOFF_TO_EXTERNAL_TEAM.md`**
   - Quick checklists
   - Implementation priorities
   - Technology recommendations
   - Testing checklist

3. **Ask Clarification Questions**
   - Section 11 of requirements.md
   - Contact AP System team

4. **Build Your System**
   - Follow specifications
   - Test against checklist
   - Prepare API documentation

### For AP System Development Team:

1. **Start with `AP_SYSTEM_INTEGRATION_GUIDE.md`**
   - See how to call external User Management APIs
   - See code examples (frontend & backend)
   - See expected response formats

2. **Reference `requirements.md`** for details
   - All available API endpoints
   - All response structures
   - Error handling

3. **Implement Integration**
   - Add login screen that calls User Management API
   - Add token-based auth to all backend routes
   - Filter data by user's org context
   - Show role-based UI

---

## ✅ Acceptance Criteria

### System Must Satisfy

- ✅ All 7 user roles work independently
- ✅ Each role can only access their authorized data
- ✅ Regional director cannot see other regions
- ✅ Tax center manager cannot see other tax centers
- ✅ Team leader cannot see other teams' cases
- ✅ Auditor can only see assigned cases
- ✅ Token-based authentication works
- ✅ Tokens expire after 1 hour
- ✅ Invalid token returns 401 error
- ✅ Permission validation works
- ✅ All API endpoints documented
- ✅ All responses in consistent format
- ✅ Error handling implemented
- ✅ Audit trail logging works

---

## 🔐 Security Requirements

- ✅ HTTPS only (no HTTP)
- ✅ Passwords hashed with bcrypt (12+ salt rounds)
- ✅ JWT tokens used for stateless authentication
- ✅ Token expiration: 1 hour
- ✅ All API endpoints require valid token
- ✅ Role-based access control (RBAC)
- ✅ Audit logging of all user management actions
- ✅ Session timeout after 30 minutes inactivity
- ✅ Password policy: min 12 chars, special chars required

---

## 📞 Support & Contact

### Questions About Requirements?
- See `requirements.md` section 11

### Questions About Integration?
- See `AP_SYSTEM_INTEGRATION_GUIDE.md`

### Need Clarification?
- Contact AP System team
- Reference specific requirements.md section

---

## 📋 Checklist Before Handoff

Before giving this to external team, ensure:

- [ ] All 7 roles clearly defined ✅
- [ ] All API endpoints specified ✅
- [ ] Data structure clear ✅
- [ ] Acceptance criteria defined ✅
- [ ] Security requirements documented ✅
- [ ] Integration examples provided ✅
- [ ] Testing checklist created ✅
- [ ] No ambiguities or unclear requirements ✅

---

## 🚀 Next Steps

1. **External Team**:
   - Review `requirements.md`
   - Ask clarification questions
   - Build the system
   - Test against checklist

2. **AP System Team**:
   - Review `AP_SYSTEM_INTEGRATION_GUIDE.md`
   - Prepare integration code
   - Wait for User Management System to be ready
   - Integrate and test

3. **Project Manager**:
   - Track external team progress
   - Track AP System integration progress
   - Coordinate final integration testing
   - Plan go-live

---

## 📄 Document Version History

| Version | Date | Status | Changes |
|---------|------|--------|---------|
| 1.0 | Jul 23, 2026 | Ready for External Dev | Initial specification package |

---

**Status**: ✅ Ready for External Development Team  
**Next Action**: Hand off to external team for development

---

