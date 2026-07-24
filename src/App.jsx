import React from 'react';
import LoginForm from './components/LoginForm';
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
import CascadeTeamView from './components/roleViews/CascadeTeamView';
import ProcessOwnerView from './components/roleViews/ProcessOwnerView';

function AppContent() {
  const { isAuthenticated, authContext } = useAuth();

  // Use role from auth context
  const currentRole = authContext?.role;

  // Render role-specific view container
  const renderRoleView = () => {
    if (!isAuthenticated) {
      return <LoginForm />;
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
      case 'cascade_audit_team':
        return <CascadeTeamView />;
      case 'process_owner':
        return <ProcessOwnerView />;
      default:
        return <AuditTeamView />;
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

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
