'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Eye, AlertCircle } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  address: string;
  latitude?: number;
  longitude?: number;
  category_id: string;
  categories?: {
    name: string;
  };
  users?: {
    name: string;
    email: string;
  };
  report_images?: Array<{
    id: string;
    image_url: string;
    uploaded_at: string;
  }>;
}

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}

interface AdminNote {
  id: string;
  report_id: string;
  admin_id: string;
  note_text: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportId, setReportId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    initials: 'AU',
    id: '',
    role: 'administrator',
  });
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [noteImage, setNoteImage] = useState<File | null>(null);
  const [noteImagePreview, setNoteImagePreview] = useState<string | null>(null);
  const [uploadingNote, setUploadingNote] = useState(false);
  const [comments, setComments] = useState<AdminNote[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setReportId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserProfile({
          name: user.name,
          initials: user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2),
          id: user.id,
          role: user.role,
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
      loadComments();
    }
  }, [reportId]);

  const loadComments = async () => {
    if (!reportId) return;
    try {
      const response = await axios.get(`/api/admin/notes?reportId=${reportId}`);
      if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setComments(response.data.data);
      } else {
        setComments([]);
      }
    } catch (e) {
      console.error('Error loading notes:', e);
      setComments([]);
    }
  };

  const saveComments = async (noteText: string, imageUrl: string | null) => {
    if (!reportId || !userProfile.id) return;
    try {
      const response = await axios.post('/api/admin/notes', {
        reportId,
        adminId: userProfile.id,
        noteText: noteText || null,
        imageUrl: imageUrl || null,
      });
      
      if (response.data.status === 'success') {
        await loadComments();
      }
    } catch (e) {
      console.error('Error saving note:', e);
      throw e;
    }
  };

  const fetchReportDetail = async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports/${reportId}`);
      if (response.data.status === 'success') {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusDisplay = (status: string): string => {
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!reportId) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage(null);

      const response = await axios.patch(`/api/admin/reports/${reportId}/update-status`, {
        status: newStatus,
      });

      if (response.data.status === 'success') {
        setReport(response.data.data);
        setStatusMessage({
          type: 'success',
          text: `Status updated to ${newStatus}`,
        });
        // Clear message after 3 seconds
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update status. Please try again.',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddComment = async () => {
    if (!adminNote.trim() && !noteImage) return;

    try {
      setUploadingNote(true);
      let imageUrl = null;

      // Upload image if selected
      if (noteImage) {
        const formData = new FormData();
        formData.append('image', noteImage);
        formData.append('report_id', reportId || '');

        try {
          const uploadResponse = await axios.post('/api/admin/upload-note-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (uploadResponse.data.imageUrl) {
            imageUrl = uploadResponse.data.imageUrl;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image. Note will be saved without image.');
        }
      }

      // Save note to database
      await saveComments(adminNote, imageUrl);
      
      setAdminNote('');
      setNoteImage(null);
      setNoteImagePreview(null);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    } finally {
      setUploadingNote(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNoteImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNoteImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setNoteImage(null);
    setNoteImagePreview(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
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

          <a href="/admin/reports" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-emerald-50 text-slate-900 rounded-lg font-medium border-l-4 border-cyan-500">
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

          <a href="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M12 4.354L8.646 7.708m6.708 0L12 4.354m0 8.048l3.354 3.354m-6.708 0L5.646 12.402M12 20.5c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z" />
            </svg>
            User Management
          </a>

          <a href="/admin/ai-assistant" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition group"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Report Details</h1>
                  <p className="text-gray-500 text-sm mt-1">Complete view of the submitted issue</p>
                </div>
              </div>
            </div>

            {/* User Profile */}
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
                <svg
                  className={`w-4 h-4 text-gray-600 transition ${showProfileMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 md:w-48 top-20 md:top-full md:mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 mx-3 md:mx-0">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-medium text-slate-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.role}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </button>

                  <div className="border-t border-gray-200 my-2" />

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

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 sm:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="inline-flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading report details...</p>
            </div>
          </div>
        ) : error || !report ? (
          <div className="bg-white rounded-3xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h2>
            <p className="text-gray-600 mb-8">{error || 'The report you are looking for does not exist.'}</p>
            <button
              onClick={() => router.push('/admin/reports')}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Status Card */}
                <div className="bg-white rounded-3xl shadow-md p-8 border-l-4 border-blue-500">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-4xl font-bold text-gray-900 mb-3">{report.title}</h2>
                      <p className="text-gray-600 text-lg leading-relaxed">{report.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</label>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updatingStatus}
                        className={`px-4 py-2 rounded-full text-sm font-bold border-2 cursor-pointer transition-all ${
                          updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                        } ${getStatusColor(report.status)} border-current`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {statusMessage && (
                        <div
                          className={`text-xs font-medium mt-2 px-3 py-1 rounded ${
                            statusMessage.type === 'success'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {statusMessage.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{report.categories?.name || 'Uncategorized'}</p>
                  </div>

                  {/* Location Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                    <p className="mt-3 text-2xl font-bold text-gray-900">{report.address || 'N/A'}</p>
                  </div>

                  {/* Reporter Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Reporter</label>
                    <p className="mt-3 text-lg font-bold text-gray-900">{report.users?.name || 'Unknown'}</p>
                    <p className="text-gray-500 text-sm">{report.users?.email || 'N/A'}</p>
                  </div>

                  {/* Date Card */}
                  <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Submitted</label>
                    <p className="mt-3 text-lg font-bold text-gray-900">
                      {new Date(report.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(report.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {/* Coordinates Card */}
                {report.latitude && report.longitude && (
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-md p-8 text-white">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90">GPS Coordinates</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm opacity-75">Latitude</p>
                        <p className="text-2xl font-bold font-mono">{report.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-75">Longitude</p>
                        <p className="text-2xl font-bold font-mono">{report.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Status and Quick Info */}
              <div className="space-y-6">
                {/* Status Info Card */}
                <div className={`rounded-3xl shadow-md p-8 text-white bg-gradient-to-br ${
                  report.status.toLowerCase() === 'new' ? 'from-blue-500 to-cyan-600' :
                  report.status.toLowerCase() === 'pending' ? 'from-amber-500 to-orange-600' :
                  report.status.toLowerCase() === 'in_progress' || report.status.toLowerCase() === 'in progress' ? 'from-blue-500 to-purple-600' :
                  report.status.toLowerCase() === 'resolved' ? 'from-green-500 to-emerald-600' :
                  'from-gray-500 to-gray-600'
                }`}>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90">Current Status</h3>
                  <p className="text-4xl font-bold mb-2">{formatStatusDisplay(report.status)}</p>
                  <p className="text-sm opacity-90">
                    {report.status.toLowerCase() === 'new' ? 'Newly submitted issue' :
                     report.status.toLowerCase() === 'pending' ? 'Awaiting review' :
                     report.status.toLowerCase() === 'in_progress' || report.status.toLowerCase() === 'in progress' ? 'Currently being worked on' :
                     report.status.toLowerCase() === 'resolved' ? 'Issue has been resolved' :
                     'Unknown status'}
                  </p>
                </div>

                {/* ID Card */}
                <div className="bg-white rounded-3xl shadow-md p-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Report ID</h3>
                  <p className="text-sm font-mono text-gray-700 break-all">{report.id}</p>
                </div>

                {/* Date Created Card */}
                <div className="bg-white rounded-3xl shadow-md p-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Date Created</h3>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(report.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {Math.floor((Date.now() - new Date(report.created_at).getTime()) / 86400000)} days ago
                  </p>
                </div>
              </div>
            </div>

            {/* Images Section */}
            {report.report_images && report.report_images.length > 0 && (
              <div className="bg-white rounded-3xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">Images</span>
                  <span className="text-lg text-gray-500">({report.report_images.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {report.report_images.map((image, index) => (
                    <div key={image.id} className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <div className="aspect-square overflow-hidden bg-gray-200 relative">
                        <img
                          src={image.image_url}
                          alt={`Report image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                      </div>
                      <div className="p-4 bg-gradient-to-b from-white to-gray-50">
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(image.uploaded_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(image.uploaded_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Comments Section */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Admin Notes
              </h3>

              {/* Add Comment Form */}
              <div className="mb-6 p-4 bg-blue-50 rounded-2xl">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Add a Note</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add notes about this report (e.g., work completed, next steps, etc.)"
                  className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                  rows={3}
                />

                {/* Image Upload Section */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2">
                    Attach Image (Optional)
                  </label>
                  {noteImagePreview ? (
                    <div className="relative inline-block mb-4">
                      <img
                        src={noteImagePreview}
                        alt="Preview"
                        className="max-w-xs h-auto rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={clearImagePreview}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 cursor-pointer hover:bg-blue-100 transition">
                      <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="text-sm text-blue-600 font-medium">Click to upload or drag image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddComment}
                    disabled={(!adminNote.trim() && !noteImage) || uploadingNote}
                    className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadingNote ? 'Adding Note...' : 'Add Note'}
                  </button>
                  {noteImagePreview && (
                    <button
                      type="button"
                      onClick={clearImagePreview}
                      className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      Clear Image
                    </button>
                  )}
                </div>
              </div>

              {/* Comments List */}
              {comments && comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.filter(comment => comment.id).map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-900 text-sm">{comment.note_text}</p>
                      {comment.image_url && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <img
                            src={comment.image_url}
                            alt={`Note image`}
                            className="max-w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                          />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(comment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-2xl text-center">
                  <p className="text-gray-500">No notes yet. Add one to keep track of progress on this report.</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                onClick={() => window.location.href = '/admin/reports'}
                className="flex-1 px-8 py-4 bg-white text-gray-900 rounded-2xl hover:bg-gray-50 transition-colors font-bold border-2 border-gray-200 hover:border-gray-300 inline-flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Issues
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-bold inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm0 0V9a2 2 0 012-2h6a2 2 0 012 2v12m-6-2h0.01" />
                </svg>
                Print Report
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
