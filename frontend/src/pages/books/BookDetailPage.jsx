/**
 * Campus Commons - Student Textbook Details & Reservation
 * Direct peer-to-peer textbook handoff and escrow reservation.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchBook, reserveBook } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import SafeImage from '../../components/shared/SafeImage';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const conditionLabel = (value) =>
  value ? value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadBook = useCallback(async () => {
    setLoading(true);
    try {
      setBook(await fetchBook(id));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load this book.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const runAction = async (action) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      setMessage(
        result?.status === 'confirmed'
          ? 'Sale confirmed successfully.'
          : 'Book reserved successfully! Coordinate with seller for handoff.'
      );
      await loadBook();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.response?.data?.[Object.keys(err.response?.data || {})[0]]?.[0];
      setError(detail || 'The action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading book details..." />;
  if (!book)
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert type="error" message={error || 'Book not found.'} />
      </div>
    );

  const isSeller = user?.id === book.seller_id;
  const canReserve = user?.role === 'student' && !isSeller && book.status === 'active' && book.is_available;
  const isAvailable = book.status === 'active' && book.is_available;

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </button>

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}
        {message && (
          <div className="mb-4">
            <Alert type="success" message={message} dismissible onClose={() => setMessage('')} />
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Book Image Cover with SafeImage */}
          <div className="min-h-96 bg-slate-50 flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200">
            <div className="w-full max-w-xs aspect-[3/4] relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
              <SafeImage
                src={book.image_url}
                alt={book.title}
                domain="book"
                category="book"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Student P2P Exchange
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold border ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Reserved / Sold'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                {book.author ? `by ${book.author}` : 'Author unspecified'}
              </p>

              {/* Price Block */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 mb-6 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student Price</span>
                  <div className="text-3xl font-mono font-extrabold text-slate-900 mt-0.5">
                    ₹{Number(book.price || 0).toFixed(2)}
                  </div>
                </div>
                <span className="text-xs text-purple-700 font-bold bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  Condition: {conditionLabel(book.condition)}
                </span>
              </div>

              {/* Meta Specifications */}
              <div className="space-y-2.5 text-xs border-y border-slate-100 py-4 mb-6">
                {book.subject && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subject / Course:</span>
                    <span className="font-semibold text-slate-900">{book.subject}</span>
                  </div>
                )}
                {book.edition && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Edition:</span>
                    <span className="font-semibold text-slate-900">{book.edition}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">ISBN:</span>
                    <span className="font-mono text-slate-900">{book.isbn}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Seller:</span>
                  <span className="font-semibold text-blue-600">
                    {book.seller_name || 'Verified Student Peer'}
                  </span>
                </div>
              </div>

              {book.description && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Seller Notes
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-100">
              {canReserve ? (
                <Button
                  onClick={() => runAction(() => reserveBook(book.id))}
                  loading={actionLoading}
                  variant="blue"
                  size="lg"
                  className="w-full py-3.5 rounded-2xl font-bold"
                >
                  Reserve Book for Campus Handoff
                </Button>
              ) : isSeller ? (
                <p className="text-xs text-slate-500 text-center py-2 bg-slate-100 rounded-xl">
                  You are the seller of this textbook listing.
                </p>
              ) : (
                <Button disabled size="lg" className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-500 font-bold">
                  Book Currently Reserved or Sold
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
