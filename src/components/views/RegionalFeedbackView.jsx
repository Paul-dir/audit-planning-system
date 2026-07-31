import React, { useState, useEffect } from 'react';
import { getDisplayRegionName, denormalizeRegionName } from '../../utils/regionNormalizer';
import Card from '../Card';
import Badge from '../Badge';
import RiskEngineView from './RiskEngineView';
import RegionalPlanReviewView from './RegionalPlanReviewView';
import TaxCenterAllocationView from './TaxCenterAllocationView';
import TaxCenterFeedbackCollectionView from './TaxCenterFeedbackCollectionView';
import TaxCenterFeedbackReviewView from './TaxCenterFeedbackReviewView';
import RegionalFeedbackSubmissionView from './RegionalFeedbackSubmissionView';
import { loadData, saveData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';
import planService from '../../services/planService';

/**
 * RegionalFeedbackView - Regional Director Feedback Management
 * With Plan Selection at Each View - allows selection of which plan to work with at any point.
 * Provides access to plan review, tax center allocation, feedback collection, and risk analysis.
 * 
 * @component
 * @returns {React.ReactElement} Regional feedback management interface
 */

function RegionalFeedbackView({ currentView }) {
  const { assignedRegion, userRole, selectedRegion: contextSelectedRegion, setSelectedRegion: setContextRegion } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's assigned region from auth context (auto-loaded from login)
  // Falls back to context, then assignedRegion, then localStorage
  // ✅ CRITICAL: Must normalize to lowercase_underscore for data lookups
  let rawRegion = userInfo?.orgContext?.assignedRegion || contextSelectedRegion || assignedRegion || localStorage.getItem('user_assigned_region') || 'oromia';
  const selectedRegion = denormalizeRegionName(rawRegion);
  const [viewMode, setViewMode] = useState('list');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanStatus, setSelectedPlanStatus] = useState(null);

  // All available regions
  const regions = ['Addis Ababa', 'Oromia', 'Amhara', 'Sidama', 'Dire Dawa', 'Somali'];

  // Get pending allocations for this region (not yet accepted)
  const getPendingAllocations = () => {
    return plans.filter(plan => 
      plan.regionalAllocations?.some(alloc => 
        alloc.region === selectedRegion && alloc.status === 'PENDING_ACCEPTANCE'
      )
    );
  };

  // Get accepted allocations for this region (already accepted)
  const getAcceptedAllocations = () => {
    return plans.filter(plan => 
      plan.regionalAllocations?.some(alloc => 
        alloc.region === selectedRegion && alloc.status === 'ACCEPTED'
      )
    );
  };

  // Get allocation status for a specific plan
  const getAllocationStatus = (plan) => {
    if (!plan) return 'UNKNOWN';
    const alloc = plan.regionalAllocations?.find(a => a.region === selectedRegion);
    return alloc?.status || 'UNKNOWN';
  };

  // Load plans for current region using Plan Service
  useEffect(() => {
    loadPlansUsingService();
  }, [selectedRegion]);

  /**
   * Load plans using PlanService (API-first, with fallback to local data)
   * ✅ Uses dynamic status checking via planService.isReadyForRegionalFeedback()
   */
  const loadPlansUsingService = () => {
    const data = loadData();
    
    // Filter plans that match ALL three conditions:
    // 1. Have regional allocation for this region
    // 2. Were explicitly sent to this region by Director
    // 3. Are ready for regional feedback (dynamic check via planService)
    const regionPlans = data.plans.filter(p => {
      const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
      const wasSentHere = p.sentToRegions && p.sentToRegions.includes(selectedRegion);
      
      // ✅ DYNAMIC STATUS CHECK using PlanService
      // NOT hardcoded - uses planService.isReadyForRegionalFeedback()
      const isReady = planService.isReadyForRegionalFeedback(p);
      
      const matches = hasAllocation && wasSentHere && isReady;
      
      if (!matches && hasAllocation) {
        console.log(`Plan ${p.id}: Has allocation ✓, Sent to ${selectedRegion}: ${wasSentHere}, Ready for feedback: ${isReady} (status: ${p.status})`);
      }
      
      return matches;
    });
    
    console.log('✅ Plans ready for feedback:', regionPlans.length, 'for', selectedRegion);
    setPlans(regionPlans);

    // Auto-select first plan
    if (regionPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(regionPlans[0].id);
    }
  };

  // Update selected plan status when plan selection changes
  useEffect(() => {
    if (selectedPlan && plans.length > 0) {
      const plan = plans.find(p => p.id === selectedPlan);
      setSelectedPlanStatus(getAllocationStatus(plan));
    }
  }, [selectedPlan, plans, selectedRegion]);

  useEffect(() => {
    // Ensure context is updated with selected region
    if (selectedRegion && selectedRegion !== contextSelectedRegion) {
      setContextRegion(selectedRegion);
    }
  }, [selectedRegion, contextSelectedRegion, setContextRegion]);

  useEffect(() => {
    if (currentView === 'risk-engine') {
      setViewMode('risk-engine');
    } else if (currentView === 'review-plan') {
      setViewMode('plan');
    } else if (currentView === 'allocation-dashboard') {
      setViewMode('allocation');
    } else if (currentView === 'pending-reviews') {
      setViewMode('feedback-collection');
    } else if (currentView === 'tax-center-feedback') {
      setViewMode('feedback-review');
    } else if (currentView === 'submit-regional-feedback') {
      setViewMode('submit-regional-feedback');
    } else {
      setViewMode('list');
    }
  }, [currentView]);

  if (viewMode === 'allocation') {
    return <TaxCenterAllocationView currentView={currentView} selectedPlan={selectedPlan} plans={plans} onPlanChange={setSelectedPlan} />;
  }

  if (viewMode === 'plan') {
    return <RegionalPlanReviewView currentView={currentView} selectedPlan={selectedPlan} plans={plans} onPlanChange={setSelectedPlan} />;
  }

  if (viewMode === 'feedback-collection') {
    return <TaxCenterFeedbackCollectionView currentView={currentView} selectedPlan={selectedPlan} plans={plans} onPlanChange={setSelectedPlan} />;
  }

  if (viewMode === 'feedback-review') {
    return <TaxCenterFeedbackReviewView currentView={currentView} selectedPlan={selectedPlan} plans={plans} onPlanChange={setSelectedPlan} />;
  }

  if (viewMode === 'submit-regional-feedback') {
    return <RegionalFeedbackSubmissionView currentView={currentView} selectedPlan={selectedPlan} plans={plans} onPlanChange={setSelectedPlan} />;
  }

  if (viewMode === 'risk-engine') {
    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setViewMode('list')}>
            <i className="fas fa-arrow-left"></i> Back to Menu
          </button>
        </div>
        <RiskEngineView userRole={userRole} selectedRegion={selectedRegion} />
      </div>
    );
  }

  // Main menu view - shows all options for the selected region
  return (
    <div className="min-h-screen bg-ink dark:bg-ink p-8">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-3 items-center">
          <label className="text-sm font-medium text-text-mid dark:text-text-mid">
            <i className="fas fa-map-pin"></i> Region:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              const newRegion = denormalizeRegionName(e.target.value);
              setContextRegion(newRegion);
            }}
            className="px-3 py-2 rounded-lg border border-border dark:border-border bg-ink dark:bg-panel text-text-hi dark:text-text-hi text-sm cursor-pointer"
          >
            {regions.map(region => (
              <option key={region} value={denormalizeRegionName(region)}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {plans.length > 0 && (
          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-text-mid dark:text-text-mid">
              <i className="fas fa-file-alt"></i> Plan:
            </label>
            <select
              value={selectedPlan || ''}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
              }}
              className="px-3 py-2 rounded-lg border-2 border-blue dark:border-blue bg-ink dark:bg-panel text-text-hi dark:text-text-hi text-sm font-medium cursor-pointer min-w-[150px]"
            >
              <option value="">Select a plan...</option>
              {/* Show PENDING allocations first */}
              {getPendingAllocations().length > 0 && (
                <optgroup label="⏳ PENDING ACCEPTANCE">
                  {getPendingAllocations().map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.id} (FY {plan.fiscalYear}) - Pending
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Show ACCEPTED allocations */}
              {getAcceptedAllocations().length > 0 && (
                <optgroup label="✓ ACCEPTED">
                  {getAcceptedAllocations().map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.id} (FY {plan.fiscalYear}) - Accepted
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pl-4 border-l-4 border-gold dark:border-gold my-6">
        <h2 className="text-2xl font-bold"><i className="fas fa-map-pin"></i> Regional Director - {getDisplayRegionName(selectedRegion)}</h2>
        <div className="flex gap-2 items-center ml-auto">
          {selectedPlan && selectedPlanStatus && (
            <>
              <Badge 
                status={selectedPlanStatus === 'PENDING_ACCEPTANCE' ? '⏳ Pending Acceptance' : '✓ Accepted'} 
                className={selectedPlanStatus === 'PENDING_ACCEPTANCE' ? 'pending' : 'director-approved'} 
              />
            </>
          )}
          <Badge status={`${plans.length} Plans Available`} className={selectedPlan ? "director-approved" : "pending"} />
        </div>
      </div>

      <div className="cards">
        <Card 
          title="Region" 
          number={getDisplayRegionName(selectedRegion)} 
          icon="fas fa-map-pin" 
        />
        <Card 
          title="Pending Acceptance" 
          number={getPendingAllocations().length} 
          icon="fas fa-hourglass-half" 
        />
        <Card 
          title="Accepted Plans" 
          number={getAcceptedAllocations().length} 
          icon="fas fa-check-circle" 
        />
        <Card 
          title="Status" 
          number={selectedPlanStatus || "Select Plan"} 
          icon="fas fa-info-circle" 
        />
      </div>

      <div className="section-title mb-6"><i className="fas fa-tasks"></i> Available Actions</div>
      
      {!selectedPlan ? (
        <div className="bg-ink dark:bg-ink border-2 border-gold dark:border-gold rounded-lg p-5 mb-6 text-center">
          <i className="fas fa-info-circle text-2xl text-blue dark:text-blue mb-3 block"></i>
          <h3 className="m-2 text-gold dark:text-gold">Select a Plan to Continue</h3>
          <p className="text-gold dark:text-gold m-2 text-xs">
            Please select a plan from the dropdown above to access regional director functions for {getDisplayRegionName(selectedRegion)}.
          </p>
        </div>
      ) : (
        <div></div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" style={{ opacity: selectedPlan ? 1 : 0.5, pointerEvents: selectedPlan ? 'auto' : 'none' }}>
        {/* Review Plan Button */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue dark:border-blue rounded-lg p-5 text-center">
          <i className="fas fa-clipboard-list text-3xl text-blue dark:text-blue mb-3 block"></i>
          <h3 className="m-2">Review Plan</h3>
          <p className="text-text-mid dark:text-text-mid m-2 text-xs">
            View and review the audit plan from Director
          </p>
          <button 
            className="btn btn-primary mt-3"
            onClick={() => setViewMode('plan')}
          >
            <i className="fas fa-eye"></i> Review
          </button>
        </div>

        {/* Allocate Button */}
        <div className="bg-purple-50 dark:bg-purple-900 border border-purple-600 dark:border-purple-500 rounded-lg p-5 text-center">
          <i className="fas fa-tasks text-3xl text-purple-600 dark:text-purple-400 mb-3 block"></i>
          <h3 className="m-2">Allocate to Tax Centers</h3>
          <p className="text-text-mid dark:text-text-mid m-2 text-xs">
            Distribute audit work to your 3 tax centers
          </p>
          <button 
            className="btn mt-3"
            onClick={() => setViewMode('allocation')}
            style={{ background: '#9c27b0' }}
          >
            <i className="fas fa-share"></i> Allocate
          </button>
        </div>

        {/* Risk Engine Button */}
        <div className="bg-ink dark:bg-panel border border-blue dark:border-blue rounded-lg p-5 text-center">
          <i className="fas fa-chart-line text-3xl text-blue dark:text-blue mb-3 block"></i>
          <h3 className="m-2 text-text-hi dark:text-text-hi">Risk Engine</h3>
          <p className="text-text-mid dark:text-text-mid m-2 text-xs">
            Analyze risk data for your region
          </p>
          <button 
            className="btn mt-3"
            onClick={() => setViewMode('risk-engine')}
            style={{ background: '#4a8fd9' }}
          >
            <i className="fas fa-globe"></i> Analyze
          </button>
        </div>

        {/* Feedback Button */}
        <div className="bg-green-900 dark:bg-green-900 border border-teal dark:border-teal rounded-lg p-5 text-center">
          <i className="fas fa-comments text-3xl text-teal dark:text-teal mb-3 block"></i>
          <h3 className="m-2 text-text-hi dark:text-text-hi">Tax Center Feedback</h3>
          <p className="text-text-mid dark:text-text-mid m-2 text-xs">
            Collect feedback from tax centers
          </p>
          <button 
            className="btn mt-3"
            onClick={() => setViewMode('feedback-collection')}
            style={{ background: '#4caf50' }}
          >
            <i className="fas fa-inbox"></i> Collect
          </button>
        </div>

        {/* Acknowledge Finalized Plan Button */}
        {selectedPlan && (
          <div className="bg-green-50 dark:bg-green-900 border-2 border-teal dark:border-teal rounded-lg p-5 text-center">
            <i className="fas fa-check-double text-3xl text-teal dark:text-teal mb-3 block"></i>
            <h3 className="m-2">Acknowledge & Deploy Plan</h3>
            <p className="text-text-mid dark:text-text-mid m-2 text-xs">
              Confirm receipt and deploy finalized plan to your 3 tax centers
            </p>
            <button 
              className="btn btn-success mt-3"
              onClick={() => {
                const data = loadData();
                const plan = data.plans.find(p => p.id === selectedPlan);
                if (plan && plan.status === 'FINALIZED') {
                  if (!plan.regionalAcknowledgment) {
                    plan.regionalAcknowledgment = {};
                  }
                  plan.regionalAcknowledgment[selectedRegion] = {
                    status: 'ACKNOWLEDGED',
                    region: selectedRegion,
                    acknowledgedDate: new Date().toISOString(),
                    acknowledgedBy: 'Regional Director',
                    deployedToTaxCenters: true,
                    deploymentDate: new Date().toISOString()
                  };

                  // Mark plan as sent to tax centers for this region
                  if (!plan.sentToTaxCenters) {
                    plan.sentToTaxCenters = {};
                  }
                  plan.sentToTaxCenters[selectedRegion] = {
                    status: 'SENT',
                    date: new Date().toISOString(),
                    regions: selectedRegion
                  };

                  // Add to approval history
                  if (!plan.approvalHistory) plan.approvalHistory = [];
                  plan.approvalHistory.push({
                    action: 'DEPLOYED_TO_TAX_CENTERS',
                    by: 'Regional Director',
                    region: selectedRegion,
                    date: new Date().toISOString(),
                    notes: `Finalized plan deployed to tax centers in ${selectedRegion}`,
                    version: plan.version
                  });

                  saveData(data);
                  alert(`✅ ${selectedRegion} acknowledged and deployed plan ${selectedPlan} to tax centers!\n\nTax centers can now view the finalized plan and provide implementation feedback.`);
                } else {
                  alert('Plan must be in FINALIZED status to acknowledge and deploy');
                }
              }}
            >
              <i className="fas fa-share-alt"></i> Acknowledge & Deploy
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 border border-blue dark:border-blue rounded-lg p-4">
        <strong><i className="fas fa-info-circle"></i> Regional Director Workflow</strong>
        <ol className="m-3 ml-5 text-xs leading-relaxed list-decimal">
          <li>Review the annual audit plan from Director</li>
          <li>Allocate audit types to your 3 tax centers</li>
          <li>Tax centers will provide feedback on capacity</li>
          <li>Review feedback and make adjustments if needed</li>
          <li>Submit consolidated feedback back to Director</li>
        </ol>
      </div>
    </div>
  );
}

export default RegionalFeedbackView;
