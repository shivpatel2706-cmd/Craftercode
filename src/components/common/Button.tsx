import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl ' +
    'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-sm px-5 py-3 gap-2.5',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 ' +
      'text-white shadow-md shadow-blue-100 hover:shadow-blue-200 focus-visible:ring-blue-400',
    mint:
      'bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 ' +
      'text-white shadow-md shadow-mint-100 hover:shadow-mint-200 focus-visible:ring-mint-400',
    secondary:
      'bg-neutral-900 hover:bg-neutral-800 text-white shadow-sm focus-visible:ring-neutral-600',
    outline:
      'border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 ' +
      'text-neutral-700 shadow-card focus-visible:ring-blue-400',
    danger:
      'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-100 ' +
      'hover:shadow-rose-200 focus-visible:ring-rose-400',
    success:
      'bg-mint-500 hover:bg-mint-600 text-white shadow-md shadow-mint-100 focus-visible:ring-mint-400',
    ghost:
      'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-300',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
      ) : (
        icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};
