'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  category_id: string;
  user_id: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  created_at: string;
  updated_at: string;
  ai_confidence: number | null;
  categories: {
    id: string;
    name: string;
    description: string;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  report_images: Array<{
    id: string;
    image_url: string;
    uploaded_at: string;
  }>;
}

interface UserProfile {
  name: string;
  initials: string;
  role: string;
  id: string;
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

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comments, setComments] = useState<AdminNote[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Loading...',
    initials: '?',
    role: 'Citizen',
    id: '',
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const nameParts = user.email?.split('@')[0] || user.name || 'User';
        const initials = (user.name || nameParts)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        setUserProfile({
          name: user.name || nameParts,
          initials: initials || '?',
          role: user.role === 'administrator' ? 'Administrator' : 'Citizen',
          id: user.id || '',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchReport();
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

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports`);

      if (response.data.status === 'success' && response.data.data) {
        const foundReport = response.data.data.find(
          (r: Report) => r.id === reportId
        );

        if (foundReport) {
          setReport(foundReport);
          if (foundReport.report_images && foundReport.report_images.length > 0) {
            setSelectedImage(foundReport.report_images[0].image_url);
          }
          // Load comments after report is loaded
          loadComments();
        } else {
          setError('Report not found');
        }
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return 'In Progress';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col"></aside>
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading report...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">Smart City</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a href="/create-report" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Create Report</span>
          </a>

          <a href="/my-reports" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-50/70 text-teal-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            </svg>
            <span>My Reports</span>
          </a>

          <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94 0 .32.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.1.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.12-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
            <span>Settings</span>
          </a>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition group">
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Report Details</h1>
                <p className="text-gray-500 text-sm mt-1">View your submitted report</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
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
                      router.push('/settings');
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
          {error || !report ? (
            <div className="bg-white rounded-3xl shadow-md p-12 text-center max-w-2xl mx-auto">
              <p className="text-red-600 text-lg mb-6">{error || 'Report not found'}</p>
              <button
                onClick={() => router.push('/my-reports')}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Reports
              </button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Report Card */}
              <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                {/* Status Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
                      <p className="text-blue-100">Report ID: {report.id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  {/* Images Section */}
                  {report.report_images && report.report_images.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4">Images</h2>
                      <div className="space-y-4">
                        {selectedImage && (
                          <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                            <Image
                              src={selectedImage}
                              alt="Report image"
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
                              className="object-cover"
                              priority
                            />
                          </div>
                        )}

                        {report.report_images.length > 1 && (
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {report.report_images.map((img) => (
                              <button
                                key={img.id}
                                onClick={() => setSelectedImage(img.image_url)}
                                className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                                  selectedImage === img.image_url ? 'border-blue-600' : 'border-gray-300'
                                }`}
                              >
                                <Image src={img.image_url} alt="Thumbnail" fill sizes="96px" className="object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-8">
                    <h2 className="text-xl font-bold mb-3 text-gray-900">Description</h2>
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{report.description}</p>
                  </div>

                  {/* Admin Comments */}
                  {comments && comments.length > 0 && (
                    <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                      <h2 className="text-xl font-bold mb-4 text-gray-900">Admin Notes</h2>
                      <div className="space-y-4">
                        {comments.filter(comment => comment.id).map((comment) => (
                          <div key={comment.id} className="bg-white p-4 rounded-lg border border-blue-100">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-semibold text-blue-700">Administrator</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{comment.note_text}</p>
                            {comment.image_url && (
                              <div className="mt-3 rounded-lg overflow-hidden">
                                <img
                                  src={comment.image_url}
                                  alt={`Admin note image`}
                                  className="max-w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h3>
                      <p className="text-lg font-semibold text-gray-900">{report.categories?.name || 'Uncategorized'}</p>
                      {report.categories?.description && <p className="text-gray-600 text-sm mt-1">{report.categories.description}</p>}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Submitted By</h3>
                      <p className="text-lg font-semibold text-gray-900">{report.users?.name || 'Anonymous'}</p>
                      <p className="text-gray-600 text-sm">{report.users?.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</h3>
                      <p className="text-gray-900 font-medium">{report.address}</p>
                      {report.latitude && report.longitude && (
                        <p className="text-gray-600 text-sm mt-1">
                          {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>

                    {report.ai_confidence !== null && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">AI Confidence</h3>
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(report.ai_confidence || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{Math.round((report.ai_confidence || 0) * 100)}%</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Created</h3>
                      <p className="text-gray-900">{formatDate(report.created_at)}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Updated</h3>
                      <p className="text-gray-900">{formatDate(report.updated_at)}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4 pt-8 border-t">
                    <button
                      onClick={() => router.push('/my-reports')}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Back to My Reports
                    </button>
                    <button
                      onClick={() => router.push('/create-report')}
                      className="flex-1 px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
                    >
                      Report New Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
