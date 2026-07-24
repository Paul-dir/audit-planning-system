import React, { useState, useEffect } from 'react';
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

/**
 * RegionalFeedbackView - With Plan Selection at Each View
 * Allows selection of which plan to work with at any point
 */

function RegionalFeedbackView({ currentView }) {
  const { assignedRegion, userRole, selectedRegion: contextSelectedRegion, setSelectedRegion: setContextRegion } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's assigned region from auth context (auto-loaded from login)
  // Falls back to context, then assignedRegion, then localStorage
  const selectedRegion = userInfo?.orgContext?.assignedRegion || contextSelectedRegion || assignedRegion || localStorage.getItem('user_assigned_region') || 'Oromia';
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

  // Load plans for current region
  useEffect(() => {
    const data = loadData();
    // Get APPROVED plans that have regional allocations for this region
    // Regional directors can only see plans approved by Director
    const regionPlans = data.plans.filter(p => {
      const hasAllocation = p.regionalAllocation && p.regionalAllocation[selectedRegion];
      const isApproved = p.status === 'APPROVED' || p.status === 'DIRECTOR_APPROVED' || p.status === 'AWAITING_REGIONAL_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED';
      return hasAllocation && isApproved;
    });
    console.log('RegionalFeedbackView: Found', regionPlans.length, 'APPROVED plans for', selectedRegion);
    setPlans(regionPlans);
    
    // Auto-select first plan if not already selected
    if (regionPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(regionPlans[0].id);
    }
  }, [selectedRegion]);

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
    <div style={{ padding: '24px' }}>
      <div className="action-bar" style={{ marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#2d3d4d' }}>
            <i className="fas fa-map-pin"></i> Region:
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setContextRegion(e.target.value);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              cursor: 'pointer',
              background: '#0f1419'
            }}
          >
            {regions.map(region => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>

        {plans.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#2d3d4d' }}>
              <i className="fas fa-file-alt"></i> Plan:
            </label>
            <select
              value={selectedPlan || ''}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '2px solid #1976d2',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                background: '#0f1419',
                minWidth: '150px'
              }}
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

      <div className="detail-header">
        <h2><i className="fas fa-map-pin"></i> Regional Director - {selectedRegion}</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
          number={selectedRegion} 
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

      <div className="section-title"><i className="fas fa-tasks"></i> Available Actions</div>
      
      {!selectedPlan ? (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '20px',
          borderRadius: '8px',
          border: '2px solid #ffb74d',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <i className="fas fa-info-circle" style={{ fontSize: '24px', color: '#4a8fd9', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0', color: '#f57f17' }}>Select a Plan to Continue</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#f57f17' }}>
            Please select a plan from the dropdown above to access regional director functions.
          </p>
        </div>
      ) : (
        <div></div>
      )}
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
        opacity: selectedPlan ? 1 : 0.5,
        pointerEvents: selectedPlan ? 'auto' : 'none'
      }}>
        {/* Review Plan Button */}
        <div style={{
          background: '#e3f2fd', color: '#0c4a6e',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #1976d2',
          textAlign: 'center'
        }}>
          <i className="fas fa-clipboard-list" style={{ fontSize: '32px', color: '#1976d2', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0' }}>Review Plan</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#a0aec0' }}>
            View and review the audit plan from Director
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setViewMode('plan')}
            style={{ marginTop: '12px' }}
          >
            <i className="fas fa-eye"></i> Review
          </button>
        </div>

        {/* Allocate Button */}
        <div style={{
          background: '#f3e5f5',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #9c27b0',
          textAlign: 'center'
        }}>
          <i className="fas fa-tasks" style={{ fontSize: '32px', color: '#9c27b0', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0' }}>Allocate to Tax Centers</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#a0aec0' }}>
            Distribute audit work to your 3 tax centers
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setViewMode('allocation')}
            style={{ marginTop: '12px', background: '#9c27b0' }}
          >
            <i className="fas fa-share"></i> Allocate
          </button>
        </div>

        {/* Risk Engine Button */}
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #4a8fd9',
          textAlign: 'center'
        }}>
          <i className="fas fa-chart-line" style={{ fontSize: '32px', color: '#4a8fd9', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0' }}>Risk Engine</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#a0aec0' }}>
            Analyze risk data for your region
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setViewMode('risk-engine')}
            style={{ marginTop: '12px', background: '#4a8fd9' }}
          >
            <i className="fas fa-globe"></i> Analyze
          </button>
        </div>

        {/* Feedback Button */}
        <div style={{
          background: '#1a3a1a',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #4caf50',
          textAlign: 'center'
        }}>
          <i className="fas fa-comments" style={{ fontSize: '32px', color: '#4caf50', marginBottom: '12px', display: 'block' }}></i>
          <h3 style={{ margin: '8px 0' }}>Tax Center Feedback</h3>
          <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#a0aec0' }}>
            Collect feedback from tax centers
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => setViewMode('feedback-collection')}
            style={{ marginTop: '12px', background: '#4caf50' }}
          >
            <i className="fas fa-inbox"></i> Collect
          </button>
        </div>

        {/* Acknowledge Finalized Plan Button */}
        {selectedPlan && (
          <div style={{
            background: '#c8e6c9', color: '#1b5e20',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #388e3c',
            textAlign: 'center'
          }}>
            <i className="fas fa-check-double" style={{ fontSize: '32px', color: '#388e3c', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '8px 0' }}>Acknowledge & Deploy Plan</h3>
            <p style={{ color: '#0c4a6e', margin: '8px 0', fontSize: '13px', color: '#a0aec0' }}>
              Confirm receipt and deploy finalized plan to your 3 tax centers
            </p>
            <button 
              className="btn btn-success"
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
              style={{ marginTop: '12px' }}
            >
              <i className="fas fa-share-alt"></i> Acknowledge & Deploy
            </button>
          </div>
        )}
      </div>

      <div style={{
        background: '#e3f2fd', color: '#0c4a6e',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #1976d2'
      }}>
        <strong><i className="fas fa-info-circle"></i> Regional Director Workflow</strong>
        <ol style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '13px', lineHeight: '1.8' }}>
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
