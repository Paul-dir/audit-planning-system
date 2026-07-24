import { loadData } from '../shared/js/data.js';
import { getStatusDisplay, getStatusBadgeClass, directorApprove, directorReject, returnToPlanningTeam } from '../shared/js/business-logic.js';

export function renderDirector() {
  const data = loadData();
  const plans = data.plans;

  document.getElementById('dirSubmitted').textContent = plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR').length;
  document.getElementById('dirAwaitingFeedback').textContent = plans.filter(p => p.status === 'AWAITING_FEEDBACK').length;
  document.getElementById('dirFeedbackCollected').textContent = plans.filter(p => p.status === 'FEEDBACK_COLLECTED').length;
  document.getElementById('dirWithSenior').textContent = plans.filter(p => p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT').length;
  document.getElementById('dirApproved').textContent = plans.filter(p => p.status === 'SENIOR_APPROVED').length;

  const tbody = document.getElementById('dirPlansTable');
  if (plans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No national plans.</td></tr>';
    return;
  }

  tbody.innerHTML = plans.map(p => {
    let actions = '';
    if (p.status === 'SUBMITTED_TO_DIRECTOR') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <button class="btn btn-sm btn-success" onclick="window.directorApproveAction('${p.id}')">Approve</button>
                 <button class="btn btn-sm btn-danger" onclick="window.directorRejectAction('${p.id}')">Reject</button>
                 <button class="btn btn-sm btn-warning" onclick="window.returnToPlanningTeamAction('${p.id}')">Return to Planning</button>`;
    } else if (p.status === 'DIRECTOR_APPROVED') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <button class="btn btn-sm btn-primary" onclick="window.openSendToBranches('${p.id}')">Request Feedback</button>
                 <button class="btn btn-sm btn-purple" onclick="window.openSubmitSenior('${p.id}')">Submit to Senior</button>
                 <button class="btn btn-sm btn-warning" onclick="window.returnToPlanningTeamAction('${p.id}')">Return to Planning</button>`;
    } else if (p.status === 'AWAITING_FEEDBACK' || p.status === 'FEEDBACK_COLLECTED') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <button class="btn btn-sm btn-primary" onclick="window.viewFeedback('${p.id}')">View Feedback</button>
                 <button class="btn btn-sm btn-warning" onclick="window.returnToPlanningTeamAction('${p.id}')">Return to Planning</button>`;
      if (p.status === 'FEEDBACK_COLLECTED') {
        actions += ` <button class="btn btn-sm btn-purple" onclick="window.openSubmitSenior('${p.id}')">Submit to Senior</button>`;
      }
    } else if (p.status === 'SUBMITTED_TO_SENIOR_MANAGEMENT') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <span class="badge senior-pending">With Senior</span>`;
    } else if (p.status === 'SENIOR_APPROVED') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <span class="badge senior-approved">Approved</span>`;
    } else if (p.status === 'CASCADED') {
      actions = `<button class="btn btn-sm btn-info" onclick="window.viewPlanDetails('${p.id}')">View</button>
                 <span class="badge cascaded">Cascaded</span>`;
    } else if (p.status === 'DRAFT') {
      actions = `<span class="badge draft">Draft</span>`;
    }
    return `<tr><td>${p.id}</td><td>${p.year}</td>
             <td><span class="badge ${getStatusBadgeClass(p.status)}">${getStatusDisplay(p.status)}</span></td>
             <td>${p.nationalTotal}</td><td>${p.allocations.length}</td><td>${actions || '-'}</td></tr>`;
  }).join('');
}

// --- Director actions ---
window.directorApproveAction = function(id) {
  const notes = prompt('Enter approval notes (optional):');
  if (directorApprove(id, notes || '')) {
    alert('Plan approved internally.');
    renderDirector();
  } else {
    alert('Cannot approve. Plan must be SUBMITTED_TO_DIRECTOR.');
  }
};

window.directorRejectAction = function(id) {
  const reason = prompt('Enter rejection reason:');
  if (reason && directorReject(id, reason)) {
    alert('Plan rejected and returned to DRAFT.');
    renderDirector();
  } else if (!reason) {
    alert('Rejection reason is required.');
  } else {
    alert('Cannot reject. Plan must be SUBMITTED_TO_DIRECTOR.');
  }
};

window.returnToPlanningTeamAction = function(id) {
  const reason = prompt('Enter reason for returning to Planning Team:');
  if (reason && returnToPlanningTeam(id, reason)) {
    alert('Plan returned to Planning Team for revision.');
    renderDirector();
  } else if (!reason) {
    alert('Reason is required.');
  } else {
    alert('Cannot return. Plan status not eligible.');
  }
};
