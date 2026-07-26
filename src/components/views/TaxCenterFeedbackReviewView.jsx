import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * TaxCenterFeedbackReviewView - Regional Director reviews all tax center feedback
 * Displays aggregated feedback from all tax centers in the region with dark mode support.
 * Allows regional directors to adjust capacity overrides and submit to senior management.
 */
function TaxCenterFeedbackReviewView({ currentView, selectedPlan: propSelectedPlan, plans: propPlans, onPlanChange }) {
  const { assignedRegion, selectedRegion: contextSelectedRegion } = useRegional();
  
  // Use selected region if available, otherwise assigned region
  const selectedRegion = contextSelectedRegion || assignedRegion;
  
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(propSelectedPlan || null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [regionalCapacityOverrides, setRegionalCapacityOverrides] = useState({});

  useEffect(() => {
    loadFeedback();
  }, [selectedRegion, selectedPlanId]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = () => {
    console.log('Loading feedback for region:', selectedRegion, 'plan:', selectedPlanId);
    const data = loadData();
    
    if (!data?.plans || data.plans.length === 0) {
      console.log('No plans found');
      setLoading(false);
      return;
    }

    if (!selectedRegion) {
      console.log('No region selected');
      setLoading(false);
      return;
    }

    const plansWithAllocations = data.plans.filter(p => {
      const hasRegionalAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
      const isApproved = p.status === 'APPROVED' || p.status === 'DIRECTOR_APPROVED' || p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
      
      if (!hasRegionalAllocation) {
        console.log(`Plan ${p.id}: ❌ No regional allocation for ${selectedRegion}`);
      } else if (!isApproved) {
        console.log(`Plan ${p.id}: ❌ Status ${p.status} - not approved yet`);
      } else {
        console.log(`Plan ${p.id}: ✅ APPROVED and has regional allocation`);
      }
      
      return hasRegionalAllocation && isApproved;
    });

    console.log('Found', plansWithAllocations.length, 'APPROVED plans with regional allocations for region:', selectedRegion);
    setAllPlans(plansWithAllocations);

    let planToLoad = null;

    if (selectedPlanId) {
      planToLoad = plansWithAllocations.find(p => p.id === selectedPlanId);
      console.log('Loading user-selected plan:', selectedPlanId);
    } else if (plansWithAllocations.length > 0) {
      planToLoad = plansWithAllocations[0];
      setSelectedPlanId(planToLoad.id);
      console.log('Auto-selecting first plan:', planToLoad.id);
    }

    if (planToLoad) {
      setPlan(planToLoad);
      
      const regionalAllocations = planToLoad.regionalAllocation[selectedRegion];
      const regionFeedback = planToLoad.taxCenterFeedback?.[selectedRegion] || {};
      
      console.log('Region feedback keys:', Object.keys(regionFeedback));
      console.log('Regional allocation:', regionalAllocations);
      
      let taxCenterNames = Object.keys(regionFeedback);
      if (taxCenterNames.length === 0) {
        taxCenterNames = [
          `${selectedRegion} TC1`,
          `${selectedRegion} TC2`,
          `${selectedRegion} TC3`
        ];
      }
      
      const feedbackData = [];
      
      taxCenterNames.forEach((taxCenterName) => {
        const feedback = regionFeedback[taxCenterName];
        
        console.log(`${taxCenterName}: feedback=${!!feedback}, status=${feedback ? 'received' : 'pending'}`);
        
        feedbackData.push({
          taxCenterName,
          allocation: regionalAllocations,
          feedback: feedback || null,
          status: feedback ? 'received' : 'pending'
        });
      });
      
      setFeedbackList(feedbackData);
      console.log('Feedback list set with', feedbackData.length, 'items');

      const existingSubmission = planToLoad.regionalFeedback?.find(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingSubmission && existingSubmission.aggregated) {
        console.log('Loading existing regional capacity overrides for plan:', planToLoad.id);
        setRegionalCapacityOverrides(existingSubmission.aggregated);
        setSubmitted(true);
      } else {
        const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
        const initialOverrides = {};

        auditTypes.forEach(auditType => {
          let totalAllocated = 0;
          let totalCanDeliver = 0;
          
          feedbackData.forEach(item => {
            totalAllocated += parseInt(item.allocation[auditType]) || 0;
            if (item.feedback && item.feedback[auditType]) {
              totalCanDeliver += parseInt(item.feedback[auditType].canDeliver) || 0;
            }
          });
          
          initialOverrides[auditType] = { 
            allocated: totalAllocated,
            canDeliver: totalCanDeliver, 
            variance: totalCanDeliver - totalAllocated
          };
        });

        setRegionalCapacityOverrides(initialOverrides);
        setSubmitted(false);
      }
    }

    setLoading(false);
  };

  const aggregateFeedback = () => {
    const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
    const aggregated = {};

    auditTypes.forEach(auditType => {
      let totalAllocated = 0;
      let totalCanDeliver = 0;
      const notes = [];

      feedbackList.forEach(item => {
        totalAllocated += parseInt(item.allocation[auditType]) || 0;
        if (item.feedback && item.feedback[auditType]) {
          totalCanDeliver += parseInt(item.feedback[auditType].canDeliver) || 0;
          if (item.feedback[auditType].notes) {
            notes.push(`${item.taxCenterName}: ${item.feedback[auditType].notes}`);
          }
        }
      });

      aggregated[auditType] = {
        allocated: totalAllocated,
        canDeliver: totalCanDeliver,
        variance: totalCanDeliver - totalAllocated,
        notes: notes.length > 0 ? notes.join('; ') : ''
      };
    });

    return aggregated;
  };

  const handleCapacityOverride = (auditType, value) => {
    setRegionalCapacityOverrides(prev => ({
      ...prev,
      [auditType]: {
        ...(prev[auditType] || {}),
        canDeliver: parseInt(value) || 0
      }
    }));
  };

  const handleSendFeedback = () => {
    if (!window.confirm(`Send aggregated feedback from ${selectedRegion} to Director?`)) {
      return;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);

    if (planIndex >= 0) {
      const currentPlan = data.plans[planIndex];

      if (!currentPlan.regionalFeedback) {
        currentPlan.regionalFeedback = [];
      }

      const existingIndex = currentPlan.regionalFeedback.findIndex(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingIndex >= 0) {
        alert('Feedback from ' + selectedRegion + ' has already been submitted!');
        setSubmitted(true);
        return;
      }

      const regionalFeedback = {
        region: selectedRegion,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        aggregated: regionalCapacityOverrides,
        taxCenterCount: feedbackList.filter(f => f.status === 'received').length,
        totalTaxCenters: feedbackList.length,
        submittedBy: 'Regional Director'
      };

      currentPlan.regionalFeedback.push(regionalFeedback);

      if (!currentPlan.status || currentPlan.status === 'AWAITING_REGIONAL_FEEDBACK') {
        currentPlan.status = 'FEEDBACK_COLLECTED';
      }

      saveData(data);

      setSubmitted(true);
      alert(`✅ Aggregated feedback from ${selectedRegion} sent to Director!`);
    }
  };

  if (loading) {
    return <div className="p-5">Loading feedback...</div>;
  }

  if (!plan || feedbackList.length === 0) {
    return (
      <div className="p-6">
        <div className="detail-header">
          <h2>No Allocations Sent Yet</h2>
        </div>
        <p className="text-text-mid dark:text-text-mid">No allocations have been sent to tax centers in {selectedRegion} yet.</p>
        <p className="text-xs text-text-mid dark:text-text-mid mt-3">
          <strong>Next step</strong>: Regional director must allocate cases to tax centers first.
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

  const receivedCount = feedbackList.filter(f => f.status === 'received').length;
  const totalCount = feedbackList.length;

  return (
    <div className="p-6">
      {/* Refresh Button */}
      <div className="mb-4 flex justify-end">
        <button 
          onClick={() => {
            console.log('Manually refreshing feedback...');
            loadFeedback();
          }}
          className="px-4 py-2 rounded border border-blue bg-blue/10 dark:bg-blue/10 text-blue dark:text-blue hover:bg-blue/20 dark:hover:bg-blue/20 cursor-pointer text-xs font-medium transition-colors"
        >
          <i className="fas fa-redo"></i> Refresh Data
        </button>
      </div>

      {/* Header */}
      <div className="detail-header">
        <h2 className="flex items-center gap-2"><i className="fas fa-comments"></i> Tax Center Feedback Collection - {selectedRegion}</h2>
        <Badge status={`${receivedCount}/${totalCount} responses`} className={receivedCount === totalCount ? 'director-approved' : 'pending'} />
      </div>

      {/* Plan Selector */}
      {allPlans && allPlans.length > 1 && (
        <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-4 rounded mb-6 border-l-4 border-blue dark:border-blue shadow-md flex gap-4 items-center flex-wrap">
          <label className="text-sm font-bold text-blue dark:text-blue whitespace-nowrap">
            <i className="fas fa-file-alt"></i> CHOOSE PLAN:
          </label>
          <select
            value={selectedPlanId || ''}
            onChange={(e) => {
              const newPlanId = e.target.value;
              console.log('Feedback collection plan selector changed to:', newPlanId);
              setSelectedPlanId(newPlanId);
              if (onPlanChange) onPlanChange(newPlanId);
            }}
            className="mt-0 px-4 py-3 rounded border-2 border-blue dark:border-blue font-bold cursor-pointer bg-ink dark:bg-ink w-60 text-text-mid dark:text-text-mid"
          >
            <option value="">-- Select a plan --</option>
            {allPlans.map(planOption => {
              const isFeedbackSubmitted = planOption.regionalFeedback?.find(f => f.region === selectedRegion && f.status === 'SUBMITTED');
              return (
                <option key={planOption.id} value={planOption.id}>
                  {planOption.id} (FY {planOption.fiscalYear}) {isFeedbackSubmitted ? '✓ Submitted' : ''}
                </option>
              );
            })}
          </select>
          <div className="text-xs text-coral dark:text-coral font-semibold">
            {selectedPlanId ? (
              <>
                <div><i className="fas fa-check-circle text-teal dark:text-teal"></i> {selectedPlanId} selected</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-0.5">Switch to collect feedback for different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {allPlans.length} plan(s) available</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-0.5">Select to begin collecting feedback</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div className="bg-blue/10 dark:bg-blue/10 text-text-primary dark:text-text-primary p-4 rounded mb-6 border border-blue dark:border-blue">
        <strong className="flex items-center gap-2"><i className="fas fa-inbox"></i> Feedback Status</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 text-xs">
          Collected feedback from {receivedCount} of {totalCount} tax centers for {plan.name || 'Annual Audit Plan'}.
        </p>
      </div>

      {/* Feedback Summary */}
      <div className="section-title mb-3">
        <i className="fas fa-list"></i> Tax Center Responses
      </div>

      {feedbackList.map((item, idx) => (
        <div key={idx} className={`bg-panel dark:bg-panel p-4 rounded mb-4 border-2 ${
          item.status === 'received' ? 'border-teal dark:border-teal' : 'border-gold dark:border-gold'
        }`}>
          {/* Tax Center Header */}
          <div className="flex justify-between items-center mb-3">
            <h3 className="m-0 text-base flex items-center gap-2">
              <i className="fas fa-building"></i> {item.taxCenterName}
            </h3>
            <Badge 
              status={item.status === 'received' ? 'Feedback Received' : 'Awaiting'} 
              className={item.status === 'received' ? 'director-approved' : 'pending'}
            />
          </div>

          {item.feedback ? (
            <>
              {/* Feedback Table */}
              <div className="table-container mb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-ink dark:bg-ink">
                      <th className="text-left text-blue dark:text-blue p-2">AUDIT TYPE</th>
                      <th className="text-center text-blue dark:text-blue p-2">ALLOCATED</th>
                      <th className="text-center text-blue dark:text-blue p-2">CAN DELIVER</th>
                      <th className="text-center text-blue dark:text-blue p-2">VARIANCE</th>
                      <th className="text-left text-blue dark:text-blue p-2">NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, typeIdx) => {
                      const allocated = item.allocation[auditType] || 0;
                      const fbItem = item.feedback[auditType];
                      const canDeliver = fbItem?.canDeliver || 0;
                      const variance = canDeliver - allocated;
                      
                      return (
                        <tr key={typeIdx} className={variance < 0 ? 'bg-danger/10 dark:bg-danger/10' : 'bg-teal/10 dark:bg-teal/10'}>
                          <td className="p-2"><strong>{auditTypeLabels[auditType]}</strong></td>
                          <td className="text-center p-2">{allocated}</td>
                          <td className="text-center font-bold p-2">{canDeliver}</td>
                          <td className={`text-center font-bold p-2 ${variance < 0 ? 'text-danger dark:text-danger' : 'text-teal dark:text-teal'}`}>
                            {variance > 0 ? '+' : ''}{variance}
                          </td>
                          <td className="text-xs text-text-mid dark:text-text-mid p-2">
                            {fbItem?.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Variance Summary */}
              <div className="bg-ink dark:bg-ink p-3 rounded grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-text-mid dark:text-text-mid m-0">Total Allocated</p>
                  <p className="font-bold text-sm m-0 mt-1 text-text-hi dark:text-text-hi">
                    {Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-text-mid dark:text-text-mid m-0">Can Deliver</p>
                  <p className="font-bold text-sm m-0 mt-1 text-text-hi dark:text-text-hi">
                    {Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-text-mid dark:text-text-mid m-0">Total Variance</p>
                  <p className={`font-bold text-sm m-0 mt-1 ${
                    Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0) <
                      Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)
                      ? 'text-danger dark:text-danger' : 'text-teal dark:text-teal'
                  }`}>
                    {Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0) -
                      Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)}
                  </p>
                </div>
              </div>

              {/* Submission Time */}
              <div className="mt-2 text-xs text-text-mid dark:text-text-mid">
                Submitted: {new Date(item.feedback.submittedAt).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="p-3 bg-gold/10 dark:bg-gold/10 rounded text-gold dark:text-gold">
              <i className="fas fa-clock"></i> Awaiting feedback from this tax center...
            </div>
          )}
        </div>
      ))}

      {/* Aggregated Summary */}
      {receivedCount === totalCount && (
        <>
        <div className="bg-teal/10 dark:bg-teal/10 text-teal dark:text-teal p-4 rounded mt-6 border-2 border-teal dark:border-teal text-center">
          <strong className="flex items-center justify-center gap-2">
            <i className="fas fa-check-circle"></i> All Tax Centers Have Responded
          </strong>
          <p className="text-teal dark:text-teal mt-2 text-xs">
            You can now review the feedback and send aggregated response to Director.
          </p>
        </div>

        {/* Aggregated Feedback Table */}
        <div className="mt-6">
          <div className="section-title mb-3">
            <i className="fas fa-chart-bar"></i> Aggregated Regional Feedback
          </div>
          <div className="table-container">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-ink dark:bg-ink">
                  <th className="text-left text-blue dark:text-blue p-2">AUDIT TYPE</th>
                  <th className="text-center text-blue dark:text-blue p-2">TOTAL ALLOCATED</th>
                  <th className="text-center text-blue dark:text-blue p-2">CAN DELIVER</th>
                  <th className="text-center text-blue dark:text-blue p-2">VARIANCE</th>
                  <th className="text-left text-blue dark:text-blue p-2">TAX CENTER NOTES</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(aggregateFeedback()).map(([auditType, data], idx) => {
                  const auditTypeLabels = {
                    desk_audit: 'Desk Audit',
                    field_audit: 'Field Audit',
                    joint_audit: 'Joint Audit',
                    transfer_pricing: 'Transfer Pricing',
                    comprehensive: 'Comprehensive',
                    issue_audit: 'Issue Audit'
                  };
                  
                  return (
                    <tr key={idx} className={data.variance < 0 ? 'bg-danger/10 dark:bg-danger/10' : 'bg-teal/10 dark:bg-teal/10'}>
                      <td className="p-2"><strong>{auditTypeLabels[auditType]}</strong></td>
                      <td className="text-center p-2">{data.allocated}</td>
                      <td className="text-center font-bold p-2">{data.canDeliver}</td>
                      <td className={`text-center font-bold p-2 ${data.variance < 0 ? 'text-danger dark:text-danger' : 'text-teal dark:text-teal'}`}>
                        {data.variance > 0 ? '+' : ''}{data.variance}
                      </td>
                      <td className="text-xs text-text-mid dark:text-text-mid p-2">
                        {data.notes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Regional Capacity Adjustment Section */}
          {!submitted && (
            <div className="mt-6">
              <div className="section-title mb-3">
                <i className="fas fa-sliders-h"></i> Regional Capacity Adjustment
              </div>
              <div className="bg-blue/10 dark:bg-blue/10 text-text-primary dark:text-text-primary p-4 rounded border-2 border-blue dark:border-blue mb-4">
                <p className="text-text-primary dark:text-text-primary m-0 mb-3 text-xs">
                  <strong>Adjust Regional Capacity:</strong> The system has summed feedback from all tax centers. 
                  You can override these values if needed based on regional constraints.
                </p>
              </div>

              <div className="table-container mb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-blue dark:bg-blue">
                      <th className="text-left text-text-hi dark:text-text-hi p-2">AUDIT TYPE</th>
                      <th className="text-center text-text-hi dark:text-text-hi p-2">TOTAL FROM TAX CENTERS</th>
                      <th className="text-center text-text-hi dark:text-text-hi p-2">REGIONAL OVERRIDE</th>
                      <th className="text-center text-text-hi dark:text-text-hi p-2">ADJUSTMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, idx) => {
                      const agg = aggregateFeedback()[auditType] || {};
                      const currentOverride = regionalCapacityOverrides[auditType]?.canDeliver || 0;
                      const adjustment = currentOverride - (agg.canDeliver || 0);

                      return (
                        <tr key={idx}>
                          <td className="p-2"><strong>{auditTypeLabels[auditType]}</strong></td>
                          <td className="text-center font-bold text-blue dark:text-blue p-2">
                            {agg.canDeliver || 0}
                          </td>
                          <td className="text-center p-2">
                            <input
                              type="number"
                              value={currentOverride}
                              onChange={(e) => handleCapacityOverride(auditType, e.target.value)}
                              className="w-16 px-2 py-1 border-2 border-blue dark:border-blue rounded text-center text-sm font-bold bg-ink dark:bg-ink text-text-hi dark:text-text-hi"
                              min="0"
                            />
                          </td>
                          <td className={`text-center font-bold p-2 ${
                            adjustment > 0 ? 'text-teal dark:text-teal' : adjustment < 0 ? 'text-danger dark:text-danger' : 'text-text-mid dark:text-text-mid'
                          }`}>
                            {adjustment > 0 ? '+' : ''}{adjustment}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-4 flex gap-3">
            {!submitted ? (
              <button
                className="btn btn-success ml-auto"
                onClick={handleSendFeedback}
              >
                <i className="fas fa-paper-plane"></i> Send Aggregated Feedback to Director
              </button>
            ) : (
              <div className="ml-auto px-5 py-3 bg-teal/10 dark:bg-teal/10 text-teal dark:text-teal rounded text-xs font-medium flex items-center gap-2">
                <i className="fas fa-check-circle"></i> Feedback sent to Director
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}

export default TaxCenterFeedbackReviewView;
