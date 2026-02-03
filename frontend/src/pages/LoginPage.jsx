import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInUser,
  registerUser,
  signInWithGoogle,
} from "../services/firebase";
import {
  getFirebaseErrorMessage,
  validateEmail,
  validatePassword,
  validateUsername,
  getErrorType,
} from "../utils/errorHandler";
import { Mail, Lock, User, AlertCircle, Loader } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    displayName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validate password
    if (!formData.password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }

    try {
      await signInUser(formData.email, formData.password);
      // Auth state will be handled by context
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate email
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    // Validate username
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.message);
      setLoading(false);
      return;
    }

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.username,
        formData.displayName,
      );
      setError("Registration successful! Please wait for admin approval.");
      // Redirect to pending page or login
      setTimeout(() => navigate("/pending"), 2000);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      const errorMessage = getFirebaseErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white p-3 rounded-lg mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Fraud Detective
          </h1>
          <p className="text-blue-100">AI-Powered Fraud Detection System</p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                isLogin
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                !isLogin
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              className={`mb-6 p-4 rounded-lg flex gap-3 ${
                getErrorType(error) === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : getErrorType(error) === "info"
                    ? "bg-blue-50 text-blue-800 border border-blue-200"
                    : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Username (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="your_username"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Display Name (Register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  minLength="6"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </button>

          {/* Approval Notice */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After registration, an administrator
                needs to approve your account before you can access the system.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-blue-100 mt-8 text-sm">
          Protected by industry-standard security
        </p>
      </div>
    </div>
  );
};

// Placeholder for Shield icon
const Shield = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6V4m0 2a10 10 0 110 20m0-20c5.523 0 10 4.477 10 10m-10-10c-5.523 0-10 4.477-10 10m0 0v6m0-6H5m0 6h14"
    />
  </svg>
);

export default LoginPage;
