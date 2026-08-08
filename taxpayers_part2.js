
export const REGIONAL_TAXPAYER_COUNTS = {
  oromia: {
    'oromia-tc1': {
      total: 450,
      byRisk: { CRITICAL: 45, HIGH: 135, MEDIUM: 180, LOW: 90 },
      byAuditType: { 
        desk_audit: 180, 
        field_audit: 135, 
        joint_audit: 54, 
        transfer_pricing: 36, 
        comprehensive: 27, 
        issue_audit: 18 
      }
    },
    'oromia-tc2': {
      total: 420,
      byRisk: { CRITICAL: 42, HIGH: 126, MEDIUM: 168, LOW: 84 },
      byAuditType: { 
        desk_audit: 168, 
        field_audit: 126, 
        joint_audit: 50, 
        transfer_pricing: 34, 
        comprehensive: 25, 
        issue_audit: 17 
      }
    },
    'oromia-tc3': {
      total: 380,
      byRisk: { CRITICAL: 38, HIGH: 114, MEDIUM: 152, LOW: 76 },
      byAuditType: { 
        desk_audit: 152, 
        field_audit: 114, 
        joint_audit: 46, 
        transfer_pricing: 30, 
        comprehensive: 23, 
        issue_audit: 15 
      }
    }
  },
  
  amhara: {
    'amhara-tc1': {
      total: 350,
      byRisk: { CRITICAL: 35, HIGH: 105, MEDIUM: 140, LOW: 70 },
      byAuditType: { 
        desk_audit: 140, 
        field_audit: 105, 
        joint_audit: 42, 
        transfer_pricing: 28, 
        comprehensive: 21, 
        issue_audit: 14 
      }
    },
    'amhara-tc2': {
      total: 320,
      byRisk: { CRITICAL: 32, HIGH: 96, MEDIUM: 128, LOW: 64 },
      byAuditType: { 
        desk_audit: 128, 
        field_audit: 96, 
        joint_audit: 38, 
        transfer_pricing: 26, 
        comprehensive: 19, 
        issue_audit: 13 
      }
    },
    'amhara-tc3': {
      total: 290,
      byRisk: { CRITICAL: 29, HIGH: 87, MEDIUM: 116, LOW: 58 },
      byAuditType: { 
        desk_audit: 116, 
        field_audit: 87, 
        joint_audit: 35, 
        transfer_pricing: 23, 
        comprehensive: 17, 
        issue_audit: 12 
      }
    }
  },

  snnpr: {
    'snnpr-tc1': {
      total: 280,
      byRisk: { CRITICAL: 28, HIGH: 84, MEDIUM: 112, LOW: 56 },
      byAuditType: { 
        desk_audit: 112, 
        field_audit: 84, 
        joint_audit: 34, 
        transfer_pricing: 22, 
        comprehensive: 17, 
        issue_audit: 11 
      }
    },
    'snnpr-tc2': {
      total: 260,
      byRisk: { CRITICAL: 26, HIGH: 78, MEDIUM: 104, LOW: 52 },
      byAuditType: { 
        desk_audit: 104, 
        field_audit: 78, 
        joint_audit: 31, 
        transfer_pricing: 21, 
        comprehensive: 16, 
        issue_audit: 10 
      }
    },
    'snnpr-tc3': {
      total: 240,
      byRisk: { CRITICAL: 24, HIGH: 72, MEDIUM: 96, LOW: 48 },
      byAuditType: { 
        desk_audit: 96, 
        field_audit: 72, 
        joint_audit: 29, 
        transfer_pricing: 19, 
        comprehensive: 14, 
        issue_audit: 10 
      }
    }
  },

  somali: {
    'somali-tc1': {
      total: 220,
      byRisk: { CRITICAL: 22, HIGH: 66, MEDIUM: 88, LOW: 44 },
      byAuditType: { 
        desk_audit: 88, 
        field_audit: 66, 
        joint_audit: 26, 
        transfer_pricing: 18, 
        comprehensive: 13, 
        issue_audit: 9 
      }
    },
    'somali-tc2': {
      total: 200,
      byRisk: { CRITICAL: 20, HIGH: 60, MEDIUM: 80, LOW: 40 },
      byAuditType: { 
        desk_audit: 80, 
        field_audit: 60, 
        joint_audit: 24, 
        transfer_pricing: 16, 
        comprehensive: 12, 
        issue_audit: 8 
      }
    },
    'somali-tc3': {
      total: 180,
      byRisk: { CRITICAL: 18, HIGH: 54, MEDIUM: 72, LOW: 36 },
      byAuditType: { 
        desk_audit: 72, 
        field_audit: 54, 
        joint_audit: 22, 
        transfer_pricing: 14, 
        comprehensive: 11, 
        issue_audit: 7 
      }
    }
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get taxpayers for a specific tax center
 */
export function getTaxpayersForTaxCenter(taxCenterId) {
  // For Addis Ababa, return real taxpayers
  if (taxCenterId.startsWith('addis_ababa')) {
    return ADDIS_ABABA_TAXPAYERS.filter(tp => tp.taxCenter === taxCenterId);
  }
  
  // For other regions, return empty (just counts available)
  return [];
}

/**
 * Get taxpayer counts for a tax center
 */
export function getTaxpayerCountsForTaxCenter(taxCenterId) {
  // Check if it's Addis Ababa
  if (taxCenterId.startsWith('addis_ababa')) {
    const taxpayers = getTaxpayersForTaxCenter(taxCenterId);
    return {
      total: taxpayers.length,
      byRisk: countByField(taxpayers, 'riskLevel'),
      byAuditType: countByField(taxpayers, 'suggestedAuditType')
    };
  }
  
  // For other regions, use summary counts
  const [region] = taxCenterId.split('-');
  return REGIONAL_TAXPAYER_COUNTS[region]?.[taxCenterId] || { total: 0, byRisk: {}, byAuditType: {} };
}


/**
 * Helper to count items by a specific field
 */
function countByField(items, field) {
  return items.reduce((acc, item) => {
    const value = item[field];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Get taxpayers by risk level
 */
export function getTaxpayersByRiskLevel(taxCenterId, riskLevel) {
  const taxpayers = getTaxpayersForTaxCenter(taxCenterId);
  return taxpayers.filter(tp => tp.riskLevel === riskLevel);
}

/**
 * Get taxpayers by suggested audit type
 */
export function getTaxpayersByAuditType(taxCenterId, auditType) {
  const taxpayers = getTaxpayersForTaxCenter(taxCenterId);
  return taxpayers.filter(tp => tp.suggestedAuditType === auditType);
}

/**
 * Select top N taxpayers by risk score for case generation
 */
export function selectTopRiskTaxpayers(taxCenterId, count) {
  const taxpayers = getTaxpayersForTaxCenter(taxCenterId);
  return taxpayers
    .sort((a, b) => b.riskScore - a.riskScore) // Sort by risk score descending
    .slice(0, count); // Take top N
}

/**
 * Generate cases from plan allocation
 * This is the smart case generation function
 */
export function generateCasesFromPlan(planId, taxCenterId, allocation, planAllocation) {
  const taxpayers = getTaxpayersForTaxCenter(taxCenterId);
  const cases = [];
  
  // Sort taxpayers by risk score (highest first)
  const sortedTaxpayers = [...taxpayers].sort((a, b) => b.riskScore - a.riskScore);
  
  let taxpayerIndex = 0;
  
  // For each audit type in the allocation
  Object.entries(allocation).forEach(([auditType, count]) => {
    for (let i = 0; i < count; i++) {
      if (taxpayerIndex >= sortedTaxpayers.length) {
        // Not enough taxpayers, break
        break;
      }
      
      const taxpayer = sortedTaxpayers[taxpayerIndex];
      taxpayerIndex++;
      
      // Create case
      cases.push({
        id: `CASE-${planId}-${taxpayer.tin}`,
        planId,
        tin: taxpayer.tin,
        taxpayerName: taxpayer.name,
        sector: taxpayer.sector,
        riskScore: taxpayer.riskScore,
        riskLevel: taxpayer.riskLevel,
        auditType: auditType, // Use plan allocation, not suggestion
        suggestedAuditType: taxpayer.suggestedAuditType, // Keep original suggestion
        region: taxpayer.region,
        taxCenter: taxpayer.taxCenter,
        status: 'PENDING',
        priority: null,
        assignedTeamLeader: null,
        assignedAuditor: null,
        assignedAt: null,
        startDate: null,
        completedDate: null,
        notes: '',
        createdAt: new Date().toISOString(),
        taxpayerData: taxpayer // Full taxpayer info for reference
      });
    }
  });
  
  return cases;
}

/**
 * Get all Addis Ababa taxpayers (for testing)
 */
export function getAllAddisAbabaTaxpayers() {
  return ADDIS_ABABA_TAXPAYERS;
}

/**
 * Get taxpayer by TIN
 */
export function getTaxpayerByTIN(tin) {
  return ADDIS_ABABA_TAXPAYERS.find(tp => tp.tin === tin);
}

/**
 * Search taxpayers
 */
export function searchTaxpayers(query, taxCenterId = null) {
  let taxpayers = taxCenterId 
    ? getTaxpayersForTaxCenter(taxCenterId)
    : ADDIS_ABABA_TAXPAYERS;
  
  const lowerQuery = query.toLowerCase();
  return taxpayers.filter(tp => 
    tp.name.toLowerCase().includes(lowerQuery) ||
    tp.tin.toLowerCase().includes(lowerQuery) ||
    tp.sector.toLowerCase().includes(lowerQuery)
  );
}
