# MOR Identity API - Quick Start Guide 🚀

**For**: Development Team  
**Goal**: Get started with MOR Identity API integration

---

## ✅ What's Done

Your AP System now supports **TWO MODES**:

### 1. Mock Mode (Current Default) 
- ✅ No password required
- ✅ 241 pre-loaded users
- ✅ Perfect for development
- ✅ **No changes needed - works now!**

### 2. Real API Mode
- ✅ Full MOR Identity API integration
- ✅ Password authentication
- ✅ JWT tokens
- ✅ Auto token refresh
- ✅ **Ready when you need it!**

---

## 🎯 Quick Enable Real API

### Step 1: Edit `.env` file

```bash
# Change this line:
REACT_APP_USE_MOR_IDENTITY=true

# That's it! File is in project root.
```

### Step 2: Restart Server

```bash
# Stop server: Ctrl+C
# Start again:
npm start
```

### Step 3: Login with Password

Now the login form shows a password field!
1. Select user
2. **Enter password** ← New field appears!
3. Sign in

---

## 📁 Files Created

```
src/services/morIdentityAPI.js        ← API client (all MOR endpoints)
src/context/AuthContext.jsx           ← Updated with API support
src/components/LoginForm.jsx          ← Updated with password field
.env                                   ← Configuration
.env.example                           ← Template
MOR_IDENTITY_API_ANALYSIS.md         ← Full API analysis
MOR_IDENTITY_INTEGRATION_COMPLETE.md  ← Complete documentation
MOR_API_QUICK_START.md                ← This file
```

---

## 🔧 API Client Usage

### Import
```javascript
import morIdentityAPI from './services/morIdentityAPI';
```

### Get Users
```javascript
// Get all auditors in tax center
const auditors = await morIdentityAPI.getUsersByRole('auditor', {
  taxCenter: 'Addis Ababa TC1'
});
```

### Assign Case
```javascript
// Assign case to auditor
await morIdentityAPI.assignCaseToUser(auditorId, caseId, true);
```

### Get Regions
```javascript
// Get all regions
const regions = await morIdentityAPI.getRegions();
```

### Get Tax Centers
```javascript
// Get tax centers in region
const taxCenters = await morIdentityAPI.getTaxCentersByRegion('Addis Ababa');
```

---

## 🧪 Test Both Modes

### Test Mock Mode (Current)
```bash
# In .env:
REACT_APP_USE_MOR_IDENTITY=false

# Start server:
npm start

# Login: No password needed ✓
```

### Test Real API Mode
```bash
# In .env:
REACT_APP_USE_MOR_IDENTITY=true

# Start server:
npm start

# Login: Password required ✓
```

---

## 📊 What's Different?

| Feature | Mock Mode | Real API Mode |
|---------|-----------|---------------|
| Password | ❌ Not needed | ✅ Required |
| Data Source | Local | MOR Database |
| Token | Fake | Real JWT |
| Token Refresh | ❌ N/A | ✅ Every 30min |
| Production Ready | ❌ No | ✅ Yes |

---

## 🎉 Summary

**Current Status**: ✅ READY TO USE

- ✅ Keep using mock mode (no changes)
- ✅ Switch to real API anytime (1 line change)
- ✅ Full API client ready
- ✅ Backward compatible

**Everything works as before, but now you can use the real API whenever ready!**

---

## 📚 More Details

- **Full Documentation**: See `MOR_IDENTITY_INTEGRATION_COMPLETE.md`
- **API Analysis**: See `MOR_IDENTITY_API_ANALYSIS.md`
- **API Spec**: See `mor-identity-openapi (1).yaml`

---

**Questions?** Check the complete documentation or review the code! 🚀
