import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  label?: string;
  className?: string;
  /** Show as full-page overlay */
  fullPage?: boolean;
}

const sizeMap = {
  sm: { ring: 'w-5 h-5 border-2',  text: 'text-xs' },
  md: { ring: 'w-8 h-8 border-2',  text: 'text-sm' },
  lg: { ring: 'w-12 h-12 border-[3px]', text: 'text-sm' },
  xl: { ring: 'w-16 h-16 border-[3px]', text: 'text-base' },
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label = 'Loading…',
  className = '',
  fullPage = false,
}) => {
  const { ring, text } = sizeMap[size];

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {/* Two-ring spinner — outer track + inner fill */}
      <div className="relative flex items-center justify-center">
        {/* Track */}
        <div className={`${ring} rounded-full border-neutral-150`} />
        {/* Spin arc */}
        <div className={`absolute ${ring} rounded-full border-blue-400 border-t-transparent animate-spin`} />
      </div>

      {label && (
        <p className={`${text} font-medium text-neutral-500`}>{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  );
};
