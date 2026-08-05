import { useState } from 'react';
import { Building2, Users, Clock, CheckCircle, Send, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, StatCard, Button, Modal, Badge, Alert, Textarea } from '../../components/ui/index.jsx';
import { AUDIT_TYPES } from '../../data/constants.js';
import PlanStatusBadge from '../shared/PlanStatusBadge.jsx';

export default function TaxCenterDashboard({ view }) {
  const { state, actions } = useApp();
  const { user } = useAuth();
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [adjustedAllocation, setAdjustedAllocation] = useState({});
  const [loading, setLoading] = useState(false);

  const taxCenter = user.taxCenter;
  const region = user.region;
  
  // Get plans where this tax center has been allocated cases
  const plansForTC = state.plans.filter(p => {
    const regionalFeedback = p.regionalFeedback?.[region];
    if (!regionalFeedback) return false;
    const tcAllocation = regionalFeedback.taxCenterAllocations?.[taxCenter];
    if (!tcAllocation) return false;
    const total = Object.values(tcAllocation).reduce((s, v) => s + v, 0);
    return total > 0;
  });

  // Check if feedback submitted
  const awaitingFeedback = plansForTC.filter(p => !p.taxCenterFeedback?.[region]?.[taxCenter]);
  const submittedFeedback = plansForTC.filter(p => p.taxCenterFeedback?.[region]?.[taxCenter]);

  const openFeedback = (plan) => {
    const regionalFeedback = plan.regionalFeedback[region];
    const tcAllocation = regionalFeedback.taxCenterAllocations[taxCenter];
    
    setFeedbackModal(plan);
    setFeedbackText('');
    setAdjustedAllocation(tcAllocation); // Default to what was allocated
  };

  const handleSubmit = () => {
    if (!feedbackText.trim()) {
      alert('Please provide feedback');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      actions.submitTaxCenterFeedback(
        feedbackModal.id,
        region,
        taxCenter,
        feedbackText,
        adjustedAllocation,
        user.id
      );
      setLoading(false);
      setFeedbackModal(null);
    }, 300);
  };

  const handleAllocationChange = (auditTypeId, value) => {
    setAdjustedAllocation(prev => ({
      ...prev,
      [auditTypeId]: Math.max(0, parseInt(value) || 0)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          label="Plans Assigned" 
          value={plansForTC.length} 
          icon={Building2} 
          color="blue"
          sub={taxCenter?.replace(/-/g, ' ').toUpperCase()}
        />
        <StatCard 
          label="Awaiting Your Feedback" 
          value={awaitingFeedback.length} 
          icon={Clock} 
          color="yellow"
          sub={awaitingFeedback.length > 0 ? 'Action required' : 'All done'}
        />
        <StatCard 
          label="Feedback Submitted" 
          value={submittedFeedback.length} 
          icon={CheckCircle} 
          color="green"
          sub="This cycle"
        />
      </div>

      {awaitingFeedback.length > 0 && (
        <Alert type="warning" title="Plans require your feedback">
          Review your allocated cases and provide feedback to your regional director.
        </Alert>
      )}

      {/* Plans awaiting feedback */}
      {awaitingFeedback.length > 0 && (
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Pending Feedback</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {awaitingFeedback.map(plan => {
              const tcAlloc = plan.regionalFeedback[region].taxCenterAllocations[taxCenter];
              const total = Object.values(tcAlloc).reduce((s, v) => s + v, 0);
              
              return (
                <div key={plan.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {total} cases allocated to your tax center
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="primary" 
                    icon={Send}
                    onClick={() => openFeedback(plan)}
                  >
                    Provide Feedback
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Submitted feedback */}
      {submittedFeedback.length > 0 && (
        <Card padding={false}>
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Feedback Submitted</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {submittedFeedback.map(plan => {
              const fb = plan.taxCenterFeedback[region][taxCenter];
              
              return (
                <div key={plan.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-semibold text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted {new Date(fb.submittedAt).toLocaleDateString()}
                    </p>
                    {fb.feedback && (
                      <p className="text-sm text-gray-600 mt-1 italic">"{fb.feedback}"</p>
                    )}
                  </div>
                  <Badge color="green" dot>Submitted</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {plansForTC.length === 0 && (
        <Card>
          <Alert type="info" title="No plans assigned yet">
            Plans will appear here once your regional director allocates cases to your tax center.
          </Alert>
        </Card>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <Modal
          open={!!feedbackModal}
          onClose={() => setFeedbackModal(null)}
          title="Provide Tax Center Feedback"
          size="xl"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setFeedbackModal(null)}>
                Cancel
              </Button>
              <Button 
                variant="success" 
                icon={Send} 
                loading={loading}
                onClick={handleSubmit}
              >
                Submit Feedback
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Alert type="info" title="Review and adjust your allocation">
              Review the cases allocated to your tax center. You can adjust the numbers if needed and provide feedback.
            </Alert>

            {/* Allocation Table */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Allocated Cases by Audit Type</p>
              <div className="space-y-3">
                {AUDIT_TYPES.map(auditType => (
                  <div key={auditType.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{auditType.name}</p>
                      <p className="text-xs text-gray-400">Adjust if capacity constraints exist</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={adjustedAllocation[auditType.id] || 0}
                      onChange={(e) => handleAllocationChange(auditType.id, e.target.value)}
                      className="w-24 text-center border border-gray-200 rounded-lg py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <Textarea
              label="Feedback / Comments *"
              placeholder="Describe capacity constraints, resource availability, or special considerations..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
            />

            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
              <strong>Note:</strong> Your adjusted numbers and feedback will be sent to your regional director for review.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
