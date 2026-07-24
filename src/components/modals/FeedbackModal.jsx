import React from 'react';
import Badge from '../Badge';
import { reviewRegionalFeedback } from '../../utils/businessLogic';

function FeedbackModal({ plan, onClose }) {
  const selectedRegions = plan.selectedRegions || [];
  const relevantAllocations = plan.allocations.filter(a => selectedRegions.includes(a.region));

  const handleAccept = (region) => {
    const comment = prompt(`Director comment for ${region}:`);
    if (reviewRegionalFeedback(plan.id, region, 'ACCEPTED', comment || '')) {
      alert('Accepted.');
      onClose();
    }
  };

  const handleReject = (region) => {
    const comment = prompt(`Director comment for ${region}:`);
    if (comment && reviewRegionalFeedback(plan.id, region, 'REJECTED', comment)) {
      alert('Rejected.');
      onClose();
    }
  };

  if (selectedRegions.length === 0) {
    return (
      <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
        <div className="modal">
          <h2><i className="fas fa-comments" style={{ color: '#4fc3f7' }}></i> Regional Feedback</h2>
          <p>⚠️ No regions were selected for feedback. Please go back and select regions.</p>
          <div className="actions">
            <button className="btn btn-outline" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const hasFeedback = relevantAllocations.some(a => a.feedback);

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2><i className="fas fa-comments" style={{ color: '#4fc3f7' }}></i> Regional Feedback</h2>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Original</th>
                <th>Adjustment</th>
                <th>Comments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!hasFeedback ? (
                <tr><td colSpan="6">⏳ No feedback submitted yet from selected regions.</td></tr>
              ) : (
                relevantAllocations.map(alloc => {
                  if (!alloc.feedback) {
                    return (
                      <tr key={alloc.region}>
                        <td>{alloc.region}</td>
                        <td>{alloc.total}</td>
                        <td colSpan="4">⏳ Awaiting feedback</td>
                      </tr>
                    );
                  }

                  const adjMsg = alloc.feedback.adjustments
                    ? `Total: ${alloc.feedback.adjustments.total} (Desk:${alloc.feedback.adjustments.desk})`
                    : 'No changes';

                  const statusBadge = alloc.feedback.status === 'PENDING' 
                    ? <Badge status="Pending" className="pending" />
                    : alloc.feedback.status === 'ACCEPTED'
                    ? <Badge status="✅ Accepted" className="director-approved" />
                    : <Badge status="❌ Rejected" className="rejected" />;

                  return (
                    <tr key={alloc.region}>
                      <td><strong>{alloc.region}</strong></td>
                      <td>{alloc.total}</td>
                      <td>{adjMsg}</td>
                      <td>{alloc.feedback.comments || ''}</td>
                      <td>{statusBadge}</td>
                      <td>
                        {alloc.feedback.status === 'PENDING' ? (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleAccept(alloc.region)}>
                              ✅ Accept
                            </button>
                            {' '}
                            <button className="btn btn-sm btn-danger" onClick={() => handleReject(alloc.region)}>
                              ❌ Reject
                            </button>
                          </>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
