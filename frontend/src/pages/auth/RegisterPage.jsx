/**
 * Campus Commons - Student Registration
 * University Student Matriculation & Portal Registration:
 * Create student account with verified campus email and residence hall assignment.
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
      errors.email = 'Please enter a valid campus email address';
    }

    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
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
            Register Student Identity
          </h1>
          <p className="mt-1 text-xs text-zinc-600 font-sans">
            Enroll for express dining tokens, academic supplies, and room logistics.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={clearError} dismissible />
          </div>
        )}

        {/* Registration Box */}
        <div className="bg-white rounded-lg border border-[#E4DDCF] p-6 sm:p-7 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Official Name"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Phone"
                name="phone"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                error={validationErrors.phone}
                disabled={isLoading}
              />
              <Input
                label="Residence Room"
                name="hostelRoom"
                placeholder="Block B-302"
                value={formData.hostelRoom}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded text-xs font-mono font-bold shadow-xs"
              >
                <span>Create Student Account</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-5 text-zinc-600 text-xs font-sans">
          Already registered on campus?{' '}
          <Link to="/login" className="text-blue-900 font-bold hover:underline">
            Sign in to portal
          </Link>
        </p>
      </div>
    </div>
  );
}
