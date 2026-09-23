/**
 * User profile page - manage personal information.
 */

import { useEffect, useState } from 'react';
import { User, Mail, Phone, Building2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/shared/Alert';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    hostel_room: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        hostel_room: user.hostel_room || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Note: Backend profile update endpoint exists but not yet exposed in orders.js
    // For now, show placeholder message
    setSuccessMessage('Profile updates coming soon - backend endpoint ready');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  if (!user) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert type="error" message={error} dismissible onClose={() => setError(null)} />
          </div>
        )}
        {successMessage && (
          <div className="mb-6">
            <Alert type="success" message={successMessage} dismissible onClose={() => setSuccessMessage(null)} />
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name || user.email.split('@')[0]}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Account
              </span>
            </div>
          </div>

          {/* Form */}
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
                <Input
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              <Input
                label="Email"
                type="email"
                value={user.email}
                disabled
                placeholder="Your email"
              />

              <Input
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              {user.role === 'student' && (
                <Input
                  label="Hostel Room"
                  name="hostel_room"
                  value={formData.hostel_room}
                  onChange={handleChange}
                  placeholder="e.g., A-101"
                />
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1"
                >
                  Save Changes
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-lg text-gray-900 mt-1">{formData.first_name || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-lg text-gray-900 mt-1">{formData.last_name || '—'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="text-lg text-gray-900 mt-1">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </label>
                <p className="text-lg text-gray-900 mt-1">{formData.phone_number || '—'}</p>
              </div>

              {user.role === 'student' && (
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Hostel Room
                  </label>
                  <p className="text-lg text-gray-900 mt-1">{formData.hostel_room || '—'}</p>
                </div>
              )}

              <Button
                onClick={() => setIsEditing(true)}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>

        {/* Account Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type</span>
              <span className="font-medium text-gray-900">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Created</span>
              <span className="font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated</span>
              <span className="font-medium text-gray-900">
                {new Date(user.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
