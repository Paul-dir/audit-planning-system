import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalPlanReviewView - SIMPLIFIED
 * Only shows plan review, no allocation workflow here.
 */
function RegionalPlanReviewView({ currentView }) {
  const { assignedRegion, selectedRegion: contextSelectedRegion } = useRegional();
  
  // Use selected region if available, otherwise assigned region
  const selectedRegion = contextSelectedRegion || assignedRegion;
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [regionAllocation, setRegionAllocation] = useState(null);

  useEffect(() => {
    loadPlans();
  }, [selectedRegion]);

  const loadPlans = () => {
    const data = loadData();
    
    if (!data?.plans || data.plans.length === 0) {
      setPlans([]);
      setSelectedPlan(null);
      setRegionAllocation(null);
      return;
    }

    // Get all plans sent from director for feedback
    const sentPlans = data.plans.filter(p => 
      p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED'
    );

    setPlans(sentPlans);

    // Auto-select first plan
    if (sentPlans.length > 0) {
      selectPlan(data, sentPlans[0]);
    }
  };

  const selectPlan = (data, plan) => {
    if (!plan || !selectedRegion) {
      setSelectedPlan(null);
      setRegionAllocation(null);
      return;
    }

    setSelectedPlan(plan);

    // Get regional allocation breakdown
    let regionAlloc = null;
    if (plan.regionalAllocation && plan.regionalAllocation[selectedRegion]) {
      const breakdown = plan.regionalAllocation[selectedRegion];
      const totalCases = Object.values(breakdown).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      regionAlloc = {
        name: selectedRegion,
        totalCases,
        breakdown
      };
    }
    
    setRegionAllocation(regionAlloc);
  };

  // Show error if no region assigned
  if (!selectedRegion) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2><i className="fas fa-exclamation-circle"></i> No Region Assigned</h2>
        </div>
        <div style={{ background: '#3a1a1a', padding: '16px', borderRadius: '8px', border: '1px solid #ff5252' }}>
          <strong style={{ color: '#c62828' }}>⚠️ Error: No Region Assigned</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#ff5252' }}>
            You are not assigned to any region. Contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  // Show plan list if no plan selected
  if (!selectedPlan && plans.length > 0) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2><i className="fas fa-inbox"></i> Plans Sent from Director - {selectedRegion}</h2>
          <Badge status={`${plans.length} plans`} className="director-approved" />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Total Cases</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.id}</strong></td>
                  <td>{p.fiscalYear}</td>
                  <td>{p.totalCases || p.totalVolume || '-'}</td>
                  <td><Badge status={p.status} className={p.status === 'FEEDBACK_COLLECTED' ? 'director-approved' : 'feedback'} /></td>
                  <td>{p.createdDate?.split('T')[0] || '-'}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const data = loadData();
                        selectPlan(data, p);
                      }}
                    >
                      <i className="fas fa-arrow-right"></i> Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Show no plans message
  if (!selectedPlan || !regionAllocation) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2><i className="fas fa-inbox"></i> Plan Review - {selectedRegion}</h2>
        </div>
        <div style={{ background: '#1a2332', padding: '16px', borderRadius: '8px', border: '1px solid #4a8fd9', marginTop: '24px' }}>
          <strong style={{ color: '#4a8fd9' }}><i className="fas fa-info-circle"></i> No Plan</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2d3d4d' }}>
            No approved plan has been received yet.
          </p>
        </div>
      </div>
    );
  }

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="action-bar" style={{ marginBottom: '24px' }}>
        <button 
          className="btn btn-outline"
          onClick={() => setSelectedPlan(null)}
        >
          <i className="fas fa-arrow-left"></i> Back to Plans
        </button>
      </div>

      <div className="detail-header">
        <h2><i className="fas fa-tasks"></i> Review Plan from Director - {selectedRegion}</h2>
        <Badge status="Review" className="director-approved" />
      </div>

      {/* Step 1: Review Plan */}
      <div style={{ background: '#1a3a1a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #388e3c' }}>
        <strong><i className="fas fa-check-circle"></i> Step 1: Review Plan from Director</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          You have received the {selectedPlan.name || 'Annual Audit Plan'} for {selectedRegion} region. Total cases: <strong>{regionAllocation.totalCases}</strong>
        </p>
      </div>

      {/* Plan Details Cards */}
      <div className="cards">
        <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-id-badge" />
        <Card title="Version" number={selectedPlan.version} icon="fas fa-code-branch" />
        <Card title="Total Cases" number={regionAllocation.totalCases} icon="fas fa-tasks" />
        <Card title="Fiscal Year" number={selectedPlan.fiscalYear || '2026'} icon="fas fa-calendar" />
      </div>

      {/* Plan Details Section */}
      <div style={{ marginTop: '24px', background: '#f8f9fc', color: '#0c4a6e', padding: '16px', borderRadius: '8px', border: '1px solid #2d3d4d' }}>
        <h3><i className="fas fa-info-circle"></i> Plan Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Planning Tactics</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{selectedPlan.strategy || 'Risk-based approach'}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Planning Period</p>
            <p style={{ fontSize: '13px', margin: '4px 0 0 0' }}>{selectedPlan.startDate?.split('T')[0]} to {selectedPlan.endDate?.split('T')[0]}</p>
          </div>
        </div>
      </div>

      {/* Audit Type Breakdown */}
      <div className="section-title" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <i className="fas fa-chart-pie"></i> Audit Type Breakdown for {selectedRegion}
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CASES</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const cases = regionAllocation.breakdown?.[auditType] || 0;
              const percentage = ((cases / regionAllocation.totalCases) * 100).toFixed(1);
              return (
                <tr key={idx}>
                  <td><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td style={{ textAlign: 'center' }}>{cases}</td>
                  <td style={{ textAlign: 'center' }}>{percentage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{regionAllocation.totalCases}</td>
              <td style={{ textAlign: 'center' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Box */}
      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', border: '1px solid #1976d2', marginTop: '24px' }}>
        <strong><i className="fas fa-info-circle"></i> Next Step</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Click "Allocate to Tax Centers" from the sidebar to distribute these audit types to your 3 tax centers.
        </p>
      </div>
    </div>
  );
}

export default RegionalPlanReviewView;
