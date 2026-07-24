import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { submitRegionalFeedback, getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { useAuth } from '../../context/AuthContext';

function RegionalDirectorView() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's assigned region (no selection dropdown)
  const region = userInfo?.orgContext?.assignedRegion || 'Oromia';

  const loadActivePlan = () => {
    const data = loadData();
    const activePlan = data.plans.find(p => p.status === 'AWAITING_FEEDBACK');
    setPlan(activePlan);
    
    if (activePlan) {
      const alloc = activePlan.allocations.find(a => a.region === region);
      setAllocation(alloc);
      
      if (alloc) {
        setAdjustments({
          total: alloc.total,
          desk: alloc.desk,
          field: alloc.field,
          tp: alloc.tp,
          issue: alloc.issue
        });
      }
    }
  };

  useEffect(() => {
    loadActivePlan();
  }, [region]);

  const handleSubmitFeedback = () => {
    if (!plan) {
      alert('No active plan.');
      return;
    }

    const message = prompt('Enter your feedback message:', 'Current allocation exceeds available staff.');
    if (message === null) return;

    if (submitRegionalFeedback(plan.id, region, message, adjustments, comments)) {
      alert('Feedback submitted to the Audit Director.');
      setComments('');
      loadActivePlan();
    } else {
      alert('Cannot submit feedback. Plan may not be AWAITING_FEEDBACK.');
    }
  };

  const getStatusBadge = () => {
    if (!allocation) return <Badge status="Not Found" className="draft" />;
    
    const statusMap = {
      'PENDING': { text: 'Pending Review', className: 'pending' },
      'FEEDBACK_SUBMITTED': { text: 'Feedback Submitted', className: 'submitted' },
      'ACCEPTED': { text: 'Accepted', className: 'director-approved' },
      'REJECTED': { text: 'Rejected', className: 'rejected' }
    };
    
    const status = statusMap[allocation.status] || { text: 'Unknown', className: 'draft' };
    return <Badge status={status.text} className={status.className} />;
  };

  const canSubmit = allocation && 
    allocation.status !== 'FEEDBACK_SUBMITTED' && 
    allocation.status !== 'ACCEPTED' && 
    allocation.status !== 'REJECTED';

  return (
    <div>
      <div className="action-bar">
        <div className="filters">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontWeight: '500', color: '#8b949e' }}>📍 Region:</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#f0f6fc' }}>{region}</span>
          </div>
        </div>
        <div></div>
      </div>

      <div className="cards">
        <Card title="My Allocation" number={allocation?.total || 0} icon="fas fa-folder" />
        <Card title="Status" number={getStatusBadge()} icon="fas fa-info-circle" />
      </div>

      <div className="section-title">National Summary</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {!plan ? (
              <tr><td colSpan="2">No national plan available for review.</td></tr>
            ) : (
              <>
                <tr><td><strong>Plan ID</strong></td><td>{plan.id}</td></tr>
                <tr><td><strong>Year</strong></td><td>{plan.year}</td></tr>
                <tr><td><strong>National Total</strong></td><td>{plan.nationalTotal}</td></tr>
                <tr><td><strong>Status</strong></td><td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td></tr>
                <tr><td><strong>Regions</strong></td><td>{plan.allocations.length}</td></tr>
                <tr><td><strong>Effort</strong></td><td>{plan.effort || 'N/A'} hours</td></tr>
                <tr><td><strong>Planning Period</strong></td><td>{plan.planningPeriodStart || 'N/A'} to {plan.planningPeriodEnd || 'N/A'}</td></tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="section-title">My Regional Allocation</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Audit Type</th>
              <th>Allocated</th>
              <th>Your Adjustment</th>
            </tr>
          </thead>
          <tbody>
            {!allocation ? (
              <tr><td colSpan="3">No allocation for your region.</td></tr>
            ) : (
              <>
                <tr>
                  <td><strong>Total Cases</strong></td>
                  <td>{allocation.total}</td>
                  <td>
                    <input 
                      type="number" 
                      value={adjustments.total || 0}
                      onChange={(e) => setAdjustments({...adjustments, total: parseInt(e.target.value) || 0})}
                      style={{ width: '100px' }}
                      disabled={!canSubmit}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Desk Audit</td>
                  <td>{allocation.desk}</td>
                  <td>
                    <input 
                      type="number" 
                      value={adjustments.desk || 0}
                      onChange={(e) => setAdjustments({...adjustments, desk: parseInt(e.target.value) || 0})}
                      style={{ width: '100px' }}
                      disabled={!canSubmit}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Field Audit</td>
                  <td>{allocation.field}</td>
                  <td>
                    <input 
                      type="number" 
                      value={adjustments.field || 0}
                      onChange={(e) => setAdjustments({...adjustments, field: parseInt(e.target.value) || 0})}
                      style={{ width: '100px' }}
                      disabled={!canSubmit}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Transfer Pricing</td>
                  <td>{allocation.tp}</td>
                  <td>
                    <input 
                      type="number" 
                      value={adjustments.tp || 0}
                      onChange={(e) => setAdjustments({...adjustments, tp: parseInt(e.target.value) || 0})}
                      style={{ width: '100px' }}
                      disabled={!canSubmit}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Issue Audit</td>
                  <td>{allocation.issue}</td>
                  <td>
                    <input 
                      type="number" 
                      value={adjustments.issue || 0}
                      onChange={(e) => setAdjustments({...adjustments, issue: parseInt(e.target.value) || 0})}
                      style={{ width: '100px' }}
                      disabled={!canSubmit}
                    />
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="form-group">
        <label><i className="fas fa-comment"></i> Additional Comments</label>
        <textarea 
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Provide detailed feedback..."
          disabled={!canSubmit}
        />
      </div>

      <div className="action-bar">
        <div></div>
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitFeedback}
          disabled={!canSubmit}
          title={!canSubmit ? 'Feedback already processed for this region.' : ''}
        >
          <i className="fas fa-paper-plane"></i> Submit Feedback
        </button>
      </div>
    </div>
  );
}

export default RegionalDirectorView;
