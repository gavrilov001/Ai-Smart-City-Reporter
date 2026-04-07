'use client';

import React, { useState, useEffect } from 'react';
import ReportsMap from '@/src/components/ReportsMap';

export default function CitizenDashboard() {
  const [userProfile, setUserProfile] = useState({
    name: 'Loading...',
    initials: '?',
    role: 'Citizen',
    id: '',
  });

  const [stats, setStats] = useState([
    {
      label: 'Total Reports',
      count: '0',
      subtitle: 'All time',
      bgColor: 'bg-white',
      iconColor: 'text-teal-600',
    },
    {
      label: 'Pending',
      count: '0',
      subtitle: 'Awaiting review',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
    {
      label: 'In Progress',
      count: '0',
      subtitle: 'Being resolved',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-blue-500',
    },
    {
      label: 'Resolved',
      count: '0',
      subtitle: 'Successfully fixed',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reports');
        const data = await response.json();

        if (data.status === 'success' && data.data) {
          const reports = data.data;
          
          // Count reports by status (for logged-in user only)
          const userReports = reports.filter(
            (report: any) => report.user_id === userProfile.id
          );
          
          const totalReports = userReports.length;
          const pendingCount = userReports.filter(
            (r: any) => r.status === 'new' || r.status === 'pending'
          ).length;
          const inProgressCount = userReports.filter(
            (r: any) => r.status === 'in_progress' || r.status === 'in progress'
          ).length;
          const resolvedCount = userReports.filter(
            (r: any) => r.status === 'resolved'
          ).length;

          setStats([
            {
              label: 'Total Reports',
              count: totalReports.toString(),
              subtitle: 'All time',
              bgColor: 'bg-white',
              iconColor: 'text-teal-600',
            },
            {
              label: 'Pending',
              count: pendingCount.toString(),
              subtitle: 'Awaiting review',
              bgColor: 'bg-amber-50',
              iconColor: 'text-amber-500',
            },
            {
              label: 'In Progress',
              count: inProgressCount.toString(),
              subtitle: 'Being resolved',
              bgColor: 'bg-cyan-50',
              iconColor: 'text-blue-500',
            },
            {
              label: 'Resolved',
              count: resolvedCount.toString(),
              subtitle: 'Successfully fixed',
              bgColor: 'bg-emerald-50',
              iconColor: 'text-emerald-500',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile.id) {
      fetchReports();
    }
  }, [userProfile.id]);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  const mapPins = [
    { status: 'pending', count: 2, color: '#FBBF24' },
    { status: 'in-progress', count: 2, color: '#3B82F6' },
    { status: 'resolved', count: 1, color: '#10B981' },
  ];

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
            href="#"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-50/70 text-teal-700 font-medium transition-colors"
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">Welcome back, {userProfile.name}</p>
            </div>

            {/* User Profile with Dropdown */}
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
        <div className="p-4 sm:p-8 space-y-8">
          {/* Stat Cards Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={`${stat.bgColor} rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </h3>
                  <div className={`w-10 h-10 rounded-lg ${stat.iconColor} opacity-20 flex items-center justify-center`}>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                    </svg>
                  </div>
                </div>
                <div className="mb-2">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {stat.count}
                  </p>
                </div>
                <p className="text-gray-500 text-xs font-medium">
                  {stat.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Action Banner */}
          <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Report a New Issue
              </h2>
              <p className="text-white/90 text-sm sm:text-base">Help improve your community</p>
            </div>
            <button 
              onClick={() => window.location.href = '/create-report'}
              className="bg-white text-teal-600 font-semibold px-6 py-3 rounded-full hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Create Report
            </button>
          </div>

          {/* Issues Map Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
                Issues Map - North Macedonia
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Geographic distribution of reported issues across the country
              </p>
            </div>

            {/* Google Maps Component */}
            <ReportsMap />
          </div>
        </div>
      </main>
    </div>
  );
}
