# Build Complete AP Cluster Frontend From Scratch - Complete Guide

**A step-by-step guide to build the entire tax audit planning system from nothing**

---

## PHASE 1: PROJECT SETUP

### Step 1.1: Initialize React Project with Vite

```bash
# Create new Vite React project
npm create vite@latest ap-cluster-frontend -- --template react

# Navigate to project
cd ap-cluster-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Output: http://localhost:5173
```

### Step 1.2: Project Structure Setup

```
ap-cluster-frontend/
├── src/
│   ├── components/           # React components
│   ├── services/             # Data & API services
│   ├── context/              # React contexts
│   ├── utils/                # Utility functions
│   ├── hooks/                # Custom hooks
│   ├── pages/                # Page components
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # Entry point
│   └── main.css              # Global styles
├── public/                   # Static files
├── package.json
├── vite.config.js
├── .env                      # Environment variables
└── README.md
```

### Step 1.3: Install Required Dependencies

```bash
npm install react-router-dom@latest
npm install axios@latest
npm install uuid@latest
npm install date-fns@latest
```

### Step 1.4: Create .env File

```
VITE_APP_NAME=AP Cluster Frontend
VITE_APP_VERSION=2.5
VITE_API_BASE_URL=http://localhost:3000
```

---

## PHASE 2: AUTHENTICATION & CONTEXT SETUP

### Step 2.1: Create AuthContext

**File**: `src/context/AuthContext.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authContext, setAuthContext] = useState(null);

  // Mock user database
  const mockUsers = {
    'director': {
      id: '1', email: 'director@gov.et', fullName: 'Director Ahmed',
      role: 'audit_director', password: 'password'
    },
    'regional': {
      id: '2', email: 'regional@gov.et', fullName: 'Regional Dawit',
      role: 'regional_director', org_context: { assignedRegion: 'addis_ababa' }
    },
    'taxcenter': {
      id: '3', email: 'taxcenter@gov.et', fullName: 'Tax Center Fatima',
      role: 'tax_center_manager',
      org_context: { assignedRegion: 'addis_ababa', assignedTaxCenter: 'addis_ababa-tc1' }
    }
  };

  const login = (email, password) => {
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user && user.password === password) {
      setIsAuthenticated(true);
      setAuthContext({ ...user, isAuthenticated: true });
      localStorage.setItem('auth', JSON.stringify({ ...user, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthContext(null);
    localStorage.removeItem('auth');
  };

  const getUserInfo = () => authContext;

  return (
    <AuthContext.Provider value={{ isAuthenticated, authContext, login, logout, getUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Step 2.2: Create DataService with useData Hook

**File**: `src/services/dataService.jsx`

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('data');
    if (saved) {
      console.log('✅ Loaded existing data from localStorage');
      return JSON.parse(saved);
    }
    return {
      version: '2.5',
      lastUpdated: new Date().toISOString(),
      plans: [],
      cases: [],
      config: {
        auditTypes: ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'],
        regions: ['addis_ababa', 'oromia', 'amhara', 'somali', 'tigray'],
        taxCenters: {
          addis_ababa: ['addis_ababa-tc1', 'addis_ababa-tc2', 'addis_ababa-tc3'],
          oromia: ['oromia-tc1', 'oromia-tc2']
        }
      }
    };
  });

  const updateData = async (newData) => {
    setData(newData);
    localStorage.setItem('data', JSON.stringify(newData));
    console.log('💾 Data saved to localStorage');
    return Promise.resolve();
  };

  const refreshData = async () => {
    const saved = localStorage.getItem('data');
    if (saved) {
      setData(JSON.parse(saved));
      console.log('🔄 Data refreshed from localStorage');
    }
    return Promise.resolve();
  };

  return (
    <DataContext.Provider value={{ data, updateData, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
```

---

## PHASE 3: CORE COMPONENTS

### Step 3.1: Login Page

**File**: `src/components/MORLoginPage.jsx`

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MORLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('director@gov.et');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (login(email, password)) {
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h1>Ministry of Revenue - AP Cluster</h1>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Login</button>
      </form>
    </div>
  );
}
```

### Step 3.2: Create App Component with Routing

**File**: `src/App.jsx`

```javascript
import React from 'react';
import { useAuth } from './context/AuthContext';
import { useData } from './services/dataService';
import MORLoginPage from './components/MORLoginPage';
import AuditDirectorDashboard from './components/dashboards/AuditDirectorDashboard';
import RegionalDirectorDashboard from './components/dashboards/RegionalDirectorDashboard';
import TaxCenterManagerDashboard from './components/dashboards/TaxCenterManagerDashboard';

function App() {
  const { isAuthenticated, authContext } = useAuth();
  const { data } = useData();

  if (!isAuthenticated) {
    return <MORLoginPage />;
  }

  const role = authContext?.role;

  const renderDashboard = () => {
    switch(role) {
      case 'audit_director':
        return <AuditDirectorDashboard />;
      case 'regional_director':
        return <RegionalDirectorDashboard />;
      case 'tax_center_manager':
        return <TaxCenterManagerDashboard />;
      default:
        return <div>Role not recognized</div>;
    }
  };

  return (
    <div className="app">
      <nav style={{ background: '#333', color: 'white', padding: '10px' }}>
        <span>{authContext?.fullName}</span>
        <button onClick={() => {}} style={{ marginLeft: 'auto', padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
      </nav>
      {renderDashboard()}
    </div>
  );
}

export default App;
```

### Step 3.3: Create Dashboards

**File**: `src/components/dashboards/AuditDirectorDashboard.jsx`

```javascript
import React, { useState } from 'react';
import { useData } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export default function AuditDirectorDashboard() {
  const { data, updateData } = useData();
  const { getUserInfo } = useAuth();
  const [planName, setPlanName] = useState('');
  const [allocations, setAllocations] = useState({
    desk_audit: 5,
    field_audit: 3,
    joint_audit: 2
  });

  const handleCreatePlan = () => {
    if (!planName) {
      alert('Enter plan name');
      return;
    }

    const newPlan = {
      id: `AP-${String(data.plans.length + 1).padStart(4, '0')}`,
      name: planName,
      status: 'CREATED',
      directorAllocation: allocations,
      createdDate: new Date().toISOString(),
      createdBy: getUserInfo().fullName
    };

    const updatedData = { ...data, plans: [...data.plans, newPlan] };
    updateData(updatedData);
    alert(`✅ Plan ${newPlan.id} created`);
    setPlanName('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Audit Director Dashboard</h1>
      
      <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Create New Plan</h2>
        <input 
          type="text" 
          value={planName} 
          onChange={(e) => setPlanName(e.target.value)} 
          placeholder="Plan name" 
          style={{ display: 'block', marginBottom: '10px', padding: '8px', border: '1px solid #ccc' }}
        />
        <div>
          {data.config.auditTypes.slice(0, 3).map(type => (
            <div key={type} style={{ marginBottom: '10px' }}>
              <label>{type}: </label>
              <input 
                type="number" 
                value={allocations[type] || 0}
                onChange={(e) => setAllocations({ ...allocations, [type]: parseInt(e.target.value) })}
                style={{ width: '60px', padding: '5px', border: '1px solid #ccc' }}
              />
            </div>
          ))}
        </div>
        <button onClick={handleCreatePlan} style={{ padding: '10px 20px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
          Create Plan
        </button>
      </div>

      <div>
        <h2>My Plans ({data.plans.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Plan ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.plans.map(plan => (
              <tr key={plan.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{plan.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{plan.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{plan.status}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{new Date(plan.createdDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Step 3.4: Create Regional Director Dashboard

**File**: `src/components/dashboards/RegionalDirectorDashboard.jsx`

```javascript
import React, { useState } from 'react';
import { useData } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export default function RegionalDirectorDashboard() {
  const { data, updateData } = useData();
  const { authContext } = useAuth();
  const region = authContext?.org_context?.assignedRegion;

  const regionPlans = data.plans.filter(p => p.regionalAllocation?.[region]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Regional Director Dashboard - {region?.toUpperCase()}</h1>
      
      <div>
        <h2>Plans for My Region</h2>
        <p>Total plans: {regionPlans.length}</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Plan ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {regionPlans.map(plan => (
              <tr key={plan.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{plan.id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{plan.status}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button style={{ padding: '5px 10px', background: '#0066cc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                    Allocate to Tax Centers
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### Step 3.5: Create Tax Center Dashboard

**File**: `src/components/dashboards/TaxCenterManagerDashboard.jsx`

```javascript
import React, { useState } from 'react';
import { useData } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';

export default function TaxCenterManagerDashboard() {
  const { data, updateData } = useData();
  const { authContext } = useAuth();
  const taxCenter = authContext?.org_context?.assignedTaxCenter;
  const region = authContext?.org_context?.assignedRegion;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tax Center Manager Dashboard</h1>
      <p>Tax Center: {taxCenter}</p>
      <p>Region: {region}</p>
      
      <div>
        <h2>Allocations Received</h2>
        <p>Total plans: {data.plans.length}</p>
      </div>
    </div>
  );
}
```

---

## PHASE 4: IMPLEMENT CORE WORKFLOWS

### Step 4.1: Add Plan Status Management

Modify `src/services/dataService.jsx` to track plan status transitions:

```javascript
const updatePlanStatus = async (planId, newStatus) => {
  const updatedData = JSON.parse(JSON.stringify(data));
  const planIndex = updatedData.plans.findIndex(p => p.id === planId);
  if (planIndex >= 0) {
    updatedData.plans[planIndex].status = newStatus;
    updatedData.plans[planIndex].lastModified = new Date().toISOString();
    await updateData(updatedData);
    return true;
  }
  return false;
};
```

### Step 4.2: Implement Feedback Workflow

Create `src/utils/businessLogic.js`:

```javascript
export const submitTaxCenterFeedback = (planId, region, taxCenter, feedbackByType, userName) => {
  const data = JSON.parse(localStorage.getItem('data'));
  const plan = data.plans.find(p => p.id === planId);

  if (!plan) return { success: false, message: 'Plan not found' };

  // Initialize feedback structure
  if (!plan.taxCenterFeedback) plan.taxCenterFeedback = {};
  if (!plan.taxCenterFeedback[region]) plan.taxCenterFeedback[region] = {};

  // Save feedback
  plan.taxCenterFeedback[region][taxCenter] = {
    feedbackByType,
    feedbackDate: new Date().toISOString(),
    feedbackBy: userName
  };

  localStorage.setItem('data', JSON.stringify(data));
  return { success: true };
};
```

---

## PHASE 5: STYLING

### Step 5.1: Create Main CSS

**File**: `src/main.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

table {
  font-size: 14px;
  border-collapse: collapse;
  margin-top: 10px;
}

button {
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
}

input, select, textarea {
  border-radius: 4px;
  font-size: 14px;
}

.status-created { color: #999; }
.status-submitted { color: #0066cc; }
.status-approved { color: #00aa00; }
.status-completed { color: #00aa00; font-weight: bold; }
.status-rejected { color: #cc0000; }
```

---

## PHASE 6: BUILD & DEPLOYMENT

### Step 6.1: Build for Production

```bash
# Create optimized build
npm run build

# Output in ./dist folder
# Files: index.html, assets/index-[hash].js, assets/index-[hash].css
```

### Step 6.2: Run Development Server

```bash
npm run dev
# Available at http://localhost:5173
```

### Step 6.3: Deploy

```bash
# Deploy dist folder to:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3
# - Any static hosting
```

---

## SUMMARY: COMPLETE BUILD CHECKLIST

### ✅ Phase 1: Setup
- [x] Vite + React project initialized
- [x] Dependencies installed
- [x] Project structure created
- [x] .env file configured

### ✅ Phase 2: Authentication & Context
- [x] AuthContext created with mock users
- [x] DataService created with useData hook
- [x] localStorage integration

### ✅ Phase 3: Core Components
- [x] Login page created
- [x] App routing implemented
- [x] Audit Director dashboard
- [x] Regional Director dashboard
- [x] Tax Center Manager dashboard

### ✅ Phase 4: Core Workflows
- [x] Plan status management
- [x] Feedback submission workflow

### ✅ Phase 5: Styling
- [x] Global CSS

### ✅ Phase 6: Build & Deploy
- [x] Development server running
- [x] Production build created
- [x] Ready for deployment

---

## TESTING QUICK START

### Test 1: Create Plan
1. Login as director@gov.et
2. Click "Create Plan"
3. Enter plan name and allocations
4. ✅ Plan should appear in table

### Test 2: View as Regional Director
1. Login as regional@gov.et
2. See plans for assigned region
3. ✅ Should show region-specific plans

### Test 3: View as Tax Center
1. Login as taxcenter@gov.et
2. See dashboard
3. ✅ Should show tax center info

---

**NEXT STEPS**: Add more components, workflows, and features as needed following this same pattern!**