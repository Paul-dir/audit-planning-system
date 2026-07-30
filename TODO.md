# Tailwind CSS Conversion — Remaining Components

## Priority 1 — Convert Inline Styles to Tailwind (Enterprise Login & Key Views)

- [ ] EnterpriseLoginForm.jsx — heavy inline styles → Tailwind + enterprise design
- [ ] ConfigurationManagementView.jsx — already has Tailwind-like classes but still uses some inline
- [ ] AuditCasesListView.jsx — check for inline styles
- [ ] CascadePlanToCasesView.jsx — check for inline styles
- [ ] AssessmentView related components — convert remaining
- [ ] DirectorFeedbackReviewView.jsx — inline styles
- [ ] RegionalPlanSubmissionView.jsx — mixed CSS classes + inline

## Priority 2 — Remove legacy common.css after full conversion

- [ ] Audit src/styles/common.css — remove classes no longer referenced
- [ ] Ensure all components use Tailwind exclusively
- [ ] Build verification after each batch

## Priority 3 — Enterprise UI Polish

- [ ] Add consistent card shadows and hover effects
- [ ] Ensure dark mode everywhere
- [ ] Responsive testing
- [ ] Final build & verify
