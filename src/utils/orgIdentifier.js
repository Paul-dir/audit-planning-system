/**
 * ============================================================
 * ORGANIZATION IDENTIFIER SYSTEM
 * ============================================================
 * 
 * Provides unique, human-readable identifiers for every entity
 * in the organizational hierarchy. Supports deduplication when
 * multiple entities exist at the same level (e.g., TL-1, TL-2
 * for multiple team leaders).
 *
 * Entity ID formats:
 *   Regional Director:      REG-{region_code}
 *   Tax Center:             TC-{region_code}-{tc_number}
 *   Cascade Team:           CT-{region_code}-{tc_number}-{seq}
 *   Process Owner:          PO-{region_code}-{tc_number}
 *   Team Leader:            TL-{region_code}-{tc_number}-{audit_type_code}-{seq}
 *   Auditor:                AUD-{region_code}-{tc_number}-{team_id}-{seq}
 */

import { loadData, saveData } from './data';
import { ENTITY_NAMING } from '../config/hierarchyConfig';

// ============================================================
// 1. REGION / TAX CENTER CODES
// ============================================================

const REGION_CODES = {
  'Addis Ababa': 'AA',
  'Oromia': 'OR',
  'Amhara': 'AM',
  'SNNPR': 'SN',
  'Somali': 'SM',
  'Dire Dawa': 'DD',
  'Tigray': 'TG',
  'Sidama': 'SD',
};

const AUDIT_TYPE_CODES = {
  desk_audit: 'DA',
  field_audit: 'FA',
  joint_audit: 'JA',
  transfer_pricing: 'TP',
  comprehensive: 'CM',
  issue_audit: 'IA',
  'Standard Audit': 'SA',
  'Compliance Audit': 'CA',
  'Risk-Based Audit': 'RA',
};

/**
 * Get region code from region name
 */
export function getRegionCode(regionName) {
  return REGION_CODES[regionName] || regionName?.substring(0, 2).toUpperCase() || 'XX';
}

/**
 * Get tax center short code from tax center name
 * e.g., "Addis Ababa TC1" -> "AA-TC1"
 */
export function getTaxCenterCode(taxCenterName, regionName) {
  if (!taxCenterName) return 'XX';
  const regionCode = getRegionCode(regionName);
  // Extract tax center number
  const match = taxCenterName.match(/TC(\d+)/i);
  const tcNum = match ? match[1] : 'XX';
  return `${regionCode}-TC${tcNum}`;
}

/**
 * Get audit type code
 */
export function getAuditTypeCode(auditType) {
  return AUDIT_TYPE_CODES[auditType] || auditType?.substring(0, 2).toUpperCase() || 'XX';
}

// ============================================================
// 2. ENTITY COUNTERS (persisted in localStorage)
// ============================================================

const COUNTER_KEY = 'org_entity_counters';

function getCounters() {
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCounters(counters) {
  localStorage.setItem(COUNTER_KEY, JSON.stringify(counters));
}

/**
 * Get next sequential number for an entity type within a scope
 * e.g., for team_leaders in "AA-TC1-DA" scope -> returns 1, 2, 3...
 */
function getNextSequence(entityType, scope) {
  const counters = getCounters();
  const key = `${entityType}:${scope}`;
  counters[key] = (counters[key] || 0) + 1;
  saveCounters(counters);
  return counters[key];
}

/**
 * Reset counters for testing
 */
export function resetCounters() {
  localStorage.removeItem(COUNTER_KEY);
}

// ============================================================
// 3. ENTITY ID GENERATORS
// ============================================================

/**
 * Generate a Regional Director ID
 * Format: REG-{region_code}
 */
export function generateRegionalDirectorId(regionName) {
  const code = getRegionCode(regionName);
  return `REG-${code}`;
}

/**
 * Generate a Tax Center Manager ID
 * Format: TCM-{region_code}-{tc_number}
 */
export function generateTaxCenterManagerId(taxCenterName, regionName) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  return `TCM-${tcCode}`;
}

/**
 * Generate a Cascade Team ID
 * Format: CT-{region_code}-{tc_number}-{seq}
 */
export function generateCascadeTeamId(taxCenterName, regionName) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  const seq = getNextSequence('cascade_team', tcCode);
  return `CT-${tcCode}-${seq}`;
}

/**
 * Generate a Process Owner ID
 * Format: PO-{region_code}-{tc_number}
 */
export function generateProcessOwnerId(taxCenterName, regionName) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  return `PO-${tcCode}`;
}

/**
 * Generate a Team Leader ID
 * Format: TL-{region_code}-{tc_number}-{audit_type_code}-{seq}
 * 
 * When multiple team leaders exist for the same audit type at the
 * same tax center, they get sequential suffixes: TL-AA-TC1-FA-1,
 * TL-AA-TC1-FA-2, etc.
 */
export function generateTeamLeaderId(taxCenterName, regionName, auditType) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  const atCode = getAuditTypeCode(auditType);
  const scope = `${tcCode}-${atCode}`;
  const seq = getNextSequence('team_leader', scope);
  return `TL-${scope}-${seq}`;
}

/**
 * Generate an Auditor ID
 * Format: AUD-{region_code}-{tc_number}-{team_id}-{seq}
 */
export function generateAuditorId(taxCenterName, regionName, teamLeaderId) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  const tlShort = teamLeaderId || 'XX';
  const scope = `${tcCode}-${tlShort}`;
  const seq = getNextSequence('auditor', scope);
  return `AUD-${scope}-${seq}`;
}

/**
 * Generate a Plan Route ID (for tracking plan routing between levels)
 * Format: ROUTE-{plan_id}-{from_level}-{to_level}-{target_id}
 */
export function generateRouteId(planId, fromLevel, toLevel, targetId) {
  const shortTarget = targetId?.substring(0, 8) || 'XX';
  return `ROUTE-${planId}-${fromLevel}-${toLevel}-${shortTarget}`.toUpperCase();
}

/**
 * Generate a Case ID scoped to tax center
 * Format: CASE-{region_code}-{tc_number}-{seq}
 */
export function generateCaseId(taxCenterName, regionName) {
  const tcCode = getTaxCenterCode(taxCenterName, regionName);
  const seq = getNextSequence('case', tcCode);
  return `CASE-${tcCode}-${String(seq).padStart(4, '0')}`;
}

// ============================================================
// 4. ENTITY RESOLVERS
// ============================================================

/**
 * Parse a team leader ID to extract context
 * TL-AA-TC1-DA-1 -> { region: 'Addis Ababa', taxCenter: 'Addis Ababa TC1', auditType: 'desk_audit', sequence: 1 }
 */
export function parseTeamLeaderId(tlId) {
  if (!tlId) return null;
  const parts = tlId.split('-');
  if (parts.length < 5) return null;
  
  // Reverse lookup region code
  const regionCode = parts[1];
  const regionName = Object.entries(REGION_CODES).find(([_, code]) => code === regionCode)?.[0];
  
  // Reconstruct tax center
  const tcNum = parts[2]?.replace('TC', '');
  const taxCenterName = regionName ? `${regionName} TC${tcNum}` : null;
  
  // Reverse lookup audit type code
  const atCode = parts[3];
  const auditType = Object.entries(AUDIT_TYPE_CODES).find(([_, code]) => code === atCode)?.[0];
  
  const sequence = parseInt(parts[4], 10);
  
  return {
    region: regionName,
    taxCenter: taxCenterName,
    auditType,
    sequence: isNaN(sequence) ? 1 : sequence,
  };
}

/**
 * Get display label for an entity (e.g., "TL-1" or "TL-AA-TC1-DA-1")
 * Short form shows just the sequence when context is known
 */
export function getEntityDisplayLabel(entityType, entityId, shortForm = true) {
  if (!entityId) return 'Unnamed';
  
  if (shortForm) {
    // For entity types with sequential naming, extract just the number
    const naming = ENTITY_NAMING[entityType];
    if (naming?.suffixStrategy === 'sequential') {
      const parts = entityId.split(naming.separator);
      const seq = parts[parts.length - 1];
      const prefix = parts[0];
      return `${prefix}-${seq}`;
    }
  }
  
  return entityId;
}

// ============================================================
// 5. ORGANIZATION GRAPH TRAVERSAL
// ============================================================

/**
 * Build a unique identifier for a group of up to `n` entities
 * that share the same role and location. Used when you need to
 * differentiate TL-1 from TL-2 (both desk audit leads at same TC).
 */
export function getEntitySequenceInGroup(entityType, locationScope) {
  const key = `${entityType}:${locationScope}`;
  const counters = getCounters();
  return counters[key] || 1;
}

/**
 * Check if a location has multiple entities of the same type
 */
export function hasMultipleEntities(entityType, locationScope) {
  return (getEntitySequenceInGroup(entityType, locationScope)) > 1;
}

/**
 * Get all registered entity IDs for a given type and scope
 */
export function getEntityIdsInScope(entityType, locationScope) {
  const counters = getCounters();
  const prefix = `${entityType}:${locationScope}`;
  const count = counters[prefix] || 0;
  
  const ids = [];
  for (let i = 1; i <= count; i++) {
    ids.push(i);
  }
  return ids;
}
