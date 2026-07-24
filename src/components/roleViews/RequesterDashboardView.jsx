import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import Badge from '../Badge';
import SubmitAuditRequestForm from '../views/SubmitAuditRequestForm';
import MyRequestsView from '../views/MyRequestsView';

/**
 * RequesterDashboardView
 * Main view for Directorate Requester and External Stakeholder roles
 * - Submit audit requests
 * - View and manage own requests
 */

function RequesterDashboardView({ userRole }) {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'submit-request':
        return <SubmitAuditRequestForm userRole={userRole} />;
      case 'my-requests':
        return <MyRequestsView userRole={userRole} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    return (
      <div style={{ padding: '24px' }}>
        <div className="detail-header">
          <h2><i className="fas fa-tachometer-alt"></i> Dashboard</h2>
          <Badge status={userRole === 'directorate_requester' ? 'Directorate Requester' : 'External Stakeholder'} className="director-approved" />
        </div>

        <div style={{ background: '#e3f2fd', color: '#0c4a6e', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #1976d2' }}>
          <strong style={{ color: '#0c4a6e' }}><i className="fas fa-info-circle"></i> Audit Request System</strong>
          <p style={{ color: '#0c4a6e', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.6' }}>
            Submit audit requests for taxpayers requiring audit. Your requests will be reviewed and approved by the Process Owner.
            Once approved, audit cases will be created and assigned for execution.
          </p>
        </div>

        <div className="cards" style={{ marginBottom: '24px' }}>
          <div style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2c3138';
              e.currentTarget.style.borderColor = '#4a8fd9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1c2128';
              e.currentTarget.style.borderColor = '#30363d';
            }}
            onClick={() => setCurrentView('submit-request')}
          >
            <i className="fas fa-plus-circle" style={{ fontSize: '32px', color: '#4caf50', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '0 0 8px 0', color: '#f0f6fc', fontSize: '16px', fontWeight: '600' }}>Submit New Request</h3>
            <p style={{ margin: '0', color: '#8b949e', fontSize: '13px' }}>Create a new audit request</p>
          </div>

          <div style={{
            background: '#1c2128',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2c3138';
              e.currentTarget.style.borderColor = '#4a8fd9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1c2128';
              e.currentTarget.style.borderColor = '#30363d';
            }}
            onClick={() => setCurrentView('my-requests')}
          >
            <i className="fas fa-list" style={{ fontSize: '32px', color: '#2196f3', marginBottom: '12px', display: 'block' }}></i>
            <h3 style={{ margin: '0 0 8px 0', color: '#f0f6fc', fontSize: '16px', fontWeight: '600' }}>My Requests</h3>
            <p style={{ margin: '0', color: '#8b949e', fontSize: '13px' }}>View and manage your requests</p>
          </div>
        </div>

        <div style={{
          background: '#1a3a1a',
          color: '#4caf50',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #388e3c'
        }}>
          <strong><i className="fas fa-book"></i> How It Works</strong>
          <ol style={{ color: '#a8d5a8', margin: '8px 0 0 0', fontSize: '13px', lineHeight: '1.8' }}>
            <li>Submit an audit request with taxpayer details and reason</li>
            <li>Process Owner will review your request</li>
            <li>Request status: Pending Review → Under Assessment → Approved & Scheduled or Rejected</li>
            <li>Once approved, an audit case is created and assigned to auditors</li>
            <li>You can track the status of your requests in "My Requests"</li>
          </ol>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={setCurrentView} currentRole={userRole} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0f1419' }}>
        {/* Top Bar */}
        <TopBar title={getViewTitle(currentView, userRole)} />

        {/* Navigation Tabs */}
        {currentView !== 'dashboard' && (
          <div style={{
            background: '#1c2128',
            borderBottom: '1px solid #30363d',
            padding: '0',
            display: 'flex',
            gap: '0'
          }}>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                flex: 1,
                padding: '16px 20px',
                background: currentView === 'dashboard' ? '#0f1419' : 'transparent',
                color: currentView === 'dashboard' ? '#4a8fd9' : '#8b949e',
                border: 'none',
                borderBottom: currentView === 'dashboard' ? '3px solid #4a8fd9' : 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fas fa-tachometer-alt"></i> Dashboard
            </button>

            <button
              onClick={() => setCurrentView('submit-request')}
              style={{
                flex: 1,
                padding: '16px 20px',
                background: currentView === 'submit-request' ? '#0f1419' : 'transparent',
                color: currentView === 'submit-request' ? '#4a8fd9' : '#8b949e',
                border: 'none',
                borderBottom: currentView === 'submit-request' ? '3px solid #4a8fd9' : 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fas fa-plus-circle"></i> Submit Request
            </button>

            <button
              onClick={() => setCurrentView('my-requests')}
              style={{
                flex: 1,
                padding: '16px 20px',
                background: currentView === 'my-requests' ? '#0f1419' : 'transparent',
                color: currentView === 'my-requests' ? '#4a8fd9' : '#8b949e',
                border: 'none',
                borderBottom: currentView === 'my-requests' ? '3px solid #4a8fd9' : 'none',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <i className="fas fa-list"></i> My Requests
            </button>
          </div>
        )}

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

function getViewTitle(view, userRole) {
  const roleLabel = userRole === 'directorate_requester' ? 'Directorate Requester' : 'External Stakeholder';
  const titles = {
    'dashboard': `${roleLabel} - Dashboard`,
    'submit-request': `${roleLabel} - Submit Audit Request`,
    'my-requests': `${roleLabel} - My Requests`,
  };
  return titles[view] || `${roleLabel} Dashboard`;
}

export default RequesterDashboardView;
