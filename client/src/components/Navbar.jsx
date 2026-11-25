import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Package, ArrowLeftRight, Shield, Handshake } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
    isActive
      ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold'
      : 'text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-dark)]'
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav className="pointer-events-auto w-full max-w-5xl bg-[var(--bg-card)]/85 backdrop-blur-xl border border-[var(--border)] rounded-full px-4 sm:px-5 py-2.5 shadow-xl shadow-black/5 flex items-center justify-between transition-all gap-2">
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <ArrowLeftRight size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[var(--text-main)] hidden sm:block">
            Campus<span className="text-[var(--primary)]">Loop</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {user && (
            <div className="flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass} title="Resources">
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Resources</span>
              </NavLink>
              <NavLink to="/lent" className={navLinkClass} title="My Listings">
                <Package size={16} />
                <span className="hidden md:inline">Listings</span>
              </NavLink>
              <NavLink to="/borrowed" className={navLinkClass} title="Borrowed Items">
                <Handshake size={16} />
                <span className="hidden md:inline">Borrowed</span>
              </NavLink>
              {user.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition ${
                      isActive
                        ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 font-semibold'
                        : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    }`
                  }
                  title="Admin"
                >
                  <Shield size={16} />
                  <span className="hidden lg:inline">Admin</span>
                </NavLink>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            {user && <NotificationDropdown />}
            <ThemeToggle />

            <div className="h-6 w-px bg-[var(--border)] hidden sm:block"></div>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[var(--bg-dark)] border border-[var(--border)] rounded-full hover:border-[var(--primary)] transition"
                >
                  <UserIcon size={16} className="text-[var(--text-muted)]" />
                  <span className="hidden sm:inline max-w-[110px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition"
                  aria-label="Log out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-[var(--text-main)] hover:bg-[var(--bg-dark)] rounded-full transition hidden sm:block"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-full shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
