import { useState } from 'react';
import { Shield, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SEED_USERS } from '../data/seed.js';
import { storage, STORE_KEYS } from '../services/storage.js';

const ROLE_GROUPS = [
  { label: 'National Level', roles: ['planning_team', 'audit_director', 'senior_management'] },
  { label: 'Regional Level', roles: ['regional_director'] },
  { label: 'Tax Center Level', roles: ['tax_center_manager', 'team_leader', 'auditor'] },
];

const ROLE_LABELS = {
  planning_team: 'Audit Planning Team',
  audit_director: 'Audit Director',
  senior_management: 'Senior Management',
  regional_director: 'Regional Director',
  tax_center_manager: 'Tax Center Manager',
  team_leader: 'Team Leader',
  auditor: 'Auditor',
};

const ROLE_COLORS = {
  planning_team: 'bg-blue-50 border-blue-200 text-blue-700',
  audit_director: 'bg-purple-50 border-purple-200 text-purple-700',
  senior_management: 'bg-amber-50 border-amber-200 text-amber-700',
  regional_director: 'bg-green-50 border-green-200 text-green-700',
  tax_center_manager: 'bg-teal-50 border-teal-200 text-teal-700',
  team_leader: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  auditor: 'bg-rose-50 border-rose-200 text-rose-700',
};

export default function Login() {
  const { login } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);

  const users = storage.get(STORE_KEYS.USERS, SEED_USERS);
  const groupedUsers = ROLE_GROUPS.map(g => ({
    ...g,
    users: users.filter(u => g.roles.includes(u.role)),
  }));

  const handleLogin = () => {
    if (!selectedUser) { setError('Please select a user account'); return; }
    const ok = login(selectedUser.id);
    if (!ok) setError('Login failed');
  };

  const handleReset = () => {
    storage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}} />

      <div className="relative w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-500/40 mb-4">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Ministry of Revenues</h1>
          <p className="text-slate-400 text-sm">Audit Planning & Management System</p>
        </div>

        {/* Login card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Select Your Account</h2>
            <p className="text-sm text-gray-500 mt-0.5">Choose your role to continue to the dashboard</p>
          </div>

          <div className="p-6 space-y-5 max-h-[480px] overflow-y-auto">
            {groupedUsers.map(group => (
              <div key={group.label}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{group.label}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.users.map(user => {
                    const colorClass = ROLE_COLORS[user.role] || 'bg-gray-50 border-gray-200 text-gray-700';
                    const isSelected = selectedUser?.id === user.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => { setSelectedUser(user); setError(''); }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-bold flex-shrink-0 ${colorClass}`}>
                          {user.name.split(' ').map(n => n[0]).slice(0,2).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{ROLE_LABELS[user.role]}</p>
                          {user.region && <p className="text-xs text-blue-500 truncate capitalize">{user.region.replace(/_/g,' ')}</p>}
                        </div>
                        {isSelected && <ChevronRight size={14} className="text-blue-500 flex-shrink-0 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-4">
            <button
              onClick={() => setShowReset(!showReset)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showReset ? '↑ Hide' : 'Reset Data'}
            </button>
            {showReset && (
              <button
                onClick={handleReset}
                className="text-xs text-red-500 hover:text-red-700 underline transition-colors"
              >
                Reset all data (restore defaults)
              </button>
            )}
            <div className="flex items-center gap-3">
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                onClick={handleLogin}
                disabled={!selectedUser}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
              >
                Sign In
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Ministry of Revenues — Audit Planning System v2.0
        </p>
      </div>
    </div>
  );
}
