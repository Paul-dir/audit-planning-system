/**
 * Organizational Structure Generator
 * Generates users with complete hierarchical context and RBAC
 * 
 * Structure:
 * - Audit Planning Team: 3 users (national level)
 * - Senior Management: 2 users (national level)
 * - Audit Directors: 2 users (national level)
 * - Cascade Audit Team: 3 users (1 per audit type - national level)
 * - Process Owner: 1 user (national level)
 * - Regional Directors: 5 users (1 per region)
 * - Tax Center Managers: 15 users (3 per region)
 * - Cascade Team per Audit Type: 15 users (1 per tax center per audit type)
 * - Team Leaders: 45 users (3 per tax center = 1 per audit type)
 * - Process Owner at Tax Center: 15 users (1 per tax center)
 * - Auditors: 135 users (3 per team)
 */

// Ethiopian names database
const ETHIOPIAN_NAMES = [
  'Abebe', 'Addis', 'Adeyemi', 'Alem', 'Assefa', 'Ayele', 'Bekele', 'Biruk',
  'Chala', 'Chernet', 'Dabissa', 'Desta', 'Diriba', 'Donkoro', 'Dorisama',
  'Eliyas', 'Endalkachew', 'Endalew', 'Endalkachiw', 'Ermiyas', 'Esetu',
  'Fantaye', 'Fikadu', 'Fikre', 'Fisseha', 'Fitsum', 'Freu',
  'Gebeyehu', 'Gebru', 'Gemechu', 'Genene', 'Getnet', 'Getnet',
  'Girma', 'Girum', 'Grasa', 'Grum', 'Gudeta',
  'Hailu', 'Hailye', 'Hailu', 'Hanna', 'Hassan', 'Haymanot', 'Henock',
  'Hirut', 'Hiwot', 'Hiwote',
  'Ibrahim', 'Indrias', 'Isgadish',
  'Jaldesa', 'Jembere', 'Jenbere', 'Jirru',
  'Kadire', 'Kale', 'Kassahun', 'Kebede', 'Kebedech', 'Kedest', 'Kehilela',
  'Kemer', 'Kemetu', 'Kemme', 'Kepre', 'Kerebih', 'Kerebu', 'Keremu',
  'Ketama', 'Keteme', 'Kidane', 'Kiders', 'Kidist', 'Kiku', 'Kimba',
  'Kindu', 'Kindie', 'Kinfu', 'Kingle', 'Kinlesh', 'Kinne', 'Kino',
  'Kodani', 'Kojo', 'Kolela', 'Kumanya', 'Kumera', 'Kumie', 'Kumo',
  'Lagesse', 'Laika', 'Lakini', 'Lakish', 'Lalisa', 'Lalu', 'Lamech',
  'Mada', 'Madebo', 'Madera', 'Madi', 'Madira', 'Mado', 'Madoda',
  'Maggie', 'Makeda', 'Makera', 'Makerte', 'Makida', 'Makite', 'Makiya',
  'Malamu', 'Malati', 'Malda', 'Maldina', 'Malka', 'Malkamu', 'Malke',
  'Malki', 'Malkie', 'Malmuka', 'Malone', 'Malubu', 'Maluki', 'Malum',
  'Mamen', 'Mamia', 'Mamie', 'Mamina', 'Mamit', 'Mamiya', 'Mamke',
  'Mammea', 'Mammu', 'Mamona', 'Mamsu', 'Mamta', 'Mamte', 'Mamteme',
  'Mamtia', 'Mamto', 'Mamulla', 'Mamum', 'Mamut', 'Mamya',
  'Mana', 'Manabe', 'Manabea', 'Manabeh', 'Manabeza', 'Manabize', 'Manada',
  'Nadew', 'Nadish', 'Nageda', 'Nagila', 'Nagis', 'Nagite', 'Nahmias',
  'Obi', 'Okafor', 'Okechukwu', 'Olela', 'Omari', 'Omersa', 'Omran',
  'Paaluaa', 'Pacha', 'Padale', 'Padam', 'Padema', 'Padilla', 'Padma',
  'Rahel', 'Rania', 'Rasheeda', 'Rashida', 'Rasida', 'Rasida', 'Rasidat',
  'Saba', 'Sababe', 'Sabadia', 'Sabala', 'Sabalegh', 'Sabaleta', 'Sabales',
  'Safi', 'Safina', 'Safiya', 'Safiya', 'Safiye', 'Sagale', 'Sagalie',
  'Tamire', 'Tamiru', 'Tamiya', 'Tamizh', 'Tamkalu', 'Tammam', 'Tamme',
  'Tenagne', 'Tenako', 'Tenalem', 'Tenaleshem', 'Tenalon', 'Tenashe',
  'Usha', 'Usheba', 'Ushebu', 'Ushema', 'Usherma', 'Ushewa', 'Ushewaye',
  'Vajiram', 'Valantine', 'Valare', 'Valasa', 'Valate', 'Valdera', 'Valdik',
  'Wabera', 'Wabir', 'Wabirisa', 'Waca', 'Wacame', 'Wacamba', 'Wacara',
  'Yacob', 'Yacobita', 'Yacobitse', 'Yacodu', 'Yacot', 'Yadeg', 'Yadega',
  'Zaben', 'Zabera', 'Zabib', 'Zabibisa', 'Zabida', 'Zabilo', 'Zabina',
  'Zerihun', 'Zeritufa', 'Zerituye', 'Zerophe', 'Zerosa', 'Zeruta', 'Zerutun'
];

// Regions
const REGIONS = [
  'Addis Ababa',
  'Amhara',
  'Oromia',
  'SNNPR',
  'Somali'
];

// Tax Centers per Region
const TAX_CENTERS_PER_REGION = {
  'Addis Ababa': ['Addis Ababa TC1', 'Addis Ababa TC2', 'Addis Ababa TC3'],
  'Amhara': ['Amhara TC1', 'Amhara TC2', 'Amhara TC3'],
  'Oromia': ['Oromia TC1', 'Oromia TC2', 'Oromia TC3'],
  'SNNPR': ['SNNPR TC1', 'SNNPR TC2', 'SNNPR TC3'],
  'Somali': ['Somali TC1', 'Somali TC2', 'Somali TC3']
};

// Audit Types
const AUDIT_TYPES = ['Standard Audit', 'Compliance Audit', 'Risk-Based Audit'];

// Role hierarchy and access levels
const ROLE_ACCESS_LEVELS = {
  'audit_team': 'national_only',
  'audit_director': 'national_only',
  'regional_director': 'region_only',
  'tax_center_manager': 'tax_center_only',
  'team_leader': 'tax_center_only',
  'auditor': 'assigned_cases_only',
  'cascade_audit_team': 'national_only',
  'senior_management': 'national_only'
};

// Generate random name
function generateName() {
  return ETHIOPIAN_NAMES[Math.floor(Math.random() * ETHIOPIAN_NAMES.length)];
}

// Generate user ID
let userIdCounter = 1;
function generateUserId(role) {
  const id = `USR-${String(userIdCounter).padStart(4, '0')}-${role.substring(0, 3).toUpperCase()}`;
  userIdCounter++;
  return id;
}

// Initialize org structure
let allUsers = [];

/**
 * Generate all organizational users
 * Returns array of 209 users with complete org context
 */
function generateOrganizationalUsers() {
  if (allUsers.length > 0) return allUsers;

  const users = [];

  // 1. AUDIT PLANNING TEAM (3 users) - National level
  const auditTeamNames = ['Abebe Muleta', 'Addis Tadesse', 'Alem Gebremedhin'];
  auditTeamNames.forEach((name, idx) => {
    users.push({
      id: generateUserId('audit_team'),
      full_name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
      role: 'audit_team',
      title: 'Audit Planning Team',
      accessLevel: 'national_only',
      canAccess: ['all_regions', 'all_tax_centers', 'create_plan'],
      org_context: {
        assignedRegion: null,
        assignedRegionName: 'National Level',
        assignedTaxCenter: null,
        assignedTaxCenterName: 'N/A',
        teamId: null,
        teamName: null,
        auditType: null,
        level: 'national'
      }
    });
  });

  // 2. SENIOR MANAGEMENT (2 users) - National level
  const seniorNames = ['Bekele Assefa', 'Biruk Kebede'];
  seniorNames.forEach((name) => {
    users.push({
      id: generateUserId('senior_management'),
      full_name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
      role: 'senior_management',
      title: 'Senior Management',
      accessLevel: 'national_only',
      canAccess: ['all_regions', 'all_tax_centers', 'approve_plans'],
      org_context: {
        assignedRegion: null,
        assignedRegionName: 'National Level',
        assignedTaxCenter: null,
        assignedTaxCenterName: 'N/A',
        teamId: null,
        teamName: null,
        auditType: null,
        level: 'national'
      }
    });
  });

  // 3. AUDIT DIRECTORS (2 users) - National level
  const directorNames = ['Chala Duguma', 'Chernet Wako'];
  directorNames.forEach((name) => {
    users.push({
      id: generateUserId('audit_director'),
      full_name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
      role: 'audit_director',
      title: 'Audit Director',
      accessLevel: 'national_only',
      canAccess: ['all_regions', 'all_tax_centers', 'approve_plans', 'review_plans'],
      org_context: {
        assignedRegion: null,
        assignedRegionName: 'National Level',
        assignedTaxCenter: null,
        assignedTaxCenterName: 'N/A',
        teamId: null,
        teamName: null,
        auditType: null,
        level: 'national'
      }
    });
  });

  // 4. CASCADE AUDIT TEAM (3 users) - One per audit type - National level
  const cascadeNames = ['Dabissa Girma', 'Desta Lemma', 'Diriba Tadesse'];
  AUDIT_TYPES.forEach((auditType, idx) => {
    users.push({
      id: generateUserId('cascade_audit_team'),
      full_name: cascadeNames[idx],
      email: `${cascadeNames[idx].toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
      role: 'cascade_audit_team',
      title: 'Cascade Audit Team',
      accessLevel: 'national_only',
      canAccess: ['all_regions', 'all_tax_centers', 'cascade_plans'],
      org_context: {
        assignedRegion: null,
        assignedRegionName: 'National Level',
        assignedTaxCenter: null,
        assignedTaxCenterName: 'N/A',
        teamId: null,
        teamName: null,
        auditType: auditType, // CASCADES SPECIFIC AUDIT TYPE
        level: 'national'
      }
    });
  });

  // 5. PROCESS OWNER (1 user) - National level
  users.push({
    id: generateUserId('process_owner'),
    full_name: 'Donkoro Fikadu',
    email: 'donkoro.fikadu@mor.gov.et',
    role: 'process_owner',
    title: 'Process Owner',
    accessLevel: 'national_only',
    canAccess: ['all_regions', 'all_tax_centers', 'manage_processes'],
    org_context: {
      assignedRegion: null,
      assignedRegionName: 'National Level',
      assignedTaxCenter: null,
      assignedTaxCenterName: 'N/A',
      teamId: null,
      teamName: null,
      auditType: null,
      level: 'national'
    }
  });

  // 6. REGIONAL AND LOWER HIERARCHY
  REGIONS.forEach((region) => {
    // Regional Director (1 per region = 5 total)
    const rdName = `${generateName()} ${generateName()}`;
    users.push({
      id: generateUserId('regional_director'),
      full_name: rdName,
      email: `${rdName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
      role: 'regional_director',
      title: 'Regional Director',
      accessLevel: 'region_only',
      canAccess: [region, `all_tax_centers_in_${region}`],
      org_context: {
        assignedRegion: region,
        assignedRegionName: region,
        assignedTaxCenter: null,
        assignedTaxCenterName: 'N/A',
        teamId: null,
        teamName: null,
        auditType: null,
        level: 'regional'
      }
    });

    // Tax Center Managers (3 per region = 15 total)
    const taxCenters = TAX_CENTERS_PER_REGION[region] || [];
    taxCenters.forEach((taxCenter) => {
      const tcmName = `${generateName()} ${generateName()}`;
      users.push({
        id: generateUserId('tax_center_manager'),
        full_name: tcmName,
        email: `${tcmName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
        role: 'tax_center_manager',
        title: 'Tax Center Manager',
        accessLevel: 'tax_center_only',
        canAccess: [taxCenter],
        org_context: {
          assignedRegion: region,
          assignedRegionName: region,
          assignedTaxCenter: taxCenter,
          assignedTaxCenterName: taxCenter,
          teamId: null,
          teamName: null,
          auditType: null,
          level: 'tax_center'
        }
      });

      // Process Owner at Tax Center (1 per tax center = 15 total) - SHARED for all audit types
      const poName = `${generateName()} ${generateName()}`;
      users.push({
        id: generateUserId('process_owner'),
        full_name: poName,
        email: `${poName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
        role: 'process_owner',
        title: 'Process Owner',
        accessLevel: 'tax_center_only',
        canAccess: [taxCenter, 'all_audit_types'],
        org_context: {
          assignedRegion: region,
          assignedRegionName: region,
          assignedTaxCenter: taxCenter,
          assignedTaxCenterName: taxCenter,
          teamId: null,
          teamName: `${taxCenter} - Process Management`,
          auditType: null, // NULL = handles ALL audit types
          level: 'tax_center'
        }
      });

      // Cascade Team at Tax Center (1 per tax center = 15 total) - SHARED for all audit types
      const catName = `${generateName()} ${generateName()}`;
      const cascadeTeamId = `CASCADE-${region.substring(0, 3)}-${taxCenter.split(' ')[taxCenter.split(' ').length - 1]}`;
      users.push({
        id: generateUserId('cascade_audit_team'),
        full_name: catName,
        email: `${catName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
        role: 'cascade_audit_team',
        title: 'Cascade Audit Team',
        accessLevel: 'tax_center_only',
        canAccess: [taxCenter, 'all_audit_types'],
        org_context: {
          assignedRegion: region,
          assignedRegionName: region,
          assignedTaxCenter: taxCenter,
          assignedTaxCenterName: taxCenter,
          teamId: cascadeTeamId,
          teamName: `${taxCenter} - Cascade Team`,
          auditType: null, // NULL = handles ALL audit types
          level: 'tax_center'
        }
      });

      // Team Leaders (3 per tax center = 1 per audit type = 3 × 3 × 5 = 45 total)
      AUDIT_TYPES.forEach((auditType) => {
        const teamId = `TEAM-${region.substring(0, 3)}-${taxCenter.split(' ')[taxCenter.split(' ').length - 1]}-${auditType.split(' ')[0].substring(0, 3)}`;
        const tlName = `${generateName()} ${generateName()}`;
        users.push({
          id: generateUserId('team_leader'),
          full_name: tlName,
          email: `${tlName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
          role: 'team_leader',
          title: 'Team Leader',
          accessLevel: 'tax_center_only',
          canAccess: [taxCenter, auditType],
          org_context: {
            assignedRegion: region,
            assignedRegionName: region,
            assignedTaxCenter: taxCenter,
            assignedTaxCenterName: taxCenter,
            teamId: teamId,
            teamName: `${taxCenter} - ${auditType} Team`,
            auditType: auditType, // TEAM LEADER FOR SPECIFIC AUDIT TYPE
            level: 'team'
          }
        });

        // Auditors (3 per team = 3 × 3 × 3 × 5 = 135 total)
        for (let i = 0; i < 3; i++) {
          const auditorName = `${generateName()} ${generateName()}`;
          users.push({
            id: generateUserId('auditor'),
            full_name: auditorName,
            email: `${auditorName.toLowerCase().replace(/\s+/g, '.')}@mor.gov.et`,
            role: 'auditor',
            title: 'Auditor',
            accessLevel: 'assigned_cases_only',
            canAccess: ['assigned_cases'],
            org_context: {
              assignedRegion: region,
              assignedRegionName: region,
              assignedTaxCenter: taxCenter,
              assignedTaxCenterName: taxCenter,
              teamId: teamId,
              teamName: `${taxCenter} - ${auditType} Team`,
              auditType: auditType,
              level: 'auditor'
            }
          });
        }
      });
    });
  });

  allUsers = users;
  return users;
}

/**
 * Get all users
 */
export function getAllUsers() {
  return generateOrganizationalUsers();
}

/**
 * Get users by role
 */
export function getUsersByRole(role) {
  return generateOrganizationalUsers().filter(u => u.role === role);
}

/**
 * Get users by region
 */
export function getUsersByRegion(region) {
  return generateOrganizationalUsers().filter(u => u.org_context.assignedRegion === region);
}

/**
 * Get users by tax center
 */
export function getUsersByTaxCenter(taxCenter) {
  return generateOrganizationalUsers().filter(u => u.org_context.assignedTaxCenter === taxCenter);
}

/**
 * Get user by ID
 */
export function getUserById(id) {
  return generateOrganizationalUsers().find(u => u.id === id);
}

/**
 * Get team members for a specific team
 */
export function getTeamMembers(teamId) {
  return generateOrganizationalUsers().filter(u => u.org_context.teamId === teamId);
}

/**
 * Get regional users (includes regional director and all subordinates)
 */
export function getRegionalUsers(region) {
  return generateOrganizationalUsers().filter(u => 
    u.org_context.assignedRegion === region || u.role === 'regional_director'
  );
}

/**
 * Check if user has access to resource
 */
export function canUserAccess(user, resource) {
  if (!user || !user.canAccess) return false;
  return user.canAccess.includes(resource) || user.canAccess.includes('all_regions') || user.canAccess.includes('all_tax_centers');
}

/**
 * Get all regions
 */
export function getAllRegions() {
  return REGIONS;
}

/**
 * Get tax centers for a region
 */
export function getTaxCentersForRegion(region) {
  return TAX_CENTERS_PER_REGION[region] || [];
}

/**
 * Get all audit types
 */
export function getAllAuditTypes() {
  return AUDIT_TYPES;
}

/**
 * Statistics
 */
export function getStatistics() {
  const users = generateOrganizationalUsers();
  return {
    totalUsers: users.length,
    byRole: {
      audit_team: users.filter(u => u.role === 'audit_team').length,
      senior_management: users.filter(u => u.role === 'senior_management').length,
      audit_director: users.filter(u => u.role === 'audit_director').length,
      cascade_audit_team: users.filter(u => u.role === 'cascade_audit_team').length,
      process_owner: users.filter(u => u.role === 'process_owner').length,
      regional_director: users.filter(u => u.role === 'regional_director').length,
      tax_center_manager: users.filter(u => u.role === 'tax_center_manager').length,
      team_leader: users.filter(u => u.role === 'team_leader').length,
      auditor: users.filter(u => u.role === 'auditor').length,
    },
    byRegion: REGIONS.reduce((acc, region) => {
      acc[region] = users.filter(u => u.org_context.assignedRegion === region).length;
      return acc;
    }, {})
  };
}

// Generate users on module load
generateOrganizationalUsers();
