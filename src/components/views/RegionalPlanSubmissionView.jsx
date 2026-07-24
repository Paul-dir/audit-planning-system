import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalPlanSubmissionView - Regional Director submits finalized plans to tax centers
 * Formal handoff from regional to tax center level
 */
function RegionalPlanSubmissionView() {
  const { assignedRegion } = useRegional();
  const [selectedRegion, setSelectedRegion] = useState(assignedRegion || 'Oromia');
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);
  const [allRegions, setAllRegions] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);

  useEffect(() => {
    // Load all regions
    const data = loadData();
    const regions = [...new Set(data.plans.flatMap(p => Object.keys(p.regionalAllocation || {})))];
    setAllRegions(regions.length > 0 ? regions : ['Oromia', 'SNNPR', 'Addis Ababa', 'Amhara', 'Tigray']);
    
    // Load approved plans for all regions
    const approved = data.plans.filter(p => p.status === 'FINALIZED');
    setApprovedPlans(approved);
  }, []);

  useEffect(() => {
    loadPlans();
  }, [selectedRegion]);

  const loadPlans = () => {
    const data = loadData();
    
    // Get plans that have been ACKNOWLEDGED by regional director (from Acknowledge Finalized Plans page)
    // These are the plans ready to be formally submitted to tax centers
    const finalized = data.plans.filter(p =>
      p.status === 'FINALIZED' &&
      p.regionalAllocation &&
      p.regionalAllocation[selectedRegion] &&
      p.regionalAcknowledgment &&
      p.regionalAcknowledgment[selectedRegion] &&
      p.regionalAcknowledgment[selectedRegion].status === 'ACKNOWLEDGED'
    );

    setPlans(finalized);
    
    // Initialize submitted status for all plans
    const submittedStatus = {};
    finalized.forEach(plan => {
      submittedStatus[plan.id] = plan.submittedToTaxCenters?.[selectedRegion]?.status === 'SUBMITTED' || false;
    });
    setSubmitted(submittedStatus);
    
    setLoading(false);
  };

  const handleSelectPlan = (planId) => {
    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    setSelectedPlan(planId);
    setPlanDetails(plan);
  };

  const handleSubmitPlanToTaxCenters = () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    if (!window.confirm(`Submit ${selectedPlan} to all 3 tax centers in ${selectedRegion}?\n\nTax centers will be notified that an approved plan is available for acceptance.`)) {
      return;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan);

    if (planIndex >= 0) {
      const plan = data.plans[planIndex];

      // Initialize submission tracking
      if (!plan.submittedToTaxCenters) {
        plan.submittedToTaxCenters = {};
      }

      // Mark as submitted for this region
      plan.submittedToTaxCenters[selectedRegion] = {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date().toISOString(),
        submittedTo: 'All Tax Centers',
        readyForAcceptance: true
      };

      // Add approval history
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'SUBMITTED_TO_TAX_CENTERS',
        by: 'Regional Director',
        region: selectedRegion,
        date: new Date().toISOString(),
        notes: `Finalized plan officially submitted to all tax centers in ${selectedRegion} for acceptance`,
        version: plan.version
      });

      saveData(data);
      setSubmitted(prev => ({ ...prev, [selectedPlan]: true }));
      
      alert(`✅ Plan ${selectedPlan} officially submitted to all tax centers in ${selectedRegion}!\n\nTax centers can now review and accept the plan.`);
      
      loadPlans();
    }
  };

  const getTaxCentersList = () => {
    // Return 3 tax centers for the region
    return [
      `${selectedRegion}-tc1`,
      `${selectedRegion}-tc2`,
      `${selectedRegion}-tc3`
    ];
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
    return <div style={{ padding: '20px' }}>Loading finalized plans...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-share-alt"></i> Submit Approved Plan to Tax Centers</h2>
        <Badge status={`${plans.length} Plans Ready`} className="director-approved" />
      </div>

      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
        <strong><i className="fas fa-info-circle"></i> Regional Director - Formal Submission</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Submit finalized plans you've acknowledged to your 3 tax centers. Tax centers will receive the plan and can formally accept it for implementation. This creates an official handoff.
        </p>
      </div>

      {/* Region Selector */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ fontWeight: '600', fontSize: '13px' }}>Select Region:</label>
        <select 
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedPlan(null);
            setPlanDetails(null);
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #30363d',
            borderRadius: '8px',
            background: '#1c2128',
            color: '#f0f6fc',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          {allRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Approved Plans for this Region */}
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-check-circle"></i> Approved Plans for {selectedRegion}
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
        <Card title="Finalized Plans" number={plans.length} icon="fas fa-flag-checkered" />
        <Card title="Tax Centers" number={getTaxCentersList().length} icon="fas fa-building" />
        <Card title="Status" number={selectedPlan ? 'Selected' : 'Select Plan'} icon="fas fa-check-circle" />
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
          <h3 style={{ margin: '8px 0', color: '#f57f17' }}>No Plans Ready for Submission</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#f57f17' }}>
            First acknowledge finalized plans using the "Acknowledge Finalized Plans" page, then come here to formally submit them to tax centers.
          </p>
        </div>
      ) : (
        <>
          {/* Plan Selection */}
          <div className="section-title" style={{ marginBottom: '12px' }}>
            <i className="fas fa-file-alt"></i> Select Plan to Submit
          </div>
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>PLAN ID</th>
                  <th>FISCAL YEAR</th>
                  <th>VERSION</th>
                  <th>TOTAL CASES</th>
                  <th>STATUS</th>
                  <th style={{ width: '150px' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} style={{ background: selectedPlan === plan.id ? '#0f14193e0' : '' }}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.version}</td>
                    <td>{plan.totalCases || 0}</td>
                    <td>
                      {submitted[plan.id] ? (
                        <Badge status="Submitted" className="senior-approved" />
                      ) : (
                        <Badge status="Ready" className="pending" />
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
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Total Cases</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f6fc', margin: '4px 0 0 0' }}>
                      {planDetails.totalCases || 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Region Allocation</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f8a6f', margin: '4px 0 0 0' }}>
                      {typeof planDetails.regionalAllocation?.[selectedRegion] === 'object' 
                        ? Object.values(planDetails.regionalAllocation[selectedRegion]).reduce((sum, val) => sum + (parseInt(val) || 0), 0)
                        : (planDetails.regionalAllocation?.[selectedRegion] || 0)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#8b949e', margin: 0 }}>Plan Version</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f0f6fc', margin: '4px 0 0 0' }}>
                      v{planDetails.version}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Type Allocation */}
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <i className="fas fa-chart-bar"></i> Audit Type Allocation for {selectedRegion}
              </div>
              <div className="table-container" style={{ marginBottom: '24px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>AUDIT TYPE</th>
                      <th style={{ textAlign: 'center' }}>ALLOCATED CASES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, idx) => {
                      const allocated = planDetails.auditTypeAllocation?.[auditType] || 0;
                      return (
                        <tr key={idx}>
                          <td><strong>{auditTypeLabels[auditType]}</strong></td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{allocated}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tax Centers List */}
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <i className="fas fa-building"></i> Tax Centers - Will Receive This Plan
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                marginBottom: '24px'
              }}>
                {getTaxCentersList().map(taxCenter => (
                  <div
                    key={taxCenter}
                    style={{
                      background: '#1c2128',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid #30363d',
                      textAlign: 'center'
                    }}
                  >
                    <i className="fas fa-building" style={{ fontSize: '32px', color: '#4f8a6f', marginBottom: '12px', display: 'block' }}></i>
                    <h4 style={{ margin: '8px 0', color: '#f0f6fc' }}>{taxCenter}</h4>
                    <p style={{ color: '#0c4a6e', margin: '4px 0', fontSize: '12px', color: '#8b949e' }}>
                      Ready to receive plan
                    </p>
                  </div>
                ))}
              </div>

              {/* Submission Status */}
              {submitted[selectedPlan] ? (
                <div style={{
                  background: '#c8e6c9', color: '#1b5e20',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #388e3c',
                  marginBottom: '24px'
                }}>
                  <strong style={{ color: '#2e7d32' }}>
                    <i className="fas fa-check-circle"></i> ✅ Already Submitted
                  </strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
                    This plan has been officially submitted to all tax centers. They can now review and accept it.
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
                    <i className="fas fa-exclamation-triangle"></i> Ready to Submit
                  </strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#f57f17' }}>
                    Review the plan details above. When ready, submit to all tax centers for formal acceptance.
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="action-bar">
                <div></div>
                {!submitted[selectedPlan] ? (
                  <button
                    className="btn btn-success"
                    onClick={handleSubmitPlanToTaxCenters}
                    style={{ background: '#4caf50' }}
                  >
                    <i className="fas fa-share-alt"></i> Submit Plan to All Tax Centers
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    disabled
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <i className="fas fa-check"></i> Already Submitted
                  </button>
                )}
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
        <strong><i className="fas fa-info-circle"></i> Workflow Notes</strong>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
          <li>Plans must be ACKNOWLEDGED in "Acknowledge Finalized Plans" first</li>
          <li>This page shows only acknowledged plans ready for submission</li>
          <li>This is the formal submission to tax centers</li>
          <li>Tax centers will see the plan in their "Accept Approved Plan" page</li>
          <li>Each tax center must formally accept the plan</li>
          <li>Once all tax centers accept, the plan is locked for execution</li>
          <li>No conflicts - each submission tracked with timestamp</li>
        </ul>
      </div>
    </div>
  );
}

export default RegionalPlanSubmissionView;
