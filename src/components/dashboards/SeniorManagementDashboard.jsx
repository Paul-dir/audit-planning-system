import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Senior Management Dashboard
 * Shows executive summary and approval metrics
 */
function SeniorManagementDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    plansToApprove: 0,
    approvedPlans: 0,
    rejectedPlans: 0,
    finalizedPlans: 0,
    executionProgress: 0
  });

  useEffect(() => {
    const data = loadData();
    
    const totalPlans = data.plans?.length || 0;
    
    setStats({
      plansToApprove: data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0,
      approvedPlans: data.plans?.filter(p => p.status === 'APPROVED_SM').length || 0,
      rejectedPlans: data.plans?.filter(p => p.status === 'REJECTED_SM').length || 0,
      finalizedPlans: data.plans?.filter(p => p.status === 'FINALIZED').length || 0,
      executionProgress: totalPlans > 0 ? Math.round((data.cases?.length / (totalPlans * 10)) * 100) : 0
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          🎖️ Senior Management Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          Executive oversight and audit approval authority
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: stats.plansToApprove > 0 ? '#ff9800' : '#4caf50' }}>
            {stats.plansToApprove}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Plans for Approval</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.approvedPlans}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Approved</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: stats.rejectedPlans > 0 ? '#ff7b7b' : '#4caf50' }}>
            {stats.rejectedPlans}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Rejected</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.finalizedPlans}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Finalized Plans</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>{stats.executionProgress}%</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Execution Progress</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Senior Management</strong> provides executive approval and strategic oversight of audit planning and execution.
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Review plans from audit director</li>
          <li>Approve or reject national audit plans</li>
          <li>Monitor execution progress</li>
          <li>View audit metrics and findings</li>
          <li>Strategic planning decisions</li>
        </ul>
      </Card>
    </div>
  );
}

export default SeniorManagementDashboard;
