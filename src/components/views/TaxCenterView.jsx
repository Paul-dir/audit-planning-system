import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * TaxCenterView - Shows allocation sent by regional director
 * Tax centers provide feedback on their capacity to deliver
 */
function TaxCenterView({ currentView }) {
  const { assignedTaxCenter, assignedTaxCenterRegion } = useRegional();
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]); // All plans with allocations for this tax center
  const [selectedPlanId, setSelectedPlanId] = useState(null); // Currently selected plan
  const [allocation, setAllocation] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [viewMode, setViewMode] = useState('allocations'); // 'allocations' or 'finalized-plans'

  useEffect(() => {
    loadAllocationData();
  }, [assignedTaxCenter, assignedTaxCenterRegion, selectedPlanId]);

  const loadAllocationData = () => {
    const data = loadData();
    
    if (!data?.plans || data.plans.length === 0) {
      setLoading(false);
      return;
    }

    // Get tax center name and region
    let taxCenterName = assignedTaxCenter;
    let taxCenterRegion = assignedTaxCenterRegion;

    console.log('TaxCenterView loadAllocationData:', {
      assignedTaxCenter,
      assignedTaxCenterRegion,
      taxCenterName,
      taxCenterRegion
    });

    if (!taxCenterName || !taxCenterRegion) {
      console.warn('Missing tax center assignment:', { taxCenterName, taxCenterRegion });
      setLoading(false);
      return;
    }

    // If assignedTaxCenter is in full name format, convert to ID format
    if (taxCenterName.includes('Tax Center')) {
      const parts = taxCenterName.split(' ');
      const tcNum = parts[parts.length - 1];
      taxCenterName = `${taxCenterRegion}-tc${tcNum}`;
    }

    // Find ALL plans with allocations for this tax center
    const plansWithAllocations = data.plans.filter(p =>
      p.taxCenterAllocations &&
      p.taxCenterAllocations[taxCenterRegion] &&
      p.taxCenterAllocations[taxCenterRegion][taxCenterName]
    );

    console.log('Found', plansWithAllocations.length, 'plans with allocations for this tax center');
    setAllPlans(plansWithAllocations);

    // Determine which plan to load
    let planToLoad = null;

    if (selectedPlanId) {
      // User explicitly selected a plan - load that one
      planToLoad = plansWithAllocations.find(p => p.id === selectedPlanId);
      console.log('Loading user-selected plan:', selectedPlanId);
    } else if (plansWithAllocations.length > 0) {
      // No plan selected yet - load first one and auto-select it
      planToLoad = plansWithAllocations[0];
      setSelectedPlanId(planToLoad.id);
      console.log('Auto-selecting first plan:', planToLoad.id);
    }

    if (planToLoad) {
      setPlan(planToLoad);
      
      const regionAllocations = planToLoad.taxCenterAllocations[taxCenterRegion];
      const taxCenterAllocation = regionAllocations[taxCenterName];
      
      if (taxCenterAllocation) {
        setAllocation(taxCenterAllocation);
        
        // Initialize feedback with same structure as allocation
        const initialFeedback = {};
        Object.keys(taxCenterAllocation).forEach(auditType => {
          initialFeedback[auditType] = {
            allocated: taxCenterAllocation[auditType],
            canDeliver: taxCenterAllocation[auditType],
            notes: ''
          };
        });
        setFeedback(initialFeedback);

        // Check if already submitted
        if (planToLoad.taxCenterFeedback && 
            planToLoad.taxCenterFeedback[taxCenterRegion] &&
            planToLoad.taxCenterFeedback[taxCenterRegion][taxCenterName]) {
          setSubmitted(true);
          setFeedback(planToLoad.taxCenterFeedback[taxCenterRegion][taxCenterName]);
        } else {
          setSubmitted(false);
        }
      }
    }

    setLoading(false);
  };

  const handleFeedbackChange = (auditType, field, value) => {
    setFeedback(prev => ({
      ...prev,
      [auditType]: {
        ...prev[auditType],
        [field]: field === 'canDeliver' ? parseInt(value) || 0 : value
      }
    }));
  };

  const handleSubmitFeedback = () => {
    if (!window.confirm('Submit feedback to regional director?\n\nThis action cannot be undone.')) {
      return;
    }

    // Get tax center name - same logic as loading
    let taxCenterName = assignedTaxCenter;  // Use the ID format
    let taxCenterRegion = assignedTaxCenterRegion;

    if (!taxCenterName || !taxCenterRegion) {
      alert('Error: Tax center assignment not set properly.');
      return;
    }

    // If assignedTaxCenter is in full name format, convert to ID format
    if (taxCenterName.includes('Tax Center')) {
      const parts = taxCenterName.split(' ');
      const tcNum = parts[parts.length - 1];
      taxCenterName = `${taxCenterRegion}-tc${tcNum}`;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);

    if (planIndex >= 0) {
      // Initialize feedback structure if needed
      if (!data.plans[planIndex].taxCenterFeedback) {
        data.plans[planIndex].taxCenterFeedback = {};
      }
      if (!data.plans[planIndex].taxCenterFeedback[taxCenterRegion]) {
        data.plans[planIndex].taxCenterFeedback[taxCenterRegion] = {};
      }

      // Save feedback
      data.plans[planIndex].taxCenterFeedback[taxCenterRegion][taxCenterName] = {
        ...feedback,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      saveData(data);
      setSubmitted(true);
      alert('✅ Feedback submitted to ' + taxCenterRegion + ' Regional Director!');
    }
  };

  const handleAcknowledgeFinalized = () => {
    if (!window.confirm('Acknowledge receipt of finalized plan for implementation?\n\nThis confirms that your tax center is ready to execute the plan.')) {
      return;
    }

    let taxCenterName = assignedTaxCenter;
    let taxCenterRegion = assignedTaxCenterRegion;

    if (taxCenterName.includes('Tax Center')) {
      const parts = taxCenterName.split(' ');
      const tcNum = parts[parts.length - 1];
      taxCenterName = `${taxCenterRegion}-tc${tcNum}`;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);

    if (planIndex >= 0) {
      // Initialize tax center acknowledgment if needed
      if (!data.plans[planIndex].taxCenterAcknowledgment) {
        data.plans[planIndex].taxCenterAcknowledgment = {};
      }
      if (!data.plans[planIndex].taxCenterAcknowledgment[taxCenterRegion]) {
        data.plans[planIndex].taxCenterAcknowledgment[taxCenterRegion] = {};
      }

      // Save acknowledgment
      data.plans[planIndex].taxCenterAcknowledgment[taxCenterRegion][taxCenterName] = {
        status: 'ACKNOWLEDGED',
        taxCenter: taxCenterName,
        region: taxCenterRegion,
        acknowledgedDate: new Date().toISOString(),
        acknowledgedBy: 'Tax Center Manager',
        readyForExecution: true
      };

      saveData(data);
      alert(`✅ ${taxCenterName} acknowledged receipt of finalized plan. Ready for implementation!`);
      setSelectedPlanId(null);
      loadAllocationData();
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading allocation data...</div>;
  }

  if (!assignedTaxCenter || !assignedTaxCenterRegion) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2>No Tax Center Assignment</h2>
        </div>
        <p>You have not been assigned to a tax center yet.</p>
        <p style={{ fontSize: '12px', color: '#a0aec0' }}>
          Allocations from regional directors will appear here once you are assigned to a tax center.
        </p>
      </div>
    );
  }

  if (!plan || !allocation) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2>No Allocation Available</h2>
        </div>
        <p>No allocation has been sent to {assignedTaxCenter} yet.</p>
        <p style={{ fontSize: '12px', color: '#a0aec0' }}>
          Waiting for {assignedTaxCenterRegion} regional director to send allocations.
        </p>
      </div>
    );
  }

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  const getTotalAllocated = () => {
    return Object.values(allocation).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const getTotalFeedback = () => {
    return Object.values(feedback).reduce((sum, item) => sum + (parseInt(item.canDeliver) || 0), 0);
  };

  // Check if this plan has been deployed to tax centers
  const isFinalized = plan?.status === 'FINALIZED' && plan?.sentToTaxCenters?.[assignedTaxCenterRegion];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="detail-header">
        <h2><i className="fas fa-building"></i> {assignedTaxCenter}</h2>
        <Badge status={submitted ? 'Feedback Submitted' : 'Awaiting Response'} 
               className={submitted ? 'director-approved' : 'pending'} />
      </div>

      {/* Finalized Plan Notification */}
      {isFinalized && (
        <div style={{ background: '#c8e6c9', color: '#1b5e20', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '2px solid #388e3c' }}>
          <strong><i className="fas fa-flag-checkered"></i> Finalized Plan Received</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
            <i className="fas fa-check" style={{ color: '#388e3c' }}></i> Your {assignedTaxCenterRegion} Regional Director has approved and deployed the finalized {plan.name || 'Annual Audit Plan'} for your tax center to execute.
          </p>
        </div>
      )}

      {/* Plan Selector - Allow switching between multiple allocations */}
      {allPlans && allPlans.length > 1 && (
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
          boxShadow: '0 3px 10px rgba(255, 152, 0, 0.4)'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a8fd9', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt"></i> CHOOSE PLAN:
          </label>
          <select
            value={selectedPlanId || ''}
            onChange={(e) => {
              const newPlanId = e.target.value;
              console.log('Tax center plan selector changed from', selectedPlanId, 'to', newPlanId);
              setSelectedPlanId(newPlanId);
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
            <option value="">-- Select a plan --</option>
            {allPlans.map(planOption => {
              const isSubmitted = planOption.taxCenterFeedback?.[assignedTaxCenterRegion]?.[assignedTaxCenter];
              return (
                <option key={planOption.id} value={planOption.id}>
                  {planOption.id} (FY {planOption.fiscalYear}) {isSubmitted ? '✓ Submitted' : ''}
                </option>
              );
            })}
          </select>
          <div style={{ fontSize: '12px', color: '#d84315', fontWeight: '600' }}>
            {selectedPlanId ? (
              <>
                <div><i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> {selectedPlanId} selected</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Switch to provide feedback on different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {allPlans.length} plan(s) available</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Select to provide feedback</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Allocation Received */}
      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
        <strong><i className="fas fa-inbox"></i> Allocation Received</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          You have received an allocation from {assignedTaxCenterRegion} Regional Director for {plan.name || 'Annual Audit Plan'}.
          Total cases: <strong>{getTotalAllocated()}</strong>
        </p>
      </div>

      {/* Plan & Allocation Info */}
      <div className="cards">
        <Card title="Plan ID" number={plan.id} icon="fas fa-id-badge" />
        <Card title="Plan Version" number={plan.version} icon="fas fa-code-branch" />
        <Card title="Total Allocated" number={getTotalAllocated()} icon="fas fa-tasks" />
        <Card title="Region" number={assignedTaxCenterRegion} icon="fas fa-map-pin" />
      </div>

      {/* Allocation Breakdown */}
      <div className="section-title" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <i className="fas fa-chart-bar"></i> Your Allocation by Audit Type
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ALLOCATED</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const allocated = allocation[auditType] || 0;
              const total = getTotalAllocated();
              const percentage = total > 0 ? ((allocated / total) * 100).toFixed(1) : 0;
              return (
                <tr key={idx}>
                  <td><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td style={{ textAlign: 'center' }}>{allocated}</td>
                  <td style={{ textAlign: 'center' }}>{percentage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{getTotalAllocated()}</td>
              <td style={{ textAlign: 'center' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feedback Section */}
      <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ffb74d' }}>
        <strong><i className="fas fa-comments"></i> Your Response</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Review the allocated cases and let us know if you can deliver them or propose alternatives.
          You can adjust the numbers if your capacity is different.
        </p>
      </div>

      {/* Feedback Table */}
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-edit"></i> Capacity Feedback
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ALLOCATED</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CAN DELIVER</th>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => (
              <tr key={idx}>
                <td><strong>{auditTypeLabels[auditType]}</strong></td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {allocation[auditType] || 0}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <input
                    type="number"
                    value={feedback[auditType]?.canDeliver || 0}
                    onChange={(e) => handleFeedbackChange(auditType, 'canDeliver', e.target.value)}
                    disabled={submitted}
                    style={{
                      width: '70px',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '14px',
                      background: submitted ? '#1a2332' : '#0f1419'
                    }}
                    min="0"
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <input
                    type="text"
                    value={feedback[auditType]?.notes || ''}
                    onChange={(e) => handleFeedbackChange(auditType, 'notes', e.target.value)}
                    disabled={submitted}
                    placeholder="e.g., We can do 10 instead of 15"
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: submitted ? '#1a2332' : '#0f1419'
                    }}
                  />
                </td>
              </tr>
            ))}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{getTotalAllocated()}</td>
              <td style={{ textAlign: 'center' }}>
                {getTotalFeedback()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Variance */}
      <div style={{ background: '#1e2a3a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #2d3d4d' }}>
        <h3><i className="fas fa-balance-scale"></i> Capacity Analysis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Total Allocated</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
              {getTotalAllocated()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>You Can Deliver</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
              {getTotalFeedback()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Variance</p>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: getTotalFeedback() === getTotalAllocated() ? '#4caf50' : '#ff5252',
              margin: '4px 0 0 0'
            }}>
              {getTotalFeedback() - getTotalAllocated()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {submitted ? (
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> ✅ Feedback Submitted
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            Your feedback has been sent to {assignedTaxCenterRegion} Regional Director.
          </p>
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
            <i className="fas fa-exclamation-triangle"></i> Please review your capacity and submit feedback
          </strong>
        </div>
      )}

      {/* Action Bar */}
      <div className="action-bar" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        {isFinalized && (
          <button 
            className="btn btn-success"
            onClick={handleAcknowledgeFinalized}
            style={{ background: '#4caf50' }}
          >
            <i className="fas fa-check-double"></i> Acknowledge Finalized Plan
          </button>
        )}
        {!submitted ? (
          <button 
            className="btn btn-success"
            onClick={handleSubmitFeedback}
          >
            <i className="fas fa-paper-plane"></i> Submit Feedback to Regional Director
          </button>
        ) : (
          <button 
            className="btn btn-success"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <i className="fas fa-check"></i> Feedback Already Submitted
          </button>
        )}
      </div>
    </div>
  );
}

export default TaxCenterView;
