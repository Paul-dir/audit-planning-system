/**
 * Central navigation configuration — single source of truth for sidebar menus.
 * Menu item `id` values must match the `currentView` case keys in each roleView container.
 */

export const ROLE_NAVIGATION = {
  audit_team: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Management',
        items: [
          { id: 'create-plan', label: 'Create annual plan', icon: 'fas fa-bullseye' },
          { id: 'my-plans', label: 'My plans', icon: 'fas fa-folder-open' },
        ],
      },
      {
        label: 'Analysis',
        items: [
          { id: 'risk-engine', label: 'Risk engine analysis', icon: 'fas fa-bolt' },
          { id: 'feedback-review', label: 'Regional feedback', icon: 'fas fa-comments' },
          { id: 'reports', label: 'Reports & analytics', icon: 'fas fa-chart-bar' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  audit_director: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Review',
        items: [
          { id: 'review-queue', label: 'Plan review', icon: 'fas fa-inbox' },
          { id: 'amended-plans', label: 'Amended plans', icon: 'fas fa-edit' },
          { id: 'feedback-review', label: 'Feedback review', icon: 'fas fa-star' },
        ],
      },
      {
        label: 'Actions',
        items: [
          { id: 'send-feedback', label: 'Bulk feedback', icon: 'fas fa-paper-plane' },
          { id: 'deployment', label: 'Deployment', icon: 'fas fa-rocket' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  regional_director: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Planning',
        items: [
          { id: 'review-plan', label: 'Plan review', icon: 'fas fa-check-circle' },
          { id: 'allocation-dashboard', label: 'Allocation', icon: 'fas fa-map-marker-alt' },
          { id: 'submit-plan-to-tax-centers', label: 'Submit to tax centers', icon: 'fas fa-share' },
        ],
      },
      {
        label: 'Feedback',
        items: [
          { id: 'tax-center-feedback', label: 'Tax center feedback', icon: 'fas fa-comments' },
          { id: 'submit-regional-feedback', label: 'Submit feedback', icon: 'fas fa-paper-plane' },
          { id: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  tax_center_manager: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Operations',
        items: [
          { id: 'accept-approved-plan', label: 'Acceptance plan', icon: 'fas fa-hand-paper' },
          { id: 'tax-center-feedback', label: 'Feedback', icon: 'fas fa-comments' },
          { id: 'cascade-plan-cases', label: 'Cascade to cases', icon: 'fas fa-sitemap' },
        ],
      },
      {
        label: 'Cases',
        items: [
          { id: 'audit-cases', label: 'Audit cases', icon: 'fas fa-folder' },
          { id: 'case-prioritization', label: 'Prioritization', icon: 'fas fa-sort-amount-up' },
          { id: 'case-assignment', label: 'Assignment', icon: 'fas fa-user-check' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  cascade_audit_team: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Cascade',
        items: [
          { id: 'cascade-plan-cases', label: 'Plan to cases', icon: 'fas fa-link' },
          { id: 'audit-cases', label: 'Audit cases', icon: 'fas fa-folder' },
          { id: 'case-prioritization', label: 'Prioritization', icon: 'fas fa-sort-amount-up' },
        ],
      },
      {
        label: 'Analysis',
        items: [
          { id: 'risk-engine', label: 'Risk engine', icon: 'fas fa-bolt' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  team_leader: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Team',
        items: [
          { id: 'team-cases', label: 'Team cases', icon: 'fas fa-users' },
          { id: 'team-progress', label: 'Team progress', icon: 'fas fa-chart-line' },
          { id: 'case-assignment', label: 'Assignments', icon: 'fas fa-user-check' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  auditor: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Work',
        items: [
          { id: 'my-cases', label: 'My cases', icon: 'fas fa-briefcase' },
          { id: 'case-execution', label: 'Case execution', icon: 'fas fa-tasks' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  senior_management: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Approvals',
        items: [
          { id: 'pending-approval', label: 'Pending approval', icon: 'fas fa-clock' },
          { id: 'approved-plans', label: 'Approved plans', icon: 'fas fa-check-circle' },
          { id: 'rejected-plans', label: 'Rejected plans', icon: 'fas fa-times-circle' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  process_owner: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Cases',
        items: [
          { id: 'cases', label: 'Audit cases', icon: 'fas fa-folder' },
          { id: 'stored-cases', label: 'Stored cases', icon: 'fas fa-archive' },
          { id: 'case-assignment', label: 'Assignment', icon: 'fas fa-user-check' },
        ],
      },
      {
        label: 'Requests',
        items: [
          { id: 'requests', label: 'Requests', icon: 'fas fa-inbox' },
          { id: 'case-types', label: 'Case types', icon: 'fas fa-tags' },
        ],
      },
    ],
    footer: { id: 'configuration', label: 'Settings', icon: 'fas fa-cog' },
  },

  directorate_requester: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Requests',
        items: [
          { id: 'submit-request', label: 'Submit request', icon: 'fas fa-plus-circle' },
          { id: 'my-requests', label: 'My requests', icon: 'fas fa-list' },
        ],
      },
    ],
    footer: null,
  },

  external_stakeholder: {
    categories: [
      {
        label: 'Overview',
        items: [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
        ],
      },
      {
        label: 'Requests',
        items: [
          { id: 'submit-request', label: 'Submit request', icon: 'fas fa-plus-circle' },
          { id: 'my-requests', label: 'My requests', icon: 'fas fa-list' },
        ],
      },
    ],
    footer: null,
  },
};

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || { categories: [], footer: null };
}

export function getRoleLabel(role) {
  return role?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
}
