import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import CreateAnnualPlanModal from '../modals/CreateAnnualPlanModal';
import ConfigurationManagementView from './ConfigurationManagementView';
import FeedbackReviewView from './FeedbackReviewView';
import ConfigurationView from './ConfigurationView';
import RiskEngineView from './RiskEngineView';
import { loadData } from '../../utils/data';
import { submitPlanToDirector, getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';

function AuditPlanningView({ currentView }) {
  const [plans, setPlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [detailView, setDetailView] = useState(null);
  const taxpayerPool = loadData().taxpayerPool;

  const loadPlans = () => {
    const data = loadData();
    setPlans(data.plans || []);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  // Handle sidebar navigation
  useEffect(() => {
    if (currentView === 'create-plan') {
      setSelectedPlan(null);
      setShowModal(true);
    } else if (currentView === 'feedback-review') {
      setDetailView(null);
      setSelectedPlan(null);
    } else if (currentView === 'my-plans' || currentView === 'plans') {
      setDetailView(null);
      setSelectedPlan(null);
    } else if (currentView === 'revisions') {
      setDetailView(null);
      setSelectedPlan(null);
    } else if (currentView === 'dashboard') {
      setDetailView(null);
      setSelectedPlan(null);
    } else if (currentView === 'risk-engine') {
      setDetailView(null);
      setSelectedPlan(null);
    }
  }, [currentView]);

  const handleSubmitToDirector = (planId) => {
    if (window.confirm('Submit this plan to Director for review?')) {
      if (submitPlanToDirector(planId)) {
        alert('Plan submitted successfully!');
        loadPlans();
      } else {
        alert('Cannot submit. Plan must be in DRAFT or REVISION_REQUESTED status.');
      }
    }
  };

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleViewDetails = (plan) => {
    setSelectedPlan(plan);
    setDetailView('details');
  };

  const handleViewMORAnalysis = (plan) => {
    setSelectedPlan(plan);
    setDetailView('mor-analysis');
  };

  const handleViewRegionalBreakdown = (plan) => {
    setSelectedPlan(plan);
    setDetailView('regional-breakdown');
  };

  const stats = {
    draft: plans.filter(p => p.status === 'DRAFT').length,
    submitted: plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length,
    approved: plans.filter(p => p.status === 'DIRECTOR_APPROVED').length,
    inRevision: plans.filter(p => p.status === 'REVISION_REQUESTED').length,
    finalized: plans.filter(p => p.status === 'FINALIZED').length,
    totalVolume: plans.reduce((sum, p) => sum + (p.totalVolume || 0), 0),
    totalEffort: plans.reduce((sum, p) => sum + (p.totalEffortHours || 0), 0)
  };

  // Render MOR Analysis View
  const renderMORAnalysis = () => {
    if (!selectedPlan) return null;

    const morData = {
      totalCases: selectedPlan.totalVolume,
      totalEffort: selectedPlan.totalEffortHours,
      coverageRate: ((selectedPlan.totalVolume / taxpayerPool.total) * 100).toFixed(2),
      regions: selectedPlan.locations?.length || 0
    };

    const auditTypeAggregation = {};
    selectedPlan.locations?.forEach(loc => {
      auditConfig.auditTypes.forEach((type, i) => {
        if (!auditTypeAggregation[i]) {
          auditTypeAggregation[i] = { count: 0, effort: 0, name: type.name };
        }
        auditTypeAggregation[i].count += loc[`type_${i}`] || 0;
        auditTypeAggregation[i].effort += (loc[`type_${i}`] || 0) * type.effortPerCase;
      });
    });

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setDetailView(null)}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-info" onClick={() => handleViewDetails(selectedPlan)}>
              <i className="fas fa-file-alt"></i> Plan Details
            </button>
            <button className="btn btn-primary" onClick={() => handleViewRegionalBreakdown(selectedPlan)}>
              <i className="fas fa-map"></i> Regional Breakdown
            </button>
          </div>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-building"></i> Ministry of Revenue (MOR) - National Allocation Analysis</h2>
          <Badge status={`${selectedPlan.id} (v${selectedPlan.version})`} className="director-approved" />
        </div>

        <div className="cards">
          <Card title="Total Taxpayers" number={taxpayerPool.total.toLocaleString()} icon="fas fa-users" />
          <Card title="Planned Audits" number={morData.totalCases.toLocaleString()} icon="fas fa-clipboard-check" />
          <Card title="Coverage Rate" number={`${morData.coverageRate}%`} icon="fas fa-percentage" />
          <Card title="Total Effort" number={`${morData.totalEffort.toLocaleString()}h`} icon="fas fa-clock" />
          <Card title="Regions Covered" number={morData.regions} icon="fas fa-map-marked-alt" />
          <Card title="Fiscal Year" number={selectedPlan.fiscalYear} icon="fas fa-calendar-alt" />
        </div>

        <div className="section-title"><i className="fas fa-chart-pie"></i> National Audit Distribution by Type</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Total Cases</th>
                <th>% of Total</th>
                <th>Total Effort (hrs)</th>
                <th>% of Effort</th>
                <th>Avg Effort/Case</th>
              </tr>
            </thead>
            <tbody>
              {auditConfig.auditTypes.map((type, i) => (
                <tr key={`type_${i}`}>
                  <td><strong>{type.name}</strong></td>
                  <td>{auditTypeAggregation[i]?.count || 0}</td>
                  <td>{morData.totalCases > 0 ? ((auditTypeAggregation[i]?.count / morData.totalCases) * 100).toFixed(1) : 0}%</td>
                  <td>{auditTypeAggregation[i]?.effort.toLocaleString() || 0}</td>
                  <td>{morData.totalEffort > 0 ? ((auditTypeAggregation[i]?.effort / morData.totalEffort) * 100).toFixed(1) : 0}%</td>
                  <td>{type.effortPerCase}h</td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold', fontSize: '15px' }}>
                <td>TOTAL (MOR)</td>
                <td>{morData.totalCases}</td>
                <td>100%</td>
                <td>{morData.totalEffort.toLocaleString()}</td>
                <td>100%</td>
                <td>{morData.totalCases > 0 ? Math.round(morData.totalEffort / morData.totalCases) : 0}h</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-map-marked"></i> Regional Allocation Overview</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Taxpayer Base</th>
                <th>Allocated Cases</th>
                <th>Coverage %</th>
                <th>Total Effort (hrs)</th>
                <th>% of National Effort</th>
                <th>Available Skills</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlan.locations?.map(loc => (
                <tr key={loc.name}>
                  <td><strong>{loc.name}</strong></td>
                  <td>{loc.taxpayers?.toLocaleString() || 'N/A'}</td>
                  <td>{loc.cases}</td>
                  <td>{loc.taxpayers > 0 ? ((loc.cases / loc.taxpayers) * 100).toFixed(2) : 0}%</td>
                  <td>{loc.totalEffort?.toLocaleString() || 0}</td>
                  <td>{morData.totalEffort > 0 ? ((loc.totalEffort / morData.totalEffort) * 100).toFixed(1) : 0}%</td>
                  <td>{loc.availableSkills}</td>
                  <td>
                    <Badge status={loc.capacityStatus} className={loc.capacityStatus === 'Sufficient' ? 'director-approved' : 'rejected'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-bullseye"></i> Strategic Analysis</div>
        <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="card">
            <div className="info">
              <h3>Efficiency Ratio</h3>
              <div className="number" style={{ fontSize: '18px' }}>
                {morData.totalEffort > 0 ? (morData.totalCases / (morData.totalEffort / 160)).toFixed(1) : 0} cases/auditor
              </div>
            </div>
            <div className="icon"><i className="fas fa-chart-line"></i></div>
          </div>
          <div className="card">
            <div className="info">
              <h3>Avg Cases/Region</h3>
              <div className="number" style={{ fontSize: '18px' }}>
                {morData.regions > 0 ? Math.round(morData.totalCases / morData.regions) : 0}
              </div>
            </div>
            <div className="icon"><i className="fas fa-map"></i></div>
          </div>
          <div className="card">
            <div className="info">
              <h3>Planning Period</h3>
              <div className="number" style={{ fontSize: '16px' }}>
                {selectedPlan.duration} days
              </div>
            </div>
            <div className="icon"><i className="fas fa-calendar"></i></div>
          </div>
        </div>

        {selectedPlan.tactics && (
          <>
            <div className="section-title"><i className="fas fa-bullseye"></i> National Audit Strategy</div>
            <div style={{ background: '#f0f7ff', color: '#0c4a6e', padding: '16px', borderRadius: '8px', border: '1px solid #4fc3f7' }}>
              <p style={{ color: '#0c4a6e', margin: 0, lineHeight: '1.6' }}>{selectedPlan.tactics}</p>
            </div>
          </>
        )}
      </div>
    );
  };

  // Render Regional Breakdown View
  const renderRegionalBreakdown = () => {
    if (!selectedPlan) return null;

    return (
      <div>
        <div className="action-bar">
          <button className="btn btn-outline" onClick={() => setDetailView(null)}>
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-primary" onClick={() => handleViewMORAnalysis(selectedPlan)}>
              <i className="fas fa-building"></i> MOR Analysis
            </button>
            <button className="btn btn-info" onClick={() => handleViewDetails(selectedPlan)}>
              <i className="fas fa-file-alt"></i> Plan Details
            </button>
          </div>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-map-marked-alt"></i> Detailed Regional Breakdown</h2>
          <Badge status={`${selectedPlan.id} (v${selectedPlan.version})`} className="director-approved" />
        </div>

        {selectedPlan.locations?.map(loc => {
          const coverageRate = loc.taxpayers > 0 ? ((loc.cases / loc.taxpayers) * 100).toFixed(2) : 0;
          const avgEffortPerCase = loc.cases > 0 ? Math.round(loc.totalEffort / loc.cases) : 0;
          
          return (
            <div key={loc.name} style={{ marginBottom: '32px' }}>
              <div className="section-title">
                <i className="fas fa-map-pin"></i> {loc.name} Region
              </div>
              
              <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                <Card title="Taxpayer Base" number={loc.taxpayers?.toLocaleString()} icon="fas fa-users" />
                <Card title="Total Cases" number={loc.cases} icon="fas fa-clipboard-list" />
                <Card title="Coverage Rate" number={`${coverageRate}%`} icon="fas fa-percentage" />
                <Card title="Total Effort" number={`${loc.totalEffort}h`} icon="fas fa-clock" />
                <Card title="Avg Effort" number={`${avgEffortPerCase}h/case`} icon="fas fa-chart-bar" />
                <Card title="Available Skills" number={loc.availableSkills} icon="fas fa-users-cog" />
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Audit Type</th>
                      <th>Cases</th>
                      <th>% of Region</th>
                      <th>Effort/Case</th>
                      <th>Total Effort</th>
                      <th>% of Region Effort</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Desk Audit</strong></td>
                      <td>{loc.desk}</td>
                      <td>{loc.cases > 0 ? ((loc.desk / loc.cases) * 100).toFixed(1) : 0}%</td>
                      <td>40h</td>
                      <td>{loc.desk * 40}h</td>
                      <td>{loc.totalEffort > 0 ? (((loc.desk * 40) / loc.totalEffort) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td><strong>Field Audit</strong></td>
                      <td>{loc.field}</td>
                      <td>{loc.cases > 0 ? ((loc.field / loc.cases) * 100).toFixed(1) : 0}%</td>
                      <td>120h</td>
                      <td>{loc.field * 120}h</td>
                      <td>{loc.totalEffort > 0 ? (((loc.field * 120) / loc.totalEffort) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td><strong>Joint Audit</strong></td>
                      <td>{loc.joint}</td>
                      <td>{loc.cases > 0 ? ((loc.joint / loc.cases) * 100).toFixed(1) : 0}%</td>
                      <td>160h</td>
                      <td>{loc.joint * 160}h</td>
                      <td>{loc.totalEffort > 0 ? (((loc.joint * 160) / loc.totalEffort) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td><strong>Transfer Pricing</strong></td>
                      <td>{loc.tp}</td>
                      <td>{loc.cases > 0 ? ((loc.tp / loc.cases) * 100).toFixed(1) : 0}%</td>
                      <td>80h</td>
                      <td>{loc.tp * 80}h</td>
                      <td>{loc.totalEffort > 0 ? (((loc.tp * 80) / loc.totalEffort) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td><strong>Comprehensive</strong></td>
                      <td>{loc.comprehensive}</td>
                      <td>{loc.cases > 0 ? ((loc.comprehensive / loc.cases) * 100).toFixed(1) : 0}%</td>
                      <td>200h</td>
                      <td>{loc.comprehensive * 200}h</td>
                      <td>{loc.totalEffort > 0 ? (((loc.comprehensive * 200) / loc.totalEffort) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                      <td>{loc.name} TOTAL</td>
                      <td>{loc.cases}</td>
                      <td>100%</td>
                      <td>-</td>
                      <td>{loc.totalEffort}h</td>
                      <td>100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ background: loc.capacityStatus === 'Sufficient' ? '#1a3a1a' : '#3a1a1a', padding: '12px', borderRadius: '8px', marginTop: '12px' }}>
                <strong>
                  <i className={`fas ${loc.capacityStatus === 'Sufficient' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i> 
                  {' '}Capacity Status: {loc.capacityStatus}
                </strong>
                <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '14px' }}>
                  Available Skills: {loc.availableSkills} | Required: {Math.ceil(loc.totalEffort / 2000)} | 
                  {loc.capacityStatus === 'Sufficient' ? ' Capacity is adequate for planned audits.' : ' Additional resources may be needed.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render Plan Details View
  const renderPlanDetails = () => {
    if (!selectedPlan) return null;
    return (
      <PlanDetailsView 
        plan={selectedPlan}
        onBack={() => setDetailView(null)}
      />
    );
  };

  // Render Actions based on plan status
  const renderActions = (plan) => {
    if (plan.status === 'DRAFT' || plan.status === 'REVISION_REQUESTED') {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-info" onClick={() => handleViewMORAnalysis(plan)}>
            <i className="fas fa-chart-pie"></i> MOR Analysis
          </button>
          <button className="btn btn-sm btn-warning" onClick={() => handleEditPlan(plan)}>
            <i className="fas fa-edit"></i> Edit
          </button>
          <button className="btn btn-sm btn-primary" onClick={() => handleSubmitToDirector(plan.id)}>
            <i className="fas fa-paper-plane"></i> Submit
          </button>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-info" onClick={() => handleViewMORAnalysis(plan)}>
            <i className="fas fa-chart-pie"></i> MOR Analysis
          </button>
          <Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} />
        </div>
      );
    }
  };

  // Main Dashboard View - Filter based on currentView
  const renderDashboard = () => {
    let displayPlans = plans;
    
    // Filter based on current view
    if (currentView === 'revisions') {
      displayPlans = plans.filter(p => p.status === 'REVISION_REQUESTED');
    } else if (currentView === 'my-plans') {
      displayPlans = plans.filter(p => ['DRAFT', 'REVISION_REQUESTED', 'SUBMITTED_TO_DIRECTOR'].includes(p.status));
    }

    return (
      <div>
        <div className="cards">
          <Card title="Draft Plans" number={stats.draft} icon="fas fa-file-alt" />
          <Card title="Under Review" number={stats.submitted} icon="fas fa-hourglass-half" />
          <Card title="Approved" number={stats.approved} icon="fas fa-check-circle" />
          <Card title="In Revision" number={stats.inRevision} icon="fas fa-redo" />
          <Card title="Finalized" number={stats.finalized} icon="fas fa-flag-checkered" />
          <Card title="Total Cases" number={stats.totalVolume} icon="fas fa-calculator" />
          <Card title="Total Effort" number={`${stats.totalEffort}h`} icon="fas fa-clock" />
        </div>

        <div className="action-bar">
          <div></div>
          <button className="btn btn-primary" onClick={() => {setSelectedPlan(null); setShowModal(true);}}>
            <i className="fas fa-plus-circle"></i> Create New Audit Plan
          </button>
        </div>

        <div className="section-title">
          <i className="fas fa-list"></i> 
          {currentView === 'revisions' ? 'Plans in Revision' : 'Audit Plans'}
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Version</th>
                <th>Fiscal Year</th>
                <th>Period</th>
                <th>Total Cases</th>
                <th>Effort (hrs)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayPlans.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
                  <br />{currentView === 'revisions' ? 'No plans in revision.' : 'No audit plans yet. Create your first plan to get started.'}
                </td></tr>
              ) : (
                displayPlans.map(plan => (
                  <tr key={plan.id}>
                    <td><strong>{plan.id}</strong></td>
                    <td>v{plan.version}</td>
                    <td>{plan.fiscalYear}</td>
                    <td>{plan.startDate} to {plan.endDate}</td>
                    <td>{plan.totalVolume}</td>
                    <td>{plan.totalEffortHours}</td>
                    <td>
                      <Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} />
                    </td>
                    <td>{renderActions(plan)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <CreateAnnualPlanModal 
            onClose={() => { 
              setShowModal(false); 
              setSelectedPlan(null);
              loadPlans(); 
            }} 
          />
        )}
      </div>
    );
  };

  // Determine what to render
  if (detailView === 'mor-analysis') {
    return renderMORAnalysis();
  }

  if (detailView === 'regional-breakdown') {
    return renderRegionalBreakdown();
  }

  if (currentView === 'feedback-review') {
    return <FeedbackReviewView currentView={currentView} />;
  }

  if (currentView === 'configuration') {
    return <ConfigurationManagementView />;
  }

  if (currentView === 'risk-engine') {
    return <RiskEngineView userRole="audit_team" />;
  }

  if (detailView === 'details') {
    return renderPlanDetails();
  }

  return renderDashboard();
}

export default AuditPlanningView;
