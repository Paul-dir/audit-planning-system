import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import Card from '../Card';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalFeedbackSubmissionView - Feedback Submission Form
 * Regional Director submits aggregated feedback from tax centers.
 * Allows viewing, editing, and submitting consolidated feedback to Director.
 * 
 * @component
 * @returns {React.ReactElement} Feedback submission interface
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
    return <div className="min-h-screen bg-ink dark:bg-ink p-8">Loading feedback...</div>;
  }

  if (!plan || feedbackList.length === 0) {
    return (
      <div className="min-h-screen bg-ink dark:bg-ink p-8">
        <div className="flex items-center gap-3 pl-4 border-l-4 border-gold dark:border-gold mb-6">
          <h2 className="text-2xl font-bold">No Data Available</h2>
        </div>
        <p className="text-text-mid dark:text-text-mid">No allocations or feedback found for {selectedRegion}.</p>
      </div>
    );
  }

  const receivedCount = feedbackList.filter(f => f.status === 'received').length;
  const totalCount = feedbackList.length;
  const allReceived = receivedCount === totalCount;

  return (
    <div className="min-h-screen bg-ink dark:bg-ink p-8">
      {/* Header */}
      <div className="flex items-center gap-3 pl-4 border-l-4 border-gold dark:border-gold mb-6">
        <h2 className="text-2xl font-bold"><i className="fas fa-paper-plane"></i> Submit Regional Feedback - {selectedRegion}</h2>
        <Badge 
          status={submitted ? 'Submitted' : (allReceived ? 'Ready to Submit' : 'Pending')}
          className={submitted ? 'director-approved' : (allReceived ? 'pending' : 'pending')}
        />
      </div>

      {/* Status */}
      <div className={`p-4 rounded-lg mb-6 border ${allReceived ? 'bg-green-900 dark:bg-green-900 border-teal dark:border-teal' : 'bg-ink dark:bg-ink border-gold dark:border-gold'}`}>
        <strong className={allReceived ? 'text-teal dark:text-teal' : 'text-gold dark:text-gold'}>
          <i className={`fas ${allReceived ? 'fa-check-circle' : 'fa-info-circle'}`}></i> 
          {' '}
          {allReceived ? 'Ready to Submit' : 'Waiting for Feedback'}
        </strong>
        <p className={`mt-2 mb-0 text-xs ${allReceived ? 'text-teal dark:text-teal' : 'text-gold dark:text-gold'}`}>
          {receivedCount} of {totalCount} tax centers have provided feedback.
        </p>
      </div>

      {/* Cards */}
      <div className="cards mb-6">
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
      <div className="section-title mt-6 mb-3">
        <i className="fas fa-chart-bar"></i> Aggregated Regional Feedback (Editable)
      </div>

      <div className="table-container mb-6 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-panel dark:bg-panel">
              <th className="text-left p-3 text-text-mid dark:text-text-mid">AUDIT TYPE</th>
              <th className="text-center p-3 text-text-mid dark:text-text-mid">TOTAL ALLOCATED</th>
              <th className="text-center p-3 text-text-mid dark:text-text-mid">TAX CENTERS CAN DELIVER</th>
              <th className="text-center p-3 text-text-mid dark:text-text-mid">REGIONAL OVERRIDE</th>
              <th className="text-center p-3 text-text-mid dark:text-text-mid">VARIANCE</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const agg = aggregated[auditType] || { allocated: 0, canDeliver: 0, variance: 0 };
              const override = overrides[auditType] || { allocated: 0, canDeliver: 0, variance: 0 };
              const variance = (override.canDeliver || 0) - (agg.allocated || 0);

              return (
                <tr key={idx} className="border-b border-border dark:border-border hover:bg-panel dark:hover:bg-panel">
                  <td className="p-3"><strong className="text-text-hi dark:text-text-hi">{auditTypeLabels[auditType]}</strong></td>
                  <td className="text-center p-3 text-text-mid dark:text-text-mid">{agg.allocated || 0}</td>
                  <td className="text-center p-3 bg-blue-50 dark:bg-blue-900">
                    <strong className="text-text-hi dark:text-text-hi">{agg.canDeliver || 0}</strong>
                  </td>
                  <td className="text-center p-2">
                    <input
                      type="number"
                      value={override.canDeliver || 0}
                      onChange={(e) => handleOverrideChange(auditType, 'canDeliver', e.target.value)}
                      disabled={submitted}
                      className="w-16 px-2 py-1 border border-border dark:border-border rounded text-center text-sm bg-ink dark:bg-panel text-text-hi dark:text-text-hi disabled:opacity-50"
                      min="0"
                    />
                  </td>
                  <td className="text-center p-3 font-bold" style={{ color: variance < 0 ? '#ff5252' : '#4caf50' }}>
                    {variance > 0 ? '+' : ''}{variance}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-ink dark:bg-ink font-bold border-t-2 border-border dark:border-border">
              <td className="p-3 text-text-hi dark:text-text-hi">TOTAL</td>
              <td className="text-center p-3 text-text-hi dark:text-text-hi">{getTotalAllocated()}</td>
              <td className="text-center p-3 bg-blue-50 dark:bg-blue-900 text-text-hi dark:text-text-hi">
                {Object.values(aggregated).reduce((sum, item) => sum + (item.canDeliver || 0), 0)}
              </td>
              <td className="text-center p-3 text-text-hi dark:text-text-hi">
                {getTotalCanDeliver()}
              </td>
              <td className="text-center p-3 text-text-hi dark:text-text-hi" style={{ color: getTotalVariance() < 0 ? '#ff5252' : '#4caf50' }}>
                {getTotalVariance() > 0 ? '+' : ''}{getTotalVariance()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-panel dark:bg-panel p-4 rounded-lg mb-6 border border-border dark:border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-mid dark:text-text-mid m-0">Total Allocated</p>
          <p className="text-lg font-bold text-blue dark:text-blue mt-1">
            {getTotalAllocated()}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-mid dark:text-text-mid m-0">Region Can Deliver</p>
          <p className="text-lg font-bold text-blue dark:text-blue mt-1">
            {getTotalCanDeliver()}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-mid dark:text-text-mid m-0">Total Variance</p>
          <p className="text-lg font-bold mt-1" style={{ color: getTotalVariance() < 0 ? '#ff5252' : '#4caf50' }}>
            {getTotalVariance() > 0 ? '+' : ''}{getTotalVariance()}
          </p>
        </div>
      </div>

      {/* Status message */}
      {submitted ? (
        <div className="bg-green-50 dark:bg-green-900 border-2 border-teal dark:border-teal rounded-lg p-4 mb-6 text-center">
          <strong className="text-teal dark:text-teal">
            <i className="fas fa-check-circle"></i> Feedback Submitted
          </strong>
          <p className="text-teal dark:text-teal mt-2 mb-0 text-xs">
            Your regional feedback has been sent to the Director for review.
          </p>
        </div>
      ) : !allReceived ? (
        <div className="bg-ink dark:bg-ink border-2 border-gold dark:border-gold rounded-lg p-4 mb-6 text-center">
          <strong className="text-gold dark:text-gold">
            <i className="fas fa-exclamation-triangle"></i> Waiting for Feedback
          </strong>
          <p className="text-gold dark:text-gold mt-2 mb-0 text-xs">
            All tax centers must submit feedback before you can submit regional feedback.
          </p>
        </div>
      ) : (
        <div className="bg-green-900 dark:bg-green-900 border-2 border-teal dark:border-teal rounded-lg p-4 mb-6 text-center">
          <strong className="text-teal dark:text-teal">
            <i className="fas fa-check-circle"></i> Ready to Submit
          </strong>
          <p className="text-teal dark:text-teal mt-2 mb-0 text-xs">
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
