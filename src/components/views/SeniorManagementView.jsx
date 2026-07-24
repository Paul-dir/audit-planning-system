import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import PlanDetailsView from './PlanDetailsView';
import RiskEngineView from './RiskEngineView';
import { loadData } from '../../utils/data';
import { seniorManagementApprove, seniorManagementReject, getStatusDisplay, getBadgeClass, directorResubmitRejectedPlan } from '../../utils/businessLogic';

function SeniorManagementView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('plans'); // 'plans' or 'risk-engine'

  useEffect(() => {
    if (currentView === 'risk-engine') {
      setViewMode('risk-engine');
    } else {
      setViewMode('plans');
    }
  }, [currentView]);

  const loadPlans = () => {
    const data = loadData();
    // Show plans submitted to senior management or already approved/rejected
    const seniorPlans = data.plans.filter(p => 
      p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT' || 
      p.status === 'SENIOR_MANAGEMENT_APPROVED' ||
      p.status === 'SENIOR_MANAGEMENT_REJECTED'
    );
    setPlans(seniorPlans);
    console.log('Senior Management plans loaded:', seniorPlans.length, 'plans');
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleApprove = (planId) => {
    const notes = prompt('Enter approval notes (optional):');
    console.log('Senior Management approving plan:', planId, 'with notes:', notes);
    if (seniorManagementApprove(planId, notes || '')) {
      alert('✅ Plan approved by Senior Management!\n\nThe finalized plan is now ready for deployment to audit teams.');
      loadPlans();
      setSelectedPlan(null);
    } else {
      alert('❌ Cannot approve. Plan must be submitted to Senior Management.');
    }
  };

  const handleReject = (planId) => {
    const feedback = prompt('Enter feedback for rejection (required):\n\nBe specific about what needs to be revised:');
    if (feedback && seniorManagementReject(planId, feedback)) {
      alert('⚠️ Plan rejected. The Director will be notified and can revise and resubmit.');
      loadPlans();
      setSelectedPlan(null);
    } else if (!feedback) {
      alert('Feedback is required for rejection.');
    }
  };

  if (viewMode === 'risk-engine') {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('plans')}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>
        <RiskEngineView userRole="senior_management" />
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <>
        <PlanDetailsView 
          plan={selectedPlan}
          onBack={() => setSelectedPlan(null)}
        />
        <div className="action-bar" style={{ marginTop: '20px' }}>
          <div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedPlan.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT' && (
              <>
                <button className="btn btn-success" onClick={() => { handleApprove(selectedPlan.id); }}>
                  <i className="fas fa-check"></i> Approve Plan
                </button>
                <button className="btn btn-danger" onClick={() => { handleReject(selectedPlan.id); }}>
                  <i className="fas fa-times"></i> Reject & Request Revision
                </button>
              </>
            )}
            {selectedPlan.status === 'SENIOR_MANAGEMENT_APPROVED' && (
              <Badge status="Approved" className="senior-approved" />
            )}
            {selectedPlan.status === 'SENIOR_MANAGEMENT_REJECTED' && (
              <Badge status="Rejected" className="rejected" />
            )}
          </div>
        </div>
      </>
    );
  }

  const stats = {
    pending: plans.filter(p => p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT').length,
    approved: plans.filter(p => p.status === 'SENIOR_MANAGEMENT_APPROVED').length,
    rejected: plans.filter(p => p.status === 'SENIOR_MANAGEMENT_REJECTED').length,
  };

  return (
    <div>
      {/* Plan Selector */}
      {plans && plans.length > 1 && (
        <div style={{
          background: '#1a2332',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '3px solid #4a8fd9',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 3px 10px rgba(0, 212, 255, 0.2)'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a8fd9', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt"></i> QUICK SELECT:
          </label>
          <select
            value={selectedPlan ? selectedPlan.id : ''}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              if (plan) setSelectedPlan(plan);
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
            <option value="">-- Select a plan to review --</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.id} (v{plan.version}) - {plan.status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '12px', color: '#4a8fd9', fontWeight: '600' }}>
            {plans.length} plan(s) in review
          </span>
        </div>
      )}

      <div className="cards">
        <Card title="Pending Approval" number={stats.pending} icon="fas fa-hourglass-half" />
        <Card title="Approved" number={stats.approved} icon="fas fa-check-circle" />
        <Card title="Rejected" number={stats.rejected} icon="fas fa-times-circle" />
      </div>

      <div className="section-title"><i className="fas fa-clipboard-check"></i> Audit Plans for Senior Management Review</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>Fiscal Year</th>
              <th>Total Cases</th>
              <th>Submitted Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <br />No audit plans for Senior Management review
              </td></tr>
            ) : (
              plans.map(plan => {
                const submissionDate = plan.approvalHistory?.find(h => h.action === 'SUBMITTED_TO_SENIOR_MANAGEMENT')?.date;
                return (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.totalVolume}</td>
                    <td>{submissionDate ? new Date(submissionDate).toLocaleDateString() : '-'}</td>
                    <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                    <td>
                      <button className="btn btn-sm btn-info" onClick={() => setSelectedPlan(plan)}>
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginTop: '20px', border: '1px solid #1976d2' }}>
        <strong><i className="fas fa-info-circle"></i> Senior Management Review</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          As the Risk Management Committee, your approval is required for all amended audit plans before they can be finalized 
          and sent to auditors at tax centers for cascading to audit cases. Review each plan carefully, check alignment with 
          strategic priorities, and ensure adequate resource allocation before approving.
        </p>
      </div>
    </div>
  );
}

export default SeniorManagementView;
