import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MessageSquare, QrCode, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import HandoverModal from '../components/HandoverModal';
import MessageModal from '../components/MessageModal';
import ReviewModal from '../components/ReviewModal';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [handoverTarget, setHandoverTarget] = useState(null);
  const [chatTarget, setChatTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError('');
      const [reqRes, itemsRes] = await Promise.all([
        axios.get('/requests/owner'),
        axios.get('/items/my'),
      ]);
      const reqList = reqRes.data || [];
      setRequests(reqList);
      setMyItems(itemsRes.data || []);

      const returnedReqs = reqList.filter((r) => r.status === 'returned');
      if (returnedReqs.length > 0 && user?._id) {
        const reviewChecks = await Promise.all(
          returnedReqs.map((r) =>
            axios.get(`/reviews/request/${r._id}`).catch(() => ({ data: [] }))
          )
        );
        const doneSet = new Set();
        returnedReqs.forEach((r, idx) => {
          const reviews = reviewChecks[idx]?.data || [];
          if (reviews.some((rev) => (rev.reviewer?._id || rev.reviewer) === user._id)) {
            doneSet.add(r._id);
          }
        });
        setReviewedIds(doneSet);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your listings and requests.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/requests/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(`/items/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete item');
      }
    }
  };

  if (loading) {
    return <div className="text-center text-[var(--text-muted)] py-12">Loading owner dashboard...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h2 className="m-0">My Listings & Requests</h2>
        <Link to="/create-listing" className="btn btn-primary">
          + New Listing
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <h3 className="mb-4">My Listings</h3>
      <div className="flex flex-col gap-4 mb-8">
        {myItems.length === 0 ? (
          <p className="text-muted">You haven&apos;t listed any items.</p>
        ) : (
          myItems.map((item) => (
            <div key={item._id} className="card glass-panel flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-[240px]">
                <h4 className="m-0 mb-1">
                  <Link to={`/item/${item._id}`} className="hover:underline">
                    {item.name}
                  </Link>
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`badge ${item.isAvailable ? 'badge-accepted' : 'badge-returned'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{item.pickupLocation}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/edit-listing/${item._id}`} className="btn btn-secondary py-1.5 px-3 text-sm">
                  Edit
                </Link>
                <button
                  onClick={() => deleteItem(item._id)}
                  className="btn btn-secondary py-1.5 px-3 text-sm text-[var(--danger)]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h3 className="mb-4">Incoming Borrow Requests</h3>
      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <p className="text-muted">No one has requested your items yet.</p>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="card glass-panel flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-[260px]">
                <h4 className="text-xl mb-1">
                  <Link to={`/item/${req.item?._id}`} className="hover:underline">
                    {req.item?.name}
                  </Link>
                </h4>
                <p className="m-0 text-[var(--text-muted)] text-sm">
                  Requested by <strong>{req.borrower?.name}</strong> ({req.borrower?.college})
                </p>
                <p className="m-0 text-[var(--text-muted)] text-sm">
                  {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ').toUpperCase()}</span>

                <button
                  onClick={() => setChatTarget(req)}
                  className="btn btn-secondary py-1.5 px-3 text-xs"
                  title="Chat with borrower"
                >
                  <MessageSquare size={14} /> Chat
                </button>

                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(req._id, 'accepted')}
                      className="btn py-1.5 px-3 text-xs bg-[var(--success)] text-white"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(req._id, 'rejected')}
                      className="btn py-1.5 px-3 text-xs bg-[var(--danger)] text-white"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <button
                    onClick={() => setHandoverTarget(req)}
                    className="btn btn-primary py-1.5 px-3 text-xs"
                  >
                    <QrCode size={14} /> Verify Handover (PIN / QR)
                  </button>
                )}

                {req.status === 'handed_over' && (
                  <button
                    onClick={() => updateStatus(req._id, 'returned')}
                    className="btn btn-secondary py-1.5 px-3 text-xs"
                  >
                    <CheckCircle2 size={14} /> Mark Returned
                  </button>
                )}

                {req.status === 'returned' && !reviewedIds.has(req._id) && (
                  <button
                    onClick={() => setReviewTarget(req)}
                    className="btn btn-primary py-1.5 px-3 text-xs"
                  >
                    <Star size={14} /> Leave Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {handoverTarget && (
        <HandoverModal
          request={handoverTarget}
          onSuccess={() => {
            setHandoverTarget(null);
            fetchData();
          }}
          onClose={() => setHandoverTarget(null)}
        />
      )}

      {chatTarget && (
        <MessageModal
          requestId={chatTarget._id}
          itemTitle={chatTarget.item?.name}
          otherPartyName={chatTarget.borrower?.name}
          onClose={() => setChatTarget(null)}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          requestId={reviewTarget._id}
          itemTitle={reviewTarget.item?.name}
          otherPartyName={reviewTarget.borrower?.name}
          onSuccess={() => {
            setReviewTarget(null);
            fetchData();
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
