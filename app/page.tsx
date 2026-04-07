'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        // Redirect based on user role
        if (userData.role === 'administrator') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      } catch {
        // If parsing fails, redirect to login
        router.push('/login');
      }
    } else {
      // No user found, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-gradient-to-br from-cyan-50 to-emerald-50 min-h-screen">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 mb-6">
          <span className="text-white font-bold text-2xl">SC</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Smart City Reporter</h1>
        <p className="text-gray-600">Redirecting you to login...</p>
      </div>
    </div>
  );
}
