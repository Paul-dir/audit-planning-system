# User Management API Client Fixes

## Issues Fixed ✅

### 1. **Environment Variable Mismatch**
- **Problem**: Client was looking for `VITE_USER_MANAGEMENT_API_URL` but `.env` file defined `VITE_MOR_IDENTITY_URL`
- **Fix**: Updated client to use correct environment variable name
- **Impact**: API calls will now use the correct base URL

### 2. **Missing Authorization Headers**
- **Problem**: API requests didn't include authentication tokens
- **Fix**: Added `Authorization: Bearer <token>` header when auth context exists
- **Impact**: Authenticated endpoints will now work properly

### 3. **Poor Error Handling**
- **Problem**: 
  - No HTTP status checking (non-200 responses weren't caught)
  - No handling for non-JSON responses
  - Generic error messages
- **Fix**: 
  - Check `response.ok` before parsing JSON
  - Try to parse error messages from response body
  - Provide detailed error information
- **Impact**: Better debugging and user-friendly error messages

### 4. **Incorrect API Endpoint Paths**
- **Problem**: Endpoints included full path like `/api/public/v1/users` when base URL already contained `/api/public/v1`
- **Fix**: Removed redundant path prefix from all endpoints
- **Before**: `${baseUrl}/api/public/v1/users` → `https://mor-org-forge.lovable.app/api/public/v1/api/public/v1/users` ❌
- **After**: `${baseUrl}/users` → `https://mor-org-forge.lovable.app/api/public/v1/users` ✅

### 5. **Better Logging**
- **Problem**: Limited visibility into API operations
- **Fix**: Added console logs with emojis for:
  - Login attempts and success
  - User profile fetching
  - Auth context restoration
  - Auth context clearing
- **Impact**: Easier debugging in browser console

### 6. **Auth Context Storage Error Handling**
- **Problem**: `getStoredAuthContext()` could crash if localStorage contained invalid JSON
- **Fix**: Added try-catch block around JSON parsing
- **Impact**: App won't crash on corrupted localStorage data

## Configuration

### Environment Variables (.env)
```env
VITE_MOR_IDENTITY_URL=https://mor-org-forge.lovable.app/api/public/v1
```

### Base URL Structure
- Base URL includes the full path: `/api/public/v1`
- Endpoint methods use relative paths: `/users`, `/auth/login`, etc.
- Final URL: `base + endpoint` = `https://mor-org-forge.lovable.app/api/public/v1/users`

## API Endpoints Fixed

### Auth
- `POST /auth/login` - User login
- `GET /auth/me?userId={id}` - Get current user profile

### Users
- `GET /users` - List all users (with filters)
- `GET /users/{id}` - Get specific user
- `POST /users` - Create new user
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user
- `GET /users/by-role/{role}` - Get users by role
- `GET /users/{id}/permissions` - Get user permissions
- `GET /users/{id}/audit-assignment` - Get audit assignments
- `POST /users/{id}/audit-assignment` - Assign audit case

### Organization
- `GET /org/regions` - List regions
- `GET /org/regions/{code}/tax-centers` - Get tax centers in region
- `GET /org/tax-centers/{id}/users` - Get users at tax center
- `GET /org/tax-centers/{id}/teams` - Get teams at tax center
- `GET /org/teams/{id}/members` - Get team members

### Permissions
- `GET /roles` - Get role catalog
- `POST /validate-permission` - Validate user permission

## Testing the Fixes

### 1. Check Browser Console
Look for these log messages:
- 🔐 Login attempts
- ✅ Success messages
- ❌ Error messages with details

### 2. Check Network Tab
- URL should be: `https://mor-org-forge.lovable.app/api/public/v1/users`
- NOT: `https://mor-org-forge.lovable.app/api/public/v1/api/public/v1/users`
- Headers should include `Authorization: Bearer <token>` (after login)

### 3. Test Login Flow
```javascript
// In browser console
import userManagementClient from './src/api/userManagementClient.js';

// Test login
await userManagementClient.login('test@example.com');

// Check auth context
console.log(userManagementClient.authContext);

// Test authenticated request
await userManagementClient.listUsers();
```

## Next Steps

If issues persist, check:
1. **CORS Configuration** - Backend must allow requests from your frontend origin
2. **API Availability** - Verify `https://mor-org-forge.lovable.app` is accessible
3. **Backend API Spec** - Confirm endpoint paths match backend implementation
4. **Token Format** - Verify backend expects `Bearer <token>` format

## Files Modified
- `/src/api/userManagementClient.js` - Complete rewrite of error handling, endpoints, and auth
