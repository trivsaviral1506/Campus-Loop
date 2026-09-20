import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, itemsRes, loansRes] = await Promise.all([
          axios.get('/admin/users'),
          axios.get('/admin/items'),
          axios.get('/admin/loans')
        ]);
        setUsers(usersRes.data);
        setItems(itemsRes.data);
        setLoans(loansRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">Admin Dashboard</h2>
      
      <div className="flex gap-4 mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('users')}>Users ({users.length})</button>
        <button className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('items')}>Resources ({items.length})</button>
        <button className={`btn ${activeTab === 'loans' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('loans')}>Active Loans ({loans.length})</button>
      </div>

      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th>Email</th>
                <th>College</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.college}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-handed_over' : 'badge-returned'}`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Item Name</th>
                <th>Owner</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(i => (
                <tr key={i._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{i.name}</td>
                  <td>{i.owner?.name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{i.category}</td>
                  <td><span className={`badge ${i.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>{i.isAvailable ? 'Available' : 'Unavailable'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px' }}>Item</th>
                <th>Borrower</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(l => (
                <tr key={l._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px' }}>{l.item?.name}</td>
                  <td>{l.borrower?.name}</td>
                  <td>{l.owner?.name}</td>
                  <td><span className={`badge badge-${l.status}`}>{l.status.replace('_', ' ').toUpperCase()}</span></td>
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
