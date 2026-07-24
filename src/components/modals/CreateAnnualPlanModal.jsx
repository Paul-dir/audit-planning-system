import React, { useState, useEffect } from 'react';
import { createAuditPlan } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';
import { loadData } from '../../utils/data';
import Badge from '../Badge';

function CreateAnnualPlanModal({ onClose }) {
  // ===== FORM STATE =====
  const [activeStep, setActiveStep] = useState(1);
  const [year, setYear] = useState('');
  const [planName, setPlanName] = useState('');
  const [strategy, setStrategy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ===== AUDIT TYPE ALLOCATION =====
  const [auditTypeAllocation, setAuditTypeAllocation] = useState({});

  // ===== REGIONAL BREAKDOWN =====
  const [regionalAllocation, setRegionalAllocation] = useState({});

  // ===== CALCULATED TOTALS =====
  const [totalCases, setTotalCases] = useState(0);
  const [totalEffort, setTotalEffort] = useState(0);

  // ===== STATE FOR SAVE OPERATION =====
  const [pendingSubmit, setPendingSubmit] = useState(null); // 'draft' or 'submit'

  // ===== RISK ENGINE DATA =====
  const [riskData, setRiskData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Initialize
  useEffect(() => {
    initializeDates();
    initializeRiskData();
    initializeAuditTypeAllocation();
    initializeRegionalAllocation();
  }, []);

  const initializeDates = () => {
    const nextYear = new Date().getFullYear() + 1;
    setYear(nextYear.toString());
    setPlanName(`Annual Audit Plan ${nextYear}`);
    setStartDate(`${nextYear}-01-01`);
    setEndDate(`${nextYear}-12-31`);
  };

  const initializeRiskData = () => {
    // Mock risk data (in real system, comes from risk engine)
    const data = loadData();
    setRiskData({
      totalTaxpayers: auditConfig.getTotalTaxpayers(),
      riskySuspects: auditConfig.getTotalRiskyTaxpayers(),
      byAuditType: auditConfig.auditTypes.map(type => ({
        id: type.id,
        name: type.name,
        candidates: Math.round(auditConfig.getTotalRiskyTaxpayers() * auditConfig.riskDistribution.byAuditType[type.id])
      }))
    });
  };

  const initializeAuditTypeAllocation = () => {
    // Fixed allocation values as per user specification
    const allocation = {
      'desk_audit': 100,
      'field_audit': 80,
      'joint_audit': 60,
      'transfer_pricing': 40,
      'comprehensive': 100,
      'issue_audit': 30
    };
    setAuditTypeAllocation(allocation);
  };

  const initializeRegionalAllocation = () => {
    const allocation = {};
    const totalTaxpayers = auditConfig.getTotalTaxpayers();
    
    auditConfig.regions.forEach(region => {
      allocation[region.name] = {
        taxpayers: region.taxpayers,
        riskySuspects: Math.round(region.taxpayers * (auditConfig.riskDistribution.percentageRisky / 100)),
        allocatedCases: 0,
        capacity: region.availableAuditors
      };
    });
    setRegionalAllocation(allocation);
  };

  // ===== CALCULATIONS =====
  useEffect(() => {
    calculateTotals();
  }, [auditTypeAllocation, regionalAllocation]);

  const calculateTotals = () => {
    // Total cases from audit type allocation
    const cases = Object.values(auditTypeAllocation).reduce((sum, val) => sum + val, 0);
    setTotalCases(cases);

    // Total effort from audit type allocation
    let effort = 0;
    auditConfig.auditTypes.forEach(type => {
      const count = auditTypeAllocation[type.id] || 0;
      effort += count * type.effortPerCase;
    });
    setTotalEffort(effort);
  };

  // ===== HANDLE PENDING SUBMIT (after regionalAllocation is updated) =====
  useEffect(() => {
    if (!pendingSubmit) return;
    if (Object.keys(regionalAllocation).length === 0) return;
    
    const targetRegionCount = auditConfig.regions.length;
    const hasAllRegions = Object.keys(regionalAllocation).length === targetRegionCount;
    
    if (!hasAllRegions) return;
    
    console.log('Regional allocation ready, executing pending submit:', pendingSubmit);
    console.log('Regional allocation structure:', regionalAllocation);
    
    // Define execution functions with current state values
    const doExecuteSaveDraft = () => {
      createAuditPlan({
        fiscalYear: year,
        name: planName,
        strategy,
        startDate,
        endDate,
        auditTypeAllocation,
        regionalAllocation,
        totalCases,
        totalEffort
      });
      alert('Plan created as DRAFT and ready for review.');
      onClose();
    };
    
    const doExecuteSubmit = () => {
      createAuditPlan({
        fiscalYear: year,
        name: planName,
        strategy,
        startDate,
        endDate,
        auditTypeAllocation,
        regionalAllocation,
        totalCases,
        totalEffort
      });
      alert('Plan submitted to Director for review.');
      onClose();
    };
    
    // Execute the appropriate action
    if (pendingSubmit === 'draft') {
      doExecuteSaveDraft();
    } else if (pendingSubmit === 'submit') {
      doExecuteSubmit();
    }
    
    setPendingSubmit(null);
  }, [pendingSubmit, regionalAllocation, year, planName, strategy, startDate, endDate, auditTypeAllocation, totalCases, totalEffort, onClose]);

  // ===== HANDLERS =====
  const handleAuditTypeChange = (typeId, value) => {
    const newAllocation = { ...auditTypeAllocation };
    newAllocation[typeId] = parseInt(value) || 0;
    setAuditTypeAllocation(newAllocation);
  };

  const validatePlan = () => {
    const errors = [];

    if (!planName.trim()) errors.push('Plan name is required');
    if (!strategy.trim()) errors.push('Audit strategy is required');
    if (totalCases === 0) errors.push('At least one audit type must be allocated cases');
    if (totalCases > auditConfig.getTotalRiskyTaxpayers()) {
      errors.push(`Total cases (${totalCases}) cannot exceed risky taxpayers (${auditConfig.getTotalRiskyTaxpayers()})`);
    }

    const totalCapacity = auditConfig.regions.reduce((sum, r) => sum + r.availableAuditors, 0);
    const requiredAuditors = Math.ceil(totalEffort / auditConfig.calculateAvailableHoursPerAuditor());
    if (requiredAuditors > totalCapacity) {
      errors.push(`Required auditors (${requiredAuditors}) exceeds available capacity (${totalCapacity})`);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const allocateCasesToRegions = () => {
    // Create proper regional allocation with audit type breakdown
    const allocation = {};
    const totalTaxpayers = auditConfig.getTotalTaxpayers();

    auditConfig.regions.forEach(region => {
      allocation[region.name] = {};
      const regionProportion = region.taxpayers / totalTaxpayers;
      
      // For each audit type, allocate proportionally to region
      Object.entries(auditTypeAllocation).forEach(([auditType, totalCases]) => {
        const regionCases = Math.round(totalCases * regionProportion);
        allocation[region.name][auditType] = regionCases;
      });
    });

    // Check for rounding errors and adjust
    Object.entries(auditTypeAllocation).forEach(([auditType, totalCases]) => {
      const totalAllocated = Object.values(allocation).reduce((sum, region) => sum + (region[auditType] || 0), 0);
      const difference = totalCases - totalAllocated;
      
      if (difference !== 0) {
        // Add difference to first region
        const firstRegion = auditConfig.regions[0];
        allocation[firstRegion.name][auditType] = (allocation[firstRegion.name][auditType] || 0) + difference;
      }
    });

    setRegionalAllocation(allocation);
  };

  const handleSaveDraft = () => {
    if (!validatePlan()) return;
    allocateCasesToRegions();
    setPendingSubmit('draft');
  };

  const handleSubmit = () => {
    if (!validatePlan()) return;
    allocateCasesToRegions();
    setPendingSubmit('submit');
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = 2020; y <= currentYear + 5; y++) {
    years.push(y);
  }

  // ===== RENDER =====
  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2><i className="fas fa-calendar-plus"></i> Create Annual Audit Plan</h2>

        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              onClick={() => setActiveStep(step)}
              style={{
                flex: 1,
                padding: '12px',
                textAlign: 'center',
                background: activeStep === step ? '#4a8fd9' : activeStep > step ? '#4caf50' : '#0f1419',
                color: activeStep === step || activeStep > step ? '#0f1419' : '#666',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeStep === step ? '700' : '600'
              }}
            >
              {step === 1 && 'Plan Basics'}
              {step === 2 && 'Audit Types'}
              {step === 3 && 'Regional Distribution'}
              {step === 4 && 'Review'}
            </div>
          ))}
        </div>

        {/* STEP 1: PLAN BASICS */}
        {activeStep === 1 && (
          <div>
            <h3>Step 1: Plan Basics</h3>
            <div className="form-group">
              <label>Fiscal Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Plan Name</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Annual Audit Plan 2026"
              />
            </div>

            <div className="form-group">
              <label>Audit Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #2d3d4d', background: '#0f1419', color: '#2d3d4d', fontFamily: 'inherit' }}
              >
                <option value="">-- Select Audit Strategy --</option>
                {auditConfig.auditStrategies.map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name} - {s.focus}
                  </option>
                ))}
              </select>
              <small style={{ color: '#a0aec0', marginTop: '4px', display: 'block' }}>
                {strategy && auditConfig.auditStrategies.find(s => s.name === strategy)?.description}
              </small>
            </div>

            <div className="form-group">
              <label>Planning Period</label>
              <div className="date-range" style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#a0aec0' }}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#a0aec0' }}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="action-bar" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setActiveStep(2)}>Next: Audit Types</button>
            </div>
          </div>
        )}

        {/* STEP 2: AUDIT TYPES - DETAILED ALLOCATION FROM RISK ENGINE */}
        {activeStep === 2 && (
          <div>
            <h3>Step 2: Allocate Cases by Audit Type</h3>
            <p style={{ color: '#a0aec0', fontSize: '13px', marginBottom: '16px' }}>
              Risk engine identified <strong>{auditConfig.getTotalRiskyTaxpayers().toLocaleString()}</strong> total risky taxpayers.
              Allocate them across audit types. You can adjust the risk engine suggestions if needed.
            </p>

            {/* Risk Engine Breakdown Summary */}
            <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
              <h4 style={{ margin: '0 0 12px 0' }}>Risk Engine Allocation (from Risk Analysis)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                {auditConfig.auditTypes.map(type => {
                  const riskEngineCount = riskData?.byAuditType?.find(a => a.id === type.id)?.candidates || Math.round(auditConfig.getTotalRiskyTaxpayers() * 0.15);
                  return (
                    <div key={type.id} style={{ padding: '10px', background: '#0f1419', borderRadius: '6px', border: '1px solid #90caf9' }}>
                      <div style={{ fontSize: '12px', color: '#a0aec0' }}>{type.name}</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>{riskEngineCount.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#999' }}>({((riskEngineCount / auditConfig.getTotalRiskyTaxpayers()) * 100).toFixed(1)}%)</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Allocation Table with Override Capability */}
            <div className="section-title"><i className="fas fa-tasks"></i> Audit Type Allocation (Editable)</div>
            <div className="table-container" style={{ marginBottom: '24px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Audit Type</th>
                    <th>Complexity</th>
                    <th>Effort/Case</th>
                    <th>Risk Engine</th>
                    <th>Your Allocation</th>
                    <th>% of Total</th>
                    <th>Total Effort</th>
                  </tr>
                </thead>
                <tbody>
                  {auditConfig.auditTypes.map(type => {
                    const riskEngineCandidate = riskData?.byAuditType?.find(a => a.id === type.id)?.candidates || Math.round(auditConfig.getTotalRiskyTaxpayers() * 0.15);
                    const allocated = auditTypeAllocation[type.id] || riskEngineCandidate;
                    const effort = allocated * type.effortPerCase;
                    const totalRisky = auditConfig.getTotalRiskyTaxpayers();
                    const percentOfTotal = totalRisky > 0 ? ((allocated / totalRisky) * 100).toFixed(1) : 0;
                    
                    return (
                      <tr key={type.id} style={{ background: auditTypeAllocation[type.id] ? '#0f14193e0' : '#0f1419' }}>
                        <td><strong>{type.name}</strong></td>
                        <td><Badge status={type.complexity} /></td>
                        <td>{type.effortPerCase}h</td>
                        <td style={{ textAlign: 'center', color: '#a0aec0' }}>{riskEngineCandidate.toLocaleString()}</td>
                        <td>
                          <input
                            type="number"
                            value={allocated}
                            onChange={(e) => handleAuditTypeChange(type.id, e.target.value)}
                            style={{ width: '100px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>{percentOfTotal}%</td>
                        <td style={{ fontWeight: '700', color: '#4a8fd9' }}>{effort.toLocaleString()}h</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                    <td colSpan="3">TOTAL</td>
                    <td style={{ textAlign: 'center' }}>{auditConfig.getTotalRiskyTaxpayers().toLocaleString()}</td>
                    <td style={{ textAlign: 'center', color: '#4a8fd9' }}>{totalCases.toLocaleString()}</td>
                    <td style={{ textAlign: 'center' }}>100%</td>
                    <td style={{ color: '#4a8fd9' }}>{totalEffort.toLocaleString()}h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#1a3a1a', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #4caf50' }}>
              <strong>Available Capacity:</strong> {auditConfig.regions.reduce((sum, r) => sum + r.availableAuditors, 0)} auditors × {auditConfig.calculateAvailableHoursPerAuditor()}h/year = {Math.round((auditConfig.regions.reduce((sum, r) => sum + r.availableAuditors, 0) * auditConfig.calculateAvailableHoursPerAuditor())).toLocaleString()}h capacity
            </div>

            <div className="action-bar" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setActiveStep(1)}>Back</button>
              <button className="btn btn-primary" onClick={() => setActiveStep(3)}>Next: Regional Distribution</button>
            </div>
          </div>
        )}

        {/* STEP 3: REGIONAL DISTRIBUTION */}
        {activeStep === 3 && (
          <div>
            <h3>Step 3: Regional Distribution by Audit Type</h3>
            <p style={{ color: '#a0aec0', fontSize: '13px', marginBottom: '16px' }}>
              Total audit volume ({totalCases} cases) is automatically distributed to regions based on taxpayer base percentage.
              You can adjust individual values if needed.
            </p>

            {/* Show audit type totals first */}
            <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
              <strong>National Audit Type Allocation:</strong>
              <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '12px' }}>
                {auditConfig.auditTypes.map((type, idx) => {
                  const allocationValue = auditTypeAllocation[type.id] || 0;
                  return (
                    <div key={idx} style={{ padding: '8px', background: '#0f1419', borderRadius: '4px', border: '1px solid #90caf9' }}>
                      <strong>{type.name}</strong>: <span style={{ fontWeight: 'bold', color: '#4a8fd9' }}>{allocationValue} cases</span>
                    </div>
                  );
                })}
                <div style={{ padding: '8px', background: '#c8e6c9', color: '#1b5e20', borderRadius: '4px', fontWeight: 'bold' }}>
                  TOTAL: <span style={{ color: '#388e3c', fontSize: '14px' }}>{totalCases} cases</span>
                </div>
              </div>
            </div>

            {/* Regional Distribution Table - EDITABLE */}
            <div className="section-title"><i className="fas fa-map-pin"></i> Regional Allocation by Audit Type (Editable)</div>
            <div className="table-container" style={{ marginBottom: '24px' }}>
              <table>
                <thead>
                  <tr style={{ background: '#6c5ce7', color: '#0f1419' }}>
                    <th>Region</th>
                    <th>% of Taxpayers</th>
                    {auditConfig.auditTypes.map((type, i) => (
                      <th key={i} style={{ textAlign: 'center' }}>{type.name.substring(0, 10)}</th>
                    ))}
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {auditConfig.regions.map(region => {
                    const regionPercent = ((region.taxpayers / auditConfig.getTotalTaxpayers()) * 100).toFixed(1);
                    
                    // Calculate regional totals from all audit types in this region
                    let regionTotalCases = 0;
                    auditConfig.auditTypes.forEach(type => {
                      const cellValue = regionalAllocation[region.name]?.[type.id] 
                        ? parseInt(regionalAllocation[region.name][type.id])
                        : Math.round((auditTypeAllocation[type.id] || 0) * (region.taxpayers / auditConfig.getTotalTaxpayers()));
                      regionTotalCases += cellValue;
                    });

                    return (
                      <tr key={region.name}>
                        <td><strong>{region.name}</strong></td>
                        <td>{regionPercent}%</td>
                        {auditConfig.auditTypes.map((type, idx) => {
                          const defaultAllocation = Math.round((auditTypeAllocation[type.id] || 0) * (region.taxpayers / auditConfig.getTotalTaxpayers()));
                          const currentValue = regionalAllocation[region.name]?.[type.id] || defaultAllocation;
                          const isOverridden = regionalAllocation[region.name]?.[type.id] !== undefined;
                          
                          return (
                            <td key={idx} style={{ textAlign: 'center', background: isOverridden ? '#0f14193e0' : '#0f1419' }}>
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => {
                                  const newRegionalAllocation = { ...regionalAllocation };
                                  if (!newRegionalAllocation[region.name]) {
                                    newRegionalAllocation[region.name] = {};
                                  }
                                  newRegionalAllocation[region.name][type.id] = parseInt(e.target.value) || 0;
                                  setRegionalAllocation(newRegionalAllocation);
                                }}
                                style={{
                                  width: '70px',
                                  padding: '6px',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  fontWeight: isOverridden ? 'bold' : 'normal',
                                  background: isOverridden ? '#0f14193e0' : '#0f1419'
                                }}
                              />
                            </td>
                          );
                        })}
                        <td style={{ fontWeight: 'bold', textAlign: 'center', background: '#0f1419' }}>{regionTotalCases}</td>
                      </tr>
                    );
                  })}
                  {/* TOTALS ROW */}
                  <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
                    <td>TOTAL</td>
                    <td>100%</td>
                    {auditConfig.auditTypes.map((type, idx) => {
                      let totalByType = 0;
                      auditConfig.regions.forEach(region => {
                        const cellValue = regionalAllocation[region.name]?.[type.id] 
                          ? parseInt(regionalAllocation[region.name][type.id])
                          : Math.round((auditTypeAllocation[type.id] || 0) * (region.taxpayers / auditConfig.getTotalTaxpayers()));
                        totalByType += cellValue;
                      });
                      return (
                        <td key={idx} style={{ textAlign: 'center' }}>{totalByType}</td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>{totalCases}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #ffb74d' }}>
              <i className="fas fa-info-circle"></i> <strong>Editable Fields:</strong> You can adjust any regional allocation value above. 
              Cells with orange background show your custom overrides. Column and row totals auto-calculate.
            </div>

            <div className="action-bar" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setActiveStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => setActiveStep(4)}>Next: Final Review</button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SUBMIT */}
        {activeStep === 4 && (
          <div>
            <h3>Step 4: Final Review & Submit</h3>

            {/* VALIDATION ERRORS */}
            {validationErrors.length > 0 && (
              <div style={{ background: '#3a1a1a', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #ff5252' }}>
                <strong style={{ color: '#ff5252' }}>Validation Issues:</strong>
                <ul style={{ margin: '8px 0 0 16px', color: '#ff5252' }}>
                  {validationErrors.map((error, idx) => (
                    <li key={idx} style={{ fontSize: '13px' }}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* PLAN SUMMARY */}
            <div style={{ background: '#1e2a3a', padding: '16px', borderRadius: '6px', marginBottom: '24px', border: '1px solid #2d3d4d' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>Plan Name</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{planName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>Fiscal Year</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{year}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>Total Cases</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#4a8fd9' }}>{totalCases.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>Total Effort</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#4a8fd9' }}>{totalEffort.toLocaleString()}h</div>
                </div>
              </div>
            </div>

            <div className="action-bar" style={{ marginTop: '24px' }}>
              <button className="btn btn-outline" onClick={() => setActiveStep(3)}>Back</button>
              <button
                className="btn btn-primary"
                onClick={handleSaveDraft}
                disabled={validationErrors.length > 0}
              >
                <i className="fas fa-save"></i> Save as Draft
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={validationErrors.length > 0}
              >
                <i className="fas fa-paper-plane"></i> Submit to Director
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateAnnualPlanModal;
