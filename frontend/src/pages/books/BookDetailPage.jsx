import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { fetchBook, reserveBook } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const conditionLabel = (value) => value ? value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

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

  useEffect(() => { loadBook(); }, [loadBook]);

  const runAction = async (action) => {
    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const result = await action();
      setMessage(result?.status === 'confirmed' ? 'Sale confirmed successfully.' : 'Book action completed successfully.');
      await loadBook();
    } catch (err) {
      const detail = err.response?.data?.detail || err.response?.data?.[Object.keys(err.response?.data || {})[0]]?.[0];
      setError(detail || 'The action could not be completed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading book..." />;
  if (!book) return <div className="max-w-4xl mx-auto px-4 py-10"><Alert type="error" message={error || 'Book not found.'} /></div>;

  const isSeller = user?.id === book.seller_id;
  const canReserve = user?.role === 'student' && !isSeller && book.status === 'active' && book.is_available;
  const isAvailable = book.status === 'active' && book.is_available;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
        {error && <div className="mb-4"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {message && <div className="mb-4"><Alert type="success" message={message} dismissible onClose={() => setMessage('')} /></div>}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden grid grid-cols-1 md:grid-cols-2">
          <div className="min-h-96 bg-gray-100 flex items-center justify-center p-8">
            {book.image_url ? <img src={book.image_url} alt={book.title} className="max-h-96 w-full object-contain rounded-lg" /> : <BookOpen className="h-32 w-32 text-gray-300" />}
          </div>
          <div className="p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary mb-2">Second-Hand Book</p>
                <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              </div>
              <span className="text-2xl font-bold text-primary">₹{Number(book.price || 0).toFixed(2)}</span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-sm">{conditionLabel(book.condition)}</span>
              {book.subject && <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-sm">{book.subject}</span>}
              <span className={`rounded-full px-3 py-1 text-sm ${isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span>
            </div>

            <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Author</dt><dd className="font-medium text-gray-900 mt-1">{book.author || '—'}</dd></div>
              <div><dt className="text-gray-500">Edition</dt><dd className="font-medium text-gray-900 mt-1">{book.edition || '—'}</dd></div>
              <div><dt className="text-gray-500">Seller</dt><dd className="font-medium text-gray-900 mt-1">{book.seller_name}</dd></div>
            </dl>

            <div className="mt-8">
              <h2 className="font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600 whitespace-pre-wrap">{book.description || 'No description provided.'}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {canReserve && <Button loading={actionLoading} onClick={() => runAction(() => reserveBook(book.id))} className="gap-2"><ShoppingBag className="h-4 w-4" /> Reserve book</Button>}
              {!user && isAvailable && <Link to="/login"><Button className="gap-2"><ShoppingBag className="h-4 w-4" /> Sign in to reserve</Button></Link>}
              {isSeller && isAvailable && <Link to="/books/my-listings"><Button variant="secondary" className="gap-2"><Clock className="h-4 w-4" /> Manage my listings</Button></Link>}
              {!isAvailable && <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-500"><CheckCircle2 className="h-4 w-4" /> This book is no longer available</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
