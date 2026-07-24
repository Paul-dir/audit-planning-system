import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import TaxCenterAllocationView from './TaxCenterAllocationView';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';

/**
 * RegionalAllocationDashboard
 * Shows all plans awaiting tax center allocation for this region
 * Similar to how Director sees all plans to approve
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
        <div className="action-bar" style={{ marginBottom: '20px' }}>
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
    <div style={{ padding: '24px' }}>
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

      <div className="section-title">
        <i className="fas fa-tasks"></i> Plans Ready for Tax Center Allocation
      </div>

      {plans.length === 0 ? (
        <div style={{
          background: '#1a3a1a',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #388e3c'
        }}>
          <i className="fas fa-check-circle" style={{ fontSize: '48px', color: '#388e3c', marginBottom: '16px', display: 'block' }}></i>
          <h3 style={{ margin: '0 0 8px 0', color: '#388e3c' }}>All Plans Allocated!</h3>
          <p style={{ color: '#0c4a6e', margin: 0, color: '#a0aec0', fontSize: '13px' }}>
            All plans for {assignedRegion} have been allocated to tax centers.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Fiscal Year</th>
                <th>Total Regional Cases</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(plan => {
                const regionData = plan.locations?.find(l => l.name === assignedRegion);
                const cases = regionData?.cases || 0;
                
                return (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>{plan.fiscalYear}</td>
                    <td>{cases} cases</td>
                    <td>
                      <Badge 
                        status="Ready for Allocation" 
                        className="pending"
                      />
                    </td>
                    <td>
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
        <div style={{
          marginTop: '24px',
          background: '#e3f2fd', color: '#0c4a6e',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #1976d2'
        }}>
          <strong><i className="fas fa-info-circle"></i> Allocation History</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
            You have already allocated {allocatedCount} plan(s) to tax centers in {assignedRegion}. 
            Tax center feedback will be collected once allocations are sent.
          </p>
        </div>
      )}
    </div>
  );
}

export default RegionalAllocationDashboard;
