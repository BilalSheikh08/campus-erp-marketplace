import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { createBook } from '../../services/booksApi';
import Alert from '../../components/shared/Alert';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';

const CONDITIONS = [
  ['new', 'New'],
  ['like_new', 'Like New'],
  ['good', 'Good'],
  ['fair', 'Fair'],
  ['worn', 'Worn'],
];

export default function BookCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', price: '', image_url: '', condition: 'good', author: '', subject: '', edition: '' });
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Back</button>
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center gap-3 mb-2"><BookOpen className="h-7 w-7 text-primary" /><h1 className="text-2xl font-bold text-gray-900">Sell a Second-Hand Book</h1></div>
          <p className="text-gray-600 mb-8">Create a student-to-student book listing.</p>
          {error && <div className="mb-6"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
          <form onSubmit={submit} className="space-y-5">
            <Input label="Book title" name="title" value={form.title} onChange={update} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Price (₹)" name="price" type="number" min="0" step="0.01" value={form.price} onChange={update} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select name="condition" value={form.condition} onChange={update} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-white">
                  {CONDITIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Author" name="author" value={form.author} onChange={update} />
              <Input label="Subject" name="subject" value={form.subject} onChange={update} />
            </div>
            <Input label="Edition" name="edition" value={form.edition} onChange={update} />
            <Input label="Image URL" name="image_url" type="url" value={form.image_url} onChange={update} placeholder="https://..." />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={update} rows="5" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mention highlights, annotations, included material, etc." />
            </div>
            <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button><Button type="submit" loading={saving}>Create listing</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
