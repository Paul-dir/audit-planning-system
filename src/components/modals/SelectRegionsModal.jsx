import React, { useState } from 'react';
import { directorSendToRegions } from '../../utils/businessLogic';
import { auditConfig } from '../../config/auditConfig';

function SelectRegionsModal({ plan, onClose }) {
  const [selectedRegions, setSelectedRegions] = useState([]);
  const regions = auditConfig.regions.map(r => r.name);

  const handleToggle = (region) => {
    if (selectedRegions.includes(region)) {
      setSelectedRegions(selectedRegions.filter(r => r !== region));
    } else {
      setSelectedRegions([...selectedRegions, region]);
    }
  };

  const handleSend = () => {
    if (selectedRegions.length === 0) {
      alert('Please select at least one region');
      return;
    }

    if (directorSendToRegions(plan.id, selectedRegions)) {
      alert(`Plan sent to ${selectedRegions.length} region(s) for feedback!\n\nRegions: ${selectedRegions.join(', ')}`);
      onClose();
    } else {
      alert('Error: Plan must be Director Approved status');
    }
  };

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: '600px' }}>
        <h2><i className="fas fa-share-alt" style={{ color: '#4fc3f7' }}></i> Send Plan to Regional Directors</h2>
        
        <p>This plan will be sent to all regional directors for review, allocation, and feedback collection:</p>

        <div style={{ background: '#f8f9fc', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Plan Details:</strong>
            <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px' }}>
              ID: {plan.id} | Version: {plan.version} | Fiscal Year: {plan.fiscalYear}
            </p>
          </div>
        </div>

        {/* Region Selection with Checkboxes */}
        <div style={{ marginBottom: '20px' }}>
          <strong><i className="fas fa-check-circle"></i> Select Regions to Send Plan</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 12px 0', fontSize: '13px', color: '#a0aec0' }}>
            Click to select which regions should receive this plan:
          </p>
          
          {/* Select All Option */}
          <div style={{
            padding: '10px',
            background: '#f8f9fc', color: '#0c4a6e',
            border: '1px solid #2d3d4d',
            borderRadius: '4px',
            marginBottom: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onClick={() => {
            if (selectedRegions.length === regions.length) {
              setSelectedRegions([]);
            } else {
              setSelectedRegions([...regions]);
            }
          }}>
            <input
              type="checkbox"
              checked={selectedRegions.length === regions.length}
              onChange={() => {}}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <span style={{ fontWeight: 'bold', flex: 1 }}>
              {selectedRegions.length === regions.length ? 'Deselect All' : 'Select All Regions'}
            </span>
          </div>

          {/* Individual Region Checkboxes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
            {regions.map(region => {
              const isSelected = selectedRegions.includes(region);
              
              // Get total cases for this region from regionalAllocation
              let regionCases = 0;
              if (plan.regionalAllocation && plan.regionalAllocation[region]) {
                regionCases = Object.values(plan.regionalAllocation[region]).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
              }
              
              return (
                <div
                  key={region}
                  style={{
                    padding: '12px',
                    background: isSelected ? '#1a3a1a' : '#0f1419',
                    border: `1px solid ${isSelected ? '#388e3c' : '#2d3d4d'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => handleToggle(region)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {region}
                    </div>
                    <div style={{ fontSize: '12px', color: '#a0aec0', marginTop: '2px' }}>
                      {regionCases} cases
                    </div>
                  </div>
                  {isSelected && (
                    <span style={{ color: '#388e3c', fontSize: '16px' }}>
                      <i className="fas fa-check-circle"></i>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: '#f8f9fc', color: '#0c4a6e',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '13px',
          color: '#a0aec0',
          fontWeight: 'bold'
        }}>
          {selectedRegions.length} of {regions.length} regions selected
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <strong><i className="fas fa-info-circle"></i> Workflow</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>Regional directors receive the plan</li>
            <li>They allocate cases to tax centers</li>
            <li>Tax centers provide feedback</li>
            <li>Regional directors collect and submit feedback back to you</li>
          </ol>
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button 
            className="btn btn-primary" 
            onClick={handleSend}
            disabled={selectedRegions.length === 0}
            title={selectedRegions.length === 0 ? 'Select at least one region' : ''}
          >
            <i className="fas fa-paper-plane"></i> Send to {selectedRegions.length || 'Selected'} Region{selectedRegions.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectRegionsModal;
