import React, { useState } from 'react';
import ProtectedRoute from '../ProtectedRoute';
import RoleLayout from '../layouts/RoleLayout';
import AuditCaseSelectionView from '../views/AuditCaseSelectionView';
import AuditCaseTypesConfigView from '../views/AuditCaseTypesConfigView';
import StoredCasesView from '../views/StoredCasesView';
import RequestForAuditView from '../views/RequestForAuditView';
import CaseAssignmentView from '../views/CaseAssignmentView';
import ConfigurationView from '../views/ConfigurationView';
import RoleDashboardShell from '../dashboard/RoleDashboardShell';
import { useSidebarStats } from '../../hooks/useAuditTeamMetrics';

function ProcessOwnerDashboard() {
  const stats = useSidebarStats();

  return (
    <RoleDashboardShell
      summaryMetrics={[
        {
          id: 'cases',
          title: 'Audit cases',
          value: stats.cases,
          subtitle: 'cases available for selection',
          color: 'blue',
          progress: Math.min(100, stats.cases * 5),
        },
        {
          id: 'plans',
          title: 'Active plans',
          value: stats.plans,
          subtitle: 'plans in the system',
          color: 'amber',
          progress: Math.min(100, stats.plans * 20),
        },
        {
          id: 'assigned',
          title: 'Assignments',
          value: stats.assigned,
          subtitle: 'cases assigned for execution',
          color: 'teal',
          progress: Math.min(100, stats.assigned * 10),
        },
      ]}
      bottomMetrics={[
        { id: 'cases', label: 'Total cases', value: stats.cases, color: 'blue' },
        { id: 'plans', label: 'Active plans', value: stats.plans, color: 'amber' },
        { id: 'assigned', label: 'Assigned', value: stats.assigned, color: 'teal' },
      ]}
    />
  );
}

function ProcessOwnerView() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <ProcessOwnerDashboard />;
      case 'cases':
        return <AuditCaseSelectionView />;
      case 'requests':
        return <RequestForAuditView />;
      case 'stored-cases':
        return <StoredCasesView />;
      case 'case-types':
        return <AuditCaseTypesConfigView />;
      case 'case-assignment':
        return <CaseAssignmentView />;
      case 'configuration':
        return <ConfigurationView />;
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
