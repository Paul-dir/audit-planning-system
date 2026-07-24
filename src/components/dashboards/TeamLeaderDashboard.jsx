import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Team Leader Dashboard
 * Shows team case assignments and audit progress
 */
function TeamLeaderDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    teamMembersActive: 0,
    casesAssigned: 0,
    casesInProgress: 0,
    casesClosed: 0,
    teamCapacity: 0
  });

  useEffect(() => {
    const data = loadData();
    const teamId = userInfo?.orgContext?.teamId;

    const teamCases = data.cases?.filter(c => c.teamId === teamId) || [];
    const teamMembers = data.auditors?.filter(a => a.teamId === teamId) || [];

    setStats({
      teamMembersActive: teamMembers.length,
      casesAssigned: teamCases.length,
      casesInProgress: teamCases.filter(c => c.status === 'IN_PROGRESS').length,
      casesClosed: teamCases.filter(c => c.status === 'CLOSED').length,
      teamCapacity: teamMembers.length * 5 // Assume 5 cases per auditor capacity
    });
  }, [userInfo]);

  const teamName = userInfo?.orgContext?.teamName;
  const auditType = userInfo?.orgContext?.auditType;
  const taxCenter = userInfo?.orgContext?.assignedTaxCenter;

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          👥 Team Leader Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          {teamName}
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#9c27b0' }}>{stats.teamMembersActive}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Team Auditors</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>{stats.casesAssigned}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Cases Assigned</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff9800' }}>{stats.casesInProgress}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>In Progress</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.casesClosed}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Closed</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#f44336' }}>
            {Math.round((stats.casesAssigned / stats.teamCapacity) * 100)}%
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Capacity Used</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Team Leader</strong> for {auditType} at {taxCenter} manages case assignments and team progress.
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Manage {stats.teamMembersActive} auditors on your team</li>
          <li>Assign and track {stats.casesAssigned} audit cases</li>
          <li>Monitor team progress and capacity</li>
          <li>Review audit findings and quality</li>
          <li>Report team metrics</li>
        </ul>
      </Card>
    </div>
  );
}

export default TeamLeaderDashboard;
