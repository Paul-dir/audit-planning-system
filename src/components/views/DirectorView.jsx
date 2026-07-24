import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import PlanDetailsView from './PlanDetailsView';
import DirectorFeedbackReviewView from './DirectorFeedbackReviewView';
import DirectorAmendedPlansView from './DirectorAmendedPlansView';
import RiskEngineView from './RiskEngineView';
import SelectRegionsModal from '../modals/SelectRegionsModal';
import { loadData, saveData } from '../../utils/data';
import { directorApprove, directorRequestRevision, getStatusDisplay, getBadgeClass, directorSendToRegions, submitToSeniorManagement, directorResubmitRejectedPlan } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';

function DirectorView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSelectRegionsModal, setShowSelectRegionsModal] = useState(false);
  const [viewMode, setViewMode] = useState('plans'); // 'plans', 'feedback', 'risk-engine', 'send-feedback', 'approved-plans', 'finalized', 'amended-plans'

  useEffect(() => {
    if (currentView === 'risk-engine') {
      setViewMode('risk-engine');
    } else if (currentView === 'feedback-review') {
      setViewMode('feedback');
    } else if (currentView === 'send-feedback') {
      setViewMode('send-feedback');
    } else if (currentView === 'approved-plans') {
      setViewMode('approved-plans');
    } else if (currentView === 'finalized') {
      setViewMode('finalized');
    } else if (currentView === 'amended-plans') {
      setViewMode('amended-plans');
    } else if (currentView === 'review-queue') {
      setViewMode('plans');
    } else {
      setViewMode('plans');
    }
  }, [currentView]);

  const loadPlans = () => {
    const data = loadData();
    setPlans(data.plans || []);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleApprove = (planId) => {
    const notes = prompt('Enter approval notes (optional):');
    if (directorApprove(planId, notes || '')) {
      alert('Plan approved! Status: DIRECTOR_APPROVED. Ready to send to regions.');
      loadPlans();
    } else {
      alert('Cannot approve. Plan must be SUBMITTED_TO_DIRECTOR.');
    }
  };

  const handleRequestRevision = (planId) => {
    const feedback = prompt('Enter feedback for revision (required):');
    if (feedback && directorRequestRevision(planId, feedback)) {
      alert('Revision requested. Plan returned to Audit Planning Team.');
      loadPlans();
    } else if (!feedback) {
      alert('Feedback is required.');
    }
  };

  const handleSendToRegions = (planId, selectedRegions) => {
    if (directorSendToRegions(planId, selectedRegions)) {
      alert(`Plan sent to ${(selectedRegions || auditConfig.regions.map(r => r.name)).length} regions for feedback. Status: AWAITING_REGIONAL_FEEDBACK`);
      loadPlans();
    } else {
      alert('Cannot send to regions. Plan must be DIRECTOR_APPROVED.');
    }
  };

  const handleSendToSeniorManagement = (planId) => {
    if (submitToSeniorManagement(planId)) {
      alert('✅ Plan sent to Senior Management for final approval. Status: SUBMITTED_TO_SENIOR_MANAGEMENT');
      loadPlans();
    } else {
      alert('❌ Cannot send to Senior Management. Plan must have FEEDBACK_COLLECTED status.');
    }
  };

  const handleResubmitRejectedPlan = (planId) => {
    const notes = prompt('Enter notes for resubmission (what was revised):');
    if (notes && directorResubmitRejectedPlan(planId, notes)) {
      alert('✅ Plan revised and resubmitted to Senior Management for reconsideration.');
      loadPlans();
      setSelectedPlan(null);
    } else if (!notes) {
      alert('Please enter what was revised in the plan.');
    } else {
      alert('Cannot resubmit. Plan must be SENIOR_MANAGEMENT_REJECTED.');
    }
  };

  if (selectedPlan) {
    const isEditableByDirector = false; // Director can ONLY view and comment, NOT edit
    
    // Determine what actions are available based on plan status
    const canApprove = selectedPlan.status === 'SUBMITTED_TO_DIRECTOR';
    const canRequestRevision = selectedPlan.status === 'SUBMITTED_TO_DIRECTOR';
    const canSendToRegions = selectedPlan.status === 'DIRECTOR_APPROVED';
    const canSendToSeniorManagement = selectedPlan.status === 'FEEDBACK_COLLECTED';
    const hasRegionalFeedback = selectedPlan.regionalFeedback && selectedPlan.regionalFeedback.length > 0;
    const isAwaitingRegionalFeedback = selectedPlan.status === 'AWAITING_REGIONAL_FEEDBACK';

    return (
      <>
        <PlanDetailsView 
          plan={selectedPlan}
          onBack={() => setSelectedPlan(null)}
          readOnly={true}
        />
        
        {/* DIRECTOR DECISION PANEL */}
        <div style={{ 
          background: '#0f1419', color: '#f0f6fc', 
          padding: '20px', 
          borderRadius: '8px', 
          marginTop: '24px', 
          border: '2px solid #4a8fd9'
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>
            <i className="fas fa-gavel"></i> Director Actions & Decisions
          </h3>
          
          {canApprove && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', border: '1px solid #4a8fd9' }}>
              <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '13px', color: '#555' }}>
                <strong>Step 1: Plan Review</strong><br/>
                Review the plan details above. Do you approve this allocation plan, or should the Audit Team revise it?
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-success" 
                  onClick={() => { handleApprove(selectedPlan.id); setSelectedPlan(null); }}
                >
                  <i className="fas fa-check-circle"></i> Approve Plan
                </button>
                <button 
                  className="btn btn-warning" 
                  onClick={() => { handleRequestRevision(selectedPlan.id); setSelectedPlan(null); }}
                >
                  <i className="fas fa-redo"></i> Request Revision
                </button>
              </div>
            </div>
          )}

          {canSendToRegions && !isAwaitingRegionalFeedback && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#0f1419', borderRadius: '6px', border: '1px solid #4a8fd9' }}>
              <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '13px', color: '#555' }}>
                <strong>Step 2: Send to Regions for Feedback</strong><br/>
                Plan is approved. Now send it to each region for their feedback before proceeding to Senior Management.
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => { setShowSelectRegionsModal(true); }}
              >
                <i className="fas fa-paper-plane"></i> Send to Regions for Feedback
              </button>
            </div>
          )}

          {isAwaitingRegionalFeedback && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#e3f2fd', color: '#0c4a6e', borderRadius: '6px', border: '1px solid #4a8fd9' }}>
              <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#1565c0' }}>
                <i className="fas fa-clock"></i> <strong>Waiting for Regional Feedback</strong><br/>
                This plan has been sent to regions. Waiting for all regional feedback to be submitted.
              </p>
            </div>
          )}

          {canSendToSeniorManagement && hasRegionalFeedback && (
            <div style={{ marginBottom: '16px', padding: '12px', background: '#c8e6c9', color: '#1b5e20', borderRadius: '6px', border: '1px solid #388e3c' }}>
              <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '13px', color: '#1b5e20' }}>
                <strong>Step 3: Send to Senior Management</strong><br/>
                All regional feedback has been collected. Plan is ready for Senior Management final approval.
              </p>
              <button 
                className="btn btn-success" 
                onClick={() => { 
                  const notes = prompt('Enter notes for Senior Management (optional):');
                  if (notes !== null) {
                    handleSendToSeniorManagement(selectedPlan.id);
                  }
                }}
              >
                <i className="fas fa-arrow-up"></i> Send to Senior Management
              </button>
            </div>
          )}

          {selectedPlan.status === 'SENIOR_MANAGEMENT_REJECTED' && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#3a1a1a', borderRadius: '6px', border: '3px solid #ff5252' }}>
              <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#c62828' }}>
                <i className="fas fa-exclamation-circle"></i> Plan Rejected by Senior Management
              </p>
              <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#555' }}>
                This plan was rejected and needs revision before resubmission. Review the rejection feedback and make necessary changes.
              </p>
              {selectedPlan.approvalHistory && selectedPlan.approvalHistory.length > 0 && (
                <div style={{ background: '#0f1419', padding: '12px', borderRadius: '4px', margin: '12px 0', fontSize: '12px', color: '#a0aec0', maxHeight: '120px', overflow: 'auto' }}>
                  <strong>Rejection Feedback:</strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0' }}>
                    {selectedPlan.approvalHistory[selectedPlan.approvalHistory.length - 1]?.notes || 'No specific feedback provided'}
                  </p>
                </div>
              )}
              <button 
                className="btn btn-warning" 
                onClick={() => { handleResubmitRejectedPlan(selectedPlan.id); }}
              >
                <i className="fas fa-redo"></i> Revise & Resubmit to Senior Management
              </button>
            </div>
          )}

          {selectedPlan.status === 'SENIOR_MANAGEMENT_APPROVED' && (
            <div style={{ marginBottom: '16px', padding: '16px', background: '#c8e6c9', color: '#1b5e20', borderRadius: '6px', border: '2px solid #388e3c' }}>
              <p style={{ color: '#0c4a6e', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#1b5e20' }}>
                <i className="fas fa-check"></i> Plan Approved by Senior Management
              </p>
              <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#555' }}>
                The plan has been approved by Senior Management. Send it to each region for final distribution to tax centers.
              </p>
              <button 
                className="btn btn-success" 
                onClick={() => { 
                  // Finalize and send to all regions
                  const data = loadData();
                  const plan = data.plans.find(p => p.id === selectedPlan.id);
                  if (plan) {
                    const allRegions = auditConfig.regions.map(r => r.name);
                    
                    plan.status = 'FINALIZED';
                    plan.sentToRegions = allRegions;
                    plan.sentToRegionsDate = new Date().toISOString();
                    plan.lastModified = new Date().toISOString();
                    
                    if (!plan.approvalHistory) plan.approvalHistory = [];
                    plan.approvalHistory.push({
                      action: 'FINALIZED_AND_SENT_TO_REGIONS',
                      by: 'Director',
                      date: new Date().toISOString(),
                      notes: `Plan finalized and sent to ${allRegions.length} regions for deployment`,
                      version: plan.version
                    });
                    
                    saveData(data);
                    alert(`✅ Plan finalized and sent to ${allRegions.length} regions!\n\nRegions: ${allRegions.join(', ')}`);
                    setSelectedPlan(null);
                    loadPlans();
                  }
                }}
              >
                <i className="fas fa-paper-plane"></i> Finalize & Send to All Regions
              </button>
            </div>
          )}

          {!canApprove && !canSendToRegions && !canSendToSeniorManagement && selectedPlan.status !== 'SENIOR_MANAGEMENT_REJECTED' && selectedPlan.status !== 'SENIOR_MANAGEMENT_APPROVED' && (
            <div style={{ padding: '12px', background: '#1a2332', borderRadius: '6px', border: '1px solid #999' }}>
              <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#a0aec0' }}>
                <i className="fas fa-info-circle"></i> No actions available for this plan status.
              </p>
            </div>
          )}
        </div>

        {showSelectRegionsModal && (
          <SelectRegionsModal 
            plan={selectedPlan}
            onClose={() => {
              setShowSelectRegionsModal(false);
              loadPlans();
              setSelectedPlan(null);
            }}
            onSend={(selectedRegions) => {
              handleSendToRegions(selectedPlan.id, selectedRegions);
              setShowSelectRegionsModal(false);
              loadPlans();
              setSelectedPlan(null);
            }}
          />
        )}
      </>
    );
  }

  // If viewing risk engine mode
  if (viewMode === 'risk-engine') {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>
        <RiskEngineView userRole="director" />
      </div>
    );
  }

  // If viewing feedback mode, show the feedback review view
  if (viewMode === 'feedback') {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>
        <DirectorFeedbackReviewView />
      </div>
    );
  }

  // If viewing amended plans mode, show the amended plans review view
  if (viewMode === 'amended-plans') {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>
        <DirectorAmendedPlansView currentView={currentView} />
      </div>
    );
  }

  // Send Feedback to Regions view
  if (viewMode === 'send-feedback') {
    const approvedPlans = plans.filter(p => p.status === 'DIRECTOR_APPROVED');
    const sendingPlans = plans.filter(p => p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED');

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-envelope"></i> Send Plans to Regions for Feedback</h2>
          <Badge status="Director Level" className="director-approved" />
        </div>

        <div className="section-title"><i className="fas fa-check-circle"></i> Approved Plans Ready to Send</div>
        <div className="table-container" style={{ marginBottom: '24px' }}>
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Total Cases</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedPlans.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />No approved plans ready to send
                </td></tr>
              ) : (
                approvedPlans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.totalVolume}</td>
                    <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary" 
                        onClick={() => { setSelectedPlan(plan); setShowSelectRegionsModal(true); }}
                      >
                        <i className="fas fa-paper-plane"></i> Send to Regions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-clock"></i> Plans with Regional Feedback</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Status</th>
                <th>Regions Sent To</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sendingPlans.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />No plans waiting for feedback
                </td></tr>
              ) : (
                sendingPlans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                    <td>{plan.regionsSentTo?.join(', ') || 'All Regions'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showSelectRegionsModal && selectedPlan && (
          <SelectRegionsModal 
            plan={selectedPlan}
            onClose={() => {
              setShowSelectRegionsModal(false);
              loadPlans();
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    );
  }

  // Approved Plans view
  if (viewMode === 'approved-plans') {
    const approvedPlans = plans.filter(p => p.status === 'DIRECTOR_APPROVED');

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-check-circle"></i> Approved Plans</h2>
          <Badge status={`${approvedPlans.length} plans`} className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Total Cases</th>
                <th>Approval Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedPlans.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />No approved plans yet
                </td></tr>
              ) : (
                approvedPlans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.totalVolume}</td>
                    <td>{plan.approvalHistory?.find(a => a.action === 'DIRECTOR_APPROVED')?.date?.split('T')[0] || '-'}</td>
                    <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                    <td>
                      <button className="btn btn-sm btn-info" onClick={() => setSelectedPlan(plan)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Finalized Plans view
  if (viewMode === 'finalized') {
    const finalizedPlans = plans.filter(p => p.status === 'FINALIZED');

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-flag-checkered"></i> Finalized Plans</h2>
          <Badge status={`${finalizedPlans.length} plans`} className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Total Cases</th>
                <th>Finalized Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {finalizedPlans.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />No finalized plans yet
                </td></tr>
              ) : (
                finalizedPlans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.totalVolume}</td>
                    <td>{plan.approvalHistory?.find(a => a.action === 'FINALIZED')?.date?.split('T')[0] || '-'}</td>
                    <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                    <td>
                      <button className="btn btn-sm btn-info" onClick={() => setSelectedPlan(plan)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Main plans view (Dashboard)
  const stats = {
    underReview: plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length,
    approved: plans.filter(p => p.status === 'DIRECTOR_APPROVED').length,
    awaitingFeedback: plans.filter(p => p.status === 'AWAITING_REGIONAL_FEEDBACK').length,
    feedbackCollected: plans.filter(p => p.status === 'FEEDBACK_COLLECTED').length,
    seniorApproved: plans.filter(p => p.status === 'SENIOR_MANAGEMENT_APPROVED').length,
    finalized: plans.filter(p => p.status === 'FINALIZED').length,
  };

  return (
    <div>
      <div className="detail-header">
        <h2><i className="fas fa-building"></i> Director Dashboard - Plan Management</h2>
      </div>

      <div className="cards">
        <Card title="Under Review" number={stats.underReview} icon="fas fa-hourglass-half" />
        <Card title="Approved by Me" number={stats.approved} icon="fas fa-check-circle" />
        <Card title="Awaiting Feedback" number={stats.awaitingFeedback} icon="fas fa-clock" />
        <Card title="Feedback Collected" number={stats.feedbackCollected} icon="fas fa-inbox" />
        <Card title="Senior Mgmt Approved" number={stats.seniorApproved} icon="fas fa-thumbs-up" />
        <Card title="Finalized" number={stats.finalized} icon="fas fa-flag-checkered" />
      </div>

      <div className="action-bar" style={{ marginBottom: '24px', gap: '12px' }}>
        <div></div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setViewMode('send-feedback')}
            title="Send approved plans to regions for feedback"
          >
            <i className="fas fa-paper-plane"></i> Send to Regions ({stats.approved})
          </button>
          <button 
            className="btn btn-info"
            onClick={() => setViewMode('feedback')}
            title="Review feedback from regional directors"
          >
            <i className="fas fa-comments"></i> Review Feedback ({stats.feedbackCollected})
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setViewMode('approved-plans')}
            title="View all approved plans"
          >
            <i className="fas fa-check-circle"></i> Approved Plans
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setViewMode('finalized')}
            title="View finalized plans"
          >
            <i className="fas fa-flag-checkered"></i> Finalized Plans
          </button>
        </div>
      </div>

      <div className="section-title"><i className="fas fa-clipboard-check"></i> Plans for Review</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>Fiscal Year</th>
              <th>Total Cases</th>
              <th>Created Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <br />No plans submitted for review
              </td></tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.id}</strong></td>
                  <td>{plan.fiscalYear}</td>
                  <td>{plan.totalVolume}</td>
                  <td>{plan.createdDate?.split('T')[0] || '-'}</td>
                  <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                  <td>
                    <button className="btn btn-sm btn-info" onClick={() => setSelectedPlan(plan)}>
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSelectRegionsModal && selectedPlan && (
        <SelectRegionsModal 
          plan={selectedPlan}
          onClose={() => {
            setShowSelectRegionsModal(false);
            loadPlans();
          }}
        />
      )}
    </div>
  );
}

export default DirectorView;
