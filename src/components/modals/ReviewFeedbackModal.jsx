import React, { useState } from 'react';
import Badge from '../Badge';
import { reviewAndAmendPlan } from '../../utils/businessLogic';

function ReviewFeedbackModal({ plan, onClose }) {
  const [amendments, setAmendments] = useState({
    locations: JSON.parse(JSON.stringify(plan.locations || []))
  });

  const handleApplyFeedback = (regionName, feedbackData) => {
    const updated = [...amendments.locations];
    const location = updated.find(l => l.name === regionName);
    if (location && feedbackData.proposedChanges) {
      Object.assign(location, feedbackData.proposedChanges);
    }
    setAmendments({ ...amendments, locations: updated });
  };

  const handleFinalize = () => {
    if (window.confirm('Finalize the plan with incorporated feedback? This will create a new version.')) {
      // Recalculate totals
      const totalVolume = amendments.locations.reduce((sum, l) => sum + l.cases, 0);
      const totalEffort = amendments.locations.reduce((sum, l) => sum + l.totalEffort, 0);
      
      const finalAmendments = {
        ...amendments,
        totalVolume,
        totalEffortHours: totalEffort
      };
      
      if (reviewAndAmendPlan(plan.id, finalAmendments)) {
        alert('Plan finalized successfully! New version created.');
        onClose();
      } else {
        alert('Cannot finalize. Plan must have feedback collected.');
      }
    }
  };

  const hasPendingFeedback = plan.regionalFeedback?.some(f => f.status === 'PENDING');

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: '900px' }}>
        <h2><i className="fas fa-comments" style={{ color: '#4fc3f7' }}></i> Regional Feedback Review</h2>
        
        {hasPendingFeedback && (
          <div style={{ background: '#0f1419', color: '#f0f6fc', padding: '12px', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #ffa726' }}>
            <i className="fas fa-hourglass-half" style={{ color: '#f57f17' }}></i> 
            <strong> Awaiting Feedback</strong> - Some regions haven't submitted their feedback yet.
          </div>
        )}

        <div className="section-title"><i className="fas fa-list"></i> Feedback Summary</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Current Allocation</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plan.regionalFeedback?.map(feedback => {
                const location = plan.locations?.find(l => l.name === feedback.region);
                return (
                  <tr key={feedback.region}>
                    <td><strong>{feedback.region}</strong></td>
                    <td>{location?.cases || 0} cases</td>
                    <td>
                      <Badge 
                        status={feedback.status === 'SUBMITTED' ? 'Submitted' : 'Pending'} 
                        className={feedback.status === 'SUBMITTED' ? 'director-approved' : 'pending'} 
                      />
                    </td>
                    <td>{feedback.submittedDate ? new Date(feedback.submittedDate).toLocaleDateString() : '-'}</td>
                    <td>
                      {feedback.status === 'SUBMITTED' ? (
                        <button 
                          className="btn btn-sm btn-info" 
                          onClick={() => {
                            const detail = feedback.feedback;
                            alert(`Feedback from ${feedback.region}:\n\n${detail?.comments || 'No comments'}\n\nProposed Changes:\nDesk: ${detail?.proposedChanges?.desk || 0}\nField: ${detail?.proposedChanges?.field || 0}\nJoint: ${detail?.proposedChanges?.joint || 0}\nTP: ${detail?.proposedChanges?.tp || 0}\nComp: ${detail?.proposedChanges?.comprehensive || 0}`);
                          }}
                        >
                          <i className="fas fa-eye"></i> View Details
                        </button>
                      ) : (
                        <span style={{ color: '#999' }}>Awaiting</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="section-title"><i className="fas fa-edit"></i> Amended Allocation</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Desk</th>
                <th>Field</th>
                <th>Joint</th>
                <th>TP</th>
                <th>Comp</th>
                <th>Total</th>
                <th>Quick Apply</th>
              </tr>
            </thead>
            <tbody>
              {amendments.locations.map((loc, index) => {
                const feedbackItem = plan.regionalFeedback?.find(f => f.region === loc.name);
                const hasSubmitted = feedbackItem?.status === 'SUBMITTED';
                
                return (
                  <tr key={loc.name}>
                    <td><strong>{loc.name}</strong></td>
                    <td>
                      <input 
                        type="number" 
                        value={loc.desk}
                        onChange={(e) => {
                          const updated = [...amendments.locations];
                          updated[index].desk = parseInt(e.target.value) || 0;
                          updated[index].cases = updated[index].desk + updated[index].field + updated[index].joint + updated[index].tp + updated[index].comprehensive;
                          setAmendments({ ...amendments, locations: updated });
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={loc.field}
                        onChange={(e) => {
                          const updated = [...amendments.locations];
                          updated[index].field = parseInt(e.target.value) || 0;
                          updated[index].cases = updated[index].desk + updated[index].field + updated[index].joint + updated[index].tp + updated[index].comprehensive;
                          setAmendments({ ...amendments, locations: updated });
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={loc.joint}
                        onChange={(e) => {
                          const updated = [...amendments.locations];
                          updated[index].joint = parseInt(e.target.value) || 0;
                          updated[index].cases = updated[index].desk + updated[index].field + updated[index].joint + updated[index].tp + updated[index].comprehensive;
                          setAmendments({ ...amendments, locations: updated });
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={loc.tp}
                        onChange={(e) => {
                          const updated = [...amendments.locations];
                          updated[index].tp = parseInt(e.target.value) || 0;
                          updated[index].cases = updated[index].desk + updated[index].field + updated[index].joint + updated[index].tp + updated[index].comprehensive;
                          setAmendments({ ...amendments, locations: updated });
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={loc.comprehensive}
                        onChange={(e) => {
                          const updated = [...amendments.locations];
                          updated[index].comprehensive = parseInt(e.target.value) || 0;
                          updated[index].cases = updated[index].desk + updated[index].field + updated[index].joint + updated[index].tp + updated[index].comprehensive;
                          setAmendments({ ...amendments, locations: updated });
                        }}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td><strong>{loc.cases}</strong></td>
                    <td>
                      {hasSubmitted && feedbackItem.feedback?.proposedChanges && (
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleApplyFeedback(loc.name, feedbackItem.feedback)}
                          title="Apply this region's proposed changes"
                        >
                          <i className="fas fa-magic"></i> Apply
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td>TOTAL</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.desk, 0)}</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.field, 0)}</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.joint, 0)}</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.tp, 0)}</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.comprehensive, 0)}</td>
                <td>{amendments.locations.reduce((sum, l) => sum + l.cases, 0)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: '#1a3a1a', padding: '12px', borderRadius: '8px', marginTop: '16px' }}>
          <i className="fas fa-info-circle" style={{ color: '#2e7d32' }}></i> 
          <strong> Version Control:</strong> Finalizing will create version {plan.version + 1} of this plan with the amended allocations.
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          <button 
            className="btn btn-success" 
            onClick={handleFinalize}
            disabled={hasPendingFeedback}
            title={hasPendingFeedback ? 'Wait for all regional feedback' : 'Finalize plan with amendments'}
          >
            <i className="fas fa-check-double"></i> Finalize Plan (Create v{plan.version + 1})
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewFeedbackModal;
