/**
 * Login page - allows existing users to authenticate.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import Alert from '../../components/shared/Alert';
import { VALIDATION_RULES } from '../../utils/constants';

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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
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
      await login(formData.email.toLowerCase().trim(), formData.password);
      navigate('/');
    } catch (err) {
      // Error is handled by the store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-page flex items-center justify-center min-h-screen px-4 py-10">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-left">
          <div className="mb-4 flex justify-start">
            <div className="auth-mark flex h-12 w-12 items-center justify-center rounded-2xl">
              <span className="text-xl font-bold">C</span>
            </div>
          </div>
          <p className="campus-eyebrow mb-3">Your campus account</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your Campus ERP account
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert
              type="error"
              message={error}
              onClose={clearError}
              dismissible
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form rounded-2xl border p-6 shadow-sm space-y-4 sm:p-8">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
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

          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
