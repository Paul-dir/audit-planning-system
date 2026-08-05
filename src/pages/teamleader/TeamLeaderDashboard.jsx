import { useState } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Eye, UserCheck, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Card, StatCard, Button, Modal, Select, Badge, Table, Empty, Alert, Input } from '../../components/ui/index.jsx';
import { AUDIT_TYPES, CASE_STATUS } from '../../data/constants.js';
import CaseDetailModal from '../shared/CaseDetailModal.jsx';

export default function TeamLeaderDashboard({ view }) {
  const { state, actions, selectors } = useApp();
  const { user } = useAuth();
  const [assignModal, setAssignModal] = useState(null);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [search, setSearch] = useState('');

  const myCases = selectors.getCasesForTeamLeader(user.id);
  const auditors = selectors.getUsersByTaxCenterAndRole(user.taxCenter, 'auditor');

  const pending = myCases.filter(c => c.status === 'ASSIGNED' && !c.assignedAuditor);
  const inProgress = myCases.filter(c => c.status === 'IN_PROGRESS');
  const completed = myCases.filter(c => c.status === 'COMPLETED');

  const filtered = myCases.filter(c =>
    !search || c.taxpayerName.toLowerCase().includes(search.toLowerCase()) || c.tin.includes(search)
  );

  const handleAssign = () => {
    if (!assignModal || !selectedAuditor) return;
    actions.assignCaseToAuditor(assignModal.id, selectedAuditor);
    setAssignModal(null);
    setSelectedAuditor('');
  };

  const riskColor = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue' };

  const cols = [
    { key: 'tin', label: 'TIN', render: v => <span className="font-mono text-xs">{v}</span> },
    { key: 'taxpayerName', label: 'Taxpayer', render: (v, row) => (
      <div><p className="text-sm font-medium text-gray-800">{v}</p><p className="text-xs text-gray-400">{row.sector}</p></div>
    )},
    { key: 'auditType', label: 'Audit Type', render: v => {
      const at = AUDIT_TYPES.find(a => a.id === v);
      return <Badge color={at?.color || 'gray'}>{at?.shortName || v}</Badge>;
    }},
    { key: 'riskLevel', label: 'Risk', render: v => <Badge color={riskColor[v] || 'gray'} dot>{v}</Badge> },
    { key: 'status', label: 'Status', render: v => {
      const s = CASE_STATUS[v];
      return s ? <Badge color={s.color} dot>{s.label}</Badge> : <Badge>{v}</Badge>;
    }},
    { key: 'assignedAuditor', label: 'Auditor', render: (v, row) => {
      if (!v) return <span className="text-xs text-gray-400 italic">Unassigned</span>;
      const auditor = state.users.find(u => u.id === v);
      return <span className="text-xs text-gray-700">{auditor?.name || v}</span>;
    }},
    { key: '_act', label: '', render: (_, row) => (
      <div className="flex gap-1 justify-end" onClick={e => e.stopPropagation()}>
        <Button size="xs" variant="ghost" icon={Eye} onClick={() => setSelectedCase(row)}>View</Button>
        {(row.status === 'ASSIGNED' && !row.assignedAuditor) && auditors.length > 0 && (
          <Button size="xs" variant="primary" icon={UserCheck} onClick={() => { setAssignModal(row); setSelectedAuditor(''); }}>
            Assign Auditor
          </Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Cases" value={myCases.length} icon={Users} color="blue" />
        <StatCard label="Need Auditor" value={pending.length} icon={Clock} color="yellow" sub="Awaiting assignment" />
        <StatCard label="In Progress" value={inProgress.length} icon={AlertCircle} color="purple" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle} color="green" />
      </div>

      {pending.length > 0 && (
        <Alert type="warning" title={`${pending.length} case${pending.length > 1 ? 's' : ''} need auditor assignment`}>
          Assign these cases to auditors in your team to begin the audit process.
        </Alert>
      )}

      {myCases.length === 0 && (
        <Alert type="info" title="No cases assigned yet">
          Cases will appear here once the Tax Center Manager assigns them to you.
        </Alert>
      )}

      {auditors.length === 0 && myCases.length > 0 && (
        <Alert type="warning" title="No auditors found in your tax center">
          Contact your system administrator to register auditors.
        </Alert>
      )}

      <Card padding={false}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Case Assignments</h3>
            <p className="text-xs text-gray-500 mt-0.5">Manage and assign audit cases to your team members</p>
          </div>
          <div className="w-64">
            <Input icon={Search} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="p-4">
          {filtered.length === 0
            ? <Empty icon={Users} title="No cases" description={myCases.length === 0 ? "Cases assigned to you will appear here." : "No results for your search."} />
            : <Table columns={cols} rows={filtered} onRowClick={row => setSelectedCase(row)} />
          }
        </div>
      </Card>

      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Case to Auditor" size="sm"
        footer={<>
          <Button variant="secondary" onClick={() => setAssignModal(null)}>Cancel</Button>
          <Button variant="primary" icon={UserCheck} onClick={handleAssign} disabled={!selectedAuditor}>Assign</Button>
        </>}
      >
        {assignModal && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm">
              <p className="font-medium text-gray-800">{assignModal.taxpayerName}</p>
              <p className="text-gray-500 text-xs mt-0.5">{assignModal.tin} · {AUDIT_TYPES.find(a => a.id === assignModal.auditType)?.name}</p>
            </div>
            <Select
              label="Select Auditor"
              value={selectedAuditor}
              onChange={e => setSelectedAuditor(e.target.value)}
              placeholder="Choose auditor..."
              options={auditors.map(a => ({ value: a.id, label: a.name }))}
            />
          </div>
        )}
      </Modal>

      {selectedCase && (
        <CaseDetailModal
          caseData={state.cases.find(c => c.id === selectedCase.id) || selectedCase}
          onClose={() => setSelectedCase(null)}
          users={state.users}
        />
      )}
    </div>
  );
}
