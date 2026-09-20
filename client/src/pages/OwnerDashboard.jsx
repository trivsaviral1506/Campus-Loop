import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [myItems, setMyItems] = useState([]);

  const fetchData = async () => {
    try {
      const [reqRes, itemsRes] = await Promise.all([
        axios.get('/requests/owner'),
        axios.get('/items') // Actually we need items owned by user, the backend gets all items. Wait, the backend /items route doesn't filter by owner by default. Let's just fetch all and filter client side for now.
      ]);
      setRequests(reqRes.data);
      
      // Filter my items from all items (quick hack, ideally backend should have /items/me)
      const token = localStorage.getItem('token');
      if (token) {
        const userRes = await axios.get('/auth/me');
        const userId = userRes.data._id;
        setMyItems(itemsRes.data.filter(item => item.owner._id === userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/items/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete item');
      }
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">My Dashboard</h2>
      
      <h3 className="mb-4">My Listings</h3>
      <div className="flex flex-col gap-4 mb-8">
        {myItems.length === 0 ? <p className="text-muted">You haven't listed any items.</p> : myItems.map(item => (
          <div key={item._id} className="card glass-panel flex justify-between items-center" style={{ gap: '16px' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h4 style={{ margin: 0 }}><Link to={`/item/${item._id}`} className="hover:underline">{item.name}</Link></h4>
              <span className={`badge ${item.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/edit-listing/${item._id}`} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Edit</Link>
              <button onClick={() => deleteItem(item._id)} className="btn btn-secondary" style={{ color: 'var(--danger)', padding: '6px 12px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-4">Borrow Requests</h3>
      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <p className="text-muted">No one has requested your items yet.</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className="card glass-panel flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  <Link to={`/item/${req.item?._id}`} className="hover:underline">{req.item?.name}</Link>
                </h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Requested by <strong>{req.borrower?.name}</strong> ({req.borrower?.college})
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ').toUpperCase()}</span>
                
                <div className="flex flex-col gap-2 align-end text-right">
                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(req._id, 'accepted')} className="btn" style={{ background: 'var(--success)', color: 'white', padding: '6px 12px' }}>Accept</button>
                      <button onClick={() => updateStatus(req._id, 'rejected')} className="btn" style={{ background: 'var(--danger)', color: 'white', padding: '6px 12px' }}>Reject</button>
                    </div>
                  )}
                  {req.status === 'accepted' && (
                    <>
                      <button onClick={() => updateStatus(req._id, 'handed_over')} className="btn btn-primary" style={{ padding: '6px 12px' }}>Scan QR / Mark Handed Over</button>
                    </>
                  )}
                  {req.status === 'handed_over' && (
                    <button onClick={() => updateStatus(req._id, 'returned')} className="btn btn-secondary" style={{ padding: '6px 12px' }}>Mark Returned</button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
