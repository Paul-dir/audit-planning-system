import React, { useState } from 'react';
import { requestRegionalFeedback } from '../../utils/businessLogic';

function RequestFeedbackModal({ plan, onClose }) {
  const [selectedRegions, setSelectedRegions] = useState(
    plan.locations?.map(l => l.name) || []
  );

  const handleToggle = (region) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const handleSend = () => {
    if (selectedRegions.length === 0) {
      alert('Please select at least one region.');
      return;
    }

    if (window.confirm(`Send plan to ${selectedRegions.length} region(s) for feedback?`)) {
      if (requestRegionalFeedback(plan.id, selectedRegions)) {
        alert(`Feedback request sent to ${selectedRegions.length} region(s). Regions will be notified.`);
        onClose();
      } else {
        alert('Cannot request feedback. Plan must be Director Approved.');
      }
    }
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <h2><i className="fas fa-share-alt" style={{ color: '#4fc3f7' }}></i> Request Regional Feedback</h2>
        <p>Select regions to send the plan for review and feedback:</p>
        
        <div className="table-container" style={{ marginBottom: '20px' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Select</th>
                <th>Region</th>
                <th>Allocated Cases</th>
                <th>Taxpayer Base</th>
              </tr>
            </thead>
            <tbody>
              {plan.locations?.map(loc => (
                <tr key={loc.name}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRegions.includes(loc.name)}
                      onChange={() => handleToggle(loc.name)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td><strong>{loc.name}</strong></td>
                  <td>{loc.cases}</td>
                  <td>{loc.taxpayers?.toLocaleString() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background: '#f0f7ff', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>
            <i className="fas fa-info-circle" style={{ color: '#4fc3f7' }}></i> What happens next?
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5a5a7a' }}>
            <li>Selected regions will be notified about the plan</li>
            <li>Regional directors can review and provide feedback</li>
            <li>You'll be notified when all feedback is collected</li>
            <li>You can then review and incorporate the feedback</li>
          </ul>
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSend} disabled={selectedRegions.length === 0}>
            <i className="fas fa-paper-plane"></i> Send to {selectedRegions.length} Region(s)
          </button>
        </div>
      </div>
    </div>
  );
}

export default RequestFeedbackModal;
