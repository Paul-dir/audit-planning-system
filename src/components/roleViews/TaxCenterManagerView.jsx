import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import TaxCenterManagerDashboard from '../dashboards/TaxCenterManagerDashboard';
import TaxCenterView from '../views/TaxCenterView';
import CascadePlanToCasesView from '../views/CascadePlanToCasesView';
import AuditCasesListView from '../views/AuditCasesListView';
import TaxCenterFeedbackView from '../views/TaxCenterFeedbackView';
import TaxCenterAcceptancePlanView from '../views/TaxCenterAcceptancePlanView';
import ConfigurationView from '../views/ConfigurationView';
import CasePrioritizationView from '../views/CasePrioritizationView';

function TaxCenterManagerView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <TaxCenterManagerDashboard />;
      case 'tax-center-feedback':
        return <TaxCenterFeedbackView />;
      case 'accept-approved-plan':
        return <TaxCenterAcceptancePlanView />;
      case 'cascade-plan-cases':
        return <CascadePlanToCasesView />;
      case 'audit-cases':
        return <AuditCasesListView />;
      case 'case-prioritization':
        return <CasePrioritizationView />;
      case 'capacity-status':
      case 'execution-reports':
        return <TaxCenterView currentView={currentView} />;
      case 'configuration':
        return <ConfigurationView />;
      default:
        return <TaxCenterManagerDashboard />;
    }
  };

  return (
    <ProtectedRoute requiredRoles={['tax_center_manager']}>
      <RoleLayout currentView={currentView} onNavigate={setCurrentView}>
        {renderContent()}
      </RoleLayout>
    </ProtectedRoute>
  );
}

export default TaxCenterManagerView;
