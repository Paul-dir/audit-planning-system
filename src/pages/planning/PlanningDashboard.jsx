import { useState } from 'react';
import { Plus, ClipboardList, Clock, CheckCircle, FileText, ArrowRight, Eye, Send, Edit, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, CardHeader, StatCard, Button, Badge, Table, Empty, Modal, Alert } from '../../components/ui/index.jsx';
import PlanStatusBadge from '../shared/PlanStatusBadge.jsx';
import CreatePlanModal from './CreatePlanModal.jsx';
import PlanDetailModal from './PlanDetailModal.jsx';

export default function PlanningDashboard({ view }) {
  const { state, actions, selectors } = useApp();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(null);

  const stats = selectors.getPlanStats();
  const plans = state.plans;

  const handleSubmit = (plan) => {
    actions.submitToDirector(plan.id, user.id);
    setConfirmSubmit(null);
  };

  const columns = [
    { key: 'id', label: 'Plan ID', render: (v) => <span className="font-mono text-xs text-gray-500">{v}</span> },
    { key: 'name', label: 'Plan Name', render: (v, row) => (
      <div>
        <p className="font-medium text-gray-900 text-sm">{v}</p>
        <p className="text-xs text-gray-400">FY {row.year}</p>
      </div>
    )},
    { key: 'totalCases', label: 'Cases', render: (v) => <span className="font-semibold text-gray-700 tabular-nums">{v?.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: (v) => <PlanStatusBadge status={v} /> },
    { key: 'createdAt', label: 'Created', render: (v) => <span className="text-xs text-gray-500">{new Date(v).toLocaleDateString()}</span> },
    { key: '_actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
        <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelectedPlan(row)}>View</Button>
        {(row.status === 'DRAFT' || row.status === 'REVISION_REQUESTED') && (
          <Button size="xs" variant="primary" icon={Send} onClick={() => setConfirmSubmit(row)}>Submit</Button>
        )}
        {row.status === 'FEEDBACK_COLLECTED' && (
          <Button size="xs" variant="success" icon={ArrowRight} onClick={() => actions.submitToSeniorMgmt(row.id, user.id)}>
            → Senior Mgmt
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Plans" value={stats.total} icon={ClipboardList} color="blue" />
        <StatCard label="Draft" value={stats.draft} icon={Edit} color="gray" />
        <StatCard label="Pending Approval" value={stats.pendingDirector + stats.pendingSenior} icon={Clock} color="yellow" />
        <StatCard label="Finalized" value={stats.finalized} icon={CheckCircle} color="green" />
      </div>

      {/* Revision alerts */}
      {plans.filter(p => p.status === 'REVISION_REQUESTED').map(p => (
        <Alert key={p.id} type="warning" title={`Revision Requested — ${p.name}`}>
          <span className="text-xs">{p.directorComment || p.revisions?.[p.revisions.length-1]?.comment || 'Please revise and resubmit.'}</span>
        </Alert>
      ))}

      {/* Feedback ready alerts */}
      {plans.filter(p => p.status === 'FEEDBACK_COLLECTED').map(p => (
        <Alert key={p.id} type="success" title={`All Regional Feedback Received — ${p.name}`}>
          <span className="text-xs">All regions have submitted their feedback and tax center allocations. You can now submit this plan for Senior Management approval.</span>
        </Alert>
      ))}

      {/* Plans Table */}
      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Audit Plans</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage and track all national audit plans</p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreate(true)}>Create Plan</Button>
        </div>
        {plans.length === 0
          ? <div className="py-8"><Empty icon={FileText} title="No plans yet" description="Create your first audit plan to get started" action={<Button icon={Plus} onClick={() => setShowCreate(true)}>Create Plan</Button>} /></div>
          : <Table columns={columns} rows={plans} onRowClick={(row) => setSelectedPlan(row)} />
        }
      </Card>

      {/* Modals */}
      <CreatePlanModal open={showCreate} onClose={() => setShowCreate(false)} />
      {selectedPlan && (
        <PlanDetailModal plan={selectors.getPlanById(selectedPlan.id)} onClose={() => setSelectedPlan(null)} />
      )}

      {/* Submit confirmation */}
      <Modal open={!!confirmSubmit} onClose={() => setConfirmSubmit(null)} title="Submit Plan for Director Approval" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setConfirmSubmit(null)}>Cancel</Button>
          <Button variant="primary" icon={Send} onClick={() => handleSubmit(confirmSubmit)}>Submit</Button>
        </>}>
        <p className="text-sm text-gray-600">Submit <strong>{confirmSubmit?.name}</strong> for Audit Director review? You will not be able to edit it while under review.</p>
      </Modal>
    </div>
  );
}
