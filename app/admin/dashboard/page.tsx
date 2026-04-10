'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}

interface StatCard {
  label: string;
  value: number;
  change?: string;
  changeType?: 'positive' | 'urgent' | 'active' | 'percentage';
  icon?: string;
}

interface AnalyticsData {
  weeklyTrend: Array<{
    day: string;
    submitted: number;
    resolved: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  totalReports: number;
  pendingReviews: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  activeCitizens: number;
  avgResponseTime: string;
  thisWeek: number;
}

// Initial empty state - no mock data
const EMPTY_ANALYTICS: AnalyticsData = {
  weeklyTrend: [],
  statusDistribution: [],
  totalReports: 0,
  pendingReviews: 0,
  inProgress: 0,
  resolved: 0,
  rejected: 0,
  activeCitizens: 0,
  avgResponseTime: '0 hours',
  thisWeek: 0,
};

export default function AdminDashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    initials: 'AU',
    id: '',
    role: 'administrator',
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted on client
    setIsMounted(true);

    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Admin Dashboard - User:', user);
        console.log('Admin Dashboard - User role:', user.role);
        console.log('Admin Dashboard - Is admin?', user.role === 'administrator');
        
        // Check if user is admin
        if (user.role !== 'administrator') {
          console.log('Redirecting to citizen dashboard');
          // Redirect non-admin users to dashboard
          window.location.href = '/dashboard';
          return;
        }
        
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
          id: user.id || '',
          role: user.role || 'administrator',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
        window.location.href = '/login';
      }
    } else {
      // No user found, redirect to login
      window.location.href = '/login';
    }

    // Fetch analytics data
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/stats');
      if (response.data.status === 'success') {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Keep using mock data on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    // Clear the userRole cookie
    document.cookie = 'userRole=; path=/; max-age=0';
    window.location.href = '/login';
  };

  const StatCard = ({ label, value, change, changeType, icon }: StatCard) => {
    const getBgColor = () => {
      switch (changeType) {
        case 'positive':
          return 'from-green-50 to-emerald-50';
        case 'urgent':
          return 'from-orange-50 to-red-50';
        case 'active':
          return 'from-blue-50 to-cyan-50';
        case 'percentage':
          return 'from-emerald-50 to-green-50';
        default:
          return 'from-white to-slate-50';
      }
    };

    const getChangeColor = () => {
      switch (changeType) {
        case 'positive':
          return 'text-green-600 bg-green-100';
        case 'urgent':
          return 'text-orange-600 bg-orange-100';
        case 'active':
          return 'text-blue-600 bg-blue-100';
        case 'percentage':
          return 'text-emerald-600 bg-emerald-100';
        default:
          return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div className={`bg-gradient-to-br ${getBgColor()} rounded-3xl shadow-md p-6 hover:shadow-lg transition-shadow`}>
        {change && (
          <div className="flex items-start justify-between mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getChangeColor()}`}>
              {change}
            </span>
          </div>
        )}
        <p className="text-gray-600 text-sm font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo Section */}
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

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-2">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-emerald-50 text-slate-900 rounded-lg font-medium border-l-4 border-cyan-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m2-3l6-3m6 3l2 3m-2 3l-6 3m-6-3l-2-3m2-3l6-3m6 3l2 3m-2 3l-6 3" />
            </svg>
            Dashboard
          </a>

          <a
            href="/admin/reports"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Manage Issues
          </a>

          <a
            href="/admin/analytics"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </a>

          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 8.048M12 4.354L8.646 7.708m6.708 0L12 4.354m0 8.048l3.354 3.354m-6.708 0L5.646 12.402M12 20.5c-4.418 0-8-1.79-8-4s3.582-4 8-4 8 1.79 8 4-3.582 4-8 4z" />
            </svg>
            User Management
          </a>
        </nav>

        {/* Settings */}
        <div className="p-6 border-t border-gray-200">
          <a
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            Settings
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-gray-500 mt-1">System overview and analytics</p>
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
                <div className="fixed md:absolute left-0 right-0 md:left-auto md:right-0 md:w-48 top-20 md:top-full md:mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 mx-3 md:mx-0">
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
        <div className="p-6 sm:p-8">
          {isMounted && loading ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading analytics data...</p>
              </div>
            </div>
          ) : (
            <>
          {/* Key Metrics - Primary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Total Reports"
              value={analytics.totalReports}
              change={`+${analytics.thisWeek} this week`}
              changeType="positive"
            />
            <StatCard
              label="Pending Review"
              value={analytics.pendingReviews}
              change="Urgent"
              changeType="urgent"
            />
            <StatCard
              label="In Progress"
              value={analytics.inProgress}
              change="Active"
              changeType="active"
            />
            <StatCard
              label="Resolved"
              value={analytics.resolved}
              change="20%"
              changeType="percentage"
            />
            <StatCard
              label="Rejected"
              value={analytics.rejected}
              change={analytics.rejected > 0 ? `${analytics.rejected} issues` : 'None'}
              changeType="urgent"
            />
          </div>

          {/* Secondary Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Active Citizens</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.activeCitizens.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Avg Response Time</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.avgResponseTime}</p>
            </div>
            <div className="bg-white rounded-3xl shadow-md p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">Reports This Week</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.thisWeek}</p>
            </div>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Trend Chart */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Weekly Trend</h2>
                <p className="text-sm text-gray-500 mt-1">Reports submitted vs resolved</p>
              </div>
              {/* Dynamic SVG Area Chart */}
              {analytics.weeklyTrend && analytics.weeklyTrend.length > 0 ? (
                <>
                  <svg width="100%" height="300" viewBox="0 0 500 250" className="mb-4">
                    {/* Grid lines */}
                    <line x1="40" y1="220" x2="480" y2="220" stroke="#E5E7EB" strokeWidth="1" />
                    
                    {/* Y-axis labels */}
                    <text x="30" y="225" fontSize="12" fill="#9CA3AF" textAnchor="end">0</text>
                    <text x="30" y="165" fontSize="12" fill="#9CA3AF" textAnchor="end">12</text>
                    <text x="30" y="105" fontSize="12" fill="#9CA3AF" textAnchor="end">24</text>
                    
                    {(() => {
                      // Calculate max value for scaling
                      const maxValue = Math.max(
                        ...analytics.weeklyTrend.map(d => Math.max(d.submitted, d.resolved || 0)),
                        24 // Min scale
                      );
                      
                      // Calculate points for both lines
                      const chartWidth = 440; // x: 40 to 480
                      const chartHeight = 220; // y: 0 to 220
                      const pointSpacing = chartWidth / (analytics.weeklyTrend.length - 1 || 1);
                      
                      const submittedPoints = analytics.weeklyTrend
                        .map((d, i) => {
                          const x = 40 + (i * pointSpacing);
                          const y = 220 - (d.submitted / maxValue) * chartHeight;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      
                      const resolvedPoints = analytics.weeklyTrend
                        .map((d, i) => {
                          const x = 40 + (i * pointSpacing);
                          const y = 220 - ((d.resolved || 0) / maxValue) * chartHeight;
                          return `${x},${y}`;
                        })
                        .join(' ');
                      
                      // Create closed paths for filled areas
                      const submittedArea = submittedPoints + ' 480,220 40,220';
                      const resolvedArea = resolvedPoints + ' 480,220 40,220';
                      
                      return (
                        <>
                          {/* Defs for gradients */}
                          <defs>
                            <linearGradient id="submittedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="resolvedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          
                          {/* Area fills */}
                          <polyline 
                            points={submittedArea}
                            fill="url(#submittedGradient)"
                          />
                          <polyline 
                            points={resolvedArea}
                            fill="url(#resolvedGradient)"
                          />
                          
                          {/* Lines */}
                          <polyline 
                            points={submittedPoints}
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          <polyline 
                            points={resolvedPoints}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="2"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                          />
                          
                          {/* X-axis labels */}
                          {analytics.weeklyTrend.map((day, i) => (
                            <text 
                              key={day.day}
                              x={40 + (i * pointSpacing)} 
                              y="240" 
                              fontSize="12" 
                              fill="#9CA3AF" 
                              textAnchor="middle"
                            >
                              {day.day}
                            </text>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  
                  {/* Legend */}
                  <div className="flex gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Submitted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Resolved</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-72 flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">No trend data available</p>
                </div>
              )}
            </div>

            {/* Status Distribution Chart */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Status Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Current report statuses</p>
              </div>
              
              {/* Simple Pie Chart using SVG */}
              <div className="flex items-center justify-center mb-6">
                {analytics.statusDistribution.length > 0 ? (
                  <svg width="250" height="250" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle cx="100" cy="100" r="90" fill="none" stroke="#E5E7EB" strokeWidth="40" />
                    
                    {(() => {
                      const total = analytics.statusDistribution.reduce((sum, item) => sum + item.value, 0);
                      let currentAngle = -90;
                      
                      return analytics.statusDistribution.map((item, index) => {
                        const percentage = total > 0 ? item.value / total : 0;
                        const circumference = 70 * 2 * Math.PI;
                        const strokeDasharray = circumference * percentage;
                        const sliceAngle = 360 * percentage;
                        
                        const slice = (
                          <circle
                            key={item.name}
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="40"
                            strokeDasharray={`${strokeDasharray} ${circumference}`}
                            transform={`rotate(${currentAngle} 100 100)`}
                          />
                        );
                        
                        currentAngle += sliceAngle;
                        return slice;
                      });
                    })()}
                  </svg>
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-full">
                    <p className="text-gray-500 text-sm">No data available</p>
                  </div>
                )}
              </div>
              
              {/* Custom Legend */}
              <div className="space-y-3">
                {analytics.statusDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
