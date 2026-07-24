import React, { useState } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';
import { loadData } from '../../utils/data';

function PlanDetailsView({ plan, onBack }) {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  if (!plan) return null;

  // Get stored audit type allocation from plan
  const auditTypeAllocation = plan.auditTypeAllocation || {};
  const regionalAllocation = plan.regionalAllocation || {};

  // Helper function to toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Calculate total cases from audit types
  const totalCasesFromAuditTypes = Object.values(auditTypeAllocation).reduce((sum, val) => sum + (parseInt(val) || 0), 0) || plan.totalVolume || 0;

  // Calculate regional allocation
  const calculateRegionalAllocation = (regionName, auditTypeId) => {
    // Check if there's a manual override
    if (regionalAllocation[regionName]?.[auditTypeId] !== undefined) {
      return parseInt(regionalAllocation[regionName][auditTypeId]);
    }
    
    // Otherwise, calculate from national allocation × region percentage
    const region = auditConfig.regions.find(r => r.name === regionName);
    if (!region) return 0;
    
    const regionPercent = region.taxpayers / auditConfig.getTotalTaxpayers();
    const nationalAllocation = parseInt(auditTypeAllocation[auditTypeId]) || 0;
    return Math.round(nationalAllocation * regionPercent);
  };

  // Calculate capacity requirements
  const calculateCapacity = () => {
    let totalEffortHours = 0;
    Object.entries(auditTypeAllocation).forEach(([typeId, count]) => {
      const type = auditConfig.auditTypes.find(t => t.id === typeId);
      if (type) {
        totalEffortHours += parseInt(count) * type.effortPerCase;
      }
    });
    return totalEffortHours;
  };

  const totalEffortHours = calculateCapacity();
  const totalAuditorsNeeded = Math.ceil(totalEffortHours / 2000); // ~2000 hours per auditor per year
  const totalAvailableAuditors = auditConfig.regions.reduce((sum, r) => sum + r.availableAuditors, 0);

  return (
    <div>
      <div className="action-bar">
        <button className="btn btn-outline" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-info"
            title="Download plan as PDF"
          >
            <i className="fas fa-download"></i> Download
          </button>
          <button 
            className="btn btn-primary"
            title="Print plan"
          >
            <i className="fas fa-print"></i> Print
          </button>
        </div>
      </div>

      {/* HEADER */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '24px', 
        borderRadius: '12px', 
        color: '#0f1419', 
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{plan.id} - Annual Audit Plan</h1>
            <p style={{ color: '#0c4a6e', margin: 0, fontSize: '14px', opacity: 0.9 }}>Fiscal Year {plan.fiscalYear}</p>
          </div>
          <Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} />
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="cards">
        <Card 
          title="Total Cases" 
          number={totalCasesFromAuditTypes.toLocaleString()} 
          icon="fas fa-list-ol"
          onClick={() => toggleSection('audit-types')}
          style={{ cursor: 'pointer' }}
        />
        <Card 
          title="Total Effort" 
          number={`${totalEffortHours.toLocaleString()}h`} 
          icon="fas fa-clock"
        />
        <Card 
          title="Auditors Needed" 
          number={totalAuditorsNeeded} 
          icon="fas fa-users"
          onClick={() => toggleSection('capacity')}
          style={{ cursor: 'pointer' }}
        />
        <Card 
          title="Regions" 
          number={auditConfig.regions.length} 
          icon="fas fa-map-marker-alt"
          onClick={() => toggleSection('regional')}
          style={{ cursor: 'pointer' }}
        />
        <Card title="Version" number={`v${plan.version}`} icon="fas fa-code-branch" />
      </div>

      {/* PLANNING PERIOD */}
      <div className="section-title" onClick={() => toggleSection('planning')}>
        <i className="fas fa-calendar-alt"></i> Planning Period
        <span style={{ float: 'right', cursor: 'pointer' }}>
          {expandedSection === 'planning' ? '▼' : '▶'}
        </span>
      </div>
      {expandedSection === 'planning' && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <tbody>
              <tr style={{ background: '#1a2332' }}>
                <td style={{ width: '30%' }}><strong>Start Date</strong></td>
                <td>{plan.startDate}</td>
              </tr>
              <tr>
                <td><strong>End Date</strong></td>
                <td>{plan.endDate}</td>
              </tr>
              <tr style={{ background: '#1a2332' }}>
                <td><strong>Duration</strong></td>
                <td>{plan.duration || 365} days</td>
              </tr>
              <tr>
                <td><strong>Plan Name</strong></td>
                <td>{plan.name || plan.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* AUDIT TYPES & VOLUME */}
      <div className="section-title" onClick={() => toggleSection('audit-types')}>
        <i className="fas fa-layer-group"></i> Audit Types & Volume
        <span style={{ float: 'right', cursor: 'pointer' }}>
          {expandedSection === 'audit-types' ? '▼' : '▶'}
        </span>
      </div>
      {expandedSection === 'audit-types' && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <thead>
              <tr style={{ background: '#667eea', color: '#0f1419' }}>
                <th>Audit Type</th>
                <th style={{ textAlign: 'center' }}>Total Cases</th>
                <th style={{ textAlign: 'center' }}>Effort/Case</th>
                <th style={{ textAlign: 'center' }}>Total Effort</th>
                <th style={{ textAlign: 'center' }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.auditTypes.map((type, idx) => {
                const cases = parseInt(auditTypeAllocation[type.id]) || 0;
                const effort = cases * type.effortPerCase;
                const percent = totalCasesFromAuditTypes > 0 ? ((cases / totalCasesFromAuditTypes) * 100).toFixed(1) : 0;
                return (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#1e2a3a' : '#0f1419' }}>
                    <td><strong>{type.name}</strong></td>
                    <td style={{ textAlign: 'center' }}>{cases.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>{type.effortPerCase}h</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#4a8fd9' }}>{effort.toLocaleString()}h</td>
                    <td style={{ textAlign: 'center' }}>{percent}%</td>
                  </tr>
                );
              })}
              <tr style={{ background: '#667eea', color: '#0f1419', fontWeight: 'bold' }}>
                <td>TOTAL</td>
                <td style={{ textAlign: 'center' }}>{totalCasesFromAuditTypes.toLocaleString()}</td>
                <td style={{ textAlign: 'center' }}>-</td>
                <td style={{ textAlign: 'center' }}>{totalEffortHours.toLocaleString()}h</td>
                <td style={{ textAlign: 'center' }}>100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* REGIONAL DISTRIBUTION */}
      <div className="section-title" onClick={() => toggleSection('regional')}>
        <i className="fas fa-map-marked-alt"></i> Regional Distribution by Audit Type
        <span style={{ float: 'right', cursor: 'pointer' }}>
          {expandedSection === 'regional' ? '▼' : '▶'}
        </span>
      </div>
      {expandedSection === 'regional' && (
        <div style={{ marginBottom: '24px' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr style={{ background: '#667eea', color: '#0f1419' }}>
                  <th>Region</th>
                  <th>% of Taxpayers</th>
                  {auditConfig.auditTypes.map((type, i) => (
                    <th key={i} style={{ textAlign: 'center' }}>{type.name.substring(0, 8)}</th>
                  ))}
                  <th style={{ textAlign: 'center' }}>TOTAL</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {auditConfig.regions.map((region, ridx) => {
                  const regionPercent = ((region.taxpayers / auditConfig.getTotalTaxpayers()) * 100).toFixed(1);
                  let regionTotal = 0;
                  
                  return (
                    <tr key={region.name} style={{ background: ridx % 2 === 0 ? '#1e2a3a' : '#0f1419' }}>
                      <td><strong>{region.name}</strong></td>
                      <td>{regionPercent}%</td>
                      {auditConfig.auditTypes.map((type) => {
                        const allocation = calculateRegionalAllocation(region.name, type.id);
                        regionTotal += allocation;
                        return (
                          <td 
                            key={type.id} 
                            style={{ textAlign: 'center', cursor: 'pointer', padding: '12px' }}
                            onClick={() => setSelectedRegion({ region: region.name, type: type.name, allocation })}
                            title={`Click to view allocation details for ${type.name} in ${region.name}`}
                          >
                            <strong style={{ color: '#4a8fd9' }}>{allocation}</strong>
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{regionTotal}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => alert(`Send ${regionTotal} cases to ${region.name} region`)}
                          title={`Send this plan to ${region.name} regional director`}
                        >
                          <i className="fas fa-paper-plane"></i> Send
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#667eea', color: '#0f1419', fontWeight: 'bold' }}>
                  <td>TOTAL</td>
                  <td>100%</td>
                  {auditConfig.auditTypes.map((type) => {
                    const totalByType = auditConfig.regions.reduce((sum, region) => {
                      return sum + calculateRegionalAllocation(region.name, type.id);
                    }, 0);
                    return (
                      <td key={type.id} style={{ textAlign: 'center' }}>{totalByType}</td>
                    );
                  })}
                  <td style={{ textAlign: 'center' }}>{totalCasesFromAuditTypes.toLocaleString()}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </div>

          {selectedRegion && (
            <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginTop: '16px', border: '1px solid #1976d2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedRegion.region} - {selectedRegion.type}</h4>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#555' }}>
                    <strong>{selectedRegion.allocation} cases</strong> allocated for {selectedRegion.type} audit type
                  </p>
                </div>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setSelectedRegion(null)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAPACITY & RESOURCES */}
      <div className="section-title" onClick={() => toggleSection('capacity')}>
        <i className="fas fa-users-cog"></i> Capacity & Resources
        <span style={{ float: 'right', cursor: 'pointer' }}>
          {expandedSection === 'capacity' ? '▼' : '▶'}
        </span>
      </div>
      {expandedSection === 'capacity' && (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <thead>
              <tr style={{ background: '#667eea', color: '#0f1419' }}>
                <th>Metric</th>
                <th style={{ textAlign: 'center' }}>Required</th>
                <th style={{ textAlign: 'center' }}>Available</th>
                <th style={{ textAlign: 'center' }}>Gap</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#1e2a3a' }}>
                <td><strong>Auditor Hours</strong></td>
                <td style={{ textAlign: 'center' }}>{totalEffortHours.toLocaleString()}h</td>
                <td style={{ textAlign: 'center' }}>{(totalAvailableAuditors * 2000).toLocaleString()}h</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: totalEffortHours <= (totalAvailableAuditors * 2000) ? '#388e3c' : '#ff5252' }}>
                  {(totalEffortHours - (totalAvailableAuditors * 2000)).toLocaleString()}h
                </td>
                <td>
                  <Badge 
                    status={totalEffortHours <= (totalAvailableAuditors * 2000) ? 'Sufficient' : 'Shortage'} 
                    className={totalEffortHours <= (totalAvailableAuditors * 2000) ? 'director-approved' : 'rejected'} 
                  />
                </td>
              </tr>
              <tr>
                <td><strong>Auditors</strong></td>
                <td style={{ textAlign: 'center' }}>{totalAuditorsNeeded}</td>
                <td style={{ textAlign: 'center' }}>{totalAvailableAuditors}</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold', color: totalAuditorsNeeded <= totalAvailableAuditors ? '#388e3c' : '#ff5252' }}>
                  {totalAuditorsNeeded - totalAvailableAuditors > 0 ? '+' : ''}{totalAuditorsNeeded - totalAvailableAuditors}
                </td>
                <td>
                  <Badge 
                    status={totalAuditorsNeeded <= totalAvailableAuditors ? 'Adequate' : 'Shortage'} 
                    className={totalAuditorsNeeded <= totalAvailableAuditors ? 'director-approved' : 'rejected'} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* AUDIT STRATEGY */}
      {plan.strategy && (
        <>
          <div className="section-title" onClick={() => toggleSection('strategy')}>
            <i className="fas fa-bullseye"></i> Audit Strategy & Tactics
            <span style={{ float: 'right', cursor: 'pointer' }}>
              {expandedSection === 'strategy' ? '▼' : '▶'}
            </span>
          </div>
          {expandedSection === 'strategy' && (
            <div style={{ background: '#f0f7ff', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #4a8fd9' }}>
              <p style={{ color: '#0c4a6e', margin: 0, lineHeight: '1.8', color: '#2d3d4d' }}>{plan.strategy}</p>
            </div>
          )}
        </>
      )}

      {/* APPROVAL HISTORY */}
      {plan.approvalHistory && plan.approvalHistory.length > 0 && (
        <>
          <div className="section-title" onClick={() => toggleSection('history')}>
            <i className="fas fa-history"></i> Approval History
            <span style={{ float: 'right', cursor: 'pointer' }}>
              {expandedSection === 'history' ? '▼' : '▶'}
            </span>
          </div>
          {expandedSection === 'history' && (
            <div className="table-container" style={{ marginBottom: '24px' }}>
              <table>
                <thead>
                  <tr style={{ background: '#667eea', color: '#0f1419' }}>
                    <th>Action</th>
                    <th>By</th>
                    <th>Date</th>
                    <th>Version</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.approvalHistory.map((entry, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#1e2a3a' : '#0f1419' }}>
                      <td><strong>{entry.action.replace(/_/g, ' ')}</strong></td>
                      <td>{entry.by}</td>
                      <td>{entry.date ? new Date(entry.date).toLocaleDateString() : '-'}</td>
                      <td>v{entry.version}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlanDetailsView;
