import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const BorrowerDashboard = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/requests/borrower');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">My Borrowing Requests</h2>
      
      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <p className="text-muted">You haven't requested any items yet.</p>
        ) : (
          requests.map(req => (
            <div key={req._id} className="card glass-panel flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>
                  <Link to={`/item/${req.item?._id}`} className="hover:underline">{req.item?.name}</Link>
                </h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Owned by <strong>{req.owner?.name}</strong>
                </p>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ').toUpperCase()}</span>
                  {req.status === 'accepted' && (
                    <div style={{ background: 'white', padding: '8px', borderRadius: '8px', marginTop: '8px' }}>
                      <QRCodeSVG value={`Handover Req: ${req._id}`} size={80} />
                      <p style={{ color: 'black', fontSize: '0.75rem', textAlign: 'center', margin: '4px 0 0 0' }}>Show to Owner</p>
                    </div>
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

export default BorrowerDashboard;
