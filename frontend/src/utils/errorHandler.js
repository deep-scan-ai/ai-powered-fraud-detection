/**
 * Firebase and API Error Handler
 * Maps error codes to user-friendly messages
 */

// Firebase authentication error codes
const FIREBASE_ERRORS = {
  'auth/invalid-email': 'Invalid email address format. Please enter a valid email.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
  'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
  'auth/account-exists-with-different-credential': 'An account already exists with this email using a different sign-in method.',
  'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Please check your internet connection.',
};

// API error messages
const API_ERRORS = {
  'Failed to register in backend': 'Failed to create user account. Please try again.',
  'Token verification failed': 'Authentication token is invalid. Please sign in again.',
  'User not found': 'User account not found. Please sign up or use a different account.',
  'Invalid token': 'Your session has expired. Please sign in again.',
  'Registration failed': 'Registration failed. Please check your information and try again.',
  'Sign in failed': 'Sign in failed. Please check your credentials.',
  'Google sign in failed': 'Google sign-in failed. Please try again.',
};

/**
 * Parse Firebase error codes and return user-friendly messages
 */
export const getFirebaseErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred. Please try again.';

  // Check if it's a Firebase error with code
  if (error.code && FIREBASE_ERRORS[error.code]) {
    return FIREBASE_ERRORS[error.code];
  }

  // Check if error message matches predefined messages
  const errorMessage = error.message || error.toString();
  for (const [key, value] of Object.entries(API_ERRORS)) {
    if (errorMessage.includes(key)) {
      return value;
    }
  }

  // Return original error message if not found in mappings
  return errorMessage || 'An unknown error occurred. Please try again.';
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 6) {
    return {
      valid: false,
      message: 'Password must be at least 6 characters long.',
    };
  }
  return { valid: true };
};

/**
 * Validate username
 */
export const validateUsername = (username) => {
  if (!username) return { valid: false, message: 'Username is required.' };
  if (username.length < 3) {
    return {
      valid: false,
      message: 'Username must be at least 3 characters long.',
    };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      valid: false,
      message: 'Username can only contain letters, numbers, underscores, and hyphens.',
    };
  }
  return { valid: true };
};

/**
 * Get type of error (info, warning, error, success)
 */
export const getErrorType = (message) => {
  if (message.includes('successful')) return 'success';
  if (message.includes('pending') || message.includes('wait')) return 'info';
  if (message.includes('Warning')) return 'warning';
  return 'error';
};
