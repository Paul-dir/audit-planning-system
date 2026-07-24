import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

function TopBar({ currentRole, authContext }) {
  const { logout, getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  const roleMap = {
    audit_team: { title: 'Audit Planning Workspace', avatar: 'AP' },
    audit_director: { title: 'Director Review Workspace', avatar: 'DR' },
    regional_director: { title: 'Regional Feedback Workspace', avatar: 'RF' },
    tax_center_manager: { title: 'Tax Center Management', avatar: 'TC' },
    cascade_audit_team: { title: 'Cascade Audit Team Workspace', avatar: 'CA' },
    senior_management: { title: 'Senior Management Review', avatar: 'SM' },
    team_leader: { title: 'Team Leader Workspace', avatar: 'TL' },
    auditor: { title: 'Auditor Workspace', avatar: 'AU' }
  };

  const current = roleMap[currentRole] || roleMap.audit_team;

  return (
    <div className="top-bar">
      <h1>{current.title}</h1>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <ThemeToggle />
        
        {/* User Info & Logout */}
        {userInfo && (
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            paddingLeft: '12px',
            borderLeft: '1px solid #30363d'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              textAlign: 'right'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#f0f6fc'
              }}>
                {userInfo.fullName || 'User'}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8b949e'
              }}>
                {userInfo.role.replace(/_/g, ' ')}
              </div>
            </div>
            
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {(userInfo.fullName || 'U').charAt(0).toUpperCase()}
            </div>

            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: '#0f1419',
                border: '1px solid #30363d',
                borderRadius: '4px',
                color: '#f0f6fc',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
              title="Logout"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBar;
