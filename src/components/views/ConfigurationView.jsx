import React, { useState } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { auditConfig } from '../../config/auditConfig';
import { clearAllPlans, resetAllData, loadData, saveData } from '../../utils/data';

function ConfigurationView() {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);

  const renderOverview = () => {
    return (
      <div>
        <div className="detail-header">
          <h2><i className="fas fa-cog"></i> Configuration & Standards Management</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="section-title"><i className="fas fa-th-large"></i> Configuration Modules</div>
        <div className="cards">
          <div className="card" onClick={() => setActiveTab('audit-types')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-tasks"></i> Audit Types</h3>
                <p>{auditConfig.auditTypes.length} audit types configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('tax-types')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-percent"></i> Tax Types</h3>
                <p>{auditConfig.taxTypes.length} tax types configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('industries')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-industry"></i> Industries</h3>
                <p>{auditConfig.industries.length} industries configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('taxpayer-categories')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-users"></i> Taxpayer Categories</h3>
                <p>{auditConfig.taxpayerCategories.length} categories configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('skills')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-graduation-cap"></i> Skills</h3>
                <p>{auditConfig.skills.length} skills configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('regions')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-map"></i> Regions & Tax Centers</h3>
                <p>{auditConfig.regions.length} regions, {auditConfig.taxCenters.length} tax centers</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('risk-indicators')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-exclamation-circle"></i> Risk Indicators</h3>
                <p>{auditConfig.riskIndicators.length} indicators configured</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('standards')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-certificate"></i> Audit Standards</h3>
                <p>Quality & compliance standards</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('workflow')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-sitemap"></i> Workflow Configuration</h3>
                <p>Approval process & deadlines</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('risk-thresholds')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-sliders-h"></i> Risk Thresholds</h3>
                <p>Critical, High, Medium risk levels</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('feature-flags')} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-toggle-on"></i> Feature Flags</h3>
                <p>Enable/disable system capabilities</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#a0aec0' }}></i>
            </div>
          </div>

          <div className="card" onClick={() => setActiveTab('data-management')} style={{ cursor: 'pointer', background: '#0f14193cd', borderColor: '#ffc107' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3><i className="fas fa-database"></i> Data Management</h3>
                <p>Clear plans, reset data</p>
              </div>
              <i className="fas fa-chevron-right" style={{ fontSize: '20px', color: '#f57f17' }}></i>
            </div>
          </div>
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginTop: '24px', color: '#0c4a6e' }}>
          <strong><i className="fas fa-info-circle"></i> Information</strong>
          <p>Click on any module to view and manage its configuration. All changes apply system-wide immediately.</p>
        </div>
      </div>
    );
  };

  const renderAuditTypes = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
          <div></div>
          <button className="btn btn-primary" onClick={() => setEditMode(!editMode)}>
            <i className="fas fa-edit"></i> {editMode ? 'Done Editing' : 'Edit Configuration'}
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-tasks"></i> Audit Types Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Effort Hours</th>
                <th>Complexity</th>
                <th>Required Skills</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.auditTypes.map((type, i) => (
                <tr key={i}>
                  <td><strong>{type.name}</strong></td>
                  <td>{type.effortPerCase}h</td>
                  <td>
                    <span className="badge" style={{
                      background: type.complexity === 'Low' ? '#4caf50' :
                        type.complexity === 'Medium' ? '#4a8fd9' :
                          type.complexity === 'High' ? '#ff5252' : '#ff5252',
                      color: '#0f1419', padding: '4px 8px', borderRadius: '4px'
                    }}>
                      {type.complexity}
                    </span>
                  </td>
                  <td>{type.skillsRequired.join(', ')}</td>
                  <td>{type.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
          <strong>⚠️ Edit Mode Disabled</strong>
          <p style={{ color: '#0c4a6e', margin: '6px 0 0 0', fontSize: '12px' }}>To edit audit types, modify src/config/auditConfig.js directly. Changes take effect immediately after reload.</p>
        </div>
      </div>
    );
  };

  const renderTaxTypes = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-percent"></i> Tax Types Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tax Type</th>
                <th>Risk Weight</th>
                <th>Compliance %</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.taxTypes.map((tax, i) => (
                <tr key={i} style={{
                  background: tax.riskWeight > 1.2 ? '#3a1a1a' :
                    tax.riskWeight > 1.0 ? '#0f14193e0' :
                      tax.riskWeight > 0.9 ? '#0f1419de7' : '#1a3a1a'
                }}>
                  <td><strong>{tax.name}</strong></td>
                  <td>{tax.riskWeight}x</td>
                  <td>{tax.compliance}%</td>
                  <td>
                    {tax.riskWeight > 1.2 ? '🔴 Critical' :
                      tax.riskWeight > 1.0 ? '🟠 High' :
                        tax.riskWeight > 0.9 ? '🟡 Medium' : '🟢 Normal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderIndustries = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-industry"></i> Industries Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Industry</th>
                <th>Risk Score</th>
                <th>Compliance %</th>
                <th>Risk Category</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.industries.map((ind, i) => (
                <tr key={i} style={{
                  background: ind.riskScore > 75 ? '#3a1a1a' :
                    ind.riskScore > 65 ? '#0f14193e0' :
                      ind.riskScore > 55 ? '#0f1419de7' : '#1a3a1a'
                }}>
                  <td><strong>{ind.name}</strong></td>
                  <td>{ind.riskScore}/100</td>
                  <td>{ind.compliance}%</td>
                  <td>
                    {ind.riskScore > 75 ? '🔴 High Risk' :
                      ind.riskScore > 65 ? '🟠 Medium Risk' :
                        ind.riskScore > 55 ? '🟡 Moderate' : '🟢 Lower Risk'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTaxpayerCategories = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-users"></i> Taxpayer Categories Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Annual Turnover</th>
                <th>Audit Frequency</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.taxpayerCategories.map((cat, i) => (
                <tr key={i}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.annualTurnover}</td>
                  <td>{cat.auditFrequency}x/year</td>
                  <td>{cat.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-graduation-cap"></i> Skills Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Skill Name</th>
                <th>Level</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.skills.map((skill, i) => (
                <tr key={i}>
                  <td><strong>{skill.name}</strong></td>
                  <td>
                    <span style={{
                      background: skill.level === 1 ? '#4caf50' :
                        skill.level === 2 ? '#4a8fd9' : '#ff5252',
                      color: '#0f1419',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      Level {skill.level}
                    </span>
                  </td>
                  <td>{skill.category}</td>
                  <td>{skill.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRegions = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-map"></i> Regions & Tax Centers Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Taxpayers</th>
                <th>Tax Centers</th>
                <th>Available Auditors</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.regions.map((region, i) => (
                <tr key={i}>
                  <td><strong>{region.name}</strong></td>
                  <td>{(region.taxpayers * 12).toLocaleString()}</td>
                  <td>{region.taxCenters.join(', ')}</td>
                  <td>{region.availableAuditors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-building"></i> All Tax Centers</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {auditConfig.taxCenters.map((tc, i) => (
            <div key={i} style={{
              border: '1px solid #ddd',
              padding: '12px',
              borderRadius: '8px',
              background: '#1e2a3a'
            }}>
              {tc}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRiskIndicators = () => {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-exclamation-circle"></i> Risk Indicators Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Indicator</th>
                <th>Weight</th>
                <th>Description</th>
                <th>Data Sources</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.riskIndicators.map((indicator, i) => (
                <tr key={i} style={{
                  background: indicator.weight > 2.5 ? '#3a1a1a' :
                    indicator.weight > 2 ? '#0f14193e0' :
                      indicator.weight > 1.5 ? '#0f1419de7' : '#1a3a1a'
                }}>
                  <td><strong>{indicator.name}</strong></td>
                  <td>{indicator.weight}x</td>
                  <td>{indicator.description}</td>
                  <td>{indicator.sources.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStandards = () => {
    const standards = auditConfig.auditStandards;
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-certificate"></i> Audit Quality Standards</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="cards">
          <Card title="Documentation Required" number={standards.documentationRequired ? 'YES' : 'NO'} icon="fas fa-file-contract" />
          <Card title="Work Paper Standards" number={standards.workPaperStandards} icon="fas fa-book" />
          <Card title="Compliance Framework" number={standards.complianceFramework} icon="fas fa-check-circle" />
          <Card title="Quality Review Level" number={`Level ${standards.qualityReviewLevel}`} icon="fas fa-star" />
          <Card title="Requirement Coverage" number={`${(standards.requirementCoverage * 100).toFixed(0)}%`} icon="fas fa-percent" />
          <Card title="Review Timeline" number={`${standards.reviewTimeline} days`} icon="fas fa-calendar" />
        </div>

        <div className="section-title"><i className="fas fa-list"></i> Reporting Format</div>
        <div style={{
          background: '#1a2332',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <strong>{standards.reportingFormat}</strong>
        </div>
      </div>
    );
  };

  const renderWorkflow = () => {
    const workflow = auditConfig.workflowApproval;
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-sitemap"></i> Workflow Configuration</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Director Approval Required</strong></td>
                <td>{workflow.requiresDirectorApproval ? '✅ YES' : '❌ NO'}</td>
                <td>Plans must be approved by Director</td>
              </tr>
              <tr>
                <td><strong>Regional Feedback Required</strong></td>
                <td>{workflow.requiresRegionalFeedback ? '✅ YES' : '❌ NO'}</td>
                <td>Regional Directors must provide feedback</td>
              </tr>
              <tr>
                <td><strong>Senior Management Approval</strong></td>
                <td>{workflow.requiresSeniorManagementApproval ? '✅ YES' : '❌ NO'}</td>
                <td>Final approval needed before execution</td>
              </tr>
              <tr>
                <td><strong>Max Amendment Rounds</strong></td>
                <td>{workflow.maxRoundOfAmendments}</td>
                <td>Maximum times plan can be amended</td>
              </tr>
              <tr>
                <td><strong>Feedback Deadline</strong></td>
                <td>{workflow.feedbackDeadlineDays} days</td>
                <td>Time for feedback submission</td>
              </tr>
              <tr>
                <td><strong>Review Deadline</strong></td>
                <td>{workflow.reviewDeadlineDays} days</td>
                <td>Time to complete review</td>
              </tr>
              <tr>
                <td><strong>Allow Rejection</strong></td>
                <td>{workflow.allowRejection ? '✅ YES' : '❌ NO'}</td>
                <td>Plans can be rejected at approval stages</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderRiskThresholds = () => {
    const thresholds = auditConfig.complianceThresholds;
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-sliders-h"></i> Risk & Compliance Thresholds</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="cards">
          <Card title="Critical Risk" number={`≥ ${thresholds.criticalRiskThreshold}`} icon="fas fa-skull-crossbones" />
          <Card title="High Risk" number={`${thresholds.highRiskThreshold}-${thresholds.criticalRiskThreshold - 1}`} icon="fas fa-exclamation-triangle" />
          <Card title="Medium Risk" number={`${thresholds.mediumRiskThreshold}-${thresholds.highRiskThreshold - 1}`} icon="fas fa-exclamation-circle" />
          <Card title="Filing Compliance Target" number={`${thresholds.filingComplianceTarget}%`} icon="fas fa-file" />
          <Card title="Payment Compliance Target" number={`${thresholds.paymentComplianceTarget}%`} icon="fas fa-money-bill" />
          <Card title="Registration Compliance" number={`${thresholds.registrationComplianceTarget}%`} icon="fas fa-registered" />
          <Card title="Variance Threshold" number={`±${thresholds.varianceThreshold}%`} icon="fas fa-code-branch" />
        </div>
      </div>
    );
  };

  const renderFeatureFlags = () => {
    const flags = auditConfig.featureFlags;
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-toggle-on"></i> Feature Flags</h2>
          <Badge status="System Configuration" className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(flags).map(([key, value], i) => (
                <tr key={i}>
                  <td><strong>{key.replace(/_/g, ' ').toUpperCase()}</strong></td>
                  <td>
                    <span style={{
                      background: value ? '#4caf50' : '#ff5252',
                      color: '#0f1419',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {value ? '✅ ENABLED' : '❌ DISABLED'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#a0aec0' }}>
                    {value ? 'Active in system' : 'Not available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
          <strong><i className="fas fa-info-circle"></i> Note</strong>
          <p>Feature flags are managed in the auditConfig.js file. Changes require application reload to take effect.</p>
        </div>
      </div>
    );
  };

  const renderDataManagement = () => {
    const data = loadData();
    const planCount = data.plans?.length || 0;

    const handleClearPlans = () => {
      if (planCount === 0) {
        alert('No plans to delete.');
        return;
      }
      if (window.confirm(`⚠️ DELETE ${planCount} PLAN${planCount !== 1 ? 'S' : ''}? This cannot be undone!\n\nAll created audit plans will be permanently removed.`)) {
        try {
          console.log('Clearing all plans...');
          clearAllPlans();
          console.log('✅ Plans cleared successfully');
          alert(`✅ All ${planCount} plan${planCount !== 1 ? 's' : ''} deleted successfully!\n\nPage will refresh now...`);
          // Reload after a longer delay to show the alert
          setTimeout(() => {
            console.log('Reloading page...');
            window.location.reload();
          }, 1000);
        } catch (e) {
          console.error('Error:', e);
          alert('❌ Error deleting plans: ' + e.message);
        }
      }
    };

    const handleResetAll = () => {
      if (window.confirm('⚠️ RESET ALL DATA to defaults? This cannot be undone!\n\nYou will lose:\n- All created audit plans\n- All feedback data\n- All allocations\n- All system configurations (will reset to defaults)')) {
        try {
          console.log('Resetting all data...');
          resetAllData();
          console.log('✅ Data reset successfully');
          alert('✅ All data reset to defaults!\n\nPage will refresh now...');
          // Reload after a longer delay to show the alert
          setTimeout(() => {
            console.log('Reloading page...');
            window.location.reload();
          }, 1000);
        } catch (e) {
          console.error('Error:', e);
          alert('❌ Error resetting data: ' + e.message);
        }
      }
    };

    const handleExportData = () => {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-planning-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      alert('✅ Data exported successfully!');
    };

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setActiveTab('overview')}>
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-database"></i> Data Management</h2>
          <Badge status="Advanced Options" className="director-approved" />
        </div>

        <div className="cards">
          <Card title="Total Plans" number={planCount} icon="fas fa-file-contract" />
          <Card title="Storage Size" number={`${(new Blob([JSON.stringify(data)]).size / 1024).toFixed(1)} KB`} icon="fas fa-hdd" />
        </div>

        <div className="section-title"><i className="fas fa-tools"></i> Data Actions</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Clear Plans Button */}
          <div style={{
            background: '#3a1a1a',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #ef5350',
            textAlign: 'center'
          }}>
            <i className="fas fa-trash-alt" style={{ fontSize: '32px', color: '#ff5252', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '8px 0', color: '#c62828' }}>Delete All Plans</h3>
            <p style={{ color: '#0c4a6e', margin: '8px 0 16px 0', fontSize: '13px', color: '#ff5252' }}>
              Remove all {planCount} created plans. Keep system data intact.
            </p>
            <button
              onClick={handleClearPlans}
              disabled={planCount === 0}
              style={{
                background: planCount === 0 ? '#4a4a4a' : '#ff5252',
                color: '#0f1419',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: planCount === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <i className="fas fa-trash"></i> {planCount > 0 ? `Delete ${planCount} Plan${planCount !== 1 ? 's' : ''}` : 'No Plans to Delete'}
            </button>
          </div>

          {/* Reset All Button */}
          <div style={{
            background: '#0f1419', color: '#f0f6fc',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #4a8fd9',
            textAlign: 'center'
          }}>
            <i className="fas fa-redo" style={{ fontSize: '32px', color: '#f57c00', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '8px 0', color: '#4a8fd9' }}>Reset All Data</h3>
            <p style={{ color: '#0c4a6e', margin: '8px 0 16px 0', fontSize: '13px', color: '#f57c00' }}>
              Reset entire system to default state including all plans and data.
            </p>
            <button
              onClick={handleResetAll}
              style={{
                background: '#4a8fd9',
                color: '#0f1419',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <i className="fas fa-sync"></i> Reset All
            </button>
          </div>

          {/* Export Data Button */}
          <div style={{
            background: '#e3f2fd', color: '#0c4a6e',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #1976d2',
            textAlign: 'center'
          }}>
            <i className="fas fa-download" style={{ fontSize: '32px', color: '#1565c0', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '8px 0', color: '#0d47a1' }}>Export Data</h3>
            <p style={{ color: '#0c4a6e', margin: '8px 0 16px 0', fontSize: '13px', color: '#1976d2' }}>
              Download all system data as JSON file for backup.
            </p>
            <button
              onClick={handleExportData}
              style={{
                background: '#1976d2',
                color: '#0f1419',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}
            >
              <i className="fas fa-download"></i> Export
            </button>
          </div>
        </div>

        <div style={{
          background: '#3a1a1a',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #ef5350'
        }}>
          <strong style={{ color: '#c62828' }}><i className="fas fa-exclamation-triangle"></i> WARNING</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#ff5252', lineHeight: '1.6' }}>
            ⚠️ These operations are DESTRUCTIVE and CANNOT BE UNDONE. Please be careful!<br/>
            • Deleting plans will remove all created audit plans<br/>
            • Resetting data will erase everything including plans, feedback, and allocations
          </p>
        </div>
      </div>
    );
  };

  // Render appropriate view based on active tab
  switch (activeTab) {
    case 'audit-types':
      return renderAuditTypes();
    case 'tax-types':
      return renderTaxTypes();
    case 'industries':
      return renderIndustries();
    case 'taxpayer-categories':
      return renderTaxpayerCategories();
    case 'skills':
      return renderSkills();
    case 'regions':
      return renderRegions();
    case 'risk-indicators':
      return renderRiskIndicators();
    case 'standards':
      return renderStandards();
    case 'workflow':
      return renderWorkflow();
    case 'risk-thresholds':
      return renderRiskThresholds();
    case 'feature-flags':
      return renderFeatureFlags();
    case 'data-management':
      return renderDataManagement();
    default:
      return renderOverview();
  }
}

export default ConfigurationView;
