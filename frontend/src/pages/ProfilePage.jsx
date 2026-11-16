/**
 * Campus Commons - Student & User Profile Management
 * Personal account details, room assignments, and password security.
 */

import { useEffect, useState } from 'react';
import { Building2, Mail, Phone, User, KeyRound } from 'lucide-react';
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
      setSuccess('Profile details updated successfully.');
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
      setSuccess('Your password has been changed securely.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-24 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Account &amp; Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal contact details, campus address, and security credentials.
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* User Profile Card */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                  {user?.name ? user.name[0].toUpperCase() : <User className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {user?.role}
                  </span>
                </div>
              </div>

              {!editing && (
                <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={saveProfile} className="mt-6 space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={updateForm}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  placeholder="+91 98765 43210"
                />
                <Input
                  label="Hostel Room / Block"
                  name="hostel_room"
                  value={form.hostel_room}
                  onChange={updateForm}
                  placeholder="Block B-302"
                />
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="blue" loading={saving} disabled={saving} className="font-bold">
                    Save Changes
                  </Button>
                  <Button variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="mt-6 space-y-4 text-xs">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Campus Email</span>
                    <span className="font-semibold text-slate-800">{user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Contact</span>
                    <span className="font-semibold text-slate-800">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Hostel Room</span>
                    <span className="font-semibold text-slate-800">{user?.hostel_room || 'Not assigned'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Card */}
          <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
              <KeyRound className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Change Password</h2>
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
                  variant="blue"
                  loading={passwordSaving}
                  disabled={passwordSaving || !password.old || !password.next}
                  className="w-full font-bold py-2.5 rounded-xl shadow-xs"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
