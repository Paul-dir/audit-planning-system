import { Modal, Badge } from '../../components/ui/index.jsx';
import { AUDIT_TYPES, CASE_STATUS, RISK_LEVELS } from '../../data/constants.js';

const riskColor = { CRITICAL: 'red', HIGH: 'orange', MEDIUM: 'yellow', LOW: 'blue' };

export default function CaseDetailModal({ caseData, onClose, users = [] }) {
  if (!caseData) return null;
  const at = AUDIT_TYPES.find(a => a.id === caseData.auditType);
  const cs = CASE_STATUS[caseData.status];
  const tl = users.find(u => u.id === caseData.assignedTeamLeader);
  const aud = users.find(u => u.id === caseData.assignedAuditor);

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  );

  return (
    <Modal open={!!caseData} onClose={onClose} title="Case Details" size="md">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-gray-900 text-lg">{caseData.taxpayerName}</p>
            <p className="text-sm font-mono text-gray-400 mt-0.5">{caseData.tin}</p>
          </div>
          <div className="flex gap-2">
            {cs && <Badge color={cs.color} dot>{cs.label}</Badge>}
            <Badge color={riskColor[caseData.riskLevel] || 'gray'} dot>{caseData.riskLevel}</Badge>
          </div>
        </div>

        {/* Details grid */}
        <div className="bg-gray-50 rounded-xl p-4">
          <Row label="Case ID" value={caseData.id} />
          <Row label="Plan ID" value={caseData.planId} />
          <Row label="Audit Type" value={at?.name} />
          <Row label="Sector" value={caseData.sector} />
          <Row label="Risk Score" value={`${caseData.riskScore} / 100`} />
          <Row label="Region" value={caseData.region?.replace(/_/g, ' ')} />
          <Row label="Tax Center" value={caseData.taxCenter?.replace(/-/g, ' ')} />
        </div>

        {/* Assignment */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Assignment</p>
          <Row label="Team Leader" value={tl?.name} />
          <Row label="Auditor" value={aud?.name} />
          <Row label="Assigned At" value={caseData.assignedAt ? new Date(caseData.assignedAt).toLocaleString() : null} />
          <Row label="Start Date" value={caseData.startDate ? new Date(caseData.startDate).toLocaleDateString() : null} />
          <Row label="Completed" value={caseData.completedDate ? new Date(caseData.completedDate).toLocaleDateString() : null} />
        </div>

        {/* Notes */}
        {caseData.notes && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{caseData.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
