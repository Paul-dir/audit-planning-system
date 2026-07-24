import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import Card from '../Card';
import Badge from '../Badge';
import { useAuth } from '../../context/AuthContext';

/**
 * Process Owner Dashboard and View
 * Manages processes at tax center level
 */
function ProcessOwnerDashboard() {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  return (
    <div className="dashboard-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#f0f6fc' }}>
          ⚡ Process Management Dashboard
        </h2>
        <p style={{ color: '#0c4a6e', margin: 0, fontSize: '13px', color: '#8b949e' }}>
          Manage processes for {userInfo?.orgContext?.assignedTaxCenter}
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#2196f3' }}>3</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Audit Types Managed</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#4caf50' }}>100%</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Process Coverage</div>
        </Card>
        <Card>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#9c27b0' }}>12</div>
          <div style={{ fontSize: '12px', color: '#8b949e', marginTop: '4px' }}>Active Processes</div>
        </Card>
      </div>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#f0f6fc', fontSize: '16px' }}>
          <i className="fas fa-info-circle"></i> Role Overview
        </h3>
        <p style={{ color: '#0c4a6e', margin: '0 0 8px 0', fontSize: '12px', color: '#8b949e' }}>
          <strong>Process Owner</strong> manages operational processes for {userInfo?.orgContext?.assignedTaxCenter}.
        </p>
        <ul style={{ margin: '12px 0 0 0', paddingLeft: '20px', fontSize: '12px', color: '#8b949e' }}>
          <li>Manage audit processes for all audit types</li>
          <li>Define standard operating procedures</li>
          <li>Monitor process compliance</li>
          <li>Coordinate with cascade team</li>
          <li>Support team leaders</li>
        </ul>
      </Card>
    </div>
  );
}

function ProcessOwnerView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ProcessOwnerDashboard />;
      case 'configuration':
        return <div style={{ padding: '20px' }}>Configuration View</div>;
      default:
        return <ProcessOwnerDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['process_owner']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default ProcessOwnerView;
