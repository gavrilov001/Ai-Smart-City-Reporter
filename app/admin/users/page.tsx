'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit2, Users, AlertCircle, Shield, User } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface EditingUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UserManagementPage() {
  const [userProfile, setUserProfile] = useState({
    name: 'Admin User',
    initials: 'AU',
    role: 'administrator',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editingUserDetails, setEditingUserDetails] = useState<{ id: string; name: string; email: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const nameParts = user.email?.split('@')[0] || user.name || 'Admin';
        const initials = (user.name || nameParts)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        setUserProfile({
          name: user.name || nameParts,
          initials: initials || 'AU',
          role: user.role || 'administrator',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      if (response.data.status === 'success') {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingUserId(userId);
      const response = await axios.put(`/api/users/${userId}`, { role: newRole });
      
      if (response.data.status === 'success') {
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setEditingUser(null);
        setSuccessMessage('User role updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(true);
      const response = await axios.delete(`/api/users/${userId}`);
      
      if (response.status === 200) {
        setUsers(users.filter(u => u.id !== userId));
        setDeleteConfirm(null);
        setSuccessMessage('User deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdateUserDetails = async (userId: string, name: string, email: string) => {
    try {
      setEditError(null);
      
      // Validation
      if (!name.trim()) {
        setEditError('Name is required');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setEditError('Valid email is required');
        return;
      }

      setUpdatingUserId(userId);
      const response = await axios.put(`/api/users/${userId}`, { name, email });
      
      if (response.data.status === 'success') {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, name, email } : u
        ));
        setEditingUserDetails(null);
        setSuccessMessage('User details updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      setEditError('Failed to update user details. Please try again.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  };

  const getRoleColor = (role: string) => {
    if (role.toLowerCase() === 'administrator') return 'bg-purple-100 text-purple-800';
    if (role.toLowerCase() === 'admin') return 'bg-purple-100 text-purple-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getRoleIcon = (role: string) => {
    if (role.toLowerCase() === 'administrator' || role.toLowerCase() === 'admin') {
      return <Shield className="w-4 h-4" />;
    }
    return <User className="w-4 h-4" />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Smart City</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m2-3l6-3m6 3l2 3m-2 3l-6 3m-6-3l-2-3m2-3l6-3m6 3l2 3m-2 3l-6 3" />
            </svg>
            Dashboard
          </a>

          <a href="/admin/reports" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Issues
          </a>

          <a href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>

          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-emerald-50 text-slate-900 rounded-lg font-medium border-l-4 border-cyan-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M12 4.354L8.646 7.708m6.708 0L12 4.354m0 8.048l3.354 3.354m-6.708 0L5.646 12.402M12 20.5c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z" />
            </svg>
            User Management
          </a>
        </nav>

        <div className="p-6 border-t border-gray-200">
          <a href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                <p className="text-gray-500 text-sm mt-1">Manage system users and their roles</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">{userProfile.initials}</span>
                </div>
                <div className="hidden sm:block">
                  <p className="font-medium text-slate-900 text-sm">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.role}</p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 md:w-48 top-20 md:top-full md:mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 mx-3 md:mx-0">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-medium text-slate-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.role}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition flex items-center gap-2 text-red-600 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mx-6 mt-6 rounded-lg">
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-6 sm:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-cyan-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{users.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Administrators</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{users.filter(u => u.role.toLowerCase() === 'administrator' || u.role.toLowerCase() === 'admin').length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Citizens</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{users.filter(u => u.role.toLowerCase() === 'citizen').length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 font-medium">Loading users...</p>
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium text-lg">No users found</p>
                <p className="text-gray-500 text-sm mt-2">Start by creating user accounts</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-sm">
                              <span className="text-white font-semibold text-xs">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          {editingUser?.id === user.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleRoleChange(user.id, 'administrator')}
                                disabled={updatingUserId === user.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 disabled:opacity-50 transition flex items-center gap-1"
                              >
                                <Shield className="w-3 h-3" />
                                Admin
                              </button>
                              <button
                                onClick={() => handleRoleChange(user.id, 'citizen')}
                                disabled={updatingUserId === user.id}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50 transition flex items-center gap-1"
                              >
                                <User className="w-3 h-3" />
                                Citizen
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                disabled={updatingUserId === user.id}
                                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingUserDetails(editingUserDetails?.id === user.id ? null : { id: user.id, name: user.name, email: user.email })}
                              disabled={updatingUserId === user.id || deleting}
                              className="p-2 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 text-blue-600"
                              title="Edit user details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingUser(editingUser?.id === user.id ? null : { ...user })}
                              disabled={updatingUserId === user.id || deleting}
                              className="p-2 hover:bg-purple-50 rounded-lg transition disabled:opacity-50 text-purple-600"
                              title="Change role"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(deleteConfirm === user.id ? null : user.id)}
                              disabled={updatingUserId === user.id || deleting}
                              className="p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50 text-red-600"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Edit User Details Modal */}
                          {editingUserDetails?.id === user.id && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md">
                                <p className="text-lg font-semibold text-gray-900 mb-4">Edit User Details</p>
                                {editError && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-700 font-medium">{editError}</p>
                                  </div>
                              )}
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">Full Name</label>
                                  <input
                                    type="text"
                                    value={editingUserDetails.name}
                                    onChange={(e) => setEditingUserDetails({ ...editingUserDetails, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    disabled={updatingUserId === user.id}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">Email</label>
                                  <input
                                    type="email"
                                    value={editingUserDetails.email}
                                    onChange={(e) => setEditingUserDetails({ ...editingUserDetails, email: e.target.value })}
                                    placeholder="Enter email address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    disabled={updatingUserId === user.id}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 mt-6">
                                <button
                                  onClick={() => handleUpdateUserDetails(user.id, editingUserDetails.name, editingUserDetails.email)}
                                  disabled={updatingUserId === user.id}
                                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition"
                                >
                                  {updatingUserId === user.id ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingUserDetails(null)}
                                  disabled={updatingUserId === user.id}
                                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium transition"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delete Confirmation */}
                        {deleteConfirm === user.id && (
                          <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border border-red-200 p-4 z-50 w-64">
                            <p className="text-sm font-semibold text-gray-900 mb-3">Delete user?</p>
                            <p className="text-xs text-gray-600 mb-4">Are you sure you want to delete <span className="font-semibold">{user.name}</span>? This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={deleting}
                                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium transition"
                              >
                                {deleting ? 'Deleting...' : 'Delete'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleting}
                                className="flex-1 px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
