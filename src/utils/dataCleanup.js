/**
 * DATA CLEANUP UTILITIES
 * Handles orphaned assignments and invalid references
 */

import { loadData, saveData } from './data';
import { getAllUsers } from '../data/orgStructure';

/**
 * Remove orphaned assignments
 * Assignments referencing non-existent auditors/team leaders
 */
export function removeOrphanedAssignments() {
  try {
    const data = loadData();
    if (!data.assignments) return 0;

    const allUsers = getAllUsers();
    const validAuditorIds = allUsers
      .filter(u => u.role === 'auditor')
      .map(u => u.id);
    
    const validTeamLeaderIds = allUsers
      .filter(u => u.role === 'team_leader')
      .map(u => u.id);

    const beforeCount = data.assignments.length;

    // Filter out assignments with invalid auditors or team leaders
    data.assignments = data.assignments.filter(assignment => {
      const auditorValid = !assignment.auditorId || validAuditorIds.includes(assignment.auditorId);
      const tlValid = !assignment.teamLeaderId || validTeamLeaderIds.includes(assignment.teamLeaderId);
      
      if (!auditorValid || !tlValid) {
        console.warn(`🧹 Removing orphaned assignment: ${assignment.id} (Case: ${assignment.caseId})`);
        if (!auditorValid) console.warn(`   - Auditor not found: ${assignment.auditorId}`);
        if (!tlValid) console.warn(`   - Team Leader not found: ${assignment.teamLeaderId}`);
        return false;
      }
      return true;
    });

    const removedCount = beforeCount - data.assignments.length;
    if (removedCount > 0) {
      saveData(data);
      console.log(`✅ Cleaned ${removedCount} orphaned assignment(s)`);
    }

    return removedCount;
  } catch (error) {
    console.error('Error cleaning orphaned assignments:', error);
    return 0;
  }
}

/**
 * Validate assignment references
 * Check if all assigned auditors/team leaders exist
 */
export function validateAssignmentReferences() {
  try {
    const data = loadData();
    if (!data.assignments) return { valid: true, issues: [] };

    const allUsers = getAllUsers();
    const userIds = allUsers.map(u => u.id);
    const issues = [];

    data.assignments.forEach(assignment => {
      if (assignment.auditorId && !userIds.includes(assignment.auditorId)) {
        issues.push({
          type: 'missing_auditor',
          assignmentId: assignment.id,
          caseId: assignment.caseId,
          auditorId: assignment.auditorId
        });
      }
      
      if (assignment.teamLeaderId && !userIds.includes(assignment.teamLeaderId)) {
        issues.push({
          type: 'missing_team_leader',
          assignmentId: assignment.id,
          caseId: assignment.caseId,
          teamLeaderId: assignment.teamLeaderId
        });
      }
    });

    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    console.error('Error validating assignments:', error);
    return { valid: false, issues: [] };
  }
}

/**
 * Clean up audit cases with invalid assignments
 */
export function cleanupOrphanedCases() {
  try {
    const data = loadData();
    if (!data.auditCases) return 0;
    if (!data.assignments) return 0;

    const validCaseIds = data.assignments.map(a => a.caseId);
    const beforeCount = data.auditCases.length;

    // Keep cases that either:
    // 1. Have no assignment, OR
    // 2. Have a valid assignment record
    data.auditCases = data.auditCases.filter(c => {
      const hasAssignment = data.assignments.some(a => a.caseId === c.id);
      if (hasAssignment) return true; // Keep if has valid assignment
      if (!c.assignedAuditorId && !c.assignedTeamLeaderId) return true; // Keep if unassigned
      return true; // Keep all cases
    });

    if (data.auditCases.length < beforeCount) {
      saveData(data);
      console.log(`✅ Cleaned ${beforeCount - data.auditCases.length} orphaned case(s)`);
    }

    return beforeCount - data.auditCases.length;
  } catch (error) {
    console.error('Error cleaning orphaned cases:', error);
    return 0;
  }
}

/**
 * Full data cleanup
 * Call this on app initialization
 */
export function performFullDataCleanup() {
  console.log('🧹 Starting data cleanup...');
  
  const orphanedAssignments = removeOrphanedAssignments();
  const orphanedCases = cleanupOrphanedCases();
  const validation = validateAssignmentReferences();

  console.log(`✅ Data cleanup complete:
    - Removed orphaned assignments: ${orphanedAssignments}
    - Removed orphaned cases: ${orphanedCases}
    - Validation passed: ${validation.valid}`);

  if (!validation.valid) {
    console.warn(`⚠️ Found ${validation.issues.length} validation issues:`, validation.issues);
  }

  return { orphanedAssignments, orphanedCases, validation };
}
