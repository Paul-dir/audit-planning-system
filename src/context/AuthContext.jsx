import React, { createContext, useState, useContext, useEffect } from 'react';
import userManagementClient from '../api/userManagementClient';
import { getAllUsers } from '../data/orgStructure';
import morIdentityAPI from '../services/morIdentityAPI';
import { parseUserIdEmail, toOrgContext } from '../utils/userIdParser';

const AuthContext = createContext();

// Feature flag: Use MOR Identity API or local mock data
const USE_MOR_IDENTITY_API = import.meta.env.VITE_USE_MOR_IDENTITY === 'true';

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  audit_team: [
    'create_plans',
    'view_audit_metrics',
  ],
  cascade_audit_team: [
    'create_plans',
    'view_audit_metrics',
    'cascade_plan_to_cases', // Cascade Audit Team specific
  ],
  audit_director: [
    'approve_plans',
    'view_all_regions',
    'create_plans',
    'view_audit_metrics',
  ],
  regional_director: [
    'allocate_to_tax_centers',
    'view_audit_metrics',
  ],
  tax_center_manager: [
    'cascade_plan_to_cases',
    'view_audit_cases',
    'view_audit_metrics',
    'manage_case_prioritization',
    'attach_treatment_plans',
    'assign_cases_to_team_leaders',
    'view_assignment_status',
  ],
  team_leader: [
    'assign_cases_to_auditors',
    'view_team_members',
    'update_case_execution',
    'view_audit_metrics',
  ],
  auditor: [
    'update_case_execution',
    'view_audit_metrics',
  ],
  senior_management: [
    'approve_plans',
    'view_all_regions',
    'view_audit_metrics',
  ],
  directorate_requester: [
    'submit_audit_requests',
    'view_audit_metrics',
    'view_own_requests'
  ],
  external_stakeholder: [
    'submit_audit_requests',
    'view_audit_metrics',
    'view_own_requests'
  ]
};

// Generate auth context from user object (no credentials required)
const generateAuthContext = (user) => {
  return {
    userId: user.id || `user-${user.role}`,
    email: user.email || `${user.role}@mor.gov.et`,
    fullName: user.full_name || user.role.replace(/_/g, ' '),
    role: user.role,
    permissions: ROLE_PERMISSIONS[user.role] || [],
    accessLevel: user.accessLevel || 'national_only',
    org_context: user.org_context || {
      assignedRegion: null,
      assignedRegionName: 'National Level',
      assignedTaxCenter: null,
      assignedTaxCenterName: 'N/A',
      teamId: null,
      teamName: null,
      auditType: null,
      level: 'national'
    },
    expiresIn: 86400
  };
};

export function AuthProvider({ children }) {
  const [authContext, setAuthContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth from stored context on mount
  useEffect(() => {
    const stored = localStorage.getItem('auth_context');
    if (stored) {
      setAuthContext(JSON.parse(stored));
      console.log('✓ Auth context restored from storage');
    }
    setLoading(false);
  }, []);

  // Login with email and password (or just email for mock mode)
  const login = async (email, password = null) => {
    try {
      setLoading(true);
      setError(null);

      let context;

      if (USE_MOR_IDENTITY_API) {
        // ✅ Use real MOR Identity API (REQUIRED)
        console.log('🔐 Authenticating via MOR Identity API...');
        
        if (!password) {
          throw new Error('Password is required for MOR Identity API authentication');
        }
        
        const authResponse = await morIdentityAPI.login(email, password);
        
        // ✅ NEW: Parse user ID to extract region even if API doesn't provide it
        const parsedUser = parseUserIdEmail(email);
        console.log('📧 User ID parsed:', parsedUser);
        
        // Merge API response with parsed user data (parsed data is fallback)
        const finalOrgContext = authResponse.org_context || toOrgContext(parsedUser);
        
        // If API provided region is different from parsed, log it
        if (authResponse.org_context?.assignedRegion && 
            parsedUser.assignedRegion && 
            authResponse.org_context.assignedRegion !== parsedUser.assignedRegion) {
          console.warn('⚠️ Region mismatch:', {
            apiRegion: authResponse.org_context.assignedRegion,
            parsedRegion: parsedUser.assignedRegion
          });
        }
        
        // Transform MOR API response to match our internal format
        context = {
          userId: authResponse.userId,
          email: authResponse.email,
          fullName: authResponse.fullName,
          role: authResponse.role,
          permissions: authResponse.permissions || [],
          accessLevel: 'api_managed',
          org_context: {
            assignedRegion: finalOrgContext.assignedRegion || parsedUser.assignedRegion,
            assignedRegionName: finalOrgContext.assignedRegionName || parsedUser.assignedRegion,
            assignedTaxCenter: finalOrgContext.assignedTaxCenter || parsedUser.assignedTaxCenter,
            assignedTaxCenterName: finalOrgContext.assignedTaxCenterName,
            teamId: finalOrgContext.teamId || parsedUser.teamInfo,
            teamName: finalOrgContext.teamName,
            auditTypes: finalOrgContext.auditTypes || (parsedUser.auditType ? [parsedUser.auditType] : []),
            auditType: parsedUser.auditType,
            level: finalOrgContext.level || authResponse.org_context?.assignedTaxCenter ? 'tax_center' :
                   finalOrgContext.assignedRegion || parsedUser.assignedRegion ? 'regional' : 'national'
          },
          expiresIn: authResponse.expiresIn || 3600
        };
        
        console.log('✅ MOR Identity API: Login successful');
      } else {
        // ✅ Local mock mode: Use local mock data
        console.log('🔓 Using local mock authentication...');
        
        // Get user from orgStructure.js (241 users with full org context)
        const allUsersData = getAllUsers();
        let user = allUsersData.find(u => u.email === email);

        if (!user) {
          throw new Error('User not found in organization structure');
        }

        // Generate auth context from user object
        context = generateAuthContext(user);
      }

      // Store context
      setAuthContext(context);
      localStorage.setItem('auth_context', JSON.stringify(context));

      console.log('✓ Login successful:', {
        userId: context.userId,
        role: context.role,
        fullName: context.fullName,
        region: context.org_context?.assignedRegion,
        taxCenter: context.org_context?.assignedTaxCenter,
        auditType: context.org_context?.auditType,
        permissions: context.permissions,
        mode: USE_MOR_IDENTITY_API ? 'MOR Identity API' : 'Local Mock'
      });

      return context;
    } catch (err) {
      setError(err.message);
      console.error('✗ Login failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (USE_MOR_IDENTITY_API) {
      // Call MOR Identity API logout
      await morIdentityAPI.logout();
    }
    
    setAuthContext(null);
    localStorage.removeItem('auth_context');
    console.log('✓ Logged out');
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!authContext) return false;
    return authContext.permissions && authContext.permissions.includes(permission);
  };

  // Get org context
  const getOrgContext = () => {
    return authContext?.org_context || {};
  };

  // Get user info
  const getUserInfo = () => {
    return authContext
      ? {
          userId: authContext.userId,
          email: authContext.email,
          fullName: authContext.fullName,
          role: authContext.role,
          permissions: authContext.permissions,
          accessLevel: authContext.accessLevel,
          orgContext: authContext.org_context,
          expiresIn: authContext.expiresIn,
        }
      : null;
  };

  const value = {
    authContext,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!authContext,
    hasPermission,
    getOrgContext,
    getUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
