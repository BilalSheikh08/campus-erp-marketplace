/**
 * Contact & Campus Directory Page.
 * Provides on-campus counter locations, operating hours, phone extensions,
 * and an interactive message inquiry form.
 */

import { useState } from 'react';
import {
  Phone,
  MapPin,
  Clock,
  Send,
  Building,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import Alert from '../components/shared/Alert';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const departments = [
    {
      title: '🍽️ Canteen Operations',
      location: 'Central Student Food Court, Ground Floor',
      hours: 'Mon - Sun: 07:30 – 21:30',
      contact: 'Ext. 4401 • canteen@campus.university.edu',
      description: 'Inquiries regarding meal pre-orders, dietary options, and pickup tokens.',
    },
    {
      title: '📚 Academic Stationery Depot',
      location: 'Main Library Building, East Wing Entrance',
      hours: 'Mon - Fri: 08:30 – 18:00 (Sat: 09:00 – 14:00)',
      contact: 'Ext. 4402 • stationery@campus.university.edu',
      description: 'Official blue books, lab manuals, electronics, and drafting equipment.',
    },
    {
      title: '🏠 Chief Warden & Hostel Office',
      location: 'Hostel Block A, Administrative Floor Room 104',
      hours: 'Mon - Fri: 09:00 – 17:00',
      contact: 'Ext. 4403 • hosteldesk@campus.university.edu',
      description: 'Room requisitions, equipment allotment, and resident verification.',
    },
    {
      title: '💻 ERP & Platform IT Helpdesk',
      location: 'University Computing Center, 1st Floor',
      hours: '24/7 Digital Support • In-person: 09:00 – 17:00',
      contact: 'Ext. 4404 • it-support@campus.university.edu',
      description: 'Account login issues, vendor permits, and platform bug reports.',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        studentId: '',
        department: 'general',
        message: '',
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-indigo-400 font-bold text-xs uppercase tracking-widest bg-indigo-500/10 px-3.5 py-1.5 rounded-full border border-indigo-500/20">
            Support & Directory
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-4 mb-4">
            Campus Help & Department Directory
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Need assistance with a canteen order, hostel requisition, or vendor permit? Find campus counters or reach out below.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Department Contacts Grid */}
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Building className="h-6 w-6 text-indigo-600" />
              <span>Campus Service Counters</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {departments.map((dept, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{dept.title}</h3>
                  <p className="text-xs text-slate-600 mb-4">{dept.description}</p>

                  <div className="space-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{dept.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span>{dept.hours}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      <span>{dept.contact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Tips */}
            <div className="mt-8 bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
              <HelpCircle className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-indigo-900 text-sm mb-1">
                  Immediate Counter Pickup Guidelines
                </h4>
                <p className="text-xs text-indigo-800/80 leading-relaxed">
                  When picking up food from the canteen or materials from stationery, always present your digital order token found on your <span className="font-semibold underline">Order Details</span> page.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Support Inquiry Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Submit an Inquiry</h3>
                  <p className="text-xs text-slate-500">We respond to student requests within 24 hours.</p>
                </div>
              </div>

              {submitted && (
                <div className="mb-6">
                  <Alert
                    type="success"
                    title="Inquiry Received"
                    message="Your message has been dispatched to the respective campus department coordinator. You will receive an email update shortly."
                    onClose={() => setSubmitted(false)}
                  />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Alex Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Campus Email Address"
                  type="email"
                  placeholder="e.g. alex.student@campus.university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <Input
                  label="Student / Staff ID (Optional)"
                  placeholder="e.g. STU-2026-9481"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Department
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="general">General Campus ERP Helpdesk</option>
                    <option value="canteen">Canteen & Dining Hall</option>
                    <option value="stationery">Stationery & Academic Materials</option>
                    <option value="hostel">Hostel Requisitions & Wardens</option>
                    <option value="vendor">Vendor Onboarding & Permits</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message / Request Details
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your question, order issue, or feedback..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                >
                  {loading ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Campus Inquiry</span>
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
