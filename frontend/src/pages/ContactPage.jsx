import { useState } from 'react';
import { Building, HelpCircle, MessageSquare, Send } from 'lucide-react';
import { submitContactInquiry } from '../api/support';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const departments = [
  { value: 'general', title: 'Campus ERP Helpdesk', description: 'Account access, platform issues, and general feedback.' },
  { value: 'canteen', title: 'Canteen Operations', description: 'Meal orders, dietary information, and pickup questions.' },
  { value: 'stationery', title: 'Stationery', description: 'Product availability and academic materials.' },
  { value: 'hostel', title: 'Hostel Office', description: 'Hostel supply requests and warden workflows.' },
  { value: 'vendor', title: 'Vendor Onboarding', description: 'Vendor applications and marketplace listings.' },
];

const initialForm = { name: '', email: '', studentId: '', department: 'general', message: '' };

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setReference('');
    try {
      const inquiry = await submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        student_id: form.studentId.trim(),
        department: form.department,
        message: form.message.trim(),
      });
      setReference(inquiry.id);
      setForm(initialForm);
    } catch (requestError) {
      const data = requestError.response?.data;
      setError(data?.detail || Object.values(data || {}).flat().join(' ') || 'We could not submit your inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 px-4 py-16 text-center text-white sm:px-6">
        <span className="rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300">Support</span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">How can we help?</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">Choose a campus team and send a message. Your inquiry will be saved for the support team to review.</p>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8">
        <section className="lg:col-span-7">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900"><Building className="h-6 w-6 text-indigo-600" />Support teams</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {departments.map((department) => (
              <article key={department.value} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-2 font-bold text-slate-900">{department.title}</h3>
                <p className="text-sm text-slate-600">{department.description}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-900">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
            <p>Order and hostel request updates are also available in your account notifications.</p>
          </div>
        </section>

        <section className="lg:col-span-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><MessageSquare className="h-5 w-5" /></div>
              <div><h2 className="text-xl font-bold text-slate-900">Send an inquiry</h2><p className="text-xs text-slate-500">We’ll provide a reference after submission.</p></div>
            </div>
            {reference && <div className="mb-5"><Alert type="success" title="Inquiry received" message={`Your support reference is ${reference}.`} dismissible onClose={() => setReference('')} /></div>}
            {error && <div className="mb-5"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
            <form onSubmit={submit} className="space-y-4">
              <Input label="Your name" name="name" value={form.name} onChange={update} required maxLength={150} />
              <Input label="Email address" name="email" type="email" value={form.email} onChange={update} required />
              <Input label="Student / staff ID (optional)" name="studentId" value={form.studentId} onChange={update} maxLength={64} />
              <div>
                <label htmlFor="department" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Department</label>
                <select id="department" name="department" value={form.department} onChange={update} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {departments.map((department) => <option key={department.value} value={department.value}>{department.title}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Message</label>
                <textarea id="message" name="message" value={form.message} onChange={update} rows={5} maxLength={5000} required placeholder="Describe your question or feedback…" className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <Button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold shadow-md shadow-indigo-600/20 hover:bg-indigo-500">
                {loading ? 'Submitting…' : <><Send className="h-4 w-4" />Submit inquiry</>}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
