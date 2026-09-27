import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerBorder?: boolean;
  /** Elevation level — controls shadow depth */
  elevation?: 'base' | 'raised' | 'floating';
  /** Accent colour strip on left edge */
  accent?: 'blue' | 'mint' | 'amber' | 'rose' | 'purple' | 'none';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  headerBorder = true,
  elevation = 'base',
  accent = 'none',
  noPadding = false,
}) => {
  const shadows = {
    base:     'shadow-card',
    raised:   'shadow-card',
    floating: 'shadow-card-md',
  };

  const accents = {
    none:   '',
    blue:   'border-l-[3px] border-l-blue-400',
    mint:   'border-l-[3px] border-l-mint-400',
    amber:  'border-l-[3px] border-l-amber-400',
    rose:   'border-l-[3px] border-l-rose-400',
    purple: 'border-l-[3px] border-l-purple-400',
  };

  return (
    <div
      className={`
        bg-neutral-100 rounded-xl border border-neutral-150 overflow-hidden
        ${shadows[elevation]}
        ${accents[accent]}
        ${className}
      `}
    >
      {(title || action) && (
        <div
          className={`
            px-4 sm:px-5 py-4 flex items-start justify-between gap-4
            ${headerBorder ? 'border-b border-neutral-100' : ''}
          `}
        >
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-base font-semibold text-neutral-900 tracking-tight leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-4 sm:p-5'}>{children}</div>
    </div>
  );
};
