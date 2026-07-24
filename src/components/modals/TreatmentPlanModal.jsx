import React, { useState, useEffect } from 'react';
import { loadData, saveData } from '../../utils/data';

/**
 * TreatmentPlanModal - Form modal for attaching/editing treatment plans
 * Includes validation and file attachment support
 */

function TreatmentPlanModal({ isOpen, caseId, onClose, onSave }) {
  const [planType, setPlanType] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [assignedAuditor, setAssignedAuditor] = useState('');
  const [focusAreas, setFocusAreas] = useState({
    'Revenue Recognition': false,
    'Transfer Pricing': false,
    'VAT Compliance': false,
    'Withholding Tax': false,
    'Payroll Tax': false,
    'Asset Valuation': false,
    'Related Party Transactions': false,
    'Documentation Compliance': false
  });
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [existingPlan, setExistingPlan] = useState(null);

  // Load existing plan if editing
  useEffect(() => {
    if (isOpen && caseId) {
      const data = loadData();
      const auditCase = data.auditCases?.find(c => c.id === caseId);
      if (auditCase?.treatmentPlan) {
        const plan = auditCase.treatmentPlan;
        setExistingPlan(plan);
        setPlanType(plan.planType || '');
        setDescription(plan.description || '');
        setEstimatedHours(plan.estimatedHours || '');
        setEstimatedCost(plan.estimatedCost || '');
        setAssignedAuditor(plan.assignedAuditor || '');
        setNotes(plan.notes || '');
        
        // Restore focus areas
        if (plan.keyFocusAreas) {
          const newFocusAreas = { ...focusAreas };
          plan.keyFocusAreas.forEach(area => {
            if (newFocusAreas.hasOwnProperty(area)) {
              newFocusAreas[area] = true;
            }
          });
          setFocusAreas(newFocusAreas);
        }
      }
    }
  }, [isOpen, caseId]);

  const validateForm = () => {
    const newErrors = {};

    if (!planType) newErrors.planType = 'Plan Type is required';
    if (!description || description.length < 200) newErrors.description = 'Description must be at least 200 characters';
    if (description.length > 2000) newErrors.description = 'Description must not exceed 2000 characters';
    if (!estimatedHours || estimatedHours <= 0) newErrors.estimatedHours = 'Estimated hours must be greater than 0';
    if (estimatedCost && estimatedCost < 0) newErrors.estimatedCost = 'Estimated cost must be non-negative';
    
    const selectedAreas = Object.entries(focusAreas).filter(([_, checked]) => checked);
    if (selectedAreas.length === 0) newErrors.focusAreas = 'Select at least one focus area';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const data = loadData();
    const caseIdx = data.auditCases?.findIndex(c => c.id === caseId);

    if (caseIdx >= 0) {
      const selectedAreas = Object.entries(focusAreas)
        .filter(([_, checked]) => checked)
        .map(([area, _]) => area);

      const treatmentPlan = {
        id: existingPlan?.id || `TP-${caseId}-${Date.now()}`,
        caseId,
        planType,
        description,
        estimatedHours: parseInt(estimatedHours),
        estimatedCost: estimatedCost ? parseInt(estimatedCost) : null,
        assignedAuditor,
        keyFocusAreas: selectedAreas,
        notes,
        attachments: existingPlan?.attachments || [],
        createdDate: existingPlan?.createdDate || new Date().toISOString(),
        createdBy: existingPlan?.createdBy || 'Tax Center Manager',
        lastModified: new Date().toISOString(),
        modifiedBy: 'Tax Center Manager'
      };

      data.auditCases[caseIdx].treatmentPlan = treatmentPlan;
      saveData(data);

      if (onSave) onSave(treatmentPlan);
      handleClose();
    }
  };

  const handleDelete = () => {
    if (!window.confirm('Delete this treatment plan? This action cannot be undone.')) return;

    const data = loadData();
    const caseIdx = data.auditCases?.findIndex(c => c.id === caseId);

    if (caseIdx >= 0) {
      data.auditCases[caseIdx].treatmentPlan = null;
      saveData(data);
      handleClose();
      alert('Treatment plan deleted');
    }
  };

  const handleClose = () => {
    setPlanType('');
    setDescription('');
    setEstimatedHours('');
    setEstimatedCost('');
    setAssignedAuditor('');
    setNotes('');
    setFocusAreas({
      'Revenue Recognition': false,
      'Transfer Pricing': false,
      'VAT Compliance': false,
      'Withholding Tax': false,
      'Payroll Tax': false,
      'Asset Valuation': false,
      'Related Party Transactions': false,
      'Documentation Compliance': false
    });
    setErrors({});
    setExistingPlan(null);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const planTypes = [
    'Standard Audit Treatment Plan',
    'Comprehensive Audit Plan',
    'Desk Audit Plan',
    'Field Audit Plan',
    'Transfer Pricing Audit Plan',
    'Single Issue Audit Plan',
    'Forensic Audit Plan'
  ];

  return (
    <div onClick={handleBackdropClick} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#0f1419',
        borderRadius: '8px',
        border: '1px solid #30363d',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{
          background: '#1c2128',
          borderBottom: '1px solid #30363d',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: '0', fontSize: '16px', fontWeight: '600', color: '#f0f6fc' }}>
            {existingPlan ? 'Edit' : 'Attach'} Treatment Plan
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '16px' }}>
          {/* Plan Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Plan Type *
            </label>
            <select value={planType} onChange={(e) => setPlanType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${errors.planType ? '#ff5252' : '#30363d'}`,
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px'
              }}>
              <option value="">Select a plan type...</option>
              {planTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.planType && <small style={{ color: '#ff5252' }}>{errors.planType}</small>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Description ({description.length}/2000 chars) *
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description of audit objectives, scope, and methodology..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '8px',
                border: `1px solid ${errors.description ? '#ff5252' : '#30363d'}`,
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
            {errors.description && <small style={{ color: '#ff5252' }}>{errors.description}</small>}
          </div>

          {/* Estimated Hours */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Estimated Hours *
            </label>
            <input type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)}
              placeholder="e.g., 120"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${errors.estimatedHours ? '#ff5252' : '#30363d'}`,
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px'
              }}
            />
            {errors.estimatedHours && <small style={{ color: '#ff5252' }}>{errors.estimatedHours}</small>}
          </div>

          {/* Estimated Cost */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Estimated Cost (ETB)
            </label>
            <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="Optional - cost in ETB"
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${errors.estimatedCost ? '#ff5252' : '#30363d'}`,
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px'
              }}
            />
          </div>

          {/* Key Focus Areas */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Key Focus Areas * {errors.focusAreas && <small style={{ color: '#ff5252' }}>- {errors.focusAreas}</small>}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries(focusAreas).map(([area, checked]) => (
                <label key={area} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setFocusAreas({ ...focusAreas, [area]: e.target.checked })}
                  />
                  <span style={{ color: '#f0f6fc' }}>{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#f0f6fc', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
              Additional Notes
            </label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes or comments..."
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '8px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: '#1c2128',
          borderTop: '1px solid #30363d',
          padding: '12px 16px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'space-between'
        }}>
          <div>
            {existingPlan && (
              <button
                onClick={handleDelete}
                style={{
                  padding: '8px 14px',
                  background: '#ff5252',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleClose}
              style={{
                padding: '8px 14px',
                background: '#30363d',
                color: '#f0f6fc',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 14px',
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-save"></i> Save Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TreatmentPlanModal;
