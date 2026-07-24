/**
 * Data Filtering Utilities
 * Ensures all data is filtered by user's assigned region/tax center
 * Enforces strict isolation across all 241 users
 */

/**
 * Filter data by user's access level
 * @param {Array} data - Array of data objects to filter
 * @param {Object} userInfo - User info from auth context
 * @param {String} dataType - Type of data: 'plan', 'case', 'region', 'taxCenter', 'team', etc.
 * @returns {Array} Filtered data
 */
export function filterDataByUserAccess(data, userInfo, dataType = 'generic') {
  if (!userInfo || !Array.isArray(data)) return [];

  const { role, accessLevel, orgContext } = userInfo;

  // National-only users can see all data
  if (accessLevel === 'national_only') {
    return data;
  }

  // Regional-only users see only their region
  if (accessLevel === 'region_only') {
    return data.filter(item => {
      return item.region === orgContext?.assignedRegion ||
             item.assignedRegion === orgContext?.assignedRegion ||
             item.org_context?.assignedRegion === orgContext?.assignedRegion;
    });
  }

  // Tax center users see only their tax center
  if (accessLevel === 'tax_center_only') {
    return data.filter(item => {
      return item.taxCenter === orgContext?.assignedTaxCenter ||
             item.assignedTaxCenter === orgContext?.assignedTaxCenter ||
             item.org_context?.assignedTaxCenter === orgContext?.assignedTaxCenter;
    });
  }

  // Assigned cases only (auditors and team leads)
  if (accessLevel === 'assigned_cases_only') {
    return data.filter(item => {
      return item.assignedTo === userInfo.userId ||
             item.teamId === orgContext?.teamId ||
             item.org_context?.teamId === orgContext?.teamId;
    });
  }

  return [];
}

/**
 * Get user's data scope
 * Returns object defining what data user can access
 */
export function getUserDataScope(userInfo) {
  if (!userInfo) {
    return {
      canAccessAllRegions: false,
      canAccessAllTaxCenters: false,
      assignedRegion: null,
      assignedTaxCenter: null,
      assignedTeamId: null,
      level: 'none'
    };
  }

  const { accessLevel, orgContext } = userInfo;

  return {
    canAccessAllRegions: accessLevel === 'national_only',
    canAccessAllTaxCenters: accessLevel === 'national_only',
    canAccessRegion: accessLevel === 'region_only' || accessLevel === 'tax_center_only',
    canAccessTaxCenter: accessLevel === 'tax_center_only',
    canAccessAssignedCasesOnly: accessLevel === 'assigned_cases_only',
    assignedRegion: orgContext?.assignedRegion,
    assignedTaxCenter: orgContext?.assignedTaxCenter,
    assignedTeamId: orgContext?.teamId,
    auditType: orgContext?.auditType,
    level: accessLevel
  };
}

/**
 * Filter plans by user's region/tax center
 */
export function filterPlansByUserAccess(plans, userInfo) {
  return filterDataByUserAccess(plans, userInfo, 'plan');
}

/**
 * Filter cases by user's region/tax center
 */
export function filterCasesByUserAccess(cases, userInfo) {
  if (!userInfo || !Array.isArray(cases)) return [];

  const filtered = filterDataByUserAccess(cases, userInfo, 'case');

  // Additional filtering for team leaders by audit type
  if (userInfo.role === 'team_leader' && userInfo.orgContext?.auditType) {
    return filtered.filter(c => c.auditType === userInfo.orgContext.auditType);
  }

  return filtered;
}

/**
 * Filter tax centers visible to user
 */
export function filterTaxCentersByUserAccess(taxCenters, userInfo) {
  if (!userInfo || !Array.isArray(taxCenters)) return [];

  // National users see all tax centers
  if (userInfo.accessLevel === 'national_only') {
    return taxCenters;
  }

  // Regional users see tax centers in their region
  if (userInfo.accessLevel === 'region_only') {
    return taxCenters.filter(tc => tc.region === userInfo.orgContext?.assignedRegion);
  }

  // Tax center users only see their tax center
  if (userInfo.accessLevel === 'tax_center_only') {
    return taxCenters.filter(tc => tc.name === userInfo.orgContext?.assignedTaxCenter);
  }

  return [];
}

/**
 * Filter regions visible to user
 */
export function filterRegionsByUserAccess(regions, userInfo) {
  if (!userInfo || !Array.isArray(regions)) return [];

  // National users see all regions
  if (userInfo.accessLevel === 'national_only') {
    return regions;
  }

  // Regional and tax center users see only their region
  if (userInfo.accessLevel === 'region_only' || userInfo.accessLevel === 'tax_center_only') {
    return regions.filter(r => r === userInfo.orgContext?.assignedRegion);
  }

  return [];
}

/**
 * Filter teams visible to user
 */
export function filterTeamsByUserAccess(teams, userInfo) {
  if (!userInfo || !Array.isArray(teams)) return [];

  const filtered = filterDataByUserAccess(teams, userInfo, 'team');

  // Team leaders only see their team
  if (userInfo.role === 'team_leader' && userInfo.orgContext?.teamId) {
    return filtered.filter(t => t.id === userInfo.orgContext.teamId);
  }

  // Auditors only see their team
  if (userInfo.role === 'auditor' && userInfo.orgContext?.teamId) {
    return filtered.filter(t => t.id === userInfo.orgContext.teamId);
  }

  return filtered;
}

/**
 * Check if user can access specific resource
 */
export function canUserAccessResource(userInfo, resource) {
  if (!userInfo) return false;

  // National users can access anything
  if (userInfo.accessLevel === 'national_only') return true;

  // Regional users can access their region
  if (userInfo.accessLevel === 'region_only') {
    return resource.region === userInfo.orgContext?.assignedRegion ||
           resource.assignedRegion === userInfo.orgContext?.assignedRegion;
  }

  // Tax center users can access their tax center
  if (userInfo.accessLevel === 'tax_center_only') {
    return resource.taxCenter === userInfo.orgContext?.assignedTaxCenter ||
           resource.assignedTaxCenter === userInfo.orgContext?.assignedTaxCenter;
  }

  // Assigned cases only
  if (userInfo.accessLevel === 'assigned_cases_only') {
    return resource.assignedTo === userInfo.userId ||
           resource.teamId === userInfo.orgContext?.teamId;
  }

  return false;
}

/**
 * Get breadcrumb for user's org context
 */
export function getUserBreadcrumb(userInfo) {
  if (!userInfo) return 'System';

  const parts = [];

  if (userInfo.orgContext?.assignedRegion) {
    parts.push(userInfo.orgContext.assignedRegion);
  }

  if (userInfo.orgContext?.assignedTaxCenter) {
    parts.push(userInfo.orgContext.assignedTaxCenter);
  }

  if (userInfo.orgContext?.auditType) {
    parts.push(userInfo.orgContext.auditType);
  }

  if (parts.length === 0) {
    return 'National Level';
  }

  return parts.join(' > ');
}
