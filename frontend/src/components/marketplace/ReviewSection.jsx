import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Star, MessageSquare, CheckCircle, User } from 'lucide-react';
import client from '../../api/client';
import useAuthStore from '../../store/authStore';
import Button from '../shared/Button';
import Alert from '../shared/Alert';

export default function ReviewSection({ listingId }) {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadReviews = useCallback(async () => {
    try {
      const res = await client.get(`/api/listings/${listingId}/reviews/`);
      setReviews(res.data || []);
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await client.post(`/api/listings/${listingId}/reviews/`, {
        rating,
        comment: comment.trim(),
      });
      setSuccess('Thank you! Your verified review has been published.');
      setComment('');
      loadReviews();
    } catch (err) {
      setError(err.response?.data?.rating || err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-[#FAF8F3] rounded-lg border border-[#E4DDCF] p-6 sm:p-7 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4DDCF]">
        <div>
          <h2 className="font-serif text-lg font-bold text-zinc-950 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-zinc-700" />
            Verified Campus Reviews &amp; Testimonials
          </h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Feedback from authenticated university students</p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-2.5 bg-white px-3 py-1.5 rounded border border-[#E4DDCF] shadow-xs">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= Math.round(Number(avgRating))
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-zinc-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-zinc-900">{avgRating}</span>
            <span className="text-[11px] font-mono text-zinc-500">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="my-5 p-4 bg-white rounded border border-[#E4DDCF]">
          <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-700 mb-2">Record a Review</h3>
          {error && <div className="mb-3"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
          {success && <div className="mb-3"><Alert type="success" message={success} dismissible onClose={() => setSuccess('')} /></div>}

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-zinc-600 font-mono">Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition text-zinc-300 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-mono font-bold text-zinc-800 ml-1">{rating} / 5</span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience with this item..."
            rows={3}
            maxLength={1000}
            className="w-full text-xs p-3 border border-[#E4DDCF] rounded focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 bg-[#FAF8F3] text-zinc-900 placeholder:text-zinc-400 font-sans"
          />

          <div className="mt-3 flex justify-end">
            <Button type="submit" size="sm" loading={submitting}>
              Publish Review
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-xs font-mono text-zinc-400 py-4 text-center">Consulting review register...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-7 bg-white rounded border border-dashed border-[#E4DDCF]">
            <Star className="h-5 w-5 text-zinc-300 mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-zinc-800 font-serif">No reviews recorded yet</p>
            <p className="text-[11px] text-zinc-500 font-sans mt-0.5">Be the first verified student to record feedback for this item.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-3.5 rounded border border-[#E4DDCF] bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded bg-zinc-900 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                    {rev.user_name ? rev.user_name[0].toUpperCase() : <User className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">{rev.user_name || rev.user_email || 'Verified Student'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-emerald-700" /> Verified Campus Buyer
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {rev.comment && <p className="text-xs text-zinc-700 leading-relaxed pl-8 font-sans">{rev.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

ReviewSection.propTypes = {
  listingId: PropTypes.string.isRequired,
};
