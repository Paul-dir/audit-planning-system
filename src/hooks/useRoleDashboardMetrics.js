import { useMemo } from 'react';
import { auditConfig } from '../config/auditConfig';
import { ANNUAL_PLANNING_STAGES, STAGE_STATUS } from '../config/planningProcess';
import { useAppData } from './useAppData';

function countSentAllocations(plans) {
  let sent = 0;
  let total = 0;
  plans.forEach((plan) => {
    if (plan.allocationStatus) {
      Object.values(plan.allocationStatus).forEach((status) => {
        total++;
        if (status.status === 'SENT') sent++;
      });
    }
  });
  return { sent, total };
}

function countFeedback(plans) {
  let received = 0;
  let expected = 0;
  plans.forEach((plan) => {
    if (plan.taxCenterAllocations) {
      Object.values(plan.taxCenterAllocations).forEach((regionTCs) => {
        expected += Object.keys(regionTCs).length;
      });
    }
    if (plan.taxCenterFeedback) {
      Object.values(plan.taxCenterFeedback).forEach((regionFeedback) => {
        Object.values(regionFeedback).forEach((fb) => {
          if (fb?.status === 'SUBMITTED' || fb?.status === 'submitted') {
            received++;
          }
        });
      });
    }
  });
  return { received, expected };
}

function computeActiveStage(plans) {
  if (plans.length === 0) return 0;

  const hasAllocation = plans.some(
    (p) => p.regionalAllocation || (p.regionalAllocations && p.regionalAllocations.length > 0)
  );
  if (!hasAllocation) return 0;

  const { sent, total } = countSentAllocations(plans);
  if (total === 0 || sent < total) return 2;

  const { received, expected } = countFeedback(plans);
  if (expected > 0 && received < expected) return 3;

  const finalized = plans.filter(
    (p) => p.status === 'APPROVED' || p.status === 'FINALIZED' || p.status === 'DIRECTOR_APPROVED'
  ).length;
  if (finalized < plans.length) return 4;

  return 5;
}

function resolveStageStatuses(activeIndex) {
  return ANNUAL_PLANNING_STAGES.map((_, index) => {
    if (index < activeIndex) return STAGE_STATUS.COMPLETE;
    if (index === activeIndex) return STAGE_STATUS.IN_PROGRESS;
    return STAGE_STATUS.PENDING;
  });
}

export function useSidebarStats() {
  const { data } = useAppData();

  return useMemo(() => {
    const cases = (data.cases || []).length + (data.auditCases || []).length;
    const plans = (data.plans || []).length;
    const assigned = (data.assignments || []).length;
    return { cases, plans, assigned };
  }, [data]);
}

export function useAuditTeamMetrics() {
  const { data, refresh } = useAppData();

  return useMemo(() => {
    const plans = data.plans || [];
    const regionCount = auditConfig.regions.length;

    const totalPlans = plans.length;
    const approvedPlans = plans.filter(
      (p) => p.status === 'APPROVED' || p.status === 'FINALIZED' || p.status === 'DIRECTOR_APPROVED'
    ).length;
    const submittedPlans = plans.filter((p) => p.status === 'SUBMITTED').length;

    const { sent, total: totalAllocations } = countSentAllocations(plans);
    const { received: feedbackReceived, expected: feedbackExpected } = countFeedback(plans);

    const completionRate = totalPlans > 0 ? Math.round((approvedPlans / totalPlans) * 100) : 0;
    const feedbackRate =
      feedbackExpected > 0 ? Math.round((feedbackReceived / feedbackExpected) * 100) : 0;

    const activeStageIndex = computeActiveStage(plans);
    const stageStatuses = resolveStageStatuses(activeStageIndex);

    const stages = ANNUAL_PLANNING_STAGES.map((stage, index) => ({
      ...stage,
      status: stageStatuses[index],
    }));

    const activeStage = ANNUAL_PLANNING_STAGES[activeStageIndex];

    return {
      summaryMetrics: [
        {
          id: 'sent-regions',
          title: 'Sent to regions',
          value: sent,
          subtitle: `of ${totalAllocations || regionCount * Math.max(totalPlans, 1)} total allocations distributed`,
          color: 'amber',
          progress: totalAllocations > 0 ? Math.round((sent / totalAllocations) * 100) : 0,
        },
        {
          id: 'feedback-received',
          title: 'Feedback received',
          value: feedbackReceived,
          subtitle: 'tax center capacity confirmations',
          color: 'blue',
          progress: feedbackExpected > 0 ? Math.round((feedbackReceived / feedbackExpected) * 100) : 0,
        },
        {
          id: 'completion-rate',
          title: 'Completion rate',
          value: `${completionRate}%`,
          subtitle: `${approvedPlans} of ${totalPlans} plans finalized`,
          color: 'teal',
          progress: completionRate,
        },
      ],
      bottomMetrics: [
        { id: 'submitted', label: 'Submitted plans', value: submittedPlans, color: 'blue' },
        { id: 'regions', label: 'Regions covered', value: regionCount, color: 'teal' },
        { id: 'feedback-rate', label: 'Avg. feedback rate', value: `${feedbackRate}%`, color: 'amber' },
      ],
      stages,
      activeStageTitle: activeStage?.title || 'Create plan',
      timelineTitle: 'Annual planning process',
      refresh,
    };
  }, [data, refresh]);
}

export function useAuditDirectorMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const plans = data.plans || [];
    const plansToReview = plans.filter((p) => p.status === 'SUBMITTED').length;
    const feedbackSent = data.feedback?.length || 0;
    const underRevision = plans.filter((p) => p.status === 'REVISION_REQUESTED').length;
    const approvedPlans = plans.filter((p) => p.status === 'DIRECTOR_APPROVED').length;
    const finalizedPlans = plans.filter((p) => p.status === 'FINALIZED').length;
    const total = plans.length;
    const reviewProgress = total > 0 ? Math.round(((approvedPlans + finalizedPlans) / total) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'to-review',
          title: 'Plans to review',
          value: plansToReview,
          subtitle: 'awaiting director decision',
          color: 'amber',
          progress: total > 0 ? Math.round((plansToReview / total) * 100) : 0,
        },
        {
          id: 'feedback-sent',
          title: 'Feedback sent',
          value: feedbackSent,
          subtitle: 'regional feedback requests issued',
          color: 'blue',
          progress: Math.min(100, feedbackSent * 10),
        },
        {
          id: 'approved',
          title: 'Approval rate',
          value: `${reviewProgress}%`,
          subtitle: `${approvedPlans + finalizedPlans} of ${total} plans approved`,
          color: 'teal',
          progress: reviewProgress,
        },
      ],
      bottomMetrics: [
        { id: 'revision', label: 'Under revision', value: underRevision, color: 'amber' },
        { id: 'approved', label: 'Approved plans', value: approvedPlans, color: 'teal' },
        { id: 'finalized', label: 'Finalized plans', value: finalizedPlans, color: 'blue' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useRegionalDirectorMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const plans = data.plans || [];
    let allocatedTaxCenters = 0;
    let feedbackProvided = 0;
    let sentAllocations = 0;
    let pendingFeedback = 0;

    plans.forEach((plan) => {
      if (plan.taxCenterAllocations) {
        Object.values(plan.taxCenterAllocations).forEach((regionTCs) => {
          allocatedTaxCenters += Object.keys(regionTCs).length;
        });
      }
      if (plan.taxCenterFeedback) {
        Object.values(plan.taxCenterFeedback).forEach((regionFeedback) => {
          Object.values(regionFeedback).forEach((fb) => {
            if (fb?.status === 'SUBMITTED' || fb?.status === 'submitted') {
              feedbackProvided++;
            } else {
              pendingFeedback++;
            }
          });
        });
      }
      if (plan.allocationStatus) {
        Object.values(plan.allocationStatus).forEach((s) => {
          if (s.status === 'SENT') sentAllocations++;
        });
      }
    });

    const feedbackRate =
      allocatedTaxCenters > 0 ? Math.round((feedbackProvided / allocatedTaxCenters) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'plans',
          title: 'Plans received',
          value: plans.length,
          subtitle: 'regional plans in workflow',
          color: 'blue',
          progress: Math.min(100, plans.length * 20),
        },
        {
          id: 'feedback',
          title: 'Feedback received',
          value: feedbackProvided,
          subtitle: 'tax center capacity confirmations',
          color: 'amber',
          progress: feedbackRate,
        },
        {
          id: 'sent',
          title: 'Allocations sent',
          value: sentAllocations,
          subtitle: `${allocatedTaxCenters} tax centers allocated`,
          color: 'teal',
          progress: allocatedTaxCenters > 0 ? Math.round((sentAllocations / allocatedTaxCenters) * 100) : 0,
        },
      ],
      bottomMetrics: [
        { id: 'centers', label: 'Tax centers', value: allocatedTaxCenters, color: 'blue' },
        { id: 'pending', label: 'Pending feedback', value: pendingFeedback, color: 'amber' },
        { id: 'rate', label: 'Feedback rate', value: `${feedbackRate}%`, color: 'teal' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useTaxCenterManagerMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const plans = data.plans || [];
    const cases = data.auditCases || data.cases || [];
    const totalCases = cases.length;
    const inProgress = cases.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'in_progress').length;
    const closed = cases.filter((c) => c.status === 'CLOSED' || c.status === 'closed' || c.status === 'COMPLETED').length;
    const completionRate = totalCases > 0 ? Math.round((closed / totalCases) * 100) : 0;

    let feedbackSubmitted = 0;
    let pendingFeedback = 0;
    plans.forEach((plan) => {
      if (plan.taxCenterFeedback) {
        Object.values(plan.taxCenterFeedback).forEach((regionFeedback) => {
          Object.values(regionFeedback).forEach((fb) => {
            if (fb?.status === 'SUBMITTED' || fb?.status === 'submitted') {
              feedbackSubmitted++;
            } else {
              pendingFeedback++;
            }
          });
        });
      }
    });

    return {
      summaryMetrics: [
        {
          id: 'plans',
          title: 'Allocated plans',
          value: plans.length,
          subtitle: 'approved plans assigned to center',
          color: 'blue',
          progress: Math.min(100, plans.length * 25),
        },
        {
          id: 'cases',
          title: 'Cases assigned',
          value: totalCases,
          subtitle: `${inProgress} currently in progress`,
          color: 'amber',
          progress: totalCases > 0 ? Math.round((inProgress / totalCases) * 100) : 0,
        },
        {
          id: 'completion',
          title: 'Completion rate',
          value: `${completionRate}%`,
          subtitle: `${closed} of ${totalCases} cases completed`,
          color: 'teal',
          progress: completionRate,
        },
      ],
      bottomMetrics: [
        { id: 'feedback', label: 'Feedback submitted', value: feedbackSubmitted, color: 'blue' },
        { id: 'pending', label: 'Pending feedback', value: pendingFeedback, color: 'amber' },
        { id: 'closed', label: 'Cases closed', value: closed, color: 'teal' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useCascadeTeamMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const regionCount = auditConfig.regions.length;
    const taxCenterCount = auditConfig.taxCenters.length;
    const cases = data.auditCases || data.cases || [];
    const assignments = data.assignments || [];
    const plans = data.plans || [];

    let cascadeCompleted = 0;
    plans.forEach((plan) => {
      if (plan.taxCenterAllocations) {
        Object.values(plan.taxCenterAllocations).forEach((regionTCs) => {
          cascadeCompleted += Object.keys(regionTCs).length;
        });
      }
    });

    const cascadeProgress = taxCenterCount > 0 ? Math.round((cascadeCompleted / taxCenterCount) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'regions',
          title: 'Regions managed',
          value: regionCount,
          subtitle: 'active regional coverage',
          color: 'blue',
          progress: 100,
        },
        {
          id: 'cascade',
          title: 'Tax centers cascaded',
          value: `${cascadeCompleted}/${taxCenterCount}`,
          subtitle: 'plan distribution progress',
          color: 'amber',
          progress: cascadeProgress,
        },
        {
          id: 'cases',
          title: 'Cases created',
          value: cases.length,
          subtitle: `${assignments.length} cases assigned`,
          color: 'teal',
          progress: cases.length > 0 ? Math.round((assignments.length / cases.length) * 100) : 0,
        },
      ],
      bottomMetrics: [
        { id: 'plans', label: 'Active plans', value: plans.length, color: 'blue' },
        { id: 'assigned', label: 'Cases assigned', value: assignments.length, color: 'teal' },
        { id: 'progress', label: 'Cascade progress', value: `${cascadeProgress}%`, color: 'amber' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useTeamLeaderMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const assignments = data.assignments || [];
    const cases = data.auditCases || data.cases || [];
    const teamMembers = new Set(assignments.map((a) => a.auditorId || a.assignedTo).filter(Boolean));
    const inProgress = cases.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'in_progress').length;
    const closed = cases.filter((c) => c.status === 'CLOSED' || c.status === 'closed' || c.status === 'COMPLETED').length;
    const teamCapacity = Math.max(teamMembers.size * 5, 10);
    const capacityUsed = teamCapacity > 0 ? Math.round((assignments.length / teamCapacity) * 100) : 0;
    const completionRate = assignments.length > 0 ? Math.round((closed / assignments.length) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'team',
          title: 'Team auditors',
          value: teamMembers.size,
          subtitle: 'active team members',
          color: 'blue',
          progress: Math.min(100, teamMembers.size * 20),
        },
        {
          id: 'assigned',
          title: 'Cases assigned',
          value: assignments.length,
          subtitle: `${inProgress} currently in progress`,
          color: 'amber',
          progress: capacityUsed,
        },
        {
          id: 'completion',
          title: 'Completion rate',
          value: `${completionRate}%`,
          subtitle: `${closed} of ${assignments.length} cases closed`,
          color: 'teal',
          progress: completionRate,
        },
      ],
      bottomMetrics: [
        { id: 'progress', label: 'In progress', value: inProgress, color: 'amber' },
        { id: 'closed', label: 'Cases closed', value: closed, color: 'teal' },
        { id: 'capacity', label: 'Capacity used', value: `${capacityUsed}%`, color: 'blue' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useAuditorMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const cases = data.auditCases || data.cases || [];
    const inProgress = cases.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'in_progress').length;
    const closed = cases.filter((c) => c.status === 'CLOSED' || c.status === 'closed' || c.status === 'COMPLETED').length;
    const overdue = cases.filter((c) => c.isOverdue || c.status === 'OVERDUE').length;
    const completionRate = cases.length > 0 ? Math.round((closed / cases.length) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'assigned',
          title: 'Assigned cases',
          value: cases.length,
          subtitle: 'total cases on your queue',
          color: 'blue',
          progress: Math.min(100, cases.length * 10),
        },
        {
          id: 'progress',
          title: 'In progress',
          value: inProgress,
          subtitle: 'cases actively being executed',
          color: 'amber',
          progress: cases.length > 0 ? Math.round((inProgress / cases.length) * 100) : 0,
        },
        {
          id: 'completion',
          title: 'Completion rate',
          value: `${completionRate}%`,
          subtitle: `${closed} of ${cases.length} cases completed`,
          color: 'teal',
          progress: completionRate,
        },
      ],
      bottomMetrics: [
        { id: 'closed', label: 'Completed', value: closed, color: 'teal' },
        { id: 'overdue', label: 'Overdue', value: overdue, color: 'amber' },
        { id: 'rate', label: 'Completion rate', value: `${completionRate}%`, color: 'blue' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

export function useSeniorManagementMetrics() {
  const { data } = useAppData();

  return useMemo(() => {
    const plans = data.plans || [];
    const pending = plans.filter((p) => p.status === 'SUBMITTED' || p.status === 'DIRECTOR_APPROVED').length;
    const approved = plans.filter((p) => p.status === 'APPROVED' || p.status === 'FINALIZED').length;
    const rejected = plans.filter((p) => p.status === 'REJECTED').length;
    const total = plans.length;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return {
      summaryMetrics: [
        {
          id: 'pending',
          title: 'Pending approval',
          value: pending,
          subtitle: 'plans awaiting executive sign-off',
          color: 'amber',
          progress: total > 0 ? Math.round((pending / total) * 100) : 0,
        },
        {
          id: 'approved',
          title: 'Approved plans',
          value: approved,
          subtitle: 'executive approvals granted',
          color: 'teal',
          progress: approvalRate,
        },
        {
          id: 'rejected',
          title: 'Rejected plans',
          value: rejected,
          subtitle: 'plans returned for revision',
          color: 'blue',
          progress: total > 0 ? Math.round((rejected / total) * 100) : 0,
        },
      ],
      bottomMetrics: [
        { id: 'total', label: 'Total plans', value: total, color: 'blue' },
        { id: 'approved', label: 'Approved', value: approved, color: 'teal' },
        { id: 'rate', label: 'Approval rate', value: `${approvalRate}%`, color: 'amber' },
      ],
      stages: null,
      activeStageTitle: '',
      timelineTitle: '',
    };
  }, [data]);
}

const METRIC_HOOKS = {
  audit_team: useAuditTeamMetrics,
  audit_director: useAuditDirectorMetrics,
  regional_director: useRegionalDirectorMetrics,
  tax_center_manager: useTaxCenterManagerMetrics,
  cascade_audit_team: useCascadeTeamMetrics,
  team_leader: useTeamLeaderMetrics,
  auditor: useAuditorMetrics,
  senior_management: useSeniorManagementMetrics,
};

export function useRoleDashboardMetrics(role) {
  const hook = METRIC_HOOKS[role] || useAuditTeamMetrics;
  return hook();
}
