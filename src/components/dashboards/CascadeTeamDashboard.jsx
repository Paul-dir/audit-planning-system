import React, { useState, useEffect } from 'react';
import Card from '../Card';
import { useAuth } from '../../context/AuthContext';
import { loadData } from '../../utils/data';

/**
 * Cascade Audit Team Dashboard
 * Shows cascade plan to cases execution across all regions
 */
function CascadeTeamDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({
    totalTaxCenters: 0,
    cascadeCompleted: 0,
    totalCases: 0,
    casesAssigned: 0,
    regionsActive: 0
  });

  useEffect(() => {
    const data = loadData();
    
    const allTaxCenters = data.taxCenters?.length || 15;
    const cascadedTc = data.taxCenters?.filter(tc => tc.cascadeStatus === 'COMPLETED').length || 0;
    const allCases = data.cases?.length || 0;
    const assignedCases = data.cases?.filter(c => c.status !== 'UNASSIGNED').length || 0;

    setStats({
      totalTaxCenters: allTaxCenters,
      cascadeCompleted: cascadedTc,
      totalCases: allCases,
      casesAssigned: assignedCases,
      regionsActive: 5 // 5 regions
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          ⚙️ Cascade Audit Team Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          Manage national plan cascade to cases across all regions
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#9c27b0' }}>{stats.regionsActive}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Regions Managed</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>
            {stats.cascadeCompleted}/{stats.totalTaxCenters}
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Tax Centers Cascaded</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>{stats.totalCases}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Total Cases Created</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>{stats.casesAssigned}</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Cases Assigned</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#f44336' }}>
            {Math.round((stats.cascadeCompleted / stats.totalTaxCenters) * 100)}%
          </div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Cascade Progress</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Cascade Audit Team</strong> manages the technical cascade of approved plans into audit cases for execution.
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Cascade approved plans across all {stats.regionsActive} regions</li>
          <li>Create audit cases from allocated plans</li>
          <li>Manage cascading to all {stats.totalTaxCenters} tax centers</li>
          <li>Monitor cascade completion status</li>
          <li>Support team leaders with case setup</li>
        </ul>
      </Card>
    </div>
  );
}

export default CascadeTeamDashboard;
