import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';

function FeedbackReviewView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [amendedAllocations, setAmendedAllocations] = useState({});

  const loadPlans = () => {
    const data = loadData();
    const plansWithFeedback = data.plans.filter(p => 
      p.status === 'FEEDBACK_COLLECTED' && 
      p.regionalFeedback && 
      p.regionalFeedback.length > 0
    );
    setPlans(plansWithFeedback);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    const feedback = plan.regionalFeedback.filter(f => f.status === 'SUBMITTED');
    setFeedbackList(feedback);
    const amended = {};
    feedback.forEach(fb => {
      amended[fb.region] = { ...fb.aggregated || {} };
    });
    setAmendedAllocations(amended);
  };

  const handleRegionalCapacityChange = (region, auditType, value) => {
    setAmendedAllocations(prev => ({
      ...prev,
      [region]: {
        ...prev[region],
        [auditType]: {
          ...(prev[region]?.[auditType] || {}),
          canDeliver: parseInt(value) || 0
        }
      }
    }));
  };

  const submitAmendedPlanToDirector = () => {
    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan.id);
    
    if (planIndex >= 0) {
      const plan = data.plans[planIndex];
      feedbackList.forEach(feedback => {
        const existingIndex = plan.regionalFeedback.findIndex(
          f => f.region === feedback.region && f.status === 'SUBMITTED'
        );
        if (existingIndex >= 0) {
          plan.regionalFeedback[existingIndex].aggregated = amendedAllocations[feedback.region];
        }
      });
      
      plan.version = (plan.version || 1) + 1;
      plan.status = 'SUBMITTED_TO_DIRECTOR';
      plan.lastModified = new Date().toISOString();
      
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'RESUBMITTED_TO_DIRECTOR',
        by: 'Audit Team',
        date: new Date().toISOString(),
        notes: 'Plan amended with regional capacity adjustments. Ready for Director review.',
        version: plan.version
      });
      
      saveData(data);
      alert('✅ Amended plan submitted to Director! They will review and send to Senior Management.');
      setSelectedPlan(null);
      loadPlans();
    }
  };

  const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
  const auditTypeLabels = {
    desk_audit: 'Desk Audit',
    field_audit: 'Field Audit',
    joint_audit: 'Joint Audit',
    transfer_pricing: 'Transfer Pricing',
    comprehensive: 'Comprehensive',
    issue_audit: 'Issue Audit'
  };

  if (selectedPlan && feedbackList.length > 0) {
    return (
      <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => setSelectedPlan(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 font-semibold rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
            <h1 className="text-3xl font-serif font-bold text-neutral-50">Review & Amend Plan</h1>
          </div>
          <p className="text-neutral-400 text-sm">Plan ID: {selectedPlan.id} • Version: v{selectedPlan.version}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-primary-600 rounded-lg p-6">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Total Regions</h3>
            <div className="text-4xl font-bold text-neutral-50">{feedbackList.length}</div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-info-600 rounded-lg p-6">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Plan Version</h3>
            <div className="text-4xl font-bold text-neutral-50">v{selectedPlan.version}</div>
          </div>

          <div className="bg-neutral-800 border border-neutral-700 border-l-4 border-l-warning-600 rounded-lg p-6">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-neutral-400 mb-2">Status</h3>
            <div className="text-xl font-bold text-neutral-50">{selectedPlan.status.replace(/_/g, ' ')}</div>
          </div>
        </div>

        <div className="space-y-6">
          {feedbackList.map((feedback, idx) => (
            <div key={idx} className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary-600 rounded-sm"></div>
                <h2 className="text-xl font-serif font-bold text-neutral-50">{feedback.region} Region</h2>
                <span className="ml-auto text-sm text-neutral-400">Regional Capacity Adjustment</span>
              </div>

              <div className="bg-success-900/20 border border-success-700 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-check-circle text-success-500 mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-success-400 mb-1">Regional Feedback Submitted</h3>
                    <p className="text-sm text-success-300/80">
                      {feedback.taxCenterCount} of {feedback.totalTaxCenters} tax centers provided feedback
                    </p>
                    <p className="text-xs text-neutral-400 mt-2">
                      <i className="fas fa-clock mr-1"></i>Submitted: {new Date(feedback.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-neutral-300 mb-4 uppercase tracking-wider">
                  <i className="fas fa-edit mr-2"></i>Amend Regional Capacity
                </div>
                <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-800 border-b border-neutral-700">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">Audit Type</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Total Allocated</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Can Deliver</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Override</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Variance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-700">
                        {auditTypes.map(type => {
                          const agg = feedback.aggregated?.[type] || {};
                          const allocated = agg.allocated || 0;
                          const canDeliver = agg.canDeliver || 0;
                          const override = amendedAllocations[feedback.region]?.[type]?.canDeliver || canDeliver;
                          const variance = override - allocated;
                          return (
                            <tr key={type} className="hover:bg-neutral-700/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-neutral-50">{auditTypeLabels[type]}</td>
                              <td className="px-6 py-4 text-center font-bold text-primary-400">{allocated}</td>
                              <td className="px-6 py-4 text-center font-bold text-neutral-50">{canDeliver}</td>
                              <td className="px-6 py-4 text-center">
                                <input
                                  type="number"
                                  value={override}
                                  onChange={(e) => handleRegionalCapacityChange(feedback.region, type, e.target.value)}
                                  className="w-20 px-3 py-2 bg-neutral-700 border border-neutral-600 text-center text-sm font-semibold text-neutral-50 rounded hover:border-primary-600 transition-colors"
                                  min="0"
                                />
                              </td>
                              <td className={`px-6 py-4 text-center font-semibold ${
                                variance < 0 ? 'text-danger-400' : variance > 0 ? 'text-success-400' : 'text-neutral-400'
                              }`}>
                                {variance > 0 ? '+' : ''}{variance}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-neutral-700/50 border-t-2 border-primary-600 font-bold">
                          <td className="px-6 py-4 text-neutral-50">TOTAL</td>
                          <td className="px-6 py-4 text-center text-primary-400">
                            {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                          </td>
                          <td className="px-6 py-4 text-center text-neutral-50">
                            {auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                          </td>
                          <td className="px-6 py-4 text-center text-primary-400">
                            {auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0)}
                          </td>
                          <td className={`px-6 py-4 text-center ${
                            (auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) < 0 ? 'text-danger-400' : 'text-success-400'
                          }`}>
                            {(auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)) > 0 ? '+' : ''}
                            {auditTypes.reduce((sum, type) => sum + (amendedAllocations[feedback.region]?.[type]?.canDeliver || feedback.aggregated?.[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (feedback.aggregated?.[type]?.allocated || 0), 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="bg-info-900/20 border border-info-700 rounded-lg p-4">
                <p className="text-sm text-info-300 m-0">
                  <i className="fas fa-lightbulb mr-2"></i>
                  <strong>Note:</strong> The planning team can adjust regional capacity based on budget constraints or organizational priorities.
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary-900/20 border border-primary-700 rounded-lg p-6">
          <h3 className="font-semibold text-primary-300 mb-2">
            <i className="fas fa-info-circle mr-2"></i>Amendment Options
          </h3>
          <p className="text-sm text-primary-300/80">
            Amend the allocations above based on regional feedback. Once satisfied, submit to Director for review.
          </p>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            onClick={() => setSelectedPlan(null)}
            className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 font-semibold rounded-lg transition-colors"
          >
            <i className="fas fa-times mr-2"></i>Cancel
          </button>
          <button 
            className="px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-lg transition-colors"
            onClick={() => {
              if (window.confirm('Submit AMENDED plan to Director?\n\nDirector will review and send to Senior Management for approval.')) {
                submitAmendedPlanToDirector();
              }
            }}
          >
            <i className="fas fa-check-circle mr-2"></i>Submit Amended Plan to Director
          </button>
        </div>
      </div>
    );
  }

  if (selectedPlan) {
    return (
      <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => setSelectedPlan(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-50 font-semibold rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left"></i> Back to List
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <i className="fas fa-inbox text-neutral-600 text-5xl mb-6"></i>
          <h3 className="text-2xl font-bold text-neutral-50 mb-2">No Feedback Submitted</h3>
          <p className="text-neutral-400">Regions have not yet submitted their feedback for this plan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-primary-600 rounded-sm"></div>
          <h1 className="text-3xl font-serif font-bold text-neutral-50">Plans Awaiting Review</h1>
        </div>
        <p className="text-neutral-400 text-sm">Review and amend plans with regional feedback</p>
      </div>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-neutral-800 border border-neutral-700 rounded-lg">
          <i className="fas fa-inbox text-neutral-600 text-5xl mb-6"></i>
          <h3 className="text-2xl font-bold text-neutral-50 mb-2">No Feedback to Review</h3>
          <p className="text-neutral-400">There are no plans with regional feedback awaiting your review.</p>
        </div>
      ) : (
        <div className="bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-800 border-b border-neutral-700">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-300 uppercase tracking-wider">Plan ID</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Version</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Fiscal Year</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Regions Submitted</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-neutral-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-700">
                {plans.map(plan => {
                  const submitted = plan.regionalFeedback.filter(f => f.status === 'SUBMITTED').length;
                  return (
                    <tr key={plan.id} className="hover:bg-neutral-700/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-neutral-50">{plan.id}</td>
                      <td className="px-6 py-4 text-center text-neutral-300">v{plan.version}</td>
                      <td className="px-6 py-4 text-center text-neutral-300">{plan.fiscalYear}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge 
                          status={`${submitted}/${plan.regionalFeedback.length}`} 
                          className="info" 
                        />
                      </td>
                      <td className="px-6 py-4 text-center text-neutral-300">{plan.status.replace(/_/g, ' ')}</td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition-colors"
                          onClick={() => handleSelectPlan(plan)}
                        >
                          <i className="fas fa-eye mr-1"></i>Review & Amend
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackReviewView;
