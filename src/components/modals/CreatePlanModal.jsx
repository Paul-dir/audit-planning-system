import React, { useState, useEffect } from 'react';
import { createNationalPlan, submitPlanToDirector } from '../../utils/businessLogic';

function CreatePlanModal({ onClose }) {
  const [year, setYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [effort, setEffort] = useState(48000);
  const [allocations, setAllocations] = useState([
    { region: 'Addis Ababa', total: 6000, desk: 2400, field: 2100, tp: 300, issue: 900 },
    { region: 'Oromia', total: 5500, desk: 2200, field: 2100, tp: 300, issue: 900 },
    { region: 'Amhara', total: 3500, desk: 1400, field: 1400, tp: 200, issue: 500 },
    { region: 'Sidama', total: 2000, desk: 800, field: 800, tp: 100, issue: 300 },
    { region: 'Dire Dawa', total: 1500, desk: 600, field: 600, tp: 100, issue: 200 },
    { region: 'Somali', total: 1500, desk: 600, field: 600, tp: 100, issue: 200 }
  ]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setYear((currentYear + 1).toString());
    
    const today = new Date();
    const jan1 = new Date(today.getFullYear(), 0, 1);
    const dec31 = new Date(today.getFullYear(), 11, 31);
    setStartDate(jan1.toISOString().split('T')[0]);
    setEndDate(dec31.toISOString().split('T')[0]);
  }, []);

  const calculateTotal = () => {
    return allocations.reduce((sum, a) => sum + a.total, 0);
  };

  const updateAllocation = (index, field, value) => {
    const newAllocations = [...allocations];
    newAllocations[index][field] = parseInt(value) || 0;
    setAllocations(newAllocations);
  };

  const handleSaveDraft = () => {
    createNationalPlan(year, allocations, effort, startDate, endDate);
    alert('Plan created as DRAFT.');
    onClose();
  };

  const handleSubmit = () => {
    const plan = createNationalPlan(year, allocations, effort, startDate, endDate);
    submitPlanToDirector(plan.id);
    alert('Plan submitted to Director.');
    onClose();
  };

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = 2020; y <= currentYear + 5; y++) {
    years.push(y);
  }

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal">
        <h2><i className="fas fa-calendar-plus" style={{ color: '#4fc3f7' }}></i> Create National Plan</h2>
        
        <div className="form-group">
          <label>Fiscal Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Planning Period</label>
          <div className="date-range">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Regional Allocations</label>
          <div>
            <div className="region-grid" style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
              <span>Region</span>
              <span>Total</span>
              <span>Desk</span>
              <span>Field</span>
              <span>TP</span>
              <span>Issue</span>
            </div>
            {allocations.map((alloc, index) => (
              <div key={index} className="region-grid" style={{ marginBottom: '4px' }}>
                <input type="text" value={alloc.region} readOnly style={{ background: '#f0f2f5' }} />
                <input type="number" value={alloc.total} onChange={(e) => updateAllocation(index, 'total', e.target.value)} />
                <input type="number" value={alloc.desk} onChange={(e) => updateAllocation(index, 'desk', e.target.value)} />
                <input type="number" value={alloc.field} onChange={(e) => updateAllocation(index, 'field', e.target.value)} />
                <input type="number" value={alloc.tp} onChange={(e) => updateAllocation(index, 'tp', e.target.value)} />
                <input type="number" value={alloc.issue} onChange={(e) => updateAllocation(index, 'issue', e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Total National Cases: <span>{calculateTotal()}</span></label>
        </div>

        <div className="form-group">
          <label>Effort Estimate (hours)</label>
          <input type="number" value={effort} onChange={(e) => setEffort(parseInt(e.target.value) || 0)} />
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveDraft}>Save Draft</button>
          <button className="btn btn-success" onClick={handleSubmit}>Submit to Director</button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlanModal;
