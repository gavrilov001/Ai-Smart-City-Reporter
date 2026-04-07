'use client';

import React, { useState, useEffect } from 'react';
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

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
    }
  }, [reportId]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Report Details</h1>
                <p className="text-gray-500 text-sm mt-1">Complete view of the submitted issue</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">{userProfile.initials}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
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
              onClick={() => window.history.back()}
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
      </main>
    </div>
  );
}
