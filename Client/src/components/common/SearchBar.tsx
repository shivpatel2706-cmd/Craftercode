import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by ID, name, or serial number…',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        className="absolute left-3.5 w-4 h-4 text-neutral-400 pointer-events-none flex-shrink-0"
        strokeWidth={1.8}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full pl-10 pr-9 py-2.5 text-sm
          bg-white border border-neutral-200 rounded-xl
          text-neutral-900 placeholder:text-neutral-400
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-0 focus:border-blue-400
          hover:border-neutral-300
          shadow-card
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-base"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      )}
    </div>
  );
};
