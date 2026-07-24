# AP System Integration Guide with User Management System

**For**: The AP System Frontend & Backend Development Team  
**Subject**: How to consume User Management System API  
**Date**: July 23, 2026

---

## Overview

Your AP System will integrate with an **external User Management System** via REST API. This guide shows exactly how your system will call the external APIs and use the responses.

---

## Integration Architecture

```
┌─────────────────────────────────┐
│   AP System Frontend (React)    │
│  - Shows UI based on user role  │
│  - Stores token locally         │
└────────┬────────────────────────┘
         │ POST /login
         │ GET /users/me
         ↓
┌─────────────────────────────────┐
│  AP System Backend (Node/Python)│
│  - Validates tokens             │
│  - Filters data by user context │
│  - Makes API calls for auth     │
└────────┬────────────────────────┘
         │ All API calls include token
         │ All responses filtered by user org
         ↓
┌─────────────────────────────────┐
│  User Management System (API)   │
│  - Authenticates users          │
│  - Manages roles/permissions    │
│  - Provides org context         │
└─────────────────────────────────┘
```

---

## Step-by-Step Integration

### Step 1: User Login (Frontend)

**File**: `src/components/LoginView.jsx` or equivalent

```javascript
// 1. User submits email + password
const handleLogin = async (email, password) => {
  try {
    // 2. Call external User Management API
    const response = await fetch('https://user-mgmt.mor.gov.et/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    // 3. Response contains:
    // {
    //   token: "eyJhbGciOiJIUzI1NiIs...",
    //   userId: "user-123",
    //   email: "regional@mor.gov.et",
    //   fullName: "Abebe Tekle",
    //   role: "regional_director",
    //   permissions: ["view_plans", "allocate_cases", ...],
    //   org_context: { assignedRegion: "Oromia", ... },
    //   expiresIn: 3600
    // }

    // 4. Store token in localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userContext', JSON.stringify(data));

    // 5. Redirect to dashboard
    navigate('/dashboard');

  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};
```

---

### Step 2: Use Token for All API Calls (Backend)

**File**: `src/middleware/auth.js` or equivalent

```javascript
// Middleware: Add token to all requests
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Optional: Validate token with User Management System
  // POST https://user-mgmt.mor.gov.et/api/auth/validate-token
  
  req.token = token;
  next();
}

// Example API route: Get audit plans
app.get('/api/audit-plans', authMiddleware, async (req, res) => {
  try {
    // 1. Extract user context from token
    const userContext = req.user; // Should contain role, assignedRegion, etc.

    // 2. Filter plans based on user's org context
    let query = {};
    if (userContext.role === 'regional_director') {
      query.region = userContext.assignedRegion; // Only show their region
    } else if (userContext.role === 'tax_center_manager') {
      query.region = userContext.assignedTaxCenterRegion;
      query.taxCenter = userContext.assignedTaxCenter;
    }

    // 3. Fetch from database with filters
    const plans = await db.plans.find(query);
    
    // 4. Return only relevant data
    res.json(plans);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### Step 3: Display UI Based on Role (Frontend)

**File**: `src/components/App.jsx` or equivalent

```javascript
function App() {
  const userContext = JSON.parse(localStorage.getItem('userContext'));
  
  // Show different menu items based on role
  const renderMenuItems = () => {
    const menuByRole = {
      'senior_management': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'approve-plans', label: 'Approve Plans' },
        { id: 'reports', label: 'Reports' }
      ],
      'audit_director': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'create-plan', label: 'Create Plan' },
        { id: 'deployment', label: 'Deploy Plans' }
      ],
      'regional_director': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'allocate-cases', label: 'Allocate to Tax Centers' },
        { id: 'tax-center-feedback', label: 'Tax Center Feedback' }
      ],
      'tax_center_manager': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'cascade-plan-cases', label: 'Cascade Plan to Cases' },
        { id: 'audit-cases', label: 'Audit Cases' }
      ],
      'team_leader': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'assign-cases', label: 'Assign Cases to Team' },
        { id: 'team-progress', label: 'Team Progress' }
      ],
      'auditor': [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'my-cases', label: 'My Audit Cases' },
        { id: 'case-details', label: 'Case Details' }
      ]
    };

    return menuByRole[userContext.role] || [];
  };

  return (
    <Sidebar menuItems={renderMenuItems()} />
  );
}
```

---

### Step 4: Filter Data by Org Context (Backend)

**Example: Audit Cases API**

```javascript
app.get('/api/audit-cases', authMiddleware, async (req, res) => {
  const user = req.user; // From decoded token

  let query = {};

  // Apply filters based on user role
  switch(user.role) {
    case 'senior_management':
      // See all cases
      break;
    
    case 'audit_director':
      // See all cases
      break;
    
    case 'regional_director':
      // See only their region's cases
      query.region = user.assignedRegion;
      break;
    
    case 'tax_center_manager':
      // See only their tax center's cases
      query.taxCenter = user.assignedTaxCenter;
      query.region = user.assignedTaxCenterRegion;
      break;
    
    case 'team_leader':
      // See only their team's cases
      query.taxCenter = user.assignedTaxCenter;
      query.auditType = user.auditType;
      break;
    
    case 'auditor':
      // See only assigned to them
      query.assignedAuditor = user.userId;
      break;
  }

  const cases = await db.auditCases.find(query);
  res.json(cases);
});
```

---

### Step 5: Assign Cases to Auditors (Backend)

**When tax center manager or team leader assigns a case**:

```javascript
app.post('/api/audit-cases/:caseId/assign', authMiddleware, async (req, res) => {
  const { auditId } = req.body;
  const user = req.user;

  // 1. Validate that requester has permission
  if (!['tax_center_manager', 'team_leader'].includes(user.role)) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  // 2. Call User Management System to get auditor info
  const auditorResponse = await fetch(`https://user-mgmt.mor.gov.et/api/users/${auditId}`, {
    headers: { 'Authorization': `Bearer ${req.token}` }
  });
  const auditor = await auditorResponse.json();

  // 3. Validate auditor belongs to same team/tax center
  if (auditor.assignedTaxCenter !== user.assignedTaxCenter) {
    return res.status(403).json({ error: 'Auditor not in your tax center' });
  }

  // 4. Assign case
  await db.auditCases.update(
    { id: req.params.caseId },
    { assignedAuditor: auditId, assignedDate: new Date() }
  );

  // 5. Track in User Management System (optional)
  await fetch(`https://user-mgmt.mor.gov.et/api/users/${auditId}/audit-assignment`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${req.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      caseId: req.params.caseId,
      allocate: true
    })
  });

  res.json({ success: true });
});
```

---

## Expected API Response Format

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "usr-12345",
  "email": "regional@mor.gov.et",
  "fullName": "Abebe Tekle",
  "role": "regional_director",
  "permissions": [
    "view_plans",
    "allocate_cases",
    "submit_plans_to_tax_centers",
    "acknowledge_plans"
  ],
  "org_context": {
    "assignedRegion": "Oromia",
    "taxCenters": ["Oromia-tc1", "Oromia-tc2", "Oromia-tc3"]
  },
  "expiresIn": 3600
}
```

### User Profile Response
```json
{
  "userId": "usr-12345",
  "email": "regional@mor.gov.et",
  "fullName": "Abebe Tekle",
  "phone": "+251-91-123-4567",
  "employeeId": "MOR-2020-0045",
  "department": "Audit",
  "role": "regional_director",
  "roles": ["regional_director"],
  "status": "active",
  "assignedRegion": "Oromia",
  "permissions": [
    "view_plans",
    "allocate_cases",
    "submit_plans_to_tax_centers",
    "acknowledge_plans"
  ],
  "lastLoginDate": "2026-07-23T09:00:00Z",
  "createdDate": "2026-01-15T10:30:00Z"
}
```

---

## Common Integration Points

| Scenario | What to Call | Response Contains | How to Use |
|----------|-------------|-------------------|-----------|
| User logs in | POST /auth/login | token, role, permissions, org_context | Store token, show role-based UI |
| Get current user | GET /users/me | userId, role, org_context | Display user profile |
| Get team members | GET /org/teams/:teamId/members | Array of auditors | Show dropdown to assign cases |
| Get regions | GET /org/regions | Array of region names | Populate dropdown in form |
| Get tax centers | GET /org/regions/:region/tax-centers | Array of tax center names | Populate dropdown |
| Validate permission | POST /validate-permission | allowed: true/false | Show/hide features |
| Search users by role | GET /users/by-role/:role?taxCenter=... | Array of users | Find auditors to assign |

---

## Error Handling

All API calls may return errors. Handle these gracefully:

```javascript
// Example error response
{
  "error": "Unauthorized",
  "code": 401,
  "message": "Token expired"
}

// In your code:
fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  .then(res => {
    if (res.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      navigate('/login');
    }
    return res.json();
  })
  .catch(error => {
    console.error('API error:', error);
    alert('Failed to load data');
  });
```

---

## Testing Checklist

Before going live with User Management System:

- [ ] Login endpoint works with test credentials
- [ ] Token is stored locally and sent with requests
- [ ] Regional director sees only their region's data
- [ ] Tax center manager sees only their tax center's data
- [ ] Team leader sees only their team's cases
- [ ] Auditor sees only assigned cases
- [ ] Permission validation works (e.g., auditor cannot create plans)
- [ ] Token refresh works (if 1-hour expiry)
- [ ] Logout clears token and redirects
- [ ] Assigning cases updates User Management System tracking

---

## Configuration Needed

In your AP System, store these environment variables:

```
USER_MGMT_API_URL=https://user-mgmt.mor.gov.et/api
USER_MGMT_API_KEY=<api-key-if-needed>
SESSION_TIMEOUT=3600
TOKEN_REFRESH_INTERVAL=1800
```

---

## Support & Questions

- **What if token expires?** Check `expiresIn` field, refresh token before expiry
- **How to debug auth issues?** Check token in browser console: `localStorage.getItem('authToken')`
- **Can user have multiple roles?** Yes, check `roles[]` array
- **How to add new role?** Contact User Management System team, update role list

---

Good luck with integration! 🚀

