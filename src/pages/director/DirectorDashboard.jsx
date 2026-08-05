import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Send, Eye, FileText, Clock, CheckSquare, Map, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, StatCard, Button, Modal, Textarea, Alert, Table, Empty, Tabs, Badge } from '../../components/ui/index.jsx';
import PlanStatusBadge from '../shared/PlanStatusBadge.jsx';
import PlanDetailModal from '../planning/PlanDetailModal.jsx';
import { DistributionTable } from '../shared/DistributionTable.jsx';

export default function DirectorDashboard({ view }) {
  const { state, actions, selectors } = useApp();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [reviewPlan, setReviewPlan] = useState(null);
  const [tab, setTab] = useState('pending');
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState(null); // 'approve' | 'revise'
  const [loading, setLoading] = useState(false);

  const stats = selectors.getPlanStats();
  const pending = state.plans.filter(p => p.status === 'SUBMITTED_TO_DIRECTOR');
  const approved = state.plans.filter(p => ['DIRECTOR_APPROVED','AWAITING_REGIONAL_FEEDBACK','FEEDBACK_COLLECTED','SUBMITTED_TO_SENIOR_MGMT','SENIOR_MGMT_APPROVED','FINALIZED'].includes(p.status));
  const readyToSend = state.plans.filter(p => p.status === 'DIRECTOR_APPROVED');

  const doAction = () => {
    if (!reviewPlan || !actionType) return;
    setLoading(true);
    setTimeout(() => {
      if (actionType === 'approve') actions.approvePlan(reviewPlan.id, user.id, comment);
      else actions.requestRevision(reviewPlan.id, user.id, comment);
      setLoading(false);
      setReviewPlan(null);
      setComment('');
      setActionType(null);
    }, 300);
  };

  const handleSendToRegions = (plan) => {
    actions.sendToRegions(plan.id, user.id);
  };

  const planCols = (showActions = true) => [
    { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-gray-400">{v}</span> },
    { key: 'name', label: 'Plan', render: (v, row) => (
      <div><p className="font-medium text-sm text-gray-900">{v}</p><p className="text-xs text-gray-400">FY {row.year}</p></div>
    )},
    { key: 'totalCases', label: 'Cases', render: v => <span className="font-semibold tabular-nums">{v?.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: v => <PlanStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: v => <span className="text-xs text-gray-400">{new Date(v).toLocaleDateString()}</span> },
    ...(showActions ? [{
      key: '_act', label: '', render: (_, row) => (
        <div className="flex gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
          <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelectedPlan(row)}>View</Button>
          {row.status === 'SUBMITTED_TO_DIRECTOR' && (
            <>
              <Button size="xs" variant="success" icon={CheckCircle} onClick={() => { setReviewPlan(row); setActionType('approve'); }}>Approve</Button>
              <Button size="xs" variant="warning" icon={RotateCcw} onClick={() => { setReviewPlan(row); setActionType('revise'); }}>Revise</Button>
            </>
          )}
          {row.status === 'DIRECTOR_APPROVED' && (
            <Button size="xs" variant="primary" icon={Send} onClick={() => handleSendToRegions(row)}>Send to Regions</Button>
          )}
        </div>
      )
    }] : []),
  ];

  const tabs = [
    { id: 'pending', label: 'Pending Review', count: pending.length },
    { id: 'approved', label: 'Approved Plans', count: approved.length },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Review" value={stats.pendingDirector} icon={Clock} color="yellow" sub="Awaiting your decision" />
        <StatCard label="Ready to Deploy" value={readyToSend.length} icon={Send} color="blue" sub="Approved, not yet sent" />
        <StatCard label="In Progress" value={stats.active} icon={Map} color="purple" sub="Sent to regions" />
        <StatCard label="Finalized" value={stats.finalized} icon={CheckSquare} color="green" sub="Deployed plans" />
      </div>

      {pending.length > 0 && (
        <Alert type="info" title={`${pending.length} plan${pending.length > 1 ? 's' : ''} awaiting your review`}>
          Review and approve or request revisions on the submitted audit plans.
        </Alert>
      )}

      {readyToSend.length > 0 && (
        <Alert type="success" title={`${readyToSend.length} approved plan${readyToSend.length > 1 ? 's' : ''} ready to send to regions`}>
          Click "Send to Regions" to begin the regional feedback collection process.
        </Alert>
      )}

      <Card padding={false}>
        <div className="px-6 pt-4 pb-0">
          <Tabs tabs={tabs} active={tab} onChange={setTab} />
        </div>
        <div className="p-4">
          {tab === 'pending' && (
            pending.length === 0
              ? <Empty icon={CheckCircle} title="No pending plans" description="All submitted plans have been reviewed." />
              : <Table columns={planCols(true)} rows={pending} onRowClick={row => setSelectedPlan(row)} />
          )}
          {tab === 'approved' && (
            approved.length === 0
              ? <Empty icon={FileText} title="No approved plans yet" />
              : <Table columns={planCols(true)} rows={approved} onRowClick={row => setSelectedPlan(row)} />
          )}
        </div>
      </Card>

      {/* Review action modal */}
      <Modal
        open={!!reviewPlan && !!actionType}
        onClose={() => { setReviewPlan(null); setActionType(null); setComment(''); }}
        title={actionType === 'approve' ? `Approve Plan — ${reviewPlan?.name}` : `Request Revision — ${reviewPlan?.name}`}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => { setReviewPlan(null); setActionType(null); setComment(''); }}>Cancel</Button>
          <Button
            variant={actionType === 'approve' ? 'success' : 'warning'}
            icon={actionType === 'approve' ? CheckCircle : RotateCcw}
            loading={loading}
            onClick={doAction}
          >
            {actionType === 'approve' ? 'Approve Plan' : 'Request Revision'}
          </Button>
        </>}
      >
        {reviewPlan && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Distribution Summary</p>
              <DistributionTable distribution={reviewPlan.distribution} />
            </div>
            <Textarea
              label={actionType === 'approve' ? 'Approval Note (optional)' : 'Revision Instructions *'}
              placeholder={actionType === 'approve' ? 'Add any notes for the planning team...' : 'Explain what needs to be changed...'}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {selectedPlan && <PlanDetailModal plan={selectors.getPlanById(selectedPlan.id)} onClose={() => setSelectedPlan(null)} />}
    </div>
  );
}
