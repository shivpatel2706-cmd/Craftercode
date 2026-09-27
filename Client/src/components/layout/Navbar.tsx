import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  ShieldCheck,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types/user';
import { storage } from '../../services/storage';

export const Navbar: React.FC<{ onToggleSidebar?: () => void; showSidebarToggle?: boolean }> = ({
  onToggleSidebar,
  showSidebarToggle = false,
}) => {
  const { user, role, logout, switchRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = storage.getNotifications().slice(0, 4);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    switchRole(newRole);
    if (newRole === 'applicant') navigate('/applicant/dashboard');
    else if (newRole === 'officer') navigate('/officer/dashboard');
    else navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const publicLinks = [
    { to: '/',            label: 'Home' },
    { to: '/how-it-works',label: 'How It Works' },
    { to: '/verify',      label: 'Verify Certificate' },
    { to: '/contact',     label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-150 no-print">

      {/* ── Top compliance ribbon ── */}
      <div className="bg-neutral-900 text-neutral-400 text-[11px] px-4 sm:px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse-soft inline-block" />
          <span className="text-neutral-400">Legal Metrology Department · Statutory Verification Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-500">
          <span>OIML Compliant</span>
          <span className="text-neutral-700">·</span>
          <span>Legal Metrology Act 2009</span>
          <span className="text-neutral-700">·</span>
          <span className="text-amber-400 font-semibold">SIH Prototype</span>
        </div>
      </div>

      {/* ── Main nav bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4" style={{ height: '60px' }}>

          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {showSidebarToggle && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-base"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center transition-colors duration-200">
                <Scale className="w-4.5 h-4.5 text-neutral-950" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base text-neutral-900 tracking-tight leading-none">
                  METROVERIFY <span className="text-blue-500">360</span>
                </span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-wide mt-0.5 hidden sm:block">
                  Statutory Instrument Verification
                </span>
              </div>
            </Link>
          </div>

          {/* Center: public nav links (pill style) */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 bg-neutral-100 rounded-2xl px-1.5 py-1.5">
              {publicLinks.map(({ to, label }) => {
                const active = to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150
                      ${active
                        ? 'bg-white text-neutral-900 shadow-card'
                        : 'text-neutral-500 hover:text-neutral-800 hover:bg-white/60'
                      }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Role switcher — authenticated only */}
            {isAuthenticated && (
              <div className="hidden sm:flex items-center gap-1.5 bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-neutral-400 font-medium">Role:</span>
                <select
                  value={role || 'applicant'}
                  onChange={handleRoleChange}
                  className="bg-transparent font-semibold text-neutral-800 cursor-pointer focus:outline-none appearance-none pr-0.5"
                >
                  <option value="applicant">Applicant</option>
                  <option value="officer">Officer</option>
                  <option value="admin">Admin</option>
                </select>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </div>
            )}

            {/* Verify QR pill — always visible on desktop */}
            <Link
              to="/verify"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-mint-700 bg-mint-50 border border-mint-200 hover:bg-mint-100 px-3 py-1.5 rounded-xl transition-all duration-150"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
              Verify QR
            </Link>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 transition-base"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4.5 h-4.5" strokeWidth={1.8} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 surface-floating py-2 z-50 animate-slide-down">
                      <div className="px-4 py-2.5 border-b border-neutral-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="pill bg-blue-50 text-blue-600 border border-blue-100">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-neutral-50">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-xs text-neutral-400 text-center">No notifications</p>
                        ) : notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              storage.markNotificationRead(n.id);
                              setShowNotifications(false);
                              if (n.link) navigate(n.link);
                            }}
                            className={`px-4 py-3 text-xs cursor-pointer hover:bg-neutral-50 transition-base
                              ${!n.read ? 'bg-blue-50/40' : ''}`}
                          >
                            <p className="font-semibold text-neutral-900">{n.title}</p>
                            <p className="text-neutral-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Avatar + logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-neutral-150">
                  <img
                    src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user?.name || 'User'}
                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-neutral-100"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-neutral-900 leading-none truncate max-w-[110px]">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-neutral-400 capitalize mt-0.5">{user?.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-base ml-1"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center px-4 py-2 text-sm font-semibold text-white
                             bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700
                             rounded-xl shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all duration-200"
                >
                  Login
                </Link>
                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-xl text-neutral-500 hover:bg-neutral-100 transition-base"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile public menu ── */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-150 bg-white px-4 py-3 space-y-1 animate-slide-down">
          {publicLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 rounded-xl transition-base"
            >
              {label}
            </Link>
          ))}
          <div className="pt-1">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-2.5 text-sm font-semibold text-white
                         bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm"
            >
              Login Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
