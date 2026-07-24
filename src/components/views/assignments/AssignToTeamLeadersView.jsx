import React, { useState, useEffect } from 'react';
import Card from '../../Card';
import Badge from '../../Badge';
import { loadData, saveData } from '../../../utils/data';
import { useAuth } from '../../../context/AuthContext';
import { loadTeamLeaders, loadAssignment, saveAssignment, updateTeamLeaderWorkload } from '../../../utils/assignmentData';
import { createAssignment, ASSIGNMENT_STATES } from '../../../utils/assignmentDataModels';
import { executeTransition } from '../../../utils/assignmentStateMachine';

/**
 * AssignToTeamLeadersView - Tax Center Manager
 * Displays stored cases grouped by audit type
 * Allows assignment to team leaders
 */

function AssignToTeamLeadersView() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  const [storedCases, setStoredCases] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [casesByAuditType, setCasesByAuditType] = useState({});
  const [selectedCases, setSelectedCases] = useState(new Set());
  const [assignments, setAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCasesAndTeamLeaders();
  }, []);

  const loadCasesAndTeamLeaders = () => {
    try {
      setLoading(true);
      const data = loadData();
      const userRegion = userInfo?.orgContext?.assignedRegion;
      const userTaxCenter = userInfo?.orgContext?.assignedTaxCenter;

      if (!userRegion || !userTaxCenter) {
        setMessage({ type: 'error', text: 'No assigned region or tax center' });
        return;
      }

      // Get stored cases
      const stored = (data.auditCases || []).filter(c =>
        c.storageStatus === 'STORED' &&
        c.region === userRegion &&
        c.taxCenter === userTaxCenter
      );

      setStoredCases(stored);

      // Group by audit type
      const grouped = {};
      stored.forEach(c => {
        if (!grouped[c.auditType]) {
          grouped[c.auditType] = [];
        }
        grouped[c.auditType].push(c);
      });
      setCasesByAuditType(grouped);

      // Load team leaders
      const tls = loadTeamLeaders(userRegion, userTaxCenter);
      setTeamLeaders(tls);

      // Load existing assignments
      const assignMap = {};
      stored.forEach(c => {
        const assignment = loadAssignment(c.id);
        if (assignment) {
          assignMap[c.id] = assignment;
        }
      });
      setAssignments(assignMap);

      console.log('✓ Loaded:', { stored: stored.length, teamLeaders: tls.length });
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Error loading data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCase = (caseId, teamLeaderId) => {
    try {
      const auditCase = storedCases.find(c => c.id === caseId);
      if (!auditCase) return;

      const tl = teamLeaders.find(t => t.id === teamLeaderId);
      if (!tl) return;

      // Create or update assignment
      let assignment = assignments[caseId];
      if (!assignment) {
        assignment = createAssignment({
          caseId,
          region: auditCase.region,
          taxCenter: auditCase.taxCenter,
          auditType: auditCase.auditType
        });
      }

      // Execute transition
      assignment = executeTransition(
        assignment,
        ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER,
        {
          toUser: teamLeaderId,
          fromUser: userInfo.fullName,
          reason: 'Manual assignment by Tax Center Manager'
        }
      );

      // Save assignment
      saveAssignment(assignment);

      // Update team leader workload
      updateTeamLeaderWorkload(teamLeaderId, 1);

      // Update local state
      setAssignments({ ...assignments, [caseId]: assignment });
      setMessage({ type: 'success', text: `Case assigned to ${tl.fullName}` });
    } catch (error) {
      console.error('Error assigning case:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleAutoAssignAll = () => {
    try {
      let successCount = 0;
      let errors = [];

      // For each audit type, assign to best available TL
      Object.entries(casesByAuditType).forEach(([auditType, cases]) => {
        const availableTLs = teamLeaders
          .filter(tl => tl.auditType === auditType && tl.currentWorkload < tl.maxCapacity)
          .sort((a, b) => a.currentWorkload - b.currentWorkload);

        if (availableTLs.length === 0) {
          errors.push(`No available team leaders for ${auditType}`);
          return;
        }

        const bestTL = availableTLs[0];

        cases.forEach(c => {
          try {
            handleAssignCase(c.id, bestTL.id);
            successCount++;
          } catch (err) {
            errors.push(`Failed to assign case ${c.id}: ${err.message}`);
          }
        });
      });

      const msg = successCount > 0
        ? `✓ Auto-assigned ${successCount} cases`
        : 'No cases auto-assigned';
      setMessage({ type: successCount > 0 ? 'success' : 'warning', text: msg });
    } catch (error) {
      console.error('Error auto-assigning:', error);
      setMessage({ type: 'error', text: 'Error auto-assigning cases' });
    }
  };

  const getBestTeamLeader = (auditType) => {
    const available = teamLeaders
      .filter(tl => tl.auditType === auditType && tl.currentWorkload < tl.maxCapacity)
      .sort((a, b) => a.currentWorkload - b.currentWorkload);

    return available.length > 0 ? available[0] : null;
  };

  const getCapacityColor = (tl) => {
    const percent = (tl.currentWorkload / tl.maxCapacity) * 100;
    if (percent >= 100) return '#ff5252'; // Red - full
    if (percent >= 80) return '#ff9800'; // Orange - high
    if (percent >= 60) return '#ffc107'; // Amber - medium
    return '#4caf50'; // Green - low
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-tasks"></i> Assign Stored Cases to Team Leaders</h2>
        <Badge status={`${storedCases.length} Cases`} className="director-approved" />
      </div>

      {message && (
        <div style={{
          background: message.type === 'success' ? '#c8e6c9' : message.type === 'error' ? '#ffcdd2' : '#fff9c4',
          color: message.type === 'success' ? '#2e7d32' : message.type === 'error' ? '#c62828' : '#f57f17',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '12px'
        }}>
          {message.text}
        </div>
      )}

      {storedCases.length === 0 ? (
        <div style={{
          background: '#e3f2fd',
          color: '#0c4a6e',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #1976d2'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
          <strong>No stored cases found</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            Cases will appear here after Process Owner stores them from Case Prioritization
          </p>
        </div>
      ) : (
        <>
          {/* Action buttons */}
          <div style={{
            background: '#1a3a1a',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={handleAutoAssignAll}
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
              <i className="fas fa-magic"></i> Auto-Assign All
            </button>
          </div>

          {/* Group by audit type */}
          {Object.entries(casesByAuditType).map(([auditType, cases]) => {
            const availableTLs = teamLeaders.filter(tl => tl.auditType === auditType);
            const bestTL = getBestTeamLeader(auditType);

            return (
              <div key={auditType} style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#f0f6fc',
                  marginBottom: '12px',
                  textTransform: 'uppercase'
                }}>
                  {auditType.replace(/_/g, ' ')} ({cases.length} cases)
                </h3>

                {/* Team Leaders for this audit type */}
                <div style={{
                  background: '#0f1419',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px'
                }}>
                  <small style={{ color: '#8b949e', display: 'block', marginBottom: '8px' }}>AVAILABLE TEAM LEADERS:</small>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {availableTLs.map(tl => (
                      <div key={tl.id} style={{
                        background: '#1c2128',
                        border: `1px solid ${getCapacityColor(tl)}`,
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        flex: 1,
                        minWidth: '150px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ color: '#f0f6fc' }}>{tl.fullName}</strong>
                          {bestTL?.id === tl.id && <span style={{ color: '#ffc107' }}>⭐ BEST</span>}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: '#8b949e',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>Workload: {tl.currentWorkload}/{tl.maxCapacity}</span>
                          <span style={{ color: getCapacityColor(tl) }}>
                            {Math.round((tl.currentWorkload / tl.maxCapacity) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cases for this audit type */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cases.map(c => {
                    const assignment = assignments[c.id];
                    const assignedTL = assignment ? teamLeaders.find(t => t.currentOwner === assignment.currentOwner) : null;

                    return (
                      <div key={c.id} style={{
                        background: '#1c2128',
                        border: '1px solid #30363d',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ color: '#f0f6fc', minWidth: '100px' }}>{c.id.substring(0, 20)}...</strong>
                            <span style={{
                              background: c.riskLevel === 'Critical' ? '#ff5252' :
                                c.riskLevel === 'High' ? '#ff9800' :
                                c.riskLevel === 'Medium' ? '#ffc107' : '#4caf50',
                              color: '#fff',
                              padding: '3px 8px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              {c.riskLevel}
                            </span>
                          </div>
                          <small style={{ color: '#8b949e' }}>
                            {c.taxpayerName} (TIN: {c.tin}) | Revenue: {((c.revenueAtRisk || 0) / 1000000).toFixed(1)}M | Hours: {c.estimatedHours}
                          </small>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {assignment ? (
                            <span style={{ color: '#4caf50', fontSize: '11px', fontWeight: 'bold' }}>
                              ✓ Assigned to {assignedTL?.fullName || 'TL'}
                            </span>
                          ) : (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignCase(c.id, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #30363d',
                                borderRadius: '4px',
                                background: '#0f1419',
                                color: '#f0f6fc',
                                fontSize: '11px',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">Assign to...</option>
                              {availableTLs
                                .filter(tl => tl.currentWorkload < tl.maxCapacity)
                                .map(tl => (
                                  <option key={tl.id} value={tl.id}>
                                    {tl.fullName} ({tl.currentWorkload}/{tl.maxCapacity})
                                  </option>
                                ))}
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div style={{
            background: '#e3f2fd',
            color: '#0c4a6e',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #1976d2',
            marginTop: '24px'
          }}>
            <strong><i className="fas fa-chart-bar"></i> Assignment Summary</strong>
            <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '12px' }}>
              Total Cases: <strong>{storedCases.length}</strong> |
              Assigned: <strong>{Object.keys(assignments).length}</strong> |
              Pending: <strong>{storedCases.length - Object.keys(assignments).length}</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AssignToTeamLeadersView;
