import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, Package, ArrowLeftRight, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-panel" style={{ margin: '16px 24px', padding: '16px 24px' }}>
      <div className="container flex justify-between items-center" style={{ padding: 0 }}>
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeftRight size={28} className="gradient-text" />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Campus<span className="gradient-text">Loop</span>
          </span>
        </Link>

        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 btn btn-secondary" style={{ padding: '8px 16px' }}>
                <LayoutDashboard size={18} /> Resources
              </Link>
              <Link to="/lent" className="flex items-center gap-2 btn btn-secondary" style={{ padding: '8px 16px' }}>
                <Package size={18} /> My Listings
              </Link>
              <Link to="/borrowed" className="flex items-center gap-2 btn btn-secondary" style={{ padding: '8px 16px' }}>
                <ArrowLeftRight size={18} /> Requested
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-2 btn btn-secondary" style={{ padding: '8px 16px', color: 'var(--primary)' }}>
                  <Shield size={18} /> Admin
                </Link>
              )}
              <div className="flex items-center gap-4 ml-4" style={{ borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                <Link to="/profile" className="flex items-center gap-2 hover:text-white transition">
                  <UserIcon size={18} /> {user.name}
                </Link>
                <button onClick={handleLogout} className="btn" style={{ color: 'var(--danger)', padding: '8px' }}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">Log In</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
