import React, { useState } from 'react';
import EnterpriseLoginForm from './components/EnterpriseLoginForm';
import ConfigurationDashboard from './components/configuration/ConfigurationDashboard';
import { RegionalProvider } from './context/RegionalContext';
import { useAuth } from './context/AuthContext';
// Import role-specific view containers
import AuditTeamView from './components/roleViews/AuditTeamView';
import AuditDirectorView from './components/roleViews/AuditDirectorView';
import RegionalDirectorView from './components/roleViews/RegionalDirectorView';
import TaxCenterManagerView from './components/roleViews/TaxCenterManagerView';
import TeamLeaderView from './components/roleViews/TeamLeaderView';
import AuditorView from './components/roleViews/AuditorView';
import SeniorManagementView from './components/roleViews/SeniorManagementView';
import RequesterDashboardView from './components/roleViews/RequesterDashboardView';

function AppContent() {
  const { isAuthenticated, authContext } = useAuth();

  // Use role from auth context
  const currentRole = authContext?.role;

  // Render role-specific view container
  const renderRoleView = () => {
    if (!isAuthenticated) {
      return <EnterpriseLoginForm />;
    }

    switch (currentRole) {
      case 'audit_team':
        return <AuditTeamView />;
      case 'audit_director':
        return <AuditDirectorView />;
      case 'regional_director':
        return <RegionalDirectorView />;
      case 'tax_center_manager':
        return <TaxCenterManagerView />;
      case 'team_leader':
        return <TeamLeaderView />;
      case 'auditor':
        return <AuditorView />;
      case 'senior_management':
        return <SeniorManagementView />;
      case 'directorate_requester':
        return <RequesterDashboardView userRole="directorate_requester" />;
      case 'external_stakeholder':
        return <RequesterDashboardView userRole="external_stakeholder" />;
      default:
        return <AuditTeamView />;
    }
  };

  return (
    <RegionalProvider userRole={currentRole}>
      {renderRoleView()}
    </RegionalProvider>
  );
}

function App() {
  return (
    <RegionalProvider userRole={null}>
      <AppContent />
    </RegionalProvider>
  );
}

export default App;
