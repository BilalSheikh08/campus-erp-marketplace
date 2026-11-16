/**
 * Campus Commons - Sell a Second-Hand Book
 * Student-to-student textbook listing form with photo upload and condition tags.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { createBook } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import ImageUploader from '../../components/shared/ImageUploader';

const CONDITIONS = [
  ['new', 'New (Pristine)'],
  ['like_new', 'Like New (Barely used)'],
  ['good', 'Good (Clean with minor marks)'],
  ['fair', 'Fair (Highlighted / readable)'],
  ['worn', 'Worn (Heavy usage, complete)'],
];

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    image_url: '',
    condition: 'good',
    author: '',
    subject: '',
    edition: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const book = await createBook({ ...form, price: Number(form.price) });
      navigate(`/books/${book.id}`);
    } catch (err) {
      const data = err.response?.data;
      const firstField = data && Object.keys(data)[0];
      const detail = data?.detail || (firstField && Array.isArray(data[firstField]) ? data[firstField][0] : null);
      setError(detail || 'Could not create the book listing.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to books
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-200">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 mb-0.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>0% Platform Commission</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">List a Textbook for Sale</h1>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Direct student-to-student peer exchange. Pass down semester study material to peers.
          </p>

          {error && (
            <div className="my-4">
              <Alert type="error" message={error} dismissible onClose={() => setError('')} />
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Book Title"
              name="title"
              value={form.title}
              onChange={update}
              placeholder="e.g. Introduction to Algorithms (CLRS)"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Author(s)"
                name="author"
                value={form.author}
                onChange={update}
                placeholder="e.g. Cormen, Leiserson, Rivest"
              />
              <Input
                label="Course Subject / Branch"
                name="subject"
                value={form.subject}
                onChange={update}
                placeholder="e.g. Computer Science, 3rd Sem"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Book Condition
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={update}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                >
                  {CONDITIONS.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Price (₹)"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={update}
                placeholder="e.g. 450.00"
                required
              />
            </div>

            <Input
              label="Edition / Year"
              name="edition"
              value={form.edition}
              onChange={update}
              placeholder="e.g. 4th Edition (2022)"
            />

            <ImageUploader
              label="Book Photo (Cover)"
              value={form.image_url}
              onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description / Condition Notes
              </label>
              <textarea
                name="description"
                rows={3}
                value={form.description}
                onChange={update}
                placeholder="Mention any missing pages, margin notes, or preferred campus pickup spots..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="blue"
                size="lg"
                loading={saving}
                disabled={saving}
                className="w-full py-3.5 rounded-2xl font-bold"
              >
                Publish Book Listing
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
