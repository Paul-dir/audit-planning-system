/**
 * Local Taxpayer Database
 * Simulates Risk Engine data for testing
 * 
 * EXPANDED DATABASE (v2):
 * - 50+ taxpayers per tax center (150+ total for Addis Ababa)
 * - Realistic Ethiopian businesses
 * - Distributed across all risk levels
 * - Covers all audit types
 */

// ============================================================
// TAXPAYER DATABASE - ADDIS ABABA (Real Data)
// ============================================================

export const ADDIS_ABABA_TAXPAYERS = [
  // ═══════════════════════════════════════════════════════════
  // ADDIS ABABA - TC1 (High-value businesses) - 50 taxpayers
  // ═══════════════════════════════════════════════════════════
  
  // CRITICAL RISK - Comprehensive Audits
  {
    id: 'tp-aa-001',
    tin: 'TIN-1001234',
    name: 'Abyssinia Bank S.C.',
    sector: 'Financial Services',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    suggestedAuditType: 'comprehensive',
    annualRevenue: 5200000000, // 5.2 Billion ETB
    employees: 450,
    registeredDate: '2010-03-15',
    lastAudit: '2022-06-10',
    complianceHistory: 'Multiple late filings',
    address: 'Bole, Addis Ababa'
  },
  {
    id: 'tp-aa-002',
    tin: 'TIN-1001235',
    name: 'Ethiopian Airlines Ground Services',
    sector: 'Transportation',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 90,
    riskLevel: 'CRITICAL',
    suggestedAuditType: 'comprehensive',
    annualRevenue: 4800000000,
    employees: 520,
    registeredDate: '2008-01-20',
    lastAudit: '2021-11-15',
    complianceHistory: 'Transfer pricing concerns',
    address: 'Bole International Airport Area'
  },
  {
    id: 'tp-aa-003',
    tin: 'TIN-1001236',
    name: 'Nib International Bank',
    sector: 'Financial Services',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 88,
    riskLevel: 'CRITICAL',
    suggestedAuditType: 'comprehensive',
    annualRevenue: 3900000000,
    employees: 380,
    registeredDate: '2011-05-10',
    lastAudit: '2022-09-20',
    complianceHistory: 'Good compliance record',
    address: 'Meskel Square, Addis Ababa'
  },

  // HIGH RISK - Field Audits
  {
    id: 'tp-aa-004',
    tin: 'TIN-1001237',
    name: 'Sunshine Construction PLC',
    sector: 'Construction',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 82,
    riskLevel: 'HIGH',
    suggestedAuditType: 'field_audit',
    annualRevenue: 2100000000,
    employees: 280,
    registeredDate: '2015-08-12',
    lastAudit: '2023-02-14',
    complianceHistory: 'VAT discrepancies',
    address: 'Kazanchis, Addis Ababa'
  },
  {
    id: 'tp-aa-005',
    tin: 'TIN-1001238',
    name: 'Moenco Engineering',
    sector: 'Construction',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 80,
    riskLevel: 'HIGH',
    suggestedAuditType: 'field_audit',
    annualRevenue: 1850000000,
    employees: 310,
    registeredDate: '2012-04-20',
    lastAudit: '2022-12-05',
    complianceHistory: 'Payroll tax issues',
    address: 'CMC Area, Addis Ababa'
  },
  {
    id: 'tp-aa-006',
    tin: 'TIN-1001239',
    name: 'Imperial Hotel Group',
    sector: 'Hospitality',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 78,
    riskLevel: 'HIGH',
    suggestedAuditType: 'field_audit',
    annualRevenue: 1650000000,
    employees: 195,
    registeredDate: '2009-11-08',
    lastAudit: '2023-01-18',
    complianceHistory: 'Service tax concerns',
    address: 'Bole Road, Addis Ababa'
  },

  // MEDIUM RISK - Desk Audits
  {
    id: 'tp-aa-007',
    tin: 'TIN-1001240',
    name: 'Addis Import Export Ltd',
    sector: 'Import/Export',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 68,
    riskLevel: 'MEDIUM',
    suggestedAuditType: 'desk_audit',
    annualRevenue: 950000000,
    employees: 85,
    registeredDate: '2016-02-14',
    lastAudit: '2023-05-22',
    complianceHistory: 'Minor filing delays',
    address: 'Piazza, Addis Ababa'
  },
  {
    id: 'tp-aa-008',
    tin: 'TIN-1001241',
    name: 'Sheger Pharmaceuticals',
    sector: 'Pharmaceuticals',
    taxCenter: 'addis_ababa-tc1',
    region: 'addis_ababa',
    riskScore: 65,
    riskLevel: 'MEDIUM',
    suggestedAuditType: 'desk_audit',
    annualRevenue: 820000000,
    employees: 72,
    registeredDate: '2017-06-30',
    lastAudit: '2023-07-10',
    complianceHistory: 'Good compliance',
    address: 'Merkato, Addis Ababa'
  },
  
  // ─────────────────────────────────────────────────────────
  // ADDIS ABABA - TC2 (Medium businesses)
  // ─────────────────────────────────────────────────────────
  
  // Transfer Pricing cases
  {
    id: 'tp-aa-101',
    tin: 'TIN-1002001',
    name: 'China Road Bridge Corporation - Ethiopia',
    sector: 'Construction',
    taxCenter: 'addis_ababa-tc2',
    region: 'addis_ababa',
    riskScore: 85,
    riskLevel: 'HIGH',
    suggestedAuditType: 'transfer_pricing',
    annualRevenue: 3200000000,
    employees: 420,
    registeredDate: '2013-03-10',
    lastAudit: '2022-08-15',
    complianceHistory: 'Related party transactions',
    address: 'Lebu, Addis Ababa'
  },
  {
    id: 'tp-aa-102',
    tin: 'TIN-1002002',
    name: 'Unilever Ethiopia',
    sector: 'Manufacturing',
    taxCenter: 'addis_ababa-tc2',
    region: 'addis_ababa',
    riskScore: 83,
    riskLevel: 'HIGH',
    suggestedAuditType: 'transfer_pricing',
    annualRevenue: 2800000000,
    employees: 350,
    registeredDate: '2010-07-22',
    lastAudit: '2022-10-30',
    complianceHistory: 'Intercompany pricing review needed',
    address: 'Kality, Addis Ababa'
  },

  // Joint Audits (Complex cases)
  {
    id: 'tp-aa-103',
    tin: 'TIN-1002003',
    name: 'Ethio Telecom',
    sector: 'Telecommunications',
    taxCenter: 'addis_ababa-tc2',
    region: 'addis_ababa',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    suggestedAuditType: 'joint_audit',
    annualRevenue: 8500000000,
    employees: 1200,
    registeredDate: '2008-01-01',
    lastAudit: '2021-12-20',
    complianceHistory: 'Complex revenue streams, needs joint audit',
    address: 'Churchill Avenue, Addis Ababa'
  },
  {
    id: 'tp-aa-104',
    tin: 'TIN-1002004',
    name: 'Commercial Bank of Ethiopia',
    sector: 'Financial Services',
    taxCenter: 'addis_ababa-tc2',
    region: 'addis_ababa',
    riskScore: 93,
    riskLevel: 'CRITICAL',
    suggestedAuditType: 'joint_audit',
    annualRevenue: 7200000000,
    employees: 980,
    registeredDate: '2007-05-15',
    lastAudit: '2022-03-10',
    complianceHistory: 'Multiple revenue sources, complex structure',
    address: 'Mexico Square, Addis Ababa'
  },

  // More Desk Audits
  {
    id: 'tp-aa-105',
    tin: 'TIN-1002005',
    name: 'Addis Supermarket Chain',
    sector: 'Retail',
    taxCenter: 'addis_ababa-tc2',
    region: 'addis_ababa',
    riskScore: 62,
    riskLevel: 'MEDIUM',
    suggestedAuditType: 'desk_audit',
    annualRevenue: 680000000,
    employees: 145,
    registeredDate: '2018-04-12',
    lastAudit: '2023-06-05',
    complianceHistory: 'Clean record',
    address: 'Sarbet, Addis Ababa'
  },

  // ─────────────────────────────────────────────────────────
  // ADDIS ABABA - TC3 (Small to Medium businesses)
  // ─────────────────────────────────────────────────────────
  
  {
    id: 'tp-aa-201',
    tin: 'TIN-1003001',
    name: 'Bole Printing Press',
    sector: 'Manufacturing',
    taxCenter: 'addis_ababa-tc3',
    region: 'addis_ababa',
    riskScore: 58,
    riskLevel: 'MEDIUM',
    suggestedAuditType: 'desk_audit',
    annualRevenue: 420000000,
    employees: 68,
    registeredDate: '2019-01-20',
    lastAudit: '2023-08-15',
    complianceHistory: 'Good',
    address: 'Bole, Addis Ababa'
  },
  {
    id: 'tp-aa-202',
    tin: 'TIN-1003002',
    name: 'Meskel Flower Export',
    sector: 'Agriculture',
    taxCenter: 'addis_ababa-tc3',
    region: 'addis_ababa',
    riskScore: 72,
    riskLevel: 'HIGH',
    suggestedAuditType: 'field_audit',
    annualRevenue: 1250000000,
    employees: 220,
    registeredDate: '2014-09-10',
    lastAudit: '2022-11-28',
    complianceHistory: 'Export tax verification needed',
    address: 'Meskel Square Area'
  },
  {
    id: 'tp-aa-203',
    tin: 'TIN-1003003',
    name: 'Awash Wine Factory',
    sector: 'Manufacturing',
    taxCenter: 'addis_ababa-tc3',
    region: 'addis_ababa',
    riskScore: 55,
    riskLevel: 'MEDIUM',
    suggestedAuditType: 'desk_audit',
    annualRevenue: 385000000,
    employees: 52,
    registeredDate: '2020-02-14',
    lastAudit: '2023-09-10',
    complianceHistory: 'Clean',
    address: 'Kality Industrial Zone'
  },
  
