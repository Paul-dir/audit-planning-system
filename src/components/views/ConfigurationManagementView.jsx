import React, { useState } from 'react';
import { auditConfig } from '../../config/auditConfig';
import Card from '../Card';
import Badge from '../Badge';

function ConfigurationManagementView() {
  const [activeTab, setActiveTab] = useState('audit-types');
  const [editingItem, setEditingItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // ========== TAB 1: AUDIT TYPES ==========
  const renderAuditTypes = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-tasks"></i> Audit Types Configuration
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Configure the audit types available in your organization. Edit effort per case, skills required, and complexity levels.
      </p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Audit Type</th>
              <th>Effort/Case (hrs)</th>
              <th>Complexity</th>
              <th>Skills Required</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auditConfig.auditTypes.map((type, idx) => (
              <tr key={idx}>
                <td><strong>{type.name}</strong><br/><span style={{fontSize: '11px', color: '#999'}}>{type.description}</span></td>
                <td style={{textAlign: 'center'}}><strong>{type.effortPerCase}h</strong></td>
                <td>
                  <Badge 
                    status={type.complexity} 
                    className={type.complexity === 'Very High' ? 'rejected' : type.complexity === 'High' ? 'pending' : 'director-approved'}
                  />
                </td>
                <td style={{fontSize: '12px'}}>
                  {type.skillsRequired.map((s, i) => (
                    <div key={i}>• {s}</div>
                  ))}
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => { setEditingItem({...type, type: 'auditType'}); setShowDetails(true); }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== TAB 2: SKILLS ==========
  const renderSkills = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-user-cog"></i> Skills Configuration
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Define skill types, expertise levels, and skill-to-audit-type mapping.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {auditConfig.skills.map((skill, idx) => (
          <div key={idx} style={{background: '#1e2a3a', padding: '12px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
              <div>
                <strong>{skill.name}</strong><br/>
                <span style={{fontSize: '11px', color: '#a0aec0'}}>
                  Level {skill.level} • {skill.category}
                </span>
              </div>
              <button 
                className="btn btn-xs btn-info"
                onClick={() => { setEditingItem({...skill, type: 'skill'}); setShowDetails(true); }}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ========== TAB 3: RISK LEVELS ==========
  const renderRiskLevels = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-traffic-light"></i> Risk Levels Configuration
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Define risk score ranges, colors, and risk level labels.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {Object.entries(auditConfig.riskLevels).map(([key, level]) => (
          <div key={key} style={{background: level.bgColor, padding: '16px', borderRadius: '6px', border: `2px solid ${level.color}`}}>
            <div style={{fontSize: '18px', fontWeight: '700', color: level.color, marginBottom: '8px'}}>
              {level.label}
            </div>
            <div style={{fontSize: '13px', color: '#a0aec0'}}>
              Score Range: <strong>{level.min} - {level.max}</strong>
            </div>
            <button 
              className="btn btn-sm btn-info"
              style={{marginTop: '8px', width: '100%'}}
              onClick={() => { setEditingItem({...level, key, type: 'riskLevel'}); setShowDetails(true); }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // ========== TAB 4: EFFORT CALCULATION ==========
  const renderEffortCalculation = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-calculator"></i> Effort Calculation Parameters
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Configure effort calculation parameters that affect workload planning.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
          <div style={{fontSize: '12px', color: '#a0aec0', marginBottom: '8px'}}>Annual Working Hours Per Auditor</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#4a8fd9', marginBottom: '8px'}}>
            {auditConfig.effortCalculation.hoursPerAuditorPerYear}
          </div>
          <button className="btn btn-sm btn-info" style={{width: '100%'}}>Edit</button>
        </div>

        <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
          <div style={{fontSize: '12px', color: '#a0aec0', marginBottom: '8px'}}>Holidays & Leave Days</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#4a8fd9', marginBottom: '8px'}}>
            {auditConfig.effortCalculation.holidaysAndLeave}
          </div>
          <button className="btn btn-sm btn-info" style={{width: '100%'}}>Edit</button>
        </div>

        <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
          <div style={{fontSize: '12px', color: '#a0aec0', marginBottom: '8px'}}>Annual Training Days</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#4caf50', marginBottom: '8px'}}>
            {auditConfig.effortCalculation.trainingDays}
          </div>
          <button className="btn btn-sm btn-info" style={{width: '100%'}}>Edit</button>
        </div>

        <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
          <div style={{fontSize: '12px', color: '#a0aec0', marginBottom: '8px'}}>Admin Overhead %</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#9c27b0', marginBottom: '8px'}}>
            {(auditConfig.effortCalculation.administrationOverhead * 100).toFixed(0)}%
          </div>
          <button className="btn btn-sm btn-info" style={{width: '100%'}}>Edit</button>
        </div>

        <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '6px', border: '1px solid #2d3d4d'}}>
          <div style={{fontSize: '12px', color: '#a0aec0', marginBottom: '8px'}}>Contingency Buffer %</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#f57c00', marginBottom: '8px'}}>
            {(auditConfig.effortCalculation.bufferPercentage * 100).toFixed(0)}%
          </div>
          <button className="btn btn-sm btn-info" style={{width: '100%'}}>Edit</button>
        </div>

        <div style={{background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '6px', border: '1px solid #1976d2'}}>
          <div style={{fontSize: '12px', color: '#1976d2', marginBottom: '8px'}}>Available Hours Per Auditor</div>
          <div style={{fontSize: '24px', fontWeight: '700', color: '#1976d2', marginBottom: '8px'}}>
            {auditConfig.calculateAvailableHoursPerAuditor()}h
          </div>
          <span style={{fontSize: '11px', color: '#a0aec0'}}>Calculated from above parameters</span>
        </div>
      </div>
    </div>
  );

  // ========== TAB 5: ALLOCATION RULES ==========
  const renderAllocationRules = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-chart-pie"></i> Allocation Rules
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Configure how audit cases are distributed to regions and tax centers.
      </p>
      <div style={{background: '#f0f7ff', color: '#0c4a6e', padding: '20px', borderRadius: '8px', border: '1px solid #1976d2', marginBottom: '24px'}}>
        <div style={{marginBottom: '16px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontSize: '13px', fontWeight: '600'}}>By Taxpayer Base</span>
            <span style={{fontSize: '18px', fontWeight: '700', color: '#4a8fd9'}}>
              {(auditConfig.allocationRules.byTaxpayerBase * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{width: '100%', height: '20px', background: '#2d3d4d', borderRadius: '10px', overflow: 'hidden'}}>
            <div style={{width: (auditConfig.allocationRules.byTaxpayerBase * 100) + '%', height: '100%', background: '#4a8fd9', transition: 'width 0.3s'}}></div>
          </div>
        </div>

        <div style={{marginBottom: '16px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontSize: '13px', fontWeight: '600'}}>By Risk Profile</span>
            <span style={{fontSize: '18px', fontWeight: '700', color: '#4a8fd9'}}>
              {(auditConfig.allocationRules.byRiskProfile * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{width: '100%', height: '20px', background: '#2d3d4d', borderRadius: '10px', overflow: 'hidden'}}>
            <div style={{width: (auditConfig.allocationRules.byRiskProfile * 100) + '%', height: '100%', background: '#4a8fd9', transition: 'width 0.3s'}}></div>
          </div>
        </div>

        <div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
            <span style={{fontSize: '13px', fontWeight: '600'}}>By Capacity</span>
            <span style={{fontSize: '18px', fontWeight: '700', color: '#4caf50'}}>
              {(auditConfig.allocationRules.byCapacity * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{width: '100%', height: '20px', background: '#2d3d4d', borderRadius: '10px', overflow: 'hidden'}}>
            <div style={{width: (auditConfig.allocationRules.byCapacity * 100) + '%', height: '100%', background: '#4caf50', transition: 'width 0.3s'}}></div>
          </div>
        </div>
      </div>

      <button className="btn btn-info" style={{width: '100%', marginBottom: '16px'}}>
        <i className="fas fa-edit"></i> Edit Allocation Weights
      </button>
    </div>
  );

  // ========== TAB 6: VALIDATION RULES ==========
  const renderValidationRules = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-check-circle"></i> Validation & Constraints
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Configure validation rules that ensure plan quality and feasibility.
      </p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Constraint</th>
              <th>Current Value</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Min Cases/Region</strong></td>
              <td style={{textAlign: 'center', fontWeight: '700'}}>{auditConfig.validation.minCasesPerRegion}</td>
              <td>Minimum audit cases required per region</td>
              <td><button className="btn btn-sm btn-info">Edit</button></td>
            </tr>
            <tr>
              <td><strong>Max Effort Variance</strong></td>
              <td style={{textAlign: 'center', fontWeight: '700'}}>±{(auditConfig.validation.maxEffortVariance * 100).toFixed(0)}%</td>
              <td>Allowed variance from planned effort</td>
              <td><button className="btn btn-sm btn-info">Edit</button></td>
            </tr>
            <tr>
              <td><strong>Skill Coverage</strong></td>
              <td style={{textAlign: 'center', fontWeight: '700'}}>{(auditConfig.validation.requiredSkillCoverage * 100).toFixed(0)}%</td>
              <td>Required % of needed skills available</td>
              <td><button className="btn btn-sm btn-info">Edit</button></td>
            </tr>
            <tr>
              <td><strong>Max Cases/Auditor</strong></td>
              <td style={{textAlign: 'center', fontWeight: '700'}}>{auditConfig.validation.maxCasesPerAuditor}</td>
              <td>Max audit cases per auditor per year</td>
              <td><button className="btn btn-sm btn-info">Edit</button></td>
            </tr>
            <tr>
              <td><strong>Min Auditors/Region</strong></td>
              <td style={{textAlign: 'center', fontWeight: '700'}}>{auditConfig.validation.minAuditorsPerRegion}</td>
              <td>Minimum auditors required per region</td>
              <td><button className="btn btn-sm btn-info">Edit</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== TAB 7: REGIONS & CAPACITY ==========
  const renderRegionsCapacity = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-map-marked-alt"></i> Regions & Auditor Capacity
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        View and manage regional taxpayer base and available audit resources.
      </p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Taxpayers</th>
              <th>Available Auditors</th>
              <th>Key Skills</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {auditConfig.regions.map((region, idx) => (
              <tr key={idx}>
                <td><strong>{region.name}</strong></td>
                <td style={{textAlign: 'center'}}>{region.taxpayers.toLocaleString()}</td>
                <td style={{textAlign: 'center', fontWeight: '700'}}>{region.availableAuditors}</td>
                <td style={{fontSize: '12px'}}>
                  {Object.entries(region.availableSkills).slice(0, 3).map(([skill, count], i) => (
                    <div key={i}>• {skill}: {count}</div>
                  ))}
                </td>
                <td><button className="btn btn-sm btn-info">Edit Capacity</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ========== RISK DISTRIBUTION ==========
  const renderRiskDistribution = () => (
    <div>
      <div className="section-title">
        <i className="fas fa-chart-line"></i> Risk Distribution Formula
      </div>
      <p style={{ color: '#a0aec0', marginBottom: '16px', fontSize: '13px' }}>
        Configure how risky taxpayers are distributed across risk levels and audit types.
      </p>
      
      <div style={{background: '#1e2a3a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #2d3d4d'}}>
        <h4 style={{margin: '0 0 12px 0'}}>Percentage of Taxpayers Considered Risky</h4>
        <div style={{fontSize: '28px', fontWeight: '700', color: '#f57c00', marginBottom: '8px'}}>
          {auditConfig.riskDistribution.percentageRisky}%
        </div>
        <p style={{margin: '0', fontSize: '12px', color: '#a0aec0'}}>
          Of all {auditConfig.getTotalTaxpayers().toLocaleString()} registered taxpayers, approximately {auditConfig.getTotalRiskyTaxpayers().toLocaleString()} are classified as risky
        </p>
        <button className="btn btn-info" style={{marginTop: '12px'}}>Edit Percentage</button>
      </div>

      <div style={{marginBottom: '24px'}}>
        <h4 style={{margin: '0 0 16px 0'}}>Risk Level Distribution</h4>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px'}}>
          {Object.entries(auditConfig.riskDistribution.split).map(([level, percentage]) => (
            <div key={level} style={{background: '#1e2a3a', padding: '12px', borderRadius: '6px', border: '1px solid #2d3d4d', textAlign: 'center'}}>
              <div style={{fontSize: '12px', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', color: '#a0aec0'}}>
                {level}
              </div>
              <div style={{fontSize: '24px', fontWeight: '700', color: '#4a8fd9'}}>
                {(percentage * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background: '#1a2332', minHeight: 'calc(100vh - 60px)'}}>
      <div style={{background: '#1e2a3a', borderBottom: '1px solid #2d3d4d', padding: '20px'}}>
        <h1 style={{margin: '0 0 16px 0', fontSize: '24px', fontWeight: '700', color: '#4a8fd9'}}>
          <i className="fas fa-sliders-h"></i> System Configuration
        </h1>
        <p style={{margin: '0', color: '#a0aec0', fontSize: '13px'}}>
          Manage all configurable parameters for the audit planning system
        </p>
      </div>

      {/* TABS */}
      <div style={{background: '#1e2a3a', borderBottom: '1px solid #2d3d4d', padding: '0 20px', display: 'flex', gap: '24px', overflowX: 'auto'}}>
        {[
          { id: 'audit-types', label: 'Audit Types', icon: 'fas fa-tasks' },
          { id: 'skills', label: 'Skills', icon: 'fas fa-user-cog' },
          { id: 'risk-levels', label: 'Risk Levels', icon: 'fas fa-traffic-light' },
          { id: 'effort', label: 'Effort Calculation', icon: 'fas fa-calculator' },
          { id: 'allocation', label: 'Allocation Rules', icon: 'fas fa-chart-pie' },
          { id: 'validation', label: 'Validation', icon: 'fas fa-check-circle' },
          { id: 'regions', label: 'Regions & Capacity', icon: 'fas fa-map-marked-alt' },
          { id: 'risk-dist', label: 'Risk Distribution', icon: 'fas fa-chart-line' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '16px 0',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #4a8fd9' : 'none',
              color: activeTab === tab.id ? '#4a8fd9' : '#a0aec0',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeTab === tab.id ? '600' : '400',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={tab.icon} style={{marginRight: '6px'}}></i> {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div style={{padding: '24px', maxWidth: '1400px', margin: '0 auto'}}>
        {activeTab === 'audit-types' && renderAuditTypes()}
        {activeTab === 'skills' && renderSkills()}
        {activeTab === 'risk-levels' && renderRiskLevels()}
        {activeTab === 'effort' && renderEffortCalculation()}
        {activeTab === 'allocation' && renderAllocationRules()}
        {activeTab === 'validation' && renderValidationRules()}
        {activeTab === 'regions' && renderRegionsCapacity()}
        {activeTab === 'risk-dist' && renderRiskDistribution()}
      </div>
    </div>
  );
}

export default ConfigurationManagementView;
