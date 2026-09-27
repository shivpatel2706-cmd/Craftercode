import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav
      className="flex items-center gap-1 text-xs text-neutral-500 mb-5 flex-wrap"
      aria-label="Breadcrumb"
    >
      {/* Home */}
      <Link
        to="/"
        className="flex items-center gap-1 text-neutral-400 hover:text-blue-500 transition-base"
      >
        <Home className="w-3.5 h-3.5" strokeWidth={1.8} />
        <span>Home</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight
              className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0"
              strokeWidth={1.8}
            />
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="hover:text-blue-500 transition-base"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-semibold text-neutral-800' : 'text-neutral-500'}
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
