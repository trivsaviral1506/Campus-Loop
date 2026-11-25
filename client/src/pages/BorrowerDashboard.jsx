import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { MessageSquare, Star, XCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MessageModal from '../components/MessageModal';
import ReviewModal from '../components/ReviewModal';

const BorrowerDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [chatTarget, setChatTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError('');
      const res = await axios.get('/requests/borrower');
      const reqList = res.data || [];
      setRequests(reqList);

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
      setError(err.response?.data?.message || 'Failed to load your borrowing requests.');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending borrow request?')) return;
    try {
      await axios.delete(`/requests/${id}`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to cancel request.');
    }
  };

  if (loading) {
    return <div className="text-center text-[var(--text-muted)] py-12">Loading borrowing requests...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="mb-8">My Borrowing Requests</h2>

      {error && (
        <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {requests.length === 0 ? (
          <p className="text-muted">You haven&apos;t requested any items yet.</p>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="card glass-panel flex justify-between items-center flex-wrap gap-4">
              <div className="flex-1 min-w-[260px]">
                <h3 className="text-xl mb-1">
                  <Link to={`/item/${req.item?._id}`} className="hover:underline">
                    {req.item?.name}
                  </Link>
                </h3>
                <p className="m-0 text-[var(--text-muted)] text-sm">
                  Owned by <strong>{req.owner?.name}</strong> • Pickup: <strong>{req.item?.pickupLocation}</strong>
                </p>
                <p className="m-0 text-[var(--text-muted)] text-sm">
                  {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge badge-${req.status}`}>{req.status.replace('_', ' ').toUpperCase()}</span>

                    <button
                      onClick={() => setChatTarget(req)}
                      className="btn btn-secondary py-1.5 px-3 text-xs"
                    >
                      <MessageSquare size={14} /> Chat
                    </button>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(req._id)}
                        className="btn btn-secondary py-1.5 px-3 text-xs text-[var(--danger)]"
                      >
                        <XCircle size={14} /> Cancel
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

                  {req.status === 'accepted' && (
                    <div className="mt-2 p-3 rounded-xl bg-white text-slate-900 border border-slate-200 flex items-center gap-4 shadow-sm">
                      <QRCodeSVG value={req.handoverToken || `Handover Req: ${req._id}`} size={78} />
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          <KeyRound size={12} /> Handover PIN
                        </div>
                        <div className="font-mono text-2xl font-extrabold tracking-widest text-slate-900">
                          {req.handoverPin || '------'}
                        </div>
                        <p className="text-[11px] text-slate-600 m-0 max-w-[180px] leading-snug">
                          Share this QR code or 6-digit PIN with the owner only at physical handover.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {chatTarget && (
        <MessageModal
          requestId={chatTarget._id}
          itemTitle={chatTarget.item?.name}
          otherPartyName={chatTarget.owner?.name}
          onClose={() => setChatTarget(null)}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          requestId={reviewTarget._id}
          itemTitle={reviewTarget.item?.name}
          otherPartyName={reviewTarget.owner?.name}
          onSuccess={() => {
            setReviewTarget(null);
            fetchRequests();
          }}
          onClose={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

export default BorrowerDashboard;
