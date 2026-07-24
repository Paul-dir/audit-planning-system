import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';

/**
 * DirectorAmendedPlansView - Director reviews amended plans from Planning Team
 * Shows regional capacity adjustments made by Planning Team
 */
function DirectorAmendedPlansView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  const loadPlans = () => {
    const data = loadData();
    console.log('===== DirectorAmendedPlansView loadPlans =====');
    console.log('All plans:', data.plans);
    
    // Get plans that have been resubmitted by Planning Team after amendment
    const amendedPlans = data.plans.filter(p => {
      console.log(`Plan ${p.id}: status=${p.status}, has regionalFeedback=${!!p.regionalFeedback}`);
      return p.status === 'SUBMITTED_TO_DIRECTOR' &&
        p.regionalFeedback &&
        p.regionalFeedback.length > 0;
    });
    
    console.log('Filtered amended plans:', amendedPlans);
    console.log('Amended plans count:', amendedPlans.length);
    
    setPlans(amendedPlans);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleApprovePlan = (planId) => {
    if (!window.confirm('Approve this amended plan and send to Senior Management?')) {
      return;
    }

    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    
    if (plan) {
      plan.status = 'SUBMITTED_TO_SENIOR_MANAGEMENT';
      plan.lastModified = new Date().toISOString();
      
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'APPROVED_BY_DIRECTOR',
        by: 'Director',
        date: new Date().toISOString(),
        notes: 'Amended plan approved and sent to Senior Management for final approval.',
        version: plan.version
      });
      
      saveData(data);
      
      alert('✅ Plan approved and sent to Senior Management!');
      setSelectedPlan(null);
      setSelectedRegion(null);
      loadPlans();
    }
  };

  const handleRejectAndSendBack = (planId) => {
    const notes = window.prompt('Enter feedback for Planning Team (why you are sending this back):');
    if (!notes) return;

    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    
    if (plan) {
      plan.status = 'FEEDBACK_COLLECTED';
      plan.lastModified = new Date().toISOString();
      
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'SENT_BACK_TO_PLANNING_TEAM',
        by: 'Director',
        date: new Date().toISOString(),
        notes: `Amendment review: ${notes}`,
        version: plan.version
      });
      
      saveData(data);
      
      alert('Plan sent back to Planning Team for further amendments.');
      setSelectedPlan(null);
      setSelectedRegion(null);
      loadPlans();
    }
  };

  // Region Detail View
  if (selectedPlan && selectedRegion) {
    const feedback = selectedPlan.regionalFeedback.find(f => f.region === selectedRegion);
    
    if (!feedback) {
      return (
        <div>
          <div className="action-bar">
            <button className="btn btn-outline" onClick={() => setSelectedRegion(null)}>
              <i className="fas fa-arrow-left"></i> Back to Plan Regions
            </button>
          </div>
          <p>Region feedback not found.</p>
        </div>
      );
    }

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedRegion(null)}>
            <i className="fas fa-arrow-left"></i> Back to Plan Regions
          </button>
        </div>

        <div className="detail-header">
          <h2>{selectedRegion} - Regional Capacity Review</h2>
          <Badge status="Amended" className="pending" />
        </div>

        <div className="cards">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Region" number={selectedRegion} icon="fas fa-map-pin" />
          <Card title="Version" number={`v${selectedPlan.version}`} icon="fas fa-code-branch" />
          <Card title="Tax Centers" number={feedback.totalTaxCenters} icon="fas fa-building" />
        </div>

        <div className="section-title">
          <i className="fas fa-info-circle"></i> Regional Feedback Summary
        </div>
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #388e3c'
        }}>
          <p style={{ color: '#0c4a6e', margin: 0, color: '#2e7d32' }}>
            <strong>Submitted by:</strong> {feedback.submittedBy}
            <br />
            <strong>Tax Centers:</strong> {feedback.taxCenterCount} of {feedback.totalTaxCenters} provided feedback
            <br />
            <strong>Submitted:</strong> {new Date(feedback.submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Amended Regional Capacity Table */}
        <div className="section-title">
          <i className="fas fa-chart-bar"></i> Planning Team's Amended Regional Capacity
        </div>
        <div className="table-container" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
                <th style={{ color: '#4a8fd9', textAlign: 'left' }}>AUDIT TYPE</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>ORIGINAL ALLOCATED</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>REGIONAL DIRECTOR SAID</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>PLANNING TEAM AMENDED TO</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>VARIANCE FROM ALLOCATED</th>
              </tr>
            </thead>
            <tbody>
              {auditTypes.map(type => {
                const agg = feedback.aggregated?.[type];
                
                // Debug log
                if (!agg) {
                  console.warn(`⚠️ No aggregated data for ${type}. Full feedback:`, feedback);
                }
                console.log(`${type}:`, agg);
                
                const allocated = agg?.allocated || 0;
                const regionalDirectorSaid = agg?.canDeliver || 0;
                const plannintTeamAmended = agg?.canDeliver || 0;
                const variance = plannintTeamAmended - allocated;
                
                return (
                  <tr key={type} style={{ background: variance < 0 ? '#3a1a1a' : '#1a3a1a' }}>
                    <td><strong>{auditTypeLabels[type]}</strong></td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#4a8fd9' }}>{allocated}</td>
                    <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e' }}>{regionalDirectorSaid}</td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#1976d2' }}>{plannintTeamAmended}</td>
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
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                </td>
                <td style={{ textAlign: 'center', background: '#e3f2fd', color: '#0c4a6e' }}>
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                </td>
                <td style={{ textAlign: 'center', color: '#1976d2' }}>
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                </td>
                <td style={{
                  textAlign: 'center',
                  color: (auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) < 0 ? '#ff5252' : '#4caf50'
                }}>
                  {(auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) > 0 ? '+' : ''}
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{
          background: '#e3f2fd', color: '#0c4a6e',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #1976d2'
        }}>
          <strong><i className="fas fa-lightbulb"></i> Review Notes:</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
            The Planning Team has reviewed regional feedback and adjusted regional capacity based on organizational priorities and constraints. 
            These amendments are now ready for your approval to send to Senior Management for final authorization.
          </p>
        </div>
      </div>
    );
  }

  // Plan Detail View
  if (selectedPlan) {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setSelectedPlan(null)}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>

        <div className="detail-header">
          <h2>Review Amended Plan - {selectedPlan.id}</h2>
          <Badge status={`v${selectedPlan.version}`} className="pending" />
        </div>

        <div className="cards">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
          <Card title="Version" number={`v${selectedPlan.version}`} icon="fas fa-code-branch" />
          <Card title="Regions" number={selectedPlan.regionalFeedback.length} icon="fas fa-map-marked-alt" />
        </div>

        <div className="section-title">
          <i className="fas fa-map"></i> Regional Amendments
        </div>
        <div className="table-container" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
                <th style={{ color: '#4a8fd9' }}>REGION</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>TAX CENTERS</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>FEEDBACK STATUS</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>SUBMITTED</th>
                <th style={{ color: '#4a8fd9' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlan.regionalFeedback.map((feedback, idx) => (
                <tr key={idx}>
                  <td><strong>{feedback.region}</strong></td>
                  <td style={{ textAlign: 'center' }}>{feedback.totalTaxCenters}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Badge 
                      status={feedback.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
                      className={feedback.status === 'SUBMITTED' ? 'director-approved' : 'pending'} 
                    />
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '12px', color: '#a0aec0' }}>
                    {new Date(feedback.submittedAt).toLocaleDateString()}
                  </td>
                  <td>
                    {feedback.status === 'SUBMITTED' && (
                      <button 
                        className="btn btn-sm btn-info"
                        onClick={() => setSelectedRegion(feedback.region)}
                      >
                        <i className="fas fa-eye"></i> Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #ffb74d'
        }}>
          <strong style={{ color: '#f57f17' }}><i className="fas fa-info-circle"></i> Decision Required:</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#f57f17' }}>
            Review the amended regional capacities for all regions. You can approve and send to Senior Management, or send back for further amendments.
          </p>
        </div>

        <div className="action-bar">
          <button 
            className="btn btn-warning"
            onClick={() => handleRejectAndSendBack(selectedPlan.id)}
          >
            <i className="fas fa-redo"></i> Send Back for Further Amendments
          </button>
          <div></div>
          <button 
            className="btn btn-success"
            onClick={() => handleApprovePlan(selectedPlan.id)}
          >
            <i className="fas fa-check-circle"></i> Approve & Send to Senior Management
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div>
      {/* Plan Selector Dropdown */}
      {plans && plans.length > 1 && (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '3px solid #4a8fd9',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: '0 3px 10px rgba(255, 152, 0, 0.4)'
        }}>
          <label style={{ fontSize: '14px', fontWeight: '700', color: '#4a8fd9', whiteSpace: 'nowrap' }}>
            <i className="fas fa-file-alt"></i> QUICK SELECT:
          </label>
          <select
            value={selectedPlan ? selectedPlan.id : ''}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              if (plan) setSelectedPlan(plan);
            }}
            style={{
              padding: '12px 16px',
              borderRadius: '6px',
              border: '2px solid #4a8fd9',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              background: '#0f1419',
              minWidth: '240px',
              color: '#2d3d4d'
            }}
          >
            <option value="">-- Select a plan to review --</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.id} (v{plan.version}) - {plan.regionalFeedback.length} region(s)
              </option>
            ))}
          </select>
          <span style={{ fontSize: '12px', color: '#d84315', fontWeight: '600' }}>
            {plans.length} amended plan(s) waiting
          </span>
        </div>
      )}

      <div className="section-title">
        <i className="fas fa-edit"></i> Amended Plans from Planning Team
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8f9fc', color: '#0c4a6e', borderRadius: '8px' }}>
          <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '20px' }}></i>
          <h3>No Amended Plans</h3>
          <p style={{ color: '#a0aec0' }}>There are no amended plans from the Planning Team awaiting your review.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr style={{ background: '#1e2a3a', borderBottom: '2px solid #2d3d4d' }}>
                <th style={{ color: '#4a8fd9' }}>PLAN ID</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>VERSION</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>FISCAL YEAR</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>REGIONS</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>STATUS</th>
                <th style={{ color: '#4a8fd9', textAlign: 'center' }}>SUBMITTED</th>
                <th style={{ color: '#4a8fd9' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} style={{ background: '#f8f9fc', color: '#0c4a6e' }}>
                  <td><strong>{plan.id}</strong></td>
                  <td style={{ textAlign: 'center' }}>v{plan.version}</td>
                  <td style={{ textAlign: 'center' }}>{plan.fiscalYear}</td>
                  <td style={{ textAlign: 'center' }}>{plan.regionalFeedback.length}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Badge status={plan.status.replace(/_/g, ' ')} className="pending" />
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '12px', color: '#a0aec0' }}>
                    {new Date(plan.lastModified).toLocaleDateString()}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <i className="fas fa-eye"></i> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DirectorAmendedPlansView;
