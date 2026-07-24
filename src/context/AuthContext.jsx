import React, { createContext, useState, useContext, useEffect } from 'react';
import userManagementClient from '../api/userManagementClient';
import { getAllUsers } from '../data/orgStructure';

const AuthContext = createContext();

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  audit_team: [
    'create_plans',
    'view_audit_metrics',
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
  cascade_audit_team: [
    'cascade_plan_to_cases',
    'view_audit_cases',
    'assign_cases_to_auditors',
    'view_audit_metrics',
    'manage_case_prioritization',
    'attach_treatment_plans',
    'view_assignment_status',
  ],
  process_owner: [
    'manage_processes',
    'view_audit_metrics',
    'cascade_plan_to_cases',
    'assign_cases_to_team_leaders',
    'reallocate_cases',  // ONLY Process Owner has this permission
    'view_assignment_status',
    'view_audit_trail',
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

  // Login with user object (no credentials needed)
  const login = async (email) => {
    try {
      setLoading(true);
      setError(null);

      // Get user from orgStructure.js (241 users with full org context)
      const allUsersData = getAllUsers();
      let user = allUsersData.find(u => u.email === email);

      if (!user) {
        throw new Error('User not found in organization structure');
      }

      // Generate auth context from user object
      const context = generateAuthContext(user);
      setAuthContext(context);
      localStorage.setItem('auth_context', JSON.stringify(context));

      console.log('✓ Login successful:', {
        userId: context.userId,
        role: context.role,
        fullName: context.fullName,
        region: context.org_context.assignedRegion,
        taxCenter: context.org_context.assignedTaxCenter,
        auditType: context.org_context.auditType,
        permissions: context.permissions,
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
  const logout = () => {
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
