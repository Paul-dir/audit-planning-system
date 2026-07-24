import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Audit Director Dashboard
 * Shows national plan review and approval status
 */
function AuditDirectorDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    plansToReview: 0,
    feedbackSent: 0,
    plansUnderRevision: 0,
    approvedPlans: 0,
    finalizedPlans: 0
  });

  useEffect(() => {
    const data = loadData();
    
    setStats({
      plansToReview: data.plans?.filter(p => p.status === 'SUBMITTED').length || 0,
      feedbackSent: data.feedback?.length || 0,
      plansUnderRevision: data.plans?.filter(p => p.status === 'REVISION_REQUESTED').length || 0,
      approvedPlans: data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0,
      finalizedPlans: data.plans?.filter(p => p.status === 'FINALIZED').length || 0
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          👔 Audit Director Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          National audit plan review and approval
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: stats.plansToReview > 0 ? '#ff9800' : '#4caf50' }}>
            {stats.plansToReview}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Plans to Review</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>{stats.feedbackSent}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Feedback Sent</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff9800' }}>{stats.plansUnderRevision}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Under Revision</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.approvedPlans}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Approved Plans</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.finalizedPlans}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Finalized Plans</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Audit Director</strong> manages national audit planning review, approval, and deployment.
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Review plans from audit planning team</li>
          <li>Provide feedback and send to regions</li>
          <li>Review revised/amended plans</li>
          <li>Approve finalized plans</li>
          <li>Deploy approved plans to execution</li>
        </ul>
      </Card>
    </div>
  );
}

export default AuditDirectorDashboard;
