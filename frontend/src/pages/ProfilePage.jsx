/**
 * Campus Commons - Student & User Identity Dossier
 * Digital Campus Identity Card & Account Credentials:
 * Official contact particulars, residence room assignments, and access security.
 */

import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, User, KeyRound, Shield } from 'lucide-react';
import * as authAPI from '../api/auth';
import useAuthStore from '../store/authStore';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const errorMessage = (error) => {
  const data = error.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (data && typeof data === 'object') {
    return Object.values(data).flat().join(' ');
  }
  return 'We could not save your changes. Please verify the entered data.';
};

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', hostel_room: '' });
  const [password, setPassword] = useState({ old: '', next: '', confirmation: '' });

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', hostel_room: user.hostel_room || '' });
    }
  }, [user]);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updatePassword = (event) => setPassword((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await authAPI.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        hostel_room: form.hostel_room.trim(),
      });
      setUser(updated);
      setEditing(false);
      setSuccess('Identity record updated successfully.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setPasswordSaving(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.changePassword({
        old_password: password.old,
        new_password: password.next,
        new_password_confirmation: password.confirmation,
      });
      setPassword({ old: '', next: '', confirmation: '' });
      setSuccess('Access credentials updated securely.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-zinc-900 py-10 pb-24 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="mb-8 pb-5 border-b border-[#E4DDCF]">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
            <Shield className="h-3.5 w-3.5 text-zinc-700" />
            <span>CAMPUS REGISTRY · DIGITAL IDENTITY SLIP</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 tracking-tight">
            Account &amp; Identity Credentials
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm mt-1 font-sans">
            Manage your verified contact coordinates, hall residence assignment, and authentication password.
          </p>
        </div>

        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert type="success" message={success} dismissible onClose={() => setSuccess('')} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Identity Dossier Card */}
          <div className="md:col-span-7 bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center justify-between pb-5 border-b border-[#E4DDCF]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded bg-zinc-900 text-white flex items-center justify-center font-serif font-bold text-lg">
                  {user?.name ? user.name[0].toUpperCase() : <User className="h-5 w-5" />}
                </div>
                <div>
                  <h2 className="font-serif font-bold text-lg text-zinc-950">{user?.name}</h2>
                  <p className="text-xs font-mono text-zinc-500">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#E4DDCF] bg-[#FAF8F3] text-zinc-800">
                    Role: {user?.role}
                  </span>
                </div>
              </div>

              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="text-xs">
                  Modify Details
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="mt-5 space-y-4">
                <Input
                  label="Full Official Name"
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  required
                />
                <Input
                  label="Contact Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Residence Room / Hall Block"
                  name="hostel_room"
                  value={form.hostel_room}
                  onChange={updateForm}
                  placeholder="Block B-302"
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="primary" size="md" loading={saving} disabled={saving} className="text-xs font-bold font-mono">
                    Save Changes
                  </Button>
                  <Button variant="outline" size="md" onClick={() => setEditing(false)} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-5 space-y-3 text-xs font-sans">
                <div className="flex items-center gap-3 p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
                  <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Campus Email Address</span>
                    <span className="font-mono font-semibold text-zinc-900">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
                  <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Registered Phone</span>
                    <span className="font-mono font-semibold text-zinc-900">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded border border-[#E4DDCF] bg-[#FAF8F3]">
                  <Building2 className="h-4 w-4 text-zinc-500 shrink-0" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Hostel Room Allocation</span>
                    <span className="font-mono font-semibold text-zinc-900">{user?.hostel_room || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Slip */}
          <div className="md:col-span-5 bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E4DDCF] mb-5">
              <KeyRound className="h-4 w-4 text-zinc-700" />
              <h2 className="font-serif font-bold text-base text-zinc-950">Update Password</h2>
            </div>

            <form onSubmit={savePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                name="old"
                value={password.old}
                onChange={updatePassword}
                required
              />
              <Input
                label="New Password"
                type="password"
                name="next"
                value={password.next}
                onChange={updatePassword}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                name="confirmation"
                value={password.confirmation}
                onChange={updatePassword}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={passwordSaving}
                  disabled={passwordSaving || !password.old || !password.next}
                  className="w-full text-xs font-mono font-bold py-2.5"
                >
                  Update Access Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
