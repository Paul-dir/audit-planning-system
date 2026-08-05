import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { storage, STORE_KEYS } from '../services/storage.js';
import { SEED_USERS, SEED_PLANS, generateCases } from '../data/seed.js';
import { REGIONS } from '../data/constants.js';

const AppContext = createContext({ state: { plans: [], cases: [], users: [] }, actions: {}, selectors: {}, ready: false });

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'CREATE_PLAN':
      return { ...state, plans: [...state.plans, action.payload] };
    case 'UPDATE_PLAN':
      return { ...state, plans: state.plans.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'ADD_CASES':
      return { ...state, cases: [...state.cases, ...action.payload] };
    case 'UPDATE_CASE':
      return { ...state, cases: state.cases.map(c => c.id === action.payload.id ? action.payload : c) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { plans: [], cases: [], users: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seeded = storage.get(STORE_KEYS.SEEDED);
    if (!seeded) {
      storage.set(STORE_KEYS.USERS, SEED_USERS);
      storage.set(STORE_KEYS.PLANS, SEED_PLANS);
      storage.set(STORE_KEYS.CASES, []);
      storage.set(STORE_KEYS.SEEDED, true);
    }
    dispatch({
      type: 'LOAD',
      payload: {
        users: storage.get(STORE_KEYS.USERS, SEED_USERS),
        plans: storage.get(STORE_KEYS.PLANS, SEED_PLANS),
        cases: storage.get(STORE_KEYS.CASES, []),
      },
    });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    storage.set(STORE_KEYS.PLANS, state.plans);
    storage.set(STORE_KEYS.CASES, state.cases);
    storage.set(STORE_KEYS.USERS, state.users);
  }, [state, ready]);

  const timeline = (plan, status, actor, comment = '') => ({
    ...plan,
    status,
    timeline: [...(plan.timeline || []), { status, actor, comment, timestamp: new Date().toISOString() }],
  });

  const getPlan = (id) => state.plans.find(p => p.id === id);
  const getCase = (id) => state.cases.find(c => c.id === id);

  const actions = {
    createPlan: (data) => {
      const plan = {
        id: `AP-${Date.now()}`,
        ...data,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        directorComment: '',
        revisions: [],
        regionalFeedback: {},
        seniorComment: '',
        timeline: [{ status: 'DRAFT', actor: data.createdBy, comment: 'Plan created', timestamp: new Date().toISOString() }],
      };
      dispatch({ type: 'CREATE_PLAN', payload: plan });
      return plan;
    },

    updatePlanDraft: (planId, updates) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: { ...plan, ...updates } });
    },

    submitToDirector: (planId, actorId) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: timeline(plan, 'SUBMITTED_TO_DIRECTOR', actorId, 'Submitted for director review') });
    },

    approvePlan: (planId, actorId, comment) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: timeline({ ...plan, directorComment: comment }, 'DIRECTOR_APPROVED', actorId, comment || 'Approved') });
    },

    requestRevision: (planId, actorId, comment) => {
      const plan = getPlan(planId);
      if (!plan) return;
      const updated = { ...plan, directorComment: comment, revisions: [...(plan.revisions || []), { comment, timestamp: new Date().toISOString(), by: actorId }] };
      dispatch({ type: 'UPDATE_PLAN', payload: timeline(updated, 'REVISION_REQUESTED', actorId, comment) });
    },

    sendToRegions: (planId, actorId) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: timeline(plan, 'AWAITING_REGIONAL_FEEDBACK', actorId, 'Sent to all regions for feedback') });
    },

    submitRegionalFeedback: (planId, regionId, feedbackText, taxCenterAllocations, actorId) => {
      const plan = getPlan(planId);
      if (!plan) return;
      const newFeedback = {
        ...plan.regionalFeedback,
        [regionId]: { feedback: feedbackText, taxCenterAllocations, submittedAt: new Date().toISOString(), submittedBy: actorId },
      };
      const allDone = REGIONS.every(r => newFeedback[r.id]);
      const newStatus = allDone ? 'FEEDBACK_COLLECTED' : 'AWAITING_REGIONAL_FEEDBACK';
      const msg = allDone ? 'All regional feedback collected' : `${regionId} submitted feedback`;
      dispatch({ type: 'UPDATE_PLAN', payload: timeline({ ...plan, regionalFeedback: newFeedback }, newStatus, actorId, msg) });
    },

    submitToSeniorMgmt: (planId, actorId) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: timeline(plan, 'SUBMITTED_TO_SENIOR_MGMT', actorId, 'Submitted for senior management approval') });
    },

    approveBySenior: (planId, actorId, comment) => {
      const plan = getPlan(planId);
      if (plan) dispatch({ type: 'UPDATE_PLAN', payload: timeline({ ...plan, seniorComment: comment }, 'SENIOR_MGMT_APPROVED', actorId, comment || 'Approved') });
    },

    rejectBySenior: (planId, actorId, comment) => {
      const plan = getPlan(planId);
      if (!plan) return;
      const updated = { ...plan, seniorComment: comment, revisions: [...(plan.revisions || []), { comment, timestamp: new Date().toISOString(), by: actorId }] };
      dispatch({ type: 'UPDATE_PLAN', payload: timeline(updated, 'REVISION_REQUESTED', actorId, comment) });
    },

    finalizePlan: (planId, actorId) => {
      const plan = getPlan(planId);
      if (!plan) return;
      dispatch({ type: 'UPDATE_PLAN', payload: timeline(plan, 'FINALIZED', actorId, 'Plan finalized and cases deployed') });
      // Pass regionalFeedback so generateCases honours the approved tax-centre allocations.
      // Falls back gracefully to even distribution when feedback is missing.
      dispatch({ type: 'ADD_CASES', payload: generateCases(planId, plan.distribution, plan.regionalFeedback || {}) });
    },

    assignCaseToTeamLeader: (caseId, teamLeaderId) => {
      const c = getCase(caseId);
      if (c) dispatch({ type: 'UPDATE_CASE', payload: { ...c, assignedTeamLeader: teamLeaderId, status: 'ASSIGNED', assignedAt: new Date().toISOString() } });
    },

    assignCaseToAuditor: (caseId, auditorId) => {
      const c = getCase(caseId);
      if (c) dispatch({ type: 'UPDATE_CASE', payload: { ...c, assignedAuditor: auditorId, status: 'IN_PROGRESS', startDate: new Date().toISOString() } });
    },

    updateCaseStatus: (caseId, status, notes = '') => {
      const c = getCase(caseId);
      if (c) dispatch({ type: 'UPDATE_CASE', payload: {
        ...c, status, notes: notes || c.notes,
        ...(status === 'COMPLETED' ? { completedDate: new Date().toISOString() } : {}),
      }});
    },
  };

  const selectors = {
    getPlanById: (id) => state.plans.find(p => p.id === id),
    getCasesForPlan: (planId) => state.cases.filter(c => c.planId === planId),
    getCasesForRegion: (region) => state.cases.filter(c => c.region === region),
    getCasesForTaxCenter: (tc) => state.cases.filter(c => c.taxCenter === tc),
    getCasesForTeamLeader: (id) => state.cases.filter(c => c.assignedTeamLeader === id),
    getCasesForAuditor: (id) => state.cases.filter(c => c.assignedAuditor === id),
    getUserById: (id) => state.users.find(u => u.id === id),
    getUsersByRole: (role) => state.users.filter(u => u.role === role),
    getUsersByTaxCenterAndRole: (tc, role) => state.users.filter(u => u.taxCenter === tc && u.role === role),
    getPlanStats: () => ({
      total: state.plans.length,
      draft: state.plans.filter(p => p.status === 'DRAFT').length,
      pendingDirector: state.plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length,
      active: state.plans.filter(p => ['DIRECTOR_APPROVED','AWAITING_REGIONAL_FEEDBACK','FEEDBACK_COLLECTED'].includes(p.status)).length,
      pendingSenior: state.plans.filter(p => p.status === 'SUBMITTED_TO_SENIOR_MGMT').length,
      finalized: state.plans.filter(p => p.status === 'FINALIZED').length,
    }),
  };

  return (
    <AppContext.Provider value={{ state, actions, selectors, ready }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
