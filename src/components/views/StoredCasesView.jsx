import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData, saveData } from '../../utils/data';

/**
 * StoredCasesView - Process Owner
 * View all cases stored for audit execution
 */

function StoredCasesView() {
  const [storedCases, setStoredCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  
  // Filters
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterAuditType, setFilterAuditType] = useState('All');
  const [filterRiskLevel, setFilterRiskLevel] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting & Pagination
  const [sortBy, setSortBy] = useState('stored_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load stored cases
  useEffect(() => {
    loadStoredCases();
  }, []);

  const loadStoredCases = () => {
    const data = loadData();
    const cases = data.storedAuditCases || [];
    
    console.log('📦 StoredCasesView - Cases loaded:', {
      total: cases.length,
      cases: cases.map(c => ({ id: c.id, taxpayer: c.taxpayerName, storedId: c.storedId }))
    });
    
    setStoredCases(cases);
  };

  // Apply filters
  useEffect(() => {
    let filtered = storedCases;

    if (filterBranch !== 'All') {
      filtered = filtered.filter(c => c.region === filterBranch);
    }

    if (filterAuditType !== 'All') {
      filtered = filtered.filter(c => c.auditType === filterAuditType);
    }

    if (filterRiskLevel !== 'All') {
      filtered = filtered.filter(c => c.riskLevel === filterRiskLevel);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.tin.includes(searchTerm) ||
        c.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.includes(searchTerm)
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal, bVal;
      
      if (sortBy === 'stored_date') {
        aVal = new Date(a.storedDate || '');
        bVal = new Date(b.storedDate || '');
      } else if (sortBy === 'risk_score') {
        const riskOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        aVal = riskOrder[a.riskLevel] || 0;
        bVal = riskOrder[b.riskLevel] || 0;
      } else if (sortBy === 'taxpayer_name') {
        aVal = a.taxpayerName;
        bVal = b.taxpayerName;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredCases(sorted);
    setCurrentPage(1);
  }, [storedCases, filterBranch, filterAuditType, filterRiskLevel, searchTerm, sortBy, sortOrder]);

  // Get unique filter options
  const getBranches = () => ['All', ...new Set(storedCases.map(c => c.region))];
  const getAuditTypes = () => ['All', ...new Set(storedCases.map(c => c.auditType))];
  const getRiskLevels = () => ['All', 'Critical', 'High', 'Medium', 'Low'];

  // Calculate statistics
  const getStats = () => {
    const riskLevels = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    const auditTypes = {};
    let totalRevenue = 0;
    
    filteredCases.forEach(c => {
      if (riskLevels.hasOwnProperty(c.riskLevel)) riskLevels[c.riskLevel]++;
      auditTypes[c.auditType] = (auditTypes[c.auditType] || 0) + 1;
      totalRevenue += c.revenueAtRisk || 0;
    });

    return { riskLevels, auditTypes, totalRevenue };
  };

  // Remove a stored case
  const handleRemoveCase = (storedId) => {
    if (!window.confirm('Remove this case from storage?')) return;

    const data = loadData();
    data.storedAuditCases = data.storedAuditCases.filter(c => c.storedId !== storedId);
    saveData(data);
    
    loadStoredCases();
    alert('✓ Case removed from storage');
  };

  // Pagination
  const paginatedCases = filteredCases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const stats = getStats();

  const getRiskColor = (riskLevel) => {
    const colors = {
      'Critical': '#ff5252',
      'High': '#ff9800',
      'Medium': '#ffc107',
      'Low': '#4caf50'
    };
    return colors[riskLevel] || '#999';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-folder-open"></i> Stored Cases</h2>
        <Badge status={`${filteredCases.length} Cases`} className="director-approved" />
      </div>

      {storedCases.length === 0 ? (
        <div style={{
          background: '#1c2128',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #30363d'
        }}>
          <i className="fas fa-inbox" style={{ fontSize: '48px', color: '#8b949e', marginBottom: '16px', display: 'block' }}></i>
          <h3 style={{ color: '#f0f6fc', margin: '0 0 8px 0' }}>No Stored Cases Yet</h3>
          <p style={{ color: '#8b949e', margin: 0 }}>
            Go to "Audit Case Selection" to select and store cases for audit execution.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Info */}
          <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2' }}>
            <strong style={{ color: '#0c4a6e' }}><i className="fas fa-check-circle"></i> Stored Cases Ready for Audit</strong>
            <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
              These cases have been selected and stored for audit execution. 
              Total stored: <strong>{storedCases.length}</strong> cases | Displayed: <strong>{filteredCases.length}</strong>
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="cards" style={{ marginBottom: '24px' }}>
            <Card title="Total Stored" number={filteredCases.length} icon="fas fa-inbox" />
            <Card title="Critical Risk" number={stats.riskLevels.Critical} icon="fas fa-exclamation-circle" />
            <Card title="High Risk" number={stats.riskLevels.High} icon="fas fa-warning" />
            <Card title="Revenue at Risk" number={`${(stats.totalRevenue / 1000000).toFixed(1)}M`} icon="fas fa-money-bill" />
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
              placeholder="Search TIN, name, or case ID..."
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

            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}>
              {getBranches().map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>

            <select value={filterAuditType} onChange={(e) => setFilterAuditType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}>
              {getAuditTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select value={filterRiskLevel} onChange={(e) => setFilterRiskLevel(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}>
              {getRiskLevels().map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setFilterBranch('All');
                setFilterAuditType('All');
                setFilterRiskLevel('All');
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

          {/* Sort Options */}
          <div style={{
            background: '#0f1419',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '12px',
            color: '#8b949e'
          }}>
            <span>Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #30363d',
                borderRadius: '4px',
                background: '#1c2128',
                color: '#f0f6fc',
                fontSize: '11px'
              }}>
              <option value="stored_date">Storage Date (Newest)</option>
              <option value="risk_score">Risk Score</option>
              <option value="taxpayer_name">Taxpayer Name</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '4px 8px',
                border: '1px solid #30363d',
                borderRadius: '4px',
                background: '#1c2128',
                color: '#8b949e',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              {sortOrder === 'desc' ? '↓ Descending' : '↑ Ascending'}
            </button>
          </div>

          {/* Cases Table */}
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>STORED ID</th>
                  <th>CASE ID</th>
                  <th>TIN</th>
                  <th>TAXPAYER</th>
                  <th>BRANCH</th>
                  <th>AUDIT TYPE</th>
                  <th>RISK</th>
                  <th>REVENUE</th>
                  <th>STORED DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCases.map(auditCase => (
                  <tr key={auditCase.storedId}>
                    <td><strong style={{ color: '#4caf50' }}>{auditCase.storedId?.substring(0, 20)}...</strong></td>
                    <td>{auditCase.id?.substring(0, 25)}...</td>
                    <td>{auditCase.tin}</td>
                    <td>{auditCase.taxpayerName}</td>
                    <td>{auditCase.region}</td>
                    <td>{auditCase.auditType}</td>
                    <td>
                      <span style={{
                        background: getRiskColor(auditCase.riskLevel),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {auditCase.riskLevel}
                      </span>
                    </td>
                    <td>{(auditCase.revenueAtRisk / 1000000).toFixed(1)}M</td>
                    <td style={{ fontSize: '11px', color: '#8b949e' }}>{formatDate(auditCase.storedDate)}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveCase(auditCase.storedId)}
                        style={{
                          padding: '4px 8px',
                          background: '#f44336',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
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
            <span>Showing {paginatedCases.length} of {filteredCases.length} cases</span>
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

          {/* Summary */}
          <div style={{
            background: '#1a3a1a',
            color: '#4caf50',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #388e3c'
          }}>
            <strong><i className="fas fa-chart-bar"></i> Stored Cases Summary</strong>
            <p style={{ color: '#a8d5a8', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
              Total Stored: <strong>{storedCases.length}</strong> | 
              Critical Risk: <strong>{stats.riskLevels.Critical}</strong> | 
              High Risk: <strong>{stats.riskLevels.High}</strong> | 
              Total Revenue at Risk: <strong>{(stats.totalRevenue / 1000000).toFixed(1)}M ETB</strong>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default StoredCasesView;
