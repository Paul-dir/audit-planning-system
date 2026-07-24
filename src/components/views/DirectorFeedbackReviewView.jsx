import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';

function DirectorFeedbackReviewView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRegionFeedback, setSelectedRegionFeedback] = useState(null);

  const loadPlans = () => {
    const data = loadData();
    // Show plans that are awaiting feedback or have feedback collected
    const feedbackPlans = data.plans.filter(p => 
      p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED'
    );
    setPlans(feedbackPlans);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  if (selectedPlan && selectedRegionFeedback) {
    const feedback = selectedPlan.regionalFeedback?.find(f => f.region === selectedRegionFeedback.region);
    const regionAllocations = selectedPlan.taxCenterAllocations?.[selectedRegionFeedback.region] || {};
    
    // Calculate totals from allocations
    const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
    const auditTypeLabels = {
      desk_audit: 'Desk Audit',
      field_audit: 'Field Audit',
      joint_audit: 'Joint Audit',
      transfer_pricing: 'Transfer Pricing',
      comprehensive: 'Comprehensive',
      issue_audit: 'Issue Audit'
    };

    // Calculate allocated totals
    const allocatedTotals = {};
    Object.values(regionAllocations).forEach(tcAllocation => {
      auditTypes.forEach(type => {
        allocatedTotals[type] = (allocatedTotals[type] || 0) + (parseInt(tcAllocation[type]) || 0);
      });
    });

    // Get proposed values from feedback if it exists
    const proposedTotals = feedback?.aggregated || {};
    
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedRegionFeedback(null)}>
            <i className="fas fa-arrow-left"></i> Back to Regions
          </button>
        </div>

        <div className="cards">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Region" number={selectedRegionFeedback.region} icon="fas fa-map-marker-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
          <Card 
            title="Feedback Status" 
            number={feedback?.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
            icon="fas fa-flag" 
          />
        </div>

        <div className="section-title"><i className="fas fa-comment-dots"></i> Regional Feedback from {selectedRegionFeedback.region}</div>
        {feedback?.status === 'SUBMITTED' ? (
          <div style={{ background: '#c8e6c9', color: '#1b5e20', padding: '16px', borderRadius: '8px', marginBottom: '20px', borderLeft: '4px solid #388e3c' }}>
            <p><strong><i className="fas fa-check-circle"></i> Feedback Submitted</strong></p>
            <p style={{ marginTop: '8px', lineHeight: '1.6', fontSize: '14px', color: '#1b5e20' }}>
              Regional Director has reviewed tax center feedback and submitted regional capacity adjustments.
            </p>
            <p style={{ marginTop: '12px', fontSize: '12px', color: '#555' }}>
              <i className="fas fa-clock"></i> Submitted: {new Date(feedback.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <i className="fas fa-hourglass-half"></i> Feedback pending from {selectedRegionFeedback.region}
          </div>
        )}

        <div className="section-title"><i className="fas fa-table"></i> Allocation & Regional Capacity Adjustment</div>
        <div className="table-container">
          <table>
            <thead>
              <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
                <th style={{ color: '#4a8fd9' }}>AUDIT TYPE</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>ALLOCATED TO REGION</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>TAX CENTERS CAN DELIVER</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>REGIONAL OVERRIDE</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>VARIANCE</th>
              </tr>
            </thead>
            <tbody>
              {auditTypes.map((type, i) => {
                const allocated = allocatedTotals[type] || 0;
                const canDeliver = proposedTotals[type]?.canDeliver || 0;
                const override = proposedTotals[type]?.canDeliver || canDeliver;
                const variance = override - allocated;
                
                return (
                  <tr key={type} style={{ background: variance < 0 ? '#3a1a1a' : '#1a3a1a' }}>
                    <td><strong>{auditTypeLabels[type]}</strong></td>
                    <td style={{ textAlign: 'center' }}>{allocated}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{canDeliver}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>{override}</td>
                    <td style={{ 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      color: variance < 0 ? '#ff5252' : variance > 0 ? '#4caf50' : '#999'
                    }}>
                      {variance > 0 ? '+' : ''}{variance}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
                <td>TOTAL</td>
                <td style={{ textAlign: 'center' }}>
                  {auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0)}
                </td>
                <td style={{
                  textAlign: 'center',
                  color: (auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)) < 0 ? '#ff5252' : '#4caf50'
                }}>
                  {(auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)) > 0 ? '+' : ''}
                  {auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    const submittedCount = selectedPlan.regionalFeedback?.filter(f => f.status === 'SUBMITTED').length || 0;
    const totalRegions = selectedPlan.regionalFeedback?.length || 0;
    
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedPlan(null)}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>

        <div className="cards">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
          <Card title="Total Cases" number={selectedPlan.totalVolume} icon="fas fa-list" />
          <Card 
            title="Feedback Received" 
            number={`${submittedCount}/${totalRegions}`} 
            icon="fas fa-check-circle" 
          />
        </div>

        <div className="section-title"><i className="fas fa-map"></i> Regional Feedback Status</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Allocated Cases</th>
                <th>Feedback Status</th>
                <th>Submitted Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlan.regionalFeedback?.map((feedback) => {
                const allocation = selectedPlan.locations?.find(l => l.name === feedback.region);
                return (
                  <tr key={feedback.region}>
                    <td><strong>{feedback.region}</strong></td>
                    <td>{allocation?.cases || 0} cases</td>
                    <td>
                      <Badge 
                        status={feedback.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
                        className={feedback.status === 'SUBMITTED' ? 'director-approved' : 'pending'} 
                      />
                    </td>
                    <td>
                      {feedback.status === 'SUBMITTED' 
                        ? new Date(feedback.submittedDate).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td>
                      {feedback.status === 'SUBMITTED' && (
                        <button 
                          className="btn btn-sm btn-info" 
                          onClick={() => setSelectedRegionFeedback(feedback)}
                        >
                          <i className="fas fa-eye"></i> Review
                        </button>
                      )}
                      {feedback.status === 'PENDING' && (
                        <span style={{ color: '#4a8fd9', fontStyle: 'italic' }}>Awaiting response</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {submittedCount > 0 && (
          <>
            <div style={{ background: submittedCount === totalRegions ? '#c8e6c9' : '#0f14193e0', padding: '16px', borderRadius: '8px', marginTop: '20px', marginBottom: '20px', borderLeft: `4px solid ${submittedCount === totalRegions ? '#388e3c' : '#ffb74d'}` }}>
              <i className={`fas ${submittedCount === totalRegions ? 'fa-check-circle' : 'fa-info-circle'}`}></i> 
              <strong> {submittedCount === totalRegions ? 'All Regional Feedback Received' : `Partial Feedback: ${submittedCount}/${totalRegions} Regions`}</strong> 
              {submittedCount === totalRegions 
                ? ' - You can now send this back to the Audit Team to incorporate feedback and make amendments.'
                : ' - Some regions have submitted feedback. You can still send back for planning team review.'}
            </div>
            <div className="action-bar">
              <div></div>
              <button 
                className="btn btn-success"
                onClick={() => {
                  if (window.confirm(`Send feedback back to Planning Team for amendment review?\n\nFeedback Received: ${submittedCount}/${totalRegions} regions`)) {
                    alert('Regional feedback sent back to Planning Team. They will now review and amend the plan.');
                    setSelectedPlan(null);
                    loadPlans();
                  }
                }}
              >
                <i className="fas fa-share-alt"></i> Send Back to Planning Team
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const stats = {
    awaitingFeedback: plans.filter(p => p.status === 'AWAITING_REGIONAL_FEEDBACK').length,
    feedbackCollected: plans.filter(p => p.status === 'FEEDBACK_COLLECTED').length,
  };

  return (
    <div>
      <div className="cards">
        <Card title="Awaiting Feedback" number={stats.awaitingFeedback} icon="fas fa-hourglass-half" />
        <Card title="Feedback Collected" number={stats.feedbackCollected} icon="fas fa-check-circle" />
      </div>

      <div className="section-title"><i className="fas fa-inbox"></i> Plans Awaiting/Reviewing Regional Feedback</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>Fiscal Year</th>
              <th>Total Cases</th>
              <th>Regions</th>
              <th>Feedback Received</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <br />No plans with regional feedback
              </td></tr>
            ) : (
              plans.map(plan => {
                const submittedCount = plan.regionalFeedback?.filter(f => f.status === 'SUBMITTED').length || 0;
                const totalRegions = plan.regionalFeedback?.length || 0;
                return (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.totalVolume}</td>
                    <td>{totalRegions}</td>
                    <td>
                      <span style={{ 
                        color: submittedCount === totalRegions ? '#388e3c' : '#4a8fd9',
                        fontWeight: 'bold'
                      }}>
                        {submittedCount}/{totalRegions}
                      </span>
                    </td>
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
    </div>
  );
}

export default DirectorFeedbackReviewView;
