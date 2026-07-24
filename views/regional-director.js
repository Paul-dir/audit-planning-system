import { loadData } from '../shared/js/data.js';
import { getStatusDisplay, getStatusBadgeClass, submitRegionalFeedback } from '../shared/js/business-logic.js';

export function renderRegionalDirector() {
  const region = document.getElementById('regionSelector').value;
  const plan = getActivePlanForRegion();

  const submitBtn = document.getElementById('submitFeedbackBtn');
  if (!plan) {
    document.getElementById('rdTotal').textContent = '0';
    document.getElementById('rdStatus').textContent = 'No Plan';
    document.getElementById('rdNationalSummary').innerHTML = '<tr><td colspan="2">No national plan available for review.</td></tr>';
    document.getElementById('rdAllocationTable').innerHTML = '<tr><td colspan="3">No allocation found.</td></tr>';
    submitBtn.disabled = true;
    return;
  }

  const allocation = plan.allocations.find(a => a.region === region);

  // National Summary
  document.getElementById('rdNationalSummary').innerHTML = `
    <tr><td><strong>Plan ID</strong></td><td>${plan.id}</td></tr>
    <tr><td><strong>Year</strong></td><td>${plan.year}</td></tr>
    <tr><td><strong>National Total</strong></td><td>${plan.nationalTotal}</td></tr>
    <tr><td><strong>Status</strong></td><td><span class="badge ${getStatusBadgeClass(plan.status)}">${getStatusDisplay(plan.status)}</span></td></tr>
    <tr><td><strong>Regions</strong></td><td>${plan.allocations.length}</td></tr>
    <tr><td><strong>Effort</strong></td><td>${plan.effort || 'N/A'} hours</td></tr>
    <tr><td><strong>Planning Period</strong></td><td>${plan.planningPeriodStart || 'N/A'} to ${plan.planningPeriodEnd || 'N/A'}</td></tr>
  `;

  if (!allocation) {
    document.getElementById('rdTotal').textContent = '0';
    document.getElementById('rdStatus').textContent = 'Not Found';
    document.getElementById('rdAllocationTable').innerHTML = '<tr><td colspan="3">No allocation for your region.</td></tr>';
    submitBtn.disabled = true;
    return;
  }

  document.getElementById('rdTotal').textContent = allocation.total;
  const statusMap = {
    'PENDING': '<span class="badge pending">Pending Review</span>',
    'FEEDBACK_SUBMITTED': '<span class="badge submitted">Feedback Submitted</span>',
    'ACCEPTED': '<span class="badge director-approved">Accepted</span>',
    'REJECTED': '<span class="badge rejected">Rejected</span>'
  };
  document.getElementById('rdStatus').innerHTML = statusMap[allocation.status] || '<span class="badge">Unknown</span>';

  // Disable submit button if feedback already submitted or accepted/rejected
  if (allocation.status === 'FEEDBACK_SUBMITTED' || allocation.status === 'ACCEPTED' || allocation.status === 'REJECTED') {
    submitBtn.disabled = true;
    submitBtn.title = 'Feedback already processed for this region.';
  } else {
    submitBtn.disabled = false;
    submitBtn.title = '';
  }

  const tbody = document.getElementById('rdAllocationTable');
  tbody.innerHTML = `
    <tr><td><strong>Total Cases</strong></td><td>${allocation.total}</td>
      <td><input type="number" id="adj_total" value="${allocation.total}" style="width:100px;" /></td></tr>
    <tr><td>Desk Audit</td><td>${allocation.desk}</td>
      <td><input type="number" id="adj_desk" value="${allocation.desk}" style="width:100px;" /></td></tr>
    <tr><td>Field Audit</td><td>${allocation.field}</td>
      <td><input type="number" id="adj_field" value="${allocation.field}" style="width:100px;" /></td></tr>
    <tr><td>Transfer Pricing</td><td>${allocation.tp}</td>
      <td><input type="number" id="adj_tp" value="${allocation.tp}" style="width:100px;" /></td></tr>
    <tr><td>Issue Audit</td><td>${allocation.issue}</td>
      <td><input type="number" id="adj_issue" value="${allocation.issue}" style="width:100px;" /></td></tr>
  `;

  // Store current plan ID for feedback submission
  window._currentRegionalPlanId = plan.id;
}

function getActivePlanForRegion() {
  const data = loadData();
  return data.plans.find(p => p.status === 'AWAITING_FEEDBACK');
}

// --- Submit Feedback ---
window.submitRegionalFeedbackAction = function() {
  const planId = window._currentRegionalPlanId;
  if (!planId) {
    alert('No active plan.');
    return;
  }
  const region = document.getElementById('regionSelector').value;
  const message = prompt('Enter your feedback message (e.g., "Need more auditors"):', 'Current allocation exceeds available staff.');
  if (message === null) return;

  const comments = document.getElementById('rdAdditionalComments').value.trim() || '';

  const adj = {
    total: parseInt(document.getElementById('adj_total').value) || 0,
    desk: parseInt(document.getElementById('adj_desk').value) || 0,
    field: parseInt(document.getElementById('adj_field').value) || 0,
    tp: parseInt(document.getElementById('adj_tp').value) || 0,
    issue: parseInt(document.getElementById('adj_issue').value) || 0
  };

  if (submitRegionalFeedback(planId, region, message, adj, comments)) {
    alert('Feedback submitted to the Audit Director.');
    document.getElementById('rdAdditionalComments').value = '';
    renderRegionalDirector();
  } else {
    alert('Cannot submit feedback. Plan may not be AWAITING_FEEDBACK.');
  }
};

// --- Region selector change ---
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('regionSelector').addEventListener('change', renderRegionalDirector);
  document.getElementById('submitFeedbackBtn').addEventListener('click', window.submitRegionalFeedbackAction);
});
