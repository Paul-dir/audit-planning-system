# Complete Feedback & Amendment Workflow

## Workflow Stages

```
┌─────────────────────────────────────────────────────────────────────────┐
│                  COMPLETE FEEDBACK & APPROVAL CYCLE                      │
└─────────────────────────────────────────────────────────────────────────┘

Stage 1: TAX CENTER FEEDBACK
├─ Tax Centers provide feedback (table format)
├─ Per audit type: allocated → proposed
└─ Capacity, resources, timeline assessment
         ↓
         
Stage 2: REGIONAL AGGREGATION
├─ Regional Director collects all TC feedback
├─ Aggregates by audit type
├─ Original → TC Proposed → Regional Proposed
└─ Sends to Audit Director
         ↓
         
Stage 3: DIRECTOR REVIEW
├─ Audit Director receives all regional feedback
├─ Reviews proposals from all regions
├─ Decides: Accept, Modify, or Send for Amendment
└─ → Option A: Send to Audit Planning Team for amendments
    → Option B: Send to Senior Management for approval
         ↓
         
Stage 4A: PLANNING TEAM AMENDMENTS (If sent back)
├─ Audit Planning Team receives director's feedback
├─ Reviews all regional proposals
├─ Amends plan based on feedback
└─ Resubmits to Audit Director
         ↓ (back to Stage 3)
         
Stage 4B: SENIOR MANAGEMENT APPROVAL
├─ Senior Management receives director's recommendation
├─ Reviews final plan with all feedback
├─ Approves or Rejects
└─ Final decision
```

## Data Flow

### Stage 1: Tax Center → Regional (DONE ✅)
```javascript
plan.taxCenterFeedback[region][taxCenter] = {
  feedbackByType: { /* per audit type */ },
  feedbackDate: timestamp,
  feedbackBy: "TC Manager Name"
}
```

### Stage 2: Regional → Director (DONE ✅)
```javascript
plan.regionalFeedbackStatus[region] = {
  sentToDirector: true,
  feedbackByType: { /* aggregated per audit type */ },
  taxCenterCount: 3,
  allTaxCenterFeedback: { /* original TC data */ }
}
```

### Stage 3: Director → Planning Team (NEW)
```javascript
plan.directorFeedbackToPlanning = {
  sentForAmendment: true,
  sentDate: timestamp,
  sentBy: "Director Name",
  directorRemarks: "Please review regional proposals and amend",
  regionalSummary: { /* all regional feedback */ },
  requestedChanges: { /* specific change requests */ }
}
```

### Stage 4A: Planning Team → Director (NEW)
```javascript
plan.planningTeamAmendment = {
  amendedDate: timestamp,
  amendedBy: "Planning Team Member",
  amendments: {
    desk_audit: { original: 210, amended: 200, reason: "..." },
    field_audit: { original: 123, amended: 130, reason: "..." }
  },
  resubmittedToDirector: true
}
```

### Stage 4B: Director → Senior Management (NEW)
```javascript
plan.directorRecommendation = {
  sentToSeniorManagement: true,
  sentDate: timestamp,
  sentBy: "Director Name",
  recommendation: "APPROVE", // or "NEEDS_REVIEW"
  finalProposal: { /* per audit type */ },
  executiveSummary: "Summary for senior management"
}
```

### Stage 5: Senior Management Decision (NEW)
```javascript
plan.seniorManagementDecision = {
  decision: "APPROVED", // or "REJECTED"
  decidedDate: timestamp,
  decidedBy: "Senior Manager Name",
  comments: "Approved with noted constraints",
  finalPlan: { /* locked final numbers */ }
}
```

## Views to Create/Update

### 1. AuditDirectorReviewFeedbackView (NEW)
- View all regional feedback
- Aggregated table across all regions
- Actions:
  - Send to Planning Team for amendments
  - Send to Senior Management for approval
  - Request more information from regions

### 2. AuditPlanningTeamAmendView (NEW)
- Receive plans sent back by director
- View director's remarks and regional feedback
- Amend plan in table format
- Resubmit to director

### 3. AuditDirectorFinalSubmitView (NEW)
- Review amendments from planning team
- Prepare executive summary
- Submit to senior management with recommendation

### 4. SeniorManagementApprovalView (NEW)
- View director's recommendation
- See executive summary
- Review final numbers
- Approve or reject plan

## Status Tracking

```javascript
plan.workflowStatus = {
  currentStage: "SENIOR_MANAGEMENT_REVIEW",
  stages: {
    TAX_CENTER_FEEDBACK: { status: "COMPLETED", date: "..." },
    REGIONAL_AGGREGATION: { status: "COMPLETED", date: "..." },
    DIRECTOR_REVIEW: { status: "COMPLETED", date: "..." },
    PLANNING_AMENDMENT: { status: "COMPLETED", date: "..." },
    DIRECTOR_FINAL: { status: "COMPLETED", date: "..." },
    SENIOR_APPROVAL: { status: "IN_PROGRESS", date: "..." }
  }
}
```

## Implementation Priority

1. ✅ **DONE**: TaxCenterReceiveAllocationsView (feedback table)
2. ✅ **DONE**: RegionalDirectorCollectFeedbackView (aggregation table)
3. 🔨 **NEXT**: AuditDirectorReviewFeedbackView
4. 🔨 **NEXT**: AuditPlanningTeamAmendView
5. 🔨 **NEXT**: AuditDirectorFinalSubmitView
6. 🔨 **NEXT**: SeniorManagementApprovalView

## Benefits

### Complete Audit Trail
- Every change tracked
- Who made changes and when
- Reasons for amendments documented

### Flexibility
- Can iterate (send back for amendments)
- Can skip amendments (direct to approval)
- Multiple review levels

### Accountability
- Clear approvers at each stage
- Documented recommendations
- Traceable decisions

---

**Status**: Design complete, ready for implementation
