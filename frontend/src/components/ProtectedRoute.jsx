import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader } from "lucide-react";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, userInfo, loading, isPending } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (isPending) {
    return <PendingApprovalPage />;
  }

  if (requiredRole && userInfo?.role !== requiredRole) {
    return <UnauthorizedPage />;
  }

  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, userInfo, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || userInfo?.role !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export const AnalystRoute = ({ children }) => {
  const { user, userInfo, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!["admin", "analyst"].includes(userInfo?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

const PendingApprovalPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="inline-block bg-orange-100 p-4 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Pending Approval
        </h1>
        <p className="text-gray-600 mb-6">
          Your account is awaiting administrator approval. You will receive an
          email notification once your request has been reviewed.
        </p>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong>
              <br />
              An admin will review your registration and assign you an
              appropriate role.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/logout")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="inline-block bg-red-100 p-4 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Contact an
          administrator if you believe this is an error.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
