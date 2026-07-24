import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';

function FeedbackReviewView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [amendedAllocations, setAmendedAllocations] = useState({});

  const loadPlans = () => {
    const data = loadData();
    // Get plans that have feedback collected (waiting for amendment)
    const plansWithFeedback = data.plans.filter(p => 
      p.status === 'FEEDBACK_COLLECTED' && 
      p.regionalFeedback && 
      p.regionalFeedback.length > 0
    );
    setPlans(plansWithFeedback);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    // Get all submitted feedback from regions
    const feedback = plan.regionalFeedback.filter(f => f.status === 'SUBMITTED');
    setFeedbackList(feedback);
    
    // Initialize amended allocations with regional capacities from feedback
    const amended = {};
    feedback.forEach(fb => {
      amended[fb.region] = { ...fb.aggregated || {} };
    });
    setAmendedAllocations(amended);
  };

  const handleRegionalCapacityChange = (region, auditType, value) => {
    setAmendedAllocations(prev => ({
      ...prev,
      [region]: {
        ...prev[region],
        [auditType]: {
          ...(prev[region]?.[auditType] || {}),
          canDeliver: parseInt(value) || 0
        }
      }
    }));
  };

  const submitAmendedPlanToDirector = () => {
    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan.id);
    
    if (planIndex >= 0) {
      const plan = data.plans[planIndex];
      
      console.log('===== SUBMIT AMENDED PLAN =====');
      console.log('Amendment data:', amendedAllocations);
      console.log('Feedback list:', feedbackList);
      
      // Update regional feedback with amended regional capacities
      feedbackList.forEach(feedback => {
        const existingIndex = plan.regionalFeedback.findIndex(
          f => f.region === feedback.region && f.status === 'SUBMITTED'
        );
        console.log(`${feedback.region}: existingIndex=${existingIndex}`);
        
        if (existingIndex >= 0) {
          // Update the aggregated values with amended regional capacity
          console.log(`Saving aggregated for ${feedback.region}:`, amendedAllocations[feedback.region]);
          plan.regionalFeedback[existingIndex].aggregated = amendedAllocations[feedback.region];
        }
      });
      
      // Update status
      plan.version = (plan.version || 1) + 1;
      plan.status = 'SUBMITTED_TO_DIRECTOR';
      plan.lastModified = new Date().toISOString();
      
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'RESUBMITTED_TO_DIRECTOR',
        by: 'Audit Team',
        date: new Date().toISOString(),
        notes: 'Plan amended with regional capacity adjustments. Ready for Director review.',
        version: plan.version
      });
      
      saveData(data);
      console.log('Plan saved');
      console.log('Final regional feedback:', plan.regionalFeedback);
      
      alert('✅ Amended plan submitted to Director! They will review and send to Senior Management.');
      setSelectedPlan(null);
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

  if (selectedPlan && feedbackList.length > 0) {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedPlan(null)}>
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>

        <div className="detail-header">
          <h2>Review & Amend Plan - {selectedPlan.id}</h2>
          <Badge status={`v${selectedPlan.version}`} className="pending" />
        </div>

        <div className="cards">
          <Card title="Total Regions" number={feedbackList.length} icon="fas fa-map-marked-alt" />
          <Card title="Plan Version" number={`v${selectedPlan.version}`} icon="fas fa-code-branch" />
          <Card title="Current Status" number={selectedPlan.status.replace(/_/g, ' ')} icon="fas fa-info-circle" />
        </div>

        {feedbackList.map((feedback, idx) => {
          return (
            <div key={idx} style={{ marginBottom: '32px', background: '#f8f9fc', color: '#0c4a6e', padding: '20px', borderRadius: '12px', border: '2px solid #1976d2' }}>
              <div className="section-title">
                <i className="fas fa-map-pin"></i> {feedback.region} - Regional Capacity Adjustment
              </div>

              {/* Regional Feedback Summary */}
              <div style={{ background: '#c8e6c9', color: '#1b5e20', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '2px solid #388e3c' }}>
                <strong style={{ color: '#1b5e20' }}><i className="fas fa-check-circle"></i> Regional Feedback Submitted</strong>
                <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
                  {feedback.taxCenterCount} of {feedback.totalTaxCenters} tax centers provided feedback. Regional director has assessed region capacity.
                </p>
                <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '12px', color: '#555' }}>
                  <i className="fas fa-clock"></i> Submitted: {new Date(feedback.submittedAt).toLocaleString()}
                </p>
              </div>

              {/* Regional Capacity Adjustment Table - EDITABLE */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#a0aec0', marginBottom: '8px' }}>
                  Amend Regional Capacity:
                </div>
                <div className="table-container" style={{ marginBottom: '16px' }}>
                  <table style={{ fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#1976d2' }}>
                        <th style={{ color: '#4a8fd9', textAlign: 'left' }}>AUDIT TYPE</th>
                        <th style={{ color: '#4a8fd9', textAlign: 'center' }}>TOTAL ALLOCATED</th>
                        <th style={{ color: '#4a8fd9', textAlign: 'center' }}>TAX CENTERS CAN DELIVER</th>
                        <th style={{ color: '#4a8fd9', textAlign: 'center' }}>PLANNING TEAM OVERRIDE</th>
                        <th style={{ color: '#4a8fd9', textAlign: 'center' }}>VARIANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditTypes.map(type => {
                        const agg = feedback.aggregated?.[type] || {};
                        const allocated = agg.allocated || 0;
                        const canDeliver = agg.canDeliver || 0;
                        const override = amendedAllocations[feedback.region]?.[type]?.canDeliver || canDeliver;
                        const variance = override - allocated;
                        
                        return (
                          <tr key={type}>
                            <td><strong>{auditTypeLabels[type]}</strong></td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#4a8fd9' }}>{allocated}</td>
                            <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e', fontWeight: 'bold' }}>{canDeliver}</td>
                            <td style={{ textAlign: 'center', padding: '8px' }}>
                              <input
                                type="number"
                                value={override}
                                onChange={(e) => handleRegionalCapacityChange(feedback.region, type, e.target.value)}
                                style={{
                                  width: '80px',
                                  padding: '6px',
                                  border: '2px solid #1976d2',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  background: '#0f1419'
                                }}
                                min="0"
                              />
                            </td>
                            <td style={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              color: variance < 0 ? '#ff5252' : variance > 0 ? '#4caf50' : '#999'
                            }}>
                              {variance > 0 ? '+' : ''}{variance}
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
                        <td>TOTAL</td>
                        <td style={{ textAlign: 'center' }}>
                          {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                        </td>
                        <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e' }}>
                          {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                        </td>
                        <td style={{ textAlign: 'center', color: '#1976d2' }}>
                          {auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                        </td>
                        <td style={{
                          textAlign: 'center',
                          color: (auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) < 0 ? '#ff5252' : '#4caf50'
                        }}>
                          {(auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) > 0 ? '+' : ''}
                          {auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Info */}
              <div style={{
                background: '#1e2a3a',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#a0aec0',
                border: '1px solid #2d3d4d'
              }}>
                <p style={{ color: '#0c4a6e', margin: 0 }}>
                  <strong>Note:</strong> The planning team can adjust the regional capacity based on overall budget constraints or organizational priorities. 
                  These values represent what the region can realistically deliver for each audit type.
                </p>
              </div>
            </div>
          );
        })}

        {/* Action Buttons */}
        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginTop: '24px', marginBottom: '24px', border: '1px solid #1976d2' }}>
          <strong><i className="fas fa-lightbulb"></i> Amendment Options:</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
            You can amend the tax center allocations above based on regional feedback. Once you're satisfied with the changes, submit the amended plan to the Director.
          </p>
        </div>

        <div className="action-bar">
          <div></div>
          <button 
            className="btn btn-success"
            onClick={() => {
              if (window.confirm('Submit AMENDED plan to Director?\n\nDirector will review and send to Senior Management for approval.')) {
                submitAmendedPlanToDirector();
              }
            }}
          >
            <i className="fas fa-check-circle"></i> Submit Amended Plan to Director
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedPlan(null)}>
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <h3>No Feedback Submitted</h3>
          <p>Regions have not yet submitted their feedback for this plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-title"><i className="fas fa-comments"></i> Plans Awaiting Your Review & Amendment</div>
      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fc', color: '#0c4a6e', borderRadius: '8px' }}>
          <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <h3>No Feedback to Review</h3>
          <p style={{ color: '#a0aec0' }}>There are no plans with regional feedback awaiting your review and amendment.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Version</th>
                <th>Fiscal Year</th>
                <th>Regions Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const submitted = plan.regionalFeedback.filter(f => f.status === 'SUBMITTED').length;
                return (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>v{plan.version}</td>
                    <td>{plan.fiscalYear}</td>
                    <td>
                      <Badge 
                        status={`${submitted}/${plan.regionalFeedback.length}`} 
                        className="submitted" 
                      />
                    </td>
                    <td>{plan.status.replace(/_/g, ' ')}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => handleSelectPlan(plan)}
                      >
                        <i className="fas fa-eye"></i> Review & Amend
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FeedbackReviewView;
