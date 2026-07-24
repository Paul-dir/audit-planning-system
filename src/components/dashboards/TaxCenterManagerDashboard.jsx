import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Tax Center Manager Dashboard - Professional Enterprise Design
 * Shows plan acceptance and case execution status
 */
function TaxCenterManagerDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    allocatedPlans: 0,
    feedbackSubmitted: 0,
    totalCases: 0,
    casesInProgress: 0,
    casesClosed: 0,
    pendingFeedback: 0
  });

  useEffect(() => {
    const data = loadData();
    const taxCenter = userInfo?.orgContext?.assignedTaxCenter;
    const region = userInfo?.orgContext?.assignedRegion;

    if (!taxCenter || !region) return;

    // Calculate dynamic stats from actual data
    const plans = data.plans || [];
    
    // Plans with allocations for this tax center
    const planCount = plans.filter(p => {
      return p.taxCenterAllocations && 
             p.taxCenterAllocations[region] && 
             p.taxCenterAllocations[region][taxCenter];
    }).length;
    
    // Feedback submitted by this tax center
    const feedbackCount = plans.filter(p => {
      return p.taxCenterFeedback &&
             p.taxCenterFeedback[region] &&
             p.taxCenterFeedback[region][taxCenter] &&
             (p.taxCenterFeedback[region][taxCenter].status === 'SUBMITTED' ||
              p.taxCenterFeedback[region][taxCenter].status === 'submitted');
    }).length;
    
    // Audit cases for this tax center
    const cases = data.cases || [];
    const caseCount = cases.filter(c => c.taxCenter === taxCenter && c.region === region).length;
    const casesClosed = cases.filter(c => c.taxCenter === taxCenter && c.region === region && c.status === 'CLOSED').length;
    const casesInProgress = cases.filter(c => c.taxCenter === taxCenter && c.region === region && c.status === 'IN_PROGRESS').length;

    setStats({
      allocatedPlans: planCount,
      feedbackSubmitted: feedbackCount,
      totalCases: caseCount,
      casesInProgress: casesInProgress,
      casesClosed: casesClosed,
      pendingFeedback: Math.max(0, planCount - feedbackCount)
    });
  }, [userInfo]);

  const taxCenter = userInfo?.orgContext?.assignedTaxCenter;
  const region = userInfo?.orgContext?.assignedRegion;
  const completionRate = stats.totalCases > 0 ? Math.round((stats.casesClosed / stats.totalCases) * 100) : 0;

  return (
    <div style={{ padding: '32px', background: 'var(--background)', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '4px',
            height: '32px',
            background: 'var(--primary)',
            borderRadius: '2px'
          }}></div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Tax Center Manager Dashboard
          </h1>
        </div>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          {taxCenter} • {region} • Manage allocation and audit execution
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="cards" style={{ marginBottom: '32px' }}>
        <Card title="Allocated Plans" number={stats.allocatedPlans} icon="fas fa-file-alt" />
        <Card title="Cases Assigned" number={stats.totalCases} icon="fas fa-tasks" />
        <Card title="In Progress" number={stats.casesInProgress} icon="fas fa-hourglass-half" />
        <Card title="Completed" number={stats.casesClosed} icon="fas fa-check-circle" />
      </div>

      {/* Performance Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '3px',
              height: '18px',
              background: 'var(--success)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Completion Rate
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>
            {completionRate}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {stats.casesClosed} of {stats.totalCases} cases completed
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '3px',
              height: '18px',
              background: 'var(--info)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feedback Status
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--info)' }}>
            {stats.feedbackSubmitted}/{stats.allocatedPlans}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Plans with capacity confirmations
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '3px',
              height: '18px',
              background: 'var(--warning)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Feedback
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--warning)' }}>
            {stats.pendingFeedback}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Plans awaiting confirmation
          </div>
        </div>
      </div>

      {/* Workflow Process */}
      <div style={{
        background: 'var(--surface)',
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '4px',
            height: '20px',
            background: 'var(--primary)',
            borderRadius: '2px'
          }}></div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Execution Workflow
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          {[
            {
              icon: 'fas fa-inbox',
              title: 'Receive Allocation',
              desc: 'Get audit case allocation from regional director'
            },
            {
              icon: 'fas fa-thumbs-up',
              title: 'Confirm Capacity',
              desc: 'Provide feedback on your team capacity'
            },
            {
              icon: 'fas fa-cube',
              title: 'Cascade to Cases',
              desc: 'Create audit cases from allocation'
            },
            {
              icon: 'fas fa-users',
              title: 'Assign Teams',
              desc: 'Distribute cases to your audit teams'
            },
            {
              icon: 'fas fa-chart-line',
              title: 'Monitor Progress',
              desc: 'Track case execution status'
            },
            {
              icon: 'fas fa-file-check',
              title: 'Report Results',
              desc: 'Submit case completion reports'
            }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '12px',
              padding: '16px',
              background: 'var(--card-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.background = 'var(--card-hover)';
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                <i className={item.icon}></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {item.title}
                </h4>
                <p style={{ color: '#0c4a6e', margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          <i className="fas fa-chart-pie" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
          Current Period Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>
              Total Assigned
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {stats.totalCases}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>
              Ready to Execute
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--info)' }}>
              {Math.max(0, stats.totalCases - stats.casesInProgress - stats.casesClosed)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>
              Success Rate
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
              {completionRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaxCenterManagerDashboard;
