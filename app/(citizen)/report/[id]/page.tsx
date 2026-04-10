'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

interface Comment {
  id: string;
  admin_id: string;
  comment: string;
  created_at: string;
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

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

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const fetchComments = async () => {
    if (!reportId) return;
    try {
      setLoadingComments(true);
      const response = await axios.get(`/api/reports/${reportId}/comments`);
      if (response.data.status === 'success') {
        setComments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
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
          // Fetch comments after report is loaded
          await fetchComments();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => window.location.href = '/my-reports'}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <span className="mr-2">←</span>
            Back to Reports
          </button>
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-red-600 text-lg">{error || 'Report not found'}</p>
            <button
              onClick={() => router.push('/my-reports')}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to My Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/my-reports'}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
        >
          <span className="mr-2">←</span>
          Back to Reports
        </button>

        {/* Main Report Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{report.title}</h1>
                <p className="text-blue-100">Report ID: {report.id}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
                  report.status
                )}`}
              >
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
                  {/* Main Image */}
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

                  {/* Thumbnail Gallery */}
                  {report.report_images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {report.report_images.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(img.image_url)}
                          className={`relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                            selectedImage === img.image_url
                              ? 'border-blue-600'
                              : 'border-gray-300'
                          }`}
                        >
                          <Image
                            src={img.image_url}
                            alt="Thumbnail"
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Report Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Category */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Category
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {report.categories?.name || 'Uncategorized'}
                </p>
                {report.categories?.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {report.categories.description}
                  </p>
                )}
              </div>

              {/* Submitted By */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Submitted By
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {report.users?.name || 'Anonymous'}
                </p>
                <p className="text-gray-600 text-sm">{report.users?.email}</p>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Location
                </h3>
                <p className="text-gray-900 font-medium">{report.address}</p>
                {report.latitude && report.longitude && (
                  <p className="text-gray-600 text-sm mt-1">
                    {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Confidence Score */}
              {report.ai_confidence !== null && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    AI Confidence
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(report.ai_confidence || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {Math.round((report.ai_confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Created
                </h3>
                <p className="text-gray-900">
                  {formatDate(report.created_at)}
                </p>
              </div>

              {/* Last Updated */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                  Last Updated
                </h3>
                <p className="text-gray-900">
                  {formatDate(report.updated_at)}
                </p>
              </div>
            </div>

            {/* Resolution Notes Section */}
            {comments && comments.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h2 className="text-xl font-bold mb-6 text-gray-900">Resolution Updates</h2>
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-blue-600 bg-white p-5 rounded-lg shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {comment.admin?.name || 'Administrator'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-8 border-t">
              <button
                onClick={() => window.location.href = '/my-reports'}
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
    </div>
  );
}
