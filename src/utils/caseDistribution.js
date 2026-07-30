/**
 * Hierarchical Case Distribution System
 * 
 * PROBLEM: Cases were being sent to ONE Team Leader regardless of audit type
 * SOLUTION: Filter by audit type BEFORE assigning to Team Leaders
 * 
 * Maintains consistency with Plan distribution logic:
 * National → Region → Tax Center → [Group by Audit Type] → Team Leaders of that type
 */

import { loadData } from './data';
import { getAllUsers } from '../data/orgStructure';

/**
 * MAIN ENTRY POINT: Cascade plan to team leaders hierarchically by audit type
 * 
 * This function:
 * 1. Groups cases by audit type
 * 2. For each audit type, finds appropriate Team Leaders
 * 3. Distributes cases intelligently by load balancing
 * 
 * @param {string} taxCenter - Tax center name
 * @param {string} region - Region name
 * @returns {object} Distribution summary with stats
 */
export function cascadePlanToTeamLeadersByAuditType(taxCenter, region) {
  try {
    console.log('📋 [CASCADE] Starting hierarchical distribution');
    console.log(`   Tax Center: ${taxCenter}, Region: ${region}`);
    
    // STEP 1: Load all unassigned cases for this tax center
    const data = loadData();
    const allCases = (data.auditCases || []).filter(c =>
      c.status === 'PENDING_PROCESS_OWNER' &&
      c.taxCenter === taxCenter &&
      c.region === region
    );
    
    console.log(`✅ Step 1: Loaded ${allCases.length} unassigned cases`);
    
    if (allCases.length === 0) {
      console.warn('⚠️  No cases to distribute');
      return { success: false, message: 'No unassigned cases found' };
    }
    
    // STEP 2: GROUP CASES BY AUDIT TYPE (THE KEY!)
    const casesByAuditType = {};
    allCases.forEach(auditCase => {
      if (!casesByAuditType[auditCase.auditType]) {
        casesByAuditType[auditCase.auditType] = [];
      }
      casesByAuditType[auditCase.auditType].push(auditCase);
    });
    
    console.log(`✅ Step 2: Grouped into audit types:`, 
      Object.entries(casesByAuditType).map(
        ([type, cases]) => `${type}(${cases.length})`
      ).join(', ')
    );
    
    // STEP 3: For EACH audit type, distribute to Team Leaders of THAT type only
    const distributionSummary = [];
    
    for (const auditType in casesByAuditType) {
      const casesForThisType = casesByAuditType[auditType];
      
      console.log(`\n🔄 Processing audit type: ${auditType} (${casesForThisType.length} cases)`);
      
      // Get Team Leaders for THIS audit type ONLY
      const teamLeadersForThisType = getTeamLeadersForAuditType(
        region,
        taxCenter,
        auditType
      );
      
      console.log(`   Found ${teamLeadersForThisType.length} Team Leaders for ${auditType}`);
      
      if (teamLeadersForThisType.length === 0) {
        console.warn(`   ⚠️  NO Team Leaders available for ${auditType}!`);
        console.warn(`   Cases will remain unassigned`);
        continue;
      }
      
      // Distribute cases to these Team Leaders intelligently
      const tlDistribution = distributeToTeamLeadersIntelligently(
        casesForThisType,
        teamLeadersForThisType,
        auditType,
        taxCenter,
        region
      );
      
      // Record for summary
      distributionSummary.push({
        auditType,
        totalCases: casesForThisType.length,
        teamLeaderCount: teamLeadersForThisType.length,
        assignedCases: tlDistribution.length,
        assignments: tlDistribution
      });
      
      console.log(`   ✅ Assigned ${tlDistribution.length}/${casesForThisType.length} cases`);
    }
    
    console.log(`\n✅ [CASCADE] Hierarchical distribution complete`);
    return { 
      success: true, 
      summary: distributionSummary,
      totalCases: allCases.length,
      totalAssigned: distributionSummary.reduce((sum, s) => sum + s.assignedCases, 0)
    };
    
  } catch (error) {
    console.error('❌ [CASCADE] Error in hierarchical distribution:', error);
    throw error;
  }
}

/**
 * Get Team Leaders for a SPECIFIC audit type
 * 
 * This ensures we only get Team Leaders who specialize in the given audit type
 * 
 * Example:
 * - Input: region='Addis Ababa', taxCenter='AA-TC1', auditType='desk_audit'
 * - Returns: [TL-Desk-1, TL-Desk-2] but NOT TL-Field-1 or TL-Joint-1
 * 
 * @param {string} region - Region name
 * @param {string} taxCenter - Tax center name
 * @param {string} auditType - Specific audit type
 * @returns {array} Team Leaders for this audit type
 */
export function getTeamLeadersForAuditType(region, taxCenter, auditType) {
  try {
    const allUsers = getAllUsers();
    
    const teamLeadersForType = allUsers.filter(u => 
      u.role === 'team_leader' &&
      u.org_context?.assignedRegion === region &&
      u.org_context?.assignedTaxCenter === taxCenter &&
      u.org_context?.auditType === auditType  // ← KEY FILTER
    );
    
    console.log(`  ℹ️  Found ${teamLeadersForType.length} Team Leaders for ${auditType} in ${taxCenter}`);
    
    return teamLeadersForType;
  } catch (error) {
    console.error(`  ❌ Error getting Team Leaders for ${auditType}:`, error);
    return [];
  }
}

/**
 * Intelligently distribute cases to Team Leaders
 * 
 * Algorithm:
 * 1. Sort Team Leaders by current workload (ascending) - least loaded first
 * 2. For each case, assign to Team Leader with lowest workload that has capacity
 * 3. Track assignments to prevent exceeding capacity
 * 
 * @param {array} cases - Cases to distribute
 * @param {array} teamLeaders - Team Leaders to distribute to (all same audit type)
 * @param {string} auditType - Audit type for logging
 * @param {string} taxCenter - Tax center for logging
 * @param {string} region - Region for logging
 * @returns {array} Assignment records
 */
export function distributeToTeamLeadersIntelligently(
  cases,
  teamLeaders,
  auditType,
  taxCenter,
  region
) {
  try {
    console.log(`  📊 Distributing ${cases.length} ${auditType} cases across ${teamLeaders.length} Team Leaders`);
    
    // Create copy to track current workload during distribution
    const tlWorkload = {};
    teamLeaders.forEach(tl => {
      tlWorkload[tl.id] = {
        name: tl.full_name,
        current: tl.workload?.currentCases || 0,
        max: tl.workload?.maxCapacity || 12
      };
    });
    
    // Sort Team Leaders by current workload (least loaded first)
    const sortedTLs = [...teamLeaders].sort((a, b) => 
      (a.workload?.currentCases || 0) - (b.workload?.currentCases || 0)
    );
    
    const distribution = [];
    let tlIndex = 0;
    let skippedCases = 0;
    
    for (const auditCase of cases) {
      let selectedTL = null;
      let attempts = 0;
      
      // Try to find a Team Leader with capacity
      while (!selectedTL && attempts < sortedTLs.length) {
        const tl = sortedTLs[tlIndex % sortedTLs.length];
        const currentWorkload = tlWorkload[tl.id].current;
        const maxCapacity = tlWorkload[tl.id].max;
        
        if (currentWorkload < maxCapacity) {
          // This TL has capacity
          selectedTL = tl;
          tlWorkload[tl.id].current++;
          
          console.log(
            `    📍 Case ${auditCase.id.substring(0, 12)} → ` +
            `${tl.full_name} (${currentWorkload}/${maxCapacity})`
          );
        } else {
          // This TL is at capacity, try next
          tlIndex++;
          attempts++;
        }
      }
      
      if (!selectedTL) {
        console.warn(`    ⚠️  Case ${auditCase.id} - NO Team Leader capacity available`);
        skippedCases++;
        continue;
      }
      
      // Save assignment to storage
      const updatedCase = {
        ...auditCase,
        status: 'ASSIGNED_TO_TEAM_LEADER',
        assignedTeamLeaderId: selectedTL.id,
        assignedTeamLeader: selectedTL.full_name
      };
      
      const data = loadData();
      const caseIdx = data.auditCases.findIndex(c => c.id === auditCase.id);
      if (caseIdx !== -1) {
        data.auditCases[caseIdx] = updatedCase;
        (data.audit_operations || []).push({
          action: 'ASSIGN_TO_TEAM_LEADER',
          caseId: auditCase.id,
          teamLeaderId: selectedTL.id,
          timestamp: new Date().toISOString()
        });
      }
      
      // Record assignment
      distribution.push({
        caseId: auditCase.id,
        caseAuditType: auditCase.auditType,
        taxpayerName: auditCase.taxpayerName,
        teamLeaderId: selectedTL.id,
        teamLeaderName: selectedTL.full_name,
        auditType
      });
      
      // Move to next Team Leader for round-robin
      tlIndex++;
    }
    
    if (distribution.length > 0) {
      const data = loadData();
      // Save all changes
      import('./data').then(module => module.saveData(data));
    }
    
    console.log(
      `  ✅ Distributed ${distribution.length}/${cases.length} cases` +
      (skippedCases > 0 ? ` (${skippedCases} skipped - no capacity)` : '')
    );
    
    return distribution;
    
  } catch (error) {
    console.error(`  ❌ Error distributing cases:`, error);
    return [];
  }
}

/**
 * Get auditors for a Team Leader (by Team Leader's audit type)
 * 
 * Ensures auditors match the Team Leader's audit type specialization
 * 
 * @param {string} teamLeaderId - Team Leader ID
 * @returns {array} Auditors under this Team Leader with matching audit type
 */
export function getAuditorsForTeamLeader(teamLeaderId) {
  try {
    const allUsers = getAllUsers();
    
    // Get the Team Leader
    const teamLeader = allUsers.find(u => u.id === teamLeaderId && u.role === 'team_leader');
    if (!teamLeader) {
      console.warn(`Team Leader not found: ${teamLeaderId}`);
      return [];
    }
    
    const tlAuditType = teamLeader.org_context?.auditType;
    const teamId = teamLeader.org_context?.teamId;
    
    console.log(`  ℹ️  Getting auditors for TL ${teamLeader.full_name} (${tlAuditType})`);
    
    // Get auditors from same team AND same audit type
    const auditors = allUsers.filter(u =>
      u.role === 'auditor' &&
      u.org_context?.teamId === teamId &&
      u.org_context?.auditType === tlAuditType  // ← KEY: Must match TL's audit type
    );
    
    console.log(`  ℹ️  Found ${auditors.length} auditors for ${tlAuditType}`);
    
    return auditors;
  } catch (error) {
    console.error('Error getting auditors for Team Leader:', error);
    return [];
  }
}

/**
 * Validate audit type consistency
 * 
 * Ensures Team Leader and Auditor have matching audit types before assignment
 * 
 * @param {string} teamLeaderId - Team Leader ID
 * @param {string} auditorId - Auditor ID
 * @returns {object} { valid: boolean, message: string }
 */
export function validateAuditTypeConsistency(teamLeaderId, auditorId) {
  try {
    const allUsers = getAllUsers();
    
    const teamLeader = allUsers.find(u => u.id === teamLeaderId);
    const auditor = allUsers.find(u => u.id === auditorId);
    
    if (!teamLeader || !auditor) {
      return { valid: false, message: 'Team Leader or Auditor not found' };
    }
    
    const tlAuditType = teamLeader.org_context?.auditType;
    const auditorAuditType = auditor.org_context?.auditType;
    
    console.log(`  🔍 Checking audit type consistency:`);
    console.log(`     Team Leader: ${tlAuditType}`);
    console.log(`     Auditor: ${auditorAuditType}`);
    
    if (tlAuditType !== auditorAuditType) {
      return {
        valid: false,
        message: `❌ AUDIT TYPE MISMATCH: Team Leader is ${tlAuditType} but Auditor is ${auditorAuditType}`
      };
    }
    
    console.log(`  ✅ Audit types match`);
    return { valid: true, message: 'Audit types match' };
    
  } catch (error) {
    console.error('Error validating audit type consistency:', error);
    return { valid: false, message: error.message };
  }
}

/**
 * Get distribution statistics for a tax center
 * 
 * Shows current distribution by audit type and Team Leader
 * 
 * @param {string} taxCenter - Tax center name
 * @param {string} region - Region name
 * @returns {object} Distribution statistics
 */
export function getDistributionStats(taxCenter, region) {
  try {
    const data = loadData();
    
    const cases = (data.auditCases || []).filter(c =>
      c.taxCenter === taxCenter &&
      c.region === region
    );
    
    const stats = {
      total: cases.length,
      byStatus: {},
      byAuditType: {},
      byTeamLeader: {}
    };
    
    // Group by status
    cases.forEach(c => {
      stats.byStatus[c.status] = (stats.byStatus[c.status] || 0) + 1;
      stats.byAuditType[c.auditType] = (stats.byAuditType[c.auditType] || 0) + 1;
      
      if (c.assignedTeamLeaderId) {
        stats.byTeamLeader[c.assignedTeamLeaderId] = 
          (stats.byTeamLeader[c.assignedTeamLeaderId] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting distribution stats:', error);
    return null;
  }
}

console.log('✅ Case Distribution module loaded');
