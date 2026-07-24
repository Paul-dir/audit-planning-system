import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { auditConfig } from '../../config/auditConfig';
import { loadData, saveData } from '../../utils/data';

function TaxCenterFeedbackCollectionView({ currentView }) {
  const [allData, setAllData] = useState(null);
  const [taxCenterFeedback, setTaxCenterFeedback] = useState([]);
  const [selectedTaxCenter, setSelectedTaxCenter] = useState(null);
  const [canSubmitToDirector, setCanSubmitToDirector] = useState(false);

  useEffect(() => {
    const data = loadData();
    setAllData(data);
    // Get tax center feedback for this region
    const regionFeedback = (data.taxCenterFeedback || []).filter(f => 
      f.fromRegion === 'Oromia' // Regional director's region
    );
    setTaxCenterFeedback(regionFeedback);
  }, []);

  // Check if all tax centers have provided feedback
  useEffect(() => {
    if (taxCenterFeedback.length > 0) {
      // For this demo, assume we need feedback from at least some tax centers
      const hasAllFeedback = taxCenterFeedback.length >= 2; // Need feedback from at least 2
      setCanSubmitToDirector(hasAllFeedback);
    }
  }, [taxCenterFeedback]);

  const handleSubmitToDirector = () => {
    if (!canSubmitToDirector) {
      alert('Please collect feedback from more tax centers before submitting to Director.');
      return;
    }

    if (!window.confirm('Submit all tax center feedback to Director? This action cannot be undone.')) {
      return;
    }

    // Create submission record
    const submission = {
      id: `regional-submission-${Date.now()}`,
      region: 'Oromia',
      submittedBy: 'Oromia Regional Director',
      timestamp: new Date().toLocaleString(),
      status: 'submitted_to_director',
      taxCenterFeedbackIncluded: taxCenterFeedback.length,
      feedbackDetails: taxCenterFeedback
    };

    // Save to data
    const updatedData = {
      ...allData,
      regionalSubmissions: [...(allData?.regionalSubmissions || []), submission]
    };
    saveData(updatedData);
    setAllData(updatedData);

    alert(`✓ Submitted feedback from ${taxCenterFeedback.length} tax centers to Director!`);
  };

  // View: Feedback Collection
  if (currentView === 'feedback-collection' || currentView === 'pending-reviews') {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2><i className="fas fa-comments"></i> Tax Center Feedback Collection</h2>
          <Badge status={`${taxCenterFeedback.length} Feedback Received`} className={taxCenterFeedback.length > 0 ? 'director-approved' : 'pending'} />
        </div>

        {taxCenterFeedback.length === 0 ? (
          <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '16px', borderRadius: '8px', border: '1px solid #ffb74d', marginBottom: '24px' }}>
            <strong><i className="fas fa-info-circle"></i> No Tax Center Feedback Yet</strong>
            <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
              Tax center managers need to review their allocations and provide feedback. Check back after they submit their feedback.
            </p>
          </div>
        ) : (
          <>
            <div style={{ background: '#1a3a1a', padding: '16px', borderRadius: '8px', border: '1px solid #388e3c', marginBottom: '24px' }}>
              <strong><i className="fas fa-check-circle"></i> Feedback Received from Tax Centers</strong>
              <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
                You have received feedback from {taxCenterFeedback.length} tax center(s). Review below and then submit to Director.
              </p>
            </div>

            <div className="section-title"><i className="fas fa-list"></i> Tax Center Feedback</div>
            {taxCenterFeedback.map((feedback, idx) => (
              <div key={idx} style={{ 
                background: '#f8f9fc', color: '#0c4a6e', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                border: '1px solid #2d3d4d'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0 }}><i className="fas fa-building"></i> {feedback.fromTaxCenter}</h3>
                  <Badge status={feedback.status} className="pending" />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Audit Cases Allocated</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {feedback.allocation?.numberOfAudits || 0}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>Team Required</p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '4px 0 0 0' }}>
                      {feedback.allocation?.teamSize || 0}
                    </p>
                  </div>
                </div>

                <div style={{ background: '#0f1419', padding: '12px', borderRadius: '4px', marginBottom: '12px', border: '1px solid #2d3d4d' }}>
                  <strong style={{ fontSize: '12px', color: '#a0aec0' }}>Feedback:</strong>
                  <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
                    {feedback.feedback}
                  </p>
                </div>

                <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
                  <i className="fas fa-clock"></i> Submitted: {feedback.timestamp}
                </p>
              </div>
            ))}

            <div className="action-bar" style={{ marginTop: '24px' }}>
              <div></div>
              {canSubmitToDirector && (
                <button 
                  className="btn btn-success"
                  onClick={handleSubmitToDirector}
                >
                  <i className="fas fa-paper-plane"></i> Submit All Feedback to Director
                </button>
              )}
              {!canSubmitToDirector && (
                <button 
                  className="btn btn-outline"
                  disabled
                  style={{ opacity: 0.6 }}
                >
                  <i className="fas fa-lock"></i> Need More Feedback
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Default
  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-comments"></i> Tax Center Feedback</h2>
      </div>
      <p>Select a menu item to view tax center feedback collection.</p>
    </div>
  );
}

export default TaxCenterFeedbackCollectionView;
