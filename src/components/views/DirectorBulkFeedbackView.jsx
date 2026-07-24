import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import RegionMultiSelector from '../RegionMultiSelector';
import { loadData, saveData } from '../../utils/data';
import { getStatusDisplay, getBadgeClass } from '../../utils/businessLogic';

/**
 * DirectorBulkFeedbackView
 * 
 * Allows Director to:
 * 1. Select a plan
 * 2. Choose which regions to send feedback to
 * 3. Submit feedback to multiple regions at once
 * 
 * This is separate from DirectorFeedbackReviewView which reviews incoming feedback
 */

function DirectorBulkFeedbackView() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = () => {
    const data = loadData();
    // Show plans that are approved or awaiting feedback
    const directablePlans = data.plans.filter(p => 
      p.status === 'DIRECTOR_APPROVED' || p.status === 'AWAITING_REGIONAL_FEEDBACK'
    );
    setPlans(directablePlans);
  };

  const handleSubmitToRegions = (selectedRegions) => {
    if (!selectedPlan) {
      alert('No plan selected');
      return;
    }

    if (!feedbackText.trim()) {
      alert('Please provide feedback/instructions for the regions');
      return;
    }

    if (!window.confirm(`Send feedback to ${selectedRegions.length} region(s)?\n\nRegions: ${selectedRegions.join(', ')}`)) {
      return;
    }

    // Load current data
    const data = loadData();
    const planIndex = data.plans.findIndex(p => p.id === selectedPlan.id);
    
    if (planIndex < 0) {
      alert('Plan not found');
      return;
    }

    // Update plan with feedback sent to regions
    const updatedPlan = { ...data.plans[planIndex] };
    
    if (!updatedPlan.directorFeedbackToRegions) {
      updatedPlan.directorFeedbackToRegions = [];
    }

    // Add feedback for each selected region
    selectedRegions.forEach(region => {
      const existing = updatedPlan.directorFeedbackToRegions.find(f => f.region === region);
      if (existing) {
        existing.feedback = feedbackText;
        existing.sentDate = new Date().toISOString();
        existing.status = 'SENT';
      } else {
        updatedPlan.directorFeedbackToRegions.push({
          region,
          feedback: feedbackText,
          sentDate: new Date().toISOString(),
          status: 'SENT'
        });
      }
    });

    // Update status if all regions received feedback
    if (updatedPlan.directorFeedbackToRegions.length === selectedPlan.locations?.length) {
      updatedPlan.status = 'FEEDBACK_SENT_TO_ALL_REGIONS';
    }

    // Save updated plan
    data.plans[planIndex] = updatedPlan;
    saveData(data);

    // Notify user
    alert(`✓ Feedback sent to ${selectedRegions.length} region(s):\n${selectedRegions.join('\n')}`);

    // Reset
    setSelectedPlan(null);
    setShowRegionSelector(false);
    setFeedbackText('');
    loadPlans();
  };

  // View: Plan Selected - Show Region Selector
  if (selectedPlan && showRegionSelector) {
    return (
      <div style={{ padding: '24px' }}>
        <div className="action-bar" style={{ marginBottom: '24px' }}>
          <button 
            className="btn btn-outline"
            onClick={() => setShowRegionSelector(false)}
          >
            <i className="fas fa-arrow-left"></i> Back
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-envelope"></i> Send Feedback to Regions</h2>
          <Badge status={`Plan ${selectedPlan.id}`} className="pending" />
        </div>

        {/* Plan Summary */}
        <div className="cards">
          <Card 
            title="Plan ID" 
            number={selectedPlan.id} 
            icon="fas fa-file-alt" 
          />
          <Card 
            title="Fiscal Year" 
            number={selectedPlan.fiscalYear} 
            icon="fas fa-calendar-alt" 
          />
          <Card 
            title="Total Cases" 
            number={selectedPlan.totalVolume} 
            icon="fas fa-list" 
          />
          <Card 
            title="Regions" 
            number={selectedPlan.locations?.length || 0} 
            icon="fas fa-map" 
          />
        </div>

        {/* Feedback Instructions */}
        <div style={{
          background: '#e3f2fd', color: '#0c4a6e',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #1976d2'
        }}>
          <strong><i className="fas fa-info-circle"></i> Instructions</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
            Type any feedback, instructions, or questions you want to send to the selected regions. 
            This will be delivered to all selected regional directors.
          </p>
        </div>

        {/* Feedback Text Area */}
        <div className="section-title"><i className="fas fa-keyboard"></i> Your Feedback/Instructions</div>
        <textarea
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          style={{
            width: '100%',
            minHeight: '160px',
            padding: '12px',
            border: '1px solid #2d3d4d',
            borderRadius: '4px',
            fontFamily: 'inherit',
            fontSize: '14px',
            marginBottom: '24px'
          }}
          placeholder="Type your feedback or instructions to send to the regional directors...
Examples:
- Please review this plan and provide feedback on feasibility
- We need your updated capacity assessments
- Regional modifications needed based on risk analysis
- Any questions or concerns about the allocation"
        />

        {/* Region Multi Selector */}
        <RegionMultiSelector
          regions={selectedPlan.locations?.map(l => ({ name: l.name, cases: l.cases })) || []}
          onConfirm={handleSubmitToRegions}
          onCancel={() => setShowRegionSelector(false)}
          selectedCount={0}
          totalCount={selectedPlan.locations?.length || 0}
        />
      </div>
    );
  }

  // View: Plan Selected - Show Confirmation
  if (selectedPlan && !showRegionSelector) {
    const sentTo = selectedPlan.directorFeedbackToRegions?.length || 0;
    const totalRegions = selectedPlan.locations?.length || 0;

    return (
      <div style={{ padding: '24px' }}>
        <div className="action-bar" style={{ marginBottom: '24px' }}>
          <button 
            className="btn btn-outline"
            onClick={() => setSelectedPlan(null)}
          >
            <i className="fas fa-arrow-left"></i> Back to Plans
          </button>
        </div>

        <div className="detail-header">
          <h2><i className="fas fa-file-alt"></i> {selectedPlan.id}</h2>
          <Badge status={getStatusDisplay(selectedPlan.status)} className={getBadgeClass(selectedPlan.status)} />
        </div>

        {/* Summary */}
        <div className="cards">
          <Card 
            title="Fiscal Year" 
            number={selectedPlan.fiscalYear} 
            icon="fas fa-calendar-alt" 
          />
          <Card 
            title="Total Cases" 
            number={selectedPlan.totalVolume} 
            icon="fas fa-list" 
          />
          <Card 
            title="Total Regions" 
            number={totalRegions} 
            icon="fas fa-map" 
          />
          <Card 
            title="Feedback Sent To" 
            number={`${sentTo}/${totalRegions}`} 
            icon="fas fa-envelope" 
          />
        </div>

        {/* Regions Overview */}
        <div className="section-title"><i className="fas fa-map"></i> Regions in This Plan</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Allocated Cases</th>
                <th>Team Size</th>
                <th>Feedback Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedPlan.locations?.map((location, idx) => {
                const feedback = selectedPlan.directorFeedbackToRegions?.find(f => f.region === location.name);
                return (
                  <tr key={idx}>
                    <td><strong>{location.name}</strong></td>
                    <td>{location.cases} cases</td>
                    <td>{location.teamSize} auditors</td>
                    <td>
                      {feedback ? (
                        <Badge status="Feedback Sent" className="director-approved" />
                      ) : (
                        <Badge status="Pending" className="pending" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Send Feedback Button */}
        <div className="action-bar" style={{ marginTop: '24px' }}>
          <div></div>
          <button 
            className="btn btn-success"
            onClick={() => {
              setFeedbackText('');
              setShowRegionSelector(true);
            }}
          >
            <i className="fas fa-envelope"></i> Send Feedback to Regions
          </button>
        </div>
      </div>
    );
  }

  // View: Plan List
  return (
    <div style={{ padding: '24px' }}>
      <div className="cards">
        <Card 
          title="Total Plans" 
          number={plans.length} 
          icon="fas fa-file-alt" 
        />
        <Card 
          title="Awaiting Regional Feedback" 
          number={plans.filter(p => p.status === 'AWAITING_REGIONAL_FEEDBACK').length} 
          icon="fas fa-inbox" 
        />
      </div>

      <div className="section-title"><i className="fas fa-clipboard-list"></i> Plans Ready for Feedback</div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Plan ID</th>
              <th>Fiscal Year</th>
              <th>Total Cases</th>
              <th>Regions</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#ccc' }}></i>
                  <br />No plans ready for feedback
                </td>
              </tr>
            ) : (
              plans.map(plan => (
                <tr key={plan.id}>
                  <td><strong>{plan.id}</strong></td>
                  <td>{plan.fiscalYear}</td>
                  <td>{plan.totalVolume}</td>
                  <td>{plan.locations?.length || 0}</td>
                  <td>
                    <Badge status={getStatusDisplay(plan.status)} className={getBadgeClass(plan.status)} />
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-info"
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <i className="fas fa-envelope"></i> Send Feedback
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DirectorBulkFeedbackView;
