'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-900 flex items-center justify-center">
      {/* Empty loading state - redirects immediately */}
    </div>
  );
}
