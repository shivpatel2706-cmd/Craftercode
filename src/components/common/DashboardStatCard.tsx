import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color?: 'blue' | 'mint' | 'amber' | 'rose' | 'purple' | 'neutral';
  description?: string;
  onClick?: () => void;
}

const colorTokens: Record<
  NonNullable<DashboardStatCardProps['color']>,
  { icon: string; bg: string; ring: string; glow: string }
> = {
  blue:    { icon: 'text-blue-600',   bg: 'bg-blue-50',   ring: 'ring-blue-100',   glow: 'hover:shadow-blue-100/60' },
  mint:    { icon: 'text-mint-600',   bg: 'bg-mint-50',   ring: 'ring-mint-100',   glow: 'hover:shadow-mint-100/60' },
  amber:   { icon: 'text-amber-600',  bg: 'bg-amber-50',  ring: 'ring-amber-100',  glow: 'hover:shadow-amber-100/60' },
  rose:    { icon: 'text-rose-500',   bg: 'bg-rose-50',   ring: 'ring-rose-100',   glow: 'hover:shadow-rose-100/60' },
  purple:  { icon: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-100', glow: 'hover:shadow-purple-100/60' },
  neutral: { icon: 'text-neutral-600',bg: 'bg-neutral-100',ring: 'ring-neutral-200',glow: 'hover:shadow-neutral-100/60' },
};

const changeStyles = {
  increase: { text: 'text-mint-600',   bg: 'bg-mint-50',  Icon: ArrowUpRight },
  decrease: { text: 'text-rose-500',   bg: 'bg-rose-50',  Icon: ArrowDownRight },
  neutral:  { text: 'text-neutral-500',bg: 'bg-neutral-100', Icon: Minus },
};

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'neutral',
  color = 'blue',
  description,
  onClick,
}) => {
  const c = colorTokens[color];
  const ch = changeStyles[changeType];
  const ChIcon = ch.Icon;

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-2xl border border-neutral-150 p-5
        shadow-card transition-all duration-200
        hover:shadow-card-md hover:-translate-y-0.5
        ${c.glow}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* Top row: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider leading-snug">
          {title}
        </p>
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${c.bg} ring-1 ${c.ring}
          transition-transform duration-200 group-hover:scale-105
        `}>
          <span className={c.icon}>{icon}</span>
        </div>
      </div>

      {/* Value + change row */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight leading-none">
          {value}
        </span>

        {change && (
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${ch.text} ${ch.bg}`}>
            <ChIcon className="w-3 h-3" strokeWidth={2.5} />
            {change}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed">{description}</p>
      )}

      {/* Subtle clickable indicator */}
      {onClick && (
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300" />
        </div>
      )}
    </div>
  );
};
