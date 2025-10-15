'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import introBg from '../assets/intro_bg.svg';

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
      router.push('/intro');
    }
  }, [user, loading, isReady, router]);

  // Show loading state while auth is initializing or still loading
  if (!isReady || loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${introBg.src})`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40"></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show redirecting message if not authenticated
  if (!user) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
        style={{
          backgroundImage: `url(${introBg.src})`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40"></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{
        backgroundImage: `url(${introBg.src})`,
      }}
    >
      {/* Overlay for better content readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/30 via-transparent to-slate-900/50"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Choose Your Campus
            </h1>
            <p className="text-xl text-white/90 drop-shadow-lg">
              Select a campus to start your adventure
            </p>
          </div>

          {/* Campus Options Grid */}
          <div className="grid md:grid-cols-2 gap-8 items-stretch">


            {/* PUP Sta Mesa Campus - Available */}
            <button
              onClick={() => router.push('/dashboard')}
              className="group relative bg-white/15 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 overflow-hidden h-full flex flex-col hover:bg-white/20"
            >
              {/* Hover Gradient Overlay - Enhanced Maroon */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/60 to-red-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative p-8 flex flex-col flex-1">
                {/* PUP Icon */}
                <div className="mb-6 flex justify-center transform group-hover:scale-110 transition-transform duration-300 h-32 items-center">
                  <div className="relative">
                    <Image
                      src="/icons/pup-logo.svg"
                      alt="PUP Logo"
                      width={120}
                      height={120}
                      className="object-contain filter drop-shadow-lg"
                    />
                    {/* Enhanced Glow effect with maroon tint */}
                    <div className="absolute -inset-4 bg-red-200/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                
                {/* Title - Enhanced maroon hover color */}
                <h2 className="text-4xl font-bold text-white group-hover:text-red-200 transition-colors duration-300 mb-3 drop-shadow-lg text-center">
                  PUP Sta Mesa
                </h2>
                
                {/* Subtitle - Enhanced maroon hover color */}
                <p className="text-white/80 group-hover:text-red-200/90 transition-colors duration-300 mb-6 drop-shadow text-center text-lg">
                  Main Campus
                </p>
                
                {/* Status Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/25 backdrop-blur border border-green-400/40 group-hover:bg-green-400/35 text-green-300 group-hover:text-green-200 rounded-full text-sm font-semibold transition-all duration-300">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-green-400/50 shadow-sm"></span>
                    Available Now
                  </div>
                </div>
                
                {/* Arrow Icon */}
                <div className="absolute top-8 right-8 text-white/60 group-hover:text-red-200 transition-all duration-300 transform group-hover:translate-x-1">
                  <svg className="w-8 h-8 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>


            {/* Coming Soon Campus */}
            <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden opacity-70 cursor-not-allowed h-full flex flex-col">
              {/* Disabled Overlay */}
              <div className="absolute inset-0 bg-slate-900/30 z-10"></div>
              
              {/* Content */}
              <div className="relative p-8 flex flex-col flex-1">
                {/* Coming Soon Icon */}
                <div className="mb-6 flex justify-center grayscale h-32 items-center">
                  <Image
                    src="/icons/coming-soon.svg"
                    alt="Coming Soon"
                    width={130}
                    height={130}
                    className="object-contain filter drop-shadow-lg opacity-60"
                  />
                </div>
                
                {/* Title */}
                <h2 className="text-4xl font-bold text-white/50 mb-3 drop-shadow-lg text-center">
                  More Campuses
                </h2>
                
                {/* Subtitle */}
                <p className="text-white/40 mb-6 drop-shadow text-center text-lg">
                  Expanding Soon
                </p>
                
                {/* Status Badge */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-500/25 backdrop-blur border border-slate-400/30 text-slate-300 rounded-full text-sm font-semibold">
                    <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                    Coming Soon
                  </div>
                </div>
                
                {/* Lock Icon */}
                <div className="absolute top-8 right-8 text-white/30">
                  <svg className="w-8 h-8 drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="mt-12 text-center">
            <button
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="px-8 py-3 text-white/80 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur border border-white/30 hover:border-white/40 rounded-full text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}