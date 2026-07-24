import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import CascadeTeamDashboard from '../dashboards/CascadeTeamDashboard';
import CascadePlanToCasesView from '../views/CascadePlanToCasesView';
import AuditCasesListView from '../views/AuditCasesListView';
import ConfigurationView from '../views/ConfigurationView';
import CasePrioritizationView from '../views/CasePrioritizationView';

function CascadeTeamView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <CascadeTeamDashboard />;
      case 'cascade-plan-cases':
        return <CascadePlanToCasesView />;
      case 'audit-cases':
        return <AuditCasesListView />;
      case 'case-prioritization':
        return <CasePrioritizationView />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <CascadeTeamDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['cascade_audit_team']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default CascadeTeamView;
