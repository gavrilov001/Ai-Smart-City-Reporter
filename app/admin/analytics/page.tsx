'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Clock, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

interface AnalyticsData {
  totalIssues: number;
  pendingCount: number;
  inProgressCount: number;
  resolvedCount: number;
  rejectedCount: number;
  resolutionRate: number;
  lastSevenDays: Array<{
    day: string;
    count: number;
  }>;
  statusBreakdown: {
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  topCategories: Array<{
    name: string;
    count: number;
  }>;
  hotspots: Array<{
    location: string;
    count: number;
  }>;
}

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}

export default function AdminAnalyticsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    initials: 'AU',
    id: '',
    role: 'administrator',
  });

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
          id: user.id || '',
          role: user.role || 'administrator',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/analytics');
      if (response.data.status === 'success') {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const getMaxValue = (arr: Array<{ count: number }>): number => {
    return Math.max(...arr.map(item => item.count), 1);
  };

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded-3xl"></div>
    </div>
  );

  const MetricCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ComponentType<any>; color: string }) => (
    <div className={`${color} rounded-3xl shadow-md p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );

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

          <a href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-cyan-50 to-emerald-50 text-slate-900 rounded-lg font-medium border-l-4 border-cyan-500">
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
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-6 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Analytics</h1>
              <p className="text-gray-500 mt-1">Overview of reports, trends, and issue distribution</p>
            </div>

            {/* User Profile Dropdown */}
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

        {/* Page Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {loading ? (
              <>
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </>
            ) : analytics ? (
              <>
                <MetricCard
                  label="Total Issues"
                  value={analytics.totalIssues}
                  icon={BarChart3}
                  color="bg-gradient-to-br from-blue-50 to-cyan-50"
                />
                <MetricCard
                  label="Pending"
                  value={analytics.pendingCount}
                  icon={Clock}
                  color="bg-gradient-to-br from-amber-50 to-orange-50"
                />
                <MetricCard
                  label="In Progress"
                  value={analytics.inProgressCount}
                  icon={AlertCircle}
                  color="bg-gradient-to-br from-blue-50 to-purple-50"
                />
                <MetricCard
                  label="Resolved"
                  value={analytics.resolvedCount}
                  icon={CheckCircle}
                  color="bg-gradient-to-br from-green-50 to-emerald-50"
                />
                <MetricCard
                  label="Rejected"
                  value={analytics.rejectedCount}
                  icon={AlertCircle}
                  color="bg-gradient-to-br from-red-50 to-rose-50"
                />
              </>
            ) : null}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reports in Last 7 Days */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Reports in Last 7 Days</h2>
              {loading ? (
                <SkeletonLoader />
              ) : analytics && analytics.lastSevenDays.length > 0 ? (
                <div className="space-y-4">
                  {analytics.lastSevenDays.map((item, index) => {
                    const maxCount = getMaxValue(analytics.lastSevenDays);
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-12 text-sm font-medium text-gray-600 text-right">{item.day}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-end pr-3 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 20 && (
                              <span className="text-white text-xs font-bold">{item.count}</span>
                            )}
                          </div>
                        </div>
                        {percentage <= 20 && (
                          <span className="w-8 text-sm font-bold text-gray-700">{item.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Status Breakdown</h2>
              {loading ? (
                <SkeletonLoader />
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Pending */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Pending</span>
                      <span className="text-sm font-bold text-amber-700">
                        {analytics.statusBreakdown.pending > 0
                          ? Math.round(
                              (analytics.statusBreakdown.pending /
                                (analytics.statusBreakdown.pending +
                                  analytics.statusBreakdown.inProgress +
                                  analytics.statusBreakdown.resolved +
                                  analytics.statusBreakdown.rejected)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
                        style={{
                          width: `${
                            analytics.statusBreakdown.pending > 0
                              ? (analytics.statusBreakdown.pending /
                                  (analytics.statusBreakdown.pending +
                                    analytics.statusBreakdown.inProgress +
                                    analytics.statusBreakdown.resolved +
                                    analytics.statusBreakdown.rejected)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">In Progress</span>
                      <span className="text-sm font-bold text-blue-700">
                        {analytics.statusBreakdown.inProgress > 0
                          ? Math.round(
                              (analytics.statusBreakdown.inProgress /
                                (analytics.statusBreakdown.pending +
                                  analytics.statusBreakdown.inProgress +
                                  analytics.statusBreakdown.resolved +
                                  analytics.statusBreakdown.rejected)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                        style={{
                          width: `${
                            analytics.statusBreakdown.inProgress > 0
                              ? (analytics.statusBreakdown.inProgress /
                                  (analytics.statusBreakdown.pending +
                                    analytics.statusBreakdown.inProgress +
                                    analytics.statusBreakdown.resolved +
                                    analytics.statusBreakdown.rejected)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Resolved */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Resolved</span>
                      <span className="text-sm font-bold text-green-700">
                        {analytics.statusBreakdown.resolved > 0
                          ? Math.round(
                              (analytics.statusBreakdown.resolved /
                                (analytics.statusBreakdown.pending +
                                  analytics.statusBreakdown.inProgress +
                                  analytics.statusBreakdown.resolved +
                                  analytics.statusBreakdown.rejected)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                        style={{
                          width: `${
                            analytics.statusBreakdown.resolved > 0
                              ? (analytics.statusBreakdown.resolved /
                                  (analytics.statusBreakdown.pending +
                                    analytics.statusBreakdown.inProgress +
                                    analytics.statusBreakdown.resolved +
                                    analytics.statusBreakdown.rejected)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Rejected */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Rejected</span>
                      <span className="text-sm font-bold text-red-700">
                        {analytics.statusBreakdown.rejected > 0
                          ? Math.round(
                              (analytics.statusBreakdown.rejected /
                                (analytics.statusBreakdown.pending +
                                  analytics.statusBreakdown.inProgress +
                                  analytics.statusBreakdown.resolved +
                                  analytics.statusBreakdown.rejected)) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                        style={{
                          width: `${
                            analytics.statusBreakdown.rejected > 0
                              ? (analytics.statusBreakdown.rejected /
                                  (analytics.statusBreakdown.pending +
                                    analytics.statusBreakdown.inProgress +
                                    analytics.statusBreakdown.resolved +
                                    analytics.statusBreakdown.rejected)) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Bottom Row - Categories and Hotspots */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Top Categories</h2>
              {loading ? (
                <SkeletonLoader />
              ) : analytics && analytics.topCategories.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topCategories.map((category, index) => {
                    const maxCount = getMaxValue(analytics.topCategories);
                    const percentage = (category.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-24 text-sm font-medium text-gray-600 truncate">
                          {category.name}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-end pr-3 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 20 && (
                              <span className="text-white text-xs font-bold">{category.count}</span>
                            )}
                          </div>
                        </div>
                        {percentage <= 20 && (
                          <span className="w-8 text-sm font-bold text-gray-700">{category.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>

            {/* Issue Hotspots */}
            <div className="bg-white rounded-3xl shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Issue Hotspots</h2>
              {loading ? (
                <SkeletonLoader />
              ) : analytics && analytics.hotspots.length > 0 ? (
                <div className="space-y-4">
                  {analytics.hotspots.map((hotspot, index) => {
                    const maxCount = getMaxValue(analytics.hotspots);
                    const percentage = (hotspot.count / maxCount) * 100;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <span className="w-24 text-sm font-medium text-gray-600 truncate">
                          {hotspot.location}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-end pr-3 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 20 && (
                              <span className="text-white text-xs font-bold">{hotspot.count}</span>
                            )}
                          </div>
                        </div>
                        {percentage <= 20 && (
                          <span className="w-8 text-sm font-bold text-gray-700">{hotspot.count}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
