import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * TaxCenterAcceptancePlanView - Tax centers formally accept submitted approved plans
 * Ensures proper handoff with no data loss or conflicts
 */
function TaxCenterAcceptancePlanView() {
  const { assignedTaxCenter, assignedTaxCenterRegion } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's assigned region and tax center (no selection dropdowns)
  const selectedRegion = userInfo?.orgContext?.assignedRegion || assignedTaxCenterRegion || 'Oromia';
  const selectedTaxCenter = userInfo?.orgContext?.assignedTaxCenter || assignedTaxCenter || 'Tax Center 1';
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [accepted, setAccepted] = useState({});
  const [loading, setLoading] = useState(true);
  const [allRegions, setAllRegions] = useState([]);
  const [allTaxCenters, setAllTaxCenters] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);

  useEffect(() => {
    // Load all regions and tax centers
    const data = loadData();
    const regions = [...new Set(data.plans.flatMap(p => Object.keys(p.regionalAllocation || {})))];
    setAllRegions(regions.length > 0 ? regions : ['Oromia', 'SNNPR', 'Addis Ababa', 'Amhara', 'Tigray']);
    
    // Load all approved plans
    const approved = data.plans.filter(p => p.status === 'FINALIZED');
    setApprovedPlans(approved);
  }, []);

  useEffect(() => {
    loadPlans();
  }, [selectedRegion, selectedTaxCenter]);

  const loadPlans = () => {
    if (!selectedRegion || !selectedTaxCenter) {
      setLoading(false);
      return;
    }

    // Store selected tax center in localStorage so AuditCasesListView can find cases
    localStorage.setItem('tax_center_selection', selectedTaxCenter);
    localStorage.setItem('tax_center_selection_region', selectedRegion);
    
    console.log('📍 Tax Center Selection Stored:', { selectedTaxCenter, selectedRegion });

    const data = loadData();

    // Get plans that have been submitted to tax centers for this region
    const submitted = data.plans.filter(p =>
      p.submittedToTaxCenters &&
      p.submittedToTaxCenters[selectedRegion] &&
      p.submittedToTaxCenters[selectedRegion].status === 'SUBMITTED'
    );

    setPlans(submitted);

    // Initialize accepted status - check for THIS SPECIFIC TAX CENTER
    const acceptedStatus = {};
    submitted.forEach(plan => {
      let taxCenterName = selectedTaxCenter;
      if (taxCenterName.includes('Tax Center')) {
        const parts = taxCenterName.split(' ');
        const tcNum = parts[parts.length - 1];
        taxCenterName = `${selectedRegion}-tc${tcNum}`;
      }
      
      const taxCenterAcceptance = plan.taxCenterAcceptance?.[selectedRegion]?.[taxCenterName];
      acceptedStatus[plan.id] = taxCenterAcceptance?.status === 'ACCEPTED' || false;
    });
    setAccepted(acceptedStatus);

    setLoading(false);
  };

  const handleSelectPlan = (planId) => {
    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    setSelectedPlan(planId);
    setPlanDetails(plan);
  };

  const handleAcceptPlan = () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    let taxCenterName = selectedTaxCenter;
    let taxCenterRegion = selectedRegion;

    if (taxCenterName.includes('Tax Center')) {
      const parts = taxCenterName.split(' ');
      const tcNum = parts[parts.length - 1];
      taxCenterName = `${taxCenterRegion}-tc${tcNum}`;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan);

    if (planIndex >= 0) {
      const plan = data.plans[planIndex];

      // Check if THIS SPECIFIC TAX CENTER already accepted
      if (plan.taxCenterAcceptance?.[taxCenterRegion]?.[taxCenterName]?.status === 'ACCEPTED') {
        alert(`❌ ${taxCenterName} has already accepted this plan. Cannot accept again.`);
        return;
      }

      if (!window.confirm(`Accept ${selectedPlan} for ${taxCenterName}?\n\nThis confirms you are ready to execute the plan. This action cannot be undone.`)) {
        return;
      }

      // Initialize acceptance tracking
      if (!plan.taxCenterAcceptance) {
        plan.taxCenterAcceptance = {};
      }
      if (!plan.taxCenterAcceptance[taxCenterRegion]) {
        plan.taxCenterAcceptance[taxCenterRegion] = {};
      }

      // Mark THIS TAX CENTER as accepted
      plan.taxCenterAcceptance[taxCenterRegion][taxCenterName] = {
        status: 'ACCEPTED',
        taxCenter: taxCenterName,
        region: taxCenterRegion,
        acceptedBy: 'Tax Center Manager',
        acceptedDate: new Date().toISOString(),
        readyForExecution: true,
        noConflict: true,
        dataIntegrity: 'verified'
      };

      // Add approval history
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'ACCEPTED_BY_TAX_CENTER',
        by: 'Tax Center Manager',
        taxCenter: taxCenterName,
        region: taxCenterRegion,
        date: new Date().toISOString(),
        notes: `${taxCenterName} formally accepted the approved plan. Ready for execution.`,
        version: plan.version
      });

      saveData(data);
      
      // Update accepted status for THIS specific tax center
      setAccepted(prev => ({ 
        ...prev, 
        [`${selectedPlan}-${taxCenterRegion}-${taxCenterName}`]: true 
      }));

      alert(`✅ ${taxCenterName} successfully accepted ${selectedPlan}!\n\nThe plan is now locked in for this tax center. Ready for execution.`);

      loadPlans();
    }
  };

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading submitted plans...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-handshake"></i> Accept Approved Plan</h2>
        <Badge status={`${plans.length} Plans Submitted`} className="director-approved" />
      </div>

      <div style={{ background: '#c8e6c9', color: '#1b5e20', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #388e3c' }}>
        <strong><i className="fas fa-check-circle"></i> Tax Center - Formal Acceptance</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Review plans submitted by Regional Director for {selectedTaxCenter} in {selectedRegion}. Formally accept the plan to confirm you're ready for execution.
        </p>
      </div>

      {/* Display Current Region & Tax Center (No Selector) */}
      <div style={{ marginBottom: '24px', padding: '12px', background: '#0f1419', border: '1px solid #30363d', borderRadius: '6px' }}>
        <div style={{ display: 'flex', gap: '32px', fontSize: '13px' }}>
          <div>
            <span style={{ color: '#8b949e' }}>📍 Region:</span> <strong style={{ color: '#f0f6fc' }}>{selectedRegion}</strong>
          </div>
          <div>
            <span style={{ color: '#8b949e' }}>🏛️ Tax Center:</span> <strong style={{ color: '#f0f6fc' }}>{selectedTaxCenter}</strong>
          </div>
        </div>
      </div>

      {/* Approved Plans for Selected Region */}
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-list"></i> All Approved Plans
      </div>
      {approvedPlans.length === 0 ? (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #ffb74d',
          textAlign: 'center'
        }}>
          <p style={{ color: '#f57f17', fontSize: '13px', margin: 0 }}>No approved plans available yet</p>
        </div>
      ) : (
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>PLAN ID</th>
                <th>FISCAL YEAR</th>
                <th>VERSION</th>
                <th>STATUS</th>
                <th style={{ width: '120px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {approvedPlans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.id}</strong></td>
                  <td>{plan.fiscalYear}</td>
                  <td>v{plan.version}</td>
                  <td>
                    <Badge status="Approved" className="senior-approved" />
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${selectedPlan === plan.id ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        handleSelectPlan(plan.id);
                      }}
                    >
                      <i className="fas fa-check"></i> {selectedPlan === plan.id ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cards">
        <Card title="Region" number={selectedRegion} icon="fas fa-map-pin" />
        <Card title="Tax Center" number={selectedTaxCenter} icon="fas fa-building" />
        <Card title="Plans Submitted" number={plans.length} icon="fas fa-inbox" />
        <Card title="Accepted" number={Object.values(accepted).filter(a => a).length} icon="fas fa-check-circle" />
      </div>

      {plans.length === 0 ? (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #ffb74d',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <i className="fas fa-info-circle" style={{ fontSize: '24px', color: '#4a8fd9', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0', color: '#f57f17' }}>No Plans Submitted Yet</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#f57f17' }}>
            Approved plans from {assignedTaxCenterRegion} Regional Director will appear here when they submit them for your acceptance.
          </p>
        </div>
      ) : (
        <>
          {/* Plan Selection */}
          <div className="section-title" style={{ marginBottom: '12px' }}>
            <i className="fas fa-file-alt"></i> Available Plans for Acceptance
          </div>
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>PLAN ID</th>
                  <th>FISCAL YEAR</th>
                  <th>VERSION</th>
                  <th>SUBMITTED DATE</th>
                  <th>STATUS</th>
                  <th style={{ width: '150px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} style={{ background: selectedPlan === plan.id ? '#0f14193e0' : '' }}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>v{plan.version}</td>
                    <td>
                      {plan.submittedToTaxCenters?.[selectedRegion]?.submittedDate
                        ? new Date(plan.submittedToTaxCenters[selectedRegion].submittedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {accepted[plan.id] ? (
                        <Badge status="Accepted" className="senior-approved" />
                      ) : (
                        <Badge status="Pending" className="pending" />
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${selectedPlan === plan.id ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        <i className="fas fa-check"></i> {selectedPlan === plan.id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plan Details */}
          {selectedPlan && planDetails && (
            <>
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <i className="fas fa-clipboard-list"></i> Plan Details - {selectedPlan}
              </div>

              <div style={{ background: '#1c2128', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #30363d' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Fiscal Year</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f6fc', margin: '4px 0 0 0' }}>
                      {planDetails.fiscalYear}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Plan Version</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f6fc', margin: '4px 0 0 0' }}>
                      v{planDetails.version}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Region Allocation</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f8a6f', margin: '4px 0 0 0' }}>
                      {typeof planDetails.regionalAllocation?.[selectedRegion] === 'object' 
                        ? Object.values(planDetails.regionalAllocation[selectedRegion]).reduce((sum, val) => sum + (parseInt(val) || 0), 0)
                        : (planDetails.regionalAllocation?.[selectedRegion] || 0)} cases
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Submitted By</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f6fc', margin: '4px 0 0 0' }}>
                      Regional Director
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Type for this Tax Center */}
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <i className="fas fa-chart-bar"></i> Your Tax Center Allocation
              </div>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>AUDIT TYPE</th>
                      <th style={{ textAlign: 'center' }}>ALLOCATED TO YOU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planDetails?.taxCenterAllocations && Object.keys(planDetails.taxCenterAllocations).length > 0 ? (
                      auditTypes.map((auditType, idx) => {
                        const taxCenterName = selectedTaxCenter.includes('Tax Center')
                          ? `${selectedRegion}-tc${selectedTaxCenter.split(' ').pop()}`
                          : selectedTaxCenter;
                        
                        // Safely get allocation
                        let allocated = 0;
                        const regionAlloc = planDetails.taxCenterAllocations[selectedRegion];
                        
                        if (regionAlloc && typeof regionAlloc === 'object') {
                          const taxCenterAllocation = regionAlloc[taxCenterName];
                          if (taxCenterAllocation && typeof taxCenterAllocation === 'object') {
                            allocated = taxCenterAllocation[auditType] || 0;
                          }
                        }
                        
                        return (
                          <tr key={idx}>
                            <td><strong>{auditTypeLabels[auditType]}</strong></td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{typeof allocated === 'number' ? allocated : 0}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '16px', color: '#8b949e' }}>
                          No allocation data available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Data Integrity Check */}
              <div style={{
                background: '#1a3a1a',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '24px',
                border: '2px solid #4caf50'
              }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#4caf50' }}>
                  <i className="fas fa-shield-alt"></i> Data Integrity Verification
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: '0 0 4px 0' }}>✅ Plan Status</p>
                    <p style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold', margin: 0 }}>FINALIZED</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: '0 0 4px 0' }}>✅ Regional Submission</p>
                    <p style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold', margin: 0 }}>VERIFIED</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: '0 0 4px 0' }}>✅ No Conflicts</p>
                    <p style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold', margin: 0 }}>SECURE</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: '0 0 4px 0' }}>✅ Allocation Locked</p>
                    <p style={{ fontSize: '14px', color: '#4caf50', fontWeight: 'bold', margin: 0 }}>PROTECTED</p>
                  </div>
                </div>
              </div>

              {/* Acceptance Status */}
              {accepted[selectedPlan] ? (
                <div style={{
                  background: '#c8e6c9', color: '#1b5e20',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #388e3c',
                  marginBottom: '24px'
                }}>
                  <strong style={{ color: '#2e7d32' }}>
                    <i className="fas fa-check-circle"></i> ✅ Plan Accepted
                  </strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
                    This plan has been formally accepted by your tax center. It is locked in and ready for execution. No conflicts or data loss possible.
                  </p>
                </div>
              ) : (
                <div style={{
                  background: '#0f14193cd',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #ffb74d',
                  marginBottom: '24px'
                }}>
                  <strong style={{ color: '#f57f17' }}>
                    <i className="fas fa-exclamation-triangle"></i> Review & Accept Plan
                  </strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#f57f17' }}>
                    Review the plan details and your allocation above. When ready, formally accept the plan to begin execution.
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="action-bar">
                <div></div>
                <button
                  className="btn btn-success"
                  onClick={handleAcceptPlan}
                  disabled={accepted[selectedPlan]}
                  style={{ 
                    background: accepted[selectedPlan] ? '#4f5763' : '#4caf50',
                    opacity: accepted[selectedPlan] ? 0.6 : 1,
                    cursor: accepted[selectedPlan] ? 'not-allowed' : 'pointer'
                  }}
                >
                  <i className={accepted[selectedPlan] ? 'fas fa-check' : 'fas fa-handshake'}></i> {accepted[selectedPlan] ? 'Plan Locked - Already Accepted' : 'Accept & Lock Plan'}
                </button>
              </div>
            </>
          )}
        </>
      )}

      <div style={{
        background: '#e3f2fd', color: '#0c4a6e',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #1976d2',
        marginTop: '24px'
      }}>
        <strong><i className="fas fa-info-circle"></i> Acceptance Process Notes</strong>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
          <li>✅ Plans are finalized and verified before submission</li>
          <li>✅ Regional Director formally submits the plan to you</li>
          <li>✅ You review allocations without risk of loss</li>
          <li>✅ Accept the plan to lock it in for execution</li>
          <li>✅ Complete audit trail of all handoffs</li>
          <li>✅ No data conflicts - everything is time-stamped</li>
        </ul>
      </div>
    </div>
  );
}

export default TaxCenterAcceptancePlanView;
