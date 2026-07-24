import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import AuditTeamDashboard from '../dashboards/AuditTeamDashboard';
import AuditPlanningView from '../views/AuditPlanningView';
import ConfigurationView from '../views/ConfigurationView';

/**
 * Audit Team View Container
 * Shows ONLY pages for Audit Planning Team role
 */
function AuditTeamView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AuditTeamDashboard />;
      case 'risk-engine':
      case 'create-plan':
      case 'my-plans':
      case 'feedback-review':
      case 'revisions':
      case 'reports':
        return <AuditPlanningView currentView={currentView} />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <AuditTeamDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['audit_team']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default AuditTeamView;
