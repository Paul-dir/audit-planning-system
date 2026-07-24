import React, { useState } from 'react';
import RiskProfilePanel from '../panels/RiskProfilePanel';

/**
 * CaseDetailsModal - Portal modal showing complete case information
 * Displays risk profiling and allows treatment plan attachment
 */

function CaseDetailsModal({ isOpen, caseData, onClose, onAttachPlan }) {
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);

  if (!isOpen || !caseData) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
      zIndex: 1000
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#0f1419',
        borderRadius: '8px',
        border: '1px solid #30363d',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
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
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1001
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600', color: '#f0f6fc' }}>
              {caseData.id}
            </h2>
            <small style={{ color: '#8b949e' }}>
              {caseData.taxpayerName}
            </small>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {/* Taxpayer Information */}
          <div style={{
            background: '#1c2128',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid #30363d'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#f0f6fc' }}>
              <i className="fas fa-user"></i> Taxpayer Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>NAME</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.taxpayerName}</strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>TIN</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.tin}</strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>BUSINESS TYPE</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.businessType || 'N/A'}</strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>TAX CENTER</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.taxCenter}</strong>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div style={{
            background: '#1c2128',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid #30363d'
          }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#f0f6fc' }}>
              <i className="fas fa-file-alt"></i> Audit Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>AUDIT TYPE</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.auditType}</strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>EST. HOURS</small>
                <strong style={{ color: '#f0f6fc' }}>{caseData.estimatedHours} hrs</strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>REVENUE AT RISK</small>
                <strong style={{ color: '#f0f6fc' }}>
                  {((caseData.revenueAtRisk || 0) / 1000000).toFixed(1)}M ETB
                </strong>
              </div>
              <div>
                <small style={{ color: '#8b949e', display: 'block' }}>CASE SOURCE</small>
                <span style={{
                  background: caseData.createdFrom === 'AUDIT_REQUEST' ? '#ff9800' : '#4a8fd9',
                  color: '#fff',
                  padding: '3px 6px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {caseData.createdFrom === 'AUDIT_REQUEST' ? '🔔 Audit Request' : '⚙️ Risk Engine'}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Profile Panel */}
          <RiskProfilePanel caseData={caseData} />

          {/* Treatment Plan Section */}
          {caseData.treatmentPlan && (
            <div style={{
              background: '#1c2128',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #30363d',
              borderLeft: '3px solid #4caf50'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: '#f0f6fc' }}>
                <i className="fas fa-file-contract"></i> Treatment Plan
              </h3>
              <div style={{ fontSize: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <small style={{ color: '#8b949e', display: 'block' }}>PLAN TYPE</small>
                  <strong style={{ color: '#f0f6fc' }}>{caseData.treatmentPlan.planType}</strong>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <small style={{ color: '#8b949e', display: 'block' }}>DESCRIPTION</small>
                  <p style={{ color: '#f0f6fc', margin: '4px 0', lineHeight: '1.4', fontSize: '11px' }}>
                    {caseData.treatmentPlan.description}
                  </p>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <small style={{ color: '#8b949e', display: 'block' }}>ESTIMATED HOURS</small>
                  <strong style={{ color: '#f0f6fc' }}>{caseData.treatmentPlan.estimatedHours} hrs</strong>
                </div>
                {caseData.treatmentPlan.estimatedCost && (
                  <div style={{ marginBottom: '8px' }}>
                    <small style={{ color: '#8b949e', display: 'block' }}>ESTIMATED COST</small>
                    <strong style={{ color: '#f0f6fc' }}>
                      {caseData.treatmentPlan.estimatedCost.toLocaleString()} ETB
                    </strong>
                  </div>
                )}
                {caseData.treatmentPlan.keyFocusAreas && caseData.treatmentPlan.keyFocusAreas.length > 0 && (
                  <div>
                    <small style={{ color: '#8b949e', display: 'block', marginBottom: '4px' }}>KEY FOCUS AREAS</small>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {caseData.treatmentPlan.keyFocusAreas.map((area, idx) => (
                        <span key={idx} style={{
                          background: '#4a8fd9',
                          color: '#fff',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Treatment Plan */}
          {!caseData.treatmentPlan && (
            <div style={{
              background: '#1c2128',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              border: '1px solid #30363d',
              textAlign: 'center',
              color: '#8b949e',
              fontSize: '12px'
            }}>
              <i className="fas fa-info-circle"></i> No treatment plan attached yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#1c2128',
          borderTop: '1px solid #30363d',
          padding: '12px 16px',
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          position: 'sticky',
          bottom: 0,
          zIndex: 1001
        }}>
          <button
            onClick={onClose}
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
            Close
          </button>
          <button
            onClick={() => onAttachPlan && onAttachPlan(caseData.id)}
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
            <i className="fas fa-plus"></i> Attach Plan
          </button>
        </div>
      </div>
    </div>
  );
}

export default CaseDetailsModal;
