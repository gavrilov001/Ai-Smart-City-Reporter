'use client';

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import LocationPicker from '@/src/components/LocationPicker';

interface FormData {
  title: string;
  description: string;
  category: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface ErrorNotification {
  type: 'error' | 'success';
  message: string;
}

// Helper function to find best matching category - simplified for reliability
function findBestMatchingCategory(
  aiSuggestion: string,
  categories: Array<{ id: string; name: string }>
): { id: string; name: string } | undefined {
  const suggestionLower = aiSuggestion.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  let match = categories.find(
    cat => cat.name.toLowerCase() === suggestionLower
  );
  if (match) {
    console.log('✅ Found exact match:', match.name);
    return match;
  }

  // 2. Contains match
  match = categories.find(
    cat => suggestionLower.includes(cat.name.toLowerCase()) ||
           cat.name.toLowerCase().includes(suggestionLower)
  );
  if (match) {
    console.log('✅ Found contains match:', match.name);
    return match;
  }

  // 3. Word match - split by common delimiters and check if any category contains the same words
  const suggestionWords = suggestionLower.split(/[\s\/-]+/).filter(w => w.length > 2);
  console.log('AI Suggestion words:', suggestionWords);
  
  let bestMatch: { id: string; name: string } | undefined = undefined;
  let maxMatches = 0;

  categories.forEach(cat => {
    const catLower = cat.name.toLowerCase();
    const catWords = catLower.split(/[\s\/-]+/).filter(w => w.length > 2);
    
    const matches = suggestionWords.filter(word =>
      catWords.some(cw => cw === word || cw.includes(word) || word.includes(cw))
    ).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = cat;
      console.log(`Comparing "${suggestionWords.join(' ')}" with "${catWords.join(' ')}" = ${matches} matches`);
    }
  });

  if (bestMatch) {
    const matchName = (bestMatch as { id: string; name: string }).name;
    console.log(`✅ Found word match: ${matchName} (${maxMatches} word(s))`);
    return bestMatch;
  }

  console.warn('❌ No matching category found');
  return undefined;
}

export default function CreateReportPage() {
  const [userProfile, setUserProfile] = useState({
    name: 'User',
    initials: '?',
    role: 'Citizen',
    id: '',
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    latitude: null,
    longitude: null,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<ErrorNotification | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<{
    categoryName: string;
    categoryId: string | null;
    confidence: number;
  } | null>(null);

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
          role: user.role === 'administrator' ? 'Administrator' : 'Citizen',
          id: user.id || '',
        });
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('/api/categories');
        if (response.data.status === 'success') {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Get AI suggestion from image immediately
    analyzeImageForAI(file);
  };

  const analyzeImageForAI = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/reports/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.aiPrediction) {
        const prediction = response.data.aiPrediction;
        console.log('AI Suggestion received:', prediction);
        console.log('Available categories:', categories);

        // Set the suggestion regardless of matching - user can accept or select from dropdown
        setAiSuggestion({
          categoryName: prediction.predictedCategory,
          categoryId: null, // Will be looked up when user clicks Accept
          confidence: prediction.confidence,
        });

        showNotification(
          'success',
          `✨ AI detected: ${prediction.predictedCategory} (${Math.round(prediction.confidence * 100)}% confidence)`
        );
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      // Don't show error - AI analysis is optional
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const showNotification = (type: 'error' | 'success', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    localStorage.removeItem('tokens');
    window.location.href = '/login';
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: address,
    }));
  };

  // TODO: Integrate AI classification API to auto-detect category based on description
  // Example implementation:
  // const aiClassifyCategory = async (description: string) => {
  //   try {
  //     const response = await axios.post('/api/ai/classify-category', { description });
  //     setFormData(prev => ({
  //       ...prev,
  //       category: response.data.category_id,
  //     }));
  //   } catch (error) {
  //     console.error('Error classifying category:', error);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showNotification('error', 'Please enter an issue title');
      return;
    }

    if (!formData.description.trim()) {
      showNotification('error', 'Please enter a description');
      return;
    }

    if (!formData.category) {
      showNotification('error', 'Please select a category');
      return;
    }

    if (!formData.location.trim()) {
      showNotification('error', 'Please enter a location');
      return;
    }

    if (!selectedFile) {
      showNotification('error', 'Please upload an image');
      return;
    }

    setIsLoading(true);

    try {
      // Get user ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user || !user.id) {
        showNotification('error', 'User not authenticated');
        setIsLoading(false);
        return;
      }

      // First, create the report
      const reportFormData = new FormData();
      reportFormData.append('title', formData.title);
      reportFormData.append('description', formData.description);
      reportFormData.append('category_id', formData.category);
      reportFormData.append('address', formData.location);
      reportFormData.append('user_id', user.id);

      // Add coordinates if available (can be enhanced with geocoding)
      if (formData.latitude) {
        reportFormData.append('latitude', formData.latitude.toString());
      }
      if (formData.longitude) {
        reportFormData.append('longitude', formData.longitude.toString());
      }

      // Create report
      const reportResponse = await axios.post('/api/reports/create', reportFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (reportResponse.data.status === 'success') {
        const reportId = reportResponse.data.data.id;

        // Upload image if report created successfully
        if (selectedFile) {
          const imageFormData = new FormData();
          imageFormData.append('image', selectedFile);
          imageFormData.append('report_id', reportId);

          try {
            await axios.post('/api/reports/upload-image', imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            // Continue anyway - report was created
          }
        }

        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          location: '',
          latitude: null,
          longitude: null,
        });
        setSelectedFile(null);
        setPreviewUrl(null);

        showNotification('success', 'Report submitted successfully! Thank you for helping improve our city.');

        // Redirect after success
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        showNotification('error', reportResponse.data.message || 'Failed to create report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      let errorMessage = 'Failed to submit report. Please try again.';
      
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data as { message?: string };
        errorMessage = data.message || errorMessage;
      }
      
      showNotification('error', errorMessage);
    } finally {
      setIsLoading(false);
    }
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
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-cyan-50/70 text-teal-700 font-medium transition-colors"
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
            href="#"
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Report an Issue</h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Help us improve the city by reporting problems
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
                    <p className="text-sm font-medium text-slate-900">{userProfile.name}</p>
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
        <div className="p-4 sm:p-8 flex items-center justify-center min-h-[calc(100vh-100px)]">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white font-medium transition-all z-50 ${
                notification.type === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Main Form Card */}
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-6 sm:p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Report a Problem
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Provide details about the issue you've spotted in our city
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Issue Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Pothole on Main Street"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue in detail..."
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50 resize-none"
                />
              </div>

              {/* Location with Google Maps */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <LocationPicker
                  onSelect={handleLocationSelect}
                  initialLat={formData.latitude || undefined}
                  initialLng={formData.longitude || undefined}
                  initialAddress={formData.location}
                />
              </div>

              {/* File Upload Dropzone */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Upload Image <span className="text-red-500">*</span>
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 bg-gray-50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    disabled={isLoading}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-slate-900 font-medium mb-1">
                        Drag and drop your image here
                      </p>
                      <p className="text-gray-500 text-sm">
                        or click to browse (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>

                {/* AI Suggestion Card */}
                {aiSuggestion && !formData.category && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-1">
                          ✨ AI Suggestion
                        </p>
                        <p className="text-emerald-700 font-semibold mb-3">
                          {aiSuggestion.categoryName}
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          Confidence: {Math.round(aiSuggestion.confidence * 100)}%
                        </p>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Accept clicked. aiSuggestion:', aiSuggestion);
                                console.log('All available categories:', categories);
                                const matchingCat = findBestMatchingCategory(aiSuggestion.categoryName, categories);
                                console.log('Best match found:', matchingCat);
                                
                                if (matchingCat) {
                                  console.log('✅ Setting category to:', matchingCat.id, matchingCat.name);
                                  setFormData(prev => ({
                                    ...prev,
                                    category: matchingCat.id,
                                  }));
                                  showNotification('success', `✅ Category set to: ${matchingCat.name}`);
                                  setAiSuggestion(null);
                                } else {
                                  console.warn('❌ Could not find exact match for:', aiSuggestion.categoryName);
                                  console.warn('Available categories:', categories.map(c => `"${c.name}" (${c.id})`));
                                  // Show the dropdown with the AI suggestion name visible so user can manually select the matching category
                                  showNotification('success', `💡 AI suggests: "${aiSuggestion.categoryName}". Please select the matching category from dropdown.`);
                                }
                              }}
                              className="flex-1 py-2 px-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-sm"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                console.log('Dismiss clicked - showing category dropdown');
                                setAiSuggestion(null);
                              }}
                              className="flex-1 py-2 px-3 bg-white text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors font-medium text-sm"
                            >
                              Dismiss
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">Or select from dropdown below:</p>
                          <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
                          >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(!aiSuggestion || formData.category) && (
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 mt-8 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:from-cyan-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-5 h-5 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    Submit Report
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
