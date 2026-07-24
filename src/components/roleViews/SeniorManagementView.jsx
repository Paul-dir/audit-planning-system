import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import SeniorManagementDashboard from '../dashboards/SeniorManagementDashboard';
import SeniorManagementViewComponent from '../views/SeniorManagementView';
import ConfigurationView from '../views/ConfigurationView';

function SeniorManagementView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <SeniorManagementDashboard />;
      case 'pending-approval':
      case 'approved-plans':
      case 'rejected-plans':
        return <SeniorManagementViewComponent currentView={currentView} />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <SeniorManagementDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['senior_management']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default SeniorManagementView;
