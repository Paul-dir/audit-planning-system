import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * DashboardView - Main dashboard showing overview of audit planning activities
 * Displays KPI cards, recent plans, and activity feed
 */
function DashboardView({ currentRole }) {
  const { assignedRegion, assignedTaxCenter, setSelectedRegion, selectedRegion } = useRegional();
  const [currentRegion, setCurrentRegion] = useState(assignedRegion || selectedRegion || null);
  const [stats, setStats] = useState({
    myOpenTasks: 0,
    pendingReview: 0,
    underReview: 0,
    feedback: 0,
    totalPlans: 0,
    approvedPlans: 0,
    finalizedPlans: 0,
    revisedPlans: 0
  });
  const [recentPlans, setRecentPlans] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [currentRole, assignedRegion, assignedTaxCenter, currentRegion]);

  const handleRegionChange = (region) => {
    setCurrentRegion(region);
    setSelectedRegion(region);
    localStorage.setItem('user_selected_region', region);
  };

  const loadDashboardData = () => {
    const data = loadData();

    // Calculate stats based on role
    let statsData = {
      myOpenTasks: 0,
      pendingReview: 0,
      underReview: 0,
      feedback: 0,
      totalPlans: data.plans?.length || 0,
      approvedPlans: data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0,
      finalizedPlans: data.plans?.filter(p => p.status === 'FINALIZED').length || 0,
      revisedPlans: data.plans?.filter(p => p.status === 'REVISION_REQUESTED').length || 0
    };

    // Role-specific stats
    switch (currentRole) {
      case 'audit_team':
        statsData.myOpenTasks = data.plans?.filter(p => p.status === 'DRAFT' || p.status === 'REVISION_REQUESTED').length || 0;
        statsData.pendingReview = data.plans?.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length || 0;
        statsData.underReview = data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0;
        statsData.feedback = data.plans?.filter(p => p.regionFeedbackStatus && Object.keys(p.regionFeedbackStatus).length > 0).length || 0;
        break;

      case 'director':
        statsData.myOpenTasks = data.plans?.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length || 0;
        statsData.pendingReview = data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0;
        statsData.underReview = data.plans?.filter(p => p.status === 'SENIOR_MANAGEMENT_APPROVED').length || 0;
        statsData.feedback = data.plans?.filter(p => p.directorFeedback && Object.keys(p.directorFeedback).length > 0).length || 0;
        break;

      case 'regional':
        statsData.myOpenTasks = data.plans?.filter(p => p.status === 'FINALIZED' && p.regionalAcknowledgment?.[currentRegion]?.status === 'ACKNOWLEDGED').length || 0;
        statsData.pendingReview = data.plans?.filter(p => p.status === 'FINALIZED').length || 0;
        statsData.underReview = data.plans?.filter(p => p.submittedToTaxCenters?.[currentRegion]?.status === 'SUBMITTED').length || 0;
        statsData.feedback = data.plans?.filter(p => p.taxCenterFeedback?.[currentRegion]).length || 0;
        break;

      case 'tax_center':
        statsData.myOpenTasks = data.plans?.filter(p => p.submittedToTaxCenters && Object.keys(p.submittedToTaxCenters).length > 0).length || 0;
        statsData.pendingReview = data.plans?.filter(p => p.taxCenterAcceptance && Object.keys(p.taxCenterAcceptance).length > 0).length || 0;
        statsData.underReview = data.plans?.filter(p => p.taxCenterAllocations).length || 0;
        statsData.feedback = data.plans?.filter(p => p.taxCenterFeedback).length || 0;
        break;

      case 'senior_management':
        statsData.myOpenTasks = data.plans?.filter(p => p.status === 'DIRECTOR_APPROVED').length || 0;
        statsData.pendingReview = data.plans?.filter(p => p.status === 'SENIOR_MANAGEMENT_APPROVED').length || 0;
        statsData.underReview = data.plans?.filter(p => p.status === 'FINALIZED').length || 0;
        statsData.feedback = 0;
        break;

      default:
        break;
    }

    setStats(statsData);

    // Get recent plans (last 5)
    const recent = (data.plans || []).slice(-5).reverse();
    setRecentPlans(recent);

    // Get recent activities (last 10)
    const recentActivities = (data.activity || []).slice(0, 10);
    setActivities(recentActivities);
  };

  const getRoleLabel = () => {
    const roleLabels = {
      audit_team: 'Audit Planning Team',
      director: 'Audit Director',
      regional: 'Regional Director',
      tax_center: 'Tax Center Manager',
      cascade_audit_team: 'Cascade Audit Team',
      senior_management: 'Senior Management'
    };
    return roleLabels[currentRole] || 'User';
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'DRAFT': 'draft',
      'SUBMITTED_TO_DIRECTOR': 'submitted',
      'DIRECTOR_APPROVED': 'director-approved',
      'SENIOR_MANAGEMENT_APPROVED': 'senior-approved',
      'FINALIZED': 'senior-approved',
      'REVISION_REQUESTED': 'feedback',
      'REJECTED': 'rejected',
      'SUBMITTED_TO_SENIOR_MANAGEMENT': 'submitted',
      'AWAITING_SENIOR_MANAGEMENT_APPROVAL': 'feedback'
    };
    return statusMap[status] || 'pending';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const getActivityIcon = (event) => {
    if (event.includes('Created')) return 'fa-plus-circle';
    if (event.includes('Submitted')) return 'fa-paper-plane';
    if (event.includes('Approved')) return 'fa-check-circle';
    if (event.includes('Rejected')) return 'fa-times-circle';
    if (event.includes('Feedback')) return 'fa-comments';
    return 'fa-info-circle';
  };

  const getActivityColor = (status) => {
    if (status.includes('SUBMITTED')) return '#74b7ff';
    if (status.includes('APPROVED')) return '#5ee89c';
    if (status.includes('REJECTED')) return '#ff7b7b';
    return '#f5c451';
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
            Overview of all planning activities and your workload
          </p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Region Selector for Regional Directors */}
          {currentRole === 'regional' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Region:</label>
              <select
                value={currentRegion || ''}
                onChange={(e) => handleRegionChange(e.target.value)}
                style={{
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: 'var(--card)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '150px'
                }}
              >
                <option value="">-- Select Region --</option>
                {['Oromia', 'SNNPR', 'Addis Ababa', 'Amhara', 'Tigray'].map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
          )}
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="cards" style={{ marginBottom: '32px' }}>
        <Card title="My Open Tasks" number={stats.myOpenTasks} icon="fas fa-tasks" />
        <Card title="Pending Review" number={stats.pendingReview} icon="fas fa-inbox" />
        <Card title="Under Review" number={stats.underReview} icon="fas fa-eye" />
        <Card title="Feedback" number={stats.feedback} icon="fas fa-comments" />
      </div>

      {/* Recent Plans & Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Recent Plans */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              <i className="fas fa-history" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
              Recent Plans
            </h2>
            <a href="#" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              View all →
            </a>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Latest audit plans that have been updated in the system.
          </p>

          {recentPlans.length === 0 ? (
            <div style={{
              background: 'var(--card)',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No plans available</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>PLAN ID</th>
                    <th style={{ textAlign: 'left' }}>PLAN NAME</th>
                    <th style={{ textAlign: 'center' }}>PERIOD</th>
                    <th style={{ textAlign: 'left' }}>STATUS</th>
                    <th style={{ textAlign: 'right' }}>UPDATED</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPlans.map((plan, idx) => (
                    <tr key={idx}>
                      <td><strong>{plan.id}</strong></td>
                      <td style={{ fontSize: '13px' }}>{plan.name || `FY ${plan.fiscalYear} Plan`}</td>
                      <td style={{ textAlign: 'center', fontSize: '12px' }}>{plan.fiscalYear}</td>
                      <td>
                        <Badge 
                          status={plan.status} 
                          className={getStatusBadgeClass(plan.status)} 
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(plan.lastModified || plan.createdDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
              <i className="fas fa-clock" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
              Recent Activity
            </h2>
            <a href="#" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              View all →
            </a>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Latest actions and updates in audit planning.
          </p>

          {activities.length === 0 ? (
            <div style={{
              background: 'var(--card)',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No activities yet</p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {activities.map((activity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--card)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: activity.status.includes('APPROVED') 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'rgba(59, 130, 246, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i 
                      className={`fas ${getActivityIcon(activity.event)}`}
                      style={{ color: getActivityColor(activity.status), fontSize: '14px' }}
                    ></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      margin: '0 0 4px 0',
                      color: 'var(--text-primary)'
                    }}>
                      {activity.event}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      margin: '0 0 4px 0'
                    }}>
                      {activity.ref}
                    </p>
                    <p style={{
                      fontSize: '10px',
                      color: 'var(--text-disabled)',
                      margin: 0
                    }}>
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        background: 'var(--card)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          <i className="fas fa-chart-bar" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
          Summary Statistics
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Total Plans</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              {stats.totalPlans}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Approved</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', margin: 0 }}>
              {stats.approvedPlans}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>Finalized</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#3fb950', margin: 0 }}>
              {stats.finalizedPlans}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>In Revision</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
              {stats.revisedPlans}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
