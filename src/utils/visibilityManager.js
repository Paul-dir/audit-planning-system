 /**
 * ============================================================
 * VISIBILITY MANAGER
 * ============================================================
 * 
 * Controls what data each user level can see. Enforces
 * strict data isolation:
 *   - National sees everything
 *   - Regional sees only their region
 *   - Tax Center sees only their tax center
 *   - Team Leader sees only their team
 *   - Auditor sees only their assigned cases
 *
 * Also controls feature visibility: risk engine, configuration,
 * reports, dashboard metrics are scoped per level.
 */

import {
  getLevelForRole,
  getFeatureVisibility,
  FEATURE_VISIBILITY,
} from '../config/hierarchyConfig';
import {
  getPlansForLevel,
  getCasesForLevel,
} from './hierarchyEngine';
import { loadData } from './data';

// ============================================================
// 1. USER CONTEXT RESOLVER
// ============================================================

/**
 * Get the user's hierarchy context from their auth info
 * Returns standardized object regardless of role
 */
export function getUserHierarchyContext(userInfo) {
  if (!userInfo) return null;

  const orgContext = userInfo.orgContext || {};
  const level = getLevelForRole(userInfo.role);
  const levelKey = level?.key || 'national';

  // Determine the entity ID this user represents at their level
  let entityId = null;
  let parentEntityId = null;
  let childEntities = [];

  switch (levelKey) {
    case 'national':
      entityId = 'national';
      break;
    case 'regional':
      entityId = orgContext.assignedRegion || orgContext.assignedRegionName;
      break;
    case 'tax_center':
      entityId = orgContext.assignedTaxCenter || orgContext.assignedTaxCenterName;
      parentEntityId = orgContext.assignedRegion || orgContext.assignedRegionName;
      break;
    case 'team_leader':
      entityId = orgContext.teamId; // e.g., TL-AA-TC1-DA-1
      parentEntityId = orgContext.assignedTaxCenter || orgContext.assignedTaxCenterName;
      break;
    case 'auditor':
      entityId = userInfo.userId; // User ID is the auditor ID
      parentEntityId = orgContext.teamId;
      break;
    default:
      entityId = 'national';
  }

  return {
    level: levelKey,
    levelLabel: level?.label || 'Unknown',
    role: userInfo.role,
    roleLabel: userInfo.fullName || userInfo.role,
    entityId,
    parentEntityId,
    region: orgContext.assignedRegion || orgContext.assignedRegionName,
    taxCenter: orgContext.assignedTaxCenter || orgContext.assignedTaxCenterName,
    teamId: orgContext.teamId,
    teamName: orgContext.teamName,
    auditType: orgContext.auditType,
    userId: userInfo.userId,
  };
}

// ============================================================
// 2. FEATURE VISIBILITY CHECKS
// ============================================================

/**
 * Check if a user can see a specific feature
 * 
 * @param {Object} userInfo - Auth user info
 * @param {string} feature - Feature name from FEATURE_VISIBILITY
 * @returns {string} Visibility scope: 'full', 'own_region', 'own_tax_center', 'none', etc.
 */
export function getFeatureScope(userInfo, feature) {
  if (!userInfo) return 'none';

  const level = getLevelForRole(userInfo.role);
  if (!level) return 'none';

  return getFeatureVisibility(feature, level.key);
}

/**
 * Check if a feature is visible at all to this user
 */
export function canViewFeature(userInfo, feature) {
  const scope = getFeatureScope(userInfo, feature);
  return scope !== 'none';
}

/**
 * Check if a user can view the risk engine
 */
export function canViewRiskEngine(userInfo) {
  return canViewFeature(userInfo, 'risk_engine');
}

/**
 * Check if a user can view configuration
 */
export function canViewConfiguration(userInfo) {
  return canViewFeature(userInfo, 'configuration');
}

/**
 * Check if a user can view a full report (vs restricted)
 */
export function canViewFullReport(userInfo) {
  const scope = getFeatureScope(userInfo, 'reports');
  return scope === 'full';
}

// ============================================================
// 3. DATA SCOPING
// ============================================================

/**
 * Scope plans data to what the user can see
 * 
 * @param {Array} plans - Full plans array
 * @param {Object} userInfo - Auth user info
 * @returns {Array} Filtered plans
 */
export function scopePlans(plans, userInfo) {
  if (!userInfo || !plans) return [];

  const context = getUserHierarchyContext(userInfo);

  // National sees all
  if (context.level === 'national') {
    return plans;
  }

  // Regional: plans routed to their region
  if (context.level === 'regional') {
    return plans.filter(plan => {
      // Check routing data
      if (plan.routing?.regions?.[context.entityId]) return true;
      // Check legacy allocation status
      if (plan.allocationStatus?.[context.entityId]) return true;
      // Check regionalAllocation field
      if (plan.regionalAllocation?.[context.entityId]) return true;
      return false;
    }).map(plan => {
      // Scrub: only show this region's data within the plan
      return scopePlanForRegion(plan, context.entityId);
    });
  }

  // Tax Center: plans routed to their tax center
  if (context.level === 'tax_center') {
    return plans.filter(plan => {
      if (plan.routing?.regions?.[context.region]?.taxCenters?.[context.entityId]) return true;
      if (plan.taxCenterAllocations?.[context.region]?.[context.entityId]) return true;
      return false;
    }).map(plan => {
      return scopePlanForTaxCenter(plan, context.region, context.entityId);
    });
  }

  // Team Leader: plans with cases for their team
  if (context.level === 'team_leader') {
    return plans.filter(plan => {
      if (plan.cases?.some?.(c => c.assignedTeam === context.entityId)) return true;
      if (plan.routing?.regions?.[context.region]?.taxCenters?.[context.taxCenter]?.teamLeaders?.[context.entityId]) return true;
      return false;
    });
  }

  // Auditor: plans with their assigned cases
  if (context.level === 'auditor') {
    return plans.filter(plan => {
      if (plan.cases?.some?.(c => c.assignedTo === context.userId)) return true;
      return false;
    });
  }

  return [];
}

/**
 * Scope a plan to only show data for a specific region
 */
export function scopePlanForRegion(plan, regionName) {
  if (!plan) return null;
  
  const scoped = { ...plan };

  // Only include this region's allocation
  if (scoped.regionalAllocation) {
    scoped.regionalAllocation = {
      [regionName]: scoped.regionalAllocation[regionName],
    };
  }

  // Only include this region's allocation status
  if (scoped.allocationStatus) {
    scoped.allocationStatus = {
      [regionName]: scoped.allocationStatus[regionName],
    };
  }

  // Only include this region's tax center allocations
  if (scoped.taxCenterAllocations) {
    scoped.taxCenterAllocations = {
      [regionName]: scoped.taxCenterAllocations[regionName],
    };
  }

  // Only include this region's routing subtree
  if (scoped.routing?.regions) {
    scoped.routing = {
      ...scoped.routing,
      regions: {
        [regionName]: scoped.routing.regions[regionName],
      },
    };
  }

  return scoped;
}

/**
 * Scope a plan to only show data for a specific tax center
 */
export function scopePlanForTaxCenter(plan, regionName, taxCenterName) {
  if (!plan) return null;

  const scoped = { ...plan };

  // Scope regional allocation to just this region
  if (scoped.regionalAllocation) {
    scoped.regionalAllocation = {
      [regionName]: scoped.regionalAllocation[regionName],
    };
  }

  // Scope tax center allocations to just this tax center
  if (scoped.taxCenterAllocations?.[regionName]) {
    scoped.taxCenterAllocations = {
      [regionName]: {
        [taxCenterName]: scoped.taxCenterAllocations[regionName][taxCenterName],
      },
    };
  }

  // Scope routing to just this tax center's subtree
  if (scoped.routing?.regions?.[regionName]) {
    scoped.routing = {
      ...scoped.routing,
      regions: {
        [regionName]: {
          ...scoped.routing.regions[regionName],
          taxCenters: {
            [taxCenterName]: scoped.routing.regions[regionName].taxCenters[taxCenterName],
          },
        },
      },
    };
  }

  // Only include region+taxCenter in allocation status
  if (scoped.allocationStatus) {
    scoped.allocationStatus = {
      [regionName]: scoped.allocationStatus[regionName]
        ? {
            ...scoped.allocationStatus[regionName],
            taxCenterReceipts: scoped.allocationStatus[regionName].taxCenterReceipts
              ? {
                  [taxCenterName]: scoped.allocationStatus[regionName].taxCenterReceipts[taxCenterName],
                }
              : {},
          }
        : undefined,
    };
  }

  return scoped;
}

// ============================================================
// 4. NAVIGATION / MENU FILTERING
// ============================================================

/**
 * Filter navigation items based on user's feature visibility
 * Removes items like "Risk Engine" from team_leader and auditor menus
 */
export function filterNavigationByVisibility(navCategories, userInfo) {
  if (!userInfo || !navCategories) return navCategories;

  // Map nav item IDs to feature names
  const navToFeature = {
    'risk-engine': 'risk_engine',
    'configuration': 'configuration',
    'reports': 'reports',
    'feedback-review': 'feedback',
    'tax-center-feedback': 'feedback',
  };

  return navCategories.map(category => ({
    ...category,
    items: category.items.filter(item => {
      const feature = navToFeature[item.id];
      if (!feature) return true; // Not a feature-gated item
      return canViewFeature(userInfo, feature);
    }),
  })).filter(category => category.items.length > 0);
}

// ============================================================
// 5. RISK ENGINE DATA SCOPING
// ============================================================

/**
 * Scope risk engine data to what the user can see
 */
export function scopeRiskEngineData(riskData, userInfo) {
  if (!riskData || !userInfo) return null;

  const context = getUserHierarchyContext(userInfo);

  switch (context.level) {
    case 'national':
      return riskData; // Full data

    case 'regional':
      // Only that region's data
      return {
        ...riskData,
        nationalSummary: undefined, // Remove national summary
        byRegion: riskData.byRegion
          ? { [context.entityId]: riskData.byRegion[context.entityId] }
          : {},
      };

    case 'tax_center':
      // Only that tax center's data
      return {
        ...riskData,
        nationalSummary: undefined,
        byRegion: undefined,
        byTaxCenter: riskData.byTaxCenter
          ? { [context.entityId]: riskData.byTaxCenter[context.entityId] }
          : {},
      };

    default:
      return null; // Not visible
  }
}

// ============================================================
// 6. DASHBOARD METRICS SCOPING
// ============================================================

/**
 * Scope dashboard metrics to the user's level
 */
export function scopeDashboardMetrics(metrics, userInfo) {
  if (!metrics || !userInfo) return null;

  const context = getUserHierarchyContext(userInfo);

  switch (context.level) {
    case 'national':
      return metrics;

    case 'regional':
      return {
        ...metrics,
        totalPlans: metrics.regionalPlans?.[context.entityId] || 0,
        totalCases: metrics.regionalCases?.[context.entityId] || 0,
        totalAuditors: metrics.regionalAuditors?.[context.entityId] || 0,
        completionRate: metrics.regionalCompletion?.[context.entityId] || 0,
      };

    case 'tax_center':
      return {
        ...metrics,
        totalPlans: metrics.tcPlans?.[context.entityId] || 0,
        totalCases: metrics.tcCases?.[context.entityId] || 0,
        totalAuditors: metrics.tcAuditors?.[context.entityId] || 0,
        completionRate: metrics.tcCompletion?.[context.entityId] || 0,
      };

    case 'team_leader':
      return {
        ...metrics,
        totalCases: metrics.teamCases?.[context.entityId] || 0,
        totalAuditors: metrics.teamAuditors?.[context.entityId] || 0,
        completionRate: metrics.teamCompletion?.[context.entityId] || 0,
      };

    case 'auditor':
      return {
        ...metrics,
        myCases: metrics.auditorCases?.[context.userId] || 0,
        myCompletionRate: metrics.auditorCompletion?.[context.userId] || 0,
      };

    default:
      return metrics;
  }
}
