/**
 * Assignment State Machine
 * Manages case assignment state transitions and validation
 * Prevents invalid state transitions and maintains audit trail
 */

import { ASSIGNMENT_STATES, addAssignmentChainEntry } from './assignmentDataModels';

// Define valid transitions: from state → [to states]
export const VALID_TRANSITIONS = {
  [ASSIGNMENT_STATES.STORED]: [
    ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER,
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER]: [
    ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR,
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR]: [
    ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR,
    ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER, // Auditor can decline
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR]: [
    ASSIGNMENT_STATES.IN_EXECUTION,
    ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER, // Auditor can decline
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.IN_EXECUTION]: [
    ASSIGNMENT_STATES.PAUSED,
    ASSIGNMENT_STATES.COMPLETED,
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.PAUSED]: [
    ASSIGNMENT_STATES.IN_EXECUTION,
    ASSIGNMENT_STATES.REALLOCATED
  ],
  [ASSIGNMENT_STATES.COMPLETED]: [], // Terminal state
  [ASSIGNMENT_STATES.REALLOCATED]: [
    ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER // Restart from TL assignment
  ]
};

/**
 * Check if transition is valid
 * @param {string} fromState - Current state
 * @param {string} toState - Desired new state
 * @returns {boolean} true if transition is allowed
 */
export function isValidTransition(fromState, toState) {
  if (!VALID_TRANSITIONS[fromState]) {
    console.warn(`Unknown state: ${fromState}`);
    return false;
  }
  
  const allowed = VALID_TRANSITIONS[fromState].includes(toState);
  
  if (!allowed) {
    console.warn(`Invalid transition: ${fromState} → ${toState}`);
  }
  
  return allowed;
}

/**
 * Execute state transition
 * @param {object} assignment - Assignment object to transition
 * @param {string} toState - Desired new state
 * @param {object} metadata - Additional data (user, reason, score, etc.)
 * @returns {object} Updated assignment with audit trail entry
 * @throws {Error} If transition is invalid
 */
export function executeTransition(assignment, toState, metadata = {}) {
  if (!assignment) {
    throw new Error('Assignment object is required');
  }
  
  const fromState = assignment.currentState;
  
  if (!isValidTransition(fromState, toState)) {
    throw new Error(
      `Invalid state transition: ${fromState} → ${toState}. ` +
      `Valid transitions from ${fromState}: ${VALID_TRANSITIONS[fromState]?.join(', ')}`
    );
  }
  
  // Add to chain
  addAssignmentChainEntry(assignment, fromState, toState, metadata);
  
  // Update current state
  assignment.currentState = toState;
  
  // Update owner if transitioning to a role assignment
  if (toState === ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER) {
    assignment.currentOwner = metadata.toUser || null;
    assignment.currentOwnerRole = 'TEAM_LEADER';
  } else if (toState === ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR) {
    assignment.currentOwner = metadata.toUser || null;
    assignment.currentOwnerRole = 'AUDITOR';
  } else if (toState === ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR) {
    assignment.currentOwner = metadata.toUser || null;
    assignment.currentOwnerRole = 'AUDITOR';
  } else if (toState === ASSIGNMENT_STATES.IN_EXECUTION) {
    assignment.executionStartDate = new Date().toISOString();
  }
  
  // Log transition
  console.log(`✓ Transition: ${fromState} → ${toState}`, {
    caseId: assignment.caseId,
    user: metadata.toUser,
    reason: metadata.reason || 'No reason provided'
  });
  
  return assignment;
}

/**
 * Get next possible states from current state
 * @param {string} currentState
 * @returns {array} Array of valid next states
 */
export function getValidNextStates(currentState) {
  return VALID_TRANSITIONS[currentState] || [];
}

/**
 * Check if state is terminal (no transitions allowed)
 * @param {string} state
 * @returns {boolean}
 */
export function isTerminalState(state) {
  return getValidNextStates(state).length === 0;
}

/**
 * Check if assignment can be executed
 * (Only ACCEPTED_BY_AUDITOR can transition to IN_EXECUTION)
 * @param {object} assignment
 * @returns {boolean}
 */
export function canStartExecution(assignment) {
  return assignment.currentState === ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR;
}

/**
 * Check if assignment can be re-allocated
 * (All states except COMPLETED allow re-allocation)
 * @param {object} assignment
 * @returns {boolean}
 */
export function canReallocate(assignment) {
  return isValidTransition(assignment.currentState, ASSIGNMENT_STATES.REALLOCATED);
}

/**
 * Check if auditor must accept before execution
 * @param {object} assignment
 * @returns {boolean}
 */
export function requiresAuditorAcceptance(assignment) {
  return [
    ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR,
    ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR
  ].includes(assignment.currentState);
}

/**
 * Get assignment status for display
 * @param {object} assignment
 * @returns {object} status with label, color, icon
 */
export function getAssignmentStatus(assignment) {
  const statusMap = {
    [ASSIGNMENT_STATES.STORED]: {
      label: 'Stored',
      color: '#4caf50',
      icon: 'fas fa-check-circle',
      description: 'Ready for assignment to team leader'
    },
    [ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER]: {
      label: 'Assigned to Team Leader',
      color: '#2196f3',
      icon: 'fas fa-user-tie',
      description: 'Waiting for team leader to assign to auditor'
    },
    [ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR]: {
      label: 'Assigned to Auditor',
      color: '#ff9800',
      icon: 'fas fa-hourglass-half',
      description: 'Waiting for auditor to accept'
    },
    [ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR]: {
      label: 'Accepted by Auditor',
      color: '#4caf50',
      icon: 'fas fa-check',
      description: 'Ready for execution'
    },
    [ASSIGNMENT_STATES.IN_EXECUTION]: {
      label: 'In Execution',
      color: '#9c27b0',
      icon: 'fas fa-spinner',
      description: 'Work in progress'
    },
    [ASSIGNMENT_STATES.PAUSED]: {
      label: 'Paused',
      color: '#ff5722',
      icon: 'fas fa-pause-circle',
      description: 'Temporarily paused'
    },
    [ASSIGNMENT_STATES.COMPLETED]: {
      label: 'Completed',
      color: '#388e3c',
      icon: 'fas fa-check-double',
      description: 'Work completed'
    },
    [ASSIGNMENT_STATES.REALLOCATED]: {
      label: 'Re-allocated',
      color: '#f44336',
      icon: 'fas fa-exchange-alt',
      description: 'Assigned to different auditor'
    }
  };
  
  return statusMap[assignment.currentState] || {
    label: assignment.currentState,
    color: '#999',
    icon: 'fas fa-question-circle',
    description: 'Unknown status'
  };
}

/**
 * Validate assignment is in correct state for operation
 * @param {object} assignment
 * @param {string} operation - 'accept', 'reject', 'start', 'pause', 'complete', etc.
 * @returns {object} {valid: boolean, message: string}
 */
export function validateOperationAllowed(assignment, operation) {
  const state = assignment.currentState;
  
  const rules = {
    'accept': [ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR],
    'reject': [ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR, ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR],
    'start': [ASSIGNMENT_STATES.ACCEPTED_BY_AUDITOR],
    'pause': [ASSIGNMENT_STATES.IN_EXECUTION],
    'resume': [ASSIGNMENT_STATES.PAUSED],
    'complete': [ASSIGNMENT_STATES.IN_EXECUTION, ASSIGNMENT_STATES.PAUSED],
    'reallocate': Object.keys(ASSIGNMENT_STATES)
      .map(k => ASSIGNMENT_STATES[k])
      .filter(s => isValidTransition(s, ASSIGNMENT_STATES.REALLOCATED))
  };
  
  if (!rules[operation]) {
    return {
      valid: false,
      message: `Unknown operation: ${operation}`
    };
  }
  
  const allowed = rules[operation].includes(state);
  
  return {
    valid: allowed,
    message: allowed
      ? `Operation '${operation}' is allowed`
      : `Cannot ${operation} a case in ${state} state. Allowed states: ${rules[operation].join(', ')}`
  };
}

/**
 * Get all previous states in assignment chain
 * @param {object} assignment
 * @returns {array} Array of states in chronological order
 */
export function getStateHistory(assignment) {
  if (!assignment.assignmentChain || assignment.assignmentChain.length === 0) {
    return [assignment.currentState];
  }
  
  const history = assignment.assignmentChain.map(entry => entry.toState);
  
  // Remove duplicates while preserving order
  return [...new Set(history)];
}

/**
 * Get time in current state
 * @param {object} assignment
 * @returns {object} {milliseconds, days, hours, minutes}
 */
export function getTimeInCurrentState(assignment) {
  if (assignment.assignmentChain.length === 0) {
    return null;
  }
  
  const lastEntry = assignment.assignmentChain[assignment.assignmentChain.length - 1];
  const timestamp = new Date(lastEntry.timestamp);
  const now = new Date();
  const ms = now - timestamp;
  
  return {
    milliseconds: ms,
    days: Math.floor(ms / (1000 * 60 * 60 * 24)),
    hours: Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  };
}

/**
 * Check if assignment is overdue (past SLA deadline)
 * @param {object} assignment
 * @returns {boolean}
 */
export function isAssignmentOverdue(assignment) {
  if (!assignment.slaDeadline) {
    return false;
  }
  
  const deadline = new Date(assignment.slaDeadline);
  const now = new Date();
  
  return now > deadline && !isTerminalState(assignment.currentState);
}

/**
 * Get days until SLA deadline
 * @param {object} assignment
 * @returns {number} Days remaining (negative if overdue)
 */
export function getDaysUntilSLADeadline(assignment) {
  if (!assignment.slaDeadline) {
    return null;
  }
  
  const deadline = new Date(assignment.slaDeadline);
  const now = new Date();
  const ms = deadline - now;
  
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

console.log('✓ Assignment State Machine loaded');
