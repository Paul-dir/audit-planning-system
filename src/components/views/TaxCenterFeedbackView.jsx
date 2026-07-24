import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * TaxCenterFeedbackView - UNIFIED INTERFACE
 * Uses user's auto-loaded region/tax center from login
 * Shows allocation and collects feedback with proper formatting
 */

function TaxCenterFeedbackView() {
  const { assignedTaxCenter, assignedTaxCenterRegion, TAX_CENTER_MAPPING } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's auto-loaded region and tax center from auth context
  const selectedRegion = userInfo?.orgContext?.assignedRegion || assignedTaxCenterRegion || 'Addis Ababa';
  const selectedTaxCenter = userInfo?.orgContext?.assignedTaxCenter || assignedTaxCenter || null;

  const [plan, setPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]); // All plans for this tax center
  const [selectedPlanId, setSelectedPlanId] = useState(null); // Currently selected plan
  const [allocation, setAllocation] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null); // Track current plan to detect changes
  
  useEffect(() => {
    console.log('🔄 TaxCenterFeedbackView mounted');
    console.log('Auth context:', { userRegion: userInfo?.orgContext?.assignedRegion, userTaxCenter: userInfo?.orgContext?.assignedTaxCenter });
    console.log('Regional context:', { assignedTaxCenter, assignedTaxCenterRegion });
    console.log('Using:', { selectedRegion, selectedTaxCenter });
    
    if (selectedTaxCenter && selectedRegion) {
      console.log('Loading data for:', { region: selectedRegion, taxCenter: selectedTaxCenter, plan: selectedPlanId });
      setLoading(true);
      loadAllocationData();
      // NEW: Mark allocation as RECEIVED when tax center views it
      markAllocationAsReceived();
    } else {
      // Reset if either is not selected
      console.log('❌ Missing tax center or region');
      setPlan(null);
      setAllPlans([]);
      setAllocation(null);
      setFeedback({});
      setSubmitted(false);
      setLoading(false);
    }
  }, [selectedTaxCenter, selectedRegion, selectedPlanId]);

  // NEW: Mark allocation status as RECEIVED when tax center views it
  const markAllocationAsReceived = () => {
    if (!selectedTaxCenter || !selectedRegion) return;
    
    const data = loadData();
    const plan = data.plans.find(p => p.id === selectedPlanId || (data.plans.length > 0 && p.id === data.plans[0].id));
    
    if (!plan || !plan.allocationStatus) return;
    
    const regionStatus = plan.allocationStatus[selectedRegion];
    if (!regionStatus) return;
    
    // Mark this tax center as RECEIVED if not already marked
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

    // Find ALL plans that have a regionalAllocation for this region
    // (Same logic as regional directors use - if region has allocation, tax center gets it)
    const plansWithAllocations = data.plans.filter(p => {
      // Check if plan has ANY allocation for this region
      const hasRegionalAllocation = p.regionalAllocation && p.regionalAllocation[taxCenterRegion];
      
      if (!hasRegionalAllocation) {
        console.log(`Plan ${p.id}: ❌ No regional allocation for ${taxCenterRegion}`);
      } else {
        console.log(`Plan ${p.id}: ✅ HAS regional allocation for ${taxCenterRegion}`);
      }
      return hasRegionalAllocation;
    });

    console.log(`✅ Found ${plansWithAllocations.length} plans with regional allocation for ${taxCenterRegion}`);
    
    // ✅ SET THE PLANS LIST FOR THE SELECTOR
    setAllPlans(plansWithAllocations);

    // Determine which plan to load
    let planToLoad = null;

    if (selectedPlanId) {
      // User explicitly selected a plan
      planToLoad = plansWithAllocations.find(p => p.id === selectedPlanId);
      console.log('Loading user-selected plan:', selectedPlanId);
    } else if (plansWithAllocations.length > 0) {
      // Auto-select first plan
      planToLoad = plansWithAllocations[0];
      setSelectedPlanId(planToLoad.id);
      console.log('Auto-selecting first plan:', planToLoad.id);
    }

    if (planToLoad) {
      // FIX: Ensure taxCenterFeedback is an OBJECT, not an array
      if (Array.isArray(planToLoad.taxCenterFeedback)) {
        console.log('Converting taxCenterFeedback from array to object');
        planToLoad.taxCenterFeedback = {};
      }

      // CHECK: If plan ID changed, reset submission state (new plan = fresh start)
      if (currentPlanId !== planToLoad.id) {
        console.log('🆕 NEW PLAN DETECTED:', planToLoad.id, '(was:', currentPlanId, ')');
        setCurrentPlanId(planToLoad.id);
      }
      
      setPlan(planToLoad);
      
      // Use regional allocation for tax center (same logic as regional directors)
      const regionalAllocations = planToLoad.regionalAllocation[taxCenterRegion];
      
      if (regionalAllocations) {
        // All tax centers in this region get the same regional allocation
        // They will report back their capacity for this regional total
        setAllocation(regionalAllocations);
        
        console.log('Regional allocation for', taxCenterRegion, ':', regionalAllocations);
        console.log('Tax center', taxCenterName, 'will provide feedback on this regional allocation');
        
        // CRITICAL: Check if feedback for THIS plan and tax center already exists
        const feedbackPath = `taxCenterFeedback[${taxCenterRegion}][${taxCenterName}]`;
        const existingFeedback = planToLoad.taxCenterFeedback?.[taxCenterRegion]?.[taxCenterName];
        
        console.log('Checking feedback path:', feedbackPath);
        console.log('Existing feedback found:', !!existingFeedback);
        console.log('Existing feedback object:', existingFeedback);
        
        if (existingFeedback) {
          // ANY existing feedback means it was submitted before
          console.log('✅ FEEDBACK EXISTS - Status:', existingFeedback.status);
          console.log('✅ Setting submitted=true (prevents resubmission)');
          
          // Reconstruct feedback for display
          const displayFeedback = {};
          Object.keys(regionalAllocations).forEach(auditType => {
            // Handle both old format (direct object) and new format (nested)
            if (existingFeedback[auditType] && typeof existingFeedback[auditType] === 'object' && !Array.isArray(existingFeedback[auditType])) {
              // New format: nested object with canDeliver and notes
              displayFeedback[auditType] = {
                allocated: regionalAllocations[auditType],
                canDeliver: existingFeedback[auditType].canDeliver ?? regionalAllocations[auditType],
                notes: existingFeedback[auditType].notes ?? ''
              };
            } else {
              // Fallback: use allocated value
              displayFeedback[auditType] = {
                allocated: regionalAllocations[auditType],
                canDeliver: regionalAllocations[auditType],
                notes: ''
              };
            }
          });
          
          console.log('Reconstructed display feedback:', displayFeedback);
          
          setFeedback(displayFeedback);
          setSubmitted(true);  // ← CRITICAL: Set to true so form stays disabled
        } else {
          // No feedback yet for this tax center on this plan - create empty form
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
          setSubmitted(false);  // ← CRITICAL: Set to false so form is editable
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

  // Check if feedback for THIS tax center is already submitted
  const isFeedbackSent = () => {
    if (!plan || !selectedRegion || !selectedTaxCenter) return false;
    const data = loadData();
    const currentPlan = data.plans.find(p => p.id === plan?.id);
    const feedbackItem = currentPlan?.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
    return feedbackItem?.status === 'SUBMITTED' || feedbackItem?.status === 'submitted';
  };

  // Get feedback status display
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

    // Load fresh data from localStorage
    const data = loadData();
    console.log('=== SUBMIT START ===');
    console.log('Total plans in storage:', data.plans.length);
    console.log('Looking for plan ID:', plan.id);
    
    // Find plan by ID (don't rely on index)
    const currentPlan = data.plans.find(p => p.id === plan.id);
    
    if (!currentPlan) {
      alert('Error: Could not find plan in storage');
      console.error('Plan not found:', plan.id);
      return;
    }

    console.log('Found plan:', currentPlan.id);

    // FIX: Ensure taxCenterFeedback is an OBJECT, not an array
    if (Array.isArray(currentPlan.taxCenterFeedback)) {
      console.log('Converting taxCenterFeedback from array to object');
      currentPlan.taxCenterFeedback = {};
    }

    // Check if already submitted for this region/tax center
    if (currentPlan.taxCenterFeedback && 
        currentPlan.taxCenterFeedback[selectedRegion] && 
        currentPlan.taxCenterFeedback[selectedRegion][selectedTaxCenter]) {
      alert('⚠️ Feedback has already been sent for ' + selectedTaxCenter + '. Cannot send again.');
      setSubmitted(true);
      return;
    }

    // Initialize structure
    if (!currentPlan.taxCenterFeedback) {
      currentPlan.taxCenterFeedback = {};
      console.log('Created taxCenterFeedback object');
    }
    if (!currentPlan.taxCenterFeedback[selectedRegion]) {
      currentPlan.taxCenterFeedback[selectedRegion] = {};
      console.log('Created region entry:', selectedRegion);
    }

    // Create feedback object with status - ensure all audit type data is preserved
    const feedbackObject = {};
    
    // Copy all audit type feedback
    Object.keys(feedback).forEach(auditType => {
      feedbackObject[auditType] = {
        allocated: feedback[auditType].allocated,
        canDeliver: feedback[auditType].canDeliver,
        notes: feedback[auditType].notes || ''
      };
    });
    
    // Add submission metadata
    feedbackObject.status = 'SUBMITTED';
    feedbackObject.submittedAt = new Date().toISOString();
    feedbackObject.submittedBy = 'Tax Center Manager';

    // Save to this specific tax center
    currentPlan.taxCenterFeedback[selectedRegion][selectedTaxCenter] = feedbackObject;

    console.log('=== SAVING FEEDBACK ===');
    console.log('Path:', `taxCenterFeedback[${selectedRegion}][${selectedTaxCenter}]`);
    console.log('Feedback object structure:', feedbackObject);
    console.log('Keys in feedback:', Object.keys(feedbackObject));

    // Persist to localStorage
    saveData(data);
    console.log('Saved to localStorage');
    console.log('Raw data being saved:', JSON.stringify(data.plans[0], null, 2));
    
    // Verify immediately by reloading
    const savedData = loadData();
    console.log('=== VERIFY SAVED ===');
    console.log('Total plans after load:', savedData.plans.length);
    console.log('Raw data loaded from storage:', JSON.stringify(savedData.plans[0], null, 2));
    
    const savedPlan = savedData.plans.find(p => p.id === plan.id);
    console.log('Found plan after reload:', !!savedPlan);
    
    const verifySaved = savedPlan?.taxCenterFeedback?.[selectedRegion]?.[selectedTaxCenter];
    console.log('Saved feedback:', verifySaved);
    console.log('Keys in saved:', verifySaved ? Object.keys(verifySaved) : 'N/A');

    // Update state to reflect submission
    setSubmitted(true);
    setFeedback(feedbackObject);
    setPlan(currentPlan);

    alert('✅ Feedback sent to ' + selectedRegion + ' Regional Director!');
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading allocation data...</div>;
  }

  // Show the selector form even if nothing selected yet
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
    <div style={{ padding: '24px' }}>
      {/* Display Current Region & Tax Center (Auto-loaded from login) */}
      <div style={{
        background: '#0f1419',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '24px',
        border: '1px solid #30363d'
      }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#8b949e' }}>
            <i className="fas fa-map-pin"></i> Region
          </span>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#4caf50', marginTop: '4px' }}>
            {selectedRegion}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#8b949e' }}>
            <i className="fas fa-building"></i> Tax Center
          </span>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#4caf50', marginTop: '4px' }}>
            {selectedTaxCenter}
          </div>
        </div>
      </div>

      {/* Plan Selector - Show when region and tax center are selected AND plans exist */}
      {selectedRegion && selectedTaxCenter && allPlans && allPlans.length > 0 && (
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
            <i className="fas fa-file-alt"></i> CHOOSE PLAN:
          </label>
          <select
            value={selectedPlanId || ''}
            onChange={(e) => {
              const newPlanId = e.target.value;
              console.log('Tax center feedback plan selector changed to:', newPlanId);
              setSelectedPlanId(newPlanId);
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
          <div style={{ fontSize: '12px', color: '#d84315', fontWeight: '600' }}>
            {selectedPlanId ? (
              <>
                <div><i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> {selectedPlanId} selected</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Switch to provide feedback on different plan</div>
              </>
            ) : (
              <>
                <div><i className="fas fa-info-circle"></i> {allPlans.length} plan(s) available</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>Select to provide feedback</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* If no plan found, show message */}
      {selectedRegion && selectedTaxCenter && !plan && !loading && (
        <div style={{
          background: '#0f14193cd',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #ffb74d',
          textAlign: 'center'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '32px', color: '#f57f17', marginBottom: '12px' }}></i>
          <h3 style={{ margin: '0 0 8px 0', color: '#f57f17' }}>No Plans Allocated</h3>
          <p style={{ color: '#0c4a6e', margin: 0, color: '#856404' }}>
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

      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2', color: '#0c4a6e' }}>
        <strong style={{ color: '#0c4a6e' }}><i className="fas fa-inbox"></i> Allocation Received</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6', color: '#0c4a6e' }}>
          Allocation from {selectedRegion} Regional Director. Total: <strong>{getTotalAllocated()}</strong> cases
        </p>
        {getFeedbackStatus() === 'PENDING_SUBMISSION' && (
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '12px', color: '#ff9800', fontWeight: '600' }}>
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

      <div className="section-title" style={{ marginTop: '24px', marginBottom: '12px' }}>
        <i className="fas fa-chart-bar"></i> Your Allocation by Audit Type
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ALLOCATED</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>% OF TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => {
              const allocated = allocation[auditType] || 0;
              const total = getTotalAllocated();
              const percentage = total > 0 ? ((allocated / total) * 100).toFixed(1) : 0;
              return (
                <tr key={idx}>
                  <td><strong>{auditTypeLabels[auditType]}</strong></td>
                  <td style={{ textAlign: 'center' }}>{allocated}</td>
                  <td style={{ textAlign: 'center' }}>{percentage}%</td>
                </tr>
              );
            })}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{getTotalAllocated()}</td>
              <td style={{ textAlign: 'center' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #ffb74d' }}>
        <strong><i className="fas fa-comments"></i> Your Response</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Review and submit your capacity feedback.
        </p>
      </div>

      <div className="section-title" style={{ marginBottom: '12px' }}>
        <i className="fas fa-edit"></i> Capacity Feedback
      </div>
      <div className="table-container" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr style={{ background: '#1e2a3a' }}>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>AUDIT TYPE</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>ALLOCATED</th>
              <th style={{ textAlign: 'center', color: '#4a8fd9' }}>CAN DELIVER</th>
              <th style={{ textAlign: 'left', color: '#4a8fd9' }}>NOTES</th>
            </tr>
          </thead>
          <tbody>
            {auditTypes.map((auditType, idx) => (
              <tr key={idx}>
                <td><strong>{auditTypeLabels[auditType]}</strong></td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {allocation[auditType] || 0}
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <input
                    type="number"
                    value={feedback[auditType]?.canDeliver || 0}
                    onChange={(e) => handleFeedbackChange(auditType, 'canDeliver', e.target.value)}
                    disabled={submitted}
                    style={{
                      width: '70px',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontSize: '14px',
                      background: submitted ? '#1a2332' : '#0f1419'
                    }}
                    min="0"
                  />
                </td>
                <td style={{ padding: '8px' }}>
                  <input
                    type="text"
                    value={feedback[auditType]?.notes || ''}
                    onChange={(e) => handleFeedbackChange(auditType, 'notes', e.target.value)}
                    disabled={submitted}
                    placeholder="e.g., We can do 10 instead of 15"
                    style={{
                      width: '100%',
                      padding: '6px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: submitted ? '#1a2332' : '#0f1419'
                    }}
                  />
                </td>
              </tr>
            ))}
            <tr style={{ background: '#0f1419', fontWeight: 'bold' }}>
              <td>TOTAL</td>
              <td style={{ textAlign: 'center' }}>{getTotalAllocated()}</td>
              <td style={{ textAlign: 'center' }}>
                {getTotalFeedback()}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ background: '#1e2a3a', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #2d3d4d' }}>
        <h3><i className="fas fa-balance-scale"></i> Capacity Analysis</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Total Allocated</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
              {getTotalAllocated()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>You Can Deliver</p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a8fd9', margin: '4px 0 0 0' }}>
              {getTotalFeedback()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Variance</p>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: getTotalFeedback() === getTotalAllocated() ? '#4caf50' : '#ff5252',
              margin: '4px 0 0 0'
            }}>
              {getTotalFeedback() - getTotalAllocated()}
            </p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div style={{
          background: '#c8e6c9', color: '#1b5e20',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #388e3c',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            <i className="fas fa-check-circle"></i> ✅ Feedback Submitted
          </strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
            Sent to {selectedRegion} Regional Director.
          </p>
        </div>
      ) : (
        <div style={{
          background: '#0f14193cd',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '24px',
          border: '2px solid #ffb74d',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#f57f17' }}>
            <i className="fas fa-exclamation-triangle"></i> Please review and submit feedback
          </strong>
        </div>
      )}

      <div className="action-bar" style={{ marginTop: '24px' }}>
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
            className="btn btn-success"
            disabled
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
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
