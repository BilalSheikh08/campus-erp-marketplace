/**
 * Campus Commons - Authentication Sign In
 * University Portal Credentials Entrypoint:
 * Student, merchant, warden, and administration sign in with 1-click role demo fill.
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
  { label: 'Student', email: 'student@campus.edu', badge: 'Student Desk' },
  { label: 'Canteen', email: 'canteen@campus.edu', badge: 'Merchant Desk' },
  { label: 'Warden', email: 'warden@campus.edu', badge: 'Superintendent' },
  { label: 'Admin', email: 'admin@campus.edu', badge: 'Registrar' },
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
      errors.email = 'Please enter a valid campus email address';
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
      const user = await login(formData.email.toLowerCase().trim(), formData.password);
      const roleRedirects = {
        vendor: '/vendor/dashboard',
        warden: '/warden/dashboard',
        admin: '/admin/dashboard',
        student: '/',
      };
      navigate(roleRedirects[user?.role] || '/');
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-[#F8F6F0] text-zinc-900 font-sans">
      <div className="w-full max-w-md">
        {/* University Masthead Header */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-9 h-9 rounded bg-zinc-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              U
            </div>
            <div className="text-left">
              <span className="font-serif text-lg font-bold tracking-tight text-zinc-950 block leading-tight">
                CAMPUS<span className="font-light text-zinc-600">HUB</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block -mt-0.5">
                Central Exchange
              </span>
            </div>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950 tracking-tight">
            Sign In to University Portal
          </h1>
          <p className="mt-1 text-xs text-zinc-600 font-sans">
            Access dining pre-orders, course supplies, and residence requisitions.
          </p>
        </div>

        {/* Demo Fast-Fill Bar */}
        <div className="mb-5 p-4 rounded-lg bg-white border border-[#E4DDCF] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-600" />
              1-Click Demo Accounts:
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">password123</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleQuickFill(p.email)}
                className="px-2 py-1.5 text-xs font-mono font-semibold rounded bg-[#FAF8F3] hover:bg-zinc-900 hover:text-white border border-[#E4DDCF] transition-colors text-zinc-800 cursor-pointer text-center"
                title={`${p.badge} (${p.email})`}
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

        {/* Login Form Box */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-7 shadow-xs">
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
              label="Authentication Password"
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
                variant="primary"
                size="md"
                loading={isLoading}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-mono font-bold shadow-xs"
              >
                <span>Authorize Portal Access</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-5 text-zinc-600 text-xs font-sans">
          New student on campus?{' '}
          <Link to="/register" className="text-blue-900 font-bold hover:underline">
            Register student account
          </Link>
        </p>
      </div>
    </div>
  );
}
