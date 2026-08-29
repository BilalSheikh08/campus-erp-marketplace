/**
 * Token storage utilities for JWT authentication.
 * Uses localStorage for persistence across sessions.
 */

export const TOKEN_KEY_ACCESS = 'access_token';
export const TOKEN_KEY_REFRESH = 'refresh_token';

/**
 * Store both access and refresh tokens.
 */
export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY_ACCESS, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(TOKEN_KEY_REFRESH, refreshToken);
  }
};

/**
 * Retrieve both tokens from storage.
 */
export const getTokens = () => ({
  access: localStorage.getItem(TOKEN_KEY_ACCESS),
  refresh: localStorage.getItem(TOKEN_KEY_REFRESH),
});

/**
 * Get only the access token.
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY_ACCESS);
};

/**
 * Get only the refresh token.
 */
export const getRefreshToken = () => {
  return localStorage.getItem(TOKEN_KEY_REFRESH);
};

/**
 * Clear all tokens from storage.
 */
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY_ACCESS);
  localStorage.removeItem(TOKEN_KEY_REFRESH);
};

/**
 * Check if tokens exist.
 */
export const hasTokens = () => {
  return !!localStorage.getItem(TOKEN_KEY_ACCESS);
};
