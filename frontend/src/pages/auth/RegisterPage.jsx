/**
 * Campus Commons - Student Registration
 * Register student account with campus email and hostel room assignment.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Alert from '../../components/shared/Alert';
import { VALIDATION_RULES } from '../../utils/constants';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    passwordConfirmation: '',
    phone: '',
    hostelRoom: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`;
    }

    if (!formData.passwordConfirmation) {
      errors.passwordConfirmation = 'Please confirm your password';
    } else if (formData.password !== formData.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords do not match';
    }

    if (formData.phone && !VALIDATION_RULES.PHONE_PATTERN.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await register(
        formData.email.toLowerCase().trim(),
        formData.name.trim(),
        formData.password,
        formData.passwordConfirmation,
        formData.phone.trim(),
        formData.hostelRoom.trim()
      );
      navigate('/');
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-xl shadow-md border border-slate-800 group-hover:scale-105 transition-transform">
              <span className="font-editorial text-amber-400">U</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              CAMPUS<span className="text-blue-600">HUB</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Student Account
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Join the campus clearinghouse to order food, supplies, and trade books.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={clearError} dismissible />
          </div>
        )}

        {/* Register Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              name="name"
              placeholder="e.g. Aarav Sharma"
              value={formData.name}
              onChange={handleChange}
              error={validationErrors.name}
              disabled={isLoading}
              required
            />

            <Input
              label="Campus Email Address"
              type="email"
              name="email"
              placeholder="student@campus.edu"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              disabled={isLoading}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Hostel Room (Optional)"
                type="text"
                name="hostelRoom"
                placeholder="e.g. Block B-302"
                value={formData.hostelRoom}
                onChange={handleChange}
                disabled={isLoading}
              />
              <Input
                label="Phone (Optional)"
                type="tel"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                error={validationErrors.phone}
                disabled={isLoading}
              />
            </div>

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={validationErrors.password}
              disabled={isLoading}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              name="passwordConfirmation"
              placeholder="••••••••"
              value={formData.passwordConfirmation}
              onChange={handleChange}
              error={validationErrors.passwordConfirmation}
              disabled={isLoading}
              required
            />

            <div className="pt-3">
              <Button
                type="submit"
                variant="blue"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>Create Student Account</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-slate-500 text-xs sm:text-sm">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
