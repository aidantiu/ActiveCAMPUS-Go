"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import MapComponent from '../components/MapComponent';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    steps: 0,
    campusEnergy: 0,
    rank: "--",
  });

  // Update user stats from profile
  useEffect(() => {
    if (userProfile) {
      setUserStats({
        steps: userProfile.totalSteps || 0,
        campusEnergy: userProfile.campusEnergy || 0,
        rank: (userProfile as any).rank || "--",
      });
    }
  }, [userProfile]);

  // Show loading screen while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-950 via-maroon-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-200">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="h-screen flex relative">
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/intro_bg.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Maroon overlay for color theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-950/80 via-red-950/75 to-maroon-950/80" />
      </div>
      
      {/* CONTENT LAYER */}
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header with glassmorphism */}
          <header className="bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20 px-8 py-6">
            <div className="flex justify-between items-start">
              {/* Welcome Section */}
              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
                <p className="text-rose-200 text-lg">Welcome back, <span className="font-semibold text-white">{userProfile?.displayName || user?.email}</span>!</p>
              </div>
              
              {/* Stats Cards */}
              <div className="flex gap-4">
                {/* Campus Energy Card */}
                <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-amber-400/30 shadow-xl min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <p className="text-xs font-semibold text-amber-200 uppercase tracking-wider">Campus Energy</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{userStats.campusEnergy}</p>
                  <p className="text-xs text-amber-200 mt-1">CE Points</p>
                </div>

                {/* Steps Card */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-emerald-400/30 shadow-xl min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Steps Today</p>
                  </div>
                  <p className="text-3xl font-bold text-white">{userStats.steps.toLocaleString()}</p>
                  <p className="text-xs text-emerald-200 mt-1">Daily Count</p>
                </div>

                {/* Rank Card */}
                <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-lg rounded-2xl px-6 py-4 border border-violet-400/30 shadow-xl min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                    <p className="text-xs font-semibold text-violet-200 uppercase tracking-wider">Campus Rank</p>
                  </div>
                  <p className="text-3xl font-bold text-white">#{userStats.rank}</p>
                  <p className="text-xs text-violet-200 mt-1">Leaderboard</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content with subtle frame */}
          <main className="flex-1 relative overflow-hidden p-6">
            <div className="h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <MapComponent 
                onLocationUpdate={(lat, lng) => {
                  console.log('Location updated:', lat, lng);
                }}
                onChallengeComplete={async () => {
                  await refreshUserProfile();
                }}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}