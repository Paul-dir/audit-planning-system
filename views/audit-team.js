// ============================================================
// VIEW: Audit Planning Team
// ============================================================
import { loadData } from '../shared/js/data.js';
import { getStatusDisplay, getStatusBadgeClass, submitPlanToDirector } from '../shared/js/business-logic.js';

export function renderAuditTeam() {
  const data = loadData();
  const plans = data.plans;

  document.getElementById('atDraft').textContent = plans.filter(p => p.status === 'DRAFT').length;
  document.getElementById('atWithDirector').textContent = plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length;
  document.getElementById('atWithSenior').textContent = plans.filter(p => p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT').length;
  document.getElementById('atApproved').textContent = plans.filter(p => p.status === 'SENIOR_APPROVED').length;
  document.getElementById('atReadyCascade').textContent = plans.filter(p => p.status === 'SENIOR_APPROVED').length;

  const tbody = document.getElementById('atPlansTable');
  if (plans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No national plans yet.</td></tr>';
    return;
  }

  tbody.innerHTML = plans.map(p => {
    let actions = '';
    if (p.status === 'DRAFT') {
      actions = `<button class="btn btn-sm btn-primary" onclick="window.submitToDirector('${p.id}')">Submit to Director</button>`;
    } else if (p.status === 'SUBMITTED_TO_DIRECTOR') {
      actions = `<span class="badge submitted">With Director</span>`;
    } else if (p.status === 'DIRECTOR_APPROVED' || p.status === 'FEEDBACK_COLLECTED') {
      actions = `<span class="badge director-approved">Director Approved</span>`;
    } else if (p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT') {
      actions = `<span class="badge senior-pending">With Senior Mgmt</span>`;
    } else if (p.status === 'SENIOR_APPROVED') {
      actions = `<button class="btn btn-sm btn-success" onclick="window.cascadePlan('${p.id}')"><i class="fas fa-arrow-down"></i> Cascade</button>`;
    } else if (p.status === 'CASCADED') {
      actions = `<span class="badge cascaded">Cascaded</span>`;
    } else if (p.status === 'AWAITING_FEEDBACK') {
      actions = `<span class="badge feedback">With Branches</span>`;
    }
    return `<tr>
              <td>${p.id}</td>
              <td>${p.year}</td>
              <td><span class="badge ${getStatusBadgeClass(p.status)}">${getStatusDisplay(p.status)}</span></td>
              <td>${p.nationalTotal}</td>
              <td>${p.allocations.length}</td>
              <td>${actions || '-'}</td>
            </tr>`;
  }).join('');
}

// Global function for onclick (to be attached to window)
window.submitToDirector = function(id) {
  if (submitPlanToDirector(id)) {
    alert('Plan submitted to Director.');
    renderAuditTeam(); // re-render
  } else {
    alert('Cannot submit. Plan must be in DRAFT status.');
  }
};
