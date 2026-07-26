import React, { useState, useEffect } from 'react';
import Card from '../Card';
import Badge from '../Badge';
import { loadData } from '../../utils/data';
import { useRegional } from '../../context/RegionalContext';
import { useAuth } from '../../context/AuthContext';

/**
 * AuditCasesListView
 * Displays audit cases for the selected tax center and region.
 * Features: case filtering by type/status, search, pagination, and tax center context display.
 * Design: Dark navy theme with status indicators for case states (Assigned, In Progress, Closed).
 * Styling: 100% Tailwind CSS with dark mode support via dark: prefix.
 */

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
    return <div className="min-h-screen bg-ink dark:bg-ink p-8 text-text-hi dark:text-text-hi">Loading audit cases...</div>;
  }

  // Show selected tax center's cases
  const casesToShow = allCases;

  const auditTypes = [...new Set(allCases.map(c => c.auditType))];
  const statuses = [...new Set(allCases.map(c => c.status))];

  return (
    <div className="min-h-screen bg-ink dark:bg-ink p-8">
      <div className="flex items-center gap-3 mb-8 pl-4 border-l-4 border-gold dark:border-gold">
        <h2 className="text-3xl font-bold text-text-hi dark:text-text-hi">
          <i className="fas fa-briefcase mr-3"></i> Audit Cases
        </h2>
        <Badge status={`${casesToShow.length} Cases`} className="director-approved" />
      </div>

      {/* Region & Tax Center Selector */}
      <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="text-sm font-semibold text-text-hi dark:text-text-hi whitespace-nowrap">
          <i className="fas fa-map-marker-alt mr-2"></i> Region: <strong className="text-success dark:text-success">{selectedRegion}</strong>
        </div>

        <div className="text-sm font-semibold text-text-hi dark:text-text-hi whitespace-nowrap">
          <i className="fas fa-building mr-2"></i> Tax Center: <strong className="text-success dark:text-success">{selectedTaxCenter}</strong>
        </div>
      </div>

      {casesToShow.length === 0 ? (
        <div className="bg-ink dark:bg-ink border-2 border-gold dark:border-gold rounded-sm p-6 text-center">
          <p className="text-coral dark:text-coral text-base mb-2">
            No audit cases created yet for {selectedTaxCenter} in {selectedRegion}.
          </p>
          <p className="text-text-mid dark:text-text-mid text-sm">
            Go to "Cascade Plan to Cases" to create audit cases from approved plans.
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card title="Total Cases" number={casesToShow.length} icon="fas fa-briefcase" />
            <Card title="Assigned (Pending)" number={casesToShow.filter(c => c.status === 'ASSIGNED').length} icon="fas fa-clipboard-list" />
            <Card title="In Progress" number={casesToShow.filter(c => c.status === 'IN_PROGRESS').length} icon="fas fa-hourglass-half" />
            <Card title="Closed" number={casesToShow.filter(c => c.status === 'CLOSED').length} icon="fas fa-check-circle" />
          </div>

          {/* Filters */}
          <div className="bg-panel dark:bg-panel-dark border border-border dark:border-border-dark rounded-sm p-3 mb-6 flex flex-wrap gap-3 items-center">
            <input 
              type="text"
              placeholder="Search by TIN, name, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 border border-border dark:border-border-dark rounded-sm bg-ink dark:bg-ink text-text-hi dark:text-text-hi text-sm focus:outline-none focus:border-gold"
            />
            
            <select 
              value={filterAuditType}
              onChange={(e) => setFilterAuditType(e.target.value)}
              className="px-3 py-2 border border-border dark:border-border-dark rounded-sm bg-ink dark:bg-ink text-text-hi dark:text-text-hi text-sm focus:outline-none focus:border-gold"
            >
              <option value="All">All Audit Types</option>
              {auditTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-border dark:border-border-dark rounded-sm bg-ink dark:bg-ink text-text-hi dark:text-text-hi text-sm focus:outline-none focus:border-gold"
            >
              <option value="All">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={() => { setSearchTerm(''); setFilterAuditType('All'); setFilterStatus('All'); }}
              className="px-3 py-2 border border-border dark:border-border-dark rounded-sm bg-ink dark:bg-ink text-text-mid dark:text-text-mid text-sm cursor-pointer hover:bg-panel dark:hover:bg-panel transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Cases Table */}
          <div className="overflow-x-auto mb-6 border border-border dark:border-border-dark rounded-sm">
            <table className="w-full text-sm">
              <thead className="bg-panel dark:bg-panel-dark border-b border-border dark:border-border-dark">
                <tr>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">CASE ID</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">TIN</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">TAXPAYER</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">AUDIT TYPE</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">RISK</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">REVENUE AT RISK</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">EST. HOURS</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">STATUS</th>
                  <th className="text-left px-4 py-3 text-text-mid dark:text-text-mid font-semibold text-xs">CREATED DATE</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map(auditCase => (
                  <tr key={auditCase.id} className="border-b border-border dark:border-border-dark hover:bg-panel dark:hover:bg-panel-dark transition-colors">
                    <td className="px-4 py-3"><strong className="text-text-hi dark:text-text-hi">{auditCase.id}</strong></td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{auditCase.tin}</td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{auditCase.taxpayerName}</td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{auditCase.auditType}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-sm text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(auditCase.riskLevel) }}>
                        {auditCase.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{(auditCase.revenueAtRisk / 1000000).toFixed(1)}M</td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{auditCase.estimatedHours}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-1 rounded-sm text-xs font-bold text-white" style={{ backgroundColor: getStatusColor(auditCase.status) }}>
                        {getStatusLabel(auditCase.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-hi dark:text-text-hi">{new Date(auditCase.createdDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-500 dark:border-blue-600 rounded-sm p-4 text-blue-900 dark:text-blue-100">
            <strong className="text-blue-900 dark:text-blue-100">
              <i className="fas fa-info-circle mr-2"></i> Audit Cases Summary
            </strong>
            <p className="text-blue-900 dark:text-blue-100 text-sm leading-relaxed mt-2">
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
