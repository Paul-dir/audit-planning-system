# User Management System - Complete Implementation Plan

## Overview

Yes, it's absolutely possible! We'll build a complete User Management System with:
- ✅ Full CRUD operations for users
- ✅ Role-based access control (7 roles)
- ✅ Organizational hierarchy management
- ✅ RESTful API for integration
- ✅ JWT-based authentication
- ✅ Frontend UI for user management
- ✅ Backend API server

---

## Architecture

```
┌──────────────────────────────────────────┐
│   Frontend (React)                       │
│   - User Management UI                   │
│   - Login/Auth Components               │
│   - Role-based routing                  │
└────────────┬─────────────────────────────┘
             │ HTTP/REST API
             ↓
┌──────────────────────────────────────────┐
│   Backend API (Node.js/Express)          │
│   - Authentication endpoints            │
│   - User CRUD endpoints                 │
│   - Permission validation               │
│   - JWT token generation                │
└────────────┬─────────────────────────────┘
             │ SQL/MongoDB
             ↓
┌──────────────────────────────────────────┐
│   Database                               │
│   - users table                         │
│   - roles table                         │
│   - permissions table                   │
│   - audit_logs table                    │
└──────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Backend API (Week 1-2)
**Goal**: Build complete REST API for user management

#### Step 1.1: Setup Backend Project
```bash
mkdir audit-user-management-api
cd audit-user-management-api
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator
npm install --save-dev nodemon
```

#### Step 1.2: Database Schema
**File**: `models/User.js`
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Identity
  userId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: String,
  employeeId: String,
  department: String,
  
  // Role & Permissions
  role: { 
    type: String, 
    enum: [
      'senior_management',
      'audit_director',
      'regional_director',
      'tax_center_manager',
      'team_leader',
      'auditor',
      'cascade_audit_team'
    ],
    required: true 
  },
  permissions: [String],
  
  // Organization Context
  assignedRegion: String,
  assignedTaxCenter: String,
  auditType: String,
  teamId: String,
  
  // Status
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  lastLoginDate: Date,
  passwordLastChanged: Date,
  
  // Metadata
  createdDate: { type: Date, default: Date.now },
  createdBy: String,
  modifiedDate: Date,
  modifiedBy: String
});

module.exports = mongoose.model('User', userSchema);
```

#### Step 1.3: Authentication API
**File**: `routes/auth.js`
```javascript
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        orgContext: {
          assignedRegion: user.assignedRegion,
          assignedTaxCenter: user.assignedTaxCenter,
          auditType: user.auditType
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Update last login
    user.lastLoginDate = new Date();
    await user.save();
    
    // Return response
    res.json({
      token,
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      permissions: user.permissions,
      org_context: {
        assignedRegion: user.assignedRegion,
        assignedTaxCenter: user.assignedTaxCenter,
        auditType: user.auditType,
        teamId: user.teamId
      },
      expiresIn: 3600
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // With JWT, logout is client-side (remove token)
  res.json({ success: true });
});

// POST /api/auth/refresh-token
router.post('/refresh-token', (req, res) => {
  // Implement token refresh logic
  res.json({ token: 'new-token' });
});

module.exports = router;
```

#### Step 1.4: User CRUD API
**File**: `routes/users.js`
```javascript
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /api/users/me (current user)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users (list all, with filters)
router.get('/', auth, async (req, res) => {
  try {
    const { role, region, taxCenter, status } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (region) query.assignedRegion = region;
    if (taxCenter) query.assignedTaxCenter = taxCenter;
    if (status) query.status = status;
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:userId (get specific user)
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.userId }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users (create new user)
router.post('/', auth, async (req, res) => {
  try {
    // Check permissions (only admins can create users)
    if (!['senior_management', 'audit_director'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const {
      userId, email, password, fullName, phone, employeeId, department,
      role, assignedRegion, assignedTaxCenter, auditType, teamId
    } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      userId, email, password: hashedPassword, fullName, phone, employeeId, department,
      role, assignedRegion, assignedTaxCenter, auditType, teamId,
      permissions: getDefaultPermissions(role),
      createdBy: req.user.userId
    });
    
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      userId: user.userId,
      message: 'User created successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:userId (update user)
router.put('/:userId', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields
    delete updates.password;
    delete updates.userId;
    
    updates.modifiedDate = new Date();
    updates.modifiedBy = req.user.userId;
    
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      updates,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:userId (soft delete)
router.delete('/:userId', auth, async (req, res) => {
  try {
    // Check permissions
    if (!['senior_management', 'audit_director'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { status: 'inactive', modifiedDate: new Date(), modifiedBy: req.user.userId },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Get default permissions by role
function getDefaultPermissions(role) {
  const permissionMap = {
    'senior_management': ['approve_plans', 'view_all_reports'],
    'audit_director': ['create_plans', 'deploy_plans', 'view_all_data'],
    'regional_director': ['allocate_cases', 'view_regional_data'],
    'tax_center_manager': ['cascade_plans', 'manage_cases'],
    'team_leader': ['assign_auditors', 'view_team_data'],
    'auditor': ['execute_audits', 'view_assigned_cases'],
    'cascade_audit_team': ['cascade_cases']
  };
  return permissionMap[role] || [];
}

module.exports = router;
```

#### Step 1.5: Auth Middleware
**File**: `middleware/auth.js`
```javascript
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### Step 1.6: Main Server
**File**: `server.js`
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/audit-users', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 User Management API running on port ${PORT}`);
});
```

---

### Phase 2: Frontend Integration (Week 3)
**Goal**: Connect existing AP System to User Management API

#### Step 2.1: API Service Layer
**File**: `src/services/userManagementAPI.js`
```javascript
const API_BASE_URL = process.env.REACT_APP_USER_API_URL || 'http://localhost:3001/api';

class UserManagementAPI {
  // Login
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    const data = await response.json();
    
    // Store token
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userContext', JSON.stringify(data));
    
    return data;
  }
  
  // Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userContext');
  }
  
  // Get current user
  async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  }
  
  // Get users (with filters)
  async getUsers(filters = {}) {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(filters).toString();
    
    const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    return response.json();
  }
  
  // Create user
  async createUser(userData) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    return response.json();
  }
  
  // Update user
  async updateUser(userId, updates) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user');
    }
    
    return response.json();
  }
  
  // Delete user
  async deleteUser(userId) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete user');
    }
    
    return response.json();
  }
}

export default new UserManagementAPI();
```

#### Step 2.2: Update Login Component
**File**: `src/components/Login.jsx`
```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userAPI from '../services/userManagementAPI';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userData = await userAPI.login(email, password);
      console.log('✅ Login successful:', userData);
      
      // Redirect based on role
      const roleRoutes = {
        'senior_management': '/senior-management',
        'audit_director': '/audit-director',
        'regional_director': '/regional-director',
        'tax_center_manager': '/tax-center-manager',
        'team_leader': '/team-leader',
        'auditor': '/auditor'
      };
      
      navigate(roleRoutes[userData.role] || '/dashboard');
      
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px' }}>
      <h2>MOR Audit Planning System</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', fontSize: '16px' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

---

### Phase 3: User Management UI (Week 4)
**Goal**: Build admin interface for managing users

#### Step 3.1: User Management Dashboard
**File**: `src/components/UserManagement/UserManagementDashboard.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import userAPI from '../../services/userManagementAPI';

function UserManagementDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ role: '', status: 'active' });
  
  useEffect(() => {
    loadUsers();
  }, [filter]);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getUsers(filter);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      loadUsers();
    } catch (error) {
      alert('Error deactivating user');
    }
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <h2>User Management</h2>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <select value={filter.role} onChange={(e) => setFilter({...filter, role: e.target.value})}>
          <option value="">All Roles</option>
          <option value="senior_management">Senior Management</option>
          <option value="audit_director">Audit Director</option>
          <option value="regional_director">Regional Director</option>
          <option value="tax_center_manager">Tax Center Manager</option>
          <option value="team_leader">Team Leader</option>
          <option value="auditor">Auditor</option>
        </select>
        
        <select value={filter.status} onChange={(e) => setFilter({...filter, status: e.target.value})}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="">All Status</option>
        </select>
        
        <button onClick={loadUsers}>Refresh</button>
        <button onClick={() => window.location.href = '/users/create'}>+ Create User</button>
      </div>
      
      {/* User List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>User ID</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Organization</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userId} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{user.userId}</td>
                <td style={{ padding: '12px' }}>{user.fullName}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>{user.role.replace(/_/g, ' ')}</td>
                <td style={{ padding: '12px' }}>
                  {user.assignedRegion && `Region: ${user.assignedRegion}`}
                  {user.assignedTaxCenter && `, TC: ${user.assignedTaxCenter}`}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: user.status === 'active' ? '#4caf50' : '#999',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => window.location.href = `/users/edit/${user.userId}`}>
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeactivate(user.userId)}
                    style={{ marginLeft: '8px', background: '#f44336', color: 'white' }}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserManagementDashboard;
```

---

## Next Steps

1. **Choose Your Approach**:
   - Option A: Build backend API first (recommended)
   - Option B: Build frontend UI first with mock API
   - Option C: Build both in parallel

2. **Database Choice**:
   - MongoDB (NoSQL, flexible)
   - PostgreSQL (SQL, structured)
   - MySQL (SQL, traditional)

3. **Deployment**:
   - Backend: Deploy to Heroku, AWS, or local server
   - Frontend: Already deployed with AP System

Would you like me to:
1. ✅ Start building the backend API server?
2. ✅ Create the frontend user management UI?
3. ✅ Set up the database schema?
4. ✅ Build authentication flow end-to-end?

Let me know which part you'd like to start with!
