import { LayoutDashboard, ClipboardList, CheckSquare, Map, Building2, Users, Search, Star, LogOut, ChevronRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = {
  planning_team: [
    { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
    { id: 'plans',     label: 'Audit Plans', icon: ClipboardList  },
  ],
  audit_director: [
    { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
    { id: 'review',    label: 'Plan Review',       icon: CheckSquare     },
    { id: 'deploy',    label: 'Deploy to Regions', icon: Map             },
  ],
  regional_director: [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'plans',     label: 'Regional Plans',icon: ClipboardList  },
    { id: 'feedback',  label: 'Submit Feedback',icon: Map            },
  ],
  tax_center_manager: [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'cases',     label: 'Case Management',icon: Building2     },
  ],
  team_leader: [
    { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'cases',     label: 'Assigned Cases',icon: Users           },
  ],
  auditor: [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'cases',     label: 'My Cases',     icon: Search          },
  ],
  senior_management: [
    { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
    { id: 'approval',  label: 'Plan Approval',icon: Star            },
  ],
};

const ROLE_LABELS = {
  planning_team:    'Audit Planning Team',
  audit_director:   'Audit Director',
  regional_director:'Regional Director',
  tax_center_manager:'Tax Center Manager',
  team_leader:      'Team Leader',
  auditor:          'Auditor',
  senior_management:'Senior Management',
};

export default function Sidebar({ activeView, onNavigate }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const items = NAV[user.role] || [];

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">MOR</p>
            <p className="text-slate-400 text-[10px] leading-tight">Audit Planning System</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-slate-700/60">
        <div className="bg-slate-800 rounded-lg px-3 py-2.5">
          <p className="text-white text-sm font-medium truncate">{user.name}</p>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{ROLE_LABELS[user.role]}</p>
          {user.region && <p className="text-blue-400 text-xs mt-0.5 truncate capitalize">{user.region.replace('_', ' ')}</p>}
          {user.taxCenter && <p className="text-slate-500 text-xs mt-0.5 truncate">{user.taxCenter}</p>}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
        <ul className="space-y-0.5">
          {items.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon size={16} />
                    {item.label}
                  </span>
                  {active && <ChevronRight size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
