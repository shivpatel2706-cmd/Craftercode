import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Scale,
  PlusCircle,
  FileText,
  Clock,
  Award,
  BellRing,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ClipboardList,
  Users,
  Settings,
  History,
  LogOut,
  X,
  Compass,
  ChevronRight,
} from 'lucide-react';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLinks = () => {
    switch (role) {
      case 'applicant':
        return [
          { to: '/applicant/dashboard',          label: 'Dashboard',          icon: LayoutDashboard },
          { to: '/applicant/instruments',         label: 'My Instruments',     icon: Scale },
          { to: '/applicant/register-instrument', label: 'Register Instrument',icon: PlusCircle },
          { to: '/applicant/applications',        label: 'Applications',       icon: FileText },
          { to: '/applicant/tracking',            label: 'Track Application',  icon: Compass },
          { to: '/applicant/certificates',        label: 'Certificates',       icon: Award },
          { to: '/verify',                        label: 'Verify Certificate', icon: ShieldCheck },
          { to: '/applicant/renewal-alerts',      label: 'Renewal Alerts',     icon: BellRing, badge: 'Due' },
          { to: '/applicant/profile',             label: 'Profile',            icon: UserCheck },
        ];

      case 'officer':
        return [
          { to: '/officer/dashboard',             label: 'Dashboard',             icon: LayoutDashboard },
          { to: '/officer/assigned-inspections',  label: 'Assigned Inspections',  icon: ClipboardList, badge: '2' },
          { to: '/officer/field-inspection',      label: 'Field Inspection',      icon: CheckCircle2 },
          { to: '/officer/calendar',              label: 'Inspection Calendar',   icon: Calendar },
          { to: '/officer/pending-verification',  label: 'Pending Verification',  icon: Clock },
          { to: '/officer/completed-inspections', label: 'Completed Inspections', icon: FileText },
          { to: '/officer/certificates',          label: 'Issued Certificates',   icon: Award },
          { to: '/verify',                        label: 'Verify Certificate',    icon: ShieldCheck },
          { to: '/officer/profile',               label: 'Officer Profile',       icon: UserCheck },
        ];

      case 'admin':
        return [
          { to: '/admin/dashboard',    label: 'Dashboard',           icon: LayoutDashboard },
          { to: '/admin/approvals',    label: 'Digital Approval',    icon: CheckCircle2, badge: 'Pending' },
          { to: '/admin/applications', label: 'Applications',        icon: FileText },
          { to: '/admin/officers',     label: 'Manage Officers',     icon: UserCheck },
          { to: '/admin/instruments',  label: 'Instruments',         icon: Scale },
          { to: '/admin/certificates', label: 'Certificates',        icon: Award },
          { to: '/admin/users',        label: 'Manage Users',        icon: Users },
          { to: '/admin/audit-logs',   label: 'Audit Logs',          icon: History },
          { to: '/admin/profile',      label: 'Admin Profile',       icon: Settings },
        ];

      default:
        return [];
    }
  };

  const links = getRoleLinks();

  const roleLabel =
    role === 'applicant' ? 'Applicant Portal' :
    role === 'officer'   ? 'Inspector Suite'  :
                           'Admin Control';

  const rolePillColor =
    role === 'applicant' ? 'bg-blue-50 text-blue-600 border-blue-100' :
    role === 'officer'   ? 'bg-mint-50 text-mint-700 border-mint-100' :
                           'bg-purple-50 text-purple-600 border-purple-100';

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/30 backdrop-blur-sm lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64
          bg-white border-r border-neutral-150
          flex flex-col
          transition-transform duration-300 ease-smooth
          lg:translate-x-0 lg:static lg:z-auto
          no-print
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-neutral-150 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
              <Scale className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-neutral-900 tracking-tight leading-none">
                METROVERIFY
                <span className="text-blue-500 ml-1">360</span>
              </span>
              <span className={`mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border self-start ${rolePillColor}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-base"
            aria-label="Close sidebar"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ── User Card ── */}
        <div className="px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-neutral-50 border border-neutral-150">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover flex-shrink-0 ring-2 ring-white shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-900 truncate leading-tight">{user?.name}</p>
              <p className="text-[11px] text-neutral-500 capitalize truncate mt-0.5">
                {user?.designation || user?.role}
              </p>
              {user?.badgeNumber && (
                <p className="text-[10px] font-mono text-neutral-400 mt-0.5">{user.badgeNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-blue-500' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                        <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                      </span>
                      <span className="truncate text-[13px]">{link.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {link.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                          ${isActive
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-amber-100 text-amber-700'
                          }`}>
                          {link.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Footer / Logout ── */}
        <div className="px-3 py-4 border-t border-neutral-150 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                       text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
