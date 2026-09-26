import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'neutral' | 'mint' | 'rose' | 'amber' | 'purple' | 'gold';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  blue:    'bg-blue-50   text-blue-700   border border-blue-100',
  neutral: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  mint:    'bg-mint-50   text-mint-700   border border-mint-100',
  rose:    'bg-rose-50   text-rose-600   border border-rose-100',
  amber:   'bg-amber-50  text-amber-700  border border-amber-100',
  purple:  'bg-purple-50 text-purple-700 border border-purple-100',
  gold:    'bg-amber-100 text-amber-800  border border-amber-200 font-bold',
};

const dotColors: Record<NonNullable<BadgeProps['variant']>, string> = {
  blue:    'bg-blue-400',
  neutral: 'bg-neutral-400',
  mint:    'bg-mint-500',
  rose:    'bg-rose-400',
  amber:   'bg-amber-400',
  purple:  'bg-purple-400',
  gold:    'bg-amber-500',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
