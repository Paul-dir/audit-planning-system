/**
 * Assignment Data Models
 * Defines schemas and validation for Team Leaders, Auditors, and Assignments
 */

// ===== TEAM LEADER MODEL =====
export function createTeamLeader(data) {
  return {
    id: data.id || `TL-${data.auditType}-${data.taxCenter}-${Date.now()}`,
    region: data.region,
    taxCenter: data.taxCenter,
    auditType: data.auditType, // DESK, FIELD, COMPREHENSIVE, TP, ISSUE, FORENSIC
    fullName: data.fullName,
    email: data.email,
    expertise: data.expertise || [], // Array of expertise areas
    assignedAuditors: data.assignedAuditors || [], // Array of auditor IDs
    currentWorkload: data.currentWorkload || 0, // Number of active cases
    maxCapacity: data.maxCapacity || 12, // Max concurrent cases
    yearsExperience: data.yearsExperience || 0,
    certifications: data.certifications || [], // CPA, ACCA, etc.
    status: data.status || 'ACTIVE', // ACTIVE, ON_LEAVE, INACTIVE
    createdDate: data.createdDate || new Date().toISOString(),
    lastModified: data.lastModified || new Date().toISOString()
  };
}

export function validateTeamLeader(tl) {
  const errors = [];
  if (!tl.id) errors.push('Team Leader ID is required');
  if (!tl.region) errors.push('Region is required');
  if (!tl.taxCenter) errors.push('Tax Center is required');
  if (!tl.auditType) errors.push('Audit Type is required');
  if (!tl.fullName) errors.push('Full Name is required');
  if (!tl.email) errors.push('Email is required');
  if (typeof tl.currentWorkload !== 'number') errors.push('Current Workload must be a number');
  if (typeof tl.maxCapacity !== 'number') errors.push('Max Capacity must be a number');
  if (tl.currentWorkload > tl.maxCapacity) errors.push('Current Workload cannot exceed Max Capacity');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function isTeamLeaderAvailable(tl) {
  return tl.status === 'ACTIVE' && tl.currentWorkload < tl.maxCapacity;
}

export function getTeamLeaderCapacityPercentage(tl) {
  return (tl.currentWorkload / tl.maxCapacity) * 100;
}

// ===== AUDITOR MODEL =====
export function createAuditor(data) {
  return {
    id: data.id || `AUD-${data.auditType}-${data.taxCenter}-${Date.now()}`,
    region: data.region,
    taxCenter: data.taxCenter,
    teamLeaderId: data.teamLeaderId, // MUST be set (reports to ONE TL)
    auditType: data.auditType, // Same as team leader's audit type
    fullName: data.fullName,
    email: data.email,
    seniority: data.seniority || 'Mid', // Senior, Mid, Junior
    yearsExperience: data.yearsExperience || 0,
    expertise: data.expertise || [], // Array of { area: string, level: string }
    sectorExperience: data.sectorExperience || [], // Business sectors they've audited
    currentWorkload: data.currentWorkload || 0, // Active cases
    maxCapacity: data.maxCapacity || 6, // Max concurrent cases
    certifications: data.certifications || [], // CPA, ACCA, etc.
    status: data.status || 'ACTIVE', // ACTIVE, ON_LEAVE, UNAVAILABLE
    createdDate: data.createdDate || new Date().toISOString(),
    lastModified: data.lastModified || new Date().toISOString()
  };
}

export function validateAuditor(auditor) {
  const errors = [];
  if (!auditor.id) errors.push('Auditor ID is required');
  if (!auditor.region) errors.push('Region is required');
  if (!auditor.taxCenter) errors.push('Tax Center is required');
  if (!auditor.teamLeaderId) errors.push('Team Leader ID is required (auditor must report to a TL)');
  if (!auditor.auditType) errors.push('Audit Type is required');
  if (!auditor.fullName) errors.push('Full Name is required');
  if (!auditor.email) errors.push('Email is required');
  if (!['Senior', 'Mid', 'Junior'].includes(auditor.seniority)) errors.push('Invalid seniority level');
  if (typeof auditor.currentWorkload !== 'number') errors.push('Current Workload must be a number');
  if (typeof auditor.maxCapacity !== 'number') errors.push('Max Capacity must be a number');
  if (auditor.currentWorkload > auditor.maxCapacity) errors.push('Current Workload cannot exceed Max Capacity');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function isAuditorAvailable(auditor) {
  return auditor.status === 'ACTIVE' && auditor.currentWorkload < auditor.maxCapacity;
}

export function getAuditorCapacityPercentage(auditor) {
  return (auditor.currentWorkload / auditor.maxCapacity) * 100;
}

export function getAuditorExpertiseLevel(auditor, area) {
  const expertise = auditor.expertise.find(e => e.area === area);
  return expertise ? expertise.level : null;
}

export function hasAuditorSectorExperience(auditor, sector) {
  return auditor.sectorExperience.includes(sector);
}

// ===== ASSIGNMENT MODEL =====
export function createAssignment(data) {
  return {
    id: data.id || `ASSIGN-${data.caseId}-${Date.now()}`,
    caseId: data.caseId,
    region: data.region,
    taxCenter: data.taxCenter,
    auditType: data.auditType,
    
    // Current state information
    currentState: data.currentState || 'STORED',
    currentOwner: data.currentOwner || null, // Current user ID (TL or Auditor)
    currentOwnerRole: data.currentOwnerRole || null, // TEAM_LEADER or AUDITOR
    
    // Assignment chain - history of all transitions
    assignmentChain: data.assignmentChain || [],
    
    // SLA tracking
    slaDeadline: data.slaDeadline || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days default
    executionStartDate: data.executionStartDate || null,
    
    // Status
    status: data.status || 'PENDING_TEAM_LEADER_RESPONSE',
    
    // Notifications sent
    notifications: data.notifications || [],
    
    // Metadata
    createdDate: data.createdDate || new Date().toISOString(),
    lastModified: data.lastModified || new Date().toISOString()
  };
}

export function validateAssignment(assignment) {
  const errors = [];
  if (!assignment.id) errors.push('Assignment ID is required');
  if (!assignment.caseId) errors.push('Case ID is required');
  if (!assignment.region) errors.push('Region is required');
  if (!assignment.taxCenter) errors.push('Tax Center is required');
  if (!assignment.auditType) errors.push('Audit Type is required');
  if (!assignment.currentState) errors.push('Current State is required');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getAssignmentStateLabel(state) {
  const labels = {
    'STORED': 'Stored (Ready)',
    'ASSIGNED_TO_TEAM_LEADER': 'Assigned to Team Leader',
    'ASSIGNED_TO_AUDITOR': 'Assigned to Auditor',
    'ACCEPTED_BY_AUDITOR': 'Accepted by Auditor',
    'IN_EXECUTION': 'In Execution',
    'PAUSED': 'Paused',
    'COMPLETED': 'Completed',
    'REALLOCATED': 'Re-allocated'
  };
  return labels[state] || state;
}

export function addAssignmentChainEntry(assignment, fromState, toState, metadata) {
  const entry = {
    sequence: (assignment.assignmentChain?.length || 0) + 1,
    fromState,
    toState,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  if (!assignment.assignmentChain) {
    assignment.assignmentChain = [];
  }
  
  assignment.assignmentChain.push(entry);
  assignment.lastModified = new Date().toISOString();
  
  return assignment;
}

// ===== EXPERTISE MODEL =====
export function createExpertise(area, level) {
  return {
    area: area, // VAT, Revenue, Transfer Pricing, Withholding, Payroll, Assets, Related Party, Documentation
    level: level // Expert, Advanced, Intermediate, Basic
  };
}

export const EXPERTISE_AREAS = [
  'VAT Compliance',
  'Revenue Recognition',
  'Transfer Pricing',
  'Withholding Tax',
  'Payroll Tax',
  'Asset Valuation',
  'Related Party Transactions',
  'Documentation Compliance'
];

export const EXPERTISE_LEVELS = ['Expert', 'Advanced', 'Intermediate', 'Basic'];

export const AUDIT_TYPES = [
  'desk_audit',
  'field_audit',
  'comprehensive',
  'transfer_pricing',
  'single_issue',
  'forensic'
];

export const SENIORITY_LEVELS = ['Senior', 'Mid', 'Junior'];

export const BUSINESS_SECTORS = [
  'Manufacturing',
  'Retail',
  'Financial Services',
  'Healthcare',
  'Technology',
  'Hospitality',
  'Transportation',
  'Agriculture',
  'Real Estate',
  'Construction',
  'Energy',
  'Telecommunications'
];

// ===== ASSIGNMENT STATE CONSTANTS =====
export const ASSIGNMENT_STATES = {
  STORED: 'STORED',
  ASSIGNED_TO_TEAM_LEADER: 'ASSIGNED_TO_TEAM_LEADER',
  ASSIGNED_TO_AUDITOR: 'ASSIGNED_TO_AUDITOR',
  ACCEPTED_BY_AUDITOR: 'ACCEPTED_BY_AUDITOR',
  IN_EXECUTION: 'IN_EXECUTION',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  REALLOCATED: 'REALLOCATED'
};

// ===== HELPER FUNCTIONS =====
export function sortTeamLeadersByAvailability(teamLeaders) {
  return [...teamLeaders]
    .filter(tl => isTeamLeaderAvailable(tl))
    .sort((a, b) => a.currentWorkload - b.currentWorkload);
}

export function sortAuditorsByAvailability(auditors) {
  return [...auditors]
    .filter(a => isAuditorAvailable(a))
    .sort((a, b) => a.currentWorkload - b.currentWorkload);
}

export function filterTeamLeadersByAuditType(teamLeaders, auditType) {
  return teamLeaders.filter(tl => tl.auditType === auditType);
}

export function filterAuditorsByTeamLeader(auditors, teamLeaderId) {
  return auditors.filter(a => a.teamLeaderId === teamLeaderId);
}

export function findBestTeamLeader(teamLeaders, auditType) {
  const available = sortTeamLeadersByAvailability(
    filterTeamLeadersByAuditType(teamLeaders, auditType)
  );
  return available.length > 0 ? available[0] : null;
}

export function findBestAuditor(auditors, teamLeaderId) {
  const available = sortAuditorsByAvailability(
    filterAuditorsByTeamLeader(auditors, teamLeaderId)
  );
  return available.length > 0 ? available[0] : null;
}

console.log('✓ Assignment Data Models loaded');
