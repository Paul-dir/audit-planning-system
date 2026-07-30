/**
 * INTELLIGENT CASE DISTRIBUTION ENGINE
 * 
 * Dynamically distributes audit cases to Team Leaders and Auditors based on:
 * 1. Multiple Team Leaders per Audit Type (not just one)
 * 2. Actual capacity of each Team Leader (10-15 cases per TL)
 * 3. Auditor availability and workload under each Team Leader
 * 4. Real-time routing to auditors based on their capacity
 * 5. Balanced load distribution across all available resources
 */

import { loadData } from './data';

// Configuration: Cases per Team Leader (configurable by audit type)
const CASES_PER_TEAM_LEADER = {
  'Desk Audit': 15,
  'desk_audit': 15,
  'Field Audit': 12,
  'field_audit': 12,
  'Joint Audit': 12,
  'joint_audit': 12,
  'Transfer Pricing': 10,
  'transfer_pricing': 10,
  'Comprehensive': 10,
  'comprehensive': 10,
  'Issue Audit': 15,
  'single_issue': 15,
  'forensic': 10
};

/**
 * Helper to normalize string for comparison
 */
function normalizeString(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/[\s_]+/g, '');
}

/**
 * Get Team Leaders for specific audit type in a tax center
 * Returns multiple Team Leaders if available with robust fallback & normalization
 */
export function getTeamLeadersForAuditType(taxCenter, auditType, data) {
  const targetType = normalizeString(auditType);
  const targetTC = normalizeString(taxCenter);
  
  let teamLeaders = [];
  if (data && data.teamLeaders) {
    teamLeaders = data.teamLeaders.filter(u => 
      (normalizeString(u.taxCenter) === targetTC || !targetTC) &&
      (normalizeString(u.auditType) === targetType || !targetType)
    );
  }

  console.log(`[Distribution] Found ${teamLeaders.length} Team Leaders for TC: "${taxCenter}" (Audit Type: "${auditType}")`);
  // Ensure we map fullName to full_name for compatibility
  return teamLeaders.map(tl => ({ ...tl, full_name: tl.fullName || tl.full_name }));
}

/**
 * Get auditors under a specific team leader
 */
export function getAuditorsUnderTeamLeader(teamLeaderId, data) {
  let auditors = [];
  if (data && data.auditors) {
    auditors = data.auditors.filter(a => a.teamLeaderId === teamLeaderId);
  }
  
  return auditors.map(a => ({ ...a, full_name: a.fullName || a.full_name }));
}

/**
 * Calculate current workload for a Team Leader
 * (Sum of all cases assigned to their auditors)
 */
export function calculateTeamLeaderWorkload(teamLeaderId, data) {
  const auditors = getAuditorsUnderTeamLeader(teamLeaderId, data);
  let totalWorkload = 0;

  auditors.forEach(auditor => {
    const auditorCases = (data.auditCases || []).filter(c =>
      c.status === 'ASSIGNED_TO_AUDITOR' &&
      c.assignedAuditorId === auditor.id
    );
    totalWorkload += auditorCases.length;
  });

  return totalWorkload;
}

/**
 * Calculate available capacity for Team Leader
 * maxCapacity = casesPerTL - currentWorkload
 */
export function getTeamLeaderAvailableCapacity(teamLeaderId, auditType, data) {
  const casesPerTL = CASES_PER_TEAM_LEADER[auditType] || 12;
  const currentWorkload = calculateTeamLeaderWorkload(teamLeaderId, data);
  const available = casesPerTL - currentWorkload;

  return Math.max(0, available);
}

/**
 * Get best available auditor under a team leader
 * Considers: workload, skills, seniority
 */
export function getBestAvailableAuditor(teamLeaderId, data) {
  const auditors = getAuditorsUnderTeamLeader(teamLeaderId, data);
  
  // Calculate workload for each auditor
  const auditorLoads = auditors.map(auditor => {
    const assignedCases = (data.auditCases || []).filter(c =>
      c.status === 'ASSIGNED_TO_AUDITOR' &&
      c.assignedAuditorId === auditor.id
    );
    
    return {
      auditor,
      currentWorkload: assignedCases.length,
      maxCapacity: 6, // Default auditor capacity
      available: 6 - assignedCases.length
    };
  });

  // Sort by lowest workload (most available)
  const sorted = auditorLoads.sort((a, b) => a.currentWorkload - b.currentWorkload);

  if (sorted.length > 0 && sorted[0].available > 0) {
    return sorted[0].auditor;
  }

  return null; // No available auditors
}

/**
 * MAIN: Intelligently distribute cases to Team Leaders and Auditors
 * This replaces the simple batch assignment
 */
export function intelligentDistributeCases(selectedCaseIds, data, userInfo) {
  console.log('=== INTELLIGENT CASE DISTRIBUTION START ===');
  
  if (!data.assignments) data.assignments = [];
  if (!data.auditCases) return [];

  const casesToProcess = selectedCaseIds
    .map(caseId => data.auditCases.find(c => c.id === caseId))
    .filter(c => c !== null)
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)); // Sort by risk score

  // Group cases by audit type for batch processing
  const casesByAuditType = {};
  casesToProcess.forEach(auditCase => {
    const type = auditCase.auditType;
    if (!casesByAuditType[type]) {
      casesByAuditType[type] = [];
    }
    casesByAuditType[type].push(auditCase);
  });

  const summaryList = [];

  // Process each audit type group
  Object.entries(casesByAuditType).forEach(([auditType, typedCases]) => {
    const region = typedCases[0]?.region;
    const taxCenter = typedCases[0]?.taxCenter;

    console.log(`\n[Distribution] Processing ${typedCases.length} cases of type "${auditType}" in ${taxCenter}`);

    // Get ALL available Team Leaders for this audit type
    const teamLeaders = getTeamLeadersForAuditType(taxCenter, auditType, data);
    
    if (teamLeaders.length === 0) {
      console.warn(`⚠️ No Team Leaders found for ${taxCenter} - ${auditType}`);
      return;
    }

    console.log(`[Distribution] Found ${teamLeaders.length} Team Leaders for distribution`);

    // Create TL assignment tracker
    const tlTracker = teamLeaders.map(tl => ({
      teamLeader: tl,
      assignedCases: [],
      capacity: CASES_PER_TEAM_LEADER[auditType] || 12
    }));

    // Distribute cases to Team Leaders with lowest workload
    typedCases.forEach((auditCase, index) => {
      // Find TL with most available capacity
      const bestTL = tlTracker.reduce((best, current) => {
        const currentAvailable = current.capacity - current.assignedCases.length;
        const bestAvailable = best.capacity - best.assignedCases.length;
        return currentAvailable > bestAvailable ? current : best;
      });

      if (!bestTL) {
        console.warn(`⚠️ No capacity available for case ${auditCase.id}`);
        return;
      }

      // ===== STEP 1: Assign case to Team Leader =====
      const caseIdx = data.auditCases.findIndex(c => c.id === auditCase.id);
      data.auditCases[caseIdx].priorityRank = index + 1;
      data.auditCases[caseIdx].storageStatus = 'STORED';
      data.auditCases[caseIdx].storedDate = new Date().toISOString();
      data.auditCases[caseIdx].storedBy = userInfo?.fullName || 'Process Owner';
      data.auditCases[caseIdx].assignedTeamLeader = bestTL.teamLeader.full_name;
      data.auditCases[caseIdx].assignedTeamLeaderId = bestTL.teamLeader.id;
      data.auditCases[caseIdx].status = 'ASSIGNED_TO_TEAM_LEADER';

      // ===== STEP 2: Find best auditor under this Team Leader =====
      const bestAuditor = getBestAvailableAuditor(bestTL.teamLeader.id, data);
      
      if (bestAuditor) {
        // Route directly to auditor if available
        data.auditCases[caseIdx].assignedAuditor = bestAuditor.full_name;
        data.auditCases[caseIdx].assignedAuditorId = bestAuditor.id;
        data.auditCases[caseIdx].status = 'ASSIGNED_TO_AUDITOR'; // Skip Team Leader, go straight to Auditor
        data.auditCases[caseIdx].routedToAuditorDate = new Date().toISOString();
        
        console.log(`  ✅ Case ${auditCase.id}: TL=${bestTL.teamLeader.full_name} → Auditor=${bestAuditor.full_name}`);
      } else {
        // Stay at Team Leader if no auditors available
        console.log(`  ⚠️ Case ${auditCase.id}: Assigned to TL=${bestTL.teamLeader.full_name} (no auditors available)`);
      }

      // ===== STEP 3: Create Assignment Record =====
      const assignmentHistory = [
        {
          state: 'ASSIGNED_TO_TEAM_LEADER',
          date: new Date().toISOString(),
          byUser: userInfo?.id || 'PROCESS_OWNER',
          notes: `Auto-assigned by Process Owner (Rank ${index + 1})`
        }
      ];

      if (bestAuditor) {
        assignmentHistory.push({
          state: 'ASSIGNED_TO_AUDITOR',
          date: new Date().toISOString(),
          byUser: bestTL.teamLeader.id,
          notes: `Auto-routed to Auditor by system (TL: ${bestTL.teamLeader.full_name})`
        });
      }

      const newAssignment = {
        id: `ASN-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        caseId: auditCase.id,
        region,
        taxCenter,
        auditType,
        currentState: bestAuditor ? 'ASSIGNED_TO_AUDITOR' : 'ASSIGNED_TO_TEAM_LEADER',
        currentOwner: bestAuditor ? bestAuditor.id : bestTL.teamLeader.id,
        currentOwnerRole: bestAuditor ? 'AUDITOR' : 'TEAM_LEADER',
        teamLeaderId: bestTL.teamLeader.id,
        teamLeaderName: bestTL.teamLeader.full_name,
        auditorId: bestAuditor?.id || null,
        auditorName: bestAuditor?.full_name || null,
        history: assignmentHistory
      };

      const existingAssignmentIdx = data.assignments.findIndex(a => a.caseId === auditCase.id);
      if (existingAssignmentIdx >= 0) {
        data.assignments[existingAssignmentIdx] = newAssignment;
      } else {
        data.assignments.push(newAssignment);
      }

      // Track case in TL tracker
      bestTL.assignedCases.push(auditCase.id);

      // Add to summary
      summaryList.push({
        caseId: auditCase.id,
        rank: index + 1,
        auditType,
        teamLeader: bestTL.teamLeader.full_name,
        teamLeaderId: bestTL.teamLeader.id,
        auditor: bestAuditor?.full_name || '(Pending)',
        auditorId: bestAuditor?.id || null,
        status: bestAuditor ? 'ROUTED_TO_AUDITOR' : 'AWAITING_AUDITOR',
        teamName: bestTL.teamLeader.org_context?.teamName || `${taxCenter} Team`
      });
    });

    // Log TL summary
    console.log(`\n[Distribution] Team Leader Summary for ${auditType}:`);
    tlTracker.forEach(tl => {
      const utilization = ((tl.assignedCases.length / tl.capacity) * 100).toFixed(1);
      console.log(`  TL: ${tl.teamLeader.full_name}`);
      console.log(`    Cases assigned: ${tl.assignedCases.length}/${tl.capacity} (${utilization}% utilization)`);
    });
  });

  console.log('=== INTELLIGENT CASE DISTRIBUTION END ===');
  return summaryList;
}

/**
 * Get real-time distribution statistics
 */
export function getDistributionStats(data) {
  const teamLeaders = data?.teamLeaders || [];
  
  const stats = {
    totalTeamLeaders: teamLeaders.length,
    teamLeaderWorkload: {}
  };

  teamLeaders.forEach(tl => {
    const workload = calculateTeamLeaderWorkload(tl.id, data);
    const auditType = tl.auditType;
    const taxCenter = tl.taxCenter;
    const key = `${taxCenter}-${auditType}`;

    if (!stats.teamLeaderWorkload[key]) {
      stats.teamLeaderWorkload[key] = [];
    }

    stats.teamLeaderWorkload[key].push({
      teamLeader: tl.fullName || tl.full_name,
      id: tl.id,
      currentWorkload: workload,
      maxCapacity: CASES_PER_TEAM_LEADER[auditType] || 12,
      utilizationPercent: ((workload / (CASES_PER_TEAM_LEADER[auditType] || 12)) * 100).toFixed(1)
    });
  });

  return stats;
}

/**
 * Dynamically re-route cases based on current capacity
 * Called when an auditor becomes available or workload changes
 */
export function dynamicRerouteIfNeeded(data) {
  console.log('[Dynamic Routing] Checking for re-routing opportunities...');
  
  // Find cases stuck at Team Leader level waiting for auditor
  const pendingCases = (data.auditCases || []).filter(c =>
    c.status === 'ASSIGNED_TO_TEAM_LEADER' &&
    c.storageStatus === 'STORED'
  );

  let rerouted = 0;

  pendingCases.forEach(auditCase => {
    const bestAuditor = getBestAvailableAuditor(auditCase.assignedTeamLeaderId, data);
    
    if (bestAuditor && bestAuditor.id !== auditCase.assignedAuditorId) {
      // Available auditor found! Route the case
      auditCase.assignedAuditor = bestAuditor.full_name;
      auditCase.assignedAuditorId = bestAuditor.id;
      auditCase.status = 'ASSIGNED_TO_AUDITOR';
      auditCase.routedToAuditorDate = new Date().toISOString();
      
      // Update assignment record
      const assignment = data.assignments.find(a => a.caseId === auditCase.id);
      if (assignment) {
        assignment.currentState = 'ASSIGNED_TO_AUDITOR';
        assignment.currentOwner = bestAuditor.id;
        assignment.currentOwnerRole = 'AUDITOR';
        assignment.auditorId = bestAuditor.id;
        assignment.auditorName = bestAuditor.full_name;
        assignment.history.push({
          state: 'ASSIGNED_TO_AUDITOR',
          date: new Date().toISOString(),
          byUser: 'SYSTEM',
          notes: `Auto-routed to available Auditor: ${bestAuditor.full_name}`
        });
      }

      rerouted++;
      console.log(`[Dynamic Routing] ✅ Case ${auditCase.id} routed to ${bestAuditor.full_name}`);
    }
  });

  console.log(`[Dynamic Routing] Re-routed ${rerouted} cases to available auditors`);
  return rerouted;
}

/**
 * Export configuration constants
 */
export const DISTRIBUTION_CONFIG = {
  CASES_PER_TEAM_LEADER,
  DEFAULT_AUDITOR_CAPACITY: 6,
  MULTIPLE_TLS_PER_TYPE: true,
  DYNAMIC_ROUTING_ENABLED: true
};
