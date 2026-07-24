import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBreadcrumb } from '../utils/dataFiltering';
import { loadData } from '../utils/data';

function Sidebar({ currentRole, currentView, onNavigate }) {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  const [stats, setStats] = useState({ cases: 0, plans: 0, assignments: 0 });

  useEffect(() => {
    // Calculate quick stats from data
    const data = loadData();
    const caseCount = (data.auditCases || []).length;
    const planCount = (data.auditPlans || []).length;
    const assignmentCount = (data.assignments || []).length;
    
    setStats({
      cases: caseCount,
      plans: planCount,
      assignments: assignmentCount
    });
  }, []);

  // Define menu items per role
  const getMenuItems = () => {
    switch (currentRole) {
      case 'audit_team':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'create-plan', icon: 'fas fa-plus-circle', label: 'Create Annual Plan', permission: 'create_plans' },
          { id: 'my-plans', icon: 'fas fa-clipboard-list', label: 'My Plans', permission: 'create_plans' },
          { id: 'feedback-review', icon: 'fas fa-comments', label: 'Regional Feedback to Review', permission: 'view_audit_metrics' },
          { id: 'revisions', icon: 'fas fa-redo', label: 'Plans in Revision', permission: 'create_plans' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null },
          { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports & Analytics', permission: 'view_audit_metrics' }
        ];
      
      case 'audit_director':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'review-queue', icon: 'fas fa-inbox', label: 'Plans to Review', permission: 'approve_plans' },
          { id: 'send-feedback', icon: 'fas fa-envelope', label: 'Send Feedback to Regions', permission: 'approve_plans' },
          { id: 'amended-plans', icon: 'fas fa-edit', label: 'Review Amended Plans', permission: 'approve_plans' },
          { id: 'approved-plans', icon: 'fas fa-check-circle', label: 'Approved Plans', permission: 'approve_plans' },
          { id: 'deployment', icon: 'fas fa-paper-plane', label: 'Deploy Approved Plans', permission: 'approve_plans' },
          { id: 'feedback-review', icon: 'fas fa-comments', label: 'Regional Feedback', permission: 'view_audit_metrics' },
          { id: 'finalized', icon: 'fas fa-flag-checkered', label: 'Finalized Plans', permission: 'approve_plans' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null }
        ];
      
      case 'regional_director':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'review-plan', icon: 'fas fa-clipboard-list', label: 'Review Plan from Director', permission: 'allocate_to_tax_centers' },
          { id: 'allocation-dashboard', icon: 'fas fa-tasks', label: 'Allocate to Tax Centers', permission: 'allocate_to_tax_centers' },
          { id: 'tax-center-feedback', icon: 'fas fa-comments', label: 'Tax Center Feedback', permission: 'allocate_to_tax_centers' },
          { id: 'submit-regional-feedback', icon: 'fas fa-paper-plane', label: 'Submit Regional Feedback', permission: 'allocate_to_tax_centers' },
          { id: 'deployment', icon: 'fas fa-check-double', label: 'Acknowledge Finalized Plans', permission: 'allocate_to_tax_centers' },
          { id: 'submit-plan-to-tax-centers', icon: 'fas fa-share-alt', label: 'Submit Plan to Tax Centers', permission: 'allocate_to_tax_centers' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'feedback-history', icon: 'fas fa-history', label: 'Feedback History', permission: 'allocate_to_tax_centers' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null },
          { id: 'reports', icon: 'fas fa-chart-bar', label: 'Reports', permission: 'view_audit_metrics' }
        ];

      case 'tax_center_manager':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'tax-center-feedback', icon: 'fas fa-comments', label: 'View Allocation & Feedback', permission: 'cascade_plan_to_cases' },
          { id: 'accept-approved-plan', icon: 'fas fa-handshake', label: 'Accept Approved Plan', permission: 'cascade_plan_to_cases' },
          { id: 'cascade-plan-cases', icon: 'fas fa-arrow-right', label: 'Cascade Plan to Cases', permission: 'cascade_plan_to_cases' },
          { id: 'case-prioritization', icon: 'fas fa-sort-amount-down', label: 'Case Prioritization', permission: 'manage_case_prioritization' },
          { id: 'case-assignment', icon: 'fas fa-tasks', label: 'Assign to Team Leaders', permission: 'assign_cases_to_team_leaders' },
          { id: 'audit-cases', icon: 'fas fa-briefcase', label: 'Audit Cases', permission: 'view_audit_cases' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'capacity-status', icon: 'fas fa-tasks', label: 'Team Capacity', permission: 'view_audit_cases' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null },
          { id: 'execution-reports', icon: 'fas fa-file-chart-bar', label: 'Execution Reports', permission: 'view_audit_metrics' }
        ];
      
      case 'cascade_audit_team':
        return [
          { id: 'cascade-plan-cases', icon: 'fas fa-arrow-right', label: 'Cascade Plan to Cases', permission: 'cascade_plan_to_cases' },
          { id: 'case-prioritization', icon: 'fas fa-sort-amount-down', label: 'Case Prioritization', permission: 'manage_case_prioritization' },
          { id: 'audit-cases', icon: 'fas fa-briefcase', label: 'Audit Cases', permission: 'view_audit_cases' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null },
          { id: 'execution-reports', icon: 'fas fa-file-chart-bar', label: 'Execution Reports', permission: 'view_audit_metrics' }
        ];

      case 'team_leader':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'team-cases', icon: 'fas fa-briefcase', label: 'Team Audit Cases', permission: 'view_audit_cases' },
          { id: 'case-assignment', icon: 'fas fa-random', label: 'Assign Cases to Auditors', permission: 'assign_cases_to_auditors' },
          { id: 'team-progress', icon: 'fas fa-chart-pie', label: 'Team Progress', permission: 'view_audit_metrics' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null }
        ];

      case 'auditor':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'my-cases', icon: 'fas fa-briefcase', label: 'My Audit Cases', permission: 'view_audit_cases' },
          { id: 'case-assignment', icon: 'fas fa-check-square', label: 'My Assignments', permission: 'accept_case_assignment' },
          { id: 'case-execution', icon: 'fas fa-tasks', label: 'Case Execution', permission: 'update_case_execution' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null }
        ];

      case 'senior_management':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'pending-approval', icon: 'fas fa-inbox', label: 'Plans for Review', permission: 'approve_plans' },
          { id: 'approved-plans', icon: 'fas fa-check-circle', label: 'Approved Plans', permission: 'approve_plans' },
          { id: 'rejected-plans', icon: 'fas fa-times-circle', label: 'Rejected Plans', permission: 'approve_plans' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration & Standards', permission: null }
        ];

      case 'process_owner':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'cases', icon: 'fas fa-list-check', label: 'Audit Case Selection', permission: 'view_audit_cases' },
          { id: 'requests', icon: 'fas fa-inbox', label: 'Requests for Audit', permission: 'manage_processes' },
          { id: 'stored-cases', icon: 'fas fa-folder-open', label: 'Stored Cases', permission: 'view_audit_cases' },
          { id: 'case-assignment', icon: 'fas fa-exchange-alt', label: 'Case Re-allocation', permission: 'reallocate_cases' },
          { id: 'case-types', icon: 'fas fa-cogs', label: 'Case Types Configuration', permission: 'manage_processes' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-sliders-h', label: 'Configuration', permission: null }
        ];
      
      case 'directorate_requester':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'submit-request', icon: 'fas fa-plus-circle', label: 'Submit Audit Request', permission: 'submit_audit_requests' },
          { id: 'my-requests', icon: 'fas fa-list', label: 'My Requests', permission: 'view_own_requests' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration', permission: null }
        ];

      case 'external_stakeholder':
        return [
          { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard', permission: 'view_audit_metrics' },
          { id: 'submit-request', icon: 'fas fa-plus-circle', label: 'Submit Audit Request', permission: 'submit_audit_requests' },
          { id: 'my-requests', icon: 'fas fa-list', label: 'My Requests', permission: 'view_own_requests' },
          { id: 'risk-engine', icon: 'fas fa-globe', label: 'Risk Engine Analysis', permission: 'view_audit_metrics' },
          { id: 'configuration', icon: 'fas fa-cogs', label: 'Configuration', permission: null }
        ];
      
      default:
        return [];
    }
  };

  // Group menu items by category
  const groupMenuItems = (items) => {
    const groups = {
      'Primary': [],
      'Management': [],
      'Analysis': [],
      'Configuration': []
    };

    items.forEach(item => {
      if (item.id === 'dashboard') groups['Primary'].push(item);
      else if (['create-plan', 'my-plans', 'review-queue', 'approve', 'allocation', 'accept', 'cascade', 'assign', 'case-assignment', 'team-cases', 'team-progress', 'my-cases', 'case-execution', 'cases', 'requests', 'stored-cases', 'pending', 'approved', 'rejected'].some(term => item.id.includes(term))) groups['Management'].push(item);
      else if (['risk-engine', 'feedback', 'reports', 'audit-cases', 'execution-reports'].some(term => item.id.includes(term))) groups['Analysis'].push(item);
      else groups['Configuration'].push(item);
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  };

  const menuItems = getMenuItems();

  // Filter menu items by permission (show if no permission required, or user has permission)
  const visibleItems = menuItems.filter(item => 
    !item.permission || (userInfo && userInfo.permissions && userInfo.permissions.includes(item.permission))
  );

  const groupedItems = groupMenuItems(visibleItems);

  return (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #30363d'
      }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <img src="/favicon-32x32.jpeg" alt="Ministry of Revenues" style={{ width: '32px', height: '32px', marginRight: '10px', borderRadius: '3px', objectFit: 'cover' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#f0f6fc' }}>Audit System</span>
            <span style={{ fontSize: '9px', color: '#8b949e' }}>v2.0</span>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      {userInfo && (
        <div style={{
          padding: '12px',
          background: 'linear-gradient(135deg, #1c2128 0%, #0f1419 100%)',
          border: '1px solid #30363d',
          borderRadius: '6px',
          margin: '12px',
          fontSize: '11px',
          borderLeft: '3px solid #4a8fd9'
        }}>
          <div style={{ fontWeight: '700', color: '#4a8fd9', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
            <i className="fas fa-user-circle" style={{ marginRight: '6px' }}></i>
            {userInfo.fullName}
          </div>
          
          <div style={{ 
            background: '#0f1419', 
            padding: '8px', 
            borderRadius: '4px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{ fontSize: '10px' }}>
              <span style={{ color: '#8b949e' }}>Role</span>
              <div style={{ color: '#4caf50', fontWeight: '600', fontSize: '9px', marginTop: '2px' }}>
                {userInfo.role.replace(/_/g, ' ')}
              </div>
            </div>
            
            {userInfo.orgContext?.assignedRegion && (
              <div style={{ fontSize: '10px' }}>
                <span style={{ color: '#8b949e' }}>Region</span>
                <div style={{ color: '#4caf50', fontWeight: '600', fontSize: '9px', marginTop: '2px' }}>
                  {userInfo.orgContext.assignedRegion.substring(0, 8)}
                </div>
              </div>
            )}
          </div>

          {userInfo.orgContext?.assignedTaxCenter && (
            <div style={{ fontSize: '10px', padding: '6px', background: '#1c2128', borderRadius: '3px' }}>
              <span style={{ color: '#8b949e' }}>Tax Center</span>
              <div style={{ color: '#f0f6fc', fontWeight: '600', fontSize: '9px', marginTop: '2px' }}>
                {userInfo.orgContext.assignedTaxCenter}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats */}
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #30363d',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px'
      }}>
        <div style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: '4px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4a8fd9' }}>{stats.cases}</div>
          <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px' }}>Cases</div>
        </div>
        <div style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: '4px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffc107' }}>{stats.plans}</div>
          <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px' }}>Plans</div>
        </div>
        <div style={{
          background: '#1c2128',
          border: '1px solid #30363d',
          borderRadius: '4px',
          padding: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4caf50' }}>{stats.assignments}</div>
          <div style={{ fontSize: '9px', color: '#8b949e', marginTop: '2px' }}>Assigned</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {groupedItems.map(([groupName, items], groupIdx) => (
          <div key={groupName}>
            {groupIdx > 0 && <div style={{ height: '1px', background: '#30363d', margin: '8px 0' }}></div>}
            
            {groupName !== 'Primary' && (
              <div style={{
                padding: '8px 16px',
                fontSize: '10px',
                fontWeight: '700',
                color: '#8b949e',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                margin: '8px 0 4px 0'
              }}>
                {groupName}
              </div>
            )}
            
            {items.map(item => (
              <a
                key={item.id}
                href="#"
                className={currentView === item.id ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                title={item.label}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: currentView === item.id ? '#4a8fd9' : '#8b949e',
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: currentView === item.id ? '600' : '400',
                  background: currentView === item.id ? '#1c212833' : 'transparent',
                  borderLeft: currentView === item.id ? '3px solid #4a8fd9' : '3px solid transparent',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (currentView !== item.id) {
                    e.currentTarget.style.background = '#1c212822';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentView !== item.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <i className={item.icon} style={{ width: '16px', textAlign: 'center' }}></i>
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px',
        background: '#0f1419',
        border: '1px solid #30363d',
        borderRadius: '6px',
        margin: '12px',
        textAlign: 'center',
        fontSize: '9px',
        color: '#8b949e'
      }}>
        <div style={{ marginBottom: '6px' }}>
          <i className="fas fa-server" style={{ marginRight: '4px' }}></i>
          Audit Planning System
        </div>
        <div style={{ fontSize: '8px', opacity: 0.7 }}>
          Ministry of Revenues © 2024
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
