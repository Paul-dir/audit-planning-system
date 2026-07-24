/**
 * Assignment Scoring Algorithm
 * Intelligently matches auditors to cases based on multiple factors
 * 
 * Scoring Formula:
 * TOTAL_SCORE = (Skills × 0.4) + (Workload × 0.3) + (Sector × 0.2) + (Complexity × 0.1)
 * Result: 0-100, where 80+ is "Good match"
 */

/**
 * Calculate skills match score
 * @param {array} caseRequiredSkills - [{ area: string, level: string }, ...]
 * @param {array} auditorSkills - [{ area: string, level: string }, ...]
 * @returns {number} 0-100
 */
export function calculateSkillsMatch(caseRequiredSkills = [], auditorSkills = []) {
  if (!caseRequiredSkills || caseRequiredSkills.length === 0) {
    return 100; // No skills required
  }
  
  // How many required skills does auditor have?
  const matchedSkills = caseRequiredSkills.filter(skill =>
    auditorSkills.find(as => as.area === skill.area)
  );
  
  const skillCoveragePercentage = (matchedSkills.length / caseRequiredSkills.length);
  
  // What's the proficiency level match?
  const levelScores = { 'Expert': 1.0, 'Advanced': 0.8, 'Intermediate': 0.6, 'Basic': 0.4 };
  
  let totalProficiencyScore = 0;
  let matchedCount = 0;
  
  caseRequiredSkills.forEach(requiredSkill => {
    const auditorSkill = auditorSkills.find(as => as.area === requiredSkill.area);
    
    if (auditorSkill) {
      // If auditor has the skill, add proficiency score
      const auditorLevel = levelScores[auditorSkill.level] || 0;
      const requiredLevel = levelScores[requiredSkill.level] || 0;
      
      // Score: higher if auditor meets or exceeds required level
      const proficiencyScore = auditorLevel >= requiredLevel ? 1.0 : (auditorLevel / (requiredLevel + 0.1));
      totalProficiencyScore += proficiencyScore;
      matchedCount++;
    } else {
      // If auditor doesn't have required skill, penalize
      totalProficiencyScore += 0.2; // Small penalty for missing skill
      matchedCount++;
    }
  });
  
  const avgProficiency = matchedCount > 0 ? totalProficiencyScore / matchedCount : 0;
  
  // Combine coverage and proficiency
  // 60% weight on coverage, 40% weight on proficiency quality
  const skillsScore = (skillCoveragePercentage * 0.6 + avgProficiency * 0.4) * 100;
  
  return Math.min(skillsScore, 100);
}

/**
 * Calculate workload balance score
 * @param {number} auditorCurrentWorkload
 * @param {number} auditorMaxCapacity
 * @returns {number} 0-100 (higher is better - more available)
 */
export function calculateWorkloadScore(auditorCurrentWorkload = 0, auditorMaxCapacity = 1) {
  if (auditorMaxCapacity <= 0) return 0;
  
  const utilizationPercentage = auditorCurrentWorkload / auditorMaxCapacity;
  
  // Score: 100% when idle, 0% when at capacity
  // Add slight penalty if over capacity (negative scores)
  const score = Math.max(0, (1 - utilizationPercentage) * 100);
  
  return Math.min(score, 100);
}

/**
 * Calculate sector experience match score
 * @param {string} caseSector - Business sector of the case
 * @param {array} auditorSectorExperience - Sectors auditor has worked in
 * @returns {number} 0-100 (100 if match, 0 if no match)
 */
export function calculateSectorScore(caseSector, auditorSectorExperience = []) {
  if (!caseSector) {
    return 100; // No sector specified
  }
  
  const hasExperience = auditorSectorExperience.includes(caseSector);
  
  return hasExperience ? 100 : 0;
}

/**
 * Calculate complexity vs seniority match score
 * @param {string} caseComplexity - LOW, MEDIUM, HIGH
 * @param {string} auditorSeniority - Junior, Mid, Senior
 * @returns {number} 0-100
 */
export function calculateComplexityScore(caseComplexity, auditorSeniority) {
  const complexityMap = {
    'LOW': 'Junior',
    'MEDIUM': 'Mid',
    'HIGH': 'Senior'
  };
  
  const requiredSeniority = complexityMap[caseComplexity] || 'Mid';
  
  const seniorityRanking = {
    'Junior': 1,
    'Mid': 2,
    'Senior': 3
  };
  
  const requiredRank = seniorityRanking[requiredSeniority] || 2;
  const auditorRank = seniorityRanking[auditorSeniority] || 2;
  
  // Perfect match = 100
  if (auditorRank === requiredRank) {
    return 100;
  }
  
  // Over-qualified = 90 (preferred to under-qualified)
  if (auditorRank > requiredRank) {
    return 90;
  }
  
  // Under-qualified = 60 (risky)
  return 60;
}

/**
 * Calculate total assignment score
 * Combines all factors with weights
 * 
 * Weights:
 * - Skills: 40%
 * - Workload: 30%
 * - Sector: 20%
 * - Complexity: 10%
 * 
 * @param {number} skillsScore 0-100
 * @param {number} workloadScore 0-100
 * @param {number} sectorScore 0-100
 * @param {number} complexityScore 0-100
 * @returns {number} 0-100
 */
export function calculateTotalScore(skillsScore, workloadScore, sectorScore, complexityScore) {
  const total = (
    (skillsScore * 0.4) +
    (workloadScore * 0.3) +
    (sectorScore * 0.2) +
    (complexityScore * 0.1)
  );
  
  return Math.round(Math.min(total, 100));
}

/**
 * Score an auditor for a case
 * @param {object} caseData - Case object with skills, sector, complexity, etc.
 * @param {object} auditor - Auditor object
 * @returns {object} {auditor, scores: {skills, workload, sector, complexity, total}, breakdown: string}
 */
export function scoreAuditor(caseData = {}, auditor = {}) {
  // Extract case requirements
  const caseSkills = caseData.requiredSkills || [];
  const caseSector = caseData.sector || null;
  const caseComplexity = caseData.complexity || 'MEDIUM';
  
  // Extract auditor info
  const auditorSkills = auditor.expertise || [];
  const auditorSectors = auditor.sectorExperience || [];
  const auditorSeniority = auditor.seniority || 'Mid';
  const currentWorkload = auditor.currentWorkload || 0;
  const maxCapacity = auditor.maxCapacity || 1;
  
  // Calculate individual scores
  const skillsScore = calculateSkillsMatch(caseSkills, auditorSkills);
  const workloadScore = calculateWorkloadScore(currentWorkload, maxCapacity);
  const sectorScore = calculateSectorScore(caseSector, auditorSectors);
  const complexityScore = calculateComplexityScore(caseComplexity, auditorSeniority);
  
  // Calculate total
  const totalScore = calculateTotalScore(skillsScore, workloadScore, sectorScore, complexityScore);
  
  // Build breakdown string
  const breakdown = `Skills: ${Math.round(skillsScore)}% | Workload: ${Math.round(workloadScore)}% | Sector: ${sectorScore}% | Complexity: ${Math.round(complexityScore)}%`;
  
  return {
    auditor,
    scores: {
      skills: Math.round(skillsScore),
      workload: Math.round(workloadScore),
      sector: sectorScore,
      complexity: Math.round(complexityScore),
      total: totalScore
    },
    breakdown,
    recommendation: totalScore >= 80 ? 'Good Match' : totalScore >= 60 ? 'Acceptable' : 'Poor Match'
  };
}

/**
 * Rank auditors for a case
 * Returns top 3 auditors sorted by match score
 * 
 * @param {object} caseData - Case requirements
 * @param {array} auditors - Array of auditors to score
 * @param {string} teamLeaderId - Optional: only score auditors for this TL
 * @returns {array} Array of scored auditors, sorted by total score (highest first)
 */
export function rankAuditors(caseData = {}, auditors = [], teamLeaderId = null) {
  let candidateAuditors = auditors;
  
  // Filter by team leader if specified
  if (teamLeaderId) {
    candidateAuditors = auditors.filter(a => a.teamLeaderId === teamLeaderId);
  }
  
  // Score all auditors
  const scored = candidateAuditors
    .map(auditor => scoreAuditor(caseData, auditor))
    .filter(result => {
      // Filter out unavailable auditors
      return auditor.status === 'ACTIVE' && auditor.currentWorkload < auditor.maxCapacity;
    })
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, 3); // Top 3 only
  
  console.log(`Ranked ${scored.length} auditors for case:`, {
    caseId: caseData.id,
    topScore: scored[0]?.scores.total,
    auditorIds: scored.map(r => r.auditor.id)
  });
  
  return scored;
}

/**
 * Find best single auditor
 * @param {object} caseData
 * @param {array} auditors
 * @param {string} teamLeaderId
 * @returns {object} Best auditor or null
 */
export function findBestAuditor(caseData, auditors, teamLeaderId) {
  const ranked = rankAuditors(caseData, auditors, teamLeaderId);
  return ranked.length > 0 ? ranked[0].auditor : null;
}

/**
 * Get score quality label
 * @param {number} score 0-100
 * @returns {string}
 */
export function getScoreQuality(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 80) return 'Good Match';
  if (score >= 70) return 'Acceptable';
  if (score >= 60) return 'Suboptimal';
  return 'Poor Match';
}

/**
 * Get score color
 * @param {number} score 0-100
 * @returns {string} CSS color
 */
export function getScoreColor(score) {
  if (score >= 90) return '#4caf50'; // Green
  if (score >= 80) return '#8bc34a'; // Light green
  if (score >= 70) return '#ffc107'; // Amber
  if (score >= 60) return '#ff9800'; // Orange
  return '#ff5252'; // Red
}

/**
 * Validate auditor can take case
 * @param {object} auditor
 * @param {object} caseData
 * @returns {object} {canTake: boolean, reason: string}
 */
export function validateAuditorCanTakeCa

se(auditor = {}, caseData = {}) {
  const checks = [];
  
  // Check availability
  if (auditor.status !== 'ACTIVE') {
    checks.push(`Auditor is ${auditor.status}`);
  }
  
  // Check capacity
  if (auditor.currentWorkload >= auditor.maxCapacity) {
    checks.push(`Auditor at capacity (${auditor.currentWorkload}/${auditor.maxCapacity})`);
  }
  
  // Check audit type match
  if (caseData.auditType && auditor.auditType !== caseData.auditType) {
    checks.push(`Auditor specializes in ${auditor.auditType}, not ${caseData.auditType}`);
  }
  
  if (checks.length > 0) {
    return {
      canTake: false,
      reason: checks.join('; ')
    };
  }
  
  return {
    canTake: true,
    reason: 'Auditor can take this case'
  };
}

console.log('✓ Assignment Scoring Algorithm loaded');
