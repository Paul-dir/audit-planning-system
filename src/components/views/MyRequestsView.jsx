import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';
import { useAuth } from '../../context/AuthContext';

/**
 * MyRequestsView
 * View and manage requests submitted by current requester
 */

function MyRequestsView({ userRole }) {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filters
  const [filterRequestType, setFilterRequestType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const data = loadData();
    const requests = (data.auditRequests || []).filter(r => r.submittedBy === userInfo?.fullName);

    console.log('📋 MyRequestsView - Requests loaded:', {
      total: requests.length,
      requester: userInfo?.fullName,
      requests: requests.map(r => ({ id: r.id, taxpayer: r.taxpayerName, status: r.status }))
    });

    setAllRequests(requests);
  };

  // Apply filters
  useEffect(() => {
    let filtered = allRequests;

    if (filterRequestType !== 'All') {
      filtered = filtered.filter(r => r.requestType === filterRequestType);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.tin.includes(searchTerm) ||
        r.id.includes(searchTerm)
      );
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));

    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [allRequests, filterRequestType, filterStatus, searchTerm]);

  // Get unique filter options
  const getRequestTypes = () => ['All', ...new Set(allRequests.map(r => r.requestType))];
  const getStatuses = () => ['All', 'PENDING_REVIEW', 'UNDER_ASSESSMENT', 'APPROVED_SCHEDULED', 'REJECTED', 'CLOSED'];

  // Calculate statistics
  const getStats = () => {
    const statuses = {
      'PENDING_REVIEW': 0,
      'UNDER_ASSESSMENT': 0,
      'APPROVED_SCHEDULED': 0,
      'REJECTED': 0,
      'CLOSED': 0
    };

    allRequests.forEach(r => {
      if (statuses.hasOwnProperty(r.status)) statuses[r.status]++;
    });

    return statuses;
  };

  const handleWithdraw = (request) => {
    if (request.status !== 'PENDING_REVIEW') {
      alert('Only pending requests can be withdrawn');
      return;
    }

    const data = loadData();
    const reqIndex = data.auditRequests.findIndex(r => r.id === request.id);

    if (reqIndex >= 0) {
      data.auditRequests[reqIndex].status = 'CLOSED';
      data.auditRequests[reqIndex].lastModified = new Date().toISOString();
      saveData(data);

      console.log('✓ Request withdrawn:', request.id);
      alert('✓ Request has been withdrawn');
      loadRequests();
      setSelectedRequest(null);
    }
  };

  const stats = getStats();

  const getStatusColor = (status) => {
    const colors = {
      'PENDING_REVIEW': '#ffb74d',
      'UNDER_ASSESSMENT': '#4a8fd9',
      'APPROVED_SCHEDULED': '#4caf50',
      'REJECTED': '#f44336',
      'CLOSED': '#9e9e9e'
    };
    return colors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING_REVIEW': 'Pending Review',
      'UNDER_ASSESSMENT': 'Under Assessment',
      'APPROVED_SCHEDULED': 'Approved & Scheduled',
      'REJECTED': 'Rejected',
      'CLOSED': 'Closed'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': '#ff5252',
      'Medium': '#ffc107',
      'Low': '#4caf50'
    };
    return colors[priority] || '#999';
  };

  // Pagination
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  if (selectedRequest) {
    return (
      <div style={{ padding: '24px' }}>
        <button
          onClick={() => setSelectedRequest(null)}
          style={{
            padding: '8px 16px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            background: '#0f1419',
            color: '#8b949e',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px'
          }}
        >
          <i className="fas fa-arrow-left"></i> Back to Requests
        </button>

        <div className="detail-header">
          <h2><i className="fas fa-file-alt"></i> Request Details</h2>
          <Badge status={getStatusLabel(selectedRequest.status)} className="director-approved" />
        </div>

        <div style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px 0' }}>REQUEST ID</p>
              <p style={{ color: '#f0f6fc', fontSize: '13px', fontWeight: '600', margin: '0', fontFamily: 'monospace' }}>{selectedRequest.id}</p>
            </div>
            <div>
              <p style={{ color: '#8b949e', fontSize: '12px', margin: '0 0 4px 0' }}>STATUS</p>
              <span style={{
                background: getStatusColor(selectedRequest.status),
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {getStatusLabel(selectedRequest.status)}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #30363d', paddingTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: '#f0f6fc', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Taxpayer Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>TAXPAYER NAME</p>
                <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0' }}>{selectedRequest.taxpayerName}</p>
              </div>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>TIN</p>
                <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0', fontFamily: 'monospace' }}>{selectedRequest.tin}</p>
              </div>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>REQUEST TYPE</p>
                <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0' }}>{selectedRequest.requestType}</p>
              </div>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>REGION</p>
                <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0' }}>{selectedRequest.region}</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #30363d', paddingTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: '#f0f6fc', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Request Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>PRIORITY</p>
                <span style={{
                  background: getPriorityColor(selectedRequest.priority),
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'inline-block'
                }}>
                  {selectedRequest.priority}
                </span>
              </div>
              <div>
                <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>SUBMITTED DATE</p>
                <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0' }}>
                  {new Date(selectedRequest.submittedDate).toLocaleDateString()} {new Date(selectedRequest.submittedDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #30363d', paddingTop: '16px', marginBottom: '16px' }}>
            <h3 style={{ color: '#f0f6fc', margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600' }}>Reason & Justification</h3>
            <div style={{ marginBottom: '12px' }}>
              <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>REASON</p>
              <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedRequest.reason}</p>
            </div>
            <div>
              <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>JUSTIFICATION</p>
              <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedRequest.justification}</p>
            </div>
          </div>

          {selectedRequest.supportingNotes && (
            <div style={{ borderTop: '1px solid #30363d', paddingTop: '16px', marginBottom: '16px' }}>
              <p style={{ color: '#8b949e', fontSize: '11px', margin: '0 0 4px 0' }}>SUPPORTING NOTES</p>
              <p style={{ color: '#f0f6fc', fontSize: '13px', margin: '0', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{selectedRequest.supportingNotes}</p>
            </div>
          )}

          {selectedRequest.status === 'APPROVED_SCHEDULED' && selectedRequest.auditCaseId && (
            <div style={{ background: '#1a3a1a', border: '1px solid #4caf50', borderRadius: '6px', padding: '12px', marginTop: '16px' }}>
              <p style={{ color: '#4caf50', fontSize: '12px', margin: '0' }}>
                <strong>✓ Audit case created:</strong> {selectedRequest.auditCaseId}
              </p>
            </div>
          )}

          {selectedRequest.status === 'PENDING_REVIEW' && (
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleWithdraw(selectedRequest)}
                style={{
                  padding: '10px 16px',
                  background: '#f44336',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-times"></i> Withdraw Request
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-list"></i> My Requests</h2>
        <Badge status={`${filteredRequests.length} Requests`} className="director-approved" />
      </div>

      {/* Summary Info */}
      <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2' }}>
        <strong style={{ color: '#0c4a6e' }}><i className="fas fa-info-circle"></i> Your Audit Requests</strong>
        <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Track all audit requests you have submitted. Total Requests: <strong>{allRequests.length}</strong> | 
          Displayed: <strong>{filteredRequests.length}</strong>
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="cards" style={{ marginBottom: '24px' }}>
        <Card title="Total Submitted" number={allRequests.length} icon="fas fa-inbox" />
        <Card title="Pending Review" number={stats['PENDING_REVIEW']} icon="fas fa-hourglass-half" />
        <Card title="Approved" number={stats['APPROVED_SCHEDULED']} icon="fas fa-check-circle" />
        <Card title="Rejected" number={stats['REJECTED']} icon="fas fa-times-circle" />
      </div>

      {/* Filters */}
      <div style={{
        background: '#1c2128',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search TIN, name, or request ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '180px',
            padding: '8px 12px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            background: '#0f1419',
            color: '#f0f6fc',
            fontSize: '12px'
          }}
        />

        <select value={filterRequestType} onChange={(e) => setFilterRequestType(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            background: '#0f1419',
            color: '#f0f6fc',
            fontSize: '12px'
          }}>
          {getRequestTypes().map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            background: '#0f1419',
            color: '#f0f6fc',
            fontSize: '12px'
          }}>
          {getStatuses().map(status => (
            <option key={status} value={status}>{status === 'All' ? 'All Statuses' : getStatusLabel(status)}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearchTerm('');
            setFilterRequestType('All');
            setFilterStatus('All');
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid #30363d',
            borderRadius: '6px',
            background: '#0f1419',
            color: '#8b949e',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div style={{
          background: '#1c2128',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #30363d',
          textAlign: 'center'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '32px', color: '#8b949e', marginBottom: '12px', display: 'block' }}></i>
          <p style={{ color: '#8b949e', margin: '0', fontSize: '13px' }}>No requests found</p>
        </div>
      ) : (
        <>
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>TAXPAYER</th>
                  <th>TIN</th>
                  <th>TYPE</th>
                  <th>PRIORITY</th>
                  <th>SUBMITTED DATE</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map(request => (
                  <tr key={request.id}>
                    <td><strong style={{ color: '#4caf50' }}>{request.id?.substring(0, 20)}...</strong></td>
                    <td>{request.taxpayerName}</td>
                    <td>{request.tin}</td>
                    <td>{request.requestType}</td>
                    <td>
                      <span style={{
                        background: getPriorityColor(request.priority),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {request.priority}
                      </span>
                    </td>
                    <td style={{ fontSize: '11px', color: '#8b949e' }}>
                      {new Date(request.submittedDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span style={{
                        background: getStatusColor(request.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusLabel(request.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        style={{
                          padding: '4px 8px',
                          background: '#2196f3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            fontSize: '12px',
            color: '#8b949e'
          }}>
            <span>Showing {paginatedRequests.length} of {filteredRequests.length} requests</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    background: currentPage === page ? '#4a8fd9' : '#0f1419',
                    color: currentPage === page ? '#fff' : '#8b949e',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Summary */}
      <div style={{
        background: '#1a3a1a',
        color: '#4caf50',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #388e3c',
        marginTop: '24px'
      }}>
        <strong><i className="fas fa-chart-bar"></i> Request Summary</strong>
        <p style={{ color: '#a8d5a8', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
          Total Submitted: <strong>{allRequests.length}</strong> | 
          Pending: <strong>{stats['PENDING_REVIEW']}</strong> | 
          Approved: <strong>{stats['APPROVED_SCHEDULED']}</strong> | 
          Rejected: <strong>{stats['REJECTED']}</strong>
        </p>
      </div>
    </div>
  );
}

export default MyRequestsView;
