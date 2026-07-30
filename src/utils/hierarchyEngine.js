/**
 * ============================================================
 * HIERARCHY ROUTING ENGINE
 * ============================================================
 * 
 * Core engine for routing plans through the organizational
 * hierarchy: National → Region → Tax Center → Team Leader → Auditor.
 *
 * This engine handles:
 *   - Creating route instances when a plan moves between levels
 *   - Tracking state transitions per route
 *   - Ensuring each level receives only its own data
 *   - Aggregating status across all routes at a given level
 *   - Data isolation between parallel routes
 *
 * Each plan that enters the hierarchy creates MULTIPLE route instances:
 *   - 1 per region (from national)
 *   - 1 per tax center per region (from each region)
 *   - 1 per team leader per tax center (from each tax center)
 *   - 1 per auditor per team leader (from each team leader)
 */

import { loadData, saveData } from './data';
import { generateRouteId } from './orgIdentifier';
import { PLAN_ROUTING_STATES, HIERARCHY_LEVELS, ROUTING_CHAIN } from '../config/hierarchyConfig';

// ============================================================
// 1. ROUTE INSTANCE MANAGEMENT
// ============================================================

/**
 * Create route instances when a plan is sent from one level to the next.
 * This creates SEPARATE route instances for EACH child entity.
 *
 * Example: When national sends a plan to regions, one route instance
 * is created per region — each with its own state.
 *
 * @param {string} planId - The plan being routed
 * @param {string} fromLevel - 'national', 'regional', 'tax_center', or 'team_leader'
 * @param {string} toLevel - 'regional', 'tax_center', 'team_leader', or 'auditor'
 * @param {Array} targetIds - Array of target entity IDs (e.g., region names)
 * @param {Object} payload - Data to carry with the route (e.g., allocation details)
 * @returns {Array} Created route objects
 */
export function createRouteInstances(planId, fromLevel, toLevel, targetIds, payload = {}) {
  if (!Array.isArray(targetIds) || targetIds.length === 0) {
    console.warn(`[HierarchyEngine] No targets provided for routing ${planId} ${fromLevel}→${toLevel}`);
    return [];
  }

  const data = loadData();
  if (!data.routeInstances) {
    data.routeInstances = [];
  }

  const createdRoutes = [];
  const initialState = getInitialState(fromLevel, toLevel);

  targetIds.forEach((targetId) => {
    const routeId = generateRouteId(planId, fromLevel, toLevel, targetId);

    // Prevent duplicate route creation
    const existing = data.routeInstances.find(r => r.routeId === routeId);
    if (existing) {
      console.log(`[HierarchyEngine] Route ${routeId} already exists, skipping`);
      createdRoutes.push(existing);
      return;
    }

    const route = {
      routeId,
      planId,
      fromLevel,
      toLevel,
      targetId,
      state: initialState,
      stateHistory: [
        {
          state: initialState,
          timestamp: new Date().toISOString(),
          action: 'CREATE',
          actor: fromLevel,
        },
      ],
      payload: {
        ...payload,
        routedAt: new Date().toISOString(),
      },
      currentOwner: targetId,
      // Metadata for traceability
      metadata: {
        createdBy: fromLevel,
        currentLevel: toLevel,
        isTerminal: toLevel === 'auditor',
      },
    };

    data.routeInstances.push(route);
    createdRoutes.push(route);
    console.log(`[HierarchyEngine] Created route ${routeId}: ${fromLevel}→${toLevel} (${initialState})`);
  });

  saveData(data);
  return createdRoutes;
}

/**
 * Transition a single route instance to a new state
 */
export function transitionRoute(routeId, newState, actor, notes = '') {
  const data = loadData();
  if (!data.routeInstances) {
    console.warn(`[HierarchyEngine] No route instances found`);
    return null;
  }

  const routeIndex = data.routeInstances.findIndex(r => r.routeId === routeId);
  if (routeIndex === -1) {
    console.warn(`[HierarchyEngine] Route ${routeId} not found`);
    return null;
  }

  const route = data.routeInstances[routeIndex];
  const oldState = route.state;

  // Validate transition
  if (!isValidTransition(oldState, newState)) {
    console.warn(`[HierarchyEngine] Invalid transition: ${oldState} → ${newState} for route ${routeId}`);
    return null;
  }

  route.state = newState;
  route.stateHistory.push({
    state: newState,
    timestamp: new Date().toISOString(),
    action: 'TRANSITION',
    actor,
    notes,
    previousState: oldState,
  });

  data.routeInstances[routeIndex] = route;
  saveData(data);

  console.log(`[HierarchyEngine] Route ${routeId}: ${oldState} → ${newState} (by ${actor})`);
  return route;
}

/**
 * Transition all routes for a plan at a specific level
 * e.g., accept ALL tax center routes for a region
 */
export function transitionAllRoutes(planId, fromLevel, toLevel, targetIds, newState, actor, notes = '') {
  const targets = Array.isArray(targetIds) ? targetIds : [targetIds];
  const results = [];

  targets.forEach((targetId) => {
    const routeId = generateRouteId(planId, fromLevel, toLevel, targetId);
    const result = transitionRoute(routeId, newState, actor, notes);
    if (result) results.push(result);
  });

  return results;
}

// ============================================================
// 2. ROUTE QUERIES
// ============================================================

/**
 * Get all routes for a plan, optionally filtered by level
 */
export function getRoutesForPlan(planId, level = null) {
  const data = loadData();
  if (!data.routeInstances) return [];

  let routes = data.routeInstances.filter(r => r.planId === planId);
  if (level) {
    routes = routes.filter(r => r.toLevel === level || r.fromLevel === level);
  }
  return routes;
}

/**
 * Get routes going TO a specific target (region, tax center, etc.)
 */
export function getRoutesToTarget(targetId, level = null) {
  const data = loadData();
  if (!data.routeInstances) return [];

  let routes = data.routeInstances.filter(r => r.targetId === targetId);
  if (level) {
    routes = routes.filter(r => r.toLevel === level);
  }
  return routes;
}

/**
 * Get routes owned by a specific target (what they have received)
 */
export function getRoutesOwnedBy(targetId) {
  const data = loadData();
  if (!data.routeInstances) return [];
  return data.routeInstances.filter(r => r.currentOwner === targetId);
}

/**
 * Get plans that have been routed to a specific entity
 */
export function getPlansRoutedToTarget(targetId, data, level = null) {
  if (!data.routeInstances) return [];
  
  let routes = data.routeInstances.filter(r => r.targetId === targetId);
  if (level) {
    routes = routes.filter(r => r.toLevel === level);
  }
  
  // Resolve plan details
  return routes.map(r => ({
    ...r,
    plan: data.plans?.find(p => p.id === r.planId) || null,
  }));
}

/**
 * Get all routes for a plan from a specific source level
 */
export function getRoutesFromLevel(planId, fromLevel) {
  const data = loadData();
  if (!data.routeInstances) return [];
  return data.routeInstances.filter(r => r.planId === planId && r.fromLevel === fromLevel);
}

/**
 * Check if all routes from a level have reached a terminal state
 * Used to determine if a plan can progress to the next stage
 */
export function areAllRoutesComplete(planId, fromLevel, terminalStates = [PLAN_ROUTING_STATES.REGION_ACCEPTED, PLAN_ROUTING_STATES.TC_ACCEPTED, PLAN_ROUTING_STATES.TL_ACCEPTED, PLAN_ROUTING_STATES.AUDITOR_COMPLETED]) {
  const routes = getRoutesFromLevel(planId, fromLevel);
  if (routes.length === 0) return false;
  return routes.every(r => terminalStates.includes(r.state));
}

/**
 * Get aggregate routing status for a plan across all levels
 */
export function getPlanRoutingSummary(planId) {
  const data = loadData();
  if (!data.routeInstances) return {};

  const allRoutes = data.routeInstances.filter(r => r.planId === planId);

  return {
    totalRoutes: allRoutes.length,
    byLevel: {
      regional: allRoutes.filter(r => r.toLevel === 'regional').length,
      tax_center: allRoutes.filter(r => r.toLevel === 'tax_center').length,
      team_leader: allRoutes.filter(r => r.toLevel === 'team_leader').length,
      auditor: allRoutes.filter(r => r.toLevel === 'auditor').length,
    },
    byState: {
      pending: allRoutes.filter(r => r.state.includes('PENDING')).length,
      received: allRoutes.filter(r => r.state.includes('RECEIVED')).length,
      accepted: allRoutes.filter(r => r.state.includes('ACCEPTED')).length,
      assigned: allRoutes.filter(r => r.state.includes('ASSIGNED')).length,
      executing: allRoutes.filter(r => r.state.includes('EXECUTION') || r.state.includes('ASSIGNED')).length,
      completed: allRoutes.filter(r => r.state.includes('COMPLETED')).length,
      rejected: allRoutes.filter(r => r.state.includes('REJECTED')).length,
    },
  };
}

// ============================================================
// 3. PLAN ROUTING ORCHESTRATION
// ============================================================

/**
 * Route a plan from national level to all regions.
 * Creates SEPARATE route instances for EACH region.
 *
 * @param {string} planId
 * @param {Array} regionNames - List of region names to route to
 * @param {Object} allocations - Regional allocation data per region
 */
export function routePlanToRegions(planId, regionNames, allocations = {}) {
  console.log(`[HierarchyEngine] Routing plan ${planId} to ${regionNames.length} regions`);
  
  const data = loadData();
  const plan = data.plans?.find(p => p.id === planId);
  if (!plan) {
    console.error(`[HierarchyEngine] Plan ${planId} not found`);
    return [];
  }

  // Initialize routing structure on plan if not present
  if (!plan.routing) {
    plan.routing = {};
  }
  if (!plan.routing.regions) {
    plan.routing.regions = {};
  }

  // Create route instances for each region
  const routes = createRouteInstances(
    planId,
    'national',
    'regional',
    regionNames,
    { allocations }
  );

  // Update plan's routing status
  regionNames.forEach((regionName) => {
    if (!plan.routing.regions[regionName]) {
      plan.routing.regions[regionName] = {};
    }
    plan.routing.regions[regionName] = {
      status: PLAN_ROUTING_STATES.REGION_PENDING,
      regionName,
      routedAt: new Date().toISOString(),
      taxCenters: {},
      totalAllocation: allocations[regionName] || {},
    };
  });

  plan.routing.status = 'ROUTED_TO_REGIONS';
  saveData(data);
  
  return routes;
}

/**
 * Route a plan from a region to its tax centers.
 * Creates SEPARATE route instances for EACH tax center.
 */
export function routePlanToTaxCenters(planId, regionName, taxCenterNames, allocations = {}) {
  console.log(`[HierarchyEngine] Routing plan ${planId} from ${regionName} to ${taxCenterNames.length} tax centers`);

  const data = loadData();
  const plan = data.plans?.find(p => p.id === planId);
  if (!plan) {
    console.error(`[HierarchyEngine] Plan ${planId} not found`);
    return [];
  }

  // Initialize routing for this region
  if (!plan.routing) plan.routing = {};
  if (!plan.routing.regions) plan.routing.regions = {};
  if (!plan.routing.regions[regionName]) plan.routing.regions[regionName] = {};
  if (!plan.routing.regions[regionName].taxCenters) plan.routing.regions[regionName].taxCenters = {};

  // Create route instances for each tax center
  const routes = createRouteInstances(
    planId,
    'regional',
    'tax_center',
    taxCenterNames,
    { allocations, regionName }
  );

  // Update plan routing
  taxCenterNames.forEach((tcName) => {
    plan.routing.regions[regionName].taxCenters[tcName] = {
      status: PLAN_ROUTING_STATES.TC_PENDING,
      taxCenter: tcName,
      routedAt: new Date().toISOString(),
      teamLeaders: {},
      allocation: allocations[tcName] || {},
    };
  });

  plan.routing.regions[regionName].status = 'ROUTED_TO_TAX_CENTERS';
  saveData(data);
  
  return routes;
}

/**
 * Route a plan from a tax center to its team leaders.
 * Creates SEPARATE route instances for EACH team leader (by audit type).
 */
export function routePlanToTeamLeaders(planId, regionName, taxCenterName, teamLeaderIds, allocations = {}) {
  console.log(`[HierarchyEngine] Routing plan ${planId} from ${taxCenterName} to ${teamLeaderIds.length} team leaders`);

  const data = loadData();
  const plan = data.plans?.find(p => p.id === planId);
  if (!plan) {
    console.error(`[HierarchyEngine] Plan ${planId} not found`);
    return [];
  }

  if (!plan.routing) plan.routing = {};
  if (!plan.routing.regions) plan.routing.regions = {};
  if (!plan.routing.regions[regionName]) plan.routing.regions[regionName] = {};
  if (!plan.routing.regions[regionName].taxCenters) plan.routing.regions[regionName].taxCenters = {};
  if (!plan.routing.regions[regionName].taxCenters[taxCenterName]) {
    plan.routing.regions[regionName].taxCenters[taxCenterName] = {};
  }
  if (!plan.routing.regions[regionName].taxCenters[taxCenterName].teamLeaders) {
    plan.routing.regions[regionName].taxCenters[taxCenterName].teamLeaders = {};
  }

  const routes = createRouteInstances(
    planId,
    'tax_center',
    'team_leader',
    teamLeaderIds,
    { allocations, regionName, taxCenterName }
  );

  teamLeaderIds.forEach((tlId) => {
    plan.routing.regions[regionName].taxCenters[taxCenterName].teamLeaders[tlId] = {
      status: PLAN_ROUTING_STATES.TL_PENDING,
      teamLeaderId: tlId,
      routedAt: new Date().toISOString(),
      auditors: {},
      allocation: allocations[tlId] || {},
    };
  });

  plan.routing.regions[regionName].taxCenters[taxCenterName].status = 'ROUTED_TO_TEAM_LEADERS';
  saveData(data);
  
  return routes;
}

/**
 * Assign cases from team leader to auditors.
 * Creates SEPARATE route instances for EACH auditor.
 */
export function assignToAuditors(planId, regionName, taxCenterName, teamLeaderId, auditorIds, cases = {}) {
  console.log(`[HierarchyEngine] Assigning cases from TL ${teamLeaderId} to ${auditorIds.length} auditors`);

  const data = loadData();
  const plan = data.plans?.find(p => p.id === planId);
  if (!plan) {
    console.error(`[HierarchyEngine] Plan ${planId} not found`);
    return [];
  }

  const routes = createRouteInstances(
    planId,
    'team_leader',
    'auditor',
    auditorIds,
    { cases, regionName, taxCenterName, teamLeaderId }
  );

  // Update plan routing tree
  if (plan.routing?.regions?.[regionName]?.taxCenters?.[taxCenterName]?.teamLeaders?.[teamLeaderId]) {
    const tlNode = plan.routing.regions[regionName].taxCenters[taxCenterName].teamLeaders[teamLeaderId];
    auditorIds.forEach((audId) => {
      if (!tlNode.auditors) tlNode.auditors = {};
      tlNode.auditors[audId] = {
        status: PLAN_ROUTING_STATES.AUDITOR_ASSIGNED,
        assignedAt: new Date().toISOString(),
        cases: cases[audId] || [],
      };
    });
    tlNode.status = 'ASSIGNED_TO_AUDITORS';
  }

  saveData(data);
  return routes;
}

// ============================================================
// 4. STATE TRANSITION VALIDATION
// ============================================================

/**
 * Valid state transitions per routing step
 */
const VALID_TRANSITIONS = {
  // National → Region
  [PLAN_ROUTING_STATES.REGION_PENDING]: [PLAN_ROUTING_STATES.REGION_RECEIVED, PLAN_ROUTING_STATES.REGION_REJECTED],
  [PLAN_ROUTING_STATES.REGION_RECEIVED]: [PLAN_ROUTING_STATES.REGION_ACCEPTED, PLAN_ROUTING_STATES.REGION_REJECTED],
  [PLAN_ROUTING_STATES.REGION_ACCEPTED]: [PLAN_ROUTING_STATES.TC_PENDING],
  
  // Region → Tax Center
  [PLAN_ROUTING_STATES.TC_PENDING]: [PLAN_ROUTING_STATES.TC_RECEIVED, PLAN_ROUTING_STATES.TC_REJECTED],
  [PLAN_ROUTING_STATES.TC_RECEIVED]: [PLAN_ROUTING_STATES.TC_ACCEPTED, PLAN_ROUTING_STATES.TC_REJECTED],
  [PLAN_ROUTING_STATES.TC_ACCEPTED]: [PLAN_ROUTING_STATES.TL_PENDING],
  
  // Tax Center → Team Leader
  [PLAN_ROUTING_STATES.TL_PENDING]: [PLAN_ROUTING_STATES.TL_RECEIVED],
  [PLAN_ROUTING_STATES.TL_RECEIVED]: [PLAN_ROUTING_STATES.TL_ACCEPTED],
  [PLAN_ROUTING_STATES.TL_ACCEPTED]: [PLAN_ROUTING_STATES.AUDITOR_ASSIGNED],
  
  // Team Leader → Auditor
  [PLAN_ROUTING_STATES.AUDITOR_ASSIGNED]: [PLAN_ROUTING_STATES.AUDITOR_ACCEPTED],
  [PLAN_ROUTING_STATES.AUDITOR_ACCEPTED]: [PLAN_ROUTING_STATES.AUDITOR_IN_EXECUTION],
  [PLAN_ROUTING_STATES.AUDITOR_IN_EXECUTION]: [PLAN_ROUTING_STATES.AUDITOR_COMPLETED],
  
  // Rejection (can go from any acceptance state back)
  [PLAN_ROUTING_STATES.REGION_REJECTED]: [PLAN_ROUTING_STATES.REGION_PENDING],
  [PLAN_ROUTING_STATES.TC_REJECTED]: [PLAN_ROUTING_STATES.TC_PENDING],
};

function isValidTransition(oldState, newState) {
  const allowed = VALID_TRANSITIONS[oldState];
  if (!allowed) return false;
  return allowed.includes(newState);
}

function getInitialState(fromLevel, toLevel) {
  const chainLink = ROUTING_CHAIN.find(c => c.from === fromLevel && c.to === toLevel);
  if (!chainLink) return null;

  switch (toLevel) {
    case 'regional': return PLAN_ROUTING_STATES.REGION_PENDING;
    case 'tax_center': return PLAN_ROUTING_STATES.TC_PENDING;
    case 'team_leader': return PLAN_ROUTING_STATES.TL_PENDING;
    case 'auditor': return PLAN_ROUTING_STATES.AUDITOR_ASSIGNED;
    default: return null;
  }
}

// ============================================================
// 5. DATA ISOLATION — get data scoped to current user's level
// ============================================================

/**
 * Get plans visible to a specific level/entity
 * - National: all plans
 * - Regional: plans routed to that region
 * - Tax Center: plans routed to that tax center
 * - Team Leader: plans with cases assigned to that team
 * - Auditor: plans with cases assigned to that auditor
 */
export function getPlansForLevel(data, userLevel, entityId) {
  if (!data || !data.plans) return [];
  
  // National sees all plans
  if (userLevel === 'national') {
    return data.plans;
  }

  // For lower levels, filter by routes
  if (!data.routeInstances) return [];

  const relevantRouteIds = data.routeInstances
    .filter(r => r.targetId === entityId && r.toLevel === userLevel)
    .map(r => r.planId);

  return data.plans.filter(p => relevantRouteIds.includes(p.id));
}

/**
 * Get cases visible to the user based on their level and identity
 */
export function getCasesForLevel(data, userLevel, entityId, teamLeaderId = null) {
  if (!data || !data.cases) return [];

  // National sees all cases
  if (userLevel === 'national') {
    return data.cases;
  }

  // Regional: cases in that region
  if (userLevel === 'regional') {
    return data.cases.filter(c => c.region === entityId);
  }

  // Tax Center: cases in that tax center
  if (userLevel === 'tax_center') {
    return data.cases.filter(c => c.taxCenter === entityId);
  }

  // Team Leader: cases for that team (by audit type)
  if (userLevel === 'team_leader') {
    return data.cases.filter(c => c.assignedTeam === entityId);
  }

  // Auditor: own cases
  if (userLevel === 'auditor') {
    return data.cases.filter(c => c.assignedTo === entityId);
  }

  return [];
}
