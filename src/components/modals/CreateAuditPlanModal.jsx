import React, { useState, useEffect } from 'react';
import { createAuditPlan, updateAuditPlan } from '../../utils/businessLogic';
import { loadData } from '../../utils/data';
import { auditConfig } from '../../config/auditConfig';

function CreateAuditPlanModal({ existingPlan, onClose }) {
  const isEdit = !!existingPlan;
  const taxpayerPool = loadData().taxpayerPool;
  
  const [fiscalYear, setFiscalYear] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tactics, setTactics] = useState('');
  const [notes, setNotes] = useState('');

  const [auditTypes, setAuditTypes] = useState(
    auditConfig.auditTypes.map(t => ({ 
      name: t.name, 
      volume: 0, 
      effortPerCase: t.effortPerCase, 
      description: t.description,
      totalEffort: 0 
    }))
  );

  const [locations, setLocations] = useState(
    auditConfig.regions.map(r => ({
      name: r.name,
      taxpayers: r.taxpayers,
      cases: 0,
      ...Object.fromEntries(auditConfig.auditTypes.map((t, i) => [`type_${i}`, 0])),
      availableSkills: r.availableSkills,
      capacityStatus: 'Sufficient',
      totalEffort: 0
    }))
  );

  const [skillRequirements, setSkillRequirements] = useState(
    auditConfig.skillTypes.map(s => ({
      type: s.type,
      requiredHours: 0,
      availableCapacity: s.availableCapacity,
      gap: 0
    }))
  );

  useEffect(() => {
    if (existingPlan) {
      setFiscalYear(existingPlan.fiscalYear || '');
      setStartDate(existingPlan.startDate || '');
      setEndDate(existingPlan.endDate || '');
      setTactics(existingPlan.tactics || '');
      setNotes(existingPlan.notes || '');
      if (existingPlan.auditTypes) setAuditTypes(existingPlan.auditTypes);
      if (existingPlan.locations) setLocations(existingPlan.locations);
      if (existingPlan.skillRequirements) setSkillRequirements(existingPlan.skillRequirements);
    } else {
      const currentYear = new Date().getFullYear();
      setFiscalYear((currentYear + 1).toString());
      const jan1 = new Date(currentYear, 0, 1).toISOString().split('T')[0];
      const dec31 = new Date(currentYear, 11, 31).toISOString().split('T')[0];
      setStartDate(jan1);
      setEndDate(dec31);
      setTactics('Focus on high-risk sectors including manufacturing, import/export, and professional services.');
    }
  }, [existingPlan]);

  const updateAuditType = (index, field, value) => {
    const updated = [...auditTypes];
    updated[index][field] = parseInt(value) || 0;
    if (field === 'volume' || field === 'effortPerCase') {
      updated[index].totalEffort = updated[index].volume * updated[index].effortPerCase;
    }
    setAuditTypes(updated);
    recalculateSkills(updated);
  };

  const updateLocation = (index, field, value) => {
    const updated = [...locations];
    const parsedValue = parseInt(value) || 0;
    updated[index][field] = parsedValue;
    
    // If updating an audit type field, recalculate totals
    if (field.startsWith('type_')) {
      // Calculate total cases
      updated[index].cases = auditConfig.auditTypes.reduce((sum, _, i) => 
        sum + (updated[index][`type_${i}`] || 0), 0
      );
      
      // Calculate total effort based on each audit type's effort per case
      const totalEffort = auditConfig.auditTypes.reduce((sum, type, i) => 
        sum + ((updated[index][`type_${i}`] || 0) * type.effortPerCase), 0
      );
      
      updated[index].totalEffort = totalEffort;
      const requiredSkills = Math.ceil(totalEffort / 2000);
      updated[index].capacityStatus = requiredSkills <= updated[index].availableSkills ? 'Sufficient' : 'Shortage';
    }
    
    setLocations(updated);
  };

  const recalculateSkills = (types) => {
    const totalEffort = types.reduce((sum, t) => sum + t.totalEffort, 0);
    const updated = skillRequirements.map(skill => {
      const skillConfig = auditConfig.skillTypes.find(s => s.type === skill.type);
      const requiredHours = Math.round(totalEffort * (skillConfig?.effortPercentage || 0));
      const gap = requiredHours - skill.availableCapacity;
      return { ...skill, requiredHours, gap };
    });
    setSkillRequirements(updated);
  };

  const calculateTotals = () => {
    const totalVolume = auditTypes.reduce((sum, t) => sum + t.volume, 0);
    const totalEffort = auditTypes.reduce((sum, t) => sum + t.totalEffort, 0);
    const locationTotal = locations.reduce((sum, l) => sum + l.cases, 0);
    
    const locationBreakdown = Object.fromEntries(
      auditConfig.auditTypes.map((_, i) => [
        `type_${i}`,
        locations.reduce((sum, l) => sum + (l[`type_${i}`] || 0), 0)
      ])
    );
    
    return { totalVolume, totalEffort, locationTotal, locationBreakdown };
  };

  const handleSaveDraft = () => {
    const totals = calculateTotals();
    
    if (totals.totalVolume === 0) {
      alert('Please enter at least one audit case volume.');
      return;
    }

    if (totals.locationTotal !== totals.totalVolume) {
      alert(`Location distribution (${totals.locationTotal}) must equal total volume (${totals.totalVolume})`);
      return;
    }

    const planData = {
      fiscalYear,
      startDate,
      endDate,
      duration: calculateDuration(),
      tactics,
      notes,
      auditTypes: auditTypes.map(t => ({ ...t })),
      locations: locations.map(l => ({ ...l })),
      skillRequirements: skillRequirements.map(s => ({ ...s })),
      totalVolume: totals.totalVolume,
      totalEffortHours: totals.totalEffort
    };

    if (isEdit) {
      updateAuditPlan(existingPlan.id, planData);
      alert('Plan updated successfully!');
    } else {
      createAuditPlan(planData);
      alert('Plan saved as draft!');
    }
    onClose();
  };

  const handleSaveAndSubmit = () => {
    const totals = calculateTotals();
    
    if (totals.totalVolume === 0) {
      alert('Please enter at least one audit case volume.');
      return;
    }

    if (totals.locationTotal !== totals.totalVolume) {
      alert(`Location distribution (${totals.locationTotal}) must equal total volume (${totals.totalVolume})`);
      return;
    }

    const planData = {
      fiscalYear,
      startDate,
      endDate,
      duration: calculateDuration(),
      tactics,
      notes,
      auditTypes: auditTypes.map(t => ({ ...t })),
      locations: locations.map(l => ({ ...l })),
      skillRequirements: skillRequirements.map(s => ({ ...s })),
      totalVolume: totals.totalVolume,
      totalEffortHours: totals.totalEffort,
      submitImmediate: true
    };

    if (isEdit) {
      updateAuditPlan(existingPlan.id, planData);
      alert('Plan updated and submitted to Director!');
    } else {
      createAuditPlan(planData);
      alert('Plan created and submitted to Director!');
    }
    onClose();
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const totals = calculateTotals();
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y <= currentYear + 5; y++) years.push(y);

  return (
    <div className="modal-overlay show" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal" style={{ maxWidth: '1100px' }}>
        <h2>
          <i className="fas fa-clipboard-list" style={{ color: '#4fc3f7' }}></i> 
          {isEdit ? ' Edit Audit Plan' : ' Create Annual Audit Plan'}
        </h2>
        
        <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', marginBottom: '20px' }}>
          <div className="card">
            <div className="info">
              <h3>Total Taxpayers</h3>
              <div className="number" style={{ fontSize: '20px' }}>{taxpayerPool.total.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label><i className="fas fa-calendar-alt"></i> Fiscal Year</label>
          <select value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label><i className="fas fa-clock"></i> Planning Period</label>
          <div className="date-range">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <small>Duration: {calculateDuration()} days</small>
        </div>

        <div className="form-group">
          <label><i className="fas fa-bullseye"></i> Annual Audit Tactics</label>
          <textarea 
            value={tactics}
            onChange={(e) => setTactics(e.target.value)}
            rows="3"
            placeholder="Strategic focus areas and priorities..."
          />
        </div>

        <div className="section-title"><i className="fas fa-list-ol"></i> Total Audit Volume by Type</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Audit Type</th>
                <th>Description</th>
                <th>Total Cases</th>
                <th>Effort/Case (hrs)</th>
                <th>Total Effort (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {auditTypes.map((type, index) => (
                <tr key={type.name}>
                  <td><strong>{type.name}</strong></td>
                  <td style={{ fontSize: '12px' }}>{type.description}</td>
                  <td>
                    <input 
                      type="number" 
                      value={type.volume}
                      onChange={(e) => updateAuditType(index, 'volume', e.target.value)}
                      style={{ width: '80px' }}
                      min="0"
                    />
                  </td>
                  <td>{type.effortPerCase}</td>
                  <td><strong>{type.totalEffort}</strong></td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td colSpan="2">TOTAL AUDIT VOLUME</td>
                <td>{totals.totalVolume}</td>
                <td>-</td>
                <td>{totals.totalEffort}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
          <strong>📋 Instructions:</strong> First enter total volume for each audit type above. Then distribute these cases across regions in the Regional Distribution table below.
        </div>

        <div className="section-title"><i className="fas fa-layer-group"></i> Regional Distribution</div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Region</th>
                <th>Taxpayers</th>
                {auditConfig.auditTypes.map((type, i) => (
                  <th key={`header_${i}`}>{type.name}</th>
                ))}
                <th>Total</th>
                <th>Effort</th>
                <th>Skills</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((loc, index) => (
                <tr key={loc.name}>
                  <td><strong>{loc.name}</strong></td>
                  <td style={{ fontSize: '12px' }}>{loc.taxpayers.toLocaleString()}</td>
                  {auditConfig.auditTypes.map((type, typeIndex) => (
                    <td key={`cell_${typeIndex}`}>
                      <input 
                        type="number" 
                        value={loc[`type_${typeIndex}`] || 0}
                        onChange={(e) => updateLocation(index, `type_${typeIndex}`, e.target.value)}
                        style={{ width: '60px' }}
                        min="0"
                      />
                    </td>
                  ))}
                  <td><strong>{loc.cases}</strong></td>
                  <td>{loc.totalEffort}</td>
                  <td>{loc.availableSkills}</td>
                  <td>
                    <span className={`badge ${loc.capacityStatus === 'Sufficient' ? 'director-approved' : 'rejected'}`}>
                      {loc.capacityStatus}
                    </span>
                  </td>
                </tr>
              ))}
              <tr style={{ background: '#f8f9fc', color: '#0c4a6e', fontWeight: 'bold' }}>
                <td colSpan="2">TOTAL</td>
                {auditConfig.auditTypes.map((type, i) => (
                  <td key={`total_${i}`}>{totals.locationBreakdown[`type_${i}`] || 0}</td>
                ))}
                <td>{totals.locationTotal}</td>
                <td colSpan="3">
                  {totals.locationTotal !== totals.totalVolume && (
                    <span style={{ color: 'red' }}>
                      ⚠️ Must equal {totals.totalVolume}
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveDraft}>
            <i className="fas fa-save"></i> {isEdit ? 'Update' : 'Save as Draft'}
          </button>
          <button className="btn btn-success" onClick={handleSaveAndSubmit}>
            <i className="fas fa-paper-plane"></i> {isEdit ? 'Update & Submit' : 'Save & Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateAuditPlanModal;
