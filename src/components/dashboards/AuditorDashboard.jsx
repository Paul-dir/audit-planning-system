import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Auditor Dashboard
 * Shows assigned cases and execution status
 */
function AuditorDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    casesAssigned: 0,
    casesInProgress: 0,
    casesClosed: 0,
    casesOverdue: 0,
    completionRate: 0
  });

  useEffect(() => {
    const data = loadData();
    const userId = userInfo?.userId;

    const auditorCases = data.cases?.filter(c => c.assignedTo === userId) || [];

    const closed = auditorCases.filter(c => c.status === 'CLOSED').length;
    const inProgress = auditorCases.filter(c => c.status === 'IN_PROGRESS').length;
    const overdue = auditorCases.filter(c => c.status === 'OVERDUE').length;

    setStats({
      casesAssigned: auditorCases.length,
      casesInProgress: inProgress,
      casesClosed: closed,
      casesOverdue: overdue,
      completionRate: auditorCases.length > 0 ? Math.round((closed / auditorCases.length) * 100) : 0
    });
  }, [userInfo]);

  const teamName = userInfo?.orgContext?.teamName;
  const auditType = userInfo?.orgContext?.auditType;
  const taxCenter = userInfo?.orgContext?.assignedTaxCenter;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          🔍 Auditor Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          {userInfo?.fullName} | {teamName}
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>{stats.casesAssigned}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Assigned Cases</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff9800' }}>{stats.casesInProgress}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>In Progress</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.casesClosed}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Completed</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: stats.casesOverdue > 0 ? '#ff7b7b' : '#4caf50' }}>
            {stats.casesOverdue}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Overdue</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.completionRate}%</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Complete Rate</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Auditor</strong> on {teamName} - {auditType} at {taxCenter}
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Execute {stats.casesAssigned} assigned audit cases</li>
          <li>Complete audit procedures and documentation</li>
          <li>Report findings and observations</li>
          <li>Track time and resource allocation</li>
          <li>Close cases when complete</li>
        </ul>
      </Card>
    </div>
  );
}

export default AuditorDashboard;
