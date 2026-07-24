import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import RegionSelectorCards from '../RegionSelectorCards';
import { loadData } from '../../utils/data';
import { auditConfig } from '../../config/auditConfig';
import { useRegional } from '../../context/RegionalContext';

function RiskEngineView({ userRole: propUserRole, selectedRegion: propSelectedRegion }) {
  const contextData = useRegional();
  const contextUserRole = contextData?.userRole;
  const contextSelectedRegion = contextData?.selectedRegion;
  const setSelectedRegionContext = contextData?.setSelectedRegion;
  const assignedRegion = contextData?.assignedRegion;
  
  // Use prop if provided, otherwise use context
  const userRole = propUserRole || contextUserRole;
  const selectedRegion = propSelectedRegion || contextSelectedRegion;
  const setSelectedRegion = (region) => {
    if (setSelectedRegionContext) setSelectedRegionContext(region);
  };
  
  const [level, setLevel] = useState(1); // 1=National, 2=Regional, 3=TaxCenter, 4=Taxpayer
  const [localSelectedRegion, setLocalSelectedRegion] = useState(selectedRegion || null);
  const [selectedTaxCenter, setSelectedTaxCenter] = useState(null);
  const [selectedTaxpayer, setSelectedTaxpayer] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [showRegionSelector, setShowRegionSelector] = useState(true);

  useEffect(() => {
    loadRiskData();
    
    // For regional directors and tax center managers, they need to select region first
    if (userRole === 'regional') {
      setLevel(2);  // Will show regional level (but after region selection)
      // Only show selector if no region selected yet
      setShowRegionSelector(!localSelectedRegion);
    } else if (userRole === 'tax_center') {
      setLevel(3);  // Will show tax center level
      // Only show selector if no region selected yet
      setShowRegionSelector(!localSelectedRegion);
    } else {
      // All other roles (audit_team, director, senior_management) see national view
      setLevel(1);  // National level
      setShowRegionSelector(false); // No selector needed for national view
    }
  }, [userRole]);

  const loadRiskData = () => {
    const data = loadData();
    // Check if riskEngine exists and has data (must have 'national' key)
    setRiskData((data.riskEngine && data.riskEngine.national) ? data.riskEngine : generateDefaultRiskData());
  };

  // Handler for region selection that advances to regional view
  const handleRegionSelect = (region) => {
    setLocalSelectedRegion(region);
    setSelectedRegion(region);
    setShowRegionSelector(false);
  };

  // If regional director or tax center manager, they must select region first
  if ((userRole === 'regional' || userRole === 'tax_center') && showRegionSelector) {
    return (
      <RegionSelectorCards
        onRegionSelect={handleRegionSelect}
        currentRegion={localSelectedRegion}
        userRole={userRole}
        assignedRegion={assignedRegion}
      />
    );
  }

  const generateDefaultRiskData = () => {
    // National level data
    const national = {
      totalRegistered: 5200000,
      activeTaxpayers: 4850000,
      assessedTaxpayers: 4820000,
      riskySuspects: 430000,
      riskDistribution: {
        low: 180000,
        medium: 150000,
        high: 80000,
        critical: 20000,
      },
      revenueAtRisk: 12400000000,
      byAuditType: [
        { type: 'Desk Audit', candidates: 55000 },
        { type: 'Field Audit', candidates: 35000 },
        { type: 'Joint Audit', candidates: 18000 },
        { type: 'Transfer Pricing', candidates: 7500 },
        { type: 'Comprehensive', candidates: 650 },
        { type: 'Single Issue', candidates: 300 }
      ],
      byIndustry: [
        { industry: 'Construction', highRisk: 18000 },
        { industry: 'Manufacturing', highRisk: 15000 },
        { industry: 'Wholesale', highRisk: 12000 },
        { industry: 'Import/Export', highRisk: 9500 },
        { industry: 'Services', highRisk: 8000 },
        { industry: 'Retail', highRisk: 17500 }
      ],
      byTaxType: [
        { type: 'VAT', risky: 80000 },
        { type: 'Corporate Income Tax', risky: 55000 },
        { type: 'Payroll Tax', risky: 25000 },
        { type: 'Excise Tax', risky: 8000 },
        { type: 'Other', risky: 282000 }
      ],
      riskIndicators: [
        { indicator: 'Late Filing', taxpayers: 120000 },
        { indicator: 'Late Payment', taxpayers: 90000 },
        { indicator: 'VAT Mismatch', taxpayers: 45000 },
        { indicator: 'Continuous Losses', taxpayers: 30000 },
        { indicator: 'Import vs Sales Mismatch', taxpayers: 18000 },
        { indicator: 'Large Variance', taxpayers: 127000 }
      ],
      complianceSummary: {
        filingCompliance: 92.5,
        paymentCompliance: 87.3,
        registrationCompliance: 95.8
      }
    };

    // Regional data
    const regionalBreakdown = auditConfig.regions.map(region => ({
      name: region.name,
      totalTaxpayers: region.taxpayers * 12,
      riskySuspects: Math.round(region.taxpayers * 12 * 0.078),
      highRisk: Math.round(region.taxpayers * 12 * 0.018),
      critical: Math.round(region.taxpayers * 12 * 0.003),
      revenueAtRisk: Math.round(region.taxpayers * 12 * 300000),
      auditTypeCandidates: [
        { type: 'Desk Audit', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.35) },
        { type: 'Field Audit', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.25) },
        { type: 'Joint Audit', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.15) },
        { type: 'Transfer Pricing', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.08) },
        { type: 'Comprehensive', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.12) },
        { type: 'Single Issue', candidates: Math.round(region.taxpayers * 12 * 0.078 * 0.05) }
      ],
      taxTypeBreakdown: [
        { type: 'VAT', risky: Math.round(region.taxpayers * 12 * 0.078 * 0.35) },
        { type: 'Corporate Income Tax', risky: Math.round(region.taxpayers * 12 * 0.078 * 0.30) },
        { type: 'Payroll Tax', risky: Math.round(region.taxpayers * 12 * 0.078 * 0.18) },
        { type: 'Excise Tax', risky: Math.round(region.taxpayers * 12 * 0.078 * 0.10) },
        { type: 'Other', risky: Math.round(region.taxpayers * 12 * 0.078 * 0.07) }
      ],
      taxCenters: generateTaxCenters(region)
    }));

    return {
      national,
      regional: regionalBreakdown
    };
  };

  const generateTaxCenters = (region) => {
    return [
      {
        id: `${region.name}-TC1`,
        name: `${region.name} Tax Center 1`,
        totalTaxpayers: Math.round(region.taxpayers * 12 * 0.4),
        highRisk: Math.round(region.taxpayers * 12 * 0.018 * 0.4),
        critical: Math.round(region.taxpayers * 12 * 0.003 * 0.4),
        revenueAtRisk: Math.round(region.taxpayers * 12 * 300000 * 0.4),
        auditTypeCandidates: generateAuditTypeCandidates(region, 0.4),
        taxTypeBreakdown: generateTaxTypeBreakdown(region, 0.4),
        taxpayers: generateTaxpayerDetails(region, 0.4)
      },
      {
        id: `${region.name}-TC2`,
        name: `${region.name} Tax Center 2`,
        totalTaxpayers: Math.round(region.taxpayers * 12 * 0.3),
        highRisk: Math.round(region.taxpayers * 12 * 0.018 * 0.3),
        critical: Math.round(region.taxpayers * 12 * 0.003 * 0.3),
        revenueAtRisk: Math.round(region.taxpayers * 12 * 300000 * 0.3),
        auditTypeCandidates: generateAuditTypeCandidates(region, 0.3),
        taxTypeBreakdown: generateTaxTypeBreakdown(region, 0.3),
        taxpayers: generateTaxpayerDetails(region, 0.3)
      },
      {
        id: `${region.name}-TC3`,
        name: `${region.name} Tax Center 3`,
        totalTaxpayers: Math.round(region.taxpayers * 12 * 0.3),
        highRisk: Math.round(region.taxpayers * 12 * 0.018 * 0.3),
        critical: Math.round(region.taxpayers * 12 * 0.003 * 0.3),
        revenueAtRisk: Math.round(region.taxpayers * 12 * 300000 * 0.3),
        auditTypeCandidates: generateAuditTypeCandidates(region, 0.3),
        taxTypeBreakdown: generateTaxTypeBreakdown(region, 0.3),
        taxpayers: generateTaxpayerDetails(region, 0.3)
      }
    ];
  };

  const generateAuditTypeCandidates = (region, proportion) => {
    const total = Math.round(region.taxpayers * 12 * 0.078 * proportion);
    return [
      { type: 'Desk Audit', candidates: Math.round(total * 0.35) },
      { type: 'Field Audit', candidates: Math.round(total * 0.25) },
      { type: 'Joint Audit', candidates: Math.round(total * 0.15) },
      { type: 'Transfer Pricing', candidates: Math.round(total * 0.08) },
      { type: 'Comprehensive', candidates: Math.round(total * 0.12) },
      { type: 'Single Issue', candidates: Math.round(total * 0.05) }
    ];
  };

  const generateTaxTypeBreakdown = (region, proportion) => {
    const total = Math.round(region.taxpayers * 12 * 0.078 * proportion);
    return [
      { type: 'VAT', risky: Math.round(total * 0.35) },
      { type: 'Corporate Income Tax', risky: Math.round(total * 0.30) },
      { type: 'Payroll Tax', risky: Math.round(total * 0.18) },
      { type: 'Excise Tax', risky: Math.round(total * 0.10) },
      { type: 'Other', risky: Math.round(total * 0.07) }
    ];
  };

  const generateTaxpayerDetails = (region, proportion) => {
    const count = Math.min(20, Math.round(region.taxpayers * 12 * 0.018 * proportion)); // Show top 20
    const taxpayers = [];
    
    for (let i = 0; i < count; i++) {
      const tin = `ET${String(100001 + i).padStart(6, '0')}`;
      const riskScore = Math.round(50 + Math.random() * 50); // 50-100
      const riskLevel = riskScore >= 85 ? 'Critical' : riskScore >= 70 ? 'High' : 'Medium';
      
      taxpayers.push({
        tin,
        businessName: `Business Name ${i + 1}`,
        businessType: ['Construction', 'Manufacturing', 'Wholesale', 'Retail', 'Services'][Math.floor(Math.random() * 5)],
        riskScore,
        riskLevel,
        revenueAtRisk: Math.round(500000 + Math.random() * 4500000),
        recommendedAuditType: ['Desk Audit', 'Field Audit', 'Comprehensive'][Math.floor(Math.random() * 3)],
        riskIndicators: [
          {
            indicator: 'Late Filing',
            evidence: `Filed ${2 + Math.floor(Math.random() * 8)} times late in past year`,
            severity: 'Medium'
          },
          {
            indicator: 'VAT Mismatch',
            evidence: `VAT variance of ${Math.round(100 + Math.random() * 900)}K ETB detected`,
            severity: riskLevel === 'Critical' ? 'High' : 'Medium'
          },
          {
            indicator: 'Late Payments',
            evidence: `${1 + Math.floor(Math.random() * 4)} late payments totaling ${Math.round(200000 + Math.random() * 1800000)} ETB`,
            severity: 'Medium'
          },
          {
            indicator: 'Import vs Sales',
            evidence: `Import purchases ${Math.round(20 + Math.random() * 80)}% higher than sales recorded`,
            severity: riskLevel === 'Critical' ? 'High' : 'Low'
          }
        ],
        lastAudit: Math.random() > 0.7 ? '2023' : '2022',
        complianceHistory: 'Generally compliant with some late filings'
      });
    }
    
    return taxpayers;
  };

  // Level 1: National View (MOR)
  const renderNationalView = () => {
    if (!riskData) return null;
    const { national } = riskData;

    return (
      <div>
        <div className="detail-header">
          <h2><i className="fas fa-globe"></i> Risk Engine - National Level (Ministry of Revenue)</h2>
          <Badge status="Level 1: MOR" className="director-approved" />
        </div>

        <div className="section-title"><i className="fas fa-chart-line"></i> Taxpayer Population Overview</div>
        <div className="cards">
          <Card title="Total Registered" number={national.totalRegistered.toLocaleString()} icon="fas fa-users" />
          <Card title="Active Taxpayers" number={national.activeTaxpayers.toLocaleString()} icon="fas fa-user-check" />
          <Card title="Risky Suspects" number={national.riskySuspects.toLocaleString()} icon="fas fa-exclamation-circle" />
          <Card title="Revenue at Risk" number={`${(national.revenueAtRisk / 1000000000).toFixed(1)}B ETB`} icon="fas fa-dollar-sign" />
        </div>

        <div className="section-title"><i className="fas fa-traffic-light"></i> Risk Distribution</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Risk Level</th>
                <th>Taxpayers</th>
                <th>% of Total</th>
                <th>% of Risky</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#1a3a1a' }}>
                <td><strong>Low Risk</strong></td>
                <td>{national.riskDistribution.low.toLocaleString()}</td>
                <td>{((national.riskDistribution.low / national.totalRegistered) * 100).toFixed(2)}%</td>
                <td>-</td>
              </tr>
              <tr style={{ background: '#1e2a3a' }}>
                <td><strong style={{ color: '#ffa500' }}>Medium Risk</strong></td>
                <td>{national.riskDistribution.medium.toLocaleString()}</td>
                <td>{((national.riskDistribution.medium / national.totalRegistered) * 100).toFixed(2)}%</td>
                <td>{((national.riskDistribution.medium / national.riskySuspects) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ background: '#3a1a1a' }}>
                <td><strong>High Risk</strong></td>
                <td>{national.riskDistribution.high.toLocaleString()}</td>
                <td>{((national.riskDistribution.high / national.totalRegistered) * 100).toFixed(2)}%</td>
                <td>{((national.riskDistribution.high / national.riskySuspects) * 100).toFixed(1)}%</td>
              </tr>
              <tr style={{ background: '#3a1a1a', color: '#ff5252' }}>
                <td><strong>Critical Risk</strong></td>
                <td>{national.riskDistribution.critical.toLocaleString()}</td>
                <td>{((national.riskDistribution.critical / national.totalRegistered) * 100).toFixed(2)}%</td>
                <td>{((national.riskDistribution.critical / national.riskySuspects) * 100).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-tasks"></i> Audit Type Candidates (National)</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Candidates</th>
                <th>% of Risky</th>
              </tr>
            </thead>
            <tbody>
              {national.byAuditType.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.candidates.toLocaleString()}</td>
                  <td>{((item.candidates / national.riskySuspects) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td>TOTAL CANDIDATES</td>
                <td>{national.byAuditType.reduce((sum, item) => sum + item.candidates, 0).toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-percentage"></i> Risk by Tax Type (National)</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Risky Taxpayers</th>
                <th>% of Total Risky</th>
              </tr>
            </thead>
            <tbody>
              {national.byTaxType.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.risky.toLocaleString()}</td>
                  <td>{((item.risky / national.riskySuspects) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td>TOTAL RISKY</td>
                <td>{national.byTaxType.reduce((sum, item) => sum + item.risky, 0).toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Industry</th>
                <th>High Risk</th>
              </tr>
            </thead>
            <tbody>
              {national.byIndustry.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.industry}</strong></td>
                  <td>{item.highRisk.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-bar" style={{ marginTop: '24px' }}>
          <div></div>
          {userRole !== 'regional' && userRole !== 'tax_center' && (
            <button className="btn btn-primary" onClick={() => { setLevel(2); }}>
              <i className="fas fa-map"></i> View by Region
            </button>
          )}
        </div>
      </div>
    );
  };

  // Level 2: Regional View - Shows ONLY selected region data (NO national data visible)
  const renderRegionalView = () => {
    if (!riskData || !localSelectedRegion) return null;
    const region = riskData.regional.find(r => r.name === localSelectedRegion);
    if (!region) return null;
    
    const isAssignedRegion = userRole === 'regional' && localSelectedRegion === assignedRegion;

    return (
      <div style={{ width: '100%' }}>
        <div className="action-bar">
          {userRole === 'regional' || userRole === 'tax_center' ? (
            <button className="btn btn-outline" onClick={() => setShowRegionSelector(true)}>
              <i className="fas fa-exchange-alt"></i> Select Different Region
            </button>
          ) : (
            <button className="btn btn-outline" onClick={() => { setLevel(1); setLocalSelectedRegion(null); }}>
              <i className="fas fa-arrow-left"></i> Back to National View
            </button>
          )}
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-map-pin"></i> {localSelectedRegion} Region - Risk Analysis {isAssignedRegion ? '(YOUR REGION)' : ''}</h2>
          <Badge status="Level 2: Regional Detail" className="director-approved" />
        </div>

        <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #ffb74d' }}>
          <strong>⚠️ THIS PAGE SHOWS DATA FOR {localSelectedRegion.toUpperCase()} REGION ONLY</strong>
          <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '12px' }}>All numbers and percentages below are specific to {localSelectedRegion} region. National data is NOT shown here.</p>
          {isAssignedRegion && (
            <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '12px', color: '#388e3c' }}>
              <strong>✓ This is your assigned region for primary focus.</strong>
            </p>
          )}
        </div>

        <div className="cards">
          <Card title="Total Taxpayers" number={region.totalTaxpayers.toLocaleString()} icon="fas fa-users" />
          <Card title="Risky Suspects" number={region.riskySuspects.toLocaleString()} icon="fas fa-exclamation-circle" />
          <Card title="High Risk" number={region.highRisk.toLocaleString()} icon="fas fa-exclamation-triangle" />
          <Card title="Critical Risk" number={region.critical.toLocaleString()} icon="fas fa-skull-crossbones" />
          <Card title="Revenue at Risk" number={`${(region.revenueAtRisk / 1000000).toFixed(0)}M ETB`} icon="fas fa-dollar-sign" />
        </div>

        <div className="section-title"><i className="fas fa-tasks"></i> Audit Type Candidates in {localSelectedRegion}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Candidates</th>
                <th>% of {localSelectedRegion} Risky</th>
              </tr>
            </thead>
            <tbody>
              {region.auditTypeCandidates.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.candidates.toLocaleString()}</td>
                  <td>{((item.candidates / region.riskySuspects) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td>TOTAL CANDIDATES IN {localSelectedRegion.toUpperCase()}</td>
                <td>{region.auditTypeCandidates.reduce((sum, item) => sum + item.candidates, 0).toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-percentage"></i> Risk by Tax Type in {localSelectedRegion}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Risky Taxpayers</th>
                <th>% of {localSelectedRegion} Risky</th>
              </tr>
            </thead>
            <tbody>
              {region.taxTypeBreakdown.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.risky.toLocaleString()}</td>
                  <td>{((item.risky / region.riskySuspects) * 100).toFixed(1)}%</td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td>TOTAL RISKY IN {localSelectedRegion.toUpperCase()}</td>
                <td>{region.taxTypeBreakdown.reduce((sum, item) => sum + item.risky, 0).toLocaleString()}</td>
                <td>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-building"></i> Tax Centers in {localSelectedRegion}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Center</th>
                <th>Taxpayers</th>
                <th>High Risk</th>
                <th>Critical Risk</th>
                <th>Revenue at Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {region.taxCenters.map((tc, i) => (
                <tr key={i}>
                  <td><strong>{tc.name}</strong></td>
                  <td>{tc.totalTaxpayers.toLocaleString()}</td>
                  <td>{tc.highRisk.toLocaleString()}</td>
                  <td>{tc.critical.toLocaleString()}</td>
                  <td>{(tc.revenueAtRisk / 1000000).toFixed(0)}M ETB</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => { setLevel(3); setSelectedTaxCenter(tc); }}
                    >
                      <i className="fas fa-eye"></i> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '12px', borderRadius: '8px', marginTop: '24px', border: '1px solid #1976d2' }}>
          <strong>ℹ️ Regional Analysis Complete</strong>
          <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '12px' }}>This page shows comprehensive risk analysis for {localSelectedRegion} region only. Click on a tax center to see more details, or go back to select another region.</p>
        </div>
      </div>
    );
  };

  // Level 3: Tax Center View
  const renderTaxCenterView = () => {
    if (!riskData || !localSelectedRegion) return null;
    const region = riskData.regional.find(r => r.name === localSelectedRegion);
    if (!region) return null;

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => { setLevel(2); setLocalSelectedRegion(null); setSelectedTaxCenter(null); }}>
            <i className="fas fa-arrow-left"></i> Back to {localSelectedRegion} Region
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-map-pin"></i> {localSelectedRegion} - Tax Centers Overview</h2>
          <Badge status="Level 3: Tax Center" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Center</th>
                <th>Taxpayers</th>
                <th>High Risk</th>
                <th>Critical</th>
                <th>Revenue at Risk</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {region.taxCenters.map((tc, i) => (
                <tr key={i}>
                  <td><strong>{tc.name}</strong></td>
                  <td>{tc.totalTaxpayers.toLocaleString()}</td>
                  <td>{tc.highRisk.toLocaleString()}</td>
                  <td>{tc.critical.toLocaleString()}</td>
                  <td>{(tc.revenueAtRisk / 1000000).toFixed(0)}M ETB</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => { setLevel(3.5); setSelectedTaxCenter(tc); }}
                    >
                      <i className="fas fa-eye"></i> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Level 3.5: Tax Center Details View
  const renderTaxCenterDetailsView = () => {
    if (!selectedTaxCenter) return null;

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => { setLevel(3); setSelectedTaxCenter(null); }}>
            <i className="fas fa-arrow-left"></i> Back to Tax Centers
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-building"></i> {selectedTaxCenter.name} - Detailed Analysis</h2>
          <Badge status="Level 3: Tax Center Detail" className="director-approved" />
        </div>

        <div className="cards">
          <Card title="Total Taxpayers" number={selectedTaxCenter.totalTaxpayers.toLocaleString()} icon="fas fa-users" />
          <Card title="High Risk" number={selectedTaxCenter.highRisk.toLocaleString()} icon="fas fa-exclamation-triangle" />
          <Card title="Critical Risk" number={selectedTaxCenter.critical.toLocaleString()} icon="fas fa-skull-crossbones" />
          <Card title="Revenue at Risk" number={`${(selectedTaxCenter.revenueAtRisk / 1000000).toFixed(1)}M ETB`} icon="fas fa-dollar-sign" />
        </div>

        <div className="section-title"><i className="fas fa-tasks"></i> Audit Type Candidates in {selectedTaxCenter.name}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Candidates</th>
                <th>% of Tax Center</th>
              </tr>
            </thead>
            <tbody>
              {selectedTaxCenter.auditTypeCandidates.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.candidates.toLocaleString()}</td>
                  <td>{((item.candidates / selectedTaxCenter.highRisk) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-percentage"></i> Risk by Tax Type in {selectedTaxCenter.name}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Risky Taxpayers</th>
                <th>% of Tax Center</th>
              </tr>
            </thead>
            <tbody>
              {selectedTaxCenter.taxTypeBreakdown.map((item, i) => (
                <tr key={i}>
                  <td><strong>{item.type}</strong></td>
                  <td>{item.risky.toLocaleString()}</td>
                  <td>{((item.risky / selectedTaxCenter.highRisk) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="action-bar" style={{ marginTop: '24px' }}>
          <div></div>
          <button 
            className="btn btn-success"
            onClick={() => { setLevel(4); }}
          >
            <i className="fas fa-users"></i> View High-Risk Taxpayers
          </button>
        </div>
      </div>
    );
  };

  // Level 4: Individual Taxpayer Details (Auditor Level)
  const renderTaxpayerDetailsView = () => {
    if (!selectedTaxCenter || !selectedTaxCenter.taxpayers) return null;

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => { setLevel(3); setSelectedTaxCenter(null); setSelectedTaxpayer(null); }}>
            <i className="fas fa-arrow-left"></i> Back to Tax Centers
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-user-tie"></i> {selectedTaxCenter.name} - High-Risk Taxpayers</h2>
          <Badge status="Level 4: Auditor View" className="rejected" />
        </div>

        <div className="section-title"><i className="fas fa-list"></i> High-Risk Taxpayers for Audit Selection</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>TIN</th>
                <th>Business Name</th>
                <th>Type</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Revenue at Risk</th>
                <th>Recommended Audit Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedTaxCenter.taxpayers.map((tp, i) => (
                <tr key={i} style={{ background: tp.riskLevel === 'Critical' ? '#3a1a1a' : '#0f14193e0' }}>
                  <td><strong>{tp.tin}</strong></td>
                  <td>{tp.businessName}</td>
                  <td>{tp.businessType}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{tp.riskScore}</td>
                  <td>
                    <Badge 
                      status={tp.riskLevel} 
                      className={tp.riskLevel === 'Critical' ? 'rejected' : 'pending'} 
                    />
                  </td>
                  <td>{(tp.revenueAtRisk / 1000000).toFixed(2)}M ETB</td>
                  <td>{tp.recommendedAuditType}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => setSelectedTaxpayer(tp)}
                    >
                      <i className="fas fa-search"></i> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Individual Taxpayer Detail Modal
  const renderTaxpayerDetailModal = () => {
    if (!selectedTaxpayer) return null;

    return (
      <div style={{ marginTop: '32px', padding: '20px', background: '#f8f9fc', color: '#0c4a6e', borderRadius: '8px', border: '1px solid #2d3d4d' }}>
        <div className="action-bar" style={{ marginBottom: '16px' }}>
          <h3><i className="fas fa-user-tie"></i> {selectedTaxpayer.tin} - {selectedTaxpayer.businessName}</h3>
          <button className="btn btn-sm btn-outline" onClick={() => setSelectedTaxpayer(null)}>
            <i className="fas fa-times"></i> Close
          </button>
        </div>

        <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <Card title="Risk Score" number={selectedTaxpayer.riskScore} icon="fas fa-chart-line" />
          <Card title="Risk Level" number={selectedTaxpayer.riskLevel} icon="fas fa-exclamation-triangle" />
          <Card title="Revenue at Risk" number={`${(selectedTaxpayer.revenueAtRisk / 1000000).toFixed(1)}M ETB`} icon="fas fa-dollar-sign" />
          <Card title="Recommended Audit" number={selectedTaxpayer.recommendedAuditType} icon="fas fa-search" />
        </div>

        <div className="section-title"><i className="fas fa-flag"></i> Risk Indicators & Evidence</div>
        {selectedTaxpayer.riskIndicators.map((ind, i) => (
          <div key={i} style={{ marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', border: '1px solid #ddd', borderLeft: `4px solid ${ind.severity === 'High' ? '#ff5252' : '#f57c00'}` }}>
            <strong>{ind.indicator}</strong>
            <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '13px', color: '#555' }}>
              <i className="fas fa-info-circle"></i> {ind.evidence}
            </p>
            <Badge status={ind.severity} className={ind.severity === 'High' ? 'rejected' : 'pending'} />
          </div>
        ))}

        <div className="section-title"><i className="fas fa-history"></i> Compliance History</div>
        <div style={{ padding: '12px', background: '#e3f2fd', color: '#0c4a6e', borderRadius: '6px', border: '1px solid #1976d2' }}>
          <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px' }}>
            <strong>Last Audit:</strong> {selectedTaxpayer.lastAudit}<br/>
            <strong>Status:</strong> {selectedTaxpayer.complianceHistory}
          </p>
        </div>
      </div>
    );
  };

  // Detailed Audit Type Allocation View (National Level)
  const renderNationalAuditTypeAllocation = () => {
    if (!riskData) return null;
    const { national } = riskData;
    
    // Get current allocations (use overrides if set, otherwise use risk engine data)
    const auditTypes = auditConfig.auditTypes;
    const currentAllocations = nationalAuditAllocations || {};
    
    const handleAllocationChange = (typeId, value) => {
      const newAllocations = { ...currentAllocations };
      newAllocations[typeId] = parseInt(value) || 0;
      setNationalAuditAllocations(newAllocations);
    };

    const handleReset = () => {
      setNationalAuditAllocations({});
    };

    const handleSaveOverrides = () => {
      // Save to localStorage
      const data = loadData();
      data.auditTypeAllocations = nationalAuditAllocations;
      saveData(data);
      alert('Audit type allocations saved successfully!');
    };

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setDetailView(null)}>
            <i className="fas fa-arrow-left"></i> Back to Risk Engine
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-warning" onClick={handleReset}>
              <i className="fas fa-redo"></i> Reset to Risk Engine
            </button>
            <button className="btn btn-success" onClick={handleSaveOverrides}>
              <i className="fas fa-save"></i> Save Allocations
            </button>
          </div>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-tasks"></i> Detailed Audit Type Allocation - National Level</h2>
          <Badge status="Risk Engine Analysis" className="director-approved" />
        </div>

        {/* Summary Card */}
        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Total Risky Suspects: <strong style={{ color: '#1976d2' }}>{national.riskySuspects.toLocaleString()}</strong></h3>
          <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#555' }}>
            Based on risk analysis, these {national.riskySuspects.toLocaleString()} taxpayers should be allocated across audit types.
            You can adjust the allocations below if needed. Values must sum to the total risky suspects.
          </p>
        </div>

        {/* Allocation Table */}
        <div className="section-title"><i className="fas fa-chart-bar"></i> Audit Type Breakdown</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Risk Engine Candidates</th>
                <th>% of Risky</th>
                <th>Allocated Cases</th>
                <th>Your Override</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {auditTypes.map((type) => {
                const riskEngineCandidate = national.byAuditType.find(a => a.type === type.name)?.candidates || 0;
                const riskPercent = ((riskEngineCandidate / national.riskySuspects) * 100).toFixed(1);
                const overriddenValue = currentAllocations[type.id] !== undefined ? currentAllocations[type.id] : riskEngineCandidate;
                const overridePercent = national.riskySuspects > 0 ? ((overriddenValue / national.riskySuspects) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={type.id} style={{ background: currentAllocations[type.id] !== undefined ? '#0f14193e0' : '#0f1419' }}>
                    <td><strong>{type.name}</strong></td>
                    <td style={{ textAlign: 'center' }}>{riskEngineCandidate.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>{riskPercent}%</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{overriddenValue.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        value={overriddenValue}
                        onChange={(e) => handleAllocationChange(type.id, e.target.value)}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{overridePercent}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
                <td colSpan="2">TOTAL</td>
                <td style={{ textAlign: 'center' }}>-</td>
                <td style={{ textAlign: 'center' }}>{national.riskySuspects.toLocaleString()}</td>
                <td style={{ textAlign: 'center', color: '#4a8fd9' }}>
                  {Object.values(currentAllocations).reduce((sum, v) => sum + (parseInt(v) || 0), 0) > 0
                    ? Object.values(currentAllocations).reduce((sum, v) => sum + (parseInt(v) || 0), 0).toLocaleString()
                    : national.byAuditType.reduce((sum, a) => sum + a.candidates, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Validation Message */}
        {Object.keys(currentAllocations).length > 0 && (
          <div style={{ 
            background: '#0f1419', color: '#f0f6fc', 
            padding: '12px', 
            borderRadius: '6px', 
            marginTop: '16px', 
            border: '1px solid #ffb74d'
          }}>
            <i className="fas fa-info-circle"></i> You have overridden {Object.keys(currentAllocations).length} audit type allocation(s).
            Click "Save Allocations" to persist your changes.
          </div>
        )}
      </div>
    );
  };

  // Detailed Audit Type Allocation View (Regional Level)
  const renderRegionalAuditTypeAllocation = () => {
    if (!riskData || !localSelectedRegion) return null;
    const region = riskData.regional.find(r => r.name === localSelectedRegion);
    if (!region) return null;

    const auditTypes = auditConfig.auditTypes;
    const regionKey = localSelectedRegion;
    const currentAllocations = regionalAuditAllocations[regionKey] || {};

    const handleAllocationChange = (typeId, value) => {
      const newRegionalAllocations = { ...regionalAuditAllocations };
      if (!newRegionalAllocations[regionKey]) {
        newRegionalAllocations[regionKey] = {};
      }
      newRegionalAllocations[regionKey][typeId] = parseInt(value) || 0;
      setRegionalAuditAllocations(newRegionalAllocations);
    };

    const handleReset = () => {
      const newRegionalAllocations = { ...regionalAuditAllocations };
      delete newRegionalAllocations[regionKey];
      setRegionalAuditAllocations(newRegionalAllocations);
    };

    const handleSaveOverrides = () => {
      const data = loadData();
      if (!data.regionalAuditAllocations) {
        data.regionalAuditAllocations = {};
      }
      data.regionalAuditAllocations[regionKey] = currentAllocations;
      saveData(data);
      alert(`Audit type allocations for ${regionKey} saved successfully!`);
    };

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setDetailView(null)}>
            <i className="fas fa-arrow-left"></i> Back to Region
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-warning" onClick={handleReset}>
              <i className="fas fa-redo"></i> Reset to Risk Engine
            </button>
            <button className="btn btn-success" onClick={handleSaveOverrides}>
              <i className="fas fa-save"></i> Save Allocations
            </button>
          </div>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-map-pin"></i> Detailed Audit Type Allocation - {localSelectedRegion} Region</h2>
          <Badge status={`Risk Engine Analysis`} className="director-approved" />
        </div>

        {/* Summary Card */}
        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>
            {localSelectedRegion} - Total Risky Suspects: <strong style={{ color: '#1976d2' }}>{region.riskySuspects.toLocaleString()}</strong>
          </h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#555' }}>
            Total Taxpayers in {localSelectedRegion}: <strong>{region.totalTaxpayers.toLocaleString()}</strong>
          </p>
          <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '13px', color: '#555' }}>
            Based on risk analysis, these {region.riskySuspects.toLocaleString()} at-risk taxpayers should be allocated across audit types.
            You can adjust the allocations below for {localSelectedRegion} region specifically.
          </p>
        </div>

        {/* Allocation Table */}
        <div className="section-title"><i className="fas fa-chart-bar"></i> Audit Type Breakdown for {localSelectedRegion}</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Risk Engine Candidates</th>
                <th>% of Risky</th>
                <th>Allocated Cases</th>
                <th>Your Override</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {auditTypes.map((type) => {
                const riskEngineCandidate = region.auditTypeCandidates.find(a => a.type === type.name)?.candidates || 0;
                const riskPercent = ((riskEngineCandidate / region.riskySuspects) * 100).toFixed(1);
                const overriddenValue = currentAllocations[type.id] !== undefined ? currentAllocations[type.id] : riskEngineCandidate;
                const overridePercent = region.riskySuspects > 0 ? ((overriddenValue / region.riskySuspects) * 100).toFixed(1) : 0;

                return (
                  <tr key={type.id} style={{ background: currentAllocations[type.id] !== undefined ? '#0f14193e0' : '#0f1419' }}>
                    <td><strong>{type.name}</strong></td>
                    <td style={{ textAlign: 'center' }}>{riskEngineCandidate.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>{riskPercent}%</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{overriddenValue.toLocaleString()}</td>
                    <td>
                      <input
                        type="number"
                        value={overriddenValue}
                        onChange={(e) => handleAllocationChange(type.id, e.target.value)}
                        style={{
                          width: '100px',
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          textAlign: 'center'
                        }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{overridePercent}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
                <td colSpan="2">TOTAL FOR {localSelectedRegion.toUpperCase()}</td>
                <td style={{ textAlign: 'center' }}>-</td>
                <td style={{ textAlign: 'center' }}>{region.riskySuspects.toLocaleString()}</td>
                <td style={{ textAlign: 'center', color: '#4a8fd9' }}>
                  {Object.values(currentAllocations).reduce((sum, v) => sum + (parseInt(v) || 0), 0) > 0
                    ? Object.values(currentAllocations).reduce((sum, v) => sum + (parseInt(v) || 0), 0).toLocaleString()
                    : region.auditTypeCandidates.reduce((sum, a) => sum + a.candidates, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: 'center' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Validation Message */}
        {Object.keys(currentAllocations).length > 0 && (
          <div style={{
            background: '#0f1419', color: '#f0f6fc',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
            border: '1px solid #ffb74d'
          }}>
            <i className="fas fa-info-circle"></i> You have overridden {Object.keys(currentAllocations).length} audit type allocation(s) for {localSelectedRegion}.
            Click "Save Allocations" to persist your changes.
          </div>
        )}
      </div>
    );
  };

  // Level 2: Regional List View - SPECIAL FOR REGIONAL DIRECTORS
  // Old renderRegionalListView removed - now using RegionSelector component instead

  // Determine what to render based on level and region selection
  if (level === 1) {
    return renderNationalView();
  } else if (level === 2) {
    // Regional directors: ALWAYS show region selector until they select one
    // Once they select, show the regional view
    if (localSelectedRegion) {
      // Show selected region data
      return renderRegionalView();
    } else {
      // Show region selector (both regional directors and planning team)
      return (
        <RegionSelectorCards
          onRegionSelect={handleRegionSelect}
          currentRegion={localSelectedRegion}
          userRole={userRole}
          assignedRegion={assignedRegion}
        />
      );
    }
  } else if (level === 3) {
    if (!selectedTaxCenter) {
      return renderTaxCenterView();
    } else {
      return renderTaxCenterDetailsView();
    }
  } else if (level === 3.5) {
    return renderTaxCenterDetailsView();
  } else if (level === 4) {
    return (
      <>
        {renderTaxpayerDetailsView()}
        {renderTaxpayerDetailModal()}
      </>
    );
  }

  return renderNationalView();
}

export default RiskEngineView;
