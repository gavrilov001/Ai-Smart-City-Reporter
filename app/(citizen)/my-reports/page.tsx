'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'pending' | 'in_progress' | 'in progress' | 'resolved';
  category_id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  image_url?: string;
  user_id: string;
  categories?: {
    id: string;
    name: string;
  };
  report_images?: Array<{
    id: string;
    image_url: string;
  }>;
}

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'resolved';

export default function MyReportsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    initials: '?',
    id: '',
    role: 'Citizen',
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from localStorage
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
          id: user.id || '',
          role: 'Citizen',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/api/reports');

        if (response.data.status === 'success' && response.data.data) {
          // Filter reports to only show the logged-in user's reports
          const userReports = response.data.data.filter(
            (report: Report) => report.user_id === userProfile.id
          );
          setReports(userReports);
        } else {
          setError('Failed to fetch reports');
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to load reports. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile.id) {
      fetchReports();
    }
  }, [userProfile.id]);

  // Filter reports based on active filter
  useEffect(() => {
    let filtered = reports;

    if (activeFilter === 'pending') {
      filtered = reports.filter(
        r => r.status === 'new' || r.status === 'pending'
      );
    } else if (activeFilter === 'in_progress') {
      filtered = reports.filter(
        r => r.status === 'in_progress' || r.status === 'in progress'
      );
    } else if (activeFilter === 'resolved') {
      filtered = reports.filter(r => r.status === 'resolved');
    }

    setFilteredReports(filtered);
  }, [reports, activeFilter]);

  const getCounts = () => {
    return {
      all: reports.length,
      pending: reports.filter(
        r => r.status === 'new' || r.status === 'pending'
      ).length,
      in_progress: reports.filter(
        r => r.status === 'in_progress' || r.status === 'in progress'
      ).length,
      resolved: reports.filter(r => r.status === 'resolved').length,
    };
  };

  const counts = getCounts();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar Navigation - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">Smart City</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          <a
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
            <span>Dashboard</span>
          </a>

          <a
            href="/create-report"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            <span>Report Issue</span>
          </a>

          <a
            href="/my-reports"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-50/70 text-teal-700 font-medium transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            </svg>
            <span>My Reports</span>
          </a>
        </nav>

        {/* Bottom Settings Link */}
        <div className="p-4 border-t border-gray-200">
          <a
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.14,12.94c.04-.3.06-.61.06-.94c0-.32-.02-.64-.07-.94l1.72-1.34c.15-.12.19-.34.1-.51l-1.63-2.82c-.12-.22-.37-.29-.59-.22l-2.03.81c-.42-.32-.86-.58-1.35-.78L14.5,2.81c-.04-.25-.25-.43-.5-.43h-3.26c-.25,0-.46.18-.49.43L9.25,5.35C8.75,5.54,8.32,5.81,7.97,6.16l-2.03-.81c-.22-.09-.47,0-.59.22L3.72,8.4c-.1.16-.06.39.1.51l1.72,1.34C5.08,10.36,5.06,10.67,5.06,11c0,.33.02,.64.07,.94l-1.72,1.34c-.15.12-.19.34-.1.51l1.63,2.82c.12.22.37.29.59.22l2.03-.81c.42.32.86.58,1.35.78l.3,2.16c.04.25.25.43.5.43h3.26c.25,0,.46-.18.49-.43l.3-2.16c.5-.2.93-.46,1.35-.78l2.03.81c.22.09.47,0,.59-.22l1.63-2.82c.1-.16.06-.39-.1-.51l-1.72-1.34zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
            </svg>
            <span>Settings</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Reports</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Track your submitted issues and their status
              </p>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2 transition"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {userProfile.initials}
                  </span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {/* Profile Info */}
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="font-medium text-slate-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.role}</p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Can add settings page later
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      // Can add help/support page later
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Help & Support
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-2" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition flex items-center gap-2 text-red-600 font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-8">
          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  Your Submitted Reports
                </h2>
                <p className="text-gray-500 text-sm sm:text-base">
                  {counts.all} total {counts.all === 1 ? 'report' : 'reports'}
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/create-report'}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Report New Issue
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="mb-8 bg-gray-50 rounded-xl p-1 inline-flex gap-2">
              {[
                { key: 'all' as FilterType, label: 'All', count: counts.all },
                { key: 'pending' as FilterType, label: 'Pending', count: counts.pending },
                { key: 'in_progress' as FilterType, label: 'In Progress', count: counts.in_progress },
                { key: 'resolved' as FilterType, label: 'Resolved', count: counts.resolved },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeFilter === tab.key
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-gray-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label} <span className="text-xs">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Reports List */}
            {loading ? (
              <SkeletonLoader />
            ) : error ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-red-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4v2m0 0v2m0-6v-2m0 0v-2m0 4H9m3 0h3"
                  />
                </svg>
                <p className="text-slate-900 font-medium mb-2">Failed to load reports</p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-slate-900 font-medium mb-2">No reports found</p>
                <p className="text-gray-500 text-sm">
                  {activeFilter === 'all'
                    ? 'You haven\'t submitted any reports yet'
                    : `You don't have any ${activeFilter.replace('_', ' ')} reports`}
                </p>
                <button
                  onClick={() => window.location.href = '/create-report'}
                  className="mt-4 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                >
                  Create Your First Report
                </button>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-gray-200">
                {filteredReports.map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
}

function ReportCard({ report }: ReportCardProps) {
  const getStatusBadgeClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'in_progress':
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
      case 'pending':
        return 'Pending';
      case 'in_progress':
      case 'in progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getThumbnail = () => {
    if (report.report_images && report.report_images.length > 0) {
      return report.report_images[0].image_url;
    }
    return null;
  };

  return (
    <div className="py-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Thumbnail Image */}
        <div className="flex-shrink-0">
          {getThumbnail() ? (
            <img
              src={getThumbnail() as string}
              alt={report.title}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {report.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {report.description}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-3 items-center text-sm">
            {/* Location */}
            <div className="flex items-center gap-1 text-gray-600">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
              </svg>
              <span className="truncate max-w-xs">{report.address}</span>
            </div>

            {/* Category */}
            {report.categories && (
              <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                {report.categories.name}
              </span>
            )}

            {/* Date */}
            <span className="text-gray-500">{formatDate(report.created_at)}</span>

            {/* AI Confidence Placeholder */}
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              AI: {Math.floor(Math.random() * 40 + 60)}% confidence
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex-shrink-0 flex flex-col gap-2 sm:items-end w-full sm:w-auto">
          {/* Status Badge */}
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold inline-block text-center ${getStatusBadgeClasses(
              report.status
            )}`}
          >
            {getStatusLabel(report.status)}
          </span>

          {/* View Button */}
          <button
            onClick={() => window.location.href = `/report/${report.id}`}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 justify-center font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="py-4 border-b border-gray-200 animate-pulse">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-3 min-w-0">
              <div className="h-5 bg-gray-300 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="flex gap-2 mt-3">
                <div className="h-6 bg-gray-300 rounded-full w-20" />
                <div className="h-6 bg-gray-300 rounded-full w-20" />
                <div className="h-6 bg-gray-300 rounded-full w-20" />
              </div>
            </div>
            <div className="flex-shrink-0 space-y-2 w-full sm:w-auto">
              <div className="h-8 bg-gray-300 rounded-full w-24" />
              <div className="h-8 bg-gray-300 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
