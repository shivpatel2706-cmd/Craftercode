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
    'inline-flex items-center justify-center font-semibold rounded-lg ' +
    'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs min-h-8 px-3 py-1.5 gap-1.5',
    md: 'text-sm min-h-10 px-4 py-2 gap-2',
    lg: 'text-sm min-h-11 px-5 py-2.5 gap-2.5',
  };

  const variants = {
    primary:
      'bg-neutral-800 hover:bg-neutral-700 text-neutral-950 focus-visible:ring-blue-400',
    mint:
      'bg-mint-500 hover:bg-mint-400 text-neutral-950 focus-visible:ring-mint-400',
    secondary:
      'bg-neutral-150 hover:bg-neutral-200 text-neutral-800 focus-visible:ring-neutral-400',
    outline:
      'border border-neutral-200 bg-transparent hover:bg-neutral-100 hover:border-neutral-300 ' +
      'text-neutral-800 focus-visible:ring-blue-400',
    danger:
      'bg-rose-500 hover:bg-rose-400 text-neutral-950 focus-visible:ring-rose-400',
    success:
      'bg-mint-500 hover:bg-mint-400 text-neutral-950 focus-visible:ring-mint-400',
    ghost:
      'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800 focus-visible:ring-neutral-300',
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
