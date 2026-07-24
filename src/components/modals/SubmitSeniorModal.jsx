import React, { useState } from 'react';
import { submitToSeniorManagement } from '../../utils/businessLogic';

function SubmitSeniorModal({ plan, onClose }) {
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (submitToSeniorManagement(plan.id, notes)) {
      alert('Plan submitted to Senior Management.');
      onClose();
    } else {
      alert('Cannot submit. Plan must be DIRECTOR_APPROVED or FEEDBACK_COLLECTED.');
    }
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2><i className="fas fa-crown" style={{ color: '#7e57c2' }}></i> Submit to Senior Management</h2>
        <p>You are about to submit the plan for executive approval.</p>
        
        <div className="form-group">
          <label>Additional Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Provide any context..."
          />
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-purple" onClick={handleSubmit}>Submit to Senior Management</button>
        </div>
      </div>
    </div>
  );
}

export default SubmitSeniorModal;
