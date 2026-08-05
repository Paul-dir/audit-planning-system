import { REGIONS, AUDIT_TYPES, TAX_CENTERS, SECTORS, getRiskLevel } from './constants.js';

// ============================================================
// SEED USERS
// ============================================================
export const SEED_USERS = [
  // Planning Team
  { id: 'u-pt-01', name: 'Planning Auditor',  email: 'planning.auditor1@mor.gov.et',  role: 'planning_team',     region: null,          taxCenter: null,          password: 'password123' },
  { id: 'u-pt-02', name: 'Abebe Tadesse',     email: 'abebe.tadesse@mor.gov.et',      role: 'planning_team',     region: null,          taxCenter: null,          password: 'password123' },
  { id: 'u-pt-03', name: 'Hanna Girma',       email: 'hanna.girma@mor.gov.et',        role: 'planning_team',     region: null,          taxCenter: null,          password: 'password123' },
  // Audit Director
  { id: 'u-ad-01', name: 'Tesfaye Bekele',    email: 'tesfaye.bekele@mor.gov.et',     role: 'audit_director',    region: null,          taxCenter: null,          password: 'password123' },
  // Senior Management
  { id: 'u-sm-01', name: 'Rahel Hailu',       email: 'rahel.hailu@mor.gov.et',        role: 'senior_management', region: null,          taxCenter: null,          password: 'password123' },
  { id: 'u-sm-02', name: 'Biruk Assefa',      email: 'biruk.assefa@mor.gov.et',       role: 'senior_management', region: null,          taxCenter: null,          password: 'password123' },
  // Regional Directors
  { id: 'u-rd-aa', name: 'Getnet Alemu',      email: 'getnet.alemu@mor.gov.et',       role: 'regional_director', region: 'addis_ababa', taxCenter: null,          password: 'password123' },
  { id: 'u-rd-am', name: 'Tadesse Kebede',    email: 'tadesse.kebede@mor.gov.et',     role: 'regional_director', region: 'amhara',      taxCenter: null,          password: 'password123' },
  { id: 'u-rd-or', name: 'Gemechu Negash',    email: 'gemechu.negash@mor.gov.et',     role: 'regional_director', region: 'oromia',      taxCenter: null,          password: 'password123' },
  { id: 'u-rd-sn', name: 'Yonas Mengistu',    email: 'yonas.mengistu@mor.gov.et',     role: 'regional_director', region: 'snnpr',       taxCenter: null,          password: 'password123' },
  { id: 'u-rd-so', name: 'Ibrahim Hassan',    email: 'ibrahim.hassan@mor.gov.et',     role: 'regional_director', region: 'somali',      taxCenter: null,          password: 'password123' },
  // Tax Center Managers — Addis Ababa
  { id: 'u-tc-aa1', name: 'Mekdes Solomon',  email: 'mekdes.solomon@mor.gov.et',     role: 'tax_center_manager',region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', password: 'password123' },
  { id: 'u-tc-aa2', name: 'Dereje Worku',    email: 'dereje.worku@mor.gov.et',       role: 'tax_center_manager',region: 'addis_ababa', taxCenter: 'addis_ababa-tc2', password: 'password123' },
  { id: 'u-tc-aa3', name: 'Selam Tekle',     email: 'selam.tekle@mor.gov.et',        role: 'tax_center_manager',region: 'addis_ababa', taxCenter: 'addis_ababa-tc3', password: 'password123' },
  // Tax Center Managers — Oromia
  { id: 'u-tc-or1', name: 'Chaltu Girma',    email: 'chaltu.girma@mor.gov.et',       role: 'tax_center_manager',region: 'oromia',      taxCenter: 'oromia-tc1',      password: 'password123' },
  { id: 'u-tc-or2', name: 'Diriba Lema',     email: 'diriba.lema@mor.gov.et',        role: 'tax_center_manager',region: 'oromia',      taxCenter: 'oromia-tc2',      password: 'password123' },
  { id: 'u-tc-or3', name: 'Fatuma Umer',     email: 'fatuma.umer@mor.gov.et',        role: 'tax_center_manager',region: 'oromia',      taxCenter: 'oromia-tc3',      password: 'password123' },
  // Team Leaders — AA-TC1
  { id: 'u-tl-aa1a', name: 'Henok Belay',   email: 'henok.belay@mor.gov.et',        role: 'team_leader',       region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', auditType: 'desk_audit',   password: 'password123' },
  { id: 'u-tl-aa1b', name: 'Tigist Alemu',  email: 'tigist.alemu@mor.gov.et',       role: 'team_leader',       region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', auditType: 'field_audit',  password: 'password123' },
  { id: 'u-tl-aa1c', name: 'Melaku Bekele', email: 'melaku.bekele@mor.gov.et',       role: 'team_leader',       region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', auditType: 'joint_audit',  password: 'password123', isJointCommittee: true },
  // Team Leaders — AA-TC2
  { id: 'u-tl-aa2a', name: 'Fikadu Desta',  email: 'fikadu.desta@mor.gov.et',       role: 'team_leader',       region: 'addis_ababa', taxCenter: 'addis_ababa-tc2', auditType: 'desk_audit',   password: 'password123' },
  // Team Leaders — OR-TC1
  { id: 'u-tl-or1a', name: 'Lalisa Wakjira',email: 'lalisa.wakjira@mor.gov.et',     role: 'team_leader',       region: 'oromia',      taxCenter: 'oromia-tc1',      auditType: 'desk_audit',   password: 'password123' },
  // Auditors — AA-TC1
  { id: 'u-aud-aa1a', name: 'Kidist Mehari', email: 'kidist.mehari@mor.gov.et',     role: 'auditor',           region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', teamLeader: 'u-tl-aa1a', password: 'password123' },
  { id: 'u-aud-aa1b', name: 'Robel Tadesse', email: 'robel.tadesse@mor.gov.et',     role: 'auditor',           region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', teamLeader: 'u-tl-aa1a', password: 'password123' },
  { id: 'u-aud-aa1c', name: 'Natnael Kifle', email: 'natnael.kifle@mor.gov.et',     role: 'auditor',           region: 'addis_ababa', taxCenter: 'addis_ababa-tc1', teamLeader: 'u-tl-aa1b', password: 'password123' },
  // Auditors — AA-TC2
  { id: 'u-aud-aa2a', name: 'Meseret Hailu', email: 'meseret.hailu@mor.gov.et',     role: 'auditor',           region: 'addis_ababa', taxCenter: 'addis_ababa-tc2', teamLeader: 'u-tl-aa2a', password: 'password123' },
  // Auditors — OR-TC1
  { id: 'u-aud-or1a', name: 'Tolera Banti',  email: 'tolera.banti@mor.gov.et',      role: 'auditor',           region: 'oromia',      taxCenter: 'oromia-tc1',      teamLeader: 'u-tl-or1a', password: 'password123' },
];

// ============================================================
// Deterministic distribution helper
// ============================================================
const buildDistribution = (regionWeights) => {
  const weights = { desk_audit: 0.30, field_audit: 0.25, joint_audit: 0.18, transfer_pricing: 0.10, comprehensive: 0.10, issue_audit: 0.07 };
  const dist = {};
  for (const [regionId, total] of Object.entries(regionWeights)) {
    dist[regionId] = {};
    let remaining = total;
    const types = AUDIT_TYPES.map(a => a.id);
    types.forEach((id, idx) => {
      if (idx === types.length - 1) {
        dist[regionId][id] = remaining;
      } else {
        const count = Math.round(total * weights[id]);
        dist[regionId][id] = count;
        remaining -= count;
      }
    });
  }
  return dist;
};

const buildTaxCenterDistribution = (regionId, regionDist) => {
  const tcs = TAX_CENTERS[regionId];
  const tcDist = {};
  for (const tcWeights of [{ w: 0.40, idx: 0 }, { w: 0.35, idx: 1 }, { w: 0.25, idx: 2 }]) {
    const tc = tcs[tcWeights.idx];
    tcDist[tc.id] = {};
    if (tcWeights.idx < 2) {
      AUDIT_TYPES.forEach(a => { tcDist[tc.id][a.id] = Math.round(regionDist[a.id] * tcWeights.w); });
    } else {
      AUDIT_TYPES.forEach(a => {
        const prev = (tcDist[tcs[0].id]?.[a.id] || 0) + (tcDist[tcs[1].id]?.[a.id] || 0);
        tcDist[tc.id][a.id] = regionDist[a.id] - prev;
      });
    }
  }
  return tcDist;
};

// ============================================================
// SEED PLANS
// ============================================================
const makeTimeline = (entries) => entries.map(([status, actor, comment, daysAgo]) => ({
  status, actor, comment, timestamp: new Date(Date.now() - daysAgo * 86400000).toISOString(),
}));

const plan1Dist = buildDistribution({ addis_ababa: 350, amhara: 280, oromia: 320, snnpr: 250, somali: 200 });
const plan2Dist = buildDistribution({ addis_ababa: 400, amhara: 300, oromia: 350, snnpr: 280, somali: 220 });

const buildAllRegionalFeedback = (dist) => {
  const feedback = {};
  REGIONS.forEach(region => {
    feedback[region.id] = {
      feedback: `Region ${region.name} has reviewed the allocation. All tax centers are prepared to execute the plan within budget and staffing constraints.`,
      taxCenterAllocations: buildTaxCenterDistribution(region.id, dist[region.id]),
      submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      submittedBy: `u-rd-${region.id.split('_')[0]}`,
    };
  });
  return feedback;
};

export const SEED_PLANS = [
  // Plan 1: Draft
  {
    id: 'AP-2025-001',
    name: 'FY 2025 National Audit Plan — Q1',
    year: 2025,
    description: 'First quarter national audit plan targeting high-risk taxpayers in construction, VAT non-compliance, and transfer pricing sectors.',
    status: 'DRAFT',
    createdBy: 'u-pt-01',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    distribution: plan1Dist,
    totalCases: 1400,
    directorComment: '',
    amendmentComment: '',
    revisions: [],
    regionalFeedback: {},
    seniorComment: '',
    riskBased: true,
    timeline: makeTimeline([
      ['DRAFT', 'u-pt-01', 'Plan created from risk engine analysis', 10],
    ]),
  },
  // Plan 2: Submitted to Director
  {
    id: 'AP-2025-002',
    name: 'FY 2025 National Audit Plan — Q2',
    year: 2025,
    description: 'Second quarter audit plan focused on real estate, import/export, and financial sector compliance.',
    status: 'SUBMITTED_TO_DIRECTOR',
    createdBy: 'u-pt-01',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    distribution: plan2Dist,
    totalCases: 1550,
    directorComment: '',
    amendmentComment: '',
    revisions: [],
    regionalFeedback: {},
    seniorComment: '',
    riskBased: true,
    timeline: makeTimeline([
      ['DRAFT', 'u-pt-01', 'Plan created from risk engine analysis', 20],
      ['SUBMITTED_TO_DIRECTOR', 'u-pt-01', 'Submitted for director review', 18],
    ]),
  },
  // Plan 3: Awaiting Regional Feedback
  {
    id: 'AP-2025-003',
    name: 'FY 2025 National Audit Plan — Q3',
    year: 2025,
    description: 'Third quarter audit plan covering manufacturing, agriculture, and energy sectors.',
    status: 'AWAITING_REGIONAL_FEEDBACK',
    createdBy: 'u-pt-02',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    distribution: plan1Dist,
    totalCases: 1400,
    directorComment: 'Approved. The plan is well-structured. Send to regions for their allocations and tax center distribution.',
    amendmentComment: '',
    revisions: [],
    regionalFeedback: {},
    seniorComment: '',
    timeline: makeTimeline([
      ['DRAFT', 'u-pt-02', 'Plan created', 35],
      ['SUBMITTED_TO_DIRECTOR', 'u-pt-02', 'Submitted for director review', 32],
      ['DIRECTOR_APPROVED', 'u-ad-01', 'Approved', 30],
      ['AWAITING_REGIONAL_FEEDBACK', 'u-ad-01', 'Sent to all regions', 29],
    ]),
  },
  // Plan 4: Feedback Collected → submitted to senior mgmt
  {
    id: 'AP-2025-004',
    name: 'FY 2024 Annual Audit Plan',
    year: 2024,
    description: 'Annual audit plan for FY 2024 covering all sectors.',
    status: 'SUBMITTED_TO_SENIOR_MGMT',
    createdBy: 'u-pt-01',
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString(),
    distribution: plan2Dist,
    totalCases: 1550,
    directorComment: 'Excellent plan. Approved and sent to regions.',
    amendmentComment: 'Please increase desk audit allocation for Addis Ababa and reduce joint audit cases in Oromia based on capacity feedback.',
    revisions: [
      {
        comment: 'Increase desk audit allocation for Addis Ababa; reduce joint audit in Oromia.',
        timestamp: new Date(Date.now() - 58 * 86400000).toISOString(),
        by: 'u-ad-01',
        type: 'amendment',
      },
    ],
    regionalFeedback: buildAllRegionalFeedback(plan2Dist),
    seniorComment: '',
    timeline: makeTimeline([
      ['DRAFT', 'u-pt-01', '', 80],
      ['SUBMITTED_TO_DIRECTOR', 'u-pt-01', '', 77],
      ['DIRECTOR_APPROVED', 'u-ad-01', 'Approved', 75],
      ['AWAITING_REGIONAL_FEEDBACK', 'u-ad-01', 'Sent to regions', 74],
      ['FEEDBACK_COLLECTED', 'system', 'All regional feedback received', 60],
      ['AMENDMENT_REQUIRED', 'u-ad-01', 'Increase desk audit for AA; reduce joint in Oromia', 58],
      ['SUBMITTED_TO_DIRECTOR', 'u-pt-01', 'Amended plan resubmitted', 56],
      ['SUBMITTED_TO_SENIOR_MGMT', 'u-ad-01', 'Submitted amended plan for final approval', 55],
    ]),
  },
];

// ============================================================
// SEED CASES — generated from a finalized plan
// ============================================================
const TAXPAYER_NAMES = [
  'Abyssinia Trading PLC', 'Nile Construction Co', 'Addis Import Export Ltd', 'Ethiopian Steel Corp',
  'Sheger Real Estate', 'Merkato Wholesale Market', 'Sunrise Telecom', 'Blue Nile Finance',
  'Horn of Africa Hotels', 'Great Rift Valley Farms', 'Addis Transport Solutions', 'Ethiopian Energy Ltd',
  'Lalibela Manufacturing', 'Awash Agro Industries', 'Bole Aviation Services', 'Meskel Square Retail',
  'Gondar Textiles Factory', 'Jimma Coffee Exporters', 'Bahir Dar Cement Works', 'Hawassa Industrial Park',
  'Mekele Mining Consortium', 'Dire Dawa Logistics', 'Arba Minch Fisheries', 'Axum Heritage Tours',
  'Adama Sugar Factory', 'Ziway Flower Farm', 'Nazareth Auto Spare Parts', 'Gambella Resources',
];

const DEMO_CAP_PER_CELL = 30;

const makeCase = (planId, auditTypeId, regionId, taxCenterId, caseNum) => {
  const score = 50 + (caseNum * 17 + 31) % 50;
  // Joint audit cases get isJointCommittee flag
  return {
    id: `CASE-${planId}-${String(caseNum).padStart(5, '0')}`,
    planId,
    tin: `TIN-${String(100000 + (caseNum * 7919) % 900000)}`,
    taxpayerName:
      TAXPAYER_NAMES[(caseNum - 1) % TAXPAYER_NAMES.length] +
      (caseNum > TAXPAYER_NAMES.length ? ` ${Math.ceil(caseNum / TAXPAYER_NAMES.length)}` : ''),
    riskScore: score,
    riskLevel: getRiskLevel(score),
    sector: SECTORS[(caseNum - 1) % SECTORS.length],
    auditType: auditTypeId,
    region: regionId,
    taxCenter: taxCenterId,
    isJointCommittee: auditTypeId === 'joint_audit',
    status: 'PENDING',
    priority: null, // null | 'high' | 'medium' | 'low'
    assignedTeamLeader: null,
    assignedAuditor: null,
    assignedAt: null,
    startDate: null,
    completedDate: null,
    notes: '',
    createdAt: new Date().toISOString(),
  };
};

export const generateCases = (planId, dist, regionalFeedback = {}) => {
  const cases = [];
  let caseNum = 1;

  for (const region of REGIONS) {
    const regionDist = dist[region.id] || {};
    const tcs = TAX_CENTERS[region.id] || [];
    const tcAllocations = regionalFeedback[region.id]?.taxCenterAllocations ?? null;

    for (const auditType of AUDIT_TYPES) {
      if (tcAllocations) {
        for (const tc of tcs) {
          const count = tcAllocations[tc.id]?.[auditType.id] || 0;
          const capped = Math.min(count, DEMO_CAP_PER_CELL);
          for (let i = 0; i < capped; i++) {
            cases.push(makeCase(planId, auditType.id, region.id, tc.id, caseNum++));
          }
        }
      } else {
        const total = Math.min(regionDist[auditType.id] || 0, DEMO_CAP_PER_CELL * tcs.length);
        for (let i = 0; i < total; i++) {
          const tc = tcs[i % tcs.length];
          cases.push(makeCase(planId, auditType.id, region.id, tc.id, caseNum++));
        }
      }
    }
  }

  return cases;
};
