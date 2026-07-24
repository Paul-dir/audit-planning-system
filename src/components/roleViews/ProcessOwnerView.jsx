import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import Badge from '../Badge';
import AuditCaseSelectionView from '../views/AuditCaseSelectionView';
import AuditCaseTypesConfigView from '../views/AuditCaseTypesConfigView';
import StoredCasesView from '../views/StoredCasesView';
import RequestForAuditView from '../views/RequestForAuditView';
import CaseAssignmentView from '../views/CaseAssignmentView';

/**
 * ProcessOwnerView
 * Main view for Process Owner role
 * - View and select audit cases from Risk Engine
 * - Configure and manage audit case types
 * - View stored cases for audit execution
 */

function ProcessOwnerView() {
  const [currentView, setCurrentView] = useState('cases');

  const renderContent = () => {
    switch (currentView) {
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
      default:
        return <AuditCaseSelectionView />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} userRole="process_owner" />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f1419' }}>
        {/* Top Bar */}
        <TopBar title={getViewTitle(currentView)} />

        {/* Navigation Tabs */}
        <div style={{
          background: '#1c2128',
          borderBottom: '1px solid #30363d',
          padding: '0',
          display: 'flex',
          gap: '0'
        }}>
          <button
            onClick={() => setCurrentView('cases')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: currentView === 'cases' ? '#0f1419' : 'transparent',
              color: currentView === 'cases' ? '#4a8fd9' : '#8b949e',
              border: 'none',
              borderBottom: currentView === 'cases' ? '3px solid #4a8fd9' : 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-list-check"></i> Audit Case Selection
          </button>

          <button
            onClick={() => setCurrentView('requests')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: currentView === 'requests' ? '#0f1419' : 'transparent',
              color: currentView === 'requests' ? '#4a8fd9' : '#8b949e',
              border: 'none',
              borderBottom: currentView === 'requests' ? '3px solid #4a8fd9' : 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-inbox"></i> Requests for Audit
          </button>

          <button
            onClick={() => setCurrentView('stored-cases')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: currentView === 'stored-cases' ? '#0f1419' : 'transparent',
              color: currentView === 'stored-cases' ? '#4a8fd9' : '#8b949e',
              border: 'none',
              borderBottom: currentView === 'stored-cases' ? '3px solid #4a8fd9' : 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-folder-open"></i> Stored Cases
          </button>

          <button
            onClick={() => setCurrentView('case-types')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: currentView === 'case-types' ? '#0f1419' : 'transparent',
              color: currentView === 'case-types' ? '#4a8fd9' : '#8b949e',
              border: 'none',
              borderBottom: currentView === 'case-types' ? '3px solid #4a8fd9' : 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-cogs"></i> Case Types Config
          </button>

          <button
            onClick={() => setCurrentView('case-assignment')}
            style={{
              flex: 1,
              padding: '16px 20px',
              background: currentView === 'case-assignment' ? '#0f1419' : 'transparent',
              color: currentView === 'case-assignment' ? '#4a8fd9' : '#8b949e',
              border: 'none',
              borderBottom: currentView === 'case-assignment' ? '3px solid #4a8fd9' : 'none',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <i className="fas fa-tasks"></i> Case Assignment
          </button>
        </div>

        {/* Content Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: '#0f1419'
        }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function getViewTitle(view) {
  const titles = {
    'cases': 'Audit Case Selection - Risk Engine Cases',
    'requests': 'Requests for Audit - Directorates & External Stakeholders',
    'stored-cases': 'Stored Cases - Ready for Audit Execution',
    'case-types': 'Audit Case Types Configuration',
    'case-assignment': 'Case Assignment & Workflow Management'
  };
  return titles[view] || 'Process Owner Dashboard';
}

export default ProcessOwnerView;
