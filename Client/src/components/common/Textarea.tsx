import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-neutral-600 uppercase tracking-wider mb-1.5"
          >
            {label}
            {props.required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={`
            block w-full rounded-xl border text-sm
            transition-all duration-150 resize-y
            focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-0 focus:border-blue-400
            placeholder:text-neutral-400
            px-3.5 py-2.5
            ${error
              ? 'border-rose-300 bg-rose-50/50 text-neutral-900 focus:ring-rose-200 focus:border-rose-400'
              : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
            }
            ${className}
          `}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
