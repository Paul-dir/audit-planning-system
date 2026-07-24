import React, { useState, useEffect } from 'react';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * TaxCenterFeedbackReviewView - Regional Director reviews all tax center feedback
 * Aggregates feedback from all tax centers in the region
 */
function TaxCenterFeedbackReviewView({ currentView, selectedPlan: propSelectedPlan, plans: propPlans, onPlanChange }) {
  const { assignedRegion, selectedRegion: contextSelectedRegion } = useRegional();
  
  // Use selected region if available, otherwise assigned region
  const selectedRegion = contextSelectedRegion || assignedRegion;
  
  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]); // All plans with allocations
  const [selectedPlanId, setSelectedPlanId] = useState(propSelectedPlan || null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [regionalCapacityOverrides, setRegionalCapacityOverrides] = useState({});

  // Reload feedback when region or plan changes
  useEffect(() => {
    loadFeedback();
  }, [selectedRegion, selectedPlanId]);

  // Also reload when component mounts (fresh view)
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

    // Find ALL APPROVED plans with regional allocations for this region
    // Regional directors can only see plans that have been approved by Director
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

    // Determine which plan to load
    let planToLoad = null;

    if (selectedPlanId) {
      // User selected a specific plan
      planToLoad = plansWithAllocations.find(p => p.id === selectedPlanId);
      console.log('Loading user-selected plan:', selectedPlanId);
    } else if (plansWithAllocations.length > 0) {
      // Auto-select first plan
      planToLoad = plansWithAllocations[0];
      setSelectedPlanId(planToLoad.id);
      console.log('Auto-selecting first plan:', planToLoad.id);
    }

    if (planToLoad) {
      setPlan(planToLoad);
      
      // Use regional allocations (all tax centers report on this regional total)
      const regionalAllocations = planToLoad.regionalAllocation[selectedRegion];
      const regionFeedback = planToLoad.taxCenterFeedback?.[selectedRegion] || {};
      
      console.log('Region feedback keys:', Object.keys(regionFeedback));
      console.log('Regional allocation:', regionalAllocations);
      
      // Get tax center names from feedback (all tax centers that might submit)
      // Fallback to generating standard names if needed
      let taxCenterNames = Object.keys(regionFeedback);
      if (taxCenterNames.length === 0) {
        // Generate standard tax center names for this region
        taxCenterNames = [
          `${selectedRegion} TC1`,
          `${selectedRegion} TC2`,
          `${selectedRegion} TC3`
        ];
      }
      
      // Build feedback list with regional allocation + feedback (if available)
      const feedbackData = [];
      
      taxCenterNames.forEach((taxCenterName) => {
        const feedback = regionFeedback[taxCenterName];
        
        console.log(`${taxCenterName}: feedback=${!!feedback}, status=${feedback ? 'received' : 'pending'}`);
        
        feedbackData.push({
          taxCenterName,
          allocation: regionalAllocations,  // All tax centers see same regional allocation
          feedback: feedback || null,
          status: feedback ? 'received' : 'pending'
        });
      });
      
      setFeedbackList(feedbackData);
      console.log('Feedback list set with', feedbackData.length, 'items');

      // Check if regional capacity overrides exist for THIS plan
      const existingSubmission = planToLoad.regionalFeedback?.find(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingSubmission && existingSubmission.aggregated) {
        console.log('Loading existing regional capacity overrides for plan:', planToLoad.id);
        setRegionalCapacityOverrides(existingSubmission.aggregated);
        setSubmitted(true);
      } else {
        // Initialize overrides with aggregated sums
        const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
        const initialOverrides = {};

        auditTypes.forEach(auditType => {
          let totalAllocated = 0;
          let totalCanDeliver = 0;
          
          feedbackData.forEach(item => {
            // Add allocated from the allocation
            totalAllocated += parseInt(item.allocation[auditType]) || 0;
            // Add can deliver from feedback
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

  // Aggregate feedback from all tax centers
  const aggregateFeedback = () => {
    const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
    const aggregated = {};

    // For each audit type, sum up the allocated and can deliver
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

  // Handle regional capacity override
  const handleCapacityOverride = (auditType, value) => {
    setRegionalCapacityOverrides(prev => ({
      ...prev,
      [auditType]: {
        ...(prev[auditType] || {}),
        canDeliver: parseInt(value) || 0
      }
    }));
  };

  // Send aggregated feedback to Director
  const handleSendFeedback = () => {
    if (!window.confirm(`Send aggregated feedback from ${selectedRegion} to Director?`)) {
      return;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === plan.id);

    if (planIndex >= 0) {
      const currentPlan = data.plans[planIndex];

      // Initialize regional feedback if needed
      if (!currentPlan.regionalFeedback) {
        currentPlan.regionalFeedback = [];
      }

      // Check if this region already submitted
      const existingIndex = currentPlan.regionalFeedback.findIndex(
        f => f.region === selectedRegion && f.status === 'SUBMITTED'
      );

      if (existingIndex >= 0) {
        alert('Feedback from ' + selectedRegion + ' has already been submitted!');
        setSubmitted(true);
        return;
      }

      // Create regional feedback object with regional capacity overrides
      const regionalFeedback = {
        region: selectedRegion,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        aggregated: regionalCapacityOverrides,
        taxCenterCount: feedbackList.filter(f => f.status === 'received').length,
        totalTaxCenters: feedbackList.length,
        submittedBy: 'Regional Director'
      };

      // Add to array
      currentPlan.regionalFeedback.push(regionalFeedback);

      // Update plan status if all regions submitted
      if (!currentPlan.status || currentPlan.status === 'AWAITING_REGIONAL_FEEDBACK') {
        currentPlan.status = 'FEEDBACK_COLLECTED';
      }

      // Save
      saveData(data);

      setSubmitted(true);
      alert(`✅ Aggregated feedback from ${selectedRegion} sent to Director!`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading feedback...</div>;
  }

  if (!plan || feedbackList.length === 0) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2>No Allocations Sent Yet</h2>
        </div>
        <p>No allocations have been sent to tax centers in {selectedRegion} yet.</p>
        <p style={{ fontSize: '12px', color: '#a0aec0', marginTop: '12px' }}>
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
    <div style={{ padding: '24px' }}>
      {/* Refresh Button */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => {
            console.log('Manually refreshing feedback...');
            loadFeedback();
          }}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #1976d2',
            background: '#e3f2fd', color: '#0c4a6e',
            color: '#1976d2',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          <i className="fas fa-redo"></i> Refresh Data
        </button>
      </div>

      {/* Header */}
      <div className="detail-header">
        <h2><i className="fas fa-comments"></i> Tax Center Feedback Collection - {selectedRegion}</h2>
        <Badge status={`${receivedCount}/${totalCount} responses`} className={receivedCount === totalCount ? 'director-approved' : 'pending'} />
      </div>

      {/* Plan Selector */}
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
              console.log('Feedback collection plan selector changed to:', newPlanId);
              setSelectedPlanId(newPlanId);
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
          <div style={{ fontSize: '12px', color: '#d84315', fontWeight: '600' }}>
            {selectedPlanId ? (
              <>
                <div><i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> {selectedPlanId} selected</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Switch to collect feedback for different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {allPlans.length} plan(s) available</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Select to begin collecting feedback</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Plan Info */}
      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
        <strong><i className="fas fa-inbox"></i> Feedback Status</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
          Collected feedback from {receivedCount} of {totalCount} tax centers for {plan.name || 'Annual Audit Plan'}.
        </p>
      </div>

      {/* Feedback Summary */}
      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-list"></i> Tax Center Responses
      </div>

      {feedbackList.map((item, idx) => (
        <div key={idx} style={{
          background: '#f8f9fc', color: '#0c4a6e',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: item.status === 'received' ? '2px solid #4caf50' : '2px solid #ffb74d'
        }}>
          {/* Tax Center Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>
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
              <div className="table-container" style={{ marginBottom: '12px' }}>
                <table style={{ fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#1e2a3a' }}>
                      <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ALLOCATED</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CAN DELIVER</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>VARIANCE</th>
                      <th style={{ textAlign: 'left', color: '#4a8fd9' }}>NOTES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, typeIdx) => {
                      const allocated = item.allocation[auditType] || 0;
                      const fbItem = item.feedback[auditType];
                      const canDeliver = fbItem?.canDeliver || 0;
                      const variance = canDeliver - allocated;
                      
                      return (
                        <tr key={typeIdx} style={{
                          background: variance < 0 ? '#3a1a1a' : '#1a3a1a'
                        }}>
                          <td><strong>{auditTypeLabels[auditType]}</strong></td>
                          <td style={{ textAlign: 'center' }}>{allocated}</td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{canDeliver}</td>
                          <td style={{ 
                            textAlign: 'center', 
                            fontWeight: 'bold',
                            color: variance < 0 ? '#ff5252' : '#4caf50'
                          }}>
                            {variance > 0 ? '+' : ''}{variance}
                          </td>
                          <td style={{ fontSize: '12px', color: '#a0aec0' }}>
                            {fbItem?.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Variance Summary */}
              <div style={{
                background: '#1e2a3a',
                padding: '12px',
                borderRadius: '6px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                fontSize: '12px'
              }}>
                <div>
                  <p style={{ color: '#a0aec0', margin: 0 }}>Total Allocated</p>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '4px 0 0 0' }}>
                    {Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#a0aec0', margin: 0 }}>Can Deliver</p>
                  <p style={{ fontWeight: 'bold', fontSize: '14px', margin: '4px 0 0 0' }}>
                    {Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0)}
                  </p>
                </div>
                <div>
                  <p style={{ color: '#a0aec0', margin: 0 }}>Total Variance</p>
                  <p style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    margin: '4px 0 0 0',
                    color: Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0) <
                      Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)
                      ? '#ff5252' : '#4caf50'
                  }}>
                    {Object.values(item.feedback)
                      .reduce((sum, fb) => sum + (parseInt(fb?.canDeliver) || 0), 0) -
                      Object.values(item.allocation).reduce((sum, v) => sum + (parseInt(v) || 0), 0)}
                  </p>
                </div>
              </div>

              {/* Submission Time */}
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                Submitted: {new Date(item.feedback.submittedAt).toLocaleString()}
              </div>
            </>
          ) : (
            <div style={{ padding: '12px', background: '#0f14193cd', borderRadius: '4px', color: '#856404' }}>
              <i className="fas fa-clock"></i> Awaiting feedback from this tax center...
            </div>
          )}
        </div>
      ))}

      {/* Aggregated Summary */}
      {receivedCount === totalCount && (
        <>
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> All Tax Centers Have Responded
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            You can now review the feedback and send aggregated response to Director.
          </p>
        </div>

        {/* Aggregated Feedback Table */}
        <div style={{ marginTop: '24px' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>
            <i className="fas fa-chart-bar"></i> Aggregated Regional Feedback
          </div>
          <div className="table-container">
            <table style={{ fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1e2a3a' }}>
                  <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
                  <th style={{ textAlign: 'center', color: '#4a8fd9' }}>TOTAL ALLOCATED</th>
                  <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CAN DELIVER</th>
                  <th style={{ textAlign: 'center', color: '#4a8fd9' }}>VARIANCE</th>
                  <th style={{ textAlign: 'left', color: '#4a8fd9' }}>TAX CENTER NOTES</th>
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
                    <tr key={idx} style={{
                      background: data.variance < 0 ? '#3a1a1a' : '#1a3a1a'
                    }}>
                      <td><strong>{auditTypeLabels[auditType]}</strong></td>
                      <td style={{ textAlign: 'center' }}>{data.allocated}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{data.canDeliver}</td>
                      <td style={{ 
                        textAlign: 'center', 
                        fontWeight: 'bold',
                        color: data.variance < 0 ? '#ff5252' : '#4caf50'
                      }}>
                        {data.variance > 0 ? '+' : ''}{data.variance}
                      </td>
                      <td style={{ fontSize: '12px', color: '#a0aec0' }}>
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
            <div style={{ marginTop: '24px' }}>
              <div className="section-title" style={{ marginBottom: '12px' }}>
                <i className="fas fa-sliders-h"></i> Regional Capacity Adjustment
              </div>
              <div style={{
                background: '#f0f7ff', color: '#0c4a6e',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #1976d2',
                marginBottom: '16px'
              }}>
                <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '13px', color: '#0d47a1' }}>
                  <strong>Adjust Regional Capacity:</strong> The system has summed feedback from all tax centers. 
                  You can override these values if needed based on regional constraints.
                </p>
              </div>

              <div className="table-container" style={{ marginBottom: '16px' }}>
                <table style={{ fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#1976d2' }}>
                      <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>TOTAL FROM TAX CENTERS</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>REGIONAL OVERRIDE</th>
                      <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ADJUSTMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, idx) => {
                      const agg = aggregateFeedback()[auditType] || {};
                      const currentOverride = regionalCapacityOverrides[auditType]?.canDeliver || 0;
                      const adjustment = currentOverride - (agg.canDeliver || 0);

                      return (
                        <tr key={idx}>
                          <td><strong>{auditTypeLabels[auditType]}</strong></td>
                          <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>
                            {agg.canDeliver || 0}
                          </td>
                          <td style={{ textAlign: 'center', padding: '8px' }}>
                            <input
                              type="number"
                              value={currentOverride}
                              onChange={(e) => handleCapacityOverride(auditType, e.target.value)}
                              style={{
                                width: '70px',
                                padding: '6px',
                                border: '2px solid #1976d2',
                                borderRadius: '4px',
                                textAlign: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                background: '#0f1419'
                              }}
                              min="0"
                            />
                          </td>
                          <td style={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: adjustment > 0 ? '#4caf50' : adjustment < 0 ? '#ff5252' : '#999'
                          }}>
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
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            {!submitted ? (
              <button
                className="btn btn-success"
                onClick={handleSendFeedback}
                style={{ marginLeft: 'auto' }}
              >
                <i className="fas fa-paper-plane"></i> Send Aggregated Feedback to Director
              </button>
            ) : (
              <div style={{
                marginLeft: 'auto',
                padding: '12px 20px',
                background: '#c8e6c9', color: '#1b5e20',
                borderRadius: '6px',
                color: '#2e7d32',
                fontSize: '13px',
                fontWeight: '500'
              }}>
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
