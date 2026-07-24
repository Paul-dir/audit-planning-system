import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Regional Director Dashboard - Professional Enterprise Design
 * Shows regional allocation and tax center coordination status
 */
function RegionalDirectorDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    totalPlans: 0,
    allocatedTaxCenters: 0,
    feedbackProvided: 0,
    pendingTaxCenterFeedback: 0,
    sentAllocations: 0
  });

  useEffect(() => {
    const data = loadData();
    const region = userInfo?.orgContext?.assignedRegion;
    
    if (!region) return;
    
    // Calculate dynamic stats from actual data
    const plans = data.plans || [];
    
    // Plans received by this region
    const plansForRegion = plans.filter(p => {
      if (p.allocationStatus && p.allocationStatus[region]) {
        return true;
      }
      return false;
    });
    
    // Tax centers in this region with allocations
    let allocatedTaxCenterCount = 0;
    plansForRegion.forEach(p => {
      if (p.allocationStatus && p.allocationStatus[region]) {
        const receipts = p.allocationStatus[region].taxCenterReceipts || {};
        allocatedTaxCenterCount = Object.keys(receipts).length;
      }
    });
    
    // Feedback provided by tax centers
    let feedbackCount = 0;
    plans.forEach(p => {
      if (p.taxCenterFeedback && p.taxCenterFeedback[region]) {
        feedbackCount += Object.keys(p.taxCenterFeedback[region]).filter(tc => 
          p.taxCenterFeedback[region][tc]?.status === 'SUBMITTED' || 
          p.taxCenterFeedback[region][tc]?.status === 'submitted'
        ).length;
      }
    });
    
    // Pending feedback (allocated but not yet submitted)
    let pendingCount = 0;
    plans.forEach(p => {
      if (p.taxCenterAllocations && p.taxCenterAllocations[region]) {
        Object.keys(p.taxCenterAllocations[region]).forEach(tc => {
          if (!p.taxCenterFeedback || !p.taxCenterFeedback[region] || !p.taxCenterFeedback[region][tc]) {
            pendingCount++;
          }
        });
      }
    });

    setStats({
      totalPlans: plansForRegion.length,
      allocatedTaxCenters: allocatedTaxCenterCount,
      feedbackProvided: feedbackCount,
      pendingTaxCenterFeedback: pendingCount,
      sentAllocations: plansForRegion.filter(p => p.allocationStatus[region].status === 'SENT').length
    });
  }, [userInfo]);

  const region = userInfo?.orgContext?.assignedRegion;

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
            Regional Director Dashboard
          </h1>
        </div>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          {region} • Manage allocation and tax center coordination
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="cards" style={{ marginBottom: '32px' }}>
        <Card title="Plans Received" number={stats.totalPlans} icon="fas fa-file-alt" />
        <Card title="Tax Centers" number={stats.allocatedTaxCenters} icon="fas fa-building" />
        <Card title="Feedback Received" number={stats.feedbackProvided} icon="fas fa-comments" />
        <Card title="Allocations Sent" number={stats.sentAllocations} icon="fas fa-share-alt" />
      </div>

      {/* Secondary Metrics */}
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
              background: 'var(--warning)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending Feedback
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {stats.pendingTaxCenterFeedback}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Awaiting tax center responses
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
              background: 'var(--success)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feedback Rate
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--success)' }}>
            {stats.allocatedTaxCenters > 0 ? Math.round((stats.feedbackProvided / stats.allocatedTaxCenters) * 100) : 0}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {stats.feedbackProvided} of {stats.allocatedTaxCenters} tax centers
          </div>
        </div>
      </div>

      {/* Workflow Overview */}
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
            Regional Coordination Workflow
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
              step: '1',
              title: 'Receive Plan',
              desc: 'Get national audit plan from headquarters'
            },
            {
              step: '2',
              title: 'Review & Allocate',
              desc: 'Distribute cases to your tax centers'
            },
            {
              step: '3',
              title: 'Send Allocations',
              desc: 'Notify tax centers of their assignments'
            },
            {
              step: '4',
              title: 'Collect Feedback',
              desc: 'Receive tax center capacity confirmations'
            },
            {
              step: '5',
              title: 'Submit Feedback',
              desc: 'Send consolidated feedback to headquarters'
            },
            {
              step: '6',
              title: 'Monitor Progress',
              desc: 'Track case execution and completions'
            }
          ].map((item, idx) => (
            <div key={idx} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              background: 'var(--card-hover)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              position: 'relative'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                color: '#ffffff',
                fontWeight: '700',
                flexShrink: 0
              }}>
                {item.step}
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

      {/* Key Responsibilities */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          <i className="fas fa-check-circle" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>
          Key Responsibilities
        </h3>
        <ul style={{
          margin: 0,
          paddingLeft: '24px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: '1.8'
        }}>
          <li>Receive and review national audit plan allocations</li>
          <li>Distribute allocations fairly among {stats.allocatedTaxCenters} tax centers</li>
          <li>Ensure all tax centers receive their assignments</li>
          <li>Collect and aggregate capacity feedback</li>
          <li>Provide regional consolidated feedback to headquarters</li>
          <li>Coordinate with tax center managers on execution</li>
          <li>Monitor progress and escalate delays</li>
          <li>Ensure quality and timely completion of audits</li>
        </ul>
      </div>
    </div>
  );
}

export default RegionalDirectorDashboard;
