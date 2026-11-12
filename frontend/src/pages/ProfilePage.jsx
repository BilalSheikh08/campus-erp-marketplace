/** Manage the authenticated user's profile and password. */

import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, User } from 'lucide-react';
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
  return 'We could not save your changes. Please try again.';
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
      setSuccess('Profile saved.');
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
      await authAPI.changePassword(password.old, password.next, password.confirmation);
      setPassword({ old: '', next: '', confirmation: '' });
      setSuccess('Password changed.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Keep your contact details up to date.</p>
        </header>

        {error && <div className="mb-5"><Alert type="error" message={error} dismissible onClose={() => setError('')} /></div>}
        {success && <div className="mb-5"><Alert type="success" message={success} dismissible onClose={() => setSuccess('')} /></div>}

        <section className="mb-6 rounded-lg bg-white p-8 shadow-sm">
          <div className="mb-7 flex items-center gap-5 border-b pb-7">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"><User className="h-8 w-8 text-white" /></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-800">{user.role} account</span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={saveProfile} className="space-y-5">
              <Input label="Full name" name="name" value={form.name} onChange={updateForm} required maxLength={150} />
              <Input label="Phone number" name="phone" value={form.phone} onChange={updateForm} placeholder="Optional" />
              {user.role === 'student' && <Input label="Hostel room" name="hostel_room" value={form.hostel_room} onChange={updateForm} placeholder="Optional" />}
              <Input label="Email" type="email" value={user.email} disabled />
              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                <Button type="button" variant="ghost" onClick={() => { setForm({ name: user.name || '', phone: user.phone || '', hostel_room: user.hostel_room || '' }); setEditing(false); }}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div><p className="text-sm font-medium text-gray-600">Full name</p><p className="mt-1 text-lg text-gray-900">{user.name || '—'}</p></div>
              <div><p className="flex items-center gap-2 text-sm font-medium text-gray-600"><Mail className="h-4 w-4" />Email</p><p className="mt-1 text-lg text-gray-900">{user.email}</p></div>
              <div><p className="flex items-center gap-2 text-sm font-medium text-gray-600"><Phone className="h-4 w-4" />Phone</p><p className="mt-1 text-lg text-gray-900">{user.phone || '—'}</p></div>
              {user.role === 'student' && <div><p className="flex items-center gap-2 text-sm font-medium text-gray-600"><Building2 className="h-4 w-4" />Hostel room</p><p className="mt-1 text-lg text-gray-900">{user.hostel_room || '—'}</p></div>}
              <Button type="button" onClick={() => { setError(''); setEditing(true); }}>Edit profile</Button>
            </div>
          )}
          <p className="mt-6 border-t pt-5 text-sm text-gray-500">Account created {new Date(user.date_joined).toLocaleDateString()}</p>
        </section>

        <section className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Change password</h2>
          <p className="mb-5 text-sm text-gray-600">Use your current password to set a new one.</p>
          <form onSubmit={savePassword} className="space-y-4">
            <Input label="Current password" name="old" type="password" autoComplete="current-password" value={password.old} onChange={updatePassword} required />
            <Input label="New password" name="next" type="password" autoComplete="new-password" value={password.next} onChange={updatePassword} minLength={8} required />
            <Input label="Confirm new password" name="confirmation" type="password" autoComplete="new-password" value={password.confirmation} onChange={updatePassword} minLength={8} required />
            <Button type="submit" disabled={passwordSaving}>{passwordSaving ? 'Updating…' : 'Update password'}</Button>
          </form>
        </section>
      </div>
    </main>
  );
}
