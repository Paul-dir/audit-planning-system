import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import TaxCenterAllocationView from './TaxCenterAllocationView';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalAllocationDashboard - Regional Allocation Metrics Dashboard
 * Shows all plans awaiting tax center allocation for the current region.
 * Similar to how Director sees all plans to approve.
 * 
 * @component
 * @returns {React.ReactElement} Regional allocation dashboard
 */

function RegionalAllocationDashboard() {
  const { assignedRegion, userRole } = useRegional();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [allocatedCount, setAllocatedCount] = useState(0);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const data = loadData();
    // Show plans awaiting allocation for this region
    // Filter: status = AWAITING_REGIONAL_FEEDBACK AND plan was sent to this region
    const regionPlans = data.plans.filter(p => 
      p.status === 'AWAITING_REGIONAL_FEEDBACK' && 
      p.regionFeedbackStatus?.[assignedRegion] !== undefined &&
      !p.taxCenterAllocations?.[assignedRegion] // Not yet allocated to tax centers
    );
    
    // Count already allocated
    const allocCount = data.plans.filter(p =>
      p.taxCenterAllocations?.[assignedRegion] !== undefined
    ).length;
    
    setPlans(regionPlans);
    setAllocatedCount(allocCount);
  };

  // If plan selected, show allocation view
  if (selectedPlan) {
    return (
      <>
        <div className="action-bar mb-5">
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSelectedPlan(null);
              loadPlans();
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>
        <TaxCenterAllocationView 
          selectedPlan={selectedPlan}
          onAllocationComplete={() => {
            setSelectedPlan(null);
            loadPlans();
          }}
        />
      </>
    );
  }

  // Main dashboard showing all plans
  return (
    <div className="min-h-screen bg-ink dark:bg-ink p-8">
      <div className="cards">
        <Card 
          title="Plans Awaiting Allocation" 
          number={plans.length} 
          icon="fas fa-inbox" 
        />
        <Card 
          title="Already Allocated" 
          number={allocatedCount} 
          icon="fas fa-check-circle" 
        />
        <Card 
          title="Your Region" 
          number={assignedRegion} 
          icon="fas fa-map-pin" 
        />
      </div>

      <div className="section-title mb-6">
        <i className="fas fa-tasks"></i> Plans Ready for Tax Center Allocation
      </div>

      {plans.length === 0 ? (
        <div className="bg-green-900 dark:bg-green-900 p-10 rounded-lg text-center border border-teal dark:border-teal">
          <i className="fas fa-check-circle text-6xl text-teal dark:text-teal mb-4 block"></i>
          <h3 className="m-2 text-teal dark:text-teal font-bold">All Plans Allocated!</h3>
          <p className="text-text-mid dark:text-text-mid m-0 text-xs">
            All plans for {assignedRegion} have been allocated to tax centers.
          </p>
        </div>
      ) : (
        <div className="table-container w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-panel dark:bg-panel border-b border-border dark:border-border">
                <th className="text-left p-3 text-text-mid dark:text-text-mid">Plan ID</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">Fiscal Year</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">Total Regional Cases</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">Status</th>
                <th className="text-left p-3 text-text-mid dark:text-text-mid">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const regionData = plan.locations?.find(l => l.name === assignedRegion);
                const cases = regionData?.cases || 0;
                
                return (
                  <tr key={plan.id} className="border-b border-border dark:border-border hover:bg-panel dark:hover:bg-panel">
                    <td className="p-3"><strong className="text-text-hi dark:text-text-hi">{plan.id}</strong></td>
                    <td className="p-3 text-text-mid dark:text-text-mid">{plan.fiscalYear}</td>
                    <td className="p-3 text-text-mid dark:text-text-mid">{cases} cases</td>
                    <td className="p-3">
                      <Badge 
                        status="Ready for Allocation" 
                        className="pending"
                      />
                    </td>
                    <td className="p-3">
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedPlan(plan)}
                      >
                        <i className="fas fa-tasks"></i> Allocate to Tax Centers
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {allocatedCount > 0 && (
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 text-text-hi dark:text-text-hi p-4 rounded-lg border border-blue dark:border-blue">
          <strong><i className="fas fa-info-circle"></i> Allocation History</strong>
          <p className="text-text-mid dark:text-text-mid mt-2 mb-0 text-xs">
            You have already allocated {allocatedCount} plan(s) to tax centers in {assignedRegion}. 
            Tax center feedback will be collected once allocations are sent.
          </p>
        </div>
      )}
    </div>
  );
}

export default RegionalAllocationDashboard;
