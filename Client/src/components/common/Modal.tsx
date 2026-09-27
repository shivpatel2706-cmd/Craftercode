import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
  footer,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKey);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = {
    sm:  'max-w-sm',
    md:  'max-w-md',
    lg:  'max-w-lg',
    xl:  'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Centering wrapper */}
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        {/* Panel */}
        <div
          className={`
            relative w-full ${widths[maxWidth]}
            bg-white rounded-xl shadow-card-xl border border-neutral-150
            overflow-hidden animate-scale-in
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-4 sm:px-5 py-4 border-b border-neutral-100">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-neutral-900 leading-snug">{title}</h3>
              {subtitle && (
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-base"
              aria-label="Close modal"
            >
              <X className="w-4.5 h-4.5" strokeWidth={1.8} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-5 py-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex flex-wrap items-center justify-end gap-3 px-4 sm:px-5 py-4 border-t border-neutral-100 bg-neutral-50/60">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
