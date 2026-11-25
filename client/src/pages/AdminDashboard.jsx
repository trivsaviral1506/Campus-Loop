import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, Clock, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setError('');
        const [metricsRes, usersRes, itemsRes, loansRes] = await Promise.all([
          axios.get('/admin/metrics'),
          axios.get('/admin/users'),
          axios.get('/admin/items'),
          axios.get('/admin/loans'),
        ]);
        if (active) {
          setMetrics(metricsRes.data);
          setUsers(usersRes.data);
          setItems(itemsRes.data);
          setLoans(loansRes.data);
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Failed to load administrative data.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="text-center text-[var(--text-muted)] py-12">Loading admin dashboard...</div>;
  }

  const kpiCards = metrics
    ? [
        { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: 'text-indigo-500' },
        { label: 'Total Resources', value: `${metrics.availableItems} / ${metrics.totalItems} avail.`, icon: Package, color: 'text-blue-500' },
        { label: 'Pending Requests', value: metrics.pendingRequests, icon: Clock, color: 'text-amber-500' },
        { label: 'Active Loans', value: metrics.activeLoans, icon: Activity, color: 'text-purple-500' },
        { label: 'Completed Loans', value: metrics.completedLoans, icon: CheckCircle2, color: 'text-emerald-500' },
        { label: 'Overdue Loans', value: metrics.overdueLoans, icon: AlertTriangle, color: 'text-red-500' },
      ]
    : [];

  return (
    <div className="animate-fade-in">
      <h2 className="mb-6">Admin Dashboard</h2>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {kpiCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="card glass-panel p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>{kpi.label}</span>
                  <Icon size={16} className={kpi.color} />
                </div>
                <div className="text-xl font-extrabold text-[var(--text-main)]">{kpi.value}</div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 mb-6 pb-3 border-b border-[var(--border)] flex-wrap">
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('items')}
        >
          Resources ({items.length})
        </button>
        <button
          className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('loans')}
        >
          Loans ({loans.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="glass-panel p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">College</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[var(--border)]/40">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.college}</td>
                  <td className="p-3">
                    <span className={`badge ${u.role === 'admin' ? 'badge-handed_over' : 'badge-returned'}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="glass-panel p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-3">Item Name</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Category</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className="border-b border-[var(--border)]/40">
                  <td className="p-3">{i.name}</td>
                  <td className="p-3">{i.owner?.name}</td>
                  <td className="p-3 capitalize">{i.category}</td>
                  <td className="p-3">
                    <span className={`badge ${i.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>
                      {i.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="glass-panel p-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="p-3">Item</th>
                <th className="p-3">Borrower</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l._id} className="border-b border-[var(--border)]/40">
                  <td className="p-3">{l.item?.name}</td>
                  <td className="p-3">{l.borrower?.name}</td>
                  <td className="p-3">{l.owner?.name}</td>
                  <td className="p-3">
                    <span className={`badge badge-${l.status}`}>{l.status.replace('_', ' ').toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
