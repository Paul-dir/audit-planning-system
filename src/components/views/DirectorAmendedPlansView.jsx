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
        <div className="bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-200 p-4 rounded mb-5 border-2 border-green-500 dark:border-green-600">
          <p className="text-slate-700 dark:text-slate-300 m-0 text-green-900 dark:text-green-200">
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
        <div className="table-container mb-5">
          <table>
            <thead>
              <tr className="bg-slate-800 dark:bg-slate-700 border-b-2 border-slate-600 dark:border-slate-500">
                <th className="text-blue-500 dark:text-blue-400 text-left">AUDIT TYPE</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">ORIGINAL ALLOCATED</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">REGIONAL DIRECTOR SAID</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">PLANNING TEAM AMENDED TO</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">VARIANCE FROM ALLOCATED</th>
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
                  <tr key={type} className={variance < 0 ? 'bg-red-950 dark:bg-red-900' : 'bg-green-950 dark:bg-green-900'}>
                    <td><strong>{auditTypeLabels[type]}</strong></td>
                    <td className="text-center font-bold text-blue-500 dark:text-blue-400">{allocated}</td>
                    <td className="text-center bg-blue-50 dark:bg-blue-950 text-slate-900 dark:text-slate-100">{regionalDirectorSaid}</td>
                    <td className="text-center font-bold text-blue-600 dark:text-blue-500">{plannintTeamAmended}</td>
                    <td className={`text-center font-bold ${
                      variance < 0 ? 'text-red-400 dark:text-red-300' : variance > 0 ? 'text-green-400 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {variance > 0 ? '+' : ''}{variance}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-900 dark:bg-slate-800 font-bold">
                <td>TOTAL</td>
                <td className="text-center">
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                </td>
                <td className="text-center bg-blue-50 dark:bg-blue-950 text-slate-900 dark:text-slate-100">
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                </td>
                <td className="text-center text-blue-600 dark:text-blue-500">
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                </td>
                <td className={`text-center ${
                  (auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) < 0 ? 'text-red-400 dark:text-red-300' : 'text-green-400 dark:text-green-300'
                }`}>
                  {(auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) > 0 ? '+' : ''}
                  {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900 text-slate-900 dark:text-slate-100 p-4 rounded mb-5 border border-blue-400 dark:border-blue-600">
          <strong><i className="fas fa-lightbulb"></i> Review Notes:</strong>
          <p className="text-slate-700 dark:text-slate-300 m-2 text-xs">
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
        <div className="table-container mb-5">
          <table>
            <thead>
              <tr className="bg-slate-800 dark:bg-slate-700 border-b-2 border-slate-600 dark:border-slate-500">
                <th className="text-blue-500 dark:text-blue-400">REGION</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">TAX CENTERS</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">FEEDBACK STATUS</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">SUBMITTED</th>
                <th className="text-blue-500 dark:text-blue-400">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlan.regionalFeedback.map((feedback, idx) => (
                <tr key={idx}>
                  <td><strong>{feedback.region}</strong></td>
                  <td className="text-center">{feedback.totalTaxCenters}</td>
                  <td className="text-center">
                    <Badge 
                      status={feedback.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
                      className={feedback.status === 'SUBMITTED' ? 'director-approved' : 'pending'} 
                    />
                  </td>
                  <td className="text-center text-xs text-gray-500 dark:text-gray-400">
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

        <div className="bg-slate-900 dark:bg-slate-800 text-yellow-500 dark:text-yellow-400 p-4 rounded mb-5 border-2 border-yellow-500 dark:border-yellow-600">
          <strong className="text-yellow-600 dark:text-yellow-400"><i className="fas fa-info-circle"></i> Decision Required:</strong>
          <p className="text-yellow-600 dark:text-yellow-400 m-2 text-xs">
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
        <div className="bg-slate-950 dark:bg-slate-900 text-gray-100 dark:text-gray-200 p-4 rounded mb-6 border-4 border-blue-500 dark:border-blue-600 flex gap-4 items-center flex-wrap shadow-lg shadow-yellow-500/40">
          <label className="text-sm font-bold text-blue-500 dark:text-blue-400 whitespace-nowrap">
            <i className="fas fa-file-alt"></i> QUICK SELECT:
          </label>
          <select
            value={selectedPlan ? selectedPlan.id : ''}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              if (plan) setSelectedPlan(plan);
            }}
            className="px-4 py-3 rounded border-2 border-blue-500 dark:border-blue-400 text-sm font-bold cursor-pointer bg-slate-950 dark:bg-slate-900 min-w-60 text-slate-400 dark:text-slate-300"
          >
            <option value="">-- Select a plan to review --</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.id} (v{plan.version}) - {plan.regionalFeedback.length} region(s)
              </option>
            ))}
          </select>
          <span className="text-xs text-red-500 dark:text-red-400 font-semibold">
            {plans.length} amended plan(s) waiting
          </span>
        </div>
      )}

      <div className="section-title">
        <i className="fas fa-edit"></i> Amended Plans from Planning Team
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg">
          <i className="fas fa-inbox text-gray-400 dark:text-gray-600 text-4xl block mb-5"></i>
          <h3>No Amended Plans</h3>
          <p className="text-gray-500 dark:text-gray-400">There are no amended plans from the Planning Team awaiting your review.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr className="bg-slate-800 dark:bg-slate-700 border-b-2 border-slate-600 dark:border-slate-500">
                <th className="text-blue-500 dark:text-blue-400">PLAN ID</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">VERSION</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">FISCAL YEAR</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">REGIONS</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">STATUS</th>
                <th className="text-blue-500 dark:text-blue-400 text-center">SUBMITTED</th>
                <th className="text-blue-500 dark:text-blue-400">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => (
                <tr key={plan.id} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  <td><strong>{plan.id}</strong></td>
                  <td className="text-center">v{plan.version}</td>
                  <td className="text-center">{plan.fiscalYear}</td>
                  <td className="text-center">{plan.regionalFeedback.length}</td>
                  <td className="text-center">
                    <Badge status={plan.status.replace(/_/g, ' ')} className="pending" />
                  </td>
                  <td className="text-center text-xs text-gray-500 dark:text-gray-400">
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
