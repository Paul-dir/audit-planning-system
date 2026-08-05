import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Modal, Input, Textarea, Button, Alert } from '../../components/ui/index.jsx';
import { EditableDistributionTable } from '../shared/DistributionTable.jsx';
import { REGIONS, AUDIT_TYPES } from '../../data/constants.js';

const emptyDistribution = () => {
  const dist = {};
  REGIONS.forEach(r => { dist[r.id] = {}; AUDIT_TYPES.forEach(a => { dist[r.id][a.id] = 0; }); });
  return dist;
};

export default function CreatePlanModal({ open, onClose }) {
  const { actions } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), description: '' });
  const [distribution, setDistribution] = useState(emptyDistribution);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: info, 2: distribution
  const [loading, setLoading] = useState(false);

  const totalCases = Object.values(distribution).reduce(
    (sum, regionDist) => sum + Object.values(regionDist).reduce((s, v) => s + v, 0), 0
  );

  const handleCreate = () => {
    if (!form.name.trim()) { setError('Plan name is required'); return; }
    if (totalCases === 0) { setError('Please distribute at least some cases across regions'); return; }
    setLoading(true);
    setTimeout(() => {
      actions.createPlan({ ...form, year: parseInt(form.year), distribution, totalCases, createdBy: user.id });
      setLoading(false);
      onClose();
      setForm({ name: '', year: new Date().getFullYear(), description: '' });
      setDistribution(emptyDistribution());
      setStep(1);
    }, 300);
  };

  const handleClose = () => {
    onClose();
    setStep(1);
    setError('');
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 1 ? 'Create Audit Plan — Basic Info' : 'Create Audit Plan — Case Distribution'}
      size="xl"
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
            <Button onClick={() => { if (!form.name.trim()) { setError('Plan name is required'); return; } setError(''); setStep(2); }}>
              Next: Distribution →
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button variant="primary" loading={loading} onClick={handleCreate}>Create Plan</Button>
          </>
        )
      }
    >
      {step === 1 && (
        <div className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <Input
            label="Plan Name *"
            placeholder="e.g. FY 2025 National Audit Plan — Q1"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Fiscal Year"
            type="number"
            value={form.year}
            onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="Describe the plan objectives, focus sectors, and risk criteria..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {error && <Alert type="error">{error}</Alert>}
          <Alert type="info" title="Distribute cases by Region × Audit Type">
            Enter how many cases should be allocated to each region for each audit type. The total will be your plan's case target.
          </Alert>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Case Distribution Table</p>
            <div className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              Total: {totalCases.toLocaleString()} cases
            </div>
          </div>
          <EditableDistributionTable distribution={distribution} onChange={setDistribution} />
        </div>
      )}
    </Modal>
  );
}
