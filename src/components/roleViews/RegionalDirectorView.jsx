import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import RegionalDirectorDashboard from '../dashboards/RegionalDirectorDashboard';
import RegionalFeedbackView from '../views/RegionalFeedbackView';
import ApprovedPlansDeploymentView from '../views/ApprovedPlansDeploymentView';
import RegionalPlanSubmissionView from '../views/RegionalPlanSubmissionView';
import ConfigurationView from '../views/ConfigurationView';

function RegionalDirectorView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <RegionalDirectorDashboard />;
      case 'review-plan':
      case 'allocation-dashboard':
      case 'tax-center-feedback':
      case 'submit-regional-feedback':
      case 'feedback-history':
      case 'reports':
        return <RegionalFeedbackView currentView={currentView} />;
      case 'deployment':
        return <ApprovedPlansDeploymentView userRole="regional" />;
      case 'submit-plan-to-tax-centers':
        return <RegionalPlanSubmissionView />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <RegionalDirectorDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['regional_director']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default RegionalDirectorView;
