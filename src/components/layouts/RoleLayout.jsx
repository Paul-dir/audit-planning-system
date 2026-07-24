import React from 'react';
import Sidebar from '../Sidebar';
import TopBar from '../TopBar';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleLayout Component
 * Provides consistent layout for each role with their specific sidebar and topbar
 */
function RoleLayout({ children, currentView, onNavigate }) {
  const { authContext } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar 
        currentRole={authContext?.role} 
        currentView={currentView}
        onNavigate={onNavigate}
      />
      <div className="main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar currentRole={authContext?.role} authContext={authContext} />
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default RoleLayout;
