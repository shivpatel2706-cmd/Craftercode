import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, iconPosition = 'left', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`
              block w-full rounded-xl border text-sm
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-0 focus:border-blue-400
              placeholder:text-neutral-400
              ${icon && iconPosition === 'left'  ? 'pl-10'  : 'pl-3.5'}
              ${icon && iconPosition === 'right' ? 'pr-10'  : 'pr-3.5'}
              py-2.5
              ${error
                ? 'border-rose-300 bg-rose-50/50 text-neutral-900 focus:ring-rose-200 focus:border-rose-400'
                : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
              }
              ${className}
            `}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
