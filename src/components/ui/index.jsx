// ============================================================
// UI COMPONENT LIBRARY
// ============================================================
import { forwardRef } from 'react';
import { Loader2, CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

// ──── BUTTON ────────────────────────────────────────────────
const BTN_BASE = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
const BTN_SIZES = {
  xs: 'px-2.5 py-1.5 text-xs',
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};
const BTN_VARIANTS = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300 shadow-sm',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  success:   'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
  warning:   'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-sm',
  ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
  link:      'text-blue-600 hover:underline focus:ring-blue-300 p-0',
};
export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, children, className = '', ...props }) {
  return (
    <button className={`${BTN_BASE} ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}

// ──── BADGE ─────────────────────────────────────────────────
const BADGE_COLORS = {
  gray:   'bg-gray-100 text-gray-700 border border-gray-200',
  blue:   'bg-blue-50 text-blue-700 border border-blue-200',
  green:  'bg-green-50 text-green-700 border border-green-200',
  red:    'bg-red-50 text-red-700 border border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  orange: 'bg-orange-50 text-orange-700 border border-orange-200',
  purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  teal:   'bg-teal-50 text-teal-700 border border-teal-200',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};
export function Badge({ color = 'gray', dot, children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_COLORS[color] || BADGE_COLORS.gray} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// ──── CARD ──────────────────────────────────────────────────
export function Card({ children, className = '', padding = true, shadow = true }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${shadow ? 'shadow-sm' : ''} ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
export function CardHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-blue-50 rounded-lg"><Icon size={18} className="text-blue-600" /></div>}
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ──── STAT CARD ──────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'blue', trend, sub }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700'  },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', val: 'text-yellow-700'},
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700'   },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', val: 'text-purple-700'},
    teal:   { bg: 'bg-teal-50',   icon: 'text-teal-600',   val: 'text-teal-700'  },
    gray:   { bg: 'bg-gray-50',   icon: 'text-gray-600',   val: 'text-gray-700'  },
  };
  const c = colors[color] || colors.blue;
  return (
    <Card className="flex items-center gap-4">
      <div className={`flex-shrink-0 p-3 rounded-xl ${c.bg}`}>
        {Icon && <Icon size={22} className={c.icon} />}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.val}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

// ──── MODAL ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

// ──── INPUT ─────────────────────────────────────────────────
export const Input = forwardRef(({ label, error, helper, icon: Icon, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon size={14} className="text-gray-400" /></div>}
      <input
        ref={ref}
        className={`block w-full rounded-lg border ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'} ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent bg-white ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-600">{error}</p>}
    {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
));

// ──── TEXTAREA ───────────────────────────────────────────────
export const Textarea = forwardRef(({ label, error, helper, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      ref={ref}
      rows={4}
      className={`block w-full rounded-lg border ${error ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent resize-none ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
    {helper && !error && <p className="text-xs text-gray-500">{helper}</p>}
  </div>
));

// ──── SELECT ─────────────────────────────────────────────────
export const Select = forwardRef(({ label, error, options = [], placeholder, className = '', ...props }, ref) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <select
      ref={ref}
      className={`block w-full rounded-lg border ${error ? 'border-red-300' : 'border-gray-300'} px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));

// ──── ALERT ─────────────────────────────────────────────────
const ALERT_STYLES = {
  info:    { bg: 'bg-blue-50 border-blue-200',   icon: <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />,    text: 'text-blue-800'  },
  success: { bg: 'bg-green-50 border-green-200',  icon: <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />, text: 'text-green-800' },
  warning: { bg: 'bg-amber-50 border-amber-200',  icon: <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />, text: 'text-amber-800' },
  error:   { bg: 'bg-red-50 border-red-200',      icon: <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />,    text: 'text-red-800'   },
};
export function Alert({ type = 'info', title, children }) {
  const s = ALERT_STYLES[type];
  return (
    <div className={`flex gap-3 p-3 rounded-lg border ${s.bg}`}>
      {s.icon}
      <div>
        {title && <p className={`text-sm font-medium ${s.text}`}>{title}</p>}
        {children && <p className={`text-sm ${s.text} ${title ? 'mt-0.5 opacity-90' : ''}`}>{children}</p>}
      </div>
    </div>
  );
}

// ──── PROGRESS BAR ───────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = 'blue', label, showPct }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = { blue: 'bg-blue-500', green: 'bg-green-500', yellow: 'bg-yellow-500', red: 'bg-red-500', purple: 'bg-purple-500' };
  return (
    <div>
      {(label || showPct) && (
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{label}</span>
          {showPct && <span>{pct}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${colors[color] || colors.blue}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ──── EMPTY STATE ────────────────────────────────────────────
export function Empty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="p-4 bg-gray-100 rounded-full mb-4"><Icon size={28} className="text-gray-400" /></div>}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ──── TABLE ─────────────────────────────────────────────────
export function Table({ columns, rows, onRowClick, emptyText = 'No data' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-gray-400">{emptyText}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}>
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 text-gray-700 ${col.className || ''}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ──── TABS ───────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-gray-200 gap-1">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px ${
            active === tab.id
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}>
          {tab.icon && <tab.icon size={13} className="inline mr-1.5 -mt-0.5" />}
          {tab.label}
          {tab.count != null && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${active === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ──── SECTION HEADER ─────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ──── SPINNER ────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <Loader2 size={size} className="animate-spin text-blue-500" />;
}

// ──── CONFIRM MODAL ──────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </>}>
      <p className="text-sm text-gray-600">{message}</p>
    </Modal>
  );
}
