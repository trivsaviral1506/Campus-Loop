import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await axios.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItem();
  }, [id]);

  const handleRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/requests', {
        itemId: item._id,
        startDate,
        endDate
      });
      alert('Request sent successfully!');
      navigate('/borrowed');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
    }
  };

  if (!item) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in flex gap-4" style={{ flexWrap: 'wrap' }}>
      <div className="card glass-panel" style={{ flex: '1 1 60%' }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', height: '300px', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>No Image</span>
          )}
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.name}</h1>
        <div className="flex gap-4 mb-4">
          <span className={`badge ${item.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <span className="badge badge-handed_over">{item.category}</span>
        </div>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.125rem' }}>{item.description}</p>
        
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', flex: 1, borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Condition</span>
            <strong style={{ textTransform: 'capitalize' }}>{item.condition}</strong>
          </div>
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', flex: 1, borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deposit</span>
            <strong>₹{item.deposit}</strong>
          </div>
          <div className="card" style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', flex: 1, borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Pickup Location</span>
            <strong>{item.pickupLocation}</strong>
          </div>
        </div>
      </div>

      {item.owner?._id !== user?._id && (
        <div className="card glass-panel" style={{ flex: '1 1 30%', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px' }}>Request to Borrow</h3>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            <p style={{ margin: 0 }}><strong>Owner:</strong> {item.owner?.name}</p>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.owner?.department}, {item.owner?.college}</p>
          </div>

          <form onSubmit={handleRequest} className="flex flex-col">
            <label className="text-muted">Start Date</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} />
            
            <label className="text-muted">End Date</label>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} />
            
            <button 
              type="submit" 
              className="btn btn-primary mt-8" 
              disabled={!item.isAvailable}
              style={{ opacity: item.isAvailable ? 1 : 0.5 }}
            >
              {item.isAvailable ? 'Send Request' : 'Currently Unavailable'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;
