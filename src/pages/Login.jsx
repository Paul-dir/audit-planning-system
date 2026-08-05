import { useState } from 'react';
import { Eye, EyeOff, LogIn, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Planning Team',               email: 'planning.auditor1@mor.gov.et',  role: 'Audit Planning Team'   },
  { label: 'Audit Director',              email: 'tesfaye.bekele@mor.gov.et',     role: 'Audit Director'        },
  { label: 'Senior Management',           email: 'rahel.hailu@mor.gov.et',        role: 'Senior Management'     },
  { label: 'Regional Director (Addis)',   email: 'getnet.alemu@mor.gov.et',       role: 'Regional Director'     },
  { label: 'Regional Director (Oromia)',  email: 'gemechu.negash@mor.gov.et',     role: 'Regional Director'     },
  { label: 'Tax Center Manager (AA-TC1)', email: 'mekdes.solomon@mor.gov.et',     role: 'Tax Center Manager'    },
  { label: 'Tax Center Manager (AA-TC2)', email: 'dereje.worku@mor.gov.et',       role: 'Tax Center Manager'    },
  { label: 'Team Leader',                 email: 'henok.belay@mor.gov.et',        role: 'Team Leader'           },
  { label: 'Auditor',                     email: 'kidist.mehari@mor.gov.et',      role: 'Auditor'               },
];

const ROLE_COLORS = {
  'Audit Planning Team':  'bg-blue-50   border-blue-200   text-blue-700',
  'Audit Director':       'bg-purple-50 border-purple-200 text-purple-700',
  'Senior Management':    'bg-amber-50  border-amber-200  text-amber-700',
  'Regional Director':    'bg-green-50  border-green-200  text-green-700',
  'Tax Center Manager':   'bg-teal-50   border-teal-200   text-teal-700',
  'Team Leader':          'bg-indigo-50 border-indigo-200 text-indigo-700',
  'Auditor':              'bg-rose-50   border-rose-200   text-rose-700',
};

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showDemo, setShowDemo]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim())    { setError('Email is required');    return; }
    if (!password.trim()) { setError('Password is required'); return; }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('1234');
    setError('');
    setShowDemo(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl mb-4 overflow-hidden bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500">
            <img
              src="/mor-logo.jpeg"
              alt="MOR"
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Ministry of Revenues</h1>
          <p className="text-slate-400 text-sm">Audit Planning &amp; Management System</p>
        </div>

        {/* Login card */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your MOR credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@mor.gov.et"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 whitespace-pre-line">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600
                         hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold
                         rounded-lg transition-colors"
            >
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <LogIn size={16} />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <button
              onClick={() => setShowDemo(v => !v)}
              className="flex items-center justify-between w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="font-medium">Try a demo account</span>
              {showDemo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showDemo && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-3">
                  All demo accounts use password:{' '}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-700">1234</code>
                </p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {DEMO_ACCOUNTS.map(u => (
                    <button
                      key={u.email}
                      onClick={() => fillDemo(u.email)}
                      className="w-full text-left px-3 py-2 rounded-lg border border-transparent
                                 hover:bg-gray-50 hover:border-gray-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{u.label}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Protected by MOR Identity &amp; Access Management
        </p>
      </div>
    </div>
  );
}
