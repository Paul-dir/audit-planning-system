/**
 * DirectorFeedbackReviewView — Review regional feedback on plans.
 * Fully converted to Tailwind CSS with enterprise-grade design.
 */

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
    
    const auditTypes = ['desk_audit', 'field_audit', 'joint_audit', 'transfer_pricing', 'comprehensive', 'issue_audit'];
    const auditTypeLabels = {
      desk_audit: 'Desk Audit',
      field_audit: 'Field Audit',
      joint_audit: 'Joint Audit',
      transfer_pricing: 'Transfer Pricing',
      comprehensive: 'Comprehensive',
      issue_audit: 'Issue Audit'
    };

    const allocatedTotals = {};
    Object.values(regionAllocations).forEach(tcAllocation => {
      auditTypes.forEach(type => {
        allocatedTotals[type] = (allocatedTotals[type] || 0) + (parseInt(tcAllocation[type]) || 0);
      });
    });

    const proposedTotals = feedback?.aggregated || {};
    
    return (
      <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
        <div className="flex items-center gap-3">
          <button 
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-neutral-600"
            onClick={() => setSelectedRegionFeedback(null)}
          >
            <i className="fas fa-arrow-left"></i> Back to Regions
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Region" number={selectedRegionFeedback.region} icon="fas fa-map-marker-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
          <Card 
            title="Feedback Status" 
            number={feedback?.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
            icon="fas fa-flag" 
          />
        </div>

        <div className="border-b border-neutral-700 pb-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-50">
            <i className="fas fa-comment-dots text-primary-400"></i> Regional Feedback from {selectedRegionFeedback.region}
          </h2>
        </div>

        {feedback?.status === 'SUBMITTED' ? (
          <div className="rounded-lg border-l-4 border-success-500 bg-success-900/20 p-4">
            <p className="flex items-center gap-2 font-bold text-success-400">
              <i className="fas fa-check-circle"></i> Feedback Submitted
            </p>
            <p className="mt-2 text-sm leading-relaxed text-success-300/90">
              Regional Director has reviewed tax center feedback and submitted regional capacity adjustments.
            </p>
            <p className="mt-3 text-xs text-neutral-400">
              <i className="fas fa-clock"></i> Submitted: {new Date(feedback.submittedAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-neutral-800 p-4 text-neutral-300">
            <i className="fas fa-hourglass-half"></i> Feedback pending from {selectedRegionFeedback.region}
          </div>
        )}

        <div className="border-b border-neutral-700 pb-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-50">
            <i className="fas fa-table text-primary-400"></i> Allocation & Regional Capacity Adjustment
          </h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-700">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-700 bg-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-primary-400">AUDIT TYPE</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary-400">ALLOCATED TO REGION</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary-400">TAX CENTERS CAN DELIVER</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary-400">REGIONAL OVERRIDE</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary-400">VARIANCE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {auditTypes.map((type, i) => {
                const allocated = allocatedTotals[type] || 0;
                const canDeliver = proposedTotals[type]?.canDeliver || 0;
                const override = proposedTotals[type]?.canDeliver || canDeliver;
                const variance = override - allocated;
                const isNegative = variance < 0;
                
                return (
                  <tr key={type} className={`transition-colors hover:bg-neutral-700/50 ${isNegative ? 'bg-red-950/40' : 'bg-green-950/20'}`}>
                    <td className="px-6 py-4 font-semibold text-neutral-50">{auditTypeLabels[type]}</td>
                    <td className="px-6 py-4 text-center">{allocated}</td>
                    <td className="px-6 py-4 text-center font-bold">{canDeliver}</td>
                    <td className="px-6 py-4 text-center font-bold text-primary-400">{override}</td>
                    <td className={`px-6 py-4 text-center font-bold ${isNegative ? 'text-danger-400' : variance > 0 ? 'text-success-400' : 'text-neutral-400'}`}>
                      {variance > 0 ? '+' : ''}{variance}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-neutral-800 font-bold">
                <td className="px-6 py-4 text-neutral-50">TOTAL</td>
                <td className="px-6 py-4 text-center">
                  {auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)}
                </td>
                <td className="px-6 py-4 text-center">
                  {auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0)}
                </td>
                <td className="px-6 py-4 text-center">
                  {auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0)}
                </td>
                <td className={`px-6 py-4 text-center ${
                  (auditTypes.reduce((sum, type) => sum + (proposedTotals[type]?.canDeliver || 0), 0) - auditTypes.reduce((sum, type) => sum + (allocatedTotals[type] || 0), 0)) < 0 
                    ? 'text-danger-400' : 'text-success-400'
                }`}>
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
      <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
        <div className="flex items-center gap-3">
          <button 
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-50 transition-colors hover:bg-neutral-600"
            onClick={() => setSelectedPlan(null)}
          >
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Plan ID" number={selectedPlan.id} icon="fas fa-file-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
          <Card title="Total Cases" number={selectedPlan.totalVolume} icon="fas fa-list" />
          <Card 
            title="Feedback Received" 
            number={`${submittedCount}/${totalRegions}`} 
            icon="fas fa-check-circle" 
          />
        </div>

        <div className="border-b border-neutral-700 pb-2">
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-50">
            <i className="fas fa-map text-primary-400"></i> Regional Feedback Status
          </h2>
        </div>
        <div className="overflow-hidden rounded-lg border border-neutral-700">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-700 bg-neutral-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-300">Region</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Allocated Cases</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Feedback Status</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Submitted Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {selectedPlan.regionalFeedback?.map((feedback) => {
                const allocation = selectedPlan.locations?.find(l => l.name === feedback.region);
                return (
                  <tr key={feedback.region} className="transition-colors hover:bg-neutral-700/50">
                    <td className="px-6 py-4 font-semibold text-neutral-50">{feedback.region}</td>
                    <td className="px-6 py-4 text-center">{allocation?.cases || 0} cases</td>
                    <td className="px-6 py-4 text-center">
                      <Badge 
                        status={feedback.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
                        className={feedback.status === 'SUBMITTED' ? 'director-approved' : 'pending'} 
                      />
                    </td>
                    <td className="px-6 py-4 text-center text-neutral-300">
                      {feedback.status === 'SUBMITTED' 
                        ? new Date(feedback.submittedDate).toLocaleString()
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      {feedback.status === 'SUBMITTED' && (
                        <button 
                          className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                          onClick={() => setSelectedRegionFeedback(feedback)}
                        >
                          <i className="fas fa-eye"></i> Review
                        </button>
                      )}
                      {feedback.status === 'PENDING' && (
                        <span className="italic text-info-500">Awaiting response</span>
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
            <div className={`rounded-lg border-l-4 p-4 ${
              submittedCount === totalRegions 
                ? 'border-success-500 bg-success-900/20 text-success-400'
                : 'border-warning-500 bg-warning-900/20 text-warning-400'
            }`}>
              <p className="flex items-center gap-2 font-bold">
                <i className={`fas ${submittedCount === totalRegions ? 'fa-check-circle' : 'fa-info-circle'}`}></i>
                {submittedCount === totalRegions ? 'All Regional Feedback Received' : `Partial Feedback: ${submittedCount}/${totalRegions} Regions`}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                {submittedCount === totalRegions 
                  ? 'You can now send this back to the Audit Team to incorporate feedback and make amendments.'
                  : 'Some regions have submitted feedback. You can still send back for planning team review.'}
              </p>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                className="inline-flex items-center gap-2 rounded-lg bg-success-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-success-700"
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
    <div className="space-y-6 p-8 bg-neutral-900 min-h-screen">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card title="Awaiting Feedback" number={stats.awaitingFeedback} icon="fas fa-hourglass-half" />
        <Card title="Feedback Collected" number={stats.feedbackCollected} icon="fas fa-check-circle" />
      </div>

      <div className="border-b border-neutral-700 pb-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-50">
          <i className="fas fa-inbox text-primary-400"></i> Plans Awaiting/Reviewing Regional Feedback
        </h2>
      </div>
      <div className="overflow-hidden rounded-lg border border-neutral-700">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-700 bg-neutral-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-neutral-300">Plan ID</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Fiscal Year</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Total Cases</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Regions</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Feedback Received</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Status</th>
              <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-neutral-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-700">
            {plans.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center">
                  <i className="fas fa-inbox mb-4 block text-4xl text-neutral-600"></i>
                  <span className="text-neutral-400">No plans with regional feedback</span>
                </td>
              </tr>
            ) : (
              plans.map(plan => {
                const submittedCount = plan.regionalFeedback?.filter(f => f.status === 'SUBMITTED').length || 0;
                const totalRegions = plan.regionalFeedback?.length || 0;
                return (
                  <tr key={plan.id} className="transition-colors hover:bg-neutral-700/50">
                    <td className="px-6 py-4 font-semibold text-neutral-50">{plan.id}</td>
                    <td className="px-6 py-4 text-center text-neutral-300">{plan.fiscalYear}</td>
                    <td className="px-6 py-4 text-center text-neutral-300">{plan.totalVolume}</td>
                    <td className="px-6 py-4 text-center text-neutral-300">{totalRegions}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${
                        submittedCount === totalRegions ? 'text-success-500' : 'text-primary-500'
                      }`}>
                        {submittedCount}/{totalRegions}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        className="inline-flex items-center gap-1 rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                        onClick={() => setSelectedPlan(plan)}
                      >
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
