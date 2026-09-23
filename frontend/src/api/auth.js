/**
 * Authentication API endpoints.
 */

import api from './client';

/**
 * Register a new user (student by default).
 */
export const registerUser = async (email, name, password, passwordConfirmation, phone = '', hostelRoom = '') => {
  const response = await api.post('/api/auth/register/', {
    email,
    name,
    password,
    password_confirmation: passwordConfirmation,
    phone,
    hostel_room: hostelRoom,
    role: 'student', // Only students can register publicly
  });
  return response.data;
};

/**
 * Login with email and password.
 */
export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login/', {
    email,
    password,
  });
  return response.data;
};

/**
 * Get current authenticated user profile.
 */
export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me/');
  return response.data;
};

/**
 * Update current user profile (name, phone, hostel_room).
 */
export const updateProfile = async (data) => {
  const response = await api.patch('/api/auth/me/', data);
  return response.data;
};

/**
 * Change password for authenticated user.
 */
export const changePassword = async (oldPassword, newPassword, newPasswordConfirmation) => {
  const response = await api.post('/api/auth/password/change/', {
    old_password: oldPassword,
    new_password: newPassword,
    new_password_confirmation: newPasswordConfirmation,
  });
  return response.data;
};

/**
 * Logout by blacklisting the refresh token.
 */
export const logoutUser = async (refreshToken) => {
  try {
    await api.post('/api/auth/logout/', {
      refresh: refreshToken,
    });
  } catch (error) {
    // Even if logout fails, we still clear local tokens
    console.error('Logout request failed:', error);
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser,
};
