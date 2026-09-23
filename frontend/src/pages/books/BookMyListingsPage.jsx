import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { confirmBookSale, fetchMyBookListings } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function resultsFrom(data) { return Array.isArray(data) ? data : data?.results || []; }
function label(value) { return value ? value.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—'; }

export default function BookMyListingsPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyBookListings({ page_size: 50, available: 'all' });
      setBooks(resultsFrom(data));
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load your book listings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmSale = async (id) => {
    setWorkingId(id);
    setError('');
    try { await confirmBookSale(id); await load(); } catch (err) { setError(err.response?.data?.detail || 'Could not confirm the sale.'); }
    finally { setWorkingId(null); }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-bold text-gray-900">My Book Listings</h1><p className="text-gray-600 mt-1">Manage the books you are selling.</p></div><Link to="/books/new"><Button className="gap-2"><Plus className="h-4 w-4" /> New listing</Button></Link></div>
        {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {loading ? <LoadingSpinner message="Loading your listings..." /> : books.length === 0 ? <div className="bg-white rounded-xl border"><EmptyState icon={<BookOpen className="mx-auto h-12 w-12" />} title="No book listings yet" message="Create your first listing to offer a book to other students." action={<Link to="/books/new"><Button>Create listing</Button></Link>} /></div> : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="divide-y">
              {books.map((book) => (
                <div key={book.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4"><div className="h-16 w-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">{book.image_url ? <img src={book.image_url} alt="" className="h-full w-full object-cover" /> : <BookOpen className="h-7 w-7 text-gray-300" />}</div><div><Link to={`/books/${book.id}`} className="font-semibold text-gray-900 hover:text-primary">{book.title}</Link><p className="text-sm text-gray-500 mt-1">₹{Number(book.price || 0).toFixed(2)} · {label(book.condition)}</p><p className="text-xs text-gray-500 mt-1">Status: {label(book.status)}</p></div></div>
                  <div className="flex items-center gap-3">{book.status === 'active' && book.is_available ? <Button loading={workingId === book.id} onClick={() => confirmSale(book.id)}>Confirm reserved sale</Button> : <span className="text-sm text-gray-500">No active sale action</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
