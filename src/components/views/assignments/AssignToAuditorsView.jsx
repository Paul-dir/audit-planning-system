import React, { useState, useEffect } from 'react';
import Card from '../../Card';
import Badge from '../../Badge';
import { loadData, saveData } from '../../../utils/data';
import { useAuth } from '../../../context/AuthContext';
import {
  loadAssignmentsByUser,
  loadAuditors,
  loadAuditor,
  loadAssignment,
  saveAssignment,
  updateAuditorWorkload,
  updateTeamLeaderWorkload,
  loadTeamLeader
} from '../../../utils/assignmentData';
import { createAssignment, ASSIGNMENT_STATES } from '../../../utils/assignmentDataModels';
import { executeTransition } from '../../../utils/assignmentStateMachine';
import { rankAuditors } from '../../../utils/assignmentScoring';

/**
 * AssignToAuditorsView - Team Leader
 * Displays cases assigned to team leader and recommends auditors
 * Team leader selects auditor to assign case to
 */

function AssignToAuditorsView() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  const [myAuditors, setMyAuditors] = useState([]);
  const [casesByTeamLeader, setCasesByTeamLeader] = useState([]);
  const [recommendations, setRecommendations] = useState({});
  const [selectedAuditor, setSelectedAuditor] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [expandedCase, setExpandedCase] = useState(null);

  useEffect(() => {
    loadCasesAndAuditors();
  }, []);

  const loadCasesAndAuditors = () => {
    try {
      setLoading(true);
      const userRegion = userInfo?.orgContext?.assignedRegion;
      const userTaxCenter = userInfo?.orgContext?.assignedTaxCenter;
      const tlId = userInfo?.id;

      if (!userRegion || !userTaxCenter || !tlId) {
        setMessage({ type: 'error', text: 'Missing assignment context' });
        return;
      }

      // Load my auditors
      const auditors = loadAuditors(tlId);
      setMyAuditors(auditors);

      // Load my assigned cases (ASSIGNED_TO_TEAM_LEADER state)
      const myAssignments = loadAssignmentsByUser(tlId, 'TEAM_LEADER');
      const data = loadData();

      const cases = myAssignments
        .map(assignment => {
          const auditCase = (data.auditCases || []).find(c => c.id === assignment.caseId);
          return { ...auditCase, assignment };
        })
        .filter(c => c !== undefined);

      setCasesByTeamLeader(cases);

      // Generate recommendations for each case
      const recs = {};
      cases.forEach(c => {
        if (auditors.length > 0) {
          const ranked = rankAuditors(c, auditors, tlId);
          recs[c.id] = ranked.slice(0, 3); // Top 3
        }
      });
      setRecommendations(recs);

      console.log('✓ Loaded:', {
        auditors: auditors.length,
        cases: cases.length,
        recommendations: Object.keys(recs).length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Error loading data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToAuditor = (caseId, auditorId) => {
    try {
      const auditCase = casesByTeamLeader.find(c => c.id === caseId);
      const auditor = myAuditors.find(a => a.id === auditorId);

      if (!auditCase || !auditor) {
        throw new Error('Invalid case or auditor');
      }

      // Check capacity
      if (auditor.currentWorkload >= auditor.maxCapacity) {
        setMessage({
          type: 'error',
          text: `${auditor.fullName} is at capacity (${auditor.currentWorkload}/${auditor.maxCapacity})`
        });
        return;
      }

      // Get or create assignment
      let assignment = auditCase.assignment;
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
        ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR,
        {
          toUser: auditorId,
          fromUser: userInfo.id,
          reason: `Assigned by Team Leader ${userInfo.fullName} based on recommendations`
        }
      );

      // Save assignment
      saveAssignment(assignment);

      // Update auditor workload
      updateAuditorWorkload(auditorId, 1);

      // Update case in local state
      setCasesByTeamLeader(
        casesByTeamLeader.map(c =>
          c.id === caseId ? { ...c, assignment } : c
        )
      );

      setMessage({
        type: 'success',
        text: `Case assigned to ${auditor.fullName}`
      });
    } catch (error) {
      console.error('Error assigning case:', error);
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleBulkAssign = () => {
    try {
      let successCount = 0;
      let errors = [];

      casesByTeamLeader.forEach(c => {
        if (c.assignment?.currentState === ASSIGNMENT_STATES.ASSIGNED_TO_TEAM_LEADER) {
          const recs = recommendations[c.id] || [];
          if (recs.length > 0) {
            try {
              handleAssignToAuditor(c.id, recs[0].id);
              successCount++;
            } catch (err) {
              errors.push(`Failed to assign ${c.id}: ${err.message}`);
            }
          }
        }
      });

      const msg = successCount > 0
        ? `✓ Bulk-assigned ${successCount} cases to recommended auditors`
        : 'No cases to assign';
      setMessage({ type: successCount > 0 ? 'success' : 'warning', text: msg });
    } catch (error) {
      console.error('Error bulk assigning:', error);
      setMessage({ type: 'error', text: 'Error bulk-assigning cases' });
    }
  };

  const getAuditorColor = (auditor) => {
    const percent = (auditor.currentWorkload / auditor.maxCapacity) * 100;
    if (percent >= 100) return '#ff5252';
    if (percent >= 80) return '#ff9800';
    if (percent >= 60) return '#ffc107';
    return '#4caf50';
  };

  const getMatchBreakdown = (auditor, caseData) => {
    const recs = recommendations[caseData.id] || [];
    const rec = recs.find(r => r.id === auditor.id);
    if (!rec) return null;

    return {
      skillsMatch: rec.skillsScore || 0,
      workloadScore: rec.workloadScore || 0,
      sectorScore: rec.sectorScore || 0,
      complexityScore: rec.complexityScore || 0,
      totalScore: rec.totalScore || 0
    };
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-random"></i> Assign Cases to Auditors</h2>
        <Badge status={`${casesByTeamLeader.length} Cases`} className="director-approved" />
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

      <div style={{
        background: '#1a3a1a',
        padding: '12px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={handleBulkAssign}
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
          <i className="fas fa-magic"></i> Bulk Assign to Recommended
        </button>
      </div>

      {casesByTeamLeader.length === 0 ? (
        <div style={{
          background: '#e3f2fd',
          color: '#0c4a6e',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #1976d2'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
          <strong>No cases to assign</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>
            Cases will appear here after Tax Center Manager assigns them to your team
          </p>
        </div>
      ) : (
        <>
          {/* My Auditors Summary */}
          <div style={{
            background: '#0f1419',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px'
          }}>
            <small style={{ color: '#8b949e', display: 'block', marginBottom: '8px' }}>MY AUDIT TEAM ({myAuditors.length}):</small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {myAuditors.map(auditor => (
                <div key={auditor.id} style={{
                  background: '#1c2128',
                  border: `1px solid ${getAuditorColor(auditor)}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  flex: '1 1 200px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#f0f6fc' }}>{auditor.fullName}</strong>
                  </div>
                  <div style={{ fontSize: '10px', color: '#8b949e', marginBottom: '4px' }}>
                    <strong>Seniority:</strong> {auditor.seniority}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#8b949e',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>Workload: {auditor.currentWorkload}/{auditor.maxCapacity}</span>
                    <span style={{ color: getAuditorColor(auditor) }}>
                      {Math.round((auditor.currentWorkload / auditor.maxCapacity) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases to Assign */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {casesByTeamLeader.map(c => {
              const topRecs = recommendations[c.id] || [];
              const isAssigned = c.assignment?.currentState === ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR;

              return (
                <div key={c.id} style={{
                  background: '#1c2128',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  {/* Case Header */}
                  <div
                    onClick={() => setExpandedCase(expandedCase === c.id ? null : c.id)}
                    style={{
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      background: expandedCase === c.id ? '#2d333b' : 'transparent'
                    }}
                  >
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
                        <span style={{ fontSize: '10px', color: '#8b949e' }}>
                          {c.auditType.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <small style={{ color: '#8b949e' }}>
                        {c.taxpayerName} (TIN: {c.tin}) | Est: {c.estimatedHours}hrs
                      </small>
                    </div>
                    <div style={{ color: '#8b949e' }}>
                      {isAssigned ? (
                        <span style={{ color: '#4caf50' }}>✓ Assigned</span>
                      ) : (
                        <i className="fas fa-chevron-down"></i>
                      )}
                    </div>
                  </div>

                  {/* Expanded: Recommendations */}
                  {expandedCase === c.id && !isAssigned && (
                    <div style={{
                      background: '#0f1419',
                      borderTop: '1px solid #30363d',
                      padding: '12px',
                      borderRadius: '0 0 6px 6px'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <small style={{ color: '#8b949e', fontWeight: 'bold' }}>TOP RECOMMENDED AUDITORS:</small>
                      </div>

                      {topRecs.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                          {topRecs.map((rec, idx) => {
                            const auditor = myAuditors.find(a => a.id === rec.id);
                            const breakdown = getMatchBreakdown(auditor, c);

                            return (
                              <div key={rec.id} style={{
                                background: '#1c2128',
                                border: '1px solid #30363d',
                                borderRadius: '6px',
                                padding: '10px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '6px'
                                  }}>
                                    <span style={{ color: '#ffc107', fontWeight: 'bold' }}>
                                      {idx === 0 ? '⭐' : idx === 1 ? '⭐⭐' : '⭐⭐⭐'}
                                    </span>
                                    <strong style={{ color: '#f0f6fc' }}>{auditor?.fullName}</strong>
                                    <span style={{
                                      background: '#2e7d32',
                                      color: '#fff',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      fontSize: '10px',
                                      fontWeight: 'bold'
                                    }}>
                                      {rec.totalScore}% match
                                    </span>
                                  </div>

                                  {breakdown && (
                                    <div style={{
                                      fontSize: '10px',
                                      color: '#8b949e',
                                      display: 'grid',
                                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                      gap: '4px'
                                    }}>
                                      <span>Skills: <strong style={{ color: '#4caf50' }}>{breakdown.skillsMatch}%</strong></span>
                                      <span>Workload: <strong style={{ color: '#ffc107' }}>{breakdown.workloadScore}%</strong></span>
                                      <span>Sector: <strong style={{ color: '#ff9800' }}>{breakdown.sectorScore}%</strong></span>
                                      <span>Complexity: <strong style={{ color: '#9c27b0' }}>{breakdown.complexityScore}%</strong></span>
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleAssignToAuditor(c.id, auditor.id)}
                                  disabled={auditor.currentWorkload >= auditor.maxCapacity}
                                  style={{
                                    padding: '6px 12px',
                                    background: auditor.currentWorkload >= auditor.maxCapacity ? '#666' : '#4caf50',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    cursor: auditor.currentWorkload >= auditor.maxCapacity ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {auditor.currentWorkload >= auditor.maxCapacity ? 'AT CAPACITY' : 'Assign'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ color: '#ff5252', fontSize: '11px', marginBottom: '12px' }}>
                          No recommendations available for this case
                        </div>
                      )}

                      {/* Manual Selection Fallback */}
                      <div>
                        <label style={{
                          fontSize: '11px',
                          color: '#8b949e',
                          display: 'block',
                          marginBottom: '6px'
                        }}>
                          Or select different auditor:
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssignToAuditor(c.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            background: '#0f1419',
                            color: '#f0f6fc',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Choose auditor...</option>
                          {myAuditors
                            .filter(a => a.currentWorkload < a.maxCapacity)
                            .map(a => (
                              <option key={a.id} value={a.id}>
                                {a.fullName} ({a.currentWorkload}/{a.maxCapacity})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Assigned Status */}
                  {isAssigned && (
                    <div style={{
                      background: '#0f1419',
                      borderTop: '1px solid #30363d',
                      padding: '12px',
                      borderRadius: '0 0 6px 6px'
                    }}>
                      <span style={{ color: '#4caf50', fontSize: '11px', fontWeight: 'bold' }}>
                        ✓ Assigned to {
                          myAuditors.find(a => a.id === c.assignment?.currentOwner)?.fullName || 'Auditor'
                        }
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

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
              Total Cases: <strong>{casesByTeamLeader.length}</strong> |
              Assigned: <strong>{casesByTeamLeader.filter(c => c.assignment?.currentState === ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR).length}</strong> |
              Pending: <strong>{casesByTeamLeader.filter(c => c.assignment?.currentState !== ASSIGNMENT_STATES.ASSIGNED_TO_AUDITOR).length}</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AssignToAuditorsView;
