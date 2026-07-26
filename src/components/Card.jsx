import React from 'react';

/**
 * Dark-themed card for dashboard metrics and content panels.
 */
function Card({
  title,
  number,
  icon,
  children,
  className = '',
  variant = 'default',
  accent = null,
  header = null,
  body = null,
  footer = null,
}) {
  const accentColors = {
    primary: 'border-l-4 border-primary-500',
    success: 'border-l-4 border-emerald-500',
    warning: 'border-l-4 border-amber-500',
    danger: 'border-l-4 border-red-500',
    gold: 'border-l-4 border-amber-500',
  };

  const variantClasses = {
    default: 'hover:border-slate-700',
    elevated: 'shadow-md hover:shadow-lg',
    interactive: 'hover:border-slate-600 cursor-pointer',
  };

  const baseClasses = `
    rounded-xl border border-slate-800/80 bg-[#161f28]
    transition-all duration-200
    ${accent ? accentColors[accent] : ''}
    ${variantClasses[variant]}
    ${className}
  `;

  if (header || body || footer) {
    return (
      <div className={baseClasses}>
        {header && (
          <div className="border-b border-slate-800/80 px-6 py-4">{header}</div>
        )}
        {body && <div className="px-6 py-4">{body}</div>}
        {footer && (
          <div className="border-t border-slate-800/80 px-6 py-4">{footer}</div>
        )}
      </div>
    );
  }

  if (children) {
    return <div className={`${baseClasses} p-6`}>{children}</div>;
  }

  return (
    <div className={`${baseClasses} p-6`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {title}
          </h3>
          <div className="font-serif text-3xl font-bold text-slate-100">{number}</div>
        </div>
        {icon && (
          <div className="text-xl text-slate-600">
            <i className={icon} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;
