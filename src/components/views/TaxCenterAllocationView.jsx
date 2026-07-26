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
  const [isDarkMode] = useState(false);

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
    return <div className="px-6 py-8 text-text-primary dark:text-text-primary">Loading...</div>;
  }

  if (!plan || !regionAllocation) {
    return (
      <div className="px-6 py-8">
        <div className="detail-header">
          <h2 className="text-2xl font-bold text-text-hi dark:text-text-hi">No Plan Available</h2>
        </div>
        <p className="text-text-primary dark:text-text-primary mt-4">No plan found with regional allocation for {selectedRegion}</p>
        <p className="text-xs text-text-mid dark:text-text-mid mt-2">
          Total plans in system: {allPlans.length}
        </p>
        {allPlans.length > 0 && (
          <div className="mt-4 text-xs">
            <p className="text-text-primary dark:text-text-primary font-semibold">Available plans:</p>
            {allPlans.map(p => (
              <div key={p.id} className="text-text-mid dark:text-text-mid mt-1">
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
    <div className="px-6 py-8">
      {/* Header */}
      <div className="detail-header mb-6">
        <h2 className="text-2xl font-bold text-text-hi dark:text-text-hi flex items-center gap-2">
          <i className="fas fa-tasks"></i> Allocate to Tax Centers - {selectedRegion}
        </h2>
        <Badge status="Manual Distribution" className="director-approved" />
      </div>

      {/* Plan Selector - PROMINENT at top */}
      {propPlans && propPlans.length > 0 && (
        <div className="bg-ink dark:bg-ink border-2 border-blue dark:border-blue rounded-lg px-4 py-3 mb-6 shadow-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="flex gap-3 items-center flex-1 min-w-96">
            <label className="text-sm font-bold text-blue dark:text-blue whitespace-nowrap">
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
              className="px-4 py-3 rounded border-2 border-blue dark:border-blue text-sm font-bold cursor-pointer bg-ink dark:bg-ink min-w-60 text-text-primary dark:text-text-primary"
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
          <div className="text-xs text-danger dark:text-danger font-semibold text-right">
            {selectedPlan ? (
              <>
                <div><i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> {selectedPlan} selected</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-1">Switch to allocate different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {propPlans.length} plan(s) available</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-1">Select to begin allocation</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 1: Review Plan */}
      <div className="bg-teal/20 dark:bg-teal/20 border border-teal dark:border-teal rounded-lg px-4 py-3 mb-6">
        <strong className="flex items-center gap-2 text-text-hi dark:text-text-hi"><i className="fas fa-check-circle"></i> Step 1: Review Plan from Director</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 text-xs leading-relaxed">
          You have received the {plan.name || 'Annual Audit Plan'} for {selectedRegion} region. Total cases: <strong>{regionAllocation.totalCases}</strong>
        </p>
      </div>

      {/* Plan Details Cards */}
      <div className="cards mb-6">
        <Card title="Plan ID" number={plan.id} icon="fas fa-id-badge" />
        <Card title="Version" number={plan.version} icon="fas fa-code-branch" />
        <Card title="Total Cases" number={regionAllocation.totalCases} icon="fas fa-tasks" />
        <Card title="Fiscal Year" number={plan.fiscalYear || '2026'} icon="fas fa-calendar" />
      </div>

      {/* Plan Details Section */}
      <div className="mt-6 bg-panel dark:bg-panel border border-border dark:border-border rounded-lg px-4 py-4 mb-6">
        <h3 className="text-text-hi dark:text-text-hi font-bold text-base mb-3 m-0"><i className="fas fa-info-circle"></i> Plan Details</h3>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-xs text-text-mid dark:text-text-mid m-0">Planning Tactics</p>
            <p className="text-sm text-text-primary dark:text-text-primary m-0 mt-1">{plan.strategy || 'Risk-based approach'}</p>
          </div>
          <div>
            <p className="text-xs text-text-mid dark:text-text-mid m-0">Planning Period</p>
            <p className="text-sm text-text-primary dark:text-text-primary m-0 mt-1">{plan.startDate?.split('T')[0]} to {plan.endDate?.split('T')[0]}</p>
          </div>
        </div>
      </div>

      {/* Audit Type Breakdown */}
      <div className="section-title mt-6 mb-4 flex items-center gap-2 text-text-hi dark:text-text-hi font-bold">
        <i className="fas fa-chart-pie"></i> Audit Type Breakdown for {selectedRegion}
      </div>
      <div className="overflow-x-auto mb-6 border border-border dark:border-border rounded-lg">
        <table className="w-full text-xs bg-panel dark:bg-panel">
          <thead>
            <tr className="bg-panel dark:bg-panel border-b-2 border-border dark:border-border">
              <th className="text-left text-blue dark:text-blue px-4 py-2 font-bold">AUDIT TYPE</th>
              <th className="text-center text-blue dark:text-blue px-4 py-2 font-bold">CASES</th>
              <th className="text-center text-blue dark:text-blue px-4 py-2 font-bold">% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const cases = regionAllocation.breakdown?.[auditType] || 0;
              const percentage = ((cases / regionAllocation.totalCases) * 100).toFixed(1);
              return (
                <tr key={idx} className="border-b border-border dark:border-border hover:bg-ink/50 dark:hover:bg-ink/50">
                  <td className="px-4 py-2"><strong className="text-text-primary dark:text-text-primary">{auditTypeLabels[auditType]}</strong></td>
                  <td className="text-center px-4 py-2 text-text-primary dark:text-text-primary">{cases}</td>
                  <td className="text-center px-4 py-2 text-text-primary dark:text-text-primary">{percentage}%</td>
                </tr>
              );
            })}
            <tr className="bg-ink dark:bg-ink font-bold border-t-2 border-border dark:border-border">
              <td className="px-4 py-2 text-text-hi dark:text-text-hi">TOTAL</td>
              <td className="text-center px-4 py-2 text-text-hi dark:text-text-hi">{regionAllocation.totalCases}</td>
              <td className="text-center px-4 py-2 text-text-hi dark:text-text-hi">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Step 2: Allocate to Tax Centers */}
      <div className="bg-teal/20 dark:bg-teal/20 border border-teal dark:border-teal rounded-lg px-4 py-3 mb-6">
        <strong className="flex items-center gap-2 text-text-hi dark:text-text-hi"><i className="fas fa-tasks"></i> Step 2: Allocate to Tax Centers</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 text-xs leading-relaxed">
          You must allocate all {regionAllocation.totalCases} cases to your 3 tax centers. Each tax center will provide feedback based on their allocation.
        </p>
      </div>

      {/* Tax Center Distribution Table */}
      <div className="section-title mb-4 flex items-center gap-2 text-text-hi dark:text-text-hi font-bold">
        <i className="fas fa-building"></i> Tax Center Distribution
      </div>
      
      <div className="overflow-x-auto mb-6 border border-border dark:border-border rounded-lg">
        <table className="w-full text-xs bg-panel dark:bg-panel">
          <thead>
            <tr className="bg-panel dark:bg-panel border-b-2 border-border dark:border-border">
              <th className="text-left text-blue dark:text-blue px-4 py-2 font-bold">TAX CENTER</th>
              {auditTypes.map(auditType => (
                <th key={auditType} className="text-center text-blue dark:text-blue px-4 py-2 font-bold">
                  {auditTypeLabels[auditType]}
                </th>
              ))}
              <th className="text-center text-blue dark:text-blue px-4 py-2 font-bold">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {taxCenters.map((tcName, idx) => (
              <tr key={idx} className="border-b border-border dark:border-border hover:bg-ink/50 dark:hover:bg-ink/50">
                <td className="px-4 py-2 font-bold text-text-primary dark:text-text-primary">{tcName}</td>
                {auditTypes.map(auditType => (
                  <td key={auditType} className="text-center px-4 py-2">
                    <input
                      type="number"
                      value={taxCenterDistribution[tcName][auditType] || 0}
                      onChange={(e) => handleCellChange(tcName, auditType, e.target.value)}
                      className="w-16 px-2 py-1 border border-border dark:border-border rounded text-center text-sm bg-ink dark:bg-ink text-text-primary dark:text-text-primary focus:border-blue dark:focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue dark:focus:ring-blue"
                      min="0"
                    />
                  </td>
                ))}
                <td className="text-center px-4 py-2 font-bold bg-teal/20 dark:bg-teal/20 text-teal dark:text-teal">
                  {getTaxCenterTotal(tcName)}
                </td>
              </tr>
            ))}
            <tr className="bg-teal/20 dark:bg-teal/20 text-teal dark:text-teal font-bold border-t-2 border-teal dark:border-teal">
              <td className="px-4 py-2">TOTAL</td>
              {auditTypes.map(auditType => (
                <td key={auditType} className="text-center px-4 py-2">
                  {getAuditTypeTotal(auditType)} / {regionAllocation.breakdown?.[auditType] || 0}
                </td>
              ))}
              <td className="text-center px-4 py-2">
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
        <div className="bg-teal/20 dark:bg-teal/20 border-2 border-teal dark:border-teal rounded-lg px-4 py-4 text-center mb-6">
          <strong className="flex items-center justify-center gap-2 text-teal dark:text-teal">
            <i className="fas fa-check-circle"></i> ✅ Allocations Already Sent
          </strong>
          <p className="text-text-mid dark:text-text-mid m-0 mt-2 text-xs">
            Allocations have been sent to all tax centers. Each tax center can view their specific allocation.
          </p>
        </div>
      ) : isDistributionPerfect() ? (
        <div className="bg-teal/20 dark:bg-teal/20 border-2 border-teal dark:border-teal rounded-lg px-4 py-4 text-center mb-6">
          <strong className="flex items-center justify-center gap-2 text-teal dark:text-teal">
            <i className="fas fa-check-circle"></i> Perfect: All regional allocations have been distributed to tax centers exactly.
          </strong>
        </div>
      ) : (
        <div className="bg-gold/20 dark:bg-gold/20 border-2 border-gold dark:border-gold rounded-lg px-4 py-4 text-center mb-6">
          <strong className="text-gold dark:text-gold flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-triangle"></i> Distribute all audit types to tax centers exactly as allocated.
          </strong>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-8 pt-6 border-t border-border dark:border-border">
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
            className="btn btn-success opacity-60 cursor-not-allowed"
            disabled
          >
            <i className="fas fa-check"></i> Already Sent - Cannot Send Again
          </button>
        )}
      </div>
    </div>
  );
}

export default TaxCenterAllocationView;
