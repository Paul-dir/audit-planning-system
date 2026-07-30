import React, { useState, useEffect } from 'react';
import Card from '../../Card';
import Badge from '../../Badge';
import { loadData, saveData } from '../../../utils/data';
import { useAuth } from '../../../context/AuthContext';
import { loadTeamLeaders, loadAssignment, saveAssignment, updateTeamLeaderWorkload } from '../../../utils/assignmentData';
import { createAssignment, ASSIGNMENT_STATES } from '../../../utils/assignmentDataModels';
import { executeTransition } from '../../../utils/assignmentStateMachine';
import { intelligentDistributeCases, dynamicRerouteIfNeeded } from '../../../utils/intelligentCaseDistribution';

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
  const [assignmentSummary, setAssignmentSummary] = useState(null);

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
        c.status === 'STORED_FOR_ASSIGNMENT' &&
        c.region === userRegion &&
        c.taxCenter === userTaxCenter
      );

      setStoredCases(stored);

      // Group by audit type and sort each group by priorityRank
      const grouped = {};
      stored.forEach(c => {
        if (!grouped[c.auditType]) {
          grouped[c.auditType] = [];
        }
        grouped[c.auditType].push(c);
      });
      
      // Sort each audit type group by priorityRank (1 = highest priority)
      Object.keys(grouped).forEach(auditType => {
        grouped[auditType].sort((a, b) => (a.priorityRank || 999) - (b.priorityRank || 999));
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

      // Also update data.auditCases directly
      const data = loadData();
      const caseIdx = (data.auditCases || []).findIndex(c => c.id === caseId);
      if (caseIdx !== -1) {
        data.auditCases[caseIdx].status = 'ASSIGNED_TO_TEAM_LEADER';
        data.auditCases[caseIdx].assignedTeamLeader = tl.fullName || tl.full_name;
        data.auditCases[caseIdx].assignedTeamLeaderId = tl.id;
        saveData(data);
      }

      // Update local state
      setAssignments({ ...assignments, [caseId]: assignment });
      setMessage({ type: 'success', text: `Case assigned to ${tl.fullName}` });
    } catch (error) {
      console.error('Error assigning case:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const toggleCaseSelection = (caseId, e) => {
    e.stopPropagation();
    const newSelected = new Set(selectedCases);
    if (newSelected.has(caseId)) {
      newSelected.delete(caseId);
    } else {
      newSelected.add(caseId);
    }
    setSelectedCases(newSelected);
  };

  const handleAutoAssignSelected = () => {
    try {
      const data = loadData();
      
      // Initialize if needed
      if (!data.teamLeaders) data.teamLeaders = [];
      if (!data.assignments) data.assignments = [];

      // Get selected unassigned case IDs
      const unassignedStoredCaseIds = Array.from(selectedCases).filter(id => !assignments[id]);

      if (unassignedStoredCaseIds.length === 0) {
        setMessage({ type: 'warning', text: 'No unassigned cases selected' });
        return;
      }

      console.log('=== INTELLIGENT ASSIGNMENT START ===');
      
      // Use intelligent distribution algorithm
      const summaryList = intelligentDistributeCases(unassignedStoredCaseIds, data, userInfo);

      // Trigger dynamic re-routing to catch any other pending cases
      dynamicRerouteIfNeeded(data);

      // Save to localStorage
      saveData(data);
      console.log('=== INTELLIGENT ASSIGNMENT END ===');

      // Reload view
      loadCasesAndTeamLeaders();
      setAssignmentSummary(summaryList);
      setSelectedCases(new Set());
      
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
              onClick={handleAutoAssignSelected}
              disabled={selectedCases.size === 0}
              style={{
                padding: '8px 14px',
                background: selectedCases.size > 0 ? '#4caf50' : '#2e7d32',
                color: selectedCases.size > 0 ? '#fff' : '#aaa',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: selectedCases.size > 0 ? 'pointer' : 'not-allowed'
              }}
            >
              <i className="fas fa-magic"></i> Auto-Assign Selected ({selectedCases.size})
            </button>
            <button
              onClick={() => {
                const allUnassigned = storedCases.filter(c => !assignments[c.id]).map(c => c.id);
                if (selectedCases.size === allUnassigned.length) {
                  setSelectedCases(new Set());
                } else {
                  setSelectedCases(new Set(allUnassigned));
                }
              }}
              style={{
                padding: '8px 14px',
                background: '#1c2128',
                color: '#58a6ff',
                border: '1px solid #58a6ff',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Select All Unassigned
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
                        <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
                          {!assignment && (
                            <input 
                              type="checkbox" 
                              checked={selectedCases.has(c.id)}
                              onChange={(e) => toggleCaseSelection(c.id, e)}
                              style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                            />
                          )}
                          <div>
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

      {/* Assignment Summary Modal */}
      {assignmentSummary && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1c2128',
            borderRadius: '12px',
            width: '900px',
            maxWidth: '90%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #30363d',
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-check-circle" style={{ color: '#4caf50' }}></i> Intelligent Distribution Complete
              </h3>
              <button onClick={() => setAssignmentSummary(null)} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '16px' }}>✖</button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ color: '#8b949e', marginTop: 0, marginBottom: '20px' }}>
                Successfully distributed <strong>{assignmentSummary.length}</strong> cases across multiple Team Leaders with dynamic auditor routing.
              </p>

              {/* Summary stats */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Total Cases Distributed</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50', marginTop: '4px' }}>{assignmentSummary.length}</div>
                </div>
                <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Routed to Auditors</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#58a6ff', marginTop: '4px' }}>
                    {assignmentSummary.filter(s => s.status === 'ROUTED_TO_AUDITOR').length}
                  </div>
                </div>
                <div style={{ background: '#0f1419', padding: '12px', borderRadius: '6px', border: '1px solid #30363d' }}>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Awaiting Auditor</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffa500', marginTop: '4px' }}>
                    {assignmentSummary.filter(s => s.status === 'AWAITING_AUDITOR').length}
                  </div>
                </div>
              </div>

              {/* Detailed table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#0f1419', color: '#8b949e', textAlign: 'left' }}>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Rank</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Case ID</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Audit Type</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Team Leader</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d' }}>Assigned Auditor</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #30363d', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentSummary.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #30363d' }}>
                      <td style={{ padding: '12px', color: '#f0f6fc', fontWeight: 'bold' }}>{s.rank}</td>
                      <td style={{ padding: '12px', color: '#f0f6fc' }}>{s.caseId.substring(0, 12)}...</td>
                      <td style={{ padding: '12px', color: '#8b949e' }}>{s.auditType}</td>
                      <td style={{ padding: '12px', color: '#58a6ff', fontWeight: 'bold' }}>{s.teamLeader}</td>
                      <td style={{ padding: '12px', color: s.auditor === '(Pending)' ? '#ffa500' : '#4caf50' }}>
                        {s.auditor}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          background: s.status === 'ROUTED_TO_AUDITOR' ? '#4caf50' : '#ff9800',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '3px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}>
                          {s.status === 'ROUTED_TO_AUDITOR' ? '✓ Routed' : '⏳ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p style={{ color: '#8b949e', marginTop: '16px', fontSize: '12px', fontStyle: 'italic' }}>
                <i className="fas fa-info-circle"></i> Cases are intelligently distributed to Team Leaders based on audit type and capacity. 
                Available auditors are automatically routed cases in real-time. Cases awaiting auditors will be routed when auditor capacity becomes available.
              </p>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #30363d', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setAssignmentSummary(null)} style={{ padding: '8px 16px', background: '#2196f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssignToTeamLeadersView;
