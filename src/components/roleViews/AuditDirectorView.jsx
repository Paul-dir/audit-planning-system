import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import AuditDirectorDashboard from '../dashboards/AuditDirectorDashboard';
import DirectorView from '../views/DirectorView';
import DirectorBulkFeedbackView from '../views/DirectorBulkFeedbackView';
import ApprovedPlansDeploymentView from '../views/ApprovedPlansDeploymentView';
import ConfigurationView from '../views/ConfigurationView';

function AuditDirectorView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <AuditDirectorDashboard />;
      case 'review-queue':
      case 'amended-plans':
      case 'approved-plans':
      case 'feedback-review':
      case 'finalized':
        return <DirectorView currentView={currentView} />;
      case 'send-feedback':
        return <DirectorBulkFeedbackView />;
      case 'deployment':
        return <ApprovedPlansDeploymentView userRole="director" />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <AuditDirectorDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['audit_director']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default AuditDirectorView;
