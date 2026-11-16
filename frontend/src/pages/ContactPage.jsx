/**
 * Campus Commons - Contact & Campus Support Directory
 * Support inquiry ticketing, department routing, and campus assistance.
 */

import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { submitContactInquiry } from '../api/support';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const departments = [
  { value: 'general', title: 'Campus Helpdesk', description: 'Account access, platform issues, and general feedback.' },
  { value: 'canteen', title: 'Canteen Operations', description: 'Meal orders, dietary information, and counter pickup queries.' },
  { value: 'stationery', title: 'Stationery Depot', description: 'Product availability and academic examination supplies.' },
  { value: 'hostel', title: 'Hostel Administration', description: 'Room supply requisitions and warden sign-offs.' },
  { value: 'vendor', title: 'Vendor Onboarding', description: 'Merchant licensing and marketplace listing assistance.' },
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
      setError(
        data?.detail ||
          Object.values(data || {})
            .flat()
            .join(' ') ||
          'We could not submit your inquiry. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 px-4 py-12 text-center sm:px-6 shadow-xs">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Campus Helpdesk &amp; Support</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How Can We Assist You?
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-500 leading-relaxed">
            Reach out to campus operators, dining staff, or hostel administration with questions or feedback.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Department Directory */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider text-xs">
              Campus Support Desks
            </h2>
            <div className="space-y-3">
              {departments.map((dept) => (
                <div
                  key={dept.value}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition"
                >
                  <h3 className="font-bold text-slate-900 text-sm">{dept.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dept.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Submit an Inquiry</h2>
              <p className="text-xs text-slate-500 mb-6">
                Your ticket will be routed directly to the designated department administrator.
              </p>

              {reference && (
                <div className="mb-6">
                  <Alert
                    type="success"
                    title="Inquiry Received"
                    message={`Ticket #${reference.slice(0, 8)} has been registered. Our campus team will review and respond shortly.`}
                  />
                </div>
              )}

              {error && (
                <div className="mb-6">
                  <Alert type="error" message={error} dismissible onClose={() => setError('')} />
                </div>
              )}

              <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Your Full Name"
                    name="name"
                    value={form.name}
                    onChange={update}
                    placeholder="e.g. Aarav Sharma"
                    required
                  />
                  <Input
                    label="Campus Email Address"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={update}
                    placeholder="e.g. student@campus.edu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Student ID / Roll No"
                    name="studentId"
                    value={form.studentId}
                    onChange={update}
                    placeholder="e.g. 2024CS104"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Target Department
                    </label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={update}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    >
                      {departments.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={update}
                    placeholder="Describe your question or issue in detail..."
                    required
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder:text-slate-400"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="blue"
                    size="lg"
                    loading={loading}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Inquiry</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
