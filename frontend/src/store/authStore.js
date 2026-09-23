/**
 * Zustand store for authentication state and actions.
 * Manages user, tokens, and authentication lifecycle.
 */

import { create } from 'zustand';
import { setTokens, clearTokens, getTokens } from '../utils/storage';
import * as authAPI from '../api/auth';
import { USER_ROLES, ERROR_MESSAGES } from '../utils/constants';

export const useAuthStore = create((set) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  /**
   * Initialize auth state from stored tokens and fetch current user.
   */
  initializeAuth: async () => {
    set({ isLoading: true });
    const { access } = getTokens();

    if (!access) {
      set({ isLoading: false });
      return;
    }

    try {
      const user = await authAPI.getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      clearTokens();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: ERROR_MESSAGES.SESSION_EXPIRED,
      });
    }
  },

  /**
   * Register a new user and authenticate them.
   */
  register: async (email, name, password, passwordConfirmation, phone, hostelRoom) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.registerUser(email, name, password, passwordConfirmation, phone, hostelRoom);
      setTokens(data.access, data.refresh);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data.user;
    } catch (error) {
      const errorMsg = error.response?.data?.detail
        || error.response?.data?.email?.[0]
        || error.response?.data?.password?.join(' ')
        || error.response?.data?.password_confirmation?.join(' ')
        || ERROR_MESSAGES.SERVER_ERROR;

      set({
        isLoading: false,
        error: errorMsg,
      });
      throw error;
    }
  },

  /**
   * Login with email and password.
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.loginUser(email, password);
      setTokens(data.access, data.refresh);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return data.user;
    } catch (error) {
      const errorMsg = error.response?.data?.detail
        || ERROR_MESSAGES.INVALID_CREDENTIALS;

      set({
        isLoading: false,
        error: errorMsg,
      });
      throw error;
    }
  },

  /**
   * Logout and clear tokens.
   */
  logout: async () => {
    set({ isLoading: true });
    const { refresh } = getTokens();

    try {
      if (refresh) {
        await authAPI.logoutUser(refresh);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }

    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  /**
   * Clear error message.
   */
  clearError: () => set({ error: null }),

  // Getters
  /**
   * Check if user has a specific role.
   */
  hasRole: (role) => {
    const state = useAuthStore.getState();
    return state.user?.role === role;
  },

  /**
   * Check if user is a student.
   */
  isStudent: () => {
    const state = useAuthStore.getState();
    return state.user?.role === USER_ROLES.STUDENT;
  },

  /**
   * Check if user is a vendor.
   */
  isVendor: () => {
    const state = useAuthStore.getState();
    return state.user?.role === USER_ROLES.VENDOR;
  },

  /**
   * Check if user is a warden.
   */
  isWarden: () => {
    const state = useAuthStore.getState();
    return state.user?.role === USER_ROLES.WARDEN;
  },

  /**
   * Check if user is an admin.
   */
  isAdmin: () => {
    const state = useAuthStore.getState();
    return state.user?.role === USER_ROLES.ADMIN;
  },
}));

export default useAuthStore;
