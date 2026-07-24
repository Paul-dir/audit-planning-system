import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import PlanSelector from '../PlanSelector';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

function TaxCenterAllocationView({ currentView, selectedPlan: propSelectedPlan, plans: propPlans, onPlanChange }) {
  const { selectedRegion: contextSelectedRegion, assignedRegion, setSelectedRegion: setContextRegion } = useRegional();
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [plan, setPlan] = useState(null);
  const [regionAllocation, setRegionAllocation] = useState(null);
  const [taxCenterDistribution, setTaxCenterDistribution] = useState({});
  const [loading, setLoading] = useState(true);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(propSelectedPlan || null);

  // Use context region if available, otherwise use assigned region
  useEffect(() => {
    const region = contextSelectedRegion || assignedRegion;
    if (region) {
      console.log('Setting region from context:', region);
      setSelectedRegion(region);
    }
  }, [contextSelectedRegion, assignedRegion]);

  // Update selectedPlan when prop changes
  useEffect(() => {
    if (propSelectedPlan) {
      console.log('Prop selectedPlan changed to:', propSelectedPlan);
      setSelectedPlan(propSelectedPlan);
    }
  }, [propSelectedPlan]);

  // Load data when region or selected plan changes
  useEffect(() => {
    if (!selectedRegion) {
      setLoading(false);
      return;
    }

    console.log('TaxCenterAllocationView loading for region:', selectedRegion, 'plan:', selectedPlan);
    setLoading(true);
    const data = loadData();
    console.log('Loaded plans:', data.plans?.length);
    
    if (data?.plans && data.plans.length > 0) {
      setAllPlans(data.plans);
      
      // If selectedPlan is set (from prop or state), load that specific plan
      if (selectedPlan) {
        const specificPlan = data.plans.find(p => p.id === selectedPlan);
        if (specificPlan && specificPlan.regionalAllocation && specificPlan.regionalAllocation[selectedRegion]) {
          console.log('Loading specific plan:', selectedPlan);
          setPlan(specificPlan);
          
          const breakdown = specificPlan.regionalAllocation[selectedRegion];
          const totalCases = Object.values(breakdown).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
          
          setRegionAllocation({
            name: selectedRegion,
            totalCases,
            breakdown
          });

          // Get tax centers for this region from the specific plan
          let taxCenters = [];
          
          if (specificPlan.taxCenterAllocations && specificPlan.taxCenterAllocations[selectedRegion]) {
            taxCenters = Object.keys(specificPlan.taxCenterAllocations[selectedRegion]);
          } else {
            // Fallback: Generate based on region name pattern
            taxCenters = [
              `${selectedRegion}-tc1`,
              `${selectedRegion}-tc2`,
              `${selectedRegion}-tc3`
            ];
          }

          // Initialize tax center distribution from the specific plan
          const tcDist = {};
          const allocatedPerTaxCenter = {};
          
          if (specificPlan.taxCenterAllocations && specificPlan.taxCenterAllocations[selectedRegion]) {
            // Use existing allocations from this specific plan
            Object.assign(allocatedPerTaxCenter, specificPlan.taxCenterAllocations[selectedRegion]);
          } else {
            // AUTO-FILL: Distribute evenly across tax centers
            const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
            const numTaxCenters = taxCenters.length;
            
            auditTypes.forEach(auditType => {
              const totalForType = breakdown[auditType] || 0;
              const perCenter = Math.floor(totalForType / numTaxCenters);
              const remainder = totalForType % numTaxCenters;
              
              taxCenters.forEach((tcName, idx) => {
                if (!allocatedPerTaxCenter[tcName]) {
                  allocatedPerTaxCenter[tcName] = {};
                }
                const allocation = idx < (numTaxCenters - remainder) ? perCenter : perCenter + 1;
                allocatedPerTaxCenter[tcName][auditType] = allocation;
              });
            });
          }
          
          taxCenters.forEach(tcName => {
            tcDist[tcName] = allocatedPerTaxCenter[tcName] || {
              desk_audit: 0,
              field_audit: 0,
              joint_audit: 0,
              transfer_pricing: 0,
              comprehensive: 0,
              issue_audit: 0
            };
          });
          
          setTaxCenterDistribution(tcDist);
        }
      } else {
        // No specific plan selected, load any plan with regional allocation for this region
        loadPlanForRegion(data.plans, selectedRegion);
      }
    }
    
    setLoading(false);
  }, [selectedRegion, selectedPlan]);

  const loadPlanForRegion = (plans, region) => {
    console.log('Loading plan for region:', region);
    
    // Find ANY plan with regional allocation for this region
    const planWithAllocation = plans.find(p => 
      p.regionalAllocation && p.regionalAllocation[region]
    );

    console.log('Plan found:', !!planWithAllocation, planWithAllocation?.id);

    if (planWithAllocation) {
      setPlan(planWithAllocation);
      setSelectedRegion(region);
      
      const breakdown = planWithAllocation.regionalAllocation[region];
      const totalCases = Object.values(breakdown).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      
      setRegionAllocation({
        name: region,
        totalCases,
        breakdown
      });

      // Get tax centers for this region dynamically from plan data
      let taxCenters = [];
      
      // Try to get tax centers from plan's tax center allocations if it exists
      if (planWithAllocation.taxCenterAllocations && planWithAllocation.taxCenterAllocations[region]) {
        taxCenters = Object.keys(planWithAllocation.taxCenterAllocations[region]);
      } else {
        // Fallback: Generate based on region name pattern
        taxCenters = [
          `${region}-tc1`,
          `${region}-tc2`,
          `${region}-tc3`
        ];
      }

      // Initialize tax center distribution - AUTO-FILL from plan allocation
      const tcDist = {};
      const allocatedPerTaxCenter = {};
      
      // First, check if there's existing allocation data
      if (planWithAllocation.taxCenterAllocations && planWithAllocation.taxCenterAllocations[region]) {
        // Use existing allocations
        Object.assign(allocatedPerTaxCenter, planWithAllocation.taxCenterAllocations[region]);
      } else {
        // AUTO-FILL: Distribute evenly across tax centers
        const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
        const numTaxCenters = taxCenters.length;
        
        auditTypes.forEach(auditType => {
          const totalForType = breakdown[auditType] || 0;
          const perCenter = Math.floor(totalForType / numTaxCenters);
          const remainder = totalForType % numTaxCenters;
          
          taxCenters.forEach((tcName, idx) => {
            if (!allocatedPerTaxCenter[tcName]) {
              allocatedPerTaxCenter[tcName] = {};
            }
            // Distribute: first centers get base amount, last centers get remainder
            const allocation = idx < (numTaxCenters - remainder) ? perCenter : perCenter + 1;
            allocatedPerTaxCenter[tcName][auditType] = allocation;
          });
        });
      }
      
      taxCenters.forEach(tcName => {
        tcDist[tcName] = allocatedPerTaxCenter[tcName] || {
          desk_audit: 0,
          field_audit: 0,
          joint_audit: 0,
          transfer_pricing: 0,
          comprehensive: 0,
          issue_audit: 0
        };
      });
      
      setTaxCenterDistribution(tcDist);
    } else {
      console.log('No plan found with regional allocation for region:', region);
      setTaxCenterDistribution({});
    }
  };

  const handleCellChange = (taxCenter, auditType, value) => {
    setTaxCenterDistribution(prev => ({
      ...prev,
      [taxCenter]: {
        ...prev[taxCenter],
        [auditType]: parseInt(value) || 0
      }
    }));
  };

  const getTaxCenterTotal = (tcName) => {
    return Object.values(taxCenterDistribution[tcName] || {}).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const getAuditTypeTotal = (auditType) => {
    let total = 0;
    Object.values(taxCenterDistribution).forEach(tc => {
      total += parseInt(tc[auditType]) || 0;
    });
    return total;
  };

  const canSendAllocations = () => {
    if (!isDistributionPerfect()) return false;
    // Check if already sent
    const data = loadData();
    const currentPlan = data.plans.find(p => p.id === plan?.id);
    if (currentPlan?.taxCenterAllocations && currentPlan.taxCenterAllocations[selectedRegion]) {
      return false; // Already sent
    }
    return true;
  };

  const isSent = () => {
    if (!plan) return false;
    const data = loadData();
    const currentPlan = data.plans.find(p => p.id === plan?.id);
    console.log('Checking if plan', plan?.id, 'is sent for region', selectedRegion, ':', !!currentPlan?.taxCenterAllocations?.[selectedRegion]);
    return currentPlan?.taxCenterAllocations && currentPlan.taxCenterAllocations[selectedRegion];
  };

  const isDistributionPerfect = () => {
    if (!regionAllocation || !regionAllocation.breakdown) return false;
    
    for (const [auditType, regionalCount] of Object.entries(regionAllocation.breakdown)) {
      const distributedCount = getAuditTypeTotal(auditType);
      if (distributedCount !== parseInt(regionalCount)) {
        return false;
      }
    }
    return true;
  };

  const handleSendAllocations = () => {
    if (!isDistributionPerfect()) {
      alert('Please distribute all audit cases exactly as allocated.');
      return;
    }

    if (!window.confirm(`Send allocations to ${Object.keys(taxCenterDistribution).length} tax centers?`)) {
      return;
    }

    // Save allocations to plan
    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);
    
    if (planIndex >= 0) {
      const currentPlan = data.plans[planIndex];
      
      // Check if already sent to this region
      if (currentPlan.taxCenterAllocations && currentPlan.taxCenterAllocations[selectedRegion]) {
        alert('⚠️ Allocations have already been sent to tax centers in ' + selectedRegion + '. Cannot send again.');
        return;
      }

      // Initialize if needed
      if (!currentPlan.taxCenterAllocations) {
        currentPlan.taxCenterAllocations = {};
      }

      // Save the allocations
      currentPlan.taxCenterAllocations[selectedRegion] = taxCenterDistribution;
      
      console.log('=== SAVING ALLOCATIONS ===');
      console.log('Region:', selectedRegion);
      console.log('Tax center keys being saved:', Object.keys(taxCenterDistribution));
      console.log('Allocations:', taxCenterDistribution);

      // ✅ NEW: SET ALLOCATION STATUS TO 'SENT'
      if (!currentPlan.allocationStatus) {
        currentPlan.allocationStatus = {};
      }
      if (!currentPlan.allocationStatus[selectedRegion]) {
        currentPlan.allocationStatus[selectedRegion] = {};
      }

      currentPlan.allocationStatus[selectedRegion].status = 'SENT';
      currentPlan.allocationStatus[selectedRegion].sentDate = new Date().toISOString();
      currentPlan.allocationStatus[selectedRegion].sentBy = 'Regional Director';
      
      console.log(`✅ SET ALLOCATION STATUS: ${selectedRegion} = SENT`);
      console.log('Allocation Status:', currentPlan.allocationStatus[selectedRegion]);

      // Mark plan status as allocation sent
      if (!currentPlan.allocationSentDate) {
        currentPlan.allocationSentDate = new Date().toISOString();
      }
      
      saveData(data);
      
      // IMPORTANT: Set localStorage for each tax center so they can load their allocation
      // Get the NEXT available index (don't overwrite existing tax centers from other regions!)
      let nextIndex = 0;
      while (localStorage.getItem(`tax_center_${nextIndex}`) !== null && nextIndex < 100) {
        nextIndex++;
      }
      
      Object.keys(taxCenterDistribution).forEach((taxCenterName) => {
        // Check if this tax center already exists in storage
        let existingIndex = -1;
        for (let i = 0; i < 100; i++) {
          if (localStorage.getItem(`tax_center_${i}`) === taxCenterName) {
            existingIndex = i;
            break;
          }
        }
        
        if (existingIndex >= 0) {
          // Update existing entry
          localStorage.setItem(`tax_center_${existingIndex}_region`, selectedRegion);
          localStorage.setItem(`tax_center_${existingIndex}_plan`, currentPlan.id);
          console.log(`Updated tax_center_${existingIndex}: ${taxCenterName}`);
        } else {
          // Add new entry
          localStorage.setItem(`tax_center_${nextIndex}`, taxCenterName);
          localStorage.setItem(`tax_center_${nextIndex}_region`, selectedRegion);
          localStorage.setItem(`tax_center_${nextIndex}_plan`, currentPlan.id);
          console.log(`Added tax_center_${nextIndex}: ${taxCenterName} in ${selectedRegion}`);
          nextIndex++;
        }
      });
      
      alert('✅ Allocations sent to ' + Object.keys(taxCenterDistribution).length + ' tax centers!\n\nEach tax center can now view their specific allocation using the selector.');
      
      // Disable button by hiding it
      setPlan({ ...currentPlan, allocationsSent: true });
    } else {
      alert('Error: Could not find plan to save allocations.');
    }
  };

  const handleResetToAutoFill = () => {
    if (!window.confirm('Reset all allocations to auto-fill (even distribution)?\n\nThis will recalculate based on the regional plan.')) {
      return;
    }

    // Recalculate auto-fill distribution
    const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
    const taxCenters = Object.keys(taxCenterDistribution);
    const newDistribution = {};
    
    auditTypes.forEach(auditType => {
      const totalForType = regionAllocation.breakdown[auditType] || 0;
      const perCenter = Math.floor(totalForType / 3);
      const remainder = totalForType % 3;
      
      taxCenters.forEach((tcName, idx) => {
        if (!newDistribution[tcName]) {
          newDistribution[tcName] = {};
        }
        const allocation = idx < 2 ? perCenter : perCenter + remainder;
        newDistribution[tcName][auditType] = allocation;
      });
    });
    
    setTaxCenterDistribution(newDistribution);
    alert('✅ Allocation reset to auto-fill (even distribution)');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!plan || !regionAllocation) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2>No Plan Available</h2>
        </div>
        <p>No plan found with regional allocation for {selectedRegion}</p>
        <p style={{ fontSize: '12px', color: '#a0aec0' }}>
          Total plans in system: {allPlans.length}
        </p>
        {allPlans.length > 0 && (
          <div style={{ marginTop: '12px', fontSize: '12px' }}>
            <p>Available plans:</p>
            {allPlans.map(p => (
              <div key={p.id} style={{ color: '#a0aec0' }}>
                {p.id}: {p.regionalAllocation ? Object.keys(p.regionalAllocation).join(', ') : 'no regional allocation'}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'DESK AUDIT',
    field_audit: 'FIELD AUDIT',
    joint_audit: 'JOINT AUDIT',
    transfer_pricing: 'TRANSFER P',
    comprehensive: 'COMPREHENSIVE',
    issue_audit: 'ISSUE AUDIT'
  };

  const taxCenters = Object.keys(taxCenterDistribution);

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="detail-header">
        <h2><i className="fas fa-tasks"></i> Allocate to Tax Centers - {selectedRegion}</h2>
        <Badge status="Manual Distribution" className="director-approved" />
      </div>

      {/* Plan Selector - PROMINENT at top */}
      {propPlans && propPlans.length > 0 && (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '3px solid #4a8fd9',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 3px 10px rgba(0, 212, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, minWidth: '400px' }}>
            <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a8fd9', whiteSpace: 'nowrap' }}>
              <i className="fas fa-file-alt"></i> CHOOSE PLAN:
            </label>
            <select
              value={selectedPlan || ''}
              onChange={(e) => {
                const newPlanId = e.target.value;
                console.log('Plan selector changed from', selectedPlan, 'to', newPlanId);
                setSelectedPlan(newPlanId);
                if (onPlanChange) onPlanChange(newPlanId);
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '6px',
                border: '2px solid #4a8fd9',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                background: '#0f1419',
                minWidth: '240px',
                color: '#2d3d4d'
              }}
            >
              <option value="">-- Select a plan to allocate --</option>
              {propPlans.map(planOption => {
                const isAllocated = planOption.taxCenterAllocations && planOption.taxCenterAllocations[selectedRegion];
                return (
                  <option key={planOption.id} value={planOption.id}>
                    {planOption.id} (FY {planOption.fiscalYear}) {isAllocated ? '✓ Allocated' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div style={{ fontSize: '12px', color: '#d84315', fontWeight: '600', textAlign: 'right' }}>
            {selectedPlan ? (
              <>
                <div><i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> {selectedPlan} selected</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Switch to allocate different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {propPlans.length} plan(s) available</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Select to begin allocation</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Review Plan */}
      <div style={{ background: '#1a3a1a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #388e3c' }}>
        <strong><i className="fas fa-check-circle"></i> Step 1: Review Plan from Director</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          You have received the {plan.name || 'Annual Audit Plan'} for {selectedRegion} region. Total cases: <strong>{regionAllocation.totalCases}</strong>
        </p>
      </div>

      {/* Plan Details Cards */}
      <div className="cards">
        <Card title="Plan ID" number={plan.id} icon="fas fa-id-badge" />
        <Card title="Version" number={plan.version} icon="fas fa-code-branch" />
        <Card title="Total Cases" number={regionAllocation.totalCases} icon="fas fa-tasks" />
        <Card title="Fiscal Year" number={plan.fiscalYear || '2026'} icon="fas fa-calendar" />
      </div>

      {/* Plan Details Section */}
      <div style={{ marginTop: '24px', background: '#f8f9fc', color: '#0c4a6e', padding: '16px', borderRadius: '8px', border: '1px solid #2d3d4d' }}>
        <h3><i className="fas fa-info-circle"></i> Plan Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Planning Tactics</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{plan.strategy || 'Risk-based approach'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Planning Period</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{plan.startDate?.split('T')[0]} to {plan.endDate?.split('T')[0]}</p>
          </div>
        </div>
      </div>

      {/* Audit Type Breakdown */}
      <div className="section-title" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <i className="fas fa-chart-pie"></i> Audit Type Breakdown for {selectedRegion}
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CASES</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const cases = regionAllocation.breakdown?.[auditType] || 0;
              const percentage = ((cases / regionAllocation.totalCases) * 100).toFixed(1);
              return (
                <tr key={idx}>
                  <td><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td style={{ textAlign: 'center' }}>{cases}</td>
                  <td style={{ textAlign: 'center' }}>{percentage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{regionAllocation.totalCases}</td>
              <td style={{ textAlign: 'center' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Step 2: Allocate to Tax Centers */}
      <div style={{ background: '#1a3a1a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #388e3c' }}>
        <strong><i className="fas fa-tasks"></i> Step 2: Allocate to Tax Centers</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          You must allocate all {regionAllocation.totalCases} cases to your 3 tax centers. Each tax center will provide feedback based on their allocation.
        </p>
      </div>

      {/* Tax Center Distribution Table */}
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-building"></i> Tax Center Distribution
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>TAX CENTER</th>
              {auditTypes.map(auditType => (
                <th key={auditType} style={{ textAlign: 'center', color: '#4a8fd9' }}>
                  {auditTypeLabels[auditType]}
                </th>
              ))}
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {taxCenters.map((tcName, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 'bold' }}>{tcName}</td>
                {auditTypes.map(auditType => (
                  <td key={auditType} style={{ textAlign: 'center', padding: '8px' }}>
                    <input
                      type="number"
                      value={taxCenterDistribution[tcName][auditType] || 0}
                      onChange={(e) => handleCellChange(tcName, auditType, e.target.value)}
                      style={{
                        width: '70px',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '14px'
                      }}
                      min="0"
                    />
                  </td>
                ))}
                <td style={{ textAlign: 'center', fontWeight: 'bold', background: '#1a3a1a' }}>
                  {getTaxCenterTotal(tcName)}
                </td>
              </tr>
            ))}
            <tr style={{ background: '#c8e6c9', color: '#1b5e20', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              {auditTypes.map(auditType => (
                <td key={auditType} style={{ textAlign: 'center' }}>
                  {getAuditTypeTotal(auditType)} / {regionAllocation.breakdown?.[auditType] || 0}
                </td>
              ))}
              <td style={{ textAlign: 'center' }}>
                {Object.values(taxCenterDistribution).reduce((sum, tc) => {
                  const tcName = Object.keys(taxCenterDistribution)[Object.values(taxCenterDistribution).indexOf(tc)];
                  return sum + (getTaxCenterTotal(tcName) || 0);
                }, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Status Message */}
      {isSent() ? (
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> ✅ Allocations Already Sent
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            Allocations have been sent to all tax centers. Each tax center can view their specific allocation.
          </p>
        </div>
      ) : isDistributionPerfect() ? (
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> Perfect: All regional allocations have been distributed to tax centers exactly.
          </strong>
        </div>
      ) : (
        <div style={{
          background: '#0f14193cd',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #ffb74d',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#f57f17' }}>
            <i className="fas fa-exclamation-triangle"></i> Distribute all audit types to tax centers exactly as allocated.
          </strong>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-bar" style={{ marginTop: '24px' }}>
        <button className="btn btn-outline">
          <i className="fas fa-arrow-left"></i> Back to Menu
        </button>
        {!isSent() && (
          <>
            <button 
              className="btn btn-outline"
              onClick={handleResetToAutoFill}
              title="Reset allocation to auto-fill (even distribution)"
            >
              <i className="fas fa-redo"></i> Reset to Auto-Fill
            </button>
            <button 
              className="btn btn-success"
              onClick={handleSendAllocations}
              disabled={!canSendAllocations()}
              style={{ opacity: canSendAllocations() ? 1 : 0.5, cursor: canSendAllocations() ? 'pointer' : 'not-allowed' }}
            >
              <i className="fas fa-paper-plane"></i> Send Allocations to Tax Centers
            </button>
          </>
        )}
        {isSent() && (
          <button 
            className="btn btn-success"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <i className="fas fa-check"></i> Already Sent - Cannot Send Again
          </button>
        )}
      </div>
    </div>
  );
}

export default TaxCenterAllocationView;
