import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`
              block w-full rounded-xl border text-sm
              transition-all duration-150 appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-0 focus:border-blue-400
              pl-3.5 pr-10 py-2.5 bg-white
              ${error
                ? 'border-rose-300 bg-rose-50/50 text-neutral-900 focus:ring-rose-200 focus:border-rose-400'
                : 'border-neutral-200 text-neutral-900 hover:border-neutral-300'
              }
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom chevron */}
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
            <ChevronDown className="w-4 h-4" strokeWidth={1.8} />
          </div>
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
