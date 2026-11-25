import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [reviewData, setReviewData] = useState({ reviews: [], totalReviews: 0, averageRating: null });
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/reviews/user/${user._id}`);
        if (active) setReviewData(res.data);
      } catch (err) {
        console.error('Failed to load profile reviews:', err);
      } finally {
        if (active) setLoadingReviews(false);
      }
    };
    fetchReviews();
    return () => { active = false; };
  }, [user?._id]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in flex flex-col items-center gap-6">
      <div className="card glass-panel w-full max-w-[600px]">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-[var(--bg-dark)] border border-[var(--border)] rounded-full">
              <UserIcon size={40} className="text-[var(--primary)]" />
            </div>
            <div>
              <h2 className="m-0">{user.name}</h2>
              <p className="text-[var(--text-muted)] m-0 text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
            <Star size={16} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-sm">
              {reviewData.averageRating !== null ? `${reviewData.averageRating} / 5` : 'No ratings yet'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">({reviewData.totalReviews})</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]">
            <span className="block text-xs text-[var(--text-muted)] mb-1">College</span>
            <strong>{user.college || 'N/A'}</strong>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]">
            <span className="block text-xs text-[var(--text-muted)] mb-1">Department</span>
            <strong>{user.department || 'N/A'}</strong>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]">
            <span className="block text-xs text-[var(--text-muted)] mb-1">Year of Study</span>
            <strong>{user.year ? `${user.year} Year` : 'N/A'}</strong>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]">
            <span className="block text-xs text-[var(--text-muted)] mb-1">Role</span>
            <span className={`badge ${user.role === 'admin' ? 'badge-handed_over' : 'badge-returned'}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="card glass-panel w-full max-w-[600px]">
        <h3 className="mb-4">Peer Reviews & Feedback</h3>
        {loadingReviews ? (
          <p className="text-sm text-[var(--text-muted)]">Loading reviews...</p>
        ) : reviewData.reviews.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] m-0">
            You haven&apos;t received any peer reviews yet. Complete an exchange to build your campus reputation!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviewData.reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-xl bg-[var(--bg-dark)] border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-sm font-bold">
                    {rev.reviewer?.name || 'Peer'}{' '}
                    <span className="text-xs font-normal text-[var(--text-muted)]">
                      on {rev.item?.name || 'Resource'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star size={14} className="fill-amber-500" /> {rev.rating}/5
                  </div>
                </div>
                {rev.comment && <p className="text-sm text-[var(--text-muted)] m-0">{rev.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
