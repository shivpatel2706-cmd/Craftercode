import React from 'react';
import { Filter } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-xs font-semibold text-slate-500">{label}:</span>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
          <Filter className="w-3.5 h-3.5" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400 text-xs">
          ▼
        </div>
      </div>
    </div>
  );
};
