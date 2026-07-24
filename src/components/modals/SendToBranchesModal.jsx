import React, { useState } from 'react';
import { requestRegionalFeedback } from '../../utils/businessLogic';

function SendToBranchesModal({ plan, onClose }) {
  const [selectedRegions, setSelectedRegions] = useState(
    plan.allocations.map(a => a.region)
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
      alert('Select at least one region.');
      return;
    }

    if (requestRegionalFeedback(plan.id, selectedRegions)) {
      alert(`Feedback requested from ${selectedRegions.length} region(s).`);
      onClose();
    } else {
      alert('Cannot request feedback.');
    }
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2><i className="fas fa-share-alt" style={{ color: '#4fc3f7' }}></i> Request Regional Feedback</h2>
        <p>Select which regions to send the plan for feedback:</p>
        
        <div className="form-group">
          <div className="checkbox-group">
            {plan.allocations.map(alloc => (
              <label key={alloc.region}>
                <input 
                  type="checkbox" 
                  checked={selectedRegions.includes(alloc.region)}
                  onChange={() => handleToggle(alloc.region)}
                />
                {alloc.region}
              </label>
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-success" onClick={handleSend}>Send to Selected Regions</button>
        </div>
      </div>
    </div>
  );
}

export default SendToBranchesModal;
