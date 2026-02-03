import React, { useState, useEffect } from "react";
import { getIdToken } from "../services/firebase";
import {
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Search,
  UserCheck,
} from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [approvingUserId, setApprovingUserId] = useState(null);
  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await getIdToken();

      // Fetch dashboard stats
      const dashResponse = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!dashResponse.ok) throw new Error("Failed to fetch dashboard");
      const dashData = await dashResponse.json();
      setDashboardData(dashData);

      // Fetch pending approvals
      const pendingResponse = await fetch(
        `${API_BASE_URL}/admin/pending-approvals`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingUsers(pendingData);
      }

      // Fetch all users
      const usersResponse = await fetch(
        `${API_BASE_URL}/admin/users?limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setAllUsers(usersData);
      }
    } catch (err) {
      setError(err.message);
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, role) => {
    try {
      setApprovingUserId(userId);
      const token = await getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        },
      );

      if (!response.ok) throw new Error("Failed to approve user");

      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingUserId(null);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      setApprovingUserId(userId);
      const token = await getIdToken();

      const response = await fetch(
        `${API_BASE_URL}/admin/users/${userId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to reject user");

      await fetchDashboardData();
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600">Manage users and system access</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {dashboardData.total_users}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-100" />
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {dashboardData.pending_approvals}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-orange-100" />
              </div>
            </div>

            {/* Admins */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Admins</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {dashboardData.roles?.admin || 0}
                  </p>
                </div>
                <Shield className="w-12 h-12 text-red-100" />
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Alerts (7d)
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {dashboardData.recent_alerts_7d}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-100" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending Approvals
            {dashboardData?.pending_approvals > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {dashboardData.pending_approvals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All Users
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && dashboardData && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              User Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData.roles).map(([role, count]) => (
                <div
                  key={role}
                  className="text-center p-4 bg-gray-50 rounded-lg"
                >
                  <p className="text-gray-600 text-sm font-medium capitalize">
                    {role}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "pending" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">No pending approvals!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">
                            {user.display_name || user.username}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <div className="relative">
                              <select
                                value={selectedRole}
                                onChange={(e) =>
                                  setSelectedRole(e.target.value)
                                }
                                className="px-2 py-1 text-sm border border-gray-300 rounded"
                              >
                                <option value="user">User</option>
                                <option value="analyst">Analyst</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <button
                              onClick={() =>
                                handleApproveUser(user.id, selectedRole)
                              }
                              disabled={approvingUserId === user.id}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {approvingUserId === user.id && (
                                <Loader className="w-4 h-4 animate-spin" />
                              )}
                              <UserCheck className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectUser(user.id)}
                              disabled={approvingUserId === user.id}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow">
            {/* Search */}
            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900">
                          {user.display_name || user.username}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-800"
                              : user.role === "analyst"
                                ? "bg-blue-100 text-blue-800"
                                : user.role === "user"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_active ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
