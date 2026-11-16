/**
 * Campus Commons - Authentication Sign In
 * Secure student, merchant, warden, and administration sign in.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Alert from '../../components/shared/Alert';
import { VALIDATION_RULES } from '../../utils/constants';

const DEMO_PRESETS = [
  { label: 'Student', email: 'student@campus.edu' },
  { label: 'Canteen', email: 'canteen@campus.edu' },
  { label: 'Warden', email: 'warden@campus.edu' },
  { label: 'Admin', email: 'admin@campus.edu' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_PATTERN.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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

  const handleQuickFill = (email) => {
    setFormData({
      email,
      password: 'password123',
    });
    setValidationErrors({});
    clearError();
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
      await login(formData.email.toLowerCase().trim(), formData.password);
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
            Sign In to Campus Hub
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Access dining pre-orders, course supplies, and residence requisitions.
          </p>
        </div>

        {/* Demo Fast-Fill Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              1-Click Demo Accounts:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">password123</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleQuickFill(p.email)}
                className="px-2 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-200 transition-colors text-slate-700 cursor-pointer text-center"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={clearError} dismissible />
          </div>
        )}

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="pt-2">
              <Button
                type="submit"
                variant="blue"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold shadow-xs"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-slate-500 text-xs sm:text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:underline">
            Register student account
          </Link>
        </p>
      </div>
    </div>
  );
}
