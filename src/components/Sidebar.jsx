import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserBreadcrumb } from '../utils/dataFiltering';

function Sidebar({ currentRole, currentView, onNavigate }) {
  const { getUserInfo } = useAuth();
  const userInfo = getUserInfo();

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

  const menuItems = getMenuItems();

  // Filter menu items by permission (show if no permission required, or user has permission)
  const visibleItems = menuItems.filter(item => 
    !item.permission || (userInfo && userInfo.permissions && userInfo.permissions.includes(item.permission))
  );

  return (
    <div className="sidebar">
      <div className="logo">
        <img src="/mor-logo.svg" alt="Ministry of Revenues" style={{ width: '28px', height: '28px', marginRight: '8px' }} />
        <span>Audit System</span>
      </div>

      {/* User Context Info */}
      {userInfo && (
        <div style={{
          padding: '12px',
          background: '#0f1419',
          border: '1px solid #30363d',
          borderRadius: '6px',
          margin: '12px',
          fontSize: '11px',
          color: '#8b949e'
        }}>
          <div style={{ fontWeight: '600', color: '#f0f6fc', marginBottom: '6px' }}>
            {userInfo.fullName}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            Role: <strong>{userInfo.role.replace(/_/g, ' ')}</strong>
          </div>
          {userInfo.orgContext?.assignedRegion && (
            <div style={{ fontSize: '10px', marginBottom: '4px' }}>
              Region: <strong>{userInfo.orgContext.assignedRegion}</strong>
            </div>
          )}
          {userInfo.orgContext?.assignedTaxCenter && (
            <div style={{ fontSize: '10px', marginBottom: '4px' }}>
              Tax Center: <strong>{userInfo.orgContext.assignedTaxCenter}</strong>
            </div>
          )}
          {userInfo.orgContext?.auditType && (
            <div style={{ fontSize: '10px' }}>
              Audit Type: <strong>{userInfo.orgContext.auditType}</strong>
            </div>
          )}
        </div>
      )}

      <nav>
        {visibleItems.map(item => (
          <a
            key={item.id}
            href="#"
            className={currentView === item.id ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item.id);
            }}
            title={item.label}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      <div className="footer">Audit Planning System · v2.0</div>
    </div>
  );
}

export default Sidebar;
