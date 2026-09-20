import { useAuth } from '../context/AuthContext';
import { User as UserIcon } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in flex justify-center">
      <div className="card glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="flex items-center gap-4 mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}>
            <UserIcon size={48} className="gradient-text" />
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{user.name}</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{user.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>College</span>
            <strong>{user.college || 'N/A'}</strong>
          </div>
          
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Department</span>
            <strong>{user.department || 'N/A'}</strong>
          </div>
          
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Year of Study</span>
            <strong>{user.year ? `${user.year} Year` : 'N/A'}</strong>
          </div>
          
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Role</span>
            <span className={`badge ${user.role === 'admin' ? 'badge-handed_over' : 'badge-returned'}`}>{user.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
