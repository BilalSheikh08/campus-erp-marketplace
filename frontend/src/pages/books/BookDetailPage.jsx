/**
 * Campus Commons - Student Textbook Details & Reservation
 * Redesigned with academic exchange folio aesthetic:
 * warm paper background, monospace course & ISBN metadata, and peer handoff reservation.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
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
      setError(err.response?.data?.detail || 'Could not load this book entry.');
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

  if (loading) return <LoadingSpinner message="Consulting textbook entry..." />;
  if (!book)
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 font-sans">
        <Alert type="error" message={error || 'Book record not found.'} />
      </div>
    );

  const isSeller = user?.id === book.seller_id;
  const canReserve = user?.role === 'student' && !isSeller && book.status === 'active' && book.is_available;
  const isAvailable = book.status === 'active' && book.is_available;

  return (
    <div className="min-h-screen bg-[#F8F6F0] py-10 pb-24 text-zinc-900 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-mono text-zinc-600 hover:text-zinc-950 transition cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK TO TEXTBOOK INDEX
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

        <div className="bg-white rounded-lg border border-[#E4DDCF] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Book Image Cover with SafeImage */}
          <div className="min-h-96 bg-[#FAF8F3] flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-[#E4DDCF]">
            <div className="w-full max-w-xs aspect-[3/4] relative rounded overflow-hidden border border-[#E4DDCF] shadow-xs bg-white">
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
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-300">
                  Student P2P Exchange
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-[#FAF8F3] text-zinc-500 border-[#E4DDCF]'
                  }`}
                >
                  {isAvailable ? 'Available' : 'Reserved / Sold'}
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-xs font-mono text-zinc-500 mt-1 mb-4">
                {book.author ? `by ${book.author}` : 'Author unspecified'}
              </p>

              {/* Price Block */}
              <div className="p-4 rounded border border-[#E4DDCF] bg-[#FAF8F3] mb-5 flex items-baseline justify-between font-mono">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Peer Exchange Rate</span>
                  <div className="text-2xl font-bold text-zinc-950 mt-0.5">
                    ₹{Number(book.price || 0).toFixed(2)}
                  </div>
                </div>
                <span className="text-xs text-purple-900 font-semibold bg-white px-2.5 py-1 rounded border border-[#E4DDCF]">
                  Condition: {conditionLabel(book.condition)}
                </span>
              </div>

              {/* Meta Specifications */}
              <div className="space-y-2 text-xs font-mono border-y border-[#E4DDCF] py-3.5 mb-5">
                {book.subject && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Subject / Course:</span>
                    <span className="font-semibold text-zinc-900">{book.subject}</span>
                  </div>
                )}
                {book.edition && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Edition:</span>
                    <span className="font-semibold text-zinc-900">{book.edition}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">ISBN Record:</span>
                    <span className="text-zinc-900">{book.isbn}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Listed Seller:</span>
                  <span className="font-semibold text-zinc-900 flex items-center gap-1">
                    <User className="h-3 w-3 text-zinc-400" />
                    {book.seller_name || 'Verified Student Peer'}
                  </span>
                </div>
              </div>

              {book.description && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    Seller Notes &amp; Handoff Details
                  </h3>
                  <p className="text-xs text-zinc-700 leading-relaxed bg-[#FAF8F3] p-3 rounded border border-[#E4DDCF] font-sans">
                    {book.description}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#E4DDCF]">
              {canReserve ? (
                <Button
                  onClick={() => runAction(() => reserveBook(book.id))}
                  loading={actionLoading}
                  variant="primary"
                  size="lg"
                  className="w-full py-2.5 rounded text-xs font-semibold"
                >
                  Reserve Book for Campus Handoff
                </Button>
              ) : isSeller ? (
                <p className="text-xs font-mono text-zinc-500 text-center py-2 bg-[#FAF8F3] rounded border border-[#E4DDCF]">
                  You are the listed seller of this textbook.
                </p>
              ) : (
                <Button disabled size="lg" className="w-full py-2.5 rounded bg-zinc-100 text-zinc-400 font-medium text-xs">
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
