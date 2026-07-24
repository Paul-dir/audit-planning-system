import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';

function AuditCasesListView() {
  const { assignedTaxCenter, assignedTaxCenterRegion } = useRegional();
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Use user's assigned region and tax center from auth context
  const selectedRegion = userInfo?.orgContext?.assignedRegion || assignedTaxCenterRegion || 'Oromia';
  const selectedTaxCenter = userInfo?.orgContext?.assignedTaxCenter || assignedTaxCenter || 'Tax Center 1';
  
  const [allCases, setAllCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [filterAuditType, setFilterAuditType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [localStorageTrigger, setLocalStorageTrigger] = useState(0);

  useEffect(() => {
    // Watch for localStorage changes
    const handleStorageChange = () => {
      console.log('📍 Storage changed, re-reading tax center assignment');
      setLocalStorageTrigger(prev => prev + 1);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Store selected tax center in localStorage whenever it changes
  useEffect(() => {
    if (selectedTaxCenter && selectedRegion) {
      localStorage.setItem('tax_center_selection', selectedTaxCenter);
      localStorage.setItem('tax_center_selection_region', selectedRegion);
      console.log('📍 Tax Center Selection Updated:', { selectedTaxCenter, selectedRegion });
      loadCases();
    }
  }, [selectedTaxCenter, selectedRegion]);

  useEffect(() => {
    filterCases();
  }, [allCases, filterAuditType, filterStatus, searchTerm]);

  const loadCases = () => {
    const data = loadData();
    const cases = data.auditCases || [];
    
    console.log('🔍 AuditCasesListView - Loading cases:', {
      totalCasesInSystem: cases.length,
      selectedTaxCenter,
      selectedRegion,
      allCases: cases.map(c => ({ id: c.id, taxCenter: c.taxCenter, region: c.region }))
    });
    
    // Filter to only show cases for THIS tax center
    const taxCenterCases = cases.filter(c => 
      c.taxCenter === selectedTaxCenter && 
      c.region === selectedRegion
    );
    
    console.log('📋 Filtered cases for selected tax center:', {
      count: taxCenterCases.length,
      filter: { taxCenter: selectedTaxCenter, region: selectedRegion },
      filtered: taxCenterCases.map(c => ({ id: c.id, tin: c.tin, name: c.taxpayerName }))
    });
    
    setAllCases(taxCenterCases);
    setLoading(false);
  };

  const filterCases = () => {
    let filtered = allCases;

    if (filterAuditType !== 'All') {
      filtered = filtered.filter(c => c.auditType === filterAuditType);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.tin.includes(searchTerm) || 
        c.taxpayerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.includes(searchTerm)
      );
    }

    setFilteredCases(filtered);
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'Critical': '#ff5252',
      'High': '#ff9800',
      'Medium': '#ffc107',
      'Low': '#4caf50'
    };
    return colors[riskLevel] || '#999';
  };

  const getStatusColor = (status) => {
    const colors = {
      'ASSIGNED': '#ffb74d',      // Pending - newly assigned
      'IN_PROGRESS': '#4a8fd9',   // Active - being worked on
      'CLOSED': '#4caf50',        // Completed
      'Created': '#ffb74d'        // Fallback for old status
    };
    return colors[status] || '#999';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ASSIGNED': 'Assigned',
      'IN_PROGRESS': 'In Progress',
      'CLOSED': 'Closed',
      'Created': 'Created'
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading audit cases...</div>;
  }

  // Show selected tax center's cases
  const casesToShow = allCases;

  const auditTypes = [...new Set(allCases.map(c => c.auditType))];
  const statuses = [...new Set(allCases.map(c => c.status))];

  return (
    <div style={{ padding: '24px' }}>
      <div className="detail-header">
        <h2><i className="fas fa-briefcase"></i> Audit Cases</h2>
        <Badge status={`${casesToShow.length} Cases`} className="director-approved" />
      </div>

      {/* Region & Tax Center Selector */}
      <div style={{
        background: '#1c2128',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #30363d',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#f0f6fc', whiteSpace: 'nowrap' }}>
          <i className="fas fa-map-marker-alt"></i> Region: <strong style={{ color: '#4caf50' }}>{selectedRegion}</strong>
        </div>

        <div style={{ fontSize: '12px', fontWeight: '600', color: '#f0f6fc', whiteSpace: 'nowrap', marginLeft: '16px' }}>
          <i className="fas fa-building"></i> Tax Center: <strong style={{ color: '#4caf50' }}>{selectedTaxCenter}</strong>
        </div>
      </div>

      {casesToShow.length === 0 ? (
        <div style={{
          background: '#0f1419', color: '#f0f6fc',
          padding: '24px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #ffb74d'
        }}>
          <p style={{ color: '#f57f17', fontSize: '14px', margin: 0 }}>
            No audit cases created yet for {selectedTaxCenter} in {selectedRegion}.
          </p>
          <p style={{ color: '#999', fontSize: '12px', margin: '8px 0 0 0' }}>
            Go to "Cascade Plan to Cases" to create audit cases from approved plans.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="cards" style={{ marginBottom: '24px' }}>
            <Card title="Total Cases" number={casesToShow.length} icon="fas fa-briefcase" />
            <Card title="Assigned (Pending)" number={casesToShow.filter(c => c.status === 'ASSIGNED').length} icon="fas fa-clipboard-list" />
            <Card title="In Progress" number={casesToShow.filter(c => c.status === 'IN_PROGRESS').length} icon="fas fa-hourglass-half" />
            <Card title="Closed" number={casesToShow.filter(c => c.status === 'CLOSED').length} icon="fas fa-check-circle" />
          </div>

          {/* Filters */}
          <div style={{
            background: '#1c2128',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <input 
              type="text"
              placeholder="Search by TIN, name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}
            />
            
            <select 
              value={filterAuditType}
              onChange={(e) => setFilterAuditType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}
            >
              <option value="All">All Audit Types</option>
              {auditTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #30363d',
                borderRadius: '6px',
                background: '#0f1419',
                color: '#f0f6fc',
                fontSize: '12px'
              }}
            >
              <option value="All">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={() => { setSearchTerm(''); setFilterAuditType('All'); setFilterStatus('All'); }}
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
              Clear
            </button>
          </div>

          {/* Cases Table */}
          <div className="table-container" style={{ marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>TIN</th>
                  <th>TAXPAYER</th>
                  <th>AUDIT TYPE</th>
                  <th>RISK</th>
                  <th>REVENUE AT RISK</th>
                  <th>EST. HOURS</th>
                  <th>STATUS</th>
                  <th>CREATED DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(auditCase => (
                  <tr key={auditCase.id}>
                    <td><strong>{auditCase.id}</strong></td>
                    <td>{auditCase.tin}</td>
                    <td>{auditCase.taxpayerName}</td>
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
                    <td>{auditCase.estimatedHours}</td>
                    <td>
                      <span style={{
                        background: getStatusColor(auditCase.status),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {getStatusLabel(auditCase.status)}
                      </span>
                    </td>
                    <td>{new Date(auditCase.createdDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{
            background: '#e3f2fd', color: '#0c4a6e',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #1976d2',
            color: '#0c4a6e'
          }}>
            <strong style={{ color: '#0c4a6e' }}><i className="fas fa-info-circle"></i> Audit Cases Summary</strong>
            <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6', color: '#0c4a6e' }}>
              Showing <strong>{filteredCases.length}</strong> of <strong>{casesToShow.length}</strong> audit cases for <strong>{selectedTaxCenter}</strong> in <strong>{selectedRegion}</strong>.
              Total revenue at risk: <strong>{(casesToShow.reduce((sum, c) => sum + (c.revenueAtRisk || 0), 0) / 1000000).toFixed(1)}M</strong>.
              Total estimated hours: <strong>{casesToShow.reduce((sum, c) => sum + (c.estimatedHours || 0), 0).toLocaleString()}</strong>.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AuditCasesListView;
