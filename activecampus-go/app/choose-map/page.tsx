'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ChooseMapPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Wait for auth to be ready before making decisions
  useEffect(() => {
    // Give auth state time to initialize
    const initTimer = setTimeout(() => {
      setIsReady(true);
    }, 500); // Wait 500ms for auth state to settle

    return () => clearTimeout(initTimer);
  }, []);

  // Redirect to login if not authenticated (only after ready)
  useEffect(() => {
    if (!isReady) return; // Don't check until ready
    
    console.log('ChooseMap: Auth check -', { loading, hasUser: !!user, isReady });
    
    if (!loading && !user) {
      console.log('ChooseMap: No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, isReady, router]);

  // Show loading state while auth is initializing or still loading
  if (!isReady || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Choose Your Campus
          </h1>
          <p className="text-xl text-gray-600">
            Select a campus to start your adventure
          </p>
        </div>

        {/* Campus Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* PUP Sta Mesa Campus - Available */}
          <button
            onClick={() => router.push('/dashboard')}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden h-full flex flex-col"
          >
            {/* Background Gradient - Changed to maroon */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative p-8 flex flex-col flex-1">
              {/* PUP Icon - Fixed height container */}
              <div className="mb-4 flex justify-center transform group-hover:scale-110 transition-transform duration-300 h-28 items-center">
                <Image
                  src="/icons/pup-logo.svg"
                  alt="PUP Logo"
                  width={96}
                  height={96}
                  className="object-contain"
                />
              </div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                PUP Sta Mesa
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-600 group-hover:text-red-100 transition-colors duration-300 mb-4">
                Main Campus
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 group-hover:bg-white text-green-700 group-hover:text-green-600 rounded-full text-sm font-semibold transition-colors duration-300 self-start">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Available Now
              </div>
              
              {/* Arrow Icon */}
              <div className="absolute top-8 right-8 text-gray-400 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>

          {/* Coming Soon Campus */}
          <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden opacity-60 cursor-not-allowed h-full flex flex-col">
            {/* Disabled Overlay */}
            <div className="absolute inset-0 bg-gray-900 opacity-5 z-10"></div>
            
            {/* Content */}
            <div className="relative p-8 flex flex-col flex-1">
              {/* Coming Soon Icon - Fixed height container to match PUP icon */}
              <div className="mb-4 flex justify-center grayscale h-28 items-center">
                <Image
                  src="/icons/coming-soon.svg"
                  alt="Coming Soon"
                  width={110}
                  height={110}
                  className="object-contain"
                />
              </div>
              
              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-400 mb-2">
                More Campuses
              </h2>
              
              {/* Subtitle */}
              <p className="text-gray-400 mb-4">
                Expanding Soon
              </p>
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm font-semibold self-start">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                Coming Soon
              </div>
              
              {/* Lock Icon */}
              <div className="absolute top-8 right-8 text-gray-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 text-center">
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}