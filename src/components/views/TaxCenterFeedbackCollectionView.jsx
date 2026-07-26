import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { auditConfig } from '../../config/auditConfig';
import { loadData, saveData } from '../../utils/data';

/**
 * TaxCenterFeedbackCollectionView - Regional Director collects feedback from tax centers
 * Provides interface to submit collected feedback to Director with Tailwind CSS styling
 */
function TaxCenterFeedbackCollectionView({ currentView }) {
  const [allData, setAllData] = useState(null);
  const [taxCenterFeedback, setTaxCenterFeedback] = useState([]);
  const [selectedTaxCenter, setSelectedTaxCenter] = useState(null);
  const [canSubmitToDirector, setCanSubmitToDirector] = useState(false);

  useEffect(() => {
    const data = loadData();
    setAllData(data);
    const regionFeedback = (data.taxCenterFeedback || []).filter(f => 
      f.fromRegion === 'Oromia'
    );
    setTaxCenterFeedback(regionFeedback);
  }, []);

  useEffect(() => {
    if (taxCenterFeedback.length > 0) {
      const hasAllFeedback = taxCenterFeedback.length >= 2;
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

    const submission = {
      id: `regional-submission-${Date.now()}`,
      region: 'Oromia',
      submittedBy: 'Oromia Regional Director',
      timestamp: new Date().toLocaleString(),
      status: 'submitted_to_director',
      taxCenterFeedbackIncluded: taxCenterFeedback.length,
      feedbackDetails: taxCenterFeedback
    };

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
      <div className="p-6">
        <div className="detail-header">
          <h2 className="flex items-center gap-2"><i className="fas fa-comments"></i> Tax Center Feedback Collection</h2>
          <Badge status={`${taxCenterFeedback.length} Feedback Received`} className={taxCenterFeedback.length > 0 ? 'director-approved' : 'pending'} />
        </div>

        {taxCenterFeedback.length === 0 ? (
          <div className="bg-ink dark:bg-ink text-text-hi dark:text-text-hi p-4 rounded mb-6 border-l-4 border-gold dark:border-gold">
            <strong className="flex items-center gap-2"><i className="fas fa-info-circle"></i> No Tax Center Feedback Yet</strong>
            <p className="text-text-mid dark:text-text-mid mt-2 text-xs">
              Tax center managers need to review their allocations and provide feedback. Check back after they submit their feedback.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-ink dark:bg-ink p-4 rounded mb-6 border-l-4 border-teal dark:border-teal">
              <strong className="flex items-center gap-2 text-teal dark:text-teal"><i className="fas fa-check-circle"></i> Feedback Received from Tax Centers</strong>
              <p className="text-text-mid dark:text-text-mid mt-2 text-xs">
                You have received feedback from {taxCenterFeedback.length} tax center(s). Review below and then submit to Director.
              </p>
            </div>

            <div className="section-title"><i className="fas fa-list"></i> Tax Center Feedback</div>
            {taxCenterFeedback.map((feedback, idx) => (
              <div key={idx} className="bg-panel dark:bg-panel text-text-primary dark:text-text-primary p-4 rounded mb-4 border border-border dark:border-border">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="m-0 flex items-center gap-2"><i className="fas fa-building"></i> {feedback.fromTaxCenter}</h3>
                  <Badge status={feedback.status} className="pending" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Audit Cases Allocated</p>
                    <p className="text-xl font-bold m-0 mt-1 text-text-hi dark:text-text-hi">
                      {feedback.allocation?.numberOfAudits || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-mid dark:text-text-mid m-0">Team Required</p>
                    <p className="text-xl font-bold m-0 mt-1 text-text-hi dark:text-text-hi">
                      {feedback.allocation?.teamSize || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-ink dark:bg-ink p-3 rounded mb-3 border border-border dark:border-border">
                  <strong className="text-xs text-text-mid dark:text-text-mid">Feedback:</strong>
                  <p className="text-text-primary dark:text-text-primary mt-2 text-xs leading-relaxed">
                    {feedback.feedback}
                  </p>
                </div>

                <p className="text-xs text-text-mid dark:text-text-mid m-0">
                  <i className="fas fa-clock"></i> Submitted: {feedback.timestamp}
                </p>
              </div>
            ))}

            <div className="action-bar mt-6">
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
                  className="btn btn-outline opacity-60 cursor-not-allowed"
                  disabled
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
    <div className="p-6">
      <div className="detail-header">
        <h2 className="flex items-center gap-2"><i className="fas fa-comments"></i> Tax Center Feedback</h2>
      </div>
      <p className="text-text-primary dark:text-text-primary">Select a menu item to view tax center feedback collection.</p>
    </div>
  );
}

export default TaxCenterFeedbackCollectionView;
