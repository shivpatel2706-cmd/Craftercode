import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { TrackingStep } from '../../types/application';

export interface StepperProps {
  steps: TrackingStep[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  orientation = 'vertical',
  className = '',
}) => {

  /* ── Horizontal variant ── */
  if (orientation === 'horizontal') {
    return (
      <div className={`w-full py-4 ${className}`}>
        <div className="flex items-start">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'Completed';
            const isCurrent   = step.status === 'Current';
            const isLast      = idx === steps.length - 1;

            return (
              <React.Fragment key={step.stepNumber}>
                {/* Step node */}
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      relative z-10 w-9 h-9 rounded-xl flex items-center justify-center
                      text-xs font-bold transition-all duration-200
                      ${isCompleted
                        ? 'bg-mint-500 text-white shadow-md shadow-mint-100'
                        : isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-100 shadow-md shadow-blue-100'
                        : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
                      }
                    `}
                  >
                    {isCompleted
                      ? <Check className="w-4 h-4" strokeWidth={2.5} />
                      : step.stepNumber
                    }
                  </div>

                  {/* Label */}
                  <div className="text-center mt-2 px-1 max-w-[80px]">
                    <p className={`text-[11px] font-semibold leading-tight line-clamp-2
                      ${isCurrent   ? 'text-blue-600'
                      : isCompleted ? 'text-neutral-800'
                      :               'text-neutral-400'}`}
                    >
                      {step.title}
                    </p>
                    {step.date && (
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {step.date.split(' ')[0]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className={`flex-1 h-0.5 mt-4 transition-colors duration-300
                    ${isCompleted ? 'bg-mint-400' : 'bg-neutral-200'}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Vertical variant (detailed tracking) ── */
  return (
    <div className={`relative pl-2 sm:pl-4 ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'Completed';
        const isCurrent   = step.status === 'Current';
        const isLast      = idx === steps.length - 1;

        return (
          <div key={step.stepNumber} className="relative flex items-start pb-8 last:pb-2">

            {/* Connector */}
            {!isLast && (
              <div className={`absolute left-4 top-9 -bottom-2 w-0.5 transition-colors duration-300
                ${isCompleted ? 'bg-mint-300' : 'bg-neutral-200'}`}
              />
            )}

            {/* Circle badge */}
            <div className={`
              relative z-10 flex h-8 w-8 items-center justify-center rounded-xl
              text-xs font-bold flex-shrink-0 transition-all duration-200
              ${isCompleted
                ? 'bg-mint-500 text-white shadow-md shadow-mint-100'
                : isCurrent
                ? 'bg-blue-500 text-white ring-4 ring-blue-100 shadow-md shadow-blue-100'
                : 'bg-white text-neutral-400 border border-neutral-200'
              }
            `}>
              {isCompleted
                ? <Check className="w-4 h-4" strokeWidth={2.5} />
                : isCurrent
                ? <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                : <Circle className="w-2.5 h-2.5 fill-current text-neutral-300" />
              }
            </div>

            {/* Content */}
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-semibold text-neutral-400">
                    {String(step.stepNumber).padStart(2, '0')}
                  </span>
                  <h4 className={`text-sm font-bold
                    ${isCurrent   ? 'text-blue-700'
                    : isCompleted ? 'text-neutral-900'
                    :               'text-neutral-400'}`}
                  >
                    {step.title}
                  </h4>
                  <span className={`
                    text-[10px] uppercase font-semibold tracking-wider
                    px-2 py-0.5 rounded-full
                    ${isCompleted
                      ? 'bg-mint-50  text-mint-700  border border-mint-100'
                      : isCurrent
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }
                  `}>
                    {step.status}
                  </span>
                </div>

                {step.date && (
                  <span className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-150 px-2 py-0.5 rounded-lg font-medium flex-shrink-0">
                    {step.date}
                  </span>
                )}
              </div>

              <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed max-w-2xl">
                {step.description}
              </p>

              {(step.actor || step.note) && (
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  {step.actor && (
                    <span className="text-xs text-neutral-500">
                      Action by:{' '}
                      <strong className="font-semibold text-neutral-700">{step.actor}</strong>
                    </span>
                  )}
                  {step.note && (
                    <span className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg font-medium">
                      {step.note}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
