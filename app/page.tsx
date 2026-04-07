'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);
        // Redirect based on user role
        if (userData.role === 'administrator') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch {
        // If parsing fails, redirect to login
        setLoading(false);
        router.push('/login');
      }
    } else {
      // No user found, redirect to login
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-900">
      {/* Navigation Bar */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">SC</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Smart City Dashboard</h1>
          </div>
          <div className="text-cyan-400 text-sm font-medium">
            {loading ? 'Loading...' : user ? `Welcome, ${user.name}` : 'Redirecting...'}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AI Smart City Dashboard
          </h2>
          <p className="text-xl text-cyan-300 max-w-2xl">
            Monitor, manage, and resolve city issues with real-time data, analytics, and intelligent insights. 
            Empowering urban communities through technology.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {/* Stat Card Component */}
          {[
            {
              icon: AlertCircle,
              title: 'Active Reports',
              value: '—',
              color: 'from-orange-500 to-red-500',
              desc: 'Issues awaiting action'
            },
            {
              icon: Clock,
              title: 'Pending Review',
              value: '—',
              color: 'from-yellow-500 to-orange-500',
              desc: 'Under review'
            },
            {
              icon: BarChart3,
              title: 'In Progress',
              value: '—',
              color: 'from-blue-500 to-cyan-500',
              desc: 'Being addressed'
            },
            {
              icon: CheckCircle,
              title: 'Resolved',
              value: '—',
              color: 'from-green-500 to-emerald-500',
              desc: 'Completed issues'
            }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-300 text-sm font-medium mb-2">{stat.title}</h3>
                <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Reports Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-cyan-400" />
              <h3 className="text-xl font-bold text-white">Recent Reports</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Load real reports from your database</p>
                <p className="text-gray-500 text-xs mt-2">Reports will appear here when you log in</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-gray-400 text-sm">Real-time issue tracking</p>
                <p className="text-gray-500 text-xs mt-2">Connect to your API to display live data</p>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-emerald-400" />
              <h3 className="text-xl font-bold text-white">City Issues Map</h3>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 rounded-lg h-48 flex items-center justify-center border border-cyan-500/20">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Interactive map placeholder</p>
                <p className="text-gray-500 text-xs mt-2">Google Maps integration coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Analytics & Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Reports This Week', value: '—', icon: '📊' },
              { label: 'Average Resolution Time', value: '—', icon: '⏱️' },
              { label: 'Citizen Satisfaction', value: '—', icon: '⭐' }
            ].map((metric, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="text-2xl mb-2">{metric.icon}</div>
                <p className="text-gray-400 text-sm mb-2">{metric.label}</p>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            {loading ? 'Initializing your dashboard...' : 'Ready to explore your Smart City data?'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => router.push('/register')}
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-cyan-500/50 hover:bg-white/20 transition-all duration-300"
            >
              Create Account
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-black/20 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">About</h4>
              <p className="text-gray-400 text-sm">
                Smart City Reporter helps communities report and resolve urban issues efficiently.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Features</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="hover:text-cyan-400 cursor-pointer">Real-time Reporting</li>
                <li className="hover:text-cyan-400 cursor-pointer">Analytics Dashboard</li>
                <li className="hover:text-cyan-400 cursor-pointer">City Mapping</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li className="hover:text-cyan-400 cursor-pointer">Documentation</li>
                <li className="hover:text-cyan-400 cursor-pointer">Contact Us</li>
                <li className="hover:text-cyan-400 cursor-pointer">FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/20 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 Smart City Reporter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
