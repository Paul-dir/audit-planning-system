import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import PlanDetailsView from './PlanDetailsView';
import { loadData, saveData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';
import { useRegional } from '../../context/RegionalContext';

/**
 * ApprovedPlansDeploymentView - Send approved plans to regions
 * Used by both Director (to send) and Regional Directors (to acknowledge)
 */
function ApprovedPlansDeploymentView({ userRole }) {
  const { selectedRegion, assignedRegion } = useRegional();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const userRegion = selectedRegion || assignedRegion;

  useEffect(() => {
    loadPlans();
  }, [userRegion]);

  const loadPlans = () => {
    const data = loadData();
    
    if (userRole === 'director') {
      // Director sees SENIOR_MANAGEMENT_APPROVED plans ready to send
      // Also include old AWAITING_SENIOR_MANAGEMENT_APPROVAL plans (backwards compatibility)
      const directorPlans = data.plans.filter(p => 
        p.status === 'SENIOR_MANAGEMENT_APPROVED' || 
        p.status === 'AWAITING_SENIOR_MANAGEMENT_APPROVAL'
      );
      setPlans(directorPlans);
    } else if (userRole === 'regional') {
      // Regional Directors see FINALIZED plans ready to acknowledge - ONLY for their region
      const regionalPlans = data.plans.filter(p => 
        p.status === 'FINALIZED' &&
        p.regionalAllocation &&
        p.regionalAllocation[userRegion]
      );
      setPlans(regionalPlans);
    }
  };

  const handleDirectorDeploy = (planId) => {
    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    
    if (!plan || (plan.status !== 'SENIOR_MANAGEMENT_APPROVED' && plan.status !== 'AWAITING_SENIOR_MANAGEMENT_APPROVAL')) {
      alert('Plan must be approved by Senior Management');
      return;
    }

    const allRegions = auditConfig.regions.map(r => r.name);
    
    plan.status = 'FINALIZED';
    plan.sentToRegions = allRegions;
    plan.sentToRegionsDate = new Date().toISOString();
    plan.lastModified = new Date().toISOString();
    
    if (!plan.approvalHistory) plan.approvalHistory = [];
    plan.approvalHistory.push({
      action: 'FINALIZED_AND_DEPLOYED',
      by: 'Director',
      date: new Date().toISOString(),
      notes: `Plan finalized and deployed to ${allRegions.length} regions for acknowledgment`,
      version: plan.version
    });
    
    saveData(data);
    alert(`✅ Plan deployed to ${allRegions.length} regions!\n\nRegions: ${allRegions.join(', ')}`);
    setSelectedPlan(null);
    loadPlans();
  };

  const handleRegionalAcknowledge = (planId) => {
    const data = loadData();
    const plan = data.plans.find(p => p.id === planId);
    
    if (!plan || plan.status !== 'FINALIZED') {
      alert('Plan must be FINALIZED');
      return;
    }

    if (!userRegion) {
      alert('Region not assigned. Cannot acknowledge.');
      return;
    }

    if (!plan.regionalAcknowledgment) {
      plan.regionalAcknowledgment = {};
    }

    plan.regionalAcknowledgment[userRegion] = {
      status: 'ACKNOWLEDGED',
      region: userRegion,
      acknowledgedDate: new Date().toISOString(),
      acknowledgedBy: 'Regional Director'
    };

    if (!plan.approvalHistory) plan.approvalHistory = [];
    plan.approvalHistory.push({
      action: 'ACKNOWLEDGED_BY_REGION',
      by: 'Regional Director',
      date: new Date().toISOString(),
      notes: `Plan acknowledged by ${userRegion}`,
      version: plan.version
    });

    saveData(data);
    alert(`✅ ${userRegion} acknowledged the finalized plan`);
    setSelectedPlan(null);
    loadPlans();
  };

  if (selectedPlan) {
    return (
      <>
        <PlanDetailsView 
          plan={selectedPlan}
          onBack={() => setSelectedPlan(null)}
          readOnly={true}
        />
        <div className="action-bar" style={{ marginTop: '20px' }}>
          <div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {userRole === 'director' && selectedPlan.status === 'SENIOR_MANAGEMENT_APPROVED' && (
              <button 
                className="btn btn-success"
                onClick={() => handleDirectorDeploy(selectedPlan.id)}
              >
                <i className="fas fa-paper-plane"></i> Deploy to All Regions
              </button>
            )}
            {userRole === 'regional' && selectedPlan.status === 'FINALIZED' && (
              <button 
                className="btn btn-success"
                onClick={() => handleRegionalAcknowledge(selectedPlan.id)}
              >
                <i className="fas fa-thumbs-up"></i> Acknowledge Receipt
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  const title = userRole === 'director' 
    ? 'Deploy Approved Plans to Regions'
    : `Acknowledge Finalized Plans - ${userRegion || 'Region'}`;
  
  const subtitle = userRole === 'director'
    ? 'Plans approved by Senior Management, ready to deploy to regions'
    : `Finalized plans for ${userRegion || 'your region'} from Director`;

  const stats = {
    pending: plans.length,
    deployed: userRole === 'director' ? 0 : plans.filter(p => p.regionalAcknowledgment).length,
  };

  return (
    <div>
      <div className="detail-header">
        <h2>
          <i className={userRole === 'director' ? 'fas fa-paper-plane' : 'fas fa-check-double'}></i> {title}
        </h2>
        <Badge status={subtitle} className={userRole === 'director' ? 'director-approved' : 'pending'} />
      </div>

      <div className="cards">
        <Card 
          title={userRole === 'director' ? 'Ready to Deploy' : 'Ready to Acknowledge'} 
          number={stats.pending} 
          icon={userRole === 'director' ? 'fas fa-paper-plane' : 'fas fa-check-double'} 
        />
        {userRole === 'regional' && (
          <Card title="Acknowledged" number={stats.deployed} icon="fas fa-check-circle" />
        )}
      </div>

      <div className="section-title">
        <i className={userRole === 'director' ? 'fas fa-envelope' : 'fas fa-inbox'}></i> {userRole === 'director' ? 'Plans for Deployment' : 'Plans for Acknowledgment'}
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>Fiscal Year</th>
              <th>Total Cases</th>
              <th>Version</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />
                  {userRole === 'director' 
                    ? 'No approved plans ready to deploy'
                    : 'No finalized plans to acknowledge'}
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.id}</strong></td>
                  <td>{plan.fiscalYear}</td>
                  <td>{plan.totalVolume}</td>
                  <td>v{plan.version}</td>
                  <td><Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} /></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginTop: '20px', border: '1px solid #1976d2' }}>
        <strong><i className="fas fa-info-circle"></i> {userRole === 'director' ? 'Director Deployment' : 'Regional Acknowledgment'}</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          {userRole === 'director' 
            ? 'Deploy approved plans to all regions for final distribution to tax centers. Plans will be marked as FINALIZED and regions will be able to acknowledge receipt.'
            : 'Acknowledge receipt of finalized plans from Director. This confirms that your region is ready to cascade the plan to audit cases.'}
        </p>
      </div>
    </div>
  );
}

export default ApprovedPlansDeploymentView;
