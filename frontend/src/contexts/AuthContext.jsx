// Auth context provider for managing auth state globally
import React, { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChange, getCurrentUserInfo, signOutUser } from "../services/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChange(async (authUser) => {
      try {
        if (authUser.authenticated) {
          setUser(authUser);

          // Fetch user info from backend
          try {
            const info = await getCurrentUserInfo(authUser.token);
            setUserInfo(info);
          } catch (err) {
            console.error("Failed to fetch user info:", err);
            setError(err.message);
          }
        } else {
          setUser(null);
          setUserInfo(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      setError(null);
      await signOutUser();
      setUser(null);
      setUserInfo(null);
    } catch (err) {
      setError(err?.message || "Logout failed");
      throw err;
    }
  };

  const value = {
    user,
    userInfo,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    isAdmin: userInfo?.role === "admin",
    isAnalyst: userInfo?.role === "analyst",
    isPending: userInfo?.role === "pending",
    canAccessAdmin: userInfo?.role === "admin",
    canViewReports: ["admin", "analyst"].includes(userInfo?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
