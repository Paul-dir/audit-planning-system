import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Audit Team Dashboard - Professional Enterprise Design
 * Shows audit plan status and allocation metrics
 */
function AuditTeamDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    totalPlans: 0,
    draftPlans: 0,
    submittedPlans: 0,
    approvedPlans: 0,
    totalAllocations: 0,
    taxCentersAllocated: 0,
    feedbackReceived: 0,
    sentToRegions: 0
  });

  useEffect(() => {
    const data = loadData();
    const plans = data.plans || [];

    // Count plans by status
    const totalCount = plans.length;
    const draftCount = plans.filter(p => p.status === 'DRAFT').length;
    const submittedCount = plans.filter(p => p.status === 'SUBMITTED').length;
    const approvedCount = plans.filter(p => p.status === 'APPROVED').length;

    // Count total allocations
    let allocationCount = 0;
    let taxCenterCount = new Set();
    let feedbackCount = 0;
    let sentCount = 0;

    plans.forEach(plan => {
      // Count regional allocations
      if (plan.regionalAllocations) {
        allocationCount += plan.regionalAllocations.length;
      }

      // Count unique tax centers with allocations
      if (plan.taxCenterAllocations) {
        Object.values(plan.taxCenterAllocations).forEach(regionTaxCenters => {
          Object.keys(regionTaxCenters).forEach(tcName => {
            taxCenterCount.add(tcName);
          });
        });
      }

      // Count feedback received
      if (plan.taxCenterFeedback) {
        Object.values(plan.taxCenterFeedback).forEach(regionFeedback => {
          Object.values(regionFeedback).forEach(tcFeedback => {
            if (tcFeedback.status === 'SUBMITTED' || tcFeedback.status === 'submitted') {
              feedbackCount++;
            }
          });
        });
      }

      // Count sent allocations
      if (plan.allocationStatus) {
        Object.values(plan.allocationStatus).forEach(status => {
          if (status.status === 'SENT') {
            sentCount++;
          }
        });
      }
    });

    setStats({
      totalPlans: totalCount,
      draftPlans: draftCount,
      submittedPlans: submittedCount,
      approvedPlans: approvedCount,
      totalAllocations: allocationCount,
      taxCentersAllocated: taxCenterCount.size,
      feedbackReceived: feedbackCount,
      sentToRegions: sentCount
    });
  }, []);

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
            Annual Planning Dashboard
          </h1>
        </div>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
          Monitor audit plan creation, allocation, and feedback tracking across all regions
        </p>
      </div>

      {/* Primary Metrics - Main Cards */}
      <div className="cards" style={{ marginBottom: '32px' }}>
        <Card title="Total Plans" number={stats.totalPlans} icon="fas fa-file-alt" />
        <Card title="Draft Plans" number={stats.draftPlans} icon="fas fa-file-invoice" />
        <Card title="Approved Plans" number={stats.approvedPlans} icon="fas fa-check-circle" />
        <Card title="Tax Centers" number={stats.taxCentersAllocated} icon="fas fa-building" />
      </div>

      {/* Secondary Metrics - Information Cards */}
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
          gap: '8px',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '3px',
              height: '18px',
              background: 'var(--primary)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sent to Regions
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {stats.sentToRegions}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {stats.totalAllocations} total allocations distributed
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
          gap: '8px',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '3px',
              height: '18px',
              background: 'var(--feedback)',
              borderRadius: '2px'
            }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Feedback Received
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {stats.feedbackReceived}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Tax center capacity confirmations
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
          gap: '8px',
          transition: 'all 0.2s ease'
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
            {stats.totalPlans > 0 ? Math.round((stats.approvedPlans / stats.totalPlans) * 100) : 0}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            {stats.approvedPlans} of {stats.totalPlans} plans finalized
          </div>
        </div>
      </div>

      {/* Process Overview Card */}
      <div style={{
        background: 'var(--surface)',
        padding: '28px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '4px',
            height: '20px',
            background: 'var(--primary)',
            borderRadius: '2px'
          }}></div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Annual Planning Process
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
              icon: 'fas fa-pencil-alt', 
              title: 'Create Plan',
              desc: 'Design annual audit plan with audit types and national strategy'
            },
            { 
              icon: 'fas fa-cube', 
              title: 'Regional Allocation',
              desc: 'Allocate audit cases by region based on risk assessment'
            },
            { 
              icon: 'fas fa-network-wired', 
              title: 'Distribute',
              desc: 'Send allocations to 5 regional directors for implementation'
            },
            { 
              icon: 'fas fa-comments', 
              title: 'Collect Feedback',
              desc: 'Receive and aggregate feedback from tax centers'
            },
            { 
              icon: 'fas fa-check-double', 
              title: 'Finalize',
              desc: 'Make final adjustments based on feedback and approve'
            },
            { 
              icon: 'fas fa-chart-line', 
              title: 'Monitor',
              desc: 'Track execution progress and case completion'
            }
          ].map((task, idx) => (
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
                <i className={task.icon}></i>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {task.title}
                </h4>
                <p style={{ color: '#0c4a6e', margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {task.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Submitted Plans
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
            {stats.submittedPlans}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Regions Covered
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
            5
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Avg. Feedback Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--info)' }}>
            {stats.totalAllocations > 0 ? Math.round((stats.feedbackReceived / stats.totalAllocations) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditTeamDashboard;
