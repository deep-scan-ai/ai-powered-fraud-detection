// Firebase configuration and authentication service
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Firebase configuration - Replace with your config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(firebaseApp);
setPersistence(auth, browserLocalPersistence);

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

/**
 * Register a new user with Firebase
 */
export const registerUser = async (email, password, username, displayName) => {
  try {
    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Register in backend with ID token
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: username || email.split('@')[0],
        display_name: displayName || null,
        id_token: idToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.detail || 'Failed to register in backend';
      throw new Error(errorMessage);
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      token: idToken
    };
  } catch (error) {
    // Re-throw with Firebase error code if available
    if (error.code) {
      throw error; // Keep Firebase error code
    }
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Sign in user with email and password
 */
export const signInUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    const idToken = await firebaseUser.getIdToken();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      token: idToken
    };
  } catch (error) {
    // Re-throw with Firebase error code preserved
    throw error;
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    // Check if user exists in backend, if not register
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email,
        username: firebaseUser.displayName?.split(' ')[0] || firebaseUser.email.split('@')[0],
        display_name: firebaseUser.displayName,
        id_token: idToken
      })
    });

    if (!response.ok) {
      console.error('Backend registration failed:', await response.text());
    }

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      token: idToken
    };
  } catch (error) {
    throw new Error(error.message || 'Google sign in failed');
  }
};

/**
 * Get current user info from backend
 */
export const getCurrentUserInfo = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to get user info');
  }
};

/**
 * Sign out user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw new Error(error.message || 'Sign out failed');
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const idToken = await firebaseUser.getIdToken();
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        token: idToken,
        authenticated: true
      });
    } else {
      callback({
        authenticated: false
      });
    }
  });
};

/**
 * Get current Firebase user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get ID token for API requests
 */
export const getIdToken = async () => {
  const user = getCurrentUser();
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export { auth, firebaseApp };
