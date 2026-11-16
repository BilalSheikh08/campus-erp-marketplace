/**
 * Campus Commons - Campus Support Directory & Inquiry Desk
 * University Service Desk & Department Routing:
 * Support inquiries, department dispatch routing, and campus assistance records.
 */

import { useState } from 'react';
import { Send, Building2 } from 'lucide-react';
import { submitContactInquiry } from '../api/support';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const departments = [
  { value: 'general', title: 'Central Campus Helpdesk', description: 'Account credentials, portal access, and general inquiries.' },
  { value: 'canteen', title: 'Dining & Kitchen Operations', description: 'Meal pre-orders, dietary inquiries, and counter pickup protocols.' },
  { value: 'stationery', title: 'Stationery Depot Concession', description: 'Academic blue books, examination supplies, and batch orders.' },
  { value: 'hostel', title: 'Residence Hall Administration', description: 'Room supply allocations and superintendent sign-off support.' },
  { value: 'vendor', title: 'Vendor Onboarding & Permits', description: 'Commercial merchant licensing and concession management.' },
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
    <main className="min-h-screen bg-[#F8F6F0] text-zinc-900 pb-24 font-sans">
      {/* Header Banner */}
      <section className="bg-[#FAF8F3] border-b border-[#E4DDCF] px-4 py-12 text-center sm:px-6">
        <div className="max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500">
            <Building2 className="h-3.5 w-3.5 text-zinc-700" />
            <span>CAMPUS HELPDESK &amp; DEPARTMENT INQUIRY DESK</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
            How May the Clearinghouse Assist You?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed font-sans">
            Submit formal inquiries to campus concession operators, dining staff, or hostel residence administration.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Department Directory */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-[#E4DDCF]">
              Campus Concession &amp; Authority Desks
            </h2>
            <div className="space-y-2.5">
              {departments.map((dept) => (
                <div
                  key={dept.value}
                  className="bg-white rounded-lg border border-[#E4DDCF] p-4 shadow-xs"
                >
                  <h3 className="font-serif font-bold text-sm text-zinc-950">{dept.title}</h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed font-sans">{dept.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-8 shadow-xs">
              <div className="pb-4 mb-5 border-b border-[#E4DDCF]">
                <h2 className="font-serif font-bold text-lg text-zinc-950">Lodge Official Service Inquiry</h2>
                <p className="text-xs text-zinc-600 mt-0.5 font-sans">
                  Inquiries are assigned a reference token and routed to the respective desk supervisor.
                </p>
              </div>

              {reference && (
                <div className="mb-6">
                  <Alert
                    type="success"
                    message={`Inquiry recorded successfully. Reference Token: #${reference.slice(0, 8).toUpperCase()}`}
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
                    label="Full Name"
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
                    placeholder="student@campus.edu"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Student Roll / ID Number"
                    name="studentId"
                    value={form.studentId}
                    onChange={update}
                    placeholder="e.g. 2026-CS-042"
                  />
                  <div>
                    <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Target Department
                    </label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={update}
                      className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:border-blue-900 font-mono"
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
                  <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-1.5">
                    Inquiry Statement
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={update}
                    placeholder="Describe your requisition query, counter pickup issue, or feedback..."
                    className="w-full text-xs px-3 py-2 rounded border border-[#E4DDCF] bg-white text-zinc-900 focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 transition-colors placeholder:text-zinc-400 font-sans leading-relaxed"
                    required
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={loading}
                    disabled={loading}
                    className="w-full text-xs font-mono font-bold py-2.5 flex items-center justify-center gap-2"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Transmit Service Inquiry</span>
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
