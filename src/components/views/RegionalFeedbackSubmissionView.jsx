import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import Card from '../Card';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalFeedbackSubmissionView - Regional Director submits aggregated feedback
 * Allows viewing, editing, and submitting consolidated feedback to Director
 */
function RegionalFeedbackSubmissionView({ currentView }) {
  const { assignedRegion, selectedRegion: contextSelectedRegion } = useRegional();
  
  const selectedRegion = contextSelectedRegion || assignedRegion;
  
  const [plan, setPlan] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [aggregated, setAggregated] = useState({});
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  // Load data on mount
  useEffect(() => {
    loadFeedback();
  }, [selectedRegion]);

  const loadFeedback = () => {
    console.log('Loading feedback for region:', selectedRegion);
    const data = loadData();
    
    if (!data?.plans || data.plans.length === 0) {
      setLoading(false);
      return;
    }

    if (!selectedRegion) {
      setLoading(false);
      return;
    }

    // Find plan with tax center allocations
    const planWithAllocations = data.plans.find(p => 
      p.taxCenterAllocations && 
      p.taxCenterAllocations[selectedRegion]
    );

    if (planWithAllocations) {
      setPlan(planWithAllocations);
      
      // Check if already submitted - use existing aggregated data
      const existingSubmission = planWithAllocations.regionalFeedback?.find(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingSubmission) {
        console.log('Found existing submission, using saved aggregated data');
        setSubmitted(true);
        setOverrides(existingSubmission.aggregated || {});
        setAggregated(existingSubmission.aggregated || {});
        setLoading(false);
        return;
      }

      // If no saved data, load from tax center feedback
      const regionAllocations = planWithAllocations.taxCenterAllocations[selectedRegion];
      const regionFeedback = planWithAllocations.taxCenterFeedback?.[selectedRegion] || {};
      
      // Build feedback list
      const feedbackData = [];
      Object.entries(regionAllocations).forEach(([taxCenterName, allocation]) => {
        const feedback = regionFeedback[taxCenterName];
        feedbackData.push({
          taxCenterName,
          allocation,
          feedback: feedback || null,
          status: feedback ? 'received' : 'pending'
        });
      });
      
      setFeedbackList(feedbackData);

      // Calculate aggregated values from tax center feedback
      calculateAggregated(feedbackData);
    }

    setLoading(false);
  };

  const calculateAggregated = (feedbackData) => {
    const agg = {};

    auditTypes.forEach(auditType => {
      let totalAllocated = 0;
      let totalCanDeliver = 0;

      feedbackData.forEach(item => {
        totalAllocated += parseInt(item.allocation[auditType]) || 0;
        if (item.feedback && item.feedback[auditType]) {
          totalCanDeliver += parseInt(item.feedback[auditType].canDeliver) || 0;
        }
      });

      agg[auditType] = {
        allocated: totalAllocated,
        canDeliver: totalCanDeliver,
        variance: totalCanDeliver - totalAllocated
      };
    });

    console.log('Aggregated data calculated:', agg);
    setAggregated(agg);
    // Initialize overrides with exact aggregated values (not empty)
    setOverrides(agg);
  };

  const handleOverrideChange = (auditType, field, value) => {
    setOverrides(prev => ({
      ...prev,
      [auditType]: {
        ...prev[auditType],
        [field]: parseInt(value) || 0
      }
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(aggregated).reduce((sum, item) => sum + (item.allocated || 0), 0);
  };

  const getTotalCanDeliver = () => {
    return Object.values(overrides).reduce((sum, item) => sum + (item.canDeliver || 0), 0);
  };

  const getTotalVariance = () => {
    return getTotalCanDeliver() - getTotalAllocated();
  };

  const handleSubmit = () => {
    if (!window.confirm(`Submit regional feedback from ${selectedRegion} to Director?`)) {
      return;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);

    if (planIndex >= 0) {
      const currentPlan = data.plans[planIndex];

      // Initialize regional feedback array if needed
      if (!currentPlan.regionalFeedback) {
        currentPlan.regionalFeedback = [];
      }

      // Check if already submitted
      const existingIndex = currentPlan.regionalFeedback.findIndex(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingIndex >= 0) {
        alert('Feedback from ' + selectedRegion + ' has already been submitted!');
        setSubmitted(true);
        return;
      }

      // Create submission
      const submission = {
        region: selectedRegion,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        aggregated: overrides,
        taxCenterCount: feedbackList.filter(f => f.status === 'received').length,
        totalTaxCenters: feedbackList.length,
        submittedBy: 'Regional Director'
      };

      // Add to array
      currentPlan.regionalFeedback.push(submission);

      // Update status
      if (!currentPlan.status || currentPlan.status === 'AWAITING_REGIONAL_FEEDBACK') {
        currentPlan.status = 'FEEDBACK_COLLECTED';
      }

      // Save
      saveData(data);

      setSubmitted(true);
      alert(`✅ Regional feedback from ${selectedRegion} submitted to Director!`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading feedback...</div>;
  }

  if (!plan || feedbackList.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2>No Data Available</h2>
        </div>
        <p>No allocations or feedback found for {selectedRegion}.</p>
      </div>
    );
  }

  const receivedCount = feedbackList.filter(f => f.status === 'received').length;
  const totalCount = feedbackList.length;
  const allReceived = receivedCount === totalCount;

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div className="detail-header">
        <h2><i className="fas fa-paper-plane"></i> Submit Regional Feedback - {selectedRegion}</h2>
        <Badge 
          status={submitted ? 'Submitted' : (allReceived ? 'Ready to Submit' : 'Pending')}
          className={submitted ? 'director-approved' : (allReceived ? 'pending' : 'pending')}
        />
      </div>

      {/* Status */}
      <div style={{
        background: allReceived ? '#1a3a1a' : '#0f14193e0',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: `1px solid ${allReceived ? '#4caf50' : '#ffb74d'}`
      }}>
        <strong style={{ color: allReceived ? '#2e7d32' : '#f57f17' }}>
          <i className={`fas ${allReceived ? 'fa-check-circle' : 'fa-info-circle'}`}></i> 
          {' '}
          {allReceived ? 'Ready to Submit' : 'Waiting for Feedback'}
        </strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
          {receivedCount} of {totalCount} tax centers have provided feedback.
        </p>
      </div>

      {/* Cards */}
      <div className="cards">
        <Card 
          title="Plan ID" 
          number={plan.id} 
          icon="fas fa-id-badge" 
        />
        <Card 
          title="Total Tax Centers" 
          number={totalCount} 
          icon="fas fa-building" 
        />
        <Card 
          title="Feedback Received" 
          number={receivedCount} 
          icon="fas fa-comments" 
        />
        <Card 
          title="Region" 
          number={selectedRegion} 
          icon="fas fa-map-pin" 
        />
      </div>

      {/* Aggregated Feedback Table - EDITABLE */}
      <div className="section-title" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <i className="fas fa-chart-bar"></i> Aggregated Regional Feedback (Editable)
      </div>

      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>TOTAL ALLOCATED</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>TAX CENTERS CAN DELIVER</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>REGIONAL OVERRIDE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>VARIANCE</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const agg = aggregated[auditType] || { allocated: 0, canDeliver: 0, variance: 0 };
              const override = overrides[auditType] || { allocated: 0, canDeliver: 0, variance: 0 };
              const variance = (override.canDeliver || 0) - (agg.allocated || 0);

              console.log(`Row ${auditType}:`, { agg, override, variance });

              return (
                <tr key={idx}>
                  <td><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td style={{ textAlign: 'center' }}>{agg.allocated || 0}</td>
                  <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e' }}>
                    <strong>{agg.canDeliver || 0}</strong>
                  </td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>
                    <input
                      type="number"
                      value={override.canDeliver || 0}
                      onChange={(e) => handleOverrideChange(auditType, 'canDeliver', e.target.value)}
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
                  <td style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: variance < 0 ? '#ff5252' : '#4caf50'
                  }}>
                    {variance > 0 ? '+' : ''}{variance}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{getTotalAllocated()}</td>
              <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e' }}>
                {Object.values(aggregated).reduce((sum, item) => sum + (item.canDeliver || 0), 0)}
              </td>
              <td style={{ textAlign: 'center' }}>
                {getTotalCanDeliver()}
              </td>
              <td style={{
                textAlign: 'center',
                color: getTotalVariance() < 0 ? '#ff5252' : '#4caf50'
              }}>
                {getTotalVariance() > 0 ? '+' : ''}{getTotalVariance()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div style={{
        background: '#1e2a3a',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #2d3d4d',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '16px'
      }}>
        <div>
          <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Total Allocated</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
            {getTotalAllocated()}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Region Can Deliver</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
            {getTotalCanDeliver()}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Total Variance</p>
          <p style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: getTotalVariance() < 0 ? '#ff5252' : '#4caf50',
            margin: '4px 0 0 0'
          }}>
            {getTotalVariance() > 0 ? '+' : ''}{getTotalVariance()}
          </p>
        </div>
      </div>

      {/* Status message */}
      {submitted ? (
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> Feedback Submitted
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            Your regional feedback has been sent to the Director for review.
          </p>
        </div>
      ) : !allReceived ? (
        <div style={{
          background: '#0f14193cd',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '2px solid #ffb74d',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#f57f17' }}>
            <i className="fas fa-exclamation-triangle"></i> Waiting for Feedback
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#f57f17' }}>
            All tax centers must submit feedback before you can submit regional feedback.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#1a3a1a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '2px solid #4caf50',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> Ready to Submit
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            You can now submit the aggregated regional feedback to the Director.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="action-bar">
        <div></div>
        {!submitted && allReceived && (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
          >
            <i className="fas fa-paper-plane"></i> Submit to Director
          </button>
        )}
        {submitted && (
          <button
            className="btn btn-success"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            <i className="fas fa-check"></i> Already Submitted
          </button>
        )}
      </div>
    </div>
  );
}

export default RegionalFeedbackSubmissionView;
