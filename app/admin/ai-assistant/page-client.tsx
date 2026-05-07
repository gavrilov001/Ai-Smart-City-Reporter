'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle, MapPin, Zap } from 'lucide-react';
import axios from 'axios';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  reports?: any[];
  users?: any[];
  intent?: any;
}

interface UserProfile {
  name: string;
  initials: string;
  id: string;
  role: string;
}

const suggestedQueries = [
  { icon: MapPin, text: 'Show me all reports in Skopje', color: 'text-blue-600' },
  { icon: Zap, text: 'List pending infrastructure issues', color: 'text-amber-600' },
  { icon: MessageCircle, text: 'How many reports are in progress?', color: 'text-cyan-600' },
];

export function AdminAIChatPageClient() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Admin User',
    initials: 'AU',
    id: '',
    role: 'administrator',
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

        // Add welcome message
        setMessages([
          {
            id: '0',
            role: 'assistant',
            content:
              'Hello! I\'m your Smart City AI Assistant. I can help you search, analyze, and manage reports. Try asking me about reports in specific locations, by category, or status.',
            timestamp: new Date(),
          },
        ]);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (query?: string) => {
    const messageText = query || inputValue.trim();

    if (!messageText) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('/api/admin/ai-chat', {
        message: messageText,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: response.data.response || 'No response generated',
        timestamp: new Date(),
        reports: response.data.reports,
        users: response.data.users,
        intent: response.data.intent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content:
          'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition"
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

          <a
            href="/admin/ai-assistant"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 text-slate-900 rounded-lg font-medium border-l-4 border-purple-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Assistant
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
              <h1 className="text-3xl font-bold text-slate-900">AI Assistant</h1>
              <p className="text-gray-500 mt-1">Smart insights for your city reports</p>
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

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Welcome to AI Assistant
                  </h2>
                  <p className="text-slate-600 mb-6 max-w-sm">
                    Ask me anything about your city reports. I can help you find,
                    analyze, and understand your data.
                  </p>

                  {/* Suggested Queries */}
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 mb-3">Try asking:</p>
                    {suggestedQueries.map((query, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(query.text)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition text-left group"
                      >
                        <query.icon className={`w-5 h-5 ${query.color}`} />
                        <span className="text-slate-700 group-hover:text-slate-900 transition">
                          {query.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl px-6 py-4 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>

                      {/* Display Reports if available */}
                      {message.reports && message.reports.length > 0 && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 uppercase">
                            Related Reports ({message.reports.length})
                          </p>
                          {message.reports.slice(0, 5).map((report, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 rounded-lg overflow-hidden text-left"
                            >
                              {/* Report Image */}
                              {report.image_url && (
                                <img
                                  src={report.image_url}
                                  alt={report.title}
                                  className="w-full h-40 object-cover"
                                />
                              )}
                              <div className="p-3">
                                <h4 className="font-semibold text-sm text-slate-900">
                                  {report.title}
                                </h4>
                                <p className="text-xs text-slate-600 mt-1">
                                  📍 {report.address || report.location || 'Unknown'}
                                </p>
                                {report.description && (
                                  <p className="text-xs text-slate-700 mt-2 line-clamp-2">
                                    {report.description}
                                  </p>
                                )}
                                <div className="flex gap-2 mt-2">
                                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                    {report.categories?.name || 'Uncategorized'}
                                  </span>
                                  <span
                                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                      report.status === 'pending'
                                        ? 'bg-amber-100 text-amber-700'
                                        : report.status === 'in_progress'
                                          ? 'bg-cyan-100 text-cyan-700'
                                          : 'bg-emerald-100 text-emerald-700'
                                    }`}
                                  >
                                    {report.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {message.reports.length > 5 && (
                            <p className="text-xs text-slate-500 italic">
                              And {message.reports.length - 5} more...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Display Users if available */}
                      {message.users && message.users.length > 0 && (
                        <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                          <p className="text-xs font-semibold text-slate-600 uppercase">
                            Users ({message.users.length})
                          </p>
                          {message.users.slice(0, 5).map((user, idx) => (
                            <div
                              key={idx}
                              className="bg-slate-50 rounded-lg p-3 text-left"
                            >
                              <h4 className="font-semibold text-sm text-slate-900">
                                {user.email}
                              </h4>
                              <div className="flex gap-2 mt-2">
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                    user.email_verified
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {user.email_verified ? '✓ Verified' : '✗ Pending'}
                                </span>
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                  {user.role || 'User'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                          {message.users.length > 5 && (
                            <p className="text-xs text-slate-500 italic">
                              And {message.users.length - 5} more...
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs mt-2 opacity-70">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                        <p className="text-sm text-slate-600">Thinking...</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me about reports... (e.g., 'Show me all reports in Skopje')"
                className="flex-1 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                disabled={loading}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !inputValue.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              💡 Tip: Ask about reports by location, category, or status
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
