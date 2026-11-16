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
    <div className="bg-paper-50 rounded-xl border border-paper-200 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-200">
        <div>
          <h2 className="text-lg font-bold text-ink-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-forest-700" />
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">Verified feedback from campus members</p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-3 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200/80">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-4 w-4 ${
                    s <= Math.round(Number(avgRating))
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-paper-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-amber-900">{avgRating}</span>
            <span className="text-xs text-amber-700">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="my-6 p-4 bg-white rounded-lg border border-paper-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-700 mb-2">Write a Review</h3>
          {error && <div className="mb-3"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
          {success && <div className="mb-3"><Alert type="success" message={success} dismissible onClose={() => setSuccess('')} /></div>}

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-ink-600 font-medium">Your Rating:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition text-ink-400 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`h-5 w-5 ${
                      star <= rating ? 'text-amber-500 fill-amber-500' : 'text-paper-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-ink-800 ml-1">{rating} / 5</span>
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience with this item..."
            rows={3}
            maxLength={1000}
            className="w-full text-xs p-3 border border-paper-200 rounded-lg focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 bg-paper-50/50 text-ink-900 placeholder:text-ink-400"
          />

          <div className="mt-3 flex justify-end">
            <Button type="submit" size="sm" loading={submitting}>
              Submit Review
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-xs text-ink-400 py-4 text-center">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-paper-100/50 rounded-lg border border-dashed border-paper-200">
            <Star className="h-6 w-6 text-paper-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-ink-700">No reviews yet</p>
            <p className="text-[11px] text-ink-400 mt-0.5">Be the first student to review this item!</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-lg border border-paper-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center">
                    {rev.user_name ? rev.user_name[0].toUpperCase() : <User className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink-900">{rev.user_name || rev.user_email || 'Verified Student'}</p>
                    <p className="text-[10px] text-ink-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-forest-600" /> Verified Campus Buyer
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-paper-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {rev.comment && <p className="text-xs text-ink-600 leading-relaxed pl-9">{rev.comment}</p>}
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
