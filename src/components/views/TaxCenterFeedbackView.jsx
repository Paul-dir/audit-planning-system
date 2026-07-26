import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * TaxCenterFeedbackView - UNIFIED INTERFACE
 * Uses user's auto-loaded region/tax center from login
 * Shows allocation and collects feedback with Tailwind dark mode support
 */

function TaxCenterFeedbackView() {
  const { assignedTaxCenter, assignedTaxCenterRegion, TAX_CENTER_MAPPING } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  const selectedRegion = userInfo?.orgContext?.assignedRegion || assignedTaxCenterRegion || 'Addis Ababa';
  const selectedTaxCenter = userInfo?.orgContext?.assignedTaxCenter || assignedTaxCenter || null;

  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [allocation, setAllocation] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  
  useEffect(() => {
    console.log('🔄 TaxCenterFeedbackView mounted');
    console.log('Auth context:', { userRegion: userInfo?.orgContext?.assignedRegion, userTaxCenter: userInfo?.orgContext?.assignedTaxCenter });
    console.log('Regional context:', { assignedTaxCenter, assignedTaxCenterRegion });
    console.log('Using:', { selectedRegion, selectedTaxCenter });
    
    if (selectedTaxCenter && selectedRegion) {
      console.log('Loading data for:', { region: selectedRegion, taxCenter: selectedTaxCenter, plan: selectedPlanId });
      setLoading(true);
      loadAllocationData();
      markAllocationAsReceived();
    } else {
      console.log('❌ Missing tax center or region');
      setPlan(null);
      setAllPlans([]);
      setAllocation(null);
      setFeedback({});
      setSubmitted(false);
      setLoading(false);
    }
  }, [selectedTaxCenter, selectedRegion, selectedPlanId]);

  const markAllocationAsReceived = () => {
    if (!selectedTaxCenter || !selectedRegion) return;
    
    const data = loadData();
    const plan = data.plans.find(p => p.id === selectedPlanId || (data.plans.length > 0 && p.id === data.plans[0].id));
    
    if (!plan || !plan.allocationStatus) return;
    
    const regionStatus = plan.allocationStatus[selectedRegion];
    if (!regionStatus) return;
    
    if (!regionStatus.taxCenterReceipts[selectedTaxCenter]) {
      regionStatus.taxCenterReceipts[selectedTaxCenter] = {
        status: 'RECEIVED',
        receivedDate: new Date().toISOString()
      };
      console.log(`✓ Marked ${selectedTaxCenter} as RECEIVED for ${selectedRegion}`);
      saveData(data);
    }
  };

  const loadAllocationData = () => {
    console.log('=== loadAllocationData START ===');
    console.log('Selected:', { taxCenter: selectedTaxCenter, region: selectedRegion, planId: selectedPlanId });
    
    const data = loadData();
    
    if (!data?.plans || data.plans.length === 0) {
      console.log('No plans found in localStorage');
      setLoading(false);
      return;
    }

    console.log('Total plans in storage:', data.plans.length);

    let taxCenterName = selectedTaxCenter;
    let taxCenterRegion = selectedRegion;

    if (!taxCenterName || !taxCenterRegion) {
      console.log('Missing tax center or region');
      setLoading(false);
      return;
    }

    console.log('Searching for plans with allocations for:', { region: taxCenterRegion, taxCenter: taxCenterName });

    const plansWithAllocations = data.plans.filter(p => {
      const hasRegionalAllocation = p.regionalAllocation && p.regionalAllocation[taxCenterRegion];
      
      if (!hasRegionalAllocation) {
        console.log(`Plan ${p.id}: ❌ No regional allocation for ${taxCenterRegion}`);
      } else {
        console.log(`Plan ${p.id}: ✅ HAS regional allocation for ${taxCenterRegion}`);
      }
      return hasRegionalAllocation;
    });

    console.log(`✅ Found ${plansWithAllocations.length} plans with regional allocation for ${taxCenterRegion}`);
    
    setAllPlans(plansWithAllocations);

    let planToLoad = null;

    if (selectedPlanId) {
      planToLoad = plansWithAllocations.find(p => p.id === selectedPlanId);
      console.log('Loading user-selected plan:', selectedPlanId);
    } else if (plansWithAllocations.length > 0) {
      planToLoad = plansWithAllocations[0];
      setSelectedPlanId(planToLoad.id);
      console.log('Auto-selecting first plan:', planToLoad.id);
    }

    if (planToLoad) {
      if (Array.isArray(planToLoad.taxCenterFeedback)) {
        console.log('Converting taxCenterFeedback from array to object');
        planToLoad.taxCenterFeedback = {};
      }

      if (currentPlanId !== planToLoad.id) {
        console.log('🆕 NEW PLAN DETECTED:', planToLoad.id, '(was:', currentPlanId, ')');
        setCurrentPlanId(planToLoad.id);
      }
      
      setPlan(planToLoad);
      
      const regionalAllocations = planToLoad.regionalAllocation[taxCenterRegion];
      
      if (regionalAllocations) {
        setAllocation(regionalAllocations);
        
        console.log('Regional allocation for', taxCenterRegion, ':', regionalAllocations);
        console.log('Tax center', taxCenterName, 'will provide feedback on this regional allocation');
        
        const feedbackPath = `taxCenterFeedback[${taxCenterRegion}][${taxCenterName}]`;
        const existingFeedback = planToLoad.taxCenterFeedback?.[taxCenterRegion]?.[taxCenterName];
        
        console.log('Checking feedback path:', feedbackPath);
        console.log('Existing feedback found:', !!existingFeedback);
        console.log('Existing feedback object:', existingFeedback);
        
        if (existingFeedback) {
          console.log('✅ FEEDBACK EXISTS - Status:', existingFeedback.status);
          console.log('✅ Setting submitted=true (prevents resubmission)');
          
          const displayFeedback = {};
          Object.keys(regionalAllocations).forEach(auditType => {
            if (existingFeedback[auditType] && typeof existingFeedback[auditType] === 'object' && !Array.isArray(existingFeedback[auditType])) {
              displayFeedback[auditType] = {
                allocated: regionalAllocations[auditType],
                canDeliver: existingFeedback[auditType].canDeliver ?? regionalAllocations[auditType],
                notes: existingFeedback[auditType].notes ?? ''
              };
            } else {
              displayFeedback[auditType] = {
                allocated: regionalAllocations[auditType],
                canDeliver: regionalAllocations[auditType],
                notes: ''
              };
            }
          });
          
          console.log('Reconstructed display feedback:', displayFeedback);
          
          setFeedback(displayFeedback);
          setSubmitted(true);
        } else {
          console.log('❌ NO FEEDBACK - Creating empty form');
          console.log('❌ Setting submitted=false (allows submission)');
          const initialFeedback = {};
          Object.keys(regionalAllocations).forEach(auditType => {
            initialFeedback[auditType] = {
              allocated: regionalAllocations[auditType],
              canDeliver: regionalAllocations[auditType],
              notes: ''
            };
          });
          setFeedback(initialFeedback);
          setSubmitted(false);
        }
      }
    } else {
      console.log('No matching plan found for', taxCenterRegion, taxCenterName);
    }

    setLoading(false);
    console.log('=== loadAllocationData END ===');
  };

  const handleFeedbackChange = (auditType, field, value) => {
    setFeedback(prev => ({
      ...prev,
      [auditType]: {
        ...prev[auditType],
        [field]: field === 'canDeliver' ? parseInt(value) || 0 : value
      }
    }));
  };

  const isFeedbackSent = () => {
    if (!plan || !selectedRegion || !selectedTaxCenter) return false;
    const data = loadData();
    const currentPlan = data.plans.find(p => p.id === plan?.id);
    const feedbackItem = currentPlan?.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
    return feedbackItem?.status === 'SUBMITTED' || feedbackItem?.status === 'submitted';
  };

  const getFeedbackStatus = () => {
    if (!plan || !selectedRegion || !selectedTaxCenter) return 'PENDING_SUBMISSION';
    const data = loadData();
    const currentPlan = data.plans.find(p => p.id === plan?.id);
    const feedbackItem = currentPlan?.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
    
    if (!feedbackItem) return 'PENDING_SUBMISSION';
    if (feedbackItem.status === 'SUBMITTED' || feedbackItem.status === 'submitted') return 'SUBMITTED';
    return 'PENDING_SUBMISSION';
  };

  const handleSubmitFeedback = () => {
    if (!plan || !allocation) {
      alert('Error: Allocation data not found');
      return;
    }

    if (!selectedTaxCenter || !selectedRegion) {
      alert('❌ Error: Tax center or region not properly selected.');
      return;
    }

    if (!window.confirm(`Submit feedback for ${selectedTaxCenter}?`)) {
      return;
    }

    const data = loadData();
    console.log('=== SUBMIT START ===');
    console.log('Total plans in storage:', data.plans.length);
    console.log('Looking for plan ID:', plan.id);
    
    const currentPlan = data.plans.find(p => p.id === plan.id);
    
    if (!currentPlan) {
      alert('Error: Could not find plan in storage');
      console.error('Plan not found:', plan.id);
      return;
    }

    console.log('Found plan:', currentPlan.id);

    if (Array.isArray(currentPlan.taxCenterFeedback)) {
      console.log('Converting taxCenterFeedback from array to object');
      currentPlan.taxCenterFeedback = {};
    }

    if (currentPlan.taxCenterFeedback && 
        currentPlan.taxCenterFeedback[selectedRegion] && 
        currentPlan.taxCenterFeedback[selectedRegion][selectedTaxCenter]) {
      alert('⚠️ Feedback has already been sent for ' + selectedTaxCenter + '. Cannot send again.');
      setSubmitted(true);
      return;
    }

    if (!currentPlan.taxCenterFeedback) {
      currentPlan.taxCenterFeedback = {};
      console.log('Created taxCenterFeedback object');
    }
    if (!currentPlan.taxCenterFeedback[selectedRegion]) {
      currentPlan.taxCenterFeedback[selectedRegion] = {};
      console.log('Created region entry:', selectedRegion);
    }

    const feedbackObject = {};
    
    Object.keys(feedback).forEach(auditType => {
      feedbackObject[auditType] = {
        allocated: feedback[auditType].allocated,
        canDeliver: feedback[auditType].canDeliver,
        notes: feedback[auditType].notes || ''
      };
    });
    
    feedbackObject.status = 'SUBMITTED';
    feedbackObject.submittedAt = new Date().toISOString();
    feedbackObject.submittedBy = 'Tax Center Manager';

    currentPlan.taxCenterFeedback[selectedRegion][selectedTaxCenter] = feedbackObject;

    console.log('=== SAVING FEEDBACK ===');
    console.log('Path:', `taxCenterFeedback[${selectedRegion}][${selectedTaxCenter}]`);
    console.log('Feedback object structure:', feedbackObject);
    console.log('Keys in feedback:', Object.keys(feedbackObject));

    saveData(data);
    console.log('Saved to localStorage');
    console.log('Raw data being saved:', JSON.stringify(data.plans[0], null, 2));
    
    const savedData = loadData();
    console.log('=== VERIFY SAVED ===');
    console.log('Total plans after load:', savedData.plans.length);
    console.log('Raw data loaded from storage:', JSON.stringify(savedData.plans[0], null, 2));
    
    const savedPlan = savedData.plans.find(p => p.id === plan.id);
    console.log('Found plan after reload:', !!savedPlan);
    
    const verifySaved = savedPlan?.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
    console.log('Saved feedback:', verifySaved);
    console.log('Keys in saved:', verifySaved ? Object.keys(verifySaved) : 'N/A');

    setSubmitted(true);
    setFeedback(feedbackObject);
    setPlan(currentPlan);

    alert('✅ Feedback sent to ' + selectedRegion + ' Regional Director!');
  };

  if (loading) {
    return <div className="p-6">Loading allocation data...</div>;
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

  const getTotalAllocated = () => {
    if (!allocation) return 0;
    return Object.values(allocation).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const getTotalFeedback = () => {
    return Object.values(feedback).reduce((sum, item) => sum + (parseInt(item.canDeliver) || 0), 0);
  };

  return (
    <div className="p-6">
      {/* Display Current Region & Tax Center (Auto-loaded from login) */}
      <div className="bg-ink dark:bg-ink p-4 rounded mb-6 border border-border dark:border-border flex gap-6">
        <div>
          <span className="text-xs font-semibold text-text-mid dark:text-text-mid">
            <i className="fas fa-map-pin"></i> Region
          </span>
          <div className="text-sm font-semibold text-teal dark:text-teal mt-1">
            {selectedRegion}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold text-text-mid dark:text-text-mid">
            <i className="fas fa-building"></i> Tax Center
          </span>
          <div className="text-sm font-semibold text-teal dark:text-teal mt-1">
            {selectedTaxCenter}
          </div>
        </div>
      </div>

      {/* Plan Selector - Show when region and tax center are selected AND plans exist */}
      {selectedRegion && selectedTaxCenter && allPlans && allPlans.length > 0 && (
        <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-4 rounded mb-6 border-2 border-blue dark:border-blue flex gap-4 items-center flex-wrap shadow-lg">
          <label className="text-sm font-bold text-blue dark:text-blue whitespace-nowrap">
            <i className="fas fa-file-alt"></i> CHOOSE PLAN:
          </label>
          <select
            value={selectedPlanId || ''}
            onChange={(e) => {
              const newPlanId = e.target.value;
              console.log('Tax center feedback plan selector changed to:', newPlanId);
              setSelectedPlanId(newPlanId);
            }}
            className="px-4 py-3 rounded border-2 border-blue dark:border-blue text-sm font-bold cursor-pointer bg-ink dark:bg-ink min-w-60 text-text-primary dark:text-text-primary"
          >
            <option value="">-- Select a plan --</option>
            {allPlans.map(planOption => {
              const isFeedbackSubmitted = planOption.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
              return (
                <option key={planOption.id} value={planOption.id}>
                  {planOption.id} (FY {planOption.fiscalYear}) {isFeedbackSubmitted ? '✓ Submitted' : ''}
                </option>
              );
            })}
          </select>
          <div className="text-xs font-semibold text-danger dark:text-danger">
            {selectedPlanId ? (
              <>
                <div><i className="fas fa-check-circle text-teal dark:text-teal"></i> {selectedPlanId} selected</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-1">Switch to provide feedback on different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {allPlans.length} plan(s) available</div>
                <div className="text-xs text-text-mid dark:text-text-mid mt-1">Select to provide feedback</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* If no plan found, show message */}
      {selectedRegion && selectedTaxCenter && !plan && !loading && (
        <div className="bg-ink dark:bg-ink p-6 rounded text-center border border-gold dark:border-gold">
          <i className="fas fa-inbox text-4xl text-gold dark:text-gold mb-3 block"></i>
          <h3 className="m-0 mb-2 text-gold dark:text-gold">No Plans Allocated</h3>
          <p className="text-text-mid dark:text-text-mid m-0">
            No audit plans have been allocated to {selectedTaxCenter} yet.
          </p>
        </div>
      )}

      {/* Show allocation form only if both selected and data loaded */}
      {selectedRegion && selectedTaxCenter && plan && allocation && (
        <>
        <div className="detail-header">
          <h2><i className="fas fa-building"></i> {selectedTaxCenter}</h2>
          <Badge status={getFeedbackStatus()} 
                 className={getFeedbackStatus() === 'SUBMITTED' ? 'director-approved' : 'pending'} />
        </div>

      <div className="bg-blue/10 dark:bg-blue/10 text-blue dark:text-blue p-4 rounded mb-6 border-l-4 border-blue dark:border-blue">
        <strong className="flex items-center gap-2"><i className="fas fa-inbox"></i> Allocation Received</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 text-xs leading-relaxed">
          Allocation from {selectedRegion} Regional Director. Total: <strong>{getTotalAllocated()}</strong> cases
        </p>
        {getFeedbackStatus() === 'PENDING_SUBMISSION' && (
          <p className="text-gold dark:text-gold mt-2 text-xs font-semibold">
            <i className="fas fa-exclamation-circle"></i> Your feedback is due - please review and submit below
          </p>
        )}
      </div>

      <div className="cards">
        <Card title="Plan ID" number={plan.id} icon="fas fa-id-badge" />
        <Card title="Plan Version" number={plan.version} icon="fas fa-code-branch" />
        <Card title="Total Allocated" number={getTotalAllocated()} icon="fas fa-tasks" />
        <Card title="Region" number={selectedRegion} icon="fas fa-map-pin" />
      </div>

      <div className="section-title mt-6 mb-3">
        <i className="fas fa-chart-bar"></i> Your Allocation by Audit Type
      </div>
      <div className="table-container mb-6">
        <table className="w-full text-xs bg-panel dark:bg-panel">
          <thead>
            <tr className="bg-panel dark:bg-panel">
              <th className="text-left text-blue dark:text-blue p-2">AUDIT TYPE</th>
              <th className="text-center text-blue dark:text-blue p-2">ALLOCATED</th>
              <th className="text-center text-blue dark:text-blue p-2">% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const allocated = allocation[auditType] || 0;
              const total = getTotalAllocated();
              const percentage = total > 0 ? ((allocated / total) * 100).toFixed(1) : 0;
              return (
                <tr key={idx}>
                  <td className="p-2"><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td className="text-center p-2">{allocated}</td>
                  <td className="text-center p-2">{percentage}%</td>
                </tr>
              );
            })}
            <tr className="bg-ink dark:bg-ink font-bold">
              <td className="p-2">TOTAL</td>
              <td className="text-center p-2">{getTotalAllocated()}</td>
              <td className="text-center p-2">100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-4 rounded mb-6 border-l-4 border-gold dark:border-gold">
        <strong className="flex items-center gap-2"><i className="fas fa-comments"></i> Your Response</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 text-xs leading-relaxed">
          Review and submit your capacity feedback.
        </p>
      </div>

      <div className="section-title mb-3">
        <i className="fas fa-edit"></i> Capacity Feedback
      </div>
      <div className="table-container mb-6">
        <table className="w-full text-xs bg-panel dark:bg-panel">
          <thead>
            <tr className="bg-panel dark:bg-panel">
              <th className="text-left text-blue dark:text-blue p-2">AUDIT TYPE</th>
              <th className="text-center text-blue dark:text-blue p-2">ALLOCATED</th>
              <th className="text-center text-blue dark:text-blue p-2">CAN DELIVER</th>
              <th className="text-left text-blue dark:text-blue p-2">NOTES</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => (
              <tr key={idx}>
                <td className="p-2"><strong>{auditTypeLabels[auditType]}</strong></td>
                <td className="text-center p-2 font-bold">
                  {allocation[auditType] || 0}
                </td>
                <td className="text-center p-2">
                  <input
                    type="number"
                    value={feedback[auditType]?.canDeliver || 0}
                    onChange={(e) => handleFeedbackChange(auditType, 'canDeliver', e.target.value)}
                    disabled={submitted}
                    className="w-16 px-2 py-1 border rounded text-center text-sm bg-ink dark:bg-ink text-text-primary dark:text-text-primary disabled:opacity-60"
                    min="0"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={feedback[auditType]?.notes || ''}
                    onChange={(e) => handleFeedbackChange(auditType, 'notes', e.target.value)}
                    disabled={submitted}
                    placeholder="e.g., We can do 10 instead of 15"
                    className="w-full px-2 py-1 border rounded text-xs bg-ink dark:bg-ink text-text-primary dark:text-text-primary disabled:opacity-60"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-ink dark:bg-ink font-bold">
              <td className="p-2">TOTAL</td>
              <td className="text-center p-2">{getTotalAllocated()}</td>
              <td className="text-center p-2">
                {getTotalFeedback()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-panel dark:bg-panel p-4 rounded mb-6 border border-border dark:border-border">
        <h3 className="m-0 mb-3"><i className="fas fa-balance-scale"></i> Capacity Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-text-mid dark:text-text-mid m-0">Total Allocated</p>
            <p className="text-2xl font-bold text-blue dark:text-blue m-0 mt-1">
              {getTotalAllocated()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-mid dark:text-text-mid m-0">You Can Deliver</p>
            <p className="text-2xl font-bold text-blue dark:text-blue m-0 mt-1">
              {getTotalFeedback()}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-mid dark:text-text-mid m-0">Variance</p>
            <p className={`text-2xl font-bold m-0 mt-1 ${getTotalFeedback() === getTotalAllocated() ? 'text-teal dark:text-teal' : 'text-danger dark:text-danger'}`}>
              {getTotalFeedback() - getTotalAllocated()}
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="bg-teal/20 dark:bg-teal/20 text-teal dark:text-teal p-4 rounded text-center border-2 border-teal dark:border-teal mb-6">
          <strong className="flex items-center justify-center gap-2">
            <i className="fas fa-check-circle"></i> ✅ Feedback Submitted
          </strong>
          <p className="text-text-mid dark:text-text-mid m-0 mt-2 text-xs">
            Sent to {selectedRegion} Regional Director.
          </p>
        </div>
      ) : (
        <div className="bg-gold/20 dark:bg-gold/20 p-4 rounded text-center border-2 border-gold dark:border-gold mb-6">
          <strong className="text-gold dark:text-gold flex items-center justify-center gap-2">
            <i className="fas fa-exclamation-triangle"></i> Please review and submit feedback
          </strong>
        </div>
      )}

      <div className="action-bar mt-6">
        <div></div>
        {!submitted ? (
          <button 
            className="btn btn-success"
            onClick={handleSubmitFeedback}
          >
            <i className="fas fa-paper-plane"></i> Submit Feedback
          </button>
        ) : (
          <button 
            className="btn btn-success opacity-60 cursor-not-allowed"
            disabled
          >
            <i className="fas fa-check"></i> Already Submitted
          </button>
        )}
      </div>
      </>
      )}
    </div>
  );
}

export default TaxCenterFeedbackView;
