import React, { useState } from 'react';
import axios from 'axios';
import { X, Star, AlertCircle } from 'lucide-react';

export default function ReviewModal({ requestId, itemTitle, otherPartyName, onSuccess, onClose }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/reviews', {
        requestId,
        rating,
        comment: comment.trim()
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card glass-panel w-full max-w-md p-6 relative shadow-2xl animate-fade-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)] transition"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-1">Leave a Review</h3>
          <p className="text-xs text-[var(--text-muted)] m-0">
            How was your exchange of <strong>{itemTitle || 'this item'}</strong> with <strong>{otherPartyName}</strong>?
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          {/* Star selector */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <div className="w-full mb-4">
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
              Feedback Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Prompt handover, item in pristine condition, great peer!"
              className="w-full text-sm p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 rounded-xl font-bold text-sm"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

