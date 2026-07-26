import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalPlanSubmissionView - Regional Plan Submission Workflow
 * Regional Director submits finalized plans to tax centers for formal acceptance.
 * This represents the formal handoff from regional to tax center level.
 * 
 * @component
 * @returns {React.ReactElement} Plan submission interface
 */
function RegionalPlanSubmissionView() {
  const { assignedRegion } = useRegional();
  const [selectedRegion, setSelectedRegion] = useState(assignedRegion || 'Oromia');
  
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(true);
  const [allRegions, setAllRegions] = useState([]);
  const [approvedPlans, setApprovedPlans] = useState([]);

  useEffect(() => {
    // Load all regions
    const data = loadData();
    const regions = [...new Set(data.plans.flatMap(p => Object.keys(p.regionalAllocation || {})))];
    setAllRegions(regions.length > 0 ? regions : ['Oromia', 'SNNPR', 'Addis Ababa', 'Amhara', 'Tigray']);
    
    // Load approved plans for all regions
    const approved = data.plans.filter(p => p.status === 'FINALIZED');
    setApprovedPlans(approved);
  }, []);

  useEffect(() => {
    loadPlans();
  }, [selectedRegion]);

  const loadPlans = () => {
    const data = loadData();
    
    // Get plans that have been ACKNOWLEDGED by regional director (from Acknowledge Finalized Plans page)
    // These are the plans ready to be formally submitted to tax centers
    const finalized = data.plans.filter(p =>
      p.status === 'FINALIZED' &&
      p.regionalAllocation &&
      p.regionalAllocation[selectedRegion] &&
      p.regionalAcknowledgment &&
      p.regionalAcknowledgment[selectedRegion] &&
      p.regionalAcknowledgment[selectedRegion].status === 'ACKNOWLEDGED'
    );

    setPlans(finalized);
    
    // Initialize submitted status for all plans
    const submittedStatus = {};
    finalized.forEach(plan => {
      submittedStatus[plan.id] = plan.submittedToTaxCenters?.[selectedRegion]?.status === 'SUBMITTED' || false;
    });
    setSubmitted(submittedStatus);
    
    setLoading(false);
  };

  const handleSelectPlan = (planId) => {
    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    setSelectedPlan(planId);
    setPlanDetails(plan);
  };

  const handleSubmitPlanToTaxCenters = () => {
    if (!selectedPlan) {
      alert('Please select a plan first');
      return;
    }

    if (!window.confirm(`Submit ${selectedPlan} to all 3 tax centers in ${selectedRegion}?\n\nTax centers will be notified that an approved plan is available for acceptance.`)) {
      return;
    }

    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan);

    if (planIndex >= 0) {
      const plan = data.plans[planIndex];

      // Initialize submission tracking
      if (!plan.submittedToTaxCenters) {
        plan.submittedToTaxCenters = {};
      }

      // Mark as submitted for this region
      plan.submittedToTaxCenters[selectedRegion] = {
        status: 'SUBMITTED',
        submittedBy: 'Regional Director',
        submittedDate: new Date().toISOString(),
        submittedTo: 'All Tax Centers',
        readyForAcceptance: true
      };

      // Add approval history
      if (!plan.approvalHistory) plan.approvalHistory = [];
      plan.approvalHistory.push({
        action: 'SUBMITTED_TO_TAX_CENTERS',
        by: 'Regional Director',
        region: selectedRegion,
        date: new Date().toISOString(),
        notes: `Finalized plan officially submitted to all tax centers in ${selectedRegion} for acceptance`,
        version: plan.version
      });

      saveData(data);
      setSubmitted(prev => ({ ...prev, [selectedPlan]: true }));
      
      alert(`✅ Plan ${selectedPlan} officially submitted to all tax centers in ${selectedRegion}!\n\nTax centers can now review and accept the plan.`);
      
      loadPlans();
    }
  };

  const getTaxCentersList = () => {
    // Return 3 tax centers for the region
    return [
      `${selectedRegion}-tc1`,
      `${selectedRegion}-tc2`,
      `${selectedRegion}-tc3`
    ];
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

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading finalized plans...</div>;
  }

  return (
    <div className="min-h-screen bg-ink dark:bg-ink p-8">
      <div className="flex items-center gap-3 pl-4 border-l-4 border-gold dark:border-gold mb-6">
        <h2 className="text-2xl font-bold"><i className="fas fa-share-alt"></i> Submit Approved Plan to Tax Centers</h2>
        <Badge status={`${plans.length} Plans Ready`} className="director-approved" />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 text-text-hi dark:text-text-hi p-4 rounded-lg mb-6 border border-blue dark:border-blue">
        <strong><i className="fas fa-info-circle"></i> Regional Director - Formal Submission</strong>
        <p className="text-text-mid dark:text-text-mid mt-2 mb-0 text-xs leading-relaxed">
          Submit finalized plans you've acknowledged to your 3 tax centers. Tax centers will receive the plan and can formally accept it for implementation. This creates an official handoff.
        </p>
      </div>

      {/* Region Selector */}
      <div className="mb-6 flex gap-3 items-center">
        <label className="font-semibold text-xs">Select Region:</label>
        <select 
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedPlan(null);
            setPlanDetails(null);
          }}
          className="px-3 py-2 border border-border dark:border-border rounded-lg bg-panel dark:bg-panel text-text-hi dark:text-text-hi text-xs font-medium cursor-pointer"
        >
          {allRegions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
      </div>

      {/* Approved Plans for this Region */}
      <div className="section-title mb-3">
        <i className="fas fa-check-circle"></i> Approved Plans for {selectedRegion}
      </div>
      {approvedPlans.length === 0 ? (
        <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-4 rounded-lg mb-6 border border-gold dark:border-gold text-center">
          <p className="text-gold dark:text-gold text-xs m-0">No approved plans available yet</p>
        </div>
      ) : (
        <div className="table-container mb-6 w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel dark:bg-panel border-b border-border dark:border-border">
                <th className="text-left p-3 text-text-mid dark:text-text-mid">PLAN ID</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">FISCAL YEAR</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">VERSION</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">STATUS</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid w-32">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {approvedPlans.map(plan => (
                <tr key={plan.id} className="border-b border-border dark:border-border hover:bg-panel dark:hover:bg-panel">
                  <td className="p-3"><strong className="text-text-hi dark:text-text-hi">{plan.id}</strong></td>
                  <td className="p-3 text-text-mid dark:text-text-mid">{plan.fiscalYear}</td>
                  <td className="p-3 text-text-mid dark:text-text-mid">v{plan.version}</td>
                  <td className="p-3">
                    <Badge status="Approved" className="senior-approved" />
                  </td>
                  <td className="p-3">
                    <button
                      className={`btn btn-sm ${selectedPlan === plan.id ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        handleSelectPlan(plan.id);
                      }}
                    >
                      <i className="fas fa-check"></i> {selectedPlan === plan.id ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="cards">
        <Card title="Region" number={selectedRegion} icon="fas fa-map-pin" />
        <Card title="Finalized Plans" number={plans.length} icon="fas fa-flag-checkered" />
        <Card title="Tax Centers" number={getTaxCentersList().length} icon="fas fa-building" />
        <Card title="Status" number={selectedPlan ? 'Selected' : 'Select Plan'} icon="fas fa-check-circle" />
      </div>

      {plans.length === 0 ? (
        <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-5 rounded-lg border-2 border-gold dark:border-gold text-center mb-6">
          <i className="fas fa-info-circle text-2xl text-blue dark:text-blue mb-3 block"></i>
          <h3 className="m-2 text-gold dark:text-gold">No Plans Ready for Submission</h3>
          <p className="text-gold dark:text-gold m-2 text-xs">
            First acknowledge finalized plans using the "Acknowledge Finalized Plans" page, then come here to formally submit them to tax centers.
          </p>
        </div>
      ) : (
        <>
          {/* Plan Selection */}
          <div className="section-title mb-3">
            <i className="fas fa-file-alt"></i> Select Plan to Submit
          </div>
          <div className="table-container mb-6 w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-panel dark:bg-panel border-b border-border dark:border-border">
                  <th className="text-left p-3 text-text-mid dark:text-text-mid">PLAN ID</th>
                  <th className="text-left p-3 text-text-mid dark:text-text-mid">FISCAL YEAR</th>
                  <th className="text-left p-3 text-text-mid dark:text-text-mid">VERSION</th>
                  <th className="text-left p-3 text-text-mid dark:text-text-mid">TOTAL CASES</th>
                  <th className="text-left p-3 text-text-mid dark:text-text-mid">STATUS</th>
                  <th className="text-left p-3 text-text-mid dark:text-text-mid w-40">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => (
                  <tr key={plan.id} className="border-b border-border dark:border-border hover:bg-panel dark:hover:bg-panel" style={{ background: selectedPlan === plan.id ? 'rgba(15, 20, 25, 0.5)' : '' }}>
                    <td className="p-3"><strong className="text-text-hi dark:text-text-hi">{plan.id}</strong></td>
                    <td className="p-3 text-text-mid dark:text-text-mid">{plan.fiscalYear}</td>
                    <td className="p-3 text-text-mid dark:text-text-mid">{plan.version}</td>
                    <td className="p-3 text-text-mid dark:text-text-mid">{plan.totalCases || 0}</td>
                    <td className="p-3">
                      {submitted[plan.id] ? (
                        <Badge status="Submitted" className="senior-approved" />
                      ) : (
                        <Badge status="Ready" className="pending" />
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        className={`btn btn-sm ${selectedPlan === plan.id ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        <i className="fas fa-check"></i> {selectedPlan === plan.id ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plan Details */}
          {selectedPlan && planDetails && (
            <>
              <div className="section-title mb-3">
                <i className="fas fa-clipboard-list"></i> Plan Details - {selectedPlan}
              </div>

              <div className="bg-panel dark:bg-panel p-4 rounded-lg mb-6 border border-border dark:border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Fiscal Year</p>
                    <p className="text-lg font-bold text-text-hi dark:text-text-hi mt-1">
                      {planDetails.fiscalYear}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Total Cases</p>
                    <p className="text-lg font-bold text-text-hi dark:text-text-hi mt-1">
                      {planDetails.totalCases || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Region Allocation</p>
                    <p className="text-lg font-bold text-teal dark:text-teal mt-1">
                      {typeof planDetails.regionalAllocation?.[selectedRegion] === 'object' 
                        ? Object.values(planDetails.regionalAllocation[selectedRegion]).reduce((sum, val) => sum + (parseInt(val) || 0), 0)
                        : (planDetails.regionalAllocation?.[selectedRegion] || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Plan Version</p>
                    <p className="text-lg font-bold text-text-hi dark:text-text-hi mt-1">
                      v{planDetails.version}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Type Allocation */}
              <div className="section-title mb-3">
                <i className="fas fa-chart-bar"></i> Audit Type Allocation for {selectedRegion}
              </div>
              <div className="table-container mb-6 w-full overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-panel dark:bg-panel border-b border-border dark:border-border">
                      <th className="text-left p-3 text-text-mid dark:text-text-mid">AUDIT TYPE</th>
                      <th className="text-center p-3 text-text-mid dark:text-text-mid">ALLOCATED CASES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditTypes.map((auditType, idx) => {
                      const allocated = planDetails.auditTypeAllocation?.[auditType] || 0;
                      return (
                        <tr key={idx} className="border-b border-border dark:border-border">
                          <td className="p-3"><strong className="text-text-hi dark:text-text-hi">{auditTypeLabels[auditType]}</strong></td>
                          <td className="text-center p-3 font-bold text-text-hi dark:text-text-hi">{allocated}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Tax Centers List */}
              <div className="section-title mb-3">
                <i className="fas fa-building"></i> Tax Centers - Will Receive This Plan
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {getTaxCentersList().map(taxCenter => (
                  <div
                    key={taxCenter}
                    className="bg-panel dark:bg-panel p-4 rounded-lg border border-border dark:border-border text-center"
                  >
                    <i className="fas fa-building text-3xl text-teal dark:text-teal mb-3 block"></i>
                    <h4 className="m-2 text-text-hi dark:text-text-hi">{taxCenter}</h4>
                    <p className="text-text-mid dark:text-text-mid m-1 text-xs">
                      Ready to receive plan
                    </p>
                  </div>
                ))}
              </div>

              {/* Submission Status */}
              {submitted[selectedPlan] ? (
                <div className="bg-green-50 dark:bg-green-900 text-teal dark:text-teal p-4 rounded-lg border-2 border-teal dark:border-teal mb-6">
                  <strong className="text-teal dark:text-teal">
                    <i className="fas fa-check-circle"></i> ✅ Already Submitted
                  </strong>
                  <p className="text-teal dark:text-teal mt-2 mb-0 text-xs">
                    This plan has been officially submitted to all tax centers. They can now review and accept it.
                  </p>
                </div>
              ) : (
                <div className="bg-ink dark:bg-ink p-4 rounded-lg border-2 border-gold dark:border-gold mb-6">
                  <strong className="text-gold dark:text-gold">
                    <i className="fas fa-exclamation-triangle"></i> Ready to Submit
                  </strong>
                  <p className="text-gold dark:text-gold mt-2 mb-0 text-xs">
                    Review the plan details above. When ready, submit to all tax centers for formal acceptance.
                  </p>
                </div>
              )}

              {/* Action Bar */}
              <div className="action-bar">
                <div></div>
                {!submitted[selectedPlan] ? (
                  <button
                    className="btn btn-success"
                    onClick={handleSubmitPlanToTaxCenters}
                    style={{ background: '#4caf50' }}
                  >
                    <i className="fas fa-share-alt"></i> Submit Plan to All Tax Centers
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
        </>
      )}

      <div className="bg-blue-50 dark:bg-blue-900 text-text-hi dark:text-text-hi p-4 rounded-lg border border-blue dark:border-blue mt-6">
        <strong><i className="fas fa-info-circle"></i> Workflow Notes</strong>
        <ul className="m-3 ml-5 text-xs leading-relaxed list-decimal">
          <li>Plans must be ACKNOWLEDGED in "Acknowledge Finalized Plans" first</li>
          <li>This page shows only acknowledged plans ready for submission</li>
          <li>This is the formal submission to tax centers</li>
          <li>Tax centers will see the plan in their "Accept Approved Plan" page</li>
          <li>Each tax center must formally accept the plan</li>
          <li>Once all tax centers accept, the plan is locked for execution</li>
          <li>No conflicts - each submission tracked with timestamp</li>
        </ul>
      </div>
    </div>
  );
}

export default RegionalPlanSubmissionView;
